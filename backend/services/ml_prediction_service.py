"""
ML Prediction Service — загружает обученные модели и делает предсказания.

Модели:
  - risk_classifier.pkl   → GradientBoostingClassifier (0=normal, 1=at_risk)
  - score_regressor.pkl   → GradientBoostingRegressor  (прогноз оценки)
  - label_encoders.pkl    → dict[str, LabelEncoder] для subject/current_topic/weak_topic_name
"""

import os
import pickle
import logging
import numpy as np
import pandas as pd
from datetime import datetime, timezone, timedelta

logger = logging.getLogger(__name__)

_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_MODELS_DIR = os.path.join(_BASE_DIR, 'ml_models')

# ── Singleton holders ────────────────────────────────────────────────
_risk_clf = None
_score_reg = None
_label_encs = None
_models_loaded = False


def _load_models():
    """Загружает модели один раз при первом вызове."""
    global _risk_clf, _score_reg, _label_encs, _models_loaded
    if _models_loaded:
        return _models_loaded

    try:
        with open(os.path.join(_MODELS_DIR, 'risk_classifier.pkl'), 'rb') as f:
            _risk_clf = pickle.load(f)
        with open(os.path.join(_MODELS_DIR, 'score_regressor.pkl'), 'rb') as f:
            _score_reg = pickle.load(f)
        with open(os.path.join(_MODELS_DIR, 'label_encoders.pkl'), 'rb') as f:
            _label_encs = pickle.load(f)
        _models_loaded = True
        logger.info("ML models loaded from %s", _MODELS_DIR)
    except Exception as e:
        logger.warning("Failed to load ML models: %s — falling back to rule-based", e)
        _models_loaded = False

    return _models_loaded


# ── Feature engineering ──────────────────────────────────────────────

FEATURE_ORDER = [
    'grade_level', 'week', 'exam_window',
    'prev_score', 'avg_last_3', 'trend_last_3',
    'absences_14d', 'late_submissions_14d',
    'homework_completion_rate', 'quiz_accuracy', 'class_engagement',
    'topic_gap_score', 'weak_topic_mastery', 'knowledge_graph_gap_weight',
    'sleep_hours', 'screen_time_hours', 'stress_index',
    'parent_engagement', 'tutoring_sessions_14d',
    'schedule_instability_index', 'teacher_change_flag',
    'extracurricular_load_hours', 'olympiad_load_hours',
    'subject', 'current_topic', 'weak_topic_name',
]


def _safe_encode(encoder, value):
    """Кодирует значение; если не знаем — берём первый класс."""
    try:
        return encoder.transform([value])[0]
    except (ValueError, KeyError):
        return 0


def _extract_grade_level(class_name):
    """'10A' → 10, '7Б' → 7, None → 9."""
    if not class_name:
        return 9
    digits = ''.join(c for c in class_name if c.isdigit())
    return int(digits) if digits else 9


def build_feature_vector(student, subject_name=None):
    """
    Строит вектор признаков из данных студента и БД.

    Args:
        student: models.User instance
        subject_name: str | None — если None, берём предмет последней оценки

    Returns:
        np.ndarray shape (1, 26) или None при ошибке
    """
    from models import Grade, Attendance

    now = datetime.now(timezone.utc)
    cutoff_14d = (now - timedelta(days=14)).date()

    # ── Оценки ───────────────────────────────────────────────────────
    recent_grades = (
        Grade.query
        .filter_by(student_id=student.id)
        .order_by(Grade.date.desc())
        .limit(10)
        .all()
    )

    if recent_grades:
        prev_score = recent_grades[0].score
        last3 = [g.score for g in recent_grades[:3]]
        avg_last_3 = sum(last3) / len(last3)
        trend_last_3 = (last3[0] - last3[-1]) if len(last3) >= 2 else 0.0
    else:
        prev_score = 3.0
        avg_last_3 = 3.0
        trend_last_3 = 0.0

    # ── Предмет ──────────────────────────────────────────────────────
    if subject_name is None and recent_grades and recent_grades[0].subject:
        subject_name = recent_grades[0].subject.name

    subject_name = (subject_name or 'math').lower()

    # ── Посещаемость за 14 дней ──────────────────────────────────────
    att_14 = Attendance.query.filter(
        Attendance.student_id == student.id,
        Attendance.date >= cutoff_14d,
    ).all()

    absences_14d = sum(1 for a in att_14 if a.status == 'absent')
    late_submissions_14d = sum(1 for a in att_14 if a.status == 'late')

    # ── Кодировка категориальных ─────────────────────────────────────
    le = _label_encs or {}
    subject_enc = _safe_encode(le.get('subject'), subject_name) if le else 0
    # У нас нет current_topic / weak_topic_name — используем первый known класс
    topic_enc = _safe_encode(le.get('current_topic'), 'linear_equations') if le else 0
    weak_enc = _safe_encode(le.get('weak_topic_name'), 'linear_equations') if le else 0

    features = {
        'grade_level':                _extract_grade_level(student.class_name),
        'week':                       now.isocalendar()[1],
        'exam_window':                0,
        'prev_score':                 prev_score,
        'avg_last_3':                 avg_last_3,
        'trend_last_3':               trend_last_3,
        'absences_14d':               absences_14d,
        'late_submissions_14d':       late_submissions_14d,
        'homework_completion_rate':   0.8,
        'quiz_accuracy':              0.7,
        'class_engagement':           0.7,
        'topic_gap_score':            0.3,
        'weak_topic_mastery':         0.5,
        'knowledge_graph_gap_weight': 0.3,
        'sleep_hours':                7.0,
        'screen_time_hours':          4.0,
        'stress_index':               0.5,
        'parent_engagement':          0.5,
        'tutoring_sessions_14d':      0,
        'schedule_instability_index': 0.1,
        'teacher_change_flag':        0,
        'extracurricular_load_hours': 2.0,
        'olympiad_load_hours':        0.0,
        'subject':                    subject_enc,
        'current_topic':              topic_enc,
        'weak_topic_name':            weak_enc,
    }

    row = [features[f] for f in FEATURE_ORDER]
    return pd.DataFrame([row], columns=FEATURE_ORDER)


# ── Public API ───────────────────────────────────────────────────────

def predict_risk(student, subject_name=None):
    """
    Предсказывает риск (0/1) и вероятность.

    Returns:
        dict: {
            'at_risk': bool,
            'risk_probability': float (0..1),
        }
        или None, если модели не загружены.
    """
    if not _load_models() or _risk_clf is None:
        return None

    X = build_feature_vector(student, subject_name)
    if X is None:
        return None

    pred = int(_risk_clf.predict(X)[0])
    proba = float(_risk_clf.predict_proba(X)[0][1])

    return {
        'at_risk': pred == 1,
        'risk_probability': round(proba, 4),
    }


def predict_score(student, subject_name=None):
    """
    Предсказывает следующую оценку (float).

    Returns:
        dict: {
            'predicted_score': float,
        }
        или None, если модели не загружены.
    """
    if not _load_models() or _score_reg is None:
        return None

    X = build_feature_vector(student, subject_name)
    if X is None:
        return None

    score = float(_score_reg.predict(X)[0])
    # Клэмпим в [1, 5]
    score = max(1.0, min(5.0, score))

    return {
        'predicted_score': round(score, 2),
    }
