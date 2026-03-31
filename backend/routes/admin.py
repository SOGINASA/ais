from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Feedback, AuditLog, Subject, Grade, ClassModel, Schedule, Achievement, Attendance
from functools import wraps
from datetime import datetime

admin_bp = Blueprint('admin', __name__)


def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user or user.user_type != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper


@admin_bp.route('/users', methods=['GET'])
@admin_required
def list_users():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '').strip()

    query = User.query
    if search:
        query = query.filter(
            db.or_(
                User.email.ilike(f'%{search}%'),
                User.nickname.ilike(f'%{search}%'),
                User.full_name.ilike(f'%{search}%'),
            )
        )

    pagination = query.order_by(User.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'users': [u.to_dict(include_sensitive=True) for u in pagination.items],
        'total': pagination.total,
        'page': page,
        'pages': pagination.pages,
    })


@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict(include_sensitive=True)})


@admin_bp.route('/users/<int:user_id>/deactivate', methods=['POST'])
@admin_required
def deactivate_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user.is_active = False
    db.session.commit()
    return jsonify({'message': f'User {user_id} deactivated'})


@admin_bp.route('/users/<int:user_id>/activate', methods=['POST'])
@admin_required
def activate_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user.is_active = True
    db.session.commit()
    return jsonify({'message': f'User {user_id} activated'})


@admin_bp.route('/feedback', methods=['GET'])
@admin_required
def list_feedback():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    unread_only = request.args.get('unread', 'false').lower() == 'true'

    query = Feedback.query
    if unread_only:
        query = query.filter_by(is_read=False)

    pagination = query.order_by(Feedback.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'feedbacks': [f.to_dict(include_user=True) for f in pagination.items],
        'total': pagination.total,
        'page': page,
        'pages': pagination.pages,
    })


@admin_bp.route('/feedback/<int:feedback_id>/read', methods=['POST'])
@admin_required
def mark_feedback_read(feedback_id):
    feedback = Feedback.query.get(feedback_id)
    if not feedback:
        return jsonify({'error': 'Feedback not found'}), 404
    feedback.is_read = True
    db.session.commit()
    return jsonify({'message': 'Marked as read'})


@admin_bp.route('/audit-logs', methods=['GET'])
@admin_required
def list_audit_logs():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    action_type = request.args.get('action_type')
    status = request.args.get('status')

    query = AuditLog.query
    if action_type:
        query = query.filter_by(action_type=action_type)
    if status:
        query = query.filter_by(status=status)

    pagination = query.order_by(AuditLog.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'logs': [log.to_dict() for log in pagination.items],
        'total': pagination.total,
        'page': page,
        'pages': pagination.pages,
    })


@admin_bp.route('/stats', methods=['GET'])
@admin_required
def get_stats():
    total_users = User.query.count()
    active_users = User.query.filter_by(is_active=True).count()
    verified_users = User.query.filter_by(is_verified=True).count()
    unread_feedback = Feedback.query.filter_by(is_read=False).count()

    return jsonify({
        'users': {
            'total': total_users,
            'active': active_users,
            'verified': verified_users,
        },
        'feedback': {
            'unread': unread_feedback,
        },
    })


@admin_bp.route('/subjects', methods=['GET'])
@admin_required
def list_subjects():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '').strip()

    query = Subject.query
    if search:
        query = query.filter(Subject.name.ilike(f'%{search}%'))

    pagination = query.order_by(Subject.name).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'subjects': [s.to_dict() for s in pagination.items],
        'total': pagination.total,
        'page': page,
        'pages': pagination.pages,
    }), 200


@admin_bp.route('/subjects', methods=['POST'])
@admin_required
def create_subject():
    data = request.get_json()

    if not data.get('name') or not data.get('code'):
        return jsonify({'error': 'Missing name or code'}), 400

    if Subject.query.filter_by(code=data['code']).first():
        return jsonify({'error': 'Subject code already exists'}), 409

    subject = Subject(
        name=data['name'],
        code=data['code'],
        description=data.get('description'),
        color=data.get('color', '#3b82f6'),
    )

    db.session.add(subject)
    db.session.commit()

    return jsonify({'data': subject.to_dict()}), 201


@admin_bp.route('/subjects/<int:subject_id>', methods=['PUT'])
@admin_required
def update_subject(subject_id):
    subject = Subject.query.get(subject_id)
    if not subject:
        return jsonify({'error': 'Subject not found'}), 404

    data = request.get_json()

    if 'name' in data:
        subject.name = data['name']
    if 'code' in data:
        subject.code = data['code']
    if 'description' in data:
        subject.description = data['description']
    if 'color' in data:
        subject.color = data['color']

    db.session.commit()

    return jsonify({'data': subject.to_dict()}), 200


@admin_bp.route('/subjects/<int:subject_id>', methods=['DELETE'])
@admin_required
def delete_subject(subject_id):
    subject = Subject.query.get(subject_id)
    if not subject:
        return jsonify({'error': 'Subject not found'}), 404

    db.session.delete(subject)
    db.session.commit()

    return jsonify({'message': 'Subject deleted'}), 200


@admin_bp.route('/classes', methods=['GET'])
@admin_required
def list_classes():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    pagination = ClassModel.query.order_by(ClassModel.name).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'classes': [c.to_dict() for c in pagination.items],
        'total': pagination.total,
        'page': page,
        'pages': pagination.pages,
    }), 200


@admin_bp.route('/classes', methods=['POST'])
@admin_required
def create_class():
    data = request.get_json()

    if not data.get('name') or data.get('grade_level') is None:
        return jsonify({'error': 'Missing name or grade_level'}), 400

    if ClassModel.query.filter_by(name=data['name']).first():
        return jsonify({'error': 'Class already exists'}), 409

    class_obj = ClassModel(
        name=data['name'],
        grade_level=data['grade_level'],
        teacher_id=data.get('teacher_id'),
    )

    db.session.add(class_obj)
    db.session.commit()

    return jsonify({'data': class_obj.to_dict()}), 201


@admin_bp.route('/classes/<int:class_id>', methods=['PUT'])
@admin_required
def update_class(class_id):
    class_obj = ClassModel.query.get(class_id)
    if not class_obj:
        return jsonify({'error': 'Class not found'}), 404

    data = request.get_json()

    if 'name' in data:
        class_obj.name = data['name']
    if 'grade_level' in data:
        class_obj.grade_level = data['grade_level']
    if 'teacher_id' in data:
        class_obj.teacher_id = data['teacher_id']

    db.session.commit()

    return jsonify({'data': class_obj.to_dict()}), 200


@admin_bp.route('/classes/<int:class_id>', methods=['DELETE'])
@admin_required
def delete_class(class_id):
    class_obj = ClassModel.query.get(class_id)
    if not class_obj:
        return jsonify({'error': 'Class not found'}), 404

    db.session.delete(class_obj)
    db.session.commit()

    return jsonify({'message': 'Class deleted'}), 200


@admin_bp.route('/schedule', methods=['GET'])
@admin_required
def list_schedule():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    class_id = request.args.get('class_id', type=int)
    day_of_week = request.args.get('day_of_week', type=int)

    query = Schedule.query
    if class_id:
        query = query.filter_by(class_id=class_id)
    if day_of_week is not None:
        query = query.filter_by(day_of_week=day_of_week)

    pagination = query.order_by(Schedule.day_of_week, Schedule.time_slot).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'schedules': [s.to_dict() for s in pagination.items],
        'total': pagination.total,
        'page': page,
        'pages': pagination.pages,
    }), 200


@admin_bp.route('/schedule', methods=['POST'])
@admin_required
def create_schedule():
    data = request.get_json()

    required = ['class_id', 'teacher_id', 'subject_id', 'day_of_week', 'time_slot', 'start_time', 'end_time', 'room']
    if not all(k in data for k in required):
        return jsonify({'error': 'Missing required fields'}), 400

    schedule = Schedule(
        class_id=data['class_id'],
        teacher_id=data['teacher_id'],
        subject_id=data['subject_id'],
        day_of_week=data['day_of_week'],
        time_slot=data['time_slot'],
        start_time=data['start_time'],
        end_time=data['end_time'],
        room=data['room'],
    )

    db.session.add(schedule)
    db.session.commit()

    return jsonify({'data': schedule.to_dict()}), 201


@admin_bp.route('/schedule/<int:schedule_id>', methods=['PUT'])
@admin_required
def update_schedule(schedule_id):
    schedule = Schedule.query.get(schedule_id)
    if not schedule:
        return jsonify({'error': 'Schedule not found'}), 404

    data = request.get_json()

    if 'class_id' in data:
        schedule.class_id = data['class_id']
    if 'teacher_id' in data:
        schedule.teacher_id = data['teacher_id']
    if 'subject_id' in data:
        schedule.subject_id = data['subject_id']
    if 'day_of_week' in data:
        schedule.day_of_week = data['day_of_week']
    if 'time_slot' in data:
        schedule.time_slot = data['time_slot']
    if 'start_time' in data:
        schedule.start_time = data['start_time']
    if 'end_time' in data:
        schedule.end_time = data['end_time']
    if 'room' in data:
        schedule.room = data['room']

    db.session.commit()

    return jsonify({'data': schedule.to_dict()}), 200


@admin_bp.route('/schedule/<int:schedule_id>', methods=['DELETE'])
@admin_required
def delete_schedule(schedule_id):
    schedule = Schedule.query.get(schedule_id)
    if not schedule:
        return jsonify({'error': 'Schedule not found'}), 404

    db.session.delete(schedule)
    db.session.commit()

    return jsonify({'message': 'Schedule deleted'}), 200


@admin_bp.route('/grades', methods=['GET'])
@admin_required
def list_grades():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    student_id = request.args.get('student_id', type=int)
    subject_id = request.args.get('subject_id', type=int)

    query = Grade.query
    if student_id:
        query = query.filter_by(student_id=student_id)
    if subject_id:
        query = query.filter_by(subject_id=subject_id)

    pagination = query.order_by(Grade.date.desc()).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'grades': [g.to_dict() for g in pagination.items],
        'total': pagination.total,
        'page': page,
        'pages': pagination.pages,
    }), 200


@admin_bp.route('/grades/<int:grade_id>', methods=['PUT'])
@admin_required
def update_grade(grade_id):
    grade = Grade.query.get(grade_id)
    if not grade:
        return jsonify({'error': 'Grade not found'}), 404

    data = request.get_json()

    if 'score' in data:
        if not (1 <= data['score'] <= 5):
            return jsonify({'error': 'Score must be between 1 and 5'}), 400
        grade.score = data['score']
    if 'grade_type' in data:
        grade.grade_type = data['grade_type']
    if 'weight' in data:
        grade.weight = data['weight']
    if 'quarter' in data:
        grade.quarter = data['quarter']
    if 'comment' in data:
        grade.comment = data['comment']

    db.session.commit()

    return jsonify({'data': grade.to_dict()}), 200


@admin_bp.route('/grades/<int:grade_id>', methods=['DELETE'])
@admin_required
def delete_grade(grade_id):
    grade = Grade.query.get(grade_id)
    if not grade:
        return jsonify({'error': 'Grade not found'}), 404

    db.session.delete(grade)
    db.session.commit()

    return jsonify({'message': 'Grade deleted'}), 200


@admin_bp.route('/achievements', methods=['GET'])
@admin_required
def list_achievements():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    student_id = request.args.get('student_id', type=int)

    query = Achievement.query
    if student_id:
        query = query.filter_by(student_id=student_id)

    pagination = query.order_by(Achievement.achieved_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'achievements': [a.to_dict() for a in pagination.items],
        'total': pagination.total,
        'page': page,
        'pages': pagination.pages,
    }), 200


@admin_bp.route('/achievements', methods=['POST'])
@admin_required
def create_achievement():
    data = request.get_json()

    if not data.get('student_id') or not data.get('title'):
        return jsonify({'error': 'Missing student_id or title'}), 400

    achievement = Achievement(
        student_id=data['student_id'],
        title=data['title'],
        description=data.get('description'),
        icon=data.get('icon', '🏆'),
        achievement_type=data.get('achievement_type', 'grades'),
        points=data.get('points', 10),
    )

    db.session.add(achievement)
    db.session.commit()

    return jsonify({'data': achievement.to_dict()}), 201


@admin_bp.route('/achievements/<int:achievement_id>', methods=['PUT'])
@admin_required
def update_achievement(achievement_id):
    achievement = Achievement.query.get(achievement_id)
    if not achievement:
        return jsonify({'error': 'Achievement not found'}), 404

    data = request.get_json()

    if 'title' in data:
        achievement.title = data['title']
    if 'description' in data:
        achievement.description = data['description']
    if 'icon' in data:
        achievement.icon = data['icon']
    if 'achievement_type' in data:
        achievement.achievement_type = data['achievement_type']
    if 'points' in data:
        achievement.points = data['points']

    db.session.commit()

    return jsonify({'data': achievement.to_dict()}), 200


@admin_bp.route('/achievements/<int:achievement_id>', methods=['DELETE'])
@admin_required
def delete_achievement(achievement_id):
    achievement = Achievement.query.get(achievement_id)
    if not achievement:
        return jsonify({'error': 'Achievement not found'}), 404

    db.session.delete(achievement)
    db.session.commit()

    return jsonify({'message': 'Achievement deleted'}), 200


@admin_bp.route('/attendance', methods=['GET'])
@admin_required
def list_attendance():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    student_id = request.args.get('student_id', type=int)
    status = request.args.get('status')

    query = Attendance.query
    if student_id:
        query = query.filter_by(student_id=student_id)
    if status:
        query = query.filter_by(status=status)

    pagination = query.order_by(Attendance.date.desc()).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'attendance': [a.to_dict() for a in pagination.items],
        'total': pagination.total,
        'page': page,
        'pages': pagination.pages,
    }), 200


@admin_bp.route('/attendance', methods=['POST'])
@admin_required
def create_attendance():
    data = request.get_json()

    required = ['student_id', 'schedule_id', 'date', 'status']
    if not all(k in data for k in required):
        return jsonify({'error': 'Missing required fields'}), 400

    attendance = Attendance(
        student_id=data['student_id'],
        schedule_id=data['schedule_id'],
        date=datetime.fromisoformat(data['date']).date(),
        status=data['status'],
        marked_by_id=int(get_jwt_identity()),
        notes=data.get('notes'),
    )

    db.session.add(attendance)
    db.session.commit()

    return jsonify({'data': attendance.to_dict()}), 201


@admin_bp.route('/attendance/<int:attendance_id>', methods=['PUT'])
@admin_required
def update_attendance(attendance_id):
    attendance = Attendance.query.get(attendance_id)
    if not attendance:
        return jsonify({'error': 'Attendance not found'}), 404

    data = request.get_json()

    if 'status' in data:
        attendance.status = data['status']
    if 'notes' in data:
        attendance.notes = data['notes']

    db.session.commit()

    return jsonify({'data': attendance.to_dict()}), 200


@admin_bp.route('/attendance/<int:attendance_id>', methods=['DELETE'])
@admin_required
def delete_attendance(attendance_id):
    attendance = Attendance.query.get(attendance_id)
    if not attendance:
        return jsonify({'error': 'Attendance not found'}), 404

    db.session.delete(attendance)
    db.session.commit()

    return jsonify({'message': 'Attendance deleted'}), 200
