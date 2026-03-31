"""
Parent API routes - доступ к данным детей
GET /api/parent/child      - информация о ребёнке
GET /api/parent/grades     - оценки ребёнка
GET /api/parent/attendance - посещаемость ребёнка
GET /api/parent/analytics  - аналитика ребёнка
GET /api/parent/schedule   - расписание ребёнка
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Grade, Attendance, Schedule, ClassModel
from services.analytics_service import StudentAnalytics

parent_bp = Blueprint('parent', __name__)


def get_child_id(parent_id):
    """Получить ID ребёнка для данного родителя"""
    parent = User.query.get(int(parent_id))
    if not parent or parent.role != 'parent':
        return None, ('Доступ запрещён', 403)

    # Ищем студента у которого parent_id совпадает
    # Если поле parent_id есть в модели — используем его
    child = User.query.filter_by(parent_id=int(parent_id), role='student').first()
    if not child:
        # Fallback: ищем по class_name если нет связи
        # Возвращаем первого студента с совпадающим именем матери/отца через поле
        return None, ('Ребёнок не найден', 404)

    return child.id, None


@parent_bp.route('/child', methods=['GET'])
@jwt_required()
def get_child_info():
    parent_id = get_jwt_identity()
    child_id, err = get_child_id(parent_id)
    if err:
        return jsonify({'error': err[0]}), err[1]

    child = User.query.get(child_id)
    return jsonify({
        'success': True,
        'data': child.to_dict(),
    }), 200


@parent_bp.route('/grades', methods=['GET'])
@jwt_required()
def get_child_grades():
    parent_id = get_jwt_identity()
    child_id, err = get_child_id(parent_id)
    if err:
        return jsonify({'error': err[0]}), err[1]

    subject_id = request.args.get('subject_id', type=int)
    query = Grade.query.filter_by(student_id=child_id)
    if subject_id:
        query = query.filter_by(subject_id=subject_id)

    grades = query.order_by(Grade.date.desc()).all()

    return jsonify({
        'success': True,
        'data': [g.to_dict() for g in grades],
        'count': len(grades),
        'statistics': {
            'average': StudentAnalytics.calculate_average_score(child_id),
            'trend': StudentAnalytics.calculate_trend(child_id),
        }
    }), 200


@parent_bp.route('/attendance', methods=['GET'])
@jwt_required()
def get_child_attendance():
    parent_id = get_jwt_identity()
    child_id, err = get_child_id(parent_id)
    if err:
        return jsonify({'error': err[0]}), err[1]

    days = request.args.get('days', 30, type=int)
    from datetime import datetime, timezone, timedelta
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).date()

    records = Attendance.query.filter(
        Attendance.student_id == child_id,
        Attendance.date >= cutoff,
    ).order_by(Attendance.date.desc()).all()

    total   = len(records)
    present = sum(1 for r in records if r.status == 'present')
    absent  = sum(1 for r in records if r.status == 'absent')
    late    = sum(1 for r in records if r.status == 'late')

    return jsonify({
        'success': True,
        'data': [r.to_dict() for r in records],
        'statistics': {
            'total': total,
            'present': present,
            'absent': absent,
            'late': late,
            'absent_percentage': round((absent + late) / total * 100, 1) if total else 0,
        }
    }), 200


@parent_bp.route('/analytics', methods=['GET'])
@jwt_required()
def get_child_analytics():
    parent_id = get_jwt_identity()
    child_id, err = get_child_id(parent_id)
    if err:
        return jsonify({'error': err[0]}), err[1]

    try:
        analytics = StudentAnalytics.get_full_analytics(child_id)
        return jsonify({'success': True, 'data': analytics}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@parent_bp.route('/schedule', methods=['GET'])
@jwt_required()
def get_child_schedule():
    parent_id = get_jwt_identity()
    child_id, err = get_child_id(parent_id)
    if err:
        return jsonify({'error': err[0]}), err[1]

    child = User.query.get(child_id)
    class_name = child.class_name if child else None

    if not class_name:
        return jsonify({'success': True, 'data': []}), 200

    cls = ClassModel.query.filter_by(name=class_name).first()
    if not cls:
        return jsonify({'success': True, 'data': []}), 200

    lessons = Schedule.query.filter_by(class_id=cls.id).order_by(
        Schedule.day_of_week, Schedule.time_slot
    ).all()

    return jsonify({
        'success': True,
        'class': class_name,
        'data': [s.to_dict() for s in lessons],
    }), 200
