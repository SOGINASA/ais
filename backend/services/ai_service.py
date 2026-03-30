"""
AI Service для анализа студентов с использованием Groq API.
Использует метрики из analytics_service.
"""
import os
import json
import logging
from datetime import datetime, timezone
from .analytics_service import StudentAnalytics

logger = logging.getLogger(__name__)

# Попытка импортировать Groq
try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False
    logger.warning("Groq library not installed. Install with: pip install groq")


class AIAnalyzer:
    """AI анализ с Groq API"""
    
    def __init__(self):
        self.groq_api_key = os.environ.get('GROQ_API_KEY')
        self.use_mock = not (GROQ_AVAILABLE and self.groq_api_key)
        
        if not self.use_mock and GROQ_AVAILABLE:
            self.client = Groq(api_key=self.groq_api_key)
            logger.info("Groq API initialized")
        else:
            if not GROQ_AVAILABLE:
                logger.warning("Groq library not available, using mock responses")
            else:
                logger.warning("GROQ_API_KEY not set, using mock responses")
    
    def analyze_student(self, student_id, student_name=None):
        """
        Анализирует студента с использованием Groq AI.
        
        Args:
            student_id: ID студента
            student_name: Имя студента (опционально)
        
        Returns:
            dict: {
                'summary': str,  # основной отчет
                'strengths': [str],  # сильные стороны
                'weaknesses': [str],  # слабые стороны
                'recommendations': [str],  # рекомендации
            }
        """
        # Получаем аналитику
        analytics = StudentAnalytics.get_full_analytics(student_id)
        
        # Формируем prompt для LLM
        prompt = self._build_student_report_prompt(analytics, student_name)
        
        if self.use_mock:
            return self._mock_student_analysis(analytics, student_name)
        
        try:
            response = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are an expert school tutor analyzing student performance. Provide detailed insights and recommendations. Always respond in JSON format."},
                    {"role": "user", "content": prompt}
                ],
                model="mixtral-8x7b-32768",  # бесплатная модель Groq
                temperature=0.7,
                max_tokens=1000,
            )
            
            response_text = response.choices[0].message.content
            
            # Пытаемся распарсить JSON
            try:
                result = json.loads(response_text)
            except json.JSONDecodeError:
                # Если не JSON, структурируем ответ
                result = {
                    'summary': response_text,
                    'strengths': [],
                    'weaknesses': [],
                    'recommendations': [],
                }
            
            return self._normalize_analysis_response(result)
        
        except Exception as e:
            logger.error(f"Groq API error: {e}")
            # Возвращаем mock response при ошибке
            return self._mock_student_analysis(analytics, student_name)
    
    def generate_class_report(self, class_id, class_name=None):
        """
        Генерирует отчет по классу.
        
        Returns:
            dict: {
                'summary': str,
                'top_students': [str],
                'at_risk_students': [str],
                'recommendations': [str],
            }
        """
        if self.use_mock:
            return self._mock_class_report(class_name)
        
        # TODO: Реализовать подробный отчет по классу
        return self._mock_class_report(class_name)
    
    @staticmethod
    def _build_student_report_prompt(analytics, student_name):
        """Формирует prompt для анализа студента"""
        
        name_str = f" {student_name}" if student_name else ""
        
        subjects_str = "\n".join([
            f"  - {s['subject']}: {s['average']}/5 (тренд: {s['trend']:+.1f}%)"
            for s in analytics['by_subject']
        ])
        
        prompt = f"""
Analyze the student's performance and provide insights in JSON format.

Student{name_str} Performance Data:
- Overall Average: {analytics['average_score']}/5
- Trend: {analytics['trend']:+.1f}% (last 2 weeks)
- Risk Level: {analytics['risk']['risk_level']}
- Attendance: {analytics['attendance']['absent_percentage']:.1f}% absent
- Achievements: {analytics['achievements']}

Performance by Subject:
{subjects_str}

Risk Factors: {', '.join(analytics['risk']['reasons']) if analytics['risk']['reasons'] else 'None'}

Provide response in this JSON format:
{{
    "summary": "1-2 sentence overall assessment",
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "recommendations": ["action1", "action2", "action3"]
}}
"""
        return prompt.strip()
    
    def _normalize_analysis_response(self, response):
        """Нормализует ответ от LLM"""
        return {
            'summary': response.get('summary', ''),
            'strengths': response.get('strengths', []),
            'weaknesses': response.get('weaknesses', []),
            'recommendations': response.get('recommendations', []),
        }
    
    @staticmethod
    def _mock_student_analysis(analytics, student_name):
        """Mock анализ студента"""
        avg = analytics['average_score']
        trend = analytics['trend']
        risk = analytics['risk']
        
        name = student_name or "Student"
        
        # Формируем интеллектуальные рекомендации
        strengths = []
        weaknesses = []
        recommendations = []
        
        # Определяем сильные и слабые стороны на основе данных
        if avg >= 4.5:
            strengths.append("Excellent overall academic performance")
        elif avg >= 4.0:
            strengths.append("Strong academic foundation")
        elif avg >= 3.0:
            strengths.append("Satisfactory academic performance")
        
        if trend > 10:
            strengths.append("Clear upward trend in recent work")
        elif trend < -10:
            weaknesses.append("Declining performance trend")
        
        # По предметам
        if analytics['by_subject']:
            best_subject = max(analytics['by_subject'], key=lambda x: x['average'])
            worst_subject = min(analytics['by_subject'], key=lambda x: x['average'])
            
            if best_subject['average'] >= 4.5:
                strengths.append(f"Excellent in {best_subject['subject']}")
            if worst_subject['average'] < 3.0:
                weaknesses.append(f"Needs improvement in {worst_subject['subject']}")
        
        # По посещаемости
        attendance = analytics['attendance']
        if attendance['absent_percentage'] < 5:
            strengths.append("Perfect attendance")
        elif attendance['absent_percentage'] > 20:
            weaknesses.append("High absence rate")
        
        # Рекомендации на основе риска
        if risk['risk_level'] == 'critical':
            recommendations.extend([
                "Immediate intervention needed - meet with parents/guardians",
                "Consider tutoring or additional support",
                "Increase frequency of check-ins with teachers"
            ])
        elif risk['risk_level'] == 'warning':
            recommendations.extend([
                "Monitor performance closely",
                "Consider study strategy adjustment",
                "Attend after-school support sessions"
            ])
        else:
            recommendations.extend([
                "Continue current study approach",
                "Challenge yourself with more advanced materials",
                "Help peers with subjects you excel in"
            ])
        
        summary = f"{name} shows {('excellent' if avg >= 4.0 else 'good' if avg >= 3.0 else 'satisfactory')} academic performance with an average of {avg}/5. "
        
        if trend > 0:
            summary += f"Performance is improving ({trend:+.1f}%). "
        elif trend < 0:
            summary += f"There's a declining trend ({trend:.1f}%). "
        
        if risk['risk_level'] == 'critical':
            summary += "Urgent intervention required."
        elif risk['risk_level'] == 'warning':
            summary += "Additional support is recommended."
        else:
            summary += "Keep up the good work."
        
        return {
            'summary': summary,
            'strengths': strengths or ["Student is engaged"],
            'weaknesses': weaknesses or ["Continue to work on consistency"],
            'recommendations': recommendations or ["Maintain current performance level"],
        }
    
    @staticmethod
    def _mock_class_report(class_name):
        """Mock отчет по классу"""
        return {
            'summary': f"Class {class_name or '10A'} shows overall good academic performance with strengths in mathematics and languages.",
            'top_students': ["Student A - Excellent in all subjects", "Student B - Strong in STEM"],
            'at_risk_students': ["Student C - Needs support in languages"],
            'recommendations': ["Increase peer tutoring", "More interactive lessons", "Individual support plans for struggling students"],
        }
