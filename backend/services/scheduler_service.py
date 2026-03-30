"""
Background scheduler for periodic tasks and schedule generation.

Add your own scheduled jobs in init_scheduler().
File-based locking prevents duplicate schedulers across gunicorn workers.
"""

import threading
import os
import logging
from datetime import datetime, timezone as tz
from apscheduler.schedulers.background import BackgroundScheduler

logger = logging.getLogger(__name__)

_scheduler_lock_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.scheduler_lock')

scheduler = None


def _acquire_scheduler_lock():
    """Try to acquire the lock file. Returns file handle if successful, None otherwise."""
    try:
        lock_file = open(_scheduler_lock_file, 'w')
        try:
            pid = lock_file.read().strip()
            if pid:
                try:
                    os.kill(int(pid), 0)
                    lock_file.close()
                    return None
                except (OSError, ProcessLookupError):
                    pass
        except (ValueError, IOError):
            pass
        lock_file.seek(0)
        lock_file.write(str(os.getpid()))
        lock_file.truncate()
        lock_file.flush()
        return lock_file
    except (IOError, OSError):
        return None


def example_periodic_task(app):
    """Example scheduled job — replace or extend with real tasks."""
    with app.app_context():
        now_utc = datetime.now(tz.utc)
        print(f"[Scheduler] Tick at {now_utc.strftime('%Y-%m-%d %H:%M:%S')} UTC")
        # TODO: add your logic here


def init_scheduler(app):
    """Initialize and start the background scheduler. Called once from create_app()."""
    global scheduler

    if scheduler is not None:
        return

    lock = _acquire_scheduler_lock()
    if lock is None:
        print("[Scheduler] Another process is already running the scheduler, skipping")
        return

    scheduler = BackgroundScheduler(daemon=True)

    # Example: run every minute
    scheduler.add_job(
        func=example_periodic_task,
        trigger='cron',
        second=0,
        args=[app],
        id='example_job',
        name='Example periodic task',
        replace_existing=True,
        max_instances=1,
        coalesce=True,
        misfire_grace_time=30,
    )

    scheduler.start()
    print("[Scheduler] Scheduler started")


# ========== SCHEDULE GENERATION (Greedy Algorithm) ==========

class ScheduleGenerator:
    """Генерирует расписание с использованием жадного алгоритма"""
    
    # Константы
    DAYS_PER_WEEK = 5  # Пн-Пт
    LESSONS_PER_DAY = 7
    TIME_SLOTS = [
        ("08:00", "08:45"),
        ("08:55", "09:40"),
        ("09:50", "10:35"),
        ("10:45", "11:30"),
        ("11:40", "12:25"),
        ("13:10", "13:55"),
        ("14:05", "14:50"),
    ]
    
    def __init__(self):
        from models import db, Schedule, ClassModel, User, Subject
        self.db = db
        self.Schedule = Schedule
        self.ClassModel = ClassModel
        self.User = User
        self.Subject = Subject
    
    def generate_schedule(self, classes, teachers, subjects, clear_existing=False):
        """
        Генерирует расписание для школы.
        
        Args:
            classes: список объектов ClassModel
            teachers: список объектов User (с role='teacher')
            subjects: список объектов Subject
            clear_existing: удалить существующее расписание
        
        Returns:
            dict: {
                'success': bool,
                'schedules_created': int,
                'conflicts': [str],  # список конфликтов
            }
        """
        
        # Очищаем существующее расписание если нужно
        if clear_existing:
            self.Schedule.query.delete()
            self.db.session.commit()
        
        # Инициализируем структуры для отслеживания конфликтов
        teacher_schedule = {}  # teacher_id -> {day -> {slot -> True}}
        room_schedule = {}     # room -> {day -> {slot -> True}}
        class_schedule = {}    # class_id -> {day -> {slot -> True}}
        
        conflicts = []
        created_schedules = []
        
        # Greedy алгоритм: для каждого класса распределяем уроки
        for cls in classes:
            # Предметы для этого класса (примерно по 5-6 в день)
            class_subjects = subjects[:len(subjects) // len(classes) + 1]
            
            for day_of_week in range(self.DAYS_PER_WEEK):
                for time_slot in range(self.LESSONS_PER_DAY):
                    if time_slot >= len(self.TIME_SLOTS):
                        break
                    
                    # Выбираем предмет и учителя
                    subject = class_subjects[time_slot % len(class_subjects)]
                    
                    # Находим доступного учителя
                    available_teacher = self._find_available_teacher(
                        teachers, teacher_schedule, day_of_week, time_slot
                    )
                    
                    if not available_teacher:
                        conflicts.append(f"No available teacher for {cls.name} on day {day_of_week} slot {time_slot}")
                        continue
                    
                    # Находим доступный кабинет
                    room = self._find_available_room(room_schedule, day_of_week, time_slot)
                    
                    if not room:
                        room = f"{100 + day_of_week * 10 + time_slot}"
                    
                    # Создаем расписание
                    start_time, end_time = self.TIME_SLOTS[time_slot]
                    
                    schedule = self.Schedule(
                        class_id=cls.id,
                        subject_id=subject.id,
                        teacher_id=available_teacher.id,
                        day_of_week=day_of_week,
                        time_slot=time_slot,
                        start_time=start_time,
                        end_time=end_time,
                        room=room,
                        lesson_type='lesson',
                        active=True,
                    )
                    
                    created_schedules.append(schedule)
                    
                    # Обновляем трекеры
                    self._mark_slot_used(teacher_schedule, available_teacher.id, day_of_week, time_slot)
                    self._mark_slot_used(room_schedule, room, day_of_week, time_slot)
                    self._mark_slot_used(class_schedule, cls.id, day_of_week, time_slot)
        
        # Сохраняем в БД
        try:
            for schedule in created_schedules:
                self.db.session.add(schedule)
            self.db.session.commit()
            logger.info(f"Created {len(created_schedules)} schedule entries")
        except Exception as e:
            self.db.session.rollback()
            logger.error(f"Error saving schedule: {e}")
            conflicts.append(f"Database error: {str(e)}")
        
        return {
            'success': len(conflicts) == 0,
            'schedules_created': len(created_schedules),
            'conflicts': conflicts,
        }
    
    @staticmethod
    def _find_available_teacher(teachers, schedule_dict, day, slot):
        """Находит первого доступного учителя"""
        for teacher in teachers:
            if day not in schedule_dict.get(teacher.id, {}):
                schedule_dict.setdefault(teacher.id, {})[day] = {}
            
            if slot not in schedule_dict[teacher.id][day]:
                return teacher
        
        # Если все заняты, выбираем случайного (учитель может иметь несколько уроков в день)
        # но это не рекомендуется в реальной жизни
        return teachers[0] if teachers else None
    
    @staticmethod
    def _find_available_room(schedule_dict, day, slot):
        """Находит свободный кабинет"""
        # Простая реализация - кабинеты 101-115
        for room in range(101, 116):
            room_key = str(room)
            if day not in schedule_dict.get(room_key, {}):
                schedule_dict.setdefault(room_key, {})[day] = {}
            
            if slot not in schedule_dict[room_key][day]:
                return room_key
        
        return None
    
    @staticmethod
    def _mark_slot_used(schedule_dict, entity_id, day, slot):
        """Отмечает время как занятое"""
        if entity_id not in schedule_dict:
            schedule_dict[entity_id] = {}
        if day not in schedule_dict[entity_id]:
            schedule_dict[entity_id][day] = {}
        
        schedule_dict[entity_id][day][slot] = True
