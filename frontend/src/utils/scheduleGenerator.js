/**
 * Алгоритм построения расписания с использованием обратного отслеживания (Backtracking)
 * Решает проблему CSP (Constraint Satisfaction Problem)
 */

const DAYS = [1, 2, 3, 4, 5];
const TIME_SLOTS = [1, 2, 3, 4];

export const generateSchedule = (classes, teachers, rooms, constraints = {}) => {
  const schedule = [];
  const occupancyMap = new Map();

  const isTimeSlotAvailable = (teacherId, day, slot) => {
    const key = `teacher_${teacherId}`;
    if (!occupancyMap.has(key)) {
      occupancyMap.set(key, new Set());
    }
    const occupied = occupancyMap.get(key);
    return !occupied.has(`${day}_${slot}`);
  };

  const isRoomAvailable = (roomId, day, slot) => {
    const key = `room_${roomId}`;
    if (!occupancyMap.has(key)) {
      occupancyMap.set(key, new Set());
    }
    const occupied = occupancyMap.get(key);
    return !occupied.has(`${day}_${slot}`);
  };

  const bookSlot = (type, id, day, slot) => {
    const key = `${type}_${id}`;
    if (!occupancyMap.has(key)) {
      occupancyMap.set(key, new Set());
    }
    occupancyMap.get(key).add(`${day}_${slot}`);
  };

  const freeSlot = (type, id, day, slot) => {
    const key = `${type}_${id}`;
    if (occupancyMap.has(key)) {
      occupancyMap.get(key).delete(`${day}_${slot}`);
    }
  };

  const backtrack = (currentIndex, lessons) => {
    if (currentIndex === lessons.length) {
      return true;
    }

    const lesson = lessons[currentIndex];

    for (const day of DAYS) {
      for (const slot of TIME_SLOTS) {
        if (
          isTimeSlotAvailable(lesson.teacherId, day, slot) &&
          isRoomAvailable(lesson.roomId, day, slot)
        ) {
          bookSlot('teacher', lesson.teacherId, day, slot);
          bookSlot('room', lesson.roomId, day, slot);

          lesson.day = day;
          lesson.slot = slot;

          if (backtrack(currentIndex + 1, lessons)) {
            return true;
          }

          freeSlot('teacher', lesson.teacherId, day, slot);
          freeSlot('room', lesson.roomId, day, slot);
        }
      }
    }

    return false;
  };

  const lessons = [];
  classes.forEach((cls) => {
    teachers.forEach((teacher) => {
      lessons.push({
        id: `${cls.id}_${teacher.id}`,
        className: cls.name,
        classId: cls.id,
        teacherId: teacher.id,
        roomId: rooms[Math.floor(Math.random() * rooms.length)].id,
        subject: teacher.subjects[0],
      });
    });
  });

  if (backtrack(0, lessons)) {
    return lessons;
  }

  return [];
};

/**
 * Перестроить расписание при отсутствии учителя
 */
export const rebuildScheduleOnTeacherAbsence = (schedule, absentTeacherId) => {
  const affectedLessons = schedule.filter((lesson) => lesson.teacherId === absentTeacherId);

  return {
    remodelledLessons: affectedLessons,
    message: `${affectedLessons.length} уроков требуют пересоставления`,
  };
};

/**
 * Проверить конфликты в расписании
 */
export const detectConflicts = (schedule) => {
  const conflicts = [];
  const occupancy = new Map();

  schedule.forEach((lesson) => {
    const teacherKey = `teacher_${lesson.teacherId}_${lesson.day}_${lesson.slot}`;
    const roomKey = `room_${lesson.roomId}_${lesson.day}_${lesson.slot}`;

    if (occupancy.has(teacherKey)) {
      conflicts.push({
        type: 'teacher_conflict',
        lesson1: lesson,
        lesson2: occupancy.get(teacherKey),
      });
    }

    if (occupancy.has(roomKey)) {
      conflicts.push({
        type: 'room_conflict',
        lesson1: lesson,
        lesson2: occupancy.get(roomKey),
      });
    }

    occupancy.set(teacherKey, lesson);
    occupancy.set(roomKey, lesson);
  });

  return conflicts;
};

export default {
  generateSchedule,
  rebuildScheduleOnTeacherAbsence,
  detectConflicts,
};
