import {
  DAY_KEYS,
  SEMESTER_END,
  SEMESTER_START,
  type DayKey,
  type Section,
} from "@/data/timetables";

export const DANGER_THRESHOLD = 75;
export const TARGET_THRESHOLD = 90;

export type LeaveKind = "od" | "medical" | "absent";

export interface LeaveEntry {
  id: string;
  start: string; // yyyy-mm-dd
  days: number;
  kind: LeaveKind;
  label: string;
}

export const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const fromISO = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
};

export const addDays = (iso: string, n: number) => {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
};

export const formatLong = (iso: string) =>
  fromISO(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const dayKeyOf = (iso: string): DayKey | null => {
  const idx = fromISO(iso).getDay(); // 0 Sun .. 6 Sat
  if (idx === 0 || idx === 6) return null;
  return DAY_KEYS[idx - 1] ?? null;
};

/** Working dates (Mon-Fri, minus holidays) in [from, to] inclusive. */
export const workingDates = (from: string, to: string, holidays: string[]) => {
  const out: string[] = [];
  if (fromISO(from) > fromISO(to)) return out;
  const holidaySet = new Set(holidays);
  let cursor = from;
  let guard = 0;
  while (fromISO(cursor) <= fromISO(to) && guard < 500) {
    guard += 1;
    if (dayKeyOf(cursor) && !holidaySet.has(cursor)) out.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return out;
};

/** Periods of one slot across a date range. */
export const countPeriods = (
  section: Section,
  slot: string,
  from: string,
  to: string,
  holidays: string[],
) =>
  workingDates(from, to, holidays).reduce((total, date) => {
    const day = dayKeyOf(date);
    if (!day) return total;
    return total + section.grid[day].filter((cell) => cell === slot).length;
  }, 0);

export const clampDate = (iso: string) => {
  if (fromISO(iso) < fromISO(SEMESTER_START)) return SEMESTER_START;
  if (fromISO(iso) > fromISO(SEMESTER_END)) return SEMESTER_END;
  return iso;
};

export interface SubjectProjection {
  slot: string;
  code: string;
  name: string;
  conducted: number;
  attended: number;
  currentPercent: number;
  remaining: number;
  /** periods affected by simulated leave inside the remaining window */
  leavePeriodsMissed: number;
  leavePeriodsExcused: number;
  totalByEnd: number;
  /** attendance if the student attends every remaining class (after leave) */
  bestPossiblePercent: number;
  /** attendance if the student attends nothing further */
  worstPossiblePercent: number;
  mustAttendForSafe: number;
  mustAttendForTarget: number;
  canSkip: number;
  safeReachable: boolean;
  targetReachable: boolean;
  /** projected percent assuming the student attends everything except simulated leave */
  projectedPercent: number;
  status: "target" | "safe" | "risk" | "detention";
}

export interface ProjectionInput {
  section: Section;
  /** current attendance percent per slot as entered by the student */
  percents: Record<string, number>;
  today: string;
  planDate: string;
  holidays: string[];
  leaves: LeaveEntry[];
}

const pct = (a: number, b: number) => (b <= 0 ? 0 : (a / b) * 100);

export const leaveDatesOf = (leave: LeaveEntry) =>
  Array.from({ length: Math.max(1, leave.days) }, (_, i) => addDays(leave.start, i));

export function projectSubjects(input: ProjectionInput): SubjectProjection[] {
  const { section, percents, today, planDate, holidays, leaves } = input;
  const start = SEMESTER_START;
  const upToYesterday = addDays(clampDate(today), -1);
  const horizon = clampDate(planDate);

  const missedDates = new Set<string>();
  const excusedDates = new Set<string>();
  for (const leave of leaves) {
    for (const date of leaveDatesOf(leave)) {
      if (fromISO(date) < fromISO(today) || fromISO(date) > fromISO(horizon)) continue;
      if (leave.kind === "od" || leave.kind === "medical") excusedDates.add(date);
      else missedDates.add(date);
    }
  }

  const periodsOn = (dates: Set<string>, slot: string) =>
    [...dates].reduce((total, date) => {
      if (holidays.includes(date)) return total;
      const day = dayKeyOf(date);
      if (!day) return total;
      return total + section.grid[day].filter((cell) => cell === slot).length;
    }, 0);

  return section.subjects.map((subject) => {
    const conducted = countPeriods(section, subject.slot, start, upToYesterday, holidays);
    const percent = Math.max(0, Math.min(100, percents[subject.slot] ?? 0));
    const attended = Math.round((percent / 100) * conducted);
    const remainingRaw = countPeriods(section, subject.slot, clampDate(today), horizon, holidays);

    const leavePeriodsMissed = periodsOn(missedDates, subject.slot);
    const leavePeriodsExcused = periodsOn(excusedDates, subject.slot);

    // OD / medical periods are treated as excused: removed from the counted total.
    const totalByEnd = conducted + remainingRaw - leavePeriodsExcused;
    const attendableRemaining = Math.max(0, remainingRaw - leavePeriodsExcused - leavePeriodsMissed);

    const needFor = (threshold: number) =>
      Math.max(0, Math.ceil((threshold / 100) * totalByEnd - attended));

    const mustAttendForSafe = needFor(DANGER_THRESHOLD);
    const mustAttendForTarget = needFor(TARGET_THRESHOLD);
    const maxAttainable = attended + remainingRaw - leavePeriodsExcused;

    const bestPossiblePercent = pct(maxAttainable, totalByEnd);
    const worstPossiblePercent = pct(attended, totalByEnd);
    const projectedPercent = pct(attended + attendableRemaining, totalByEnd);

    const safeReachable = mustAttendForSafe <= remainingRaw - leavePeriodsExcused;
    const targetReachable = mustAttendForTarget <= remainingRaw - leavePeriodsExcused;

    let status: SubjectProjection["status"];
    if (!safeReachable) status = "detention";
    else if (projectedPercent >= TARGET_THRESHOLD) status = "target";
    else if (projectedPercent >= DANGER_THRESHOLD) status = "safe";
    else status = "risk";

    return {
      slot: subject.slot,
      code: subject.code,
      name: subject.name,
      conducted,
      attended,
      currentPercent: percent,
      remaining: remainingRaw,
      leavePeriodsMissed,
      leavePeriodsExcused,
      totalByEnd,
      bestPossiblePercent,
      worstPossiblePercent,
      mustAttendForSafe,
      mustAttendForTarget,
      canSkip: Math.max(0, remainingRaw - leavePeriodsExcused - mustAttendForSafe),
      safeReachable,
      targetReachable,
      projectedPercent,
      status,
    };
  });
}

export const overallPercent = (rows: SubjectProjection[]) => {
  const attended = rows.reduce((t, r) => t + r.attended, 0);
  const conducted = rows.reduce((t, r) => t + r.conducted, 0);
  return pct(attended, conducted);
};

export const projectedOverall = (rows: SubjectProjection[]) => {
  const attended = rows.reduce((t, r) => t + r.attended + (r.remaining - r.leavePeriodsExcused - r.leavePeriodsMissed), 0);
  const total = rows.reduce((t, r) => t + r.totalByEnd, 0);
  return pct(attended, total);
};
