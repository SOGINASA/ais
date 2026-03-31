from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone

db = SQLAlchemy()


def _utc_iso(dt):
    """Convert datetime to ISO string with Z suffix."""
    if dt is None:
        return None
    s = dt.isoformat()
    if not s.endswith('Z') and '+' not in s:
        s += 'Z'
    return s


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=True, index=True)
    nickname = db.Column(db.String(50), unique=True, nullable=True, index=True)
    password_hash = db.Column(db.String(255), nullable=True)

    full_name = db.Column(db.String(100))
    avatar_url = db.Column(db.String(500), nullable=True)
    user_type = db.Column(db.String(20), default='user')  # user, admin
    role = db.Column(db.String(20), default='student')  # student, teacher, parent, admin
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    
    # Profile fields
    class_name = db.Column(db.String(10), nullable=True)  # e.g., "10A" for students
    phone = db.Column(db.String(20), nullable=True)
    birthday = db.Column(db.Date, nullable=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    last_login = db.Column(db.DateTime)

    # Password reset / email verification tokens
    reset_token = db.Column(db.String(100), unique=True, nullable=True)
    reset_token_expires = db.Column(db.DateTime, nullable=True)
    verification_token = db.Column(db.String(100), unique=True, nullable=True)
    onboarding_completed = db.Column(db.Boolean, default=False)

    # OAuth fields
    oauth_provider = db.Column(db.String(50), nullable=True, index=True)
    oauth_id = db.Column(db.String(255), nullable=True)
    oauth_access_token = db.Column(db.Text, nullable=True)
    oauth_refresh_token = db.Column(db.Text, nullable=True)
    oauth_token_expires = db.Column(db.DateTime, nullable=True)
    oauth_linked_at = db.Column(db.DateTime, nullable=True)
    email_verified_at = db.Column(db.DateTime, nullable=True)

    __table_args__ = (
        db.UniqueConstraint('oauth_provider', 'oauth_id', name='uq_oauth_provider_id'),
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)

    def to_dict(self, include_sensitive=False):
        data = {
            'id': self.id,
            'email': self.email,
            'nickname': self.nickname,
            'full_name': self.full_name,
            'avatar_url': self.avatar_url,
            'user_type': self.user_type,
            'role': self.role,
            'onboarding_completed': self.onboarding_completed,
            'created_at': _utc_iso(self.created_at),
            'last_login': _utc_iso(self.last_login),
            'oauth_provider': self.oauth_provider,
            'class_name': self.class_name,
            'avatar': self.avatar_url,
            'phone': self.phone,
        }
        if include_sensitive:
            data['is_active'] = self.is_active
            data['is_verified'] = self.is_verified
        return data


class WebAuthnCredential(db.Model):
    __tablename__ = 'webauthn_credentials'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    credential_id = db.Column(db.LargeBinary, unique=True, nullable=False)
    public_key = db.Column(db.LargeBinary, nullable=False)
    sign_count = db.Column(db.Integer, default=0)
    device_name = db.Column(db.String(255), default='')

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user = db.relationship('User', backref=db.backref('webauthn_credentials', lazy='dynamic', cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            'id': self.id,
            'deviceName': self.device_name,
            'createdAt': _utc_iso(self.created_at),
        }


class WebAuthnChallenge(db.Model):
    __tablename__ = 'webauthn_challenges'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    challenge = db.Column(db.LargeBinary, nullable=False)
    challenge_type = db.Column(db.String(20), nullable=False)  # 'registration' or 'authentication'
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        db.Index('ix_webauthn_challenges_user_type', 'user_id', 'challenge_type'),
    )

    def is_expired(self):
        created = self.created_at
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        return (datetime.now(timezone.utc) - created).total_seconds() > 300


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)

    action = db.Column(db.String(50), nullable=False, index=True)
    action_type = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), default='success')

    ip_address = db.Column(db.String(45), index=True)
    user_agent = db.Column(db.Text)
    device_type = db.Column(db.String(50))
    browser = db.Column(db.String(50))
    os = db.Column(db.String(50))

    oauth_provider = db.Column(db.String(50), nullable=True)
    oauth_id = db.Column(db.String(255), nullable=True)

    error_code = db.Column(db.String(50), nullable=True)
    error_message = db.Column(db.Text, nullable=True)
    error_details = db.Column(db.Text, nullable=True)

    changes = db.Column(db.Text, nullable=True)

    session_id = db.Column(db.String(100), index=True)
    request_id = db.Column(db.String(100), unique=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    duration_ms = db.Column(db.Integer)

    __table_args__ = (
        db.Index('ix_audit_user_action_date', 'user_id', 'action', 'created_at'),
        db.Index('ix_audit_ip_date', 'ip_address', 'created_at'),
        db.Index('ix_audit_session', 'session_id', 'created_at'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action': self.action,
            'action_type': self.action_type,
            'status': self.status,
            'ip_address': self.ip_address,
            'device_type': self.device_type,
            'browser': self.browser,
            'os': self.os,
            'oauth_provider': self.oauth_provider,
            'error_message': self.error_message,
            'created_at': _utc_iso(self.created_at),
            'duration_ms': self.duration_ms,
        }


class PushSubscription(db.Model):
    __tablename__ = 'push_subscriptions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    endpoint = db.Column(db.Text, nullable=False)
    p256dh_key = db.Column(db.String(255), nullable=False)
    auth_key = db.Column(db.String(255), nullable=False)
    user_agent = db.Column(db.String(255), nullable=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = db.relationship('User', backref=db.backref('push_subscriptions', lazy='dynamic', cascade='all, delete-orphan'))

    __table_args__ = (
        db.UniqueConstraint('endpoint', name='uq_push_endpoint'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'userAgent': self.user_agent,
            'createdAt': _utc_iso(self.created_at),
        }

    def to_webpush_dict(self):
        return {
            'endpoint': self.endpoint,
            'keys': {
                'p256dh': self.p256dh_key,
                'auth': self.auth_key,
            }
        }


class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    title = db.Column(db.String(200), nullable=False)
    body = db.Column(db.Text, nullable=False)
    # Generic categories: system, alert, reminder, update, security
    category = db.Column(db.String(30), nullable=False, index=True)

    related_type = db.Column(db.String(30), nullable=True)
    related_id = db.Column(db.Integer, nullable=True)

    is_read = db.Column(db.Boolean, default=False, index=True)
    is_pushed = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    read_at = db.Column(db.DateTime, nullable=True)

    user = db.relationship('User', backref=db.backref('notifications', lazy='dynamic', cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'body': self.body,
            'category': self.category,
            'relatedType': self.related_type,
            'relatedId': self.related_id,
            'isRead': self.is_read,
            'createdAt': _utc_iso(self.created_at),
            'readAt': _utc_iso(self.read_at),
        }


class NotificationPreference(db.Model):
    __tablename__ = 'notification_preferences'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)

    # Generic toggles — add app-specific ones as needed
    system_notifications = db.Column(db.Boolean, default=True)
    security_alerts = db.Column(db.Boolean, default=True)
    marketing_notifications = db.Column(db.Boolean, default=False)

    push_enabled = db.Column(db.Boolean, default=False)
    timezone = db.Column(db.String(50), default='UTC')

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = db.relationship('User', backref=db.backref('notification_preferences', uselist=False, cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            'systemNotifications': self.system_notifications,
            'securityAlerts': self.security_alerts,
            'marketingNotifications': self.marketing_notifications,
            'pushEnabled': self.push_enabled,
            'timezone': self.timezone,
        }


class Feedback(db.Model):
    __tablename__ = 'feedbacks'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category = db.Column(db.String(30), nullable=False)  # bug, feature, improvement, other
    rating = db.Column(db.Integer, nullable=True)  # 1-5
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user = db.relationship('User', backref=db.backref('feedbacks', lazy='dynamic', cascade='all, delete-orphan'))

    def to_dict(self, include_user=False):
        data = {
            'id': self.id,
            'userId': self.user_id,
            'category': self.category,
            'rating': self.rating,
            'message': self.message,
            'isRead': self.is_read,
            'createdAt': _utc_iso(self.created_at),
        }
        if include_user and self.user:
            data['user'] = {
                'name': self.user.full_name or self.user.nickname or 'User',
                'email': self.user.email or '—',
            }
        return data


# ========== AQBOBEK LYCEUM MODELS ==========

class Subject(db.Model):
    """Школьные предметы"""
    __tablename__ = 'subjects'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True, index=True)
    code = db.Column(db.String(10), nullable=True)  # e.g., 'MATH', 'ENG'
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'description': self.description,
        }


class Grade(db.Model):
    """Оценки студентов"""
    __tablename__ = 'grades'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'), nullable=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
    
    score = db.Column(db.Integer, nullable=False)  # 1-5 балл
    type = db.Column(db.String(20), default='lesson')  # lesson, lab, quiz, test, exam
    weight = db.Column(db.Float, default=1.0)  # вес оценки для среднего
    
    date = db.Column(db.Date, nullable=False, index=True)
    quarter = db.Column(db.Integer, nullable=True)  # 1-4 четверть
    
    description = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    student = db.relationship('User', foreign_keys=[student_id], backref=db.backref('grades_as_student', lazy='dynamic', cascade='all, delete-orphan'))
    teacher = db.relationship('User', foreign_keys=[teacher_id], backref=db.backref('grades_as_teacher', lazy='dynamic'))
    subject = db.relationship('Subject', backref=db.backref('grades', lazy='dynamic'))
    
    __table_args__ = (
        db.Index('ix_grade_student_date', 'student_id', 'date'),
        db.Index('ix_grade_student_quarter', 'student_id', 'quarter'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'studentId': self.student_id,
            'subjectId': self.subject_id,
            'subject': self.subject.name if self.subject else None,
            'teacherId': self.teacher_id,
            'score': self.score,
            'type': self.type,
            'weight': self.weight,
            'date': self.date.isoformat() if self.date else None,
            'quarter': self.quarter,
            'description': self.description,
        }


class ClassModel(db.Model):
    """Классы (группы) студентов"""
    __tablename__ = 'classes'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(10), nullable=False, unique=True, index=True)  # e.g., "10A", "10B"
    parallel = db.Column(db.String(2), nullable=True)  # e.g., "10"
    grade_level = db.Column(db.Integer, nullable=True)  # e.g., 10
    teacher_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)  # классный руководитель
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    teacher = db.relationship('User', backref=db.backref('classes_managed', lazy='dynamic'))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'parallel': self.parallel,
            'gradeLevel': self.grade_level,
            'teacherId': self.teacher_id,
            'teacher': self.teacher.full_name if self.teacher else None,
        }


class Schedule(db.Model):
    """Расписание уроков"""
    __tablename__ = 'schedules'
    id = db.Column(db.Integer, primary_key=True)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.id'), nullable=False, index=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'), nullable=False, index=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    day_of_week = db.Column(db.Integer, nullable=False)  # 0-6 (пн-воскресенье)
    time_slot = db.Column(db.Integer, nullable=False)  # 1-8 урок
    start_time = db.Column(db.String(5), nullable=True)  # HH:MM
    end_time = db.Column(db.String(5), nullable=True)    # HH:MM
    
    room = db.Column(db.String(10), nullable=True)  # кабинет
    lesson_type = db.Column(db.String(20), default='lesson')  # lesson, lab, workshop
    
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    class_model = db.relationship('ClassModel', backref=db.backref('schedules', lazy='dynamic'))
    subject = db.relationship('Subject', backref=db.backref('schedules', lazy='dynamic'))
    teacher = db.relationship('User', foreign_keys=[teacher_id], backref=db.backref('schedules', lazy='dynamic'))
    
    __table_args__ = (
        db.Index('ix_schedule_class_day', 'class_id', 'day_of_week'),
        db.Index('ix_schedule_teacher_time', 'teacher_id', 'day_of_week', 'time_slot'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'classId': self.class_id,
            'class': self.class_model.name if self.class_model else None,
            'subjectId': self.subject_id,
            'subject': self.subject.name if self.subject else None,
            'teacherId': self.teacher_id,
            'teacher': self.teacher.full_name if self.teacher else None,
            'dayOfWeek': self.day_of_week,
            'timeSlot': self.time_slot,
            'startTime': self.start_time,
            'endTime': self.end_time,
            'room': self.room,
            'lessonType': self.lesson_type,
        }


class Achievement(db.Model):
    """Достижения студентов"""
    __tablename__ = 'achievements'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    icon = db.Column(db.String(50), nullable=True)  # emoji или URL
    type = db.Column(db.String(30), nullable=True)  # grades, attendance, olympiad, test, etc
    
    points = db.Column(db.Integer, default=0)  # баллы за достижение
    
    achieved_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    student = db.relationship('User', backref=db.backref('achievements', lazy='dynamic', cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            'id': self.id,
            'studentId': self.student_id,
            'title': self.title,
            'description': self.description,
            'icon': self.icon,
            'type': self.type,
            'points': self.points,
            'achievedAt': _utc_iso(self.achieved_at),
        }


class Attendance(db.Model):
    """Посещаемость"""
    __tablename__ = 'attendances'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    schedule_id = db.Column(db.Integer, db.ForeignKey('schedules.id'), nullable=True)
    
    date = db.Column(db.Date, nullable=False, index=True)
    status = db.Column(db.String(20), default='present')  # present, absent, late, excused
    
    marked_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    student = db.relationship('User', foreign_keys=[student_id], backref=db.backref('attendances', lazy='dynamic'))
    marked_by = db.relationship('User', foreign_keys=[marked_by_id], backref=db.backref('marked_attendances', lazy='dynamic'))
    
    __table_args__ = (
        db.Index('ix_attendance_student_date', 'student_id', 'date'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'studentId': self.student_id,
            'scheduleId': self.schedule_id,
            'date': self.date.isoformat() if self.date else None,
            'status': self.status,
            'markedById': self.marked_by_id,
            'notes': self.notes,
        }


class AnalyticsSnapshot(db.Model):
    """Снимок аналитики для студента"""
    __tablename__ = 'analytics_snapshots'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    average_score = db.Column(db.Float, nullable=True)
    scores_trend = db.Column(db.Float, nullable=True)  # в процентах, где >0 улучшение
    risk_level = db.Column(db.String(20), default='normal')  # normal, warning, critical
    
    snapshot_metadata = db.Column(db.Text, nullable=True)  # JSON с доп данными
    
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    student = db.relationship('User', backref=db.backref('analytics_snapshots', lazy='dynamic'))

    def to_dict(self):
        return {
            'id': self.id,
            'studentId': self.student_id,
            'averageScore': self.average_score,
            'scoresTrend': self.scores_trend,
            'riskLevel': self.risk_level,
            'createdAt': _utc_iso(self.created_at),
        }
