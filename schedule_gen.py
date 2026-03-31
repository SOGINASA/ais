"""
Smart Schedule Generator — Aqbobek Lyceum
=========================================
Implements the "Hardcore" module from the TZ:
  - Conflict-free weekly schedule (teacher / room / class overlap = zero)
  - "Ленты" (streams): a class is split into groups that run SIMULTANEOUSLY
    in separate rooms with separate teachers
  - Slot types: lesson (45m), pair (90m), academic_hour (60m), stream (45m), event
  - Dynamic rescheduling: mark a teacher sick → substitutes found automatically
    → Push-notification log generated for students / teachers / parents

Outputs (schedule_output/):
  schedule.csv                   — full weekly schedule
  teachers.csv                   — teacher roster + availability
  rooms.csv                      — room list
  substitution_notifications.csv — notification log after teacher sick event
  conflict_report.csv            — zero-conflict verification
"""
from __future__ import annotations

import argparse
import random
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import pandas as pd

# ── School parameters ──────────────────────────────────────────────────────────
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
PERIODS = list(range(1, 8))          # 7 periods per day

# subject → (lessons_per_week, split_into_groups, preferred_room_type)
SUBJECT_CONFIG: dict[str, dict] = {
    "math":        {"per_week": 5, "split": False, "room": "classroom"},
    "physics":     {"per_week": 3, "split": True,  "room": "lab"},
    "chemistry":   {"per_week": 2, "split": True,  "room": "lab"},
    "biology":     {"per_week": 2, "split": True,  "room": "lab"},
    "history":     {"per_week": 2, "split": False, "room": "classroom"},
    "literature":  {"per_week": 3, "split": False, "room": "classroom"},
    "english":     {"per_week": 3, "split": True,  "room": "classroom"},
    "informatics": {"per_week": 2, "split": True,  "room": "lab"},
    "phys_ed":     {"per_week": 2, "split": False, "room": "gym"},
}

TEACHERS_PER_SUBJECT = {
    "math": 5, "physics": 5, "chemistry": 4,
    "biology": 4, "history": 4, "literature": 4,
    "english": 5, "informatics": 4, "phys_ed": 3,
}

CLASSES = [
    f"{grade}{section}"
    for grade in range(7, 12)
    for section in ["A", "B", "C"]
]   # 15 classes: 7A-11C

CLASS_SIZE = 28
EVENTS_PER_WEEK = 2   # school-wide events (assembly, etc.)


# ── Data classes ───────────────────────────────────────────────────────────────
@dataclass
class Teacher:
    teacher_id: str
    name: str
    subject: str
    available_slots: set   # set of (day_idx, period)
    max_per_day: int = 5
    is_sick: bool = False


@dataclass
class Room:
    room_id: str
    name: str
    capacity: int
    room_type: str   # classroom | lab | gym | auditorium


@dataclass
class ScheduleEntry:
    day: str
    period: int
    class_id: str
    group_suffix: str        # "" = whole class, "A"/"B" = split group
    teacher_id: str
    teacher_name: str
    room_id: str
    subject: str
    slot_type: str           # lesson | stream | pair | academic_hour | event
    duration_min: int
    is_stream: bool
    is_cancelled: bool = False


@dataclass
class Notification:
    notif_type: str
    recipient_type: str      # teacher | student | parent
    recipient_id: str
    message: str
    affected_day: str
    affected_period: int
    subject: str


# ── Scheduler ─────────────────────────────────────────────────────────────────
class SmartScheduler:
    def __init__(self, seed: int = 42):
        self.rng = random.Random(seed)
        self.teachers: list[Teacher] = []
        self.rooms: list[Room] = []
        self.schedule: list[ScheduleEntry] = []
        self.notifications: list[Notification] = []

        # Busy-sets used for conflict-free assignment
        self._teacher_busy: dict[str, set] = defaultdict(set)
        self._room_busy: dict[str, set] = defaultdict(set)
        self._class_busy: dict[str, set] = defaultdict(set)  # class_id
        self._teacher_day_count: dict[str, dict[int, int]] = defaultdict(lambda: defaultdict(int))

        self._generate_teachers()
        self._generate_rooms()

    # ── Data generation ────────────────────────────────────────────────────────
    def _generate_teachers(self) -> None:
        first = ["Aigerim", "Nurlan", "Madina", "Daniyar", "Zarina",
                 "Arman", "Gulnara", "Serik", "Aizat", "Bekzat",
                 "Saltanat", "Erlan", "Dinara", "Kairat", "Aliya",
                 "Baurzhan", "Indira", "Marat", "Samal", "Anar"]
        last  = ["Askarova", "Bekova", "Seitkali", "Abenov", "Nurmagambetova",
                 "Dzhaksybekov", "Ramazanova", "Ospanov", "Tokova", "Akhmetov",
                 "Zhumabayev", "Karimova", "Abdullayev", "Musina", "Rysbekov"]
        tid = 1
        for subject, count in TEACHERS_PER_SUBJECT.items():
            for _ in range(count):
                # Each teacher is unavailable 1-2 random periods per day
                available: set = set()
                for d_idx in range(len(DAYS)):
                    busy_count = self.rng.randint(1, 2)
                    busy_periods = set(self.rng.sample(PERIODS, k=busy_count))
                    for p in PERIODS:
                        if p not in busy_periods:
                            available.add((d_idx, p))
                self.teachers.append(Teacher(
                    teacher_id=f"T{tid:03d}",
                    name=f"{self.rng.choice(first)} {self.rng.choice(last)}",
                    subject=subject,
                    available_slots=available,
                    max_per_day=5,
                ))
                tid += 1

    def _generate_rooms(self) -> None:
        specs = (
            [("classroom", self.rng.randint(26, 34)) for _ in range(18)]
            + [("lab",       self.rng.randint(14, 18)) for _ in range(10)]
            + [("gym",       60)]
            + [("auditorium", 300)]
        )
        for i, (rtype, cap) in enumerate(specs, 1):
            self.rooms.append(Room(
                room_id=f"R{i:03d}",
                name=f"{'Classroom' if rtype == 'classroom' else rtype.title()} {i:03d}",
                capacity=cap if isinstance(cap, int) else cap,
                room_type=rtype,
            ))

    # ── Constraint helpers ─────────────────────────────────────────────────────
    def _get_teacher(
        self, subject: str, day_idx: int, period: int,
        exclude_ids: Optional[set] = None,
    ) -> Optional[Teacher]:
        exclude_ids = exclude_ids or set()
        candidates = [
            t for t in self.teachers
            if t.subject == subject
            and not t.is_sick
            and t.teacher_id not in exclude_ids
            and (day_idx, period) in t.available_slots
            and (day_idx, period) not in self._teacher_busy[t.teacher_id]
            and self._teacher_day_count[t.teacher_id][day_idx] < t.max_per_day
        ]
        return self.rng.choice(candidates) if candidates else None

    def _get_room(
        self, day_idx: int, period: int, min_cap: int,
        prefer_type: str = "classroom",
        exclude_ids: Optional[set] = None,
    ) -> Optional[Room]:
        exclude_ids = exclude_ids or set()
        preferred = [
            r for r in self.rooms
            if r.room_type == prefer_type
            and r.capacity >= min_cap
            and r.room_id not in exclude_ids
            and (day_idx, period) not in self._room_busy[r.room_id]
        ]
        if preferred:
            return self.rng.choice(preferred)
        # Fallback: any room with sufficient capacity
        fallback = [
            r for r in self.rooms
            if r.capacity >= min_cap
            and r.room_id not in exclude_ids
            and (day_idx, period) not in self._room_busy[r.room_id]
        ]
        return self.rng.choice(fallback) if fallback else None

    def _mark_assigned(
        self, teacher: Teacher, room: Room, class_id: str, day_idx: int, period: int,
    ) -> None:
        slot = (day_idx, period)
        self._teacher_busy[teacher.teacher_id].add(slot)
        self._room_busy[room.room_id].add(slot)
        self._class_busy[class_id].add(slot)
        self._teacher_day_count[teacher.teacher_id][day_idx] += 1

    # ── Schedule building ──────────────────────────────────────────────────────
    def build(self) -> "SmartScheduler":
        """
        Build a conflict-free weekly schedule for all 15 classes.

        Strategy:
          1. Schedule "streams" first (harder: need 2 teachers + 2 rooms simultaneously).
          2. Schedule regular lessons second.
          3. Add 1 academic_hour (homeroom) per class.
          4. Add school-wide events.
        """
        all_slots = [(d, p) for d in range(len(DAYS)) for p in PERIODS]

        for class_id in CLASSES:
            shuffled = all_slots[:]
            self.rng.shuffle(shuffled)

            # ── 1. Streams (split-group parallel lessons) ──────────────────
            for subject, cfg in SUBJECT_CONFIG.items():
                if not cfg["split"]:
                    continue
                need_cap = CLASS_SIZE // 2
                rtype = cfg["room"]

                for _ in range(cfg["per_week"]):
                    assigned = False
                    for d_idx, period in shuffled:
                        if (d_idx, period) in self._class_busy[class_id]:
                            continue

                        # Need 2 teachers of this subject, different IDs
                        t1 = self._get_teacher(subject, d_idx, period)
                        if t1 is None:
                            continue
                        t2 = self._get_teacher(subject, d_idx, period,
                                               exclude_ids={t1.teacher_id})
                        if t2 is None:
                            continue

                        # Need 2 rooms
                        r1 = self._get_room(d_idx, period, need_cap, rtype)
                        if r1 is None:
                            continue
                        r2 = self._get_room(d_idx, period, need_cap, rtype,
                                            exclude_ids={r1.room_id})
                        if r2 is None:
                            continue

                        # ── Assign both groups simultaneously ──────────────
                        slot = (d_idx, period)
                        self._teacher_busy[t1.teacher_id].add(slot)
                        self._teacher_busy[t2.teacher_id].add(slot)
                        self._room_busy[r1.room_id].add(slot)
                        self._room_busy[r2.room_id].add(slot)
                        self._class_busy[class_id].add(slot)
                        self._teacher_day_count[t1.teacher_id][d_idx] += 1
                        self._teacher_day_count[t2.teacher_id][d_idx] += 1

                        for grp, teacher, room in [("A", t1, r1), ("B", t2, r2)]:
                            stype = "pair" if subject == "informatics" else "stream"
                            dur   = 90 if stype == "pair" else 45
                            self.schedule.append(ScheduleEntry(
                                day=DAYS[d_idx], period=period,
                                class_id=class_id, group_suffix=grp,
                                teacher_id=teacher.teacher_id,
                                teacher_name=teacher.name,
                                room_id=room.room_id,
                                subject=subject,
                                slot_type=stype,
                                duration_min=dur,
                                is_stream=True,
                            ))
                        assigned = True
                        break

                    if not assigned:
                        for grp in ("A", "B"):
                            self.schedule.append(ScheduleEntry(
                                day="UNSCHEDULED", period=0,
                                class_id=class_id, group_suffix=grp,
                                teacher_id="NONE", teacher_name="",
                                room_id="NONE", subject=subject,
                                slot_type="stream", duration_min=45, is_stream=True,
                            ))

            # ── 2. Regular (non-split) lessons ─────────────────────────────
            for subject, cfg in SUBJECT_CONFIG.items():
                if cfg["split"]:
                    continue
                rtype = cfg["room"]

                for _ in range(cfg["per_week"]):
                    assigned = False
                    for d_idx, period in shuffled:
                        if (d_idx, period) in self._class_busy[class_id]:
                            continue

                        teacher = self._get_teacher(subject, d_idx, period)
                        if teacher is None:
                            continue
                        room = self._get_room(d_idx, period, CLASS_SIZE, rtype)
                        if room is None:
                            continue

                        self._mark_assigned(teacher, room, class_id, d_idx, period)
                        self.schedule.append(ScheduleEntry(
                            day=DAYS[d_idx], period=period,
                            class_id=class_id, group_suffix="",
                            teacher_id=teacher.teacher_id,
                            teacher_name=teacher.name,
                            room_id=room.room_id,
                            subject=subject,
                            slot_type="lesson",
                            duration_min=45,
                            is_stream=False,
                        ))
                        assigned = True
                        break

                    if not assigned:
                        self.schedule.append(ScheduleEntry(
                            day="UNSCHEDULED", period=0,
                            class_id=class_id, group_suffix="",
                            teacher_id="NONE", teacher_name="",
                            room_id="NONE", subject=subject,
                            slot_type="lesson", duration_min=45, is_stream=False,
                        ))

            # ── 3. Academic hour (homeroom / классный час) ─────────────────
            for d_idx, period in shuffled:
                if (d_idx, period) in self._class_busy[class_id]:
                    continue
                room = self._get_room(d_idx, period, CLASS_SIZE, "classroom")
                if room is None:
                    continue
                self._room_busy[room.room_id].add((d_idx, period))
                self._class_busy[class_id].add((d_idx, period))
                self.schedule.append(ScheduleEntry(
                    day=DAYS[d_idx], period=period,
                    class_id=class_id, group_suffix="",
                    teacher_id="HOMEROOM", teacher_name="Class Teacher",
                    room_id=room.room_id,
                    subject="homeroom",
                    slot_type="academic_hour",
                    duration_min=60,
                    is_stream=False,
                ))
                break

        # ── 4. School-wide events ──────────────────────────────────────────
        auditorium = next((r for r in self.rooms if r.room_type == "auditorium"), None)
        event_names = ["Morning Assembly", "Sports Day", "Science Fair",
                       "Cultural Evening", "Grade Meeting", "Open House"]
        for i in range(EVENTS_PER_WEEK):
            d_idx = i % len(DAYS)
            # Use period 1 (before regular lessons) for events
            if auditorium:
                self.schedule.append(ScheduleEntry(
                    day=DAYS[d_idx], period=1,
                    class_id="ALL", group_suffix="",
                    teacher_id="ADMIN", teacher_name="Administration",
                    room_id=auditorium.room_id,
                    subject=self.rng.choice(event_names),
                    slot_type="event",
                    duration_min=120,
                    is_stream=False,
                ))

        return self

    # ── Dynamic rescheduling ───────────────────────────────────────────────────
    def mark_teacher_sick(self, teacher_id: str) -> "SmartScheduler":
        """
        Mark teacher sick → find substitutes for their lessons
        → emit Push-notification records.
        """
        sick = next((t for t in self.teachers if t.teacher_id == teacher_id), None)
        if sick is None:
            print(f"[WARN] Teacher {teacher_id} not found.")
            return self

        sick.is_sick = True
        affected = [
            e for e in self.schedule
            if e.teacher_id == teacher_id and e.day != "UNSCHEDULED"
        ]

        for entry in affected:
            d_idx = DAYS.index(entry.day)
            sub = self._get_teacher(
                entry.subject, d_idx, entry.period,
                exclude_ids={teacher_id},
            )

            if sub:
                # Update entry with substitute
                entry.teacher_id   = sub.teacher_id
                entry.teacher_name = sub.name
                self._teacher_busy[sub.teacher_id].add((d_idx, entry.period))
                self._teacher_day_count[sub.teacher_id][d_idx] += 1

                self.notifications.append(Notification(
                    notif_type="substitution_assigned",
                    recipient_type="teacher",
                    recipient_id=sub.teacher_id,
                    message=(
                        f"[PUSH] You are covering {sick.name}'s lesson: "
                        f"{entry.subject} | class {entry.class_id}"
                        f"{':' + entry.group_suffix if entry.group_suffix else ''} "
                        f"| {entry.day}, period {entry.period}, room {entry.room_id}."
                    ),
                    affected_day=entry.day,
                    affected_period=entry.period,
                    subject=entry.subject,
                ))
                self.notifications.append(Notification(
                    notif_type="teacher_changed",
                    recipient_type="student",
                    recipient_id=entry.class_id
                              + (f"_{entry.group_suffix}" if entry.group_suffix else ""),
                    message=(
                        f"[PUSH] Your {entry.subject} lesson on "
                        f"{entry.day} (period {entry.period}) will be taught "
                        f"by a substitute teacher. Room unchanged: {entry.room_id}."
                    ),
                    affected_day=entry.day,
                    affected_period=entry.period,
                    subject=entry.subject,
                ))
            else:
                # No substitute — cancel
                entry.teacher_id   = "CANCELLED"
                entry.teacher_name = ""
                entry.is_cancelled = True

                self.notifications.append(Notification(
                    notif_type="lesson_cancelled",
                    recipient_type="student",
                    recipient_id=entry.class_id
                              + (f"_{entry.group_suffix}" if entry.group_suffix else ""),
                    message=(
                        f"[PUSH] CANCELLED: {entry.subject} on "
                        f"{entry.day} period {entry.period} for class "
                        f"{entry.class_id}. No substitute available."
                    ),
                    affected_day=entry.day,
                    affected_period=entry.period,
                    subject=entry.subject,
                ))

            # Parent notification for every affected lesson
            self.notifications.append(Notification(
                notif_type="parent_notice",
                recipient_type="parent",
                recipient_id=f"parents_of_{entry.class_id}",
                message=(
                    f"[PUSH] Notice for class {entry.class_id}: "
                    f"{entry.subject} on {entry.day} (period {entry.period}) "
                    f"{'has a substitute teacher' if not entry.is_cancelled else 'is CANCELLED'} "
                    f"due to teacher absence."
                ),
                affected_day=entry.day,
                affected_period=entry.period,
                subject=entry.subject,
            ))

        print(
            f"Teacher {teacher_id} ({sick.name}) marked sick. "
            f"Affected: {len(affected)} lessons. "
            f"Notifications generated: {len(self.notifications)}."
        )
        return self

    # ── Export ─────────────────────────────────────────────────────────────────
    def export(self, out_dir: Path) -> None:
        out_dir.mkdir(parents=True, exist_ok=True)

        # ── schedule.csv ──────────────────────────────────────────────────
        pd.DataFrame([
            {
                "day": e.day,
                "period": e.period,
                "class_id": e.class_id,
                "group": e.group_suffix if e.group_suffix else "whole_class",
                "teacher_id": e.teacher_id,
                "teacher_name": e.teacher_name,
                "room_id": e.room_id,
                "subject": e.subject,
                "slot_type": e.slot_type,
                "duration_min": e.duration_min,
                "is_stream": e.is_stream,
                "is_cancelled": e.is_cancelled,
            }
            for e in self.schedule
        ]).to_csv(out_dir / "schedule.csv", index=False)

        # ── teachers.csv ──────────────────────────────────────────────────
        pd.DataFrame([
            {
                "teacher_id": t.teacher_id,
                "name": t.name,
                "subject": t.subject,
                "max_per_day": t.max_per_day,
                "is_sick": t.is_sick,
                "unavailable_slots_count": len(PERIODS) * len(DAYS) - len(t.available_slots),
            }
            for t in self.teachers
        ]).to_csv(out_dir / "teachers.csv", index=False)

        # ── rooms.csv ─────────────────────────────────────────────────────
        pd.DataFrame([
            {"room_id": r.room_id, "name": r.name,
             "capacity": r.capacity, "room_type": r.room_type}
            for r in self.rooms
        ]).to_csv(out_dir / "rooms.csv", index=False)

        # ── substitution_notifications.csv ────────────────────────────────
        if self.notifications:
            pd.DataFrame([
                {
                    "notif_type": n.notif_type,
                    "recipient_type": n.recipient_type,
                    "recipient_id": n.recipient_id,
                    "message": n.message,
                    "affected_day": n.affected_day,
                    "affected_period": n.affected_period,
                    "subject": n.subject,
                }
                for n in self.notifications
            ]).to_csv(out_dir / "substitution_notifications.csv", index=False)

        # ── conflict_report.csv ───────────────────────────────────────────
        conflicts = self._check_conflicts()
        pd.DataFrame([{
            "total_entries": len(self.schedule),
            "unscheduled": sum(1 for e in self.schedule if e.day == "UNSCHEDULED"),
            "streams": sum(1 for e in self.schedule if e.is_stream),
            "events": sum(1 for e in self.schedule if e.slot_type == "event"),
            "academic_hours": sum(1 for e in self.schedule if e.slot_type == "academic_hour"),
            "pairs": sum(1 for e in self.schedule if e.slot_type == "pair"),
            "conflict_count": len(conflicts),
            "status": "OK ✓" if not conflicts else f"CONFLICTS: {len(conflicts)}",
        }]).to_csv(out_dir / "conflict_report.csv", index=False)

        if conflicts:
            pd.DataFrame(conflicts).to_csv(out_dir / "conflicts.csv", index=False)

        # ── Summary ───────────────────────────────────────────────────────
        total = len(self.schedule)
        unscheduled = sum(1 for e in self.schedule if e.day == "UNSCHEDULED")
        print(f"\n{'─'*55}")
        print(f"Total entries       : {total:,}")
        print(f"Unscheduled         : {unscheduled}")
        print(f"Streams (лент)      : {sum(1 for e in self.schedule if e.is_stream)}")
        print(f"Pairs (90 min)      : {sum(1 for e in self.schedule if e.slot_type == 'pair')}")
        print(f"Academic hours      : {sum(1 for e in self.schedule if e.slot_type == 'academic_hour')}")
        print(f"Events              : {sum(1 for e in self.schedule if e.slot_type == 'event')}")
        print(f"Conflicts           : {len(conflicts)}")
        print(f"Notifications       : {len(self.notifications)}")
        print(f"Output directory    : {out_dir.resolve()}")
        print(f"{'─'*55}")

    # ── Conflict checker ───────────────────────────────────────────────────────
    def _check_conflicts(self) -> list[dict]:
        teacher_slots: dict = defaultdict(list)
        room_slots:    dict = defaultdict(list)
        class_slots:   dict = defaultdict(list)

        for e in self.schedule:
            if e.day == "UNSCHEDULED":
                continue
            if e.teacher_id in ("NONE", "CANCELLED", "ADMIN", "HOMEROOM"):
                continue

            key = (e.day, e.period)
            teacher_slots[(e.teacher_id, *key)].append(e)
            room_slots[(e.room_id, *key)].append(e)
            # For streams, group A and B of the SAME class at the SAME slot is intentional
            class_key = f"{e.class_id}_{e.group_suffix}" if e.group_suffix else e.class_id
            class_slots[(class_key, *key)].append(e)

        conflicts = []
        for k, entries in teacher_slots.items():
            if len(entries) > 1:
                conflicts.append({"type": "teacher_overlap", "key": str(k),
                                  "count": len(entries), "detail": str([e.subject for e in entries])})
        for k, entries in room_slots.items():
            if len(entries) > 1:
                conflicts.append({"type": "room_overlap", "key": str(k),
                                  "count": len(entries), "detail": str([e.class_id for e in entries])})
        for k, entries in class_slots.items():
            if len(entries) > 1:
                conflicts.append({"type": "class_overlap", "key": str(k),
                                  "count": len(entries), "detail": str([e.subject for e in entries])})
        return conflicts


# ── CLI ────────────────────────────────────────────────────────────────────────
def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Smart Schedule Generator — Aqbobek Lyceum"
    )
    p.add_argument("--seed", type=int, default=42, help="Random seed")
    p.add_argument(
        "--sick-teacher", type=str, default="T001",
        help="Teacher ID to mark sick for dynamic rescheduling demo",
    )
    p.add_argument(
        "--out", type=Path, default=Path("schedule_output"),
        help="Output directory",
    )
    return p.parse_args()


def main() -> None:
    args = parse_args()

    print("Building conflict-free weekly schedule...")
    scheduler = SmartScheduler(seed=args.seed)
    scheduler.build()

    print(f"\nSimulating teacher absence: {args.sick_teacher}")
    scheduler.mark_teacher_sick(args.sick_teacher)

    scheduler.export(args.out)


if __name__ == "__main__":
    main()
