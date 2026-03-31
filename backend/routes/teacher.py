"""
Teacher API routes
GET /api/teacher/classes - классы учителя
GET /api/teacher/class/:class_id/students - студенты класса
GET /api/teacher/risk-students - студенты в риске
POST /api/teacher/grade - добавить оценку
POST /api/teacher/report - AI отчет по студенту
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Grade, Subject, Schedule, ClassModel, Attendance
from services.analytics_service import StudentAnalytics
from services.ai_service import AIAnalyzer
from datetime import datetime, timezone

teacher_bp = Blueprint('teacher', __name__)


@teacher_bp.route('/classes', methods=['GET'])
@jwt_required()
def get_teacher_classes():
    """Получить классы, которые ведет учитель"""
    user_id = get_jwt_identity()
    teacher = User.query.get(int(user_id))
    
    if not teacher or teacher.role != 'teacher':
        return jsonify({'error': 'Access denied'}), 403
    
    # Получаем классы, которые ведит этот учитель
    classes = ClassModel.query.filter_by(teacher_id=int(user_id)).all()
    
    # Получаем классы, в которых он преподает
    teacher_schedules = Schedule.query.filter_by(teacher_id=int(user_id)).distinct(
        Schedule.class_id
    ).all()
    
    class_ids = set(c.id for c in classes) | set(s.class_id for s in teacher_schedules if s.class_id)
    
    all_classes = ClassModel.query.filter(ClassModel.id.in_(class_ids)).all() if class_ids else []
    
    return jsonify({
        'success': True,
        'data': [c.to_dict() for c in all_classes],
    }), 200


@teacher_bp.route('/class/<int:class_id>/students', methods=['GET'])
@jwt_required()
def get_class_students(class_id):
    """Получить студентов класса"""
    user_id = get_jwt_identity()
    
    class_obj = ClassModel.query.get(class_id)
    if not class_obj:
        return jsonify({'error': 'Class not found'}), 404
    
    # Получаем студентов по названию класса
    students = User.query.filter_by(
        class_name=class_obj.name,
        role='student'
    ).all()
    
    # Добавляем метрики для каждого студента
    students_data = []
    for student in students:
        analytics = StudentAnalytics.get_full_analytics(student.id)
        students_data.append({
            'user': {
                'id': student.id,
                'name': student.full_name or student.nickname,
                'email': student.email,
                'avatar': student.avatar_url,
            },
            'analytics': analytics,
        })
    
    return jsonify({
        'success': True,
        'class': class_obj.to_dict(),
        'data': students_data,
        'count': len(students),
    }), 200


@teacher_bp.route('/risk-students', methods=['GET'])
@jwt_required()
def get_risk_students():
    """Получить студентов в риске из всех классов учителя"""
    user_id = get_jwt_identity()
    teacher = User.query.get(int(user_id))
    
    if not teacher or teacher.role != 'teacher':
        return jsonify({'error': 'Access denied'}), 403
    
    # Получаем классы учителя
    classes = ClassModel.query.filter_by(teacher_id=int(user_id)).all()
    class_ids = [c.id for c in classes]
    
    if not class_ids:
        return jsonify({'success': True, 'data': []}), 200
    
    # Получаем студентов из этих классов
    students = User.query.filter(
        User.class_name.in_([c.name for c in classes]),
        User.role == 'student'
    ).all()
    
    risk_students = []
    for student in students:
        risk = StudentAnalytics.detect_risk(student.id)
        
        if risk['risk_level'] != 'normal':
            risk_students.append({
                'student_id': student.id,
                'name': student.full_name or student.nickname,
                'email': student.email,
                'class': student.class_name,
                'risk_level': risk['risk_level'],
                'risk_score': risk['score'],
                'reasons': risk['reasons'],
                'average': StudentAnalytics.calculate_average_score(student.id),
            })
    
    # Сортируем по severity
    risk_students.sort(key=lambda x: x['risk_score'], reverse=True)
    
    return jsonify({
        'success': True,
        'data': risk_students,
        'critical_count': sum(1 for s in risk_students if s['risk_level'] == 'critical'),
        'warning_count': sum(1 for s in risk_students if s['risk_level'] == 'warning'),
    }), 200


@teacher_bp.route('/grade', methods=['POST'])
@jwt_required()
def add_grade():
    """Добавить оценку студенту"""
    user_id = get_jwt_identity()
    teacher = User.query.get(int(user_id))
    
    if not teacher or teacher.role != 'teacher':
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    
    # Валидация
    if not data or not all(k in data for k in ['student_id', 'score']):
        return jsonify({'error': 'Missing required fields: student_id, score'}), 400

    if 'subject_id' not in data and 'subject' not in data:
        return jsonify({'error': 'Missing required field: subject_id or subject'}), 400

    try:
        student_id = int(data.get('student_id'))
        score = int(data.get('score'))
    except (TypeError, ValueError):
        return jsonify({'error': 'student_id and score must be integers'}), 400

    # Resolve subject_id from name if not provided
    if data.get('subject_id'):
        try:
            subject_id = int(data.get('subject_id'))
        except (TypeError, ValueError):
            return jsonify({'error': 'subject_id must be an integer'}), 400
    else:
        from models import Subject
        subject_name = data.get('subject', '').strip()
        # First try case-insensitive search
        subject_obj = Subject.query.filter(
            db.func.lower(Subject.name) == subject_name.lower()
        ).first()
        if not subject_obj:
            # Create subject on-the-fly if it doesn't exist
            subject_obj = Subject(name=subject_name)
            db.session.add(subject_obj)
            try:
                db.session.flush()
            except Exception:
                db.session.rollback()
                # Race condition: another request created it - fetch it
                subject_obj = Subject.query.filter(
                    db.func.lower(Subject.name) == subject_name.lower()
                ).first()
                if not subject_obj:
                    return jsonify({'error': 'Failed to create subject'}), 500
        subject_id = subject_obj.id

    if not 1 <= score <= 5:
        return jsonify({'error': 'Score must be between 1 and 5'}), 400
    
    # Проверяем, что студент существует
    student = User.query.get(student_id)
    if not student or student.role != 'student':
        return jsonify({'error': 'Student not found'}), 404
    
    # Создаем оценку
    grade = Grade(
        student_id=student_id,
        subject_id=subject_id,
        teacher_id=int(user_id),
        score=score,
        type=data.get('type', 'lesson'),
        weight=data.get('weight', 1.0),
        date=datetime.now(timezone.utc).date(),
        quarter=data.get('quarter'),
        description=data.get('description'),
    )
    
    db.session.add(grade)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Grade added successfully',
        'data': grade.to_dict(),
    }), 201


@teacher_bp.route('/mark-attendance', methods=['POST'])
@jwt_required()
def mark_attendance():
    """Отметить посещаемость студентов"""
    user_id = get_jwt_identity()
    teacher = User.query.get(int(user_id))
    
    if not teacher or teacher.role not in ['teacher', 'admin']:
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    
    if not data or 'records' not in data:
        return jsonify({'error': 'Missing records'}), 400
    
    records = data.get('records')  # List of {student_id, status, notes}
    
    created = 0
    for record in records:
        student_id = record.get('student_id')
        status = record.get('status', 'present')
        
        if status not in ['present', 'absent', 'late', 'excused']:
            continue
        
        attendance = Attendance(
            student_id=student_id,
            date=datetime.now(timezone.utc).date(),
            status=status,
            marked_by_id=int(user_id),
            notes=record.get('notes'),
        )
        
        db.session.add(attendance)
        created += 1
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': f'Marked attendance for {created} students',
    }), 201


@teacher_bp.route('/report/<int:student_id>', methods=['POST'])
@jwt_required()
def generate_student_report(student_id):
    """Генерирует AI отчет по студенту"""
    user_id = get_jwt_identity()
    teacher = User.query.get(int(user_id))
    
    if not teacher or teacher.role not in ['teacher', 'admin']:
        return jsonify({'error': 'Access denied'}), 403
    
    # Проверяем, что студент существует
    student = User.query.get(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    
    # Генерируем AI анализ
    ai_analyzer = AIAnalyzer()
    analysis = ai_analyzer.analyze_student(student_id, student.full_name)
    
    return jsonify({
        'success': True,
        'student': {
            'id': student.id,
            'name': student.full_name,
        },
        'report': analysis,
    }), 200
