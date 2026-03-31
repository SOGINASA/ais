from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Feedback, AuditLog, Attendance, ClassModel
from functools import wraps

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


@admin_bp.route('/attendance', methods=['GET'])
@admin_required
def get_attendance_stats():
    """Get attendance statistics for all classes"""
    try:
        from datetime import datetime, timedelta
        thirty_days_ago = datetime.now() - timedelta(days=30)
        
        # Overall stats
        all_records = Attendance.query.filter(
            Attendance.date >= thirty_days_ago.date()
        ).all()
        
        total = len(all_records)
        present = sum(1 for r in all_records if r.status == 'present')
        absent = sum(1 for r in all_records if r.status == 'absent')
        late = sum(1 for r in all_records if r.status == 'late')
        excused = sum(1 for r in all_records if r.status == 'excused')
        
        present_rate = round((present / total * 100), 1) if total > 0 else 0
        
        # Per-class stats
        students = User.query.filter_by(role='student').all()
        classes_data = []
        
        for student in students:
            if not student.class_name:
                continue
            
            student_records = [r for r in all_records if r.student_id == student.id]
            student_total = len(student_records)
            student_present = sum(1 for r in student_records if r.status == 'present')
            student_rate = round((student_present / student_total * 100), 1) if student_total > 0 else 0
            
            # Find or create class entry
            existing = next((c for c in classes_data if c['class_name'] == student.class_name), None)
            if existing:
                existing['students'] += 1
                existing['present_total'] += student_present
                existing['total'] += student_total
            else:
                classes_data.append({
                    'class_name': student.class_name,
                    'students': 1,
                    'present_total': student_present,
                    'total': student_total,
                    'present_rate': student_rate,
                })
        
        # Calculate class rates
        for cls in classes_data:
            cls['present_rate'] = round((cls['present_total'] / cls['total'] * 100), 1) if cls['total'] > 0 else 0
        
        # Sort by class name
        classes_data.sort(key=lambda x: x['class_name'])
        
        return jsonify({
            'overall': {
                'total': total,
                'present': present,
                'absent': absent,
                'late': late,
                'excused': excused,
                'present_rate': present_rate,
            },
            'by_class': classes_data,
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e), 'overall': {'total': 0, 'present': 0, 'absent': 0, 'late': 0, 'excused': 0, 'present_rate': 0}, 'by_class': []}), 200
