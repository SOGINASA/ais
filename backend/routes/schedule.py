"""
Schedule API routes
GET /api/schedule/class/:class_id - расписание класса
GET /api/schedule/teacher/:teacher_id - расписание учителя
POST /api/schedule/generate - генерирование расписания
POST /api/schedule/recalculate - пересчет расписания
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Schedule, ClassModel, Subject
from services.scheduler_service import ScheduleGenerator
from services.websocket_service import send_notification

schedule_bp = Blueprint('schedule', __name__)


@schedule_bp.route('/class/<int:class_id>', methods=['GET'])
@jwt_required()
def get_class_schedule(class_id):
    """Получить расписание для класса"""
    user_id = get_jwt_identity()
    
    class_obj = ClassModel.query.get(class_id)
    if not class_obj:
        return jsonify({'error': 'Class not found'}), 404
    
    schedules = Schedule.query.filter_by(
        class_id=class_id,
        active=True
    ).order_by(Schedule.day_of_week, Schedule.time_slot).all()
    
    # Группируем по дням недели
    day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    by_day = {}
    
    for schedule in schedules:
        day_name = day_names[schedule.day_of_week] if schedule.day_of_week < len(day_names) else f"Day {schedule.day_of_week}"
        
        if day_name not in by_day:
            by_day[day_name] = []
        
        by_day[day_name].append(schedule.to_dict())
    
    return jsonify({
        'success': True,
        'class': class_obj.to_dict(),
        'data': [s.to_dict() for s in schedules],
        'grouped': by_day,
        'count': len(schedules),
    }), 200


@schedule_bp.route('/teacher/<int:teacher_id>', methods=['GET'])
@jwt_required()
def get_teacher_schedule(teacher_id):
    """Получить расписание учителя"""
    user_id = get_jwt_identity()
    
    teacher = User.query.get(teacher_id)
    if not teacher or teacher.role != 'teacher':
        return jsonify({'error': 'Teacher not found'}), 404
    
    schedules = Schedule.query.filter_by(
        teacher_id=teacher_id,
        active=True
    ).order_by(Schedule.day_of_week, Schedule.time_slot).all()
    
    # Группируем по дням недели
    day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    by_day = {}
    
    for schedule in schedules:
        day_name = day_names[schedule.day_of_week] if schedule.day_of_week < len(day_names) else f"Day {schedule.day_of_week}"
        
        if day_name not in by_day:
            by_day[day_name] = []
        
        by_day[day_name].append(schedule.to_dict())
    
    return jsonify({
        'success': True,
        'teacher': {
            'id': teacher.id,
            'name': teacher.full_name,
        },
        'data': [s.to_dict() for s in schedules],
        'grouped': by_day,
        'count': len(schedules),
    }), 200


@schedule_bp.route('/student/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student_schedule(student_id):
    """Получить расписание студента (по его классу)"""
    user_id = get_jwt_identity()
    
    student = User.query.get(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    
    if not student.class_name:
        return jsonify({
            'success': True,
            'student': {
                'id': student.id,
                'name': student.full_name,
                'class': None,
            },
            'data': [],
            'grouped': {},
        }), 200
    
    # Найти класс студента
    class_obj = ClassModel.query.filter_by(name=student.class_name).first()
    if not class_obj:
        return jsonify({
            'success': True,
            'student': {
                'id': student.id,
                'name': student.full_name,
                'class': student.class_name,
            },
            'data': [],
            'grouped': {},
        }), 200
    
    # Получить расписание
    schedules = Schedule.query.filter_by(
        class_id=class_obj.id,
        active=True
    ).order_by(Schedule.day_of_week, Schedule.time_slot).all()
    
    # Группируем по дням недели
    day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    by_day = {}
    
    for schedule in schedules:
        day_name = day_names[schedule.day_of_week] if schedule.day_of_week < len(day_names) else f"Day {schedule.day_of_week}"
        
        if day_name not in by_day:
            by_day[day_name] = []
        
        by_day[day_name].append(schedule.to_dict())
    
    return jsonify({
        'success': True,
        'student': {
            'id': student.id,
            'name': student.full_name,
            'class': student.class_name,
        },
        'data': [s.to_dict() for s in schedules],
        'grouped': by_day,
        'count': len(schedules),
    }), 200


@schedule_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_schedule():
    """Генерирует расписание для школы"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    # Только админы могут генерироват расписание
    if user.role != 'admin':
        return jsonify({'error': 'Access denied - admin only'}), 403
    
    data = request.get_json()
    
    # Получаем классы, учителей и предметы
    classes = ClassModel.query.all()
    teachers = User.query.filter_by(role='teacher').all()
    subjects = Subject.query.all()
    
    if not classes or not teachers or not subjects:
        return jsonify({
            'error': 'Not enough data: need classes, teachers, and subjects'
        }), 400
    
    # Генерируем расписание
    generator = ScheduleGenerator()
    result = generator.generate_schedule(
        classes=classes,
        teachers=teachers,
        subjects=subjects,
        clear_existing=data.get('clear_existing', False)
    )
    
    # Отправляем уведомления
    for teacher in teachers:
        send_notification(
            teacher.id,
            {
                'title': 'Schedule Generated',
                'body': f"New schedule created: {result['schedules_created']} lessons",
                'category': 'update',
                'related_type': 'schedule',
            }
        )
    
    return jsonify({
        'success': result['success'],
        'message': f"Generated {result['schedules_created']} schedule entries",
        'data': {
            'schedules_created': result['schedules_created'],
            'conflicts': result['conflicts'],
        }
    }), 201 if result['success'] else 400


@schedule_bp.route('/recalculate', methods=['POST'])
@jwt_required()
def recalculate_schedule():
    """Пересчитывает конфликты расписания"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    # Только админы
    if user.role != 'admin':
        return jsonify({'error': 'Access denied - admin only'}), 403
    
    # Проверяем конфликты
    conflicts = []
    
    # Получаем все расписания
    schedules = Schedule.query.filter_by(active=True).all()
    
    # Проверяем конфликты учителей
    teacher_slots = {}
    for schedule in schedules:
        key = f"{schedule.teacher_id}_{schedule.day_of_week}_{schedule.time_slot}"
        if key in teacher_slots:
            conflicts.append(f"Teacher {schedule.teacher_id} has conflict on day {schedule.day_of_week} slot {schedule.time_slot}")
        teacher_slots[key] = True
    
    # Проверяем конфликты кабинетов
    room_slots = {}
    for schedule in schedules:
        key = f"{schedule.room}_{schedule.day_of_week}_{schedule.time_slot}"
        if key in room_slots:
            conflicts.append(f"Room {schedule.room} has conflict on day {schedule.day_of_week} slot {schedule.time_slot}")
        room_slots[key] = True
    
    # Проверяем конфликты классов
    class_slots = {}
    for schedule in schedules:
        key = f"{schedule.class_id}_{schedule.day_of_week}_{schedule.time_slot}"
        if key in class_slots:
            conflicts.append(f"Class {schedule.class_id} has conflict on day {schedule.day_of_week} slot {schedule.time_slot}")
        class_slots[key] = True
    
    return jsonify({
        'success': len(conflicts) == 0,
        'message': f"Found {len(conflicts)} conflicts" if conflicts else "No conflicts found",
        'data': {
            'conflict_count': len(conflicts),
            'conflicts': conflicts[:10],  # Только первые 10
        }
    }), 200


@schedule_bp.route('/<int:schedule_id>', methods=['PUT'])
@jwt_required()
def update_schedule(schedule_id):
    """Обновить расписание"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    # Только админы и учителя
    if user.role not in ['admin', 'teacher']:
        return jsonify({'error': 'Access denied'}), 403
    
    schedule = Schedule.query.get(schedule_id)
    if not schedule:
        return jsonify({'error': 'Schedule not found'}), 404
    
    # Проверяем права учителя
    if user.role == 'teacher' and user.id != schedule.teacher_id:
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    
    # Обновляем данные
    if 'room' in data:
        schedule.room = data['room']
    if 'start_time' in data:
        schedule.start_time = data['start_time']
    if 'end_time' in data:
        schedule.end_time = data['end_time']
    if 'active' in data:
        schedule.active = data['active']
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Schedule updated',
        'data': schedule.to_dict(),
    }), 200
