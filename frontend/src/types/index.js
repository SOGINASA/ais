/**
 * @typedef {Object} User
 * @property {number} id - ID пользователя
 * @property {string} email - Email
 * @property {string} full_name - Полное имя
 * @property {'student'|'teacher'|'parent'|'admin'|'kiosk'} role - Роль
 * @property {string} [class] - Класс (для студентов)
 * @property {string} [phone] - Телефон
 * @property {string} [avatar] - URL аватара
 */

/**
 * @typedef {Object} Grade
 * @property {number} id - ID оценки
 * @property {number} student_id - ID студента
 * @property {string} subject - Предмет
 * @property {number} teacher_id - ID учителя
 * @property {number} grade - Оценка (1-5)
 * @property {number} weight - Вес оценки
 * @property {string} date - Дата оценки (YYYY-MM-DD)
 * @property {'lesson'|'quiz'|'lab'|'exam'} type - Тип оценки
 */

/**
 * @typedef {Object} QuarterGrade
 * @property {number} student_id - ID студента
 * @property {string} subject - Предмет
 * @property {number} quarter - Четверть (1-4)
 * @property {number} grade - Четвертная оценка
 * @property {number} year - Год
 */

/**
 * @typedef {Object} ScheduleItem
 * @property {number} id - ID урока
 * @property {string} class - Класс (10A, 10B, etc)
 * @property {number} day_of_week - День недели (1=Mon, 5=Fri)
 * @property {number} time_slot - Номер урока (1, 2, 3, etc)
 * @property {string} start_time - Время начала (HH:MM)
 * @property {string} end_time - Время окончания (HH:MM)
 * @property {string} subject - Предмет
 * @property {number} teacher_id - ID учителя
 * @property {string} teacher_name - Имя учителя
 * @property {string} room - Номер кабинета
 * @property {'lesson'|'lab'|'stream'|'event'} lesson_type - Тип урока
 */

/**
 * @typedef {Object} Attendance
 * @property {number} id - ID записи
 * @property {number} student_id - ID студента
 * @property {string} subject - Предмет
 * @property {string} date - Дата (YYYY-MM-DD)
 * @property {'present'|'absent'|'late'|'excuse'} status - Статус
 */

/**
 * @typedef {Object} Achievement
 * @property {number} id - ID достижения
 * @property {number} student_id - ID студента
 * @property {string} title - Название достижения
 * @property {string} description - Описание
 * @property {string} icon - Иконка (emoji или URL)
 * @property {string} achieved_date - Дата получения
 * @property {'grades'|'attendance'|'participation'|'olympiad'} type - Тип достижения
 */

/**
 * @typedef {Object} Notification
 * @property {number} id - ID уведомления
 * @property {string} message - Текст сообщения
 * @property {'success'|'error'|'warning'|'info'} type - Тип
 * @property {number} [duration] - Длительность показа в мс
 * @property {boolean} [autoClose] - Автоматически закрыть
 */

export {};
