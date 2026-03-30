"""
Analytics service для вычисления метрик студентов.
Используется перед отправкой в LLM (Groq API).
"""
from datetime import datetime, timezone, timedelta
from models import db, Grade, Attendance, Achievement
from sqlalchemy import func
import json


class StudentAnalytics:
    """Вычисляет аналитику по студенту"""
    
    @staticmethod
    def calculate_average_score(student_id, subject_id=None, weeks=None):
        """
        Вычисляет средний балл студента.
        
        Args:
            student_id: ID студента
            subject_id: ID предмета (опционально)
            weeks: количество недель (опционально, все оценки если None)
        
        Returns:
            float: средний балл (0.0 если нет оценок)
        """
        query = Grade.query.filter_by(student_id=student_id)
        
        if subject_id:
            query = query.filter_by(subject_id=subject_id)
        
        if weeks:
            cutoff_date = datetime.now(timezone.utc) - timedelta(weeks=weeks)
            query = query.filter(Grade.date >= cutoff_date.date())
        
        # Вычисляем взвешенное среднее
        grades = query.all()
        if not grades:
            return 0.0
        
        total_weighted = sum(g.score * g.weight for g in grades)
        total_weight = sum(g.weight for g in grades)
        
        return round(total_weighted / total_weight, 2) if total_weight > 0 else 0.0
    
    @staticmethod
    def calculate_trend(student_id, half_weeks=2):
        """
        Вычисляет тренд оценок: улучшение или ухудшение.
        
        Args:
            student_id: ID студента
            half_weeks: разделить оценки на две половины за этот период
        
        Returns:
            float: процент изменения (>0 улучшение, <0 падение)
        """
        now = datetime.now(timezone.utc)
        half_period = now - timedelta(weeks=half_weeks)
        full_period = now - timedelta(weeks=half_weeks * 2)
        
        # Получаем оценки за две половины периода
        old_grades = Grade.query.filter(
            Grade.student_id == student_id,
            Grade.date < half_period.date(),
            Grade.date >= full_period.date()
        ).all()
        
        recent_grades = Grade.query.filter(
            Grade.student_id == student_id,
            Grade.date >= half_period.date()
        ).all()
        
        if not old_grades or not recent_grades:
            return 0.0
        
        # Вычисляем средние за каждый период
        old_avg = StudentAnalytics._calc_avg(old_grades)
        recent_avg = StudentAnalytics._calc_avg(recent_grades)
        
        if old_avg == 0:
            return 0.0
        
        # Процент изменения
        change = ((recent_avg - old_avg) / old_avg) * 100
        return round(change, 2)
    
    @staticmethod
    def detect_risk(student_id):
        """
        Определяет риск падения успеваемости.
        
        Returns:
            dict: {
                'risk_level': 'normal' | 'warning' | 'critical',
                'reasons': [str],  # причины риска
                'score': float,    # 0-100
            }
        """
        avg = StudentAnalytics.calculate_average_score(student_id)
        trend = StudentAnalytics.calculate_trend(student_id)
        
        result = {
            'risk_level': 'normal',
            'reasons': [],
            'score': 0.0,
        }
        
        # Низкий средний балл
        if avg < 2.5:
            result['score'] += 40
            result['reasons'].append(f'Низкий средний балл: {avg}')
        elif avg < 3.5:
            result['score'] += 20
            result['reasons'].append(f'Средний балл ниже среднего: {avg}')
        
        # Падение оценок
        if trend < -20:
            result['score'] += 30
            result['reasons'].append(f'Резкое падение оценок {trend}%')
        elif trend < -5:
            result['score'] += 15
            result['reasons'].append(f'Тенденция к падению {trend}%')
        
        # Пропуски
        attendance = StudentAnalytics.get_attendance_stats(student_id)
        if attendance['absent_percentage'] > 20:
            result['score'] += 20
            result['reasons'].append(f'Много пропусков: {attendance["absent_percentage"]}%')
        
        # Определяем уровень риска
        if result['score'] >= 70:
            result['risk_level'] = 'critical'
        elif result['score'] >= 40:
            result['risk_level'] = 'warning'
        
        result['score'] = round(result['score'], 2)
        return result
    
    @staticmethod
    def get_subject_performance(student_id):
        """
        Получает производительность по каждому предмету.
        
        Returns:
            list: [{
                'subject': str,
                'average': float,
                'grade_count': int,
                'trend': float,
            }]
        """
        # Получаем все уникальные предметы
        grades = Grade.query.filter_by(student_id=student_id).all()
        
        if not grades:
            return []
        
        subjects = set(g.subject_id for g in grades if g.subject_id)
        result = []
        
        for subject_id in subjects:
            subject_grades = [g for g in grades if g.subject_id == subject_id]
            subject_name = subject_grades[0].subject.name if subject_grades[0].subject else f'Subject {subject_id}'
            
            avg = StudentAnalytics._calc_avg(subject_grades)
            
            # Тренд по предмету
            half_len = len(subject_grades) // 2
            if half_len > 0:
                old_avg = StudentAnalytics._calc_avg(subject_grades[:half_len])
                recent_avg = StudentAnalytics._calc_avg(subject_grades[half_len:])
                trend = ((recent_avg - old_avg) / old_avg * 100) if old_avg else 0
            else:
                trend = 0
            
            result.append({
                'subject': subject_name,
                'average': round(avg, 2),
                'grade_count': len(subject_grades),
                'trend': round(trend, 2),
            })
        
        return sorted(result, key=lambda x: x['average'], reverse=True)
    
    @staticmethod
    def get_attendance_stats(student_id, days=30):
        """
        Получает статистику посещаемости.
        
        Returns:
            dict: {
                'total': int,
                'present': int,
                'absent': int,
                'late': int,
                'absent_percentage': float,
            }
        """
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
        cutoff_date = cutoff_date.date()
        
        attendances = Attendance.query.filter(
            Attendance.student_id == student_id,
            Attendance.date >= cutoff_date
        ).all()
        
        if not attendances:
            return {
                'total': 0,
                'present': 0,
                'absent': 0,
                'late': 0,
                'absent_percentage': 0.0,
            }
        
        statuses = {a.status for a in attendances}
        result = {
            'total': len(attendances),
            'present': sum(1 for a in attendances if a.status == 'present'),
            'absent': sum(1 for a in attendances if a.status == 'absent'),
            'late': sum(1 for a in attendances if a.status == 'late'),
            'absent_percentage': 0.0,
        }
        
        if result['total'] > 0:
            result['absent_percentage'] = round(
                ((result['absent'] + result['late']) / result['total']) * 100, 2
            )
        
        return result
    
    @staticmethod
    def get_achievements_count(student_id):
        """Получает количество достижений"""
        return Achievement.query.filter_by(student_id=student_id).count()
    
    @staticmethod
    def get_full_analytics(student_id):
        """
        Полная аналитика для отправки в LLM.
        
        Returns:
            dict: полная информация о студенте
        """
        return {
            'student_id': student_id,
            'average_score': StudentAnalytics.calculate_average_score(student_id),
            'trend': StudentAnalytics.calculate_trend(student_id),
            'risk': StudentAnalytics.detect_risk(student_id),
            'by_subject': StudentAnalytics.get_subject_performance(student_id),
            'attendance': StudentAnalytics.get_attendance_stats(student_id),
            'achievements': StudentAnalytics.get_achievements_count(student_id),
            'timestamp': datetime.now(timezone.utc).isoformat() + 'Z',
        }
    
    @staticmethod
    def _calc_avg(grades):
        """Вспомогательная функция для расчета взвешенного среднего"""
        if not grades:
            return 0.0
        total_weighted = sum(g.score * g.weight for g in grades)
        total_weight = sum(g.weight for g in grades)
        return total_weighted / total_weight if total_weight > 0 else 0.0


class ClassroomAnalytics:
    """Аналитика для класса"""
    
    @staticmethod
    def get_class_leaderboard(class_id, limit=10):
        """
        Рейтинг студентов по среднему баллу.
        
        Returns:
            list: [{
                'student_id': int,
                'name': str,
                'average': float,
                'rank': int,
                'points': int,
            }]
        """
        # TODO: получить студентов класса и их рейтинги
        # За сейчас возвращаем пусто
        return []
    
    @staticmethod
    def get_at_risk_students(class_id):
        """
        Получает студентов в риске из класса.
        
        Returns:
            list: [{
                'student_id': int,
                'name': str,
                'risk_level': str,
                'reasons': [str],
            }]
        """
        # TODO: реализовать
        return []
