"""
Database seeder для создания demo данных
Запуск: python seed.py
"""

import os
import sys
from datetime import datetime, timezone, timedelta
import random

# Добавляем backend в путь
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app
from models import (
    db, User, Subject, Grade, ClassModel, Schedule, 
    Achievement, Attendance, Notification
)


def seed_database():
    """Заполняет БД demo данными"""
    
    app = create_app()
    
    with app.app_context():
        # Очищаем старые данные
        print("🗑️  Clearing existing data...")
        for model in [Notification, Attendance, Achievement, Grade, Schedule, ClassModel, Subject, User]:
            db.session.query(model).delete()
        db.session.commit()
        
        # ===== ПРЕДМЕТЫ =====
        print("📚 Creating subjects...")
        subjects_data = [
            ("Алгебра", "MATH"),
            ("Геометрия", "GEOM"),
            ("Физика", "PHYS"),
            ("Химия", "CHEM"),
            ("Казахский язык", "KAZ"),
            ("Русский язык", "RUS"),
            ("Английский язык", "ENG"),
            ("История", "HIST"),
            ("География", "GEOG"),
            ("Информатика", "IT"),
        ]
        
        subjects = {}
        for name, code in subjects_data:
            subject = Subject(name=name, code=code)
            db.session.add(subject)
            subjects[name] = subject
        
        db.session.commit()
        print(f"✅ Created {len(subjects)} subjects")
        
        # ===== КЛАССЫ =====
        print("🏫 Creating classes...")
        classes = []
        for grade in range(9, 12):
            for letter in ['A', 'B', 'C']:
                cls = ClassModel(
                    name=f"{grade}{letter}",
                    grade_level=grade,
                    parallel=str(grade)
                )
                classes.append(cls)
                db.session.add(cls)
        
        db.session.commit()
        print(f"✅ Created {len(classes)} classes")
        
        # ===== ПОЛЬЗОВАТЕЛИ =====
        print("👥 Creating users...")
        
        # Админ
        admin = User(
            email="admin@school.com",
            nickname="admin",
            full_name="Администратор",
            role="admin",
            user_type="admin"
        )
        admin.set_password("admin123")
        db.session.add(admin)
        
        # Учителя
        teacher_names = [
            ("Нургали Ермеков", "Алгебра"),
            ("Айнур Мусабаева", "Казахский язык"),
            ("Ерғали Жаңа", "Физика"),
            ("Мария Петрова", "Русский язык"),
            ("John Smith", "Английский язык"),
        ]
        
        teachers = []
        for i, (name, subject) in enumerate(teacher_names):
            teacher = User(
                email=f"teacher{i+1}@school.com",
                nickname=f"teacher{i+1}",
                full_name=name,
                role="teacher"
            )
            teacher.set_password("teacher123")
            teachers.append(teacher)
            db.session.add(teacher)
        
        db.session.commit()
        
        # Студенты
        student_names = [
            "Айман Нурсултан",
            "Айнур Алибек",
            "Берик Оспанов",
            "Динара Сәдіқова",
            "Ерғали Қожамжаров",
            "Жана Төреева",
            "Зайра Ободов",
            "Ибрагим Сәлімов",
        ]
        
        students = []
        for i, name in enumerate(student_names):
            for j, cls in enumerate(classes[:3]):  # 3 класса с студентами
                student = User(
                    email=f"student{len(students)+1}@school.com",
                    nickname=f"student{len(students)+1}",
                    full_name=f"{name} ({cls.name})",
                    role="student",
                    class_name=cls.name,
                    phone=f"+7 777 {random.randint(100, 999)} {random.randint(1000, 9999)}",
                    birthday=__import__('datetime').date(2006, random.randint(1, 12), random.randint(1, 28)),
                )
                student.set_password("student123")
                students.append(student)
                db.session.add(student)
        
        db.session.commit()
        print(f"✅ Created {len(teachers)} teachers and {len(students)} students")
        
        # ===== РАСПИСАНИЕ =====
        print("📅 Creating schedules...")
        schedule_count = 0
        
        days_of_week = 5
        time_slots = 7
        
        for cls in classes[:3]:  # Только первые 3 класса
            for day in range(days_of_week):
                for slot in range(time_slots):
                    subject = random.choice(list(subjects.values()))
                    teacher = random.choice(teachers)
                    
                    times = [
                        ("08:00", "08:45"),
                        ("08:55", "09:40"),
                        ("09:50", "10:35"),
                        ("10:45", "11:30"),
                        ("11:40", "12:25"),
                        ("13:10", "13:55"),
                        ("14:05", "14:50"),
                    ]
                    
                    start_time, end_time = times[slot]
                    
                    schedule = Schedule(
                        class_id=cls.id,
                        subject_id=subject.id,
                        teacher_id=teacher.id,
                        day_of_week=day,
                        time_slot=slot,
                        start_time=start_time,
                        end_time=end_time,
                        room=f"{100 + (day * 7) + slot}",
                        lesson_type='lesson',
                        active=True
                    )
                    db.session.add(schedule)
                    schedule_count += 1
        
        db.session.commit()
        print(f"✅ Created {schedule_count} schedule entries")
        
        # ===== ОЦЕНКИ =====
        print("📊 Creating grades...")
        grade_count = 0
        
        now = datetime.now(timezone.utc)
        
        for student in students:
            # 20-30 оценок на студента
            for _ in range(random.randint(20, 30)):
                subject = random.choice(list(subjects.values()))
                teacher = random.choice(teachers)
                
                score = random.choice([2, 3, 3, 3, 4, 4, 4, 5, 5, 5])
                grade_type = random.choice(['lesson', 'lesson', 'lesson', 'quiz', 'lab', 'test'])
                
                # Дата в последние 3 месяца
                days_ago = random.randint(0, 90)
                date = (now - timedelta(days=days_ago)).date()
                
                # Четверть
                month = date.month
                if month in [9, 10, 11]:
                    quarter = 1
                elif month in [12, 1]:
                    quarter = 2
                elif month in [2, 3, 4]:
                    quarter = 3
                else:
                    quarter = 4
                
                grade = Grade(
                    student_id=student.id,
                    subject_id=subject.id,
                    teacher_id=teacher.id,
                    score=score,
                    type=grade_type,
                    weight=random.choice([1.0, 1.0, 1.0, 2.0, 2.0]),
                    date=date,
                    quarter=quarter
                )
                db.session.add(grade)
                grade_count += 1
        
        db.session.commit()
        print(f"✅ Created {grade_count} grades")
        
        # ===== ПОСЕЩАЕМОСТЬ =====
        print("📋 Creating attendance records...")
        attendance_count = 0
        
        for student in students:
            # 30 дней посещаемости
            for days_ago in range(30):
                date = (now - timedelta(days=days_ago)).date()
                
                status = random.choices(
                    ['present', 'absent', 'late', 'excused'],
                    weights=[85, 8, 5, 2],
                    k=1
                )[0]
                
                attendance = Attendance(
                    student_id=student.id,
                    date=date,
                    status=status,
                    marked_by_id=random.choice(teachers).id if teachers else None,
                )
                db.session.add(attendance)
                attendance_count += 1
        
        db.session.commit()
        print(f"✅ Created {attendance_count} attendance records")
        
        # ===== ДОСТИЖЕНИЯ =====
        print("🏆 Creating achievements...")
        achievement_templates = [
            ("Первый шаг", "Получить первую оценку 5", "⭐", "grades"),
            ("Отличник", "5 оценок 5 подряд", "🌟", "grades"),
            ("Верный ученик", "10 дней без пропусков", "✅", "attendance"),
            ("Дебютант", "Первое участие в олимпиаде", "🎯", "olympiad"),
            ("Чемпион", "Первое место в олимпиаде", "🏆", "olympiad"),
        ]
        
        achievement_count = 0
        for student in students:
            # 0-3 достижения на студента
            for _ in range(random.randint(0, 3)):
                template = random.choice(achievement_templates)
                achievement = Achievement(
                    student_id=student.id,
                    title=template[0],
                    description=template[1],
                    icon=template[2],
                    type=template[3],
                    points=random.choice([10, 20, 30, 50]),
                    achieved_at=now - timedelta(days=random.randint(0, 30))
                )
                db.session.add(achievement)
                achievement_count += 1
        
        db.session.commit()
        print(f"✅ Created {achievement_count} achievements")
        
        # ===== УВЕДОМЛЕНИЯ =====
        print("🔔 Creating notifications...")
        notification_count = 0
        
        for student in random.sample(students, min(5, len(students))):
            notification = Notification(
                user_id=student.id,
                title="Добро пожаловать!",
                body="Вам добавлены первые оценки. Проверьте ваши успехи.",
                category="system",
                is_read=False
            )
            db.session.add(notification)
            notification_count += 1
        
        db.session.commit()
        print(f"✅ Created {notification_count} notifications")
        
        # ===== DEMO ACCOUNTS (matching LoginPage) =====
        print("🎭 Creating demo accounts...")

        # Demo admin
        demo_admin = User(
            email="admin@school.kz",
            nickname="admin_demo",
            full_name="Администратор",
            role="admin",
            user_type="admin",
            is_active=True,
            is_verified=True,
        )
        demo_admin.set_password("password")
        db.session.add(demo_admin)

        # Demo teacher (Daria)
        demo_teacher = User(
            email="daria@school.kz",
            nickname="daria",
            full_name="Дарья Иванова",
            role="teacher",
            is_active=True,
            is_verified=True,
        )
        demo_teacher.set_password("password")
        db.session.add(demo_teacher)
        db.session.flush()

        # Demo student (Ayman) — in 10A
        cls_10a = ClassModel.query.filter_by(name="10A").first() or classes[0]
        demo_student = User(
            email="ayman@school.kz",
            nickname="ayman",
            full_name="Айман Смагулов",
            role="student",
            class_name=cls_10a.name if cls_10a else "10A",
            is_active=True,
            is_verified=True,
        )
        demo_student.set_password("password")
        db.session.add(demo_student)
        db.session.flush()

        # Demo parent (Zhanna — parent of Ayman)
        demo_parent = User(
            email="zhanna.smagulova@example.kz",
            nickname="zhanna",
            full_name="Жанна Смагулова",
            role="parent",
            is_active=True,
            is_verified=True,
            parent_id=None,  # parent_id is on the STUDENT (child points to parent)
        )
        demo_parent.set_password("password")
        db.session.add(demo_parent)
        db.session.flush()

        # Link Ayman → Zhanna
        demo_student.parent_id = demo_parent.id

        # Add some grades for demo student
        for _ in range(15):
            subject = random.choice(list(subjects.values()))
            days_ago = random.randint(0, 60)
            date = (now - timedelta(days=days_ago)).date()
            month = date.month
            quarter = 1 if month in [9, 10, 11] else 2 if month in [12, 1] else 3 if month in [2, 3, 4] else 4
            grade = Grade(
                student_id=demo_student.id,
                subject_id=subject.id,
                teacher_id=demo_teacher.id,
                score=random.choice([3, 4, 4, 5, 5]),
                type=random.choice(['lesson', 'quiz', 'lab']),
                weight=random.choice([1.0, 1.0, 2.0]),
                date=date,
                quarter=quarter,
            )
            db.session.add(grade)

        # Add attendance for demo student
        for days_ago in range(30):
            date = (now - timedelta(days=days_ago)).date()
            attendance = Attendance(
                student_id=demo_student.id,
                date=date,
                status=random.choices(['present', 'absent', 'late'], weights=[85, 10, 5], k=1)[0],
                marked_by_id=demo_teacher.id,
            )
            db.session.add(attendance)

        db.session.commit()
        print("✅ Demo accounts created (password: 'password' for all)")

        # ===== ИТОГИ =====
        print("\n" + "="*50)
        print("✨ Database seeded successfully!")
        print("="*50)
        print(f"""
📊 Summary:
  • Subjects: {len(subjects)}
  • Classes: {len(classes)}
  • Teachers: {len(teachers)}
  • Students: {len(students)}
  • Schedules: {schedule_count}
  • Grades: {grade_count}
  • Attendance: {attendance_count}
  • Achievements: {achievement_count}
  • Notifications: {notification_count}

🔑 Test Accounts:
  Admin:   admin@school.com / admin123
  Teacher: teacher1@school.com / teacher123
  Student: student1@school.com / student123

🎭 Demo Accounts (LoginPage):
  Admin:   admin@school.kz / password
  Teacher: daria@school.kz / password
  Student: ayman@school.kz / password
  Parent:  zhanna.smagulova@example.kz / password
        """)


if __name__ == '__main__':
    seed_database()
