"""
AI API routes
GET /api/ai/student-report/:student_id - отчет о студенте
GET /api/ai/class-report/:class_id - отчет о классе
GET /api/ai/predictions/:student_id - предсказания
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Grade
from services.analytics_service import StudentAnalytics
from services.ai_service import AIAnalyzer

ai_bp = Blueprint('ai', __name__)


@ai_bp.route('/student-report/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student_report(student_id):
    """Получить AI отчет по студенту"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    # Проверяем права доступа
    if user.role not in ['teacher', 'admin'] and int(user_id) != student_id:
        return jsonify({'error': 'Access denied'}), 403
    
    # Проверяем, что студент существует
    student = User.query.get(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    
    # Получаем аналитику
    analytics = StudentAnalytics.get_full_analytics(student_id)
    
    # Генерируем AI отчет
    ai_analyzer = AIAnalyzer()
    ai_analysis = ai_analyzer.analyze_student(student_id, student.full_name)
    
    return jsonify({
        'success': True,
        'student': {
            'id': student.id,
            'name': student.full_name,
            'class': student.class_name,
            'email': student.email,
        },
        'analytics': analytics,
        'ai_report': ai_analysis,
    }), 200


@ai_bp.route('/class-report/<int:class_id>', methods=['GET'])
@jwt_required()
def get_class_report(class_id):
    """Получить AI отчет по классу"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    # Проверяем права (только учителя и админы)
    if user.role not in ['teacher', 'admin']:
        return jsonify({'error': 'Access denied'}), 403
    
    from models import ClassModel
    
    class_obj = ClassModel.query.get(class_id)
    if not class_obj:
        return jsonify({'error': 'Class not found'}), 404
    
    # Получаем студентов класса
    students = User.query.filter_by(
        class_name=class_obj.name,
        role='student'
    ).all()
    
    # Собираем статистику по классу
    class_analytics = {
        'total_students': len(students),
        'average_score': 0.0,
        'students_at_risk': 0,
        'attendance_rate': 0.0,
        'top_performers': [],
        'at_risk': [],
    }
    
    # Вычисляем метрики
    scores = []
    for student in students:
        avg = StudentAnalytics.calculate_average_score(student.id)
        scores.append(avg)
        
        risk = StudentAnalytics.detect_risk(student.id)
        if risk['risk_level'] != 'normal':
            class_analytics['students_at_risk'] += 1
            class_analytics['at_risk'].append({
                'student_id': student.id,
                'name': student.full_name,
                'risk_level': risk['risk_level'],
            })
        
        if avg >= 4.5:
            class_analytics['top_performers'].append({
                'student_id': student.id,
                'name': student.full_name,
                'average': avg,
            })
    
    if scores:
        class_analytics['average_score'] = round(sum(scores) / len(scores), 2)
    
    # Top 5 performers
    class_analytics['top_performers'] = sorted(
        class_analytics['top_performers'],
        key=lambda x: x['average'],
        reverse=True
    )[:5]
    
    # AI анализ
    ai_analyzer = AIAnalyzer()
    ai_analysis = ai_analyzer.generate_class_report(class_id, class_obj.name)
    
    return jsonify({
        'success': True,
        'class': class_obj.to_dict(),
        'analytics': class_analytics,
        'ai_report': ai_analysis,
    }), 200


@ai_bp.route('/predictions/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student_predictions(student_id):
    """Получить предсказания для студента"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    # Проверяем права доступа
    if user.role not in ['teacher', 'admin'] and int(user_id) != student_id:
        return jsonify({'error': 'Access denied'}), 403
    
    student = User.query.get(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    
    # Получаем последние оценки
    recent_grades = Grade.query.filter_by(student_id=student_id).order_by(
        Grade.date.desc()
    ).limit(20).all()
    
    if not recent_grades:
        return jsonify({
            'success': True,
            'data': {
                'future_trend': 'insufficient_data',
                'confidence': 0.0,
                'prediction': 'Not enough data for predictions',
            }
        }), 200
    
    # Простое предсказание на основе тренда
    trend = StudentAnalytics.calculate_trend(student_id)
    
    # Определяем направление
    if trend > 10:
        future_trend = 'improving'
        prediction = f"Student is showing strong improvement. Expected to continue improving."
    elif trend > 3:
        future_trend = 'stable'
        prediction = "Student performance is stable. Maintain current effort."
    elif trend > -5:
        future_trend = 'slight_decline'
        prediction = "Small fluctuation in performance. Monitor closely."
    elif trend < -20:
        future_trend = 'declining'
        prediction = "Performance is declining. Immediate intervention needed."
    else:
        future_trend = 'declining'
        prediction = "Performance is declining. Additional support recommended."
    
    risk = StudentAnalytics.detect_risk(student_id)
    
    return jsonify({
        'success': True,
        'student_id': student_id,
        'data': {
            'future_trend': future_trend,
            'confidence': round(abs(trend) / 100, 2),  # Простое вычисление confidence
            'prediction': prediction,
            'recommended_actions': [
                'Increase study time',
                'Attend tutoring sessions',
                'Focus on weaker subjects',
            ] if risk['risk_level'] != 'normal' else [
                'Maintain current approach',
                'Consider leadership roles',
                'Help struggling peers',
            ],
        }
    }), 200


@ai_bp.route('/subject-analysis/<int:student_id>/<int:subject_id>', methods=['GET'])
@jwt_required()
def get_subject_analysis(student_id, subject_id):
    """Подробный анализ студента по预м"""
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    # Проверяем права доступа
    if user.role not in ['teacher', 'admin'] and int(user_id) != student_id:
        return jsonify({'error': 'Access denied'}), 403
    
    from models import Subject
    
    student = User.query.get(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    
    subject = Subject.query.get(subject_id)
    if not subject:
        return jsonify({'error': 'Subject not found'}), 404
    
    # Получаем оценки по предмету
    grades = Grade.query.filter_by(
        student_id=student_id,
        subject_id=subject_id
    ).order_by(Grade.date.desc()).all()
    
    if not grades:
        return jsonify({
            'success': True,
            'student': student.to_dict(),
            'subject': subject.to_dict(),
            'data': {
                'grades_count': 0,
                'average': 0.0,
            }
        }), 200
    
    # Анализ
    avg = StudentAnalytics._calc_avg(grades)
    
    # Группируем по типам
    by_type = {}
    for grade in grades:
        grade_type = grade.type
        if grade_type not in by_type:
            by_type[grade_type] = []
        by_type[grade_type].append(grade.score)
    
    type_analysis = {}
    for grade_type, scores in by_type.items():
        type_analysis[grade_type] = {
            'count': len(scores),
            'average': round(sum(scores) / len(scores), 2),
        }
    
    return jsonify({
        'success': True,
        'student': student.to_dict(),
        'subject': subject.to_dict(),
        'data': {
            'grades': [g.to_dict() for g in grades],
            'grades_count': len(grades),
            'average': round(avg, 2),
            'by_type': type_analysis,
            'trend': StudentAnalytics.calculate_trend(student_id),
        }
    }), 200
