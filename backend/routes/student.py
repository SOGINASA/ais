"""
Student API routes
GET /api/student/grades - оценки студента
GET /api/student/leaderboard - рейтинг класса
GET /api/student/portfolio - портфолио достижений
GET /api/student/schedule - расписание класса
GET /api/student/attendance - посещаемость
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Grade, Schedule, Achievement, Attendance, ClassModel
from services.analytics_service import StudentAnalytics
from datetime import datetime, timezone

student_bp = Blueprint('student', __name__)


@student_bp.route('/grades', methods=['GET'])
@jwt_required()
def get_student_grades():
    """Получить оценки студента"""
    user_id = get_jwt_identity()
    
    # Параметры
    subject_id = request.args.get('subject_id', type=int)
    weeks = request.args.get('weeks', type=int)
    
    query = Grade.query.filter_by(student_id=int(user_id))
    
    if subject_id:
        query = query.filter_by(subject_id=subject_id)
    
    if weeks:
        cutoff_date = datetime.now(timezone.utc) - __import__('datetime').timedelta(weeks=weeks)
        query = query.filter(Grade.date >= cutoff_date.date())
    
    # Сортируем по дате (новые сверху)
    grades = query.order_by(Grade.date.desc()).all()
    
    return jsonify({
        'success': True,
        'data': [g.to_dict() for g in grades],
        'count': len(grades),
        'statistics': {
            'average': StudentAnalytics.calculate_average_score(int(user_id), subject_id, weeks),
            'trend': StudentAnalytics.calculate_trend(int(user_id)),
        }
    }), 200


@student_bp.route('/quarter-grades', methods=['GET'])
@jwt_required()
def get_quarter_grades():
    """Получить четвертные оценки"""
    user_id = get_jwt_identity()
    
    query = Grade.query.filter_by(student_id=int(user_id)).filter(Grade.quarter.isnot(None))
    grades = query.order_by(Grade.quarter.desc()).all()
    
    # Группируем по предметам
    by_subject = {}
    for grade in grades:
        subject = grade.subject.name if grade.subject else f"Subject {grade.subject_id}"
        if subject not in by_subject:
            by_subject[subject] = {}
        
        q = grade.quarter or 1
        by_subject[subject][f'q{q}'] = grade.score
    
    return jsonify({
        'success': True,
        'data': list(by_subject.items()),
    }), 200


@student_bp.route('/leaderboard', methods=['GET'])
@jwt_required()
def get_class_leaderboard():
    """Получить рейтинг класса"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    if not user or not user.class_name:
        return jsonify({'error': 'Student class not found'}), 400
    
    # Получаем всех студентов в этом классе
    class_students = User.query.filter_by(
        class_name=user.class_name,
        role='student'
    ).all()
    
    leaderboard = []
    for student in class_students:
        avg = StudentAnalytics.calculate_average_score(student.id)
        achievements = Achievement.query.filter_by(student_id=student.id).count()
        
        leaderboard.append({
            'student_id': student.id,
            'name': student.full_name or student.nickname,
            'avatar': student.avatar_url,
            'average': avg,
            'achievements': achievements,
            'is_current_user': student.id == int(user_id),
        })
    
    # Сортируем по среднему баллу
    leaderboard.sort(key=lambda x: x['average'], reverse=True)
    
    # Добавляем ранги
    for i, student in enumerate(leaderboard):
        student['rank'] = i + 1
    
    # Находим позицию текущего пользователя
    user_rank = next((i for i, s in enumerate(leaderboard) if s['is_current_user']), None)
    
    return jsonify({
        'success': True,
        'data': leaderboard,
        'user_rank': user_rank + 1 if user_rank is not None else None,
        'total_students': len(leaderboard),
    }), 200


@student_bp.route('/portfolio', methods=['GET'])
@jwt_required()
def get_student_portfolio():
    """Получить портфолио студента (достижения)"""
    user_id = get_jwt_identity()
    
    achievements = Achievement.query.filter_by(student_id=int(user_id)).order_by(
        Achievement.achieved_at.desc()
    ).all()
    
    # Группируем по типам
    by_type = {}
    for achievement in achievements:
        achievement_type = achievement.type or 'general'
        if achievement_type not in by_type:
            by_type[achievement_type] = []
        by_type[achievement_type].append(achievement.to_dict())
    
    # Получаем статистику
    stats = {
        'total_achievements': len(achievements),
        'total_points': sum(a.points for a in achievements),
        'by_type': {k: len(v) for k, v in by_type.items()},
    }
    
    return jsonify({
        'success': True,
        'data': achievements,
        'grouped': by_type,
        'statistics': stats,
    }), 200


@student_bp.route('/schedule', methods=['GET'])
@jwt_required()
def get_student_schedule():
    """Получить расписание класса студента"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    if not user or not user.class_name:
        return jsonify({'error': 'Student class not found'}), 400
    
    # Находим класс
    class_obj = ClassModel.query.filter_by(name=user.class_name).first()
    
    if not class_obj:
        return jsonify({'error': 'Class not found'}), 404
    
    # Получаем расписание
    schedule = Schedule.query.filter_by(class_id=class_obj.id, active=True).order_by(
        Schedule.day_of_week,
        Schedule.time_slot
    ).all()
    
    # Группируем по дням
    by_day = {}
    day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    
    for lesson in schedule:
        day_name = day_names[lesson.day_of_week] if lesson.day_of_week < len(day_names) else f"Day {lesson.day_of_week}"
        if day_name not in by_day:
            by_day[day_name] = []
        by_day[day_name].append(lesson.to_dict())
    
    return jsonify({
        'success': True,
        'class': user.class_name,
        'data': schedule,
        'grouped': by_day,
    }), 200


@student_bp.route('/attendance', methods=['GET'])
@jwt_required()
def get_student_attendance():
    """Получить посещаемость студента"""
    user_id = get_jwt_identity()
    
    days = request.args.get('days', default=30, type=int)
    
    attendance = Attendance.query.filter_by(student_id=int(user_id)).order_by(
        Attendance.date.desc()
    ).limit(days).all()
    
    stats = StudentAnalytics.get_attendance_stats(int(user_id), days)
    
    return jsonify({
        'success': True,
        'data': [a.to_dict() for a in attendance],
        'statistics': stats,
    }), 200


@student_bp.route('/analytics', methods=['GET'])
@jwt_required()
def get_student_analytics():
    """Получить полную аналитику студента"""
    user_id = get_jwt_identity()
    
    analytics = StudentAnalytics.get_full_analytics(int(user_id))
    
    return jsonify({
        'success': True,
        'data': analytics,
    }), 200
