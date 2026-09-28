import { useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, Plus, ShieldCheck, Trash2, TriangleAlert } from "lucide-react";
import { SECTIONS, SEMESTER_END, SEMESTER_START, getSection } from "@/data/timetables";
import {
  DANGER_THRESHOLD,
  TARGET_THRESHOLD,
  clampDate,
  formatLong,
  overallPercent,
  projectSubjects,
  toISO,
  type LeaveEntry,
  type LeaveKind,
  type SubjectProjection,
} from "@/lib/attendance";
import { useDashboardState } from "@/lib/use-dashboard-state";
import { CurrentVsProjectedChart, RangeChart } from "@/components/attendance/HealthCharts";
import { AdvisorChat } from "@/components/attendance/AdvisorChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_META: Record<
  SubjectProjection["status"],
  { label: string; className: string }
> = {
  target: { label: "Comfortable", className: "bg-success/15 text-success border-success/40" },
  safe: { label: "Above the line", className: "bg-primary/15 text-primary border-primary/40" },
  risk: { label: "Slipping", className: "bg-warning/15 text-warning border-warning/40" },
  detention: {
    label: "Detention risk",
    className: "bg-destructive/15 text-destructive border-destructive/50",
  },
};

const LEAVE_LABEL: Record<LeaveKind, string> = {
  od: "On Duty (excused)",
  medical: "Medical leave (excused)",
  absent: "Plain absence (counted)",
};

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="panel p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Dashboard() {
  const { state, update, hydrated } = useDashboardState();
  const today = useMemo(() => clampDate(toISO(new Date())), []);
  const [newHoliday, setNewHoliday] = useState("");
  const [leaveDraft, setLeaveDraft] = useState<{ start: string; days: number; kind: LeaveKind }>({
    start: today,
    days: 3,
    kind: "medical",
  });

  const section = state.sectionId ? getSection(state.sectionId) : undefined;
  const planDate = state.planDate ?? SEMESTER_END;
  const percents = (section && state.percents[section.id]) || {};

  const baseRows = useMemo(
    () =>
      section
        ? projectSubjects({
            section,
            percents,
            today,
            planDate,
            holidays: state.holidays,
            leaves: [],
          })
        : [],
    [section, percents, today, planDate, state.holidays],
  );

  const simRows = useMemo(
    () =>
      section
        ? projectSubjects({
            section,
            percents,
            today,
            planDate,
            holidays: state.holidays,
            leaves: state.leaves,
          })
        : [],
    [section, percents, today, planDate, state.holidays, state.leaves],
  );

  const rows = state.leaves.length ? simRows : baseRows;
  const doomed = rows.filter((r) => !r.safeReachable);
  const atRisk = rows.filter((r) => r.safeReachable && r.status === "risk");
  const classesLeft = rows.reduce((t, r) => t + r.remaining, 0);
  const mustAttend = rows.reduce((t, r) => t + r.mustAttendForSafe, 0);
  const forTarget = rows.reduce((t, r) => t + r.mustAttendForTarget, 0);
  const canSkip = rows.reduce((t, r) => t + r.canSkip, 0);

  const snapshot = useMemo(() => {
    if (!section) return "";
    const lines = [
      `Section: ${section.name} (${section.detail}).`,
      `Semester: ${formatLong(SEMESTER_START)} to ${formatLong(SEMESTER_END)}. Saturdays and Sundays are holidays.`,
      `Today: ${formatLong(today)}. Planning horizon: ${formatLong(planDate)}.`,
      state.holidays.length
        ? `Extra holidays marked by the student: ${state.holidays.map(formatLong).join("; ")}.`
        : "No extra holidays marked.",
      state.leaves.length
        ? `Simulated leaves: ${state.leaves
            .map((l) => `${LEAVE_LABEL[l.kind]} from ${formatLong(l.start)} for ${l.days} day(s)`)
            .join("; ")}.`
        : "No leave currently simulated.",
      "",
      "Per subject (numbers already include any simulated leave):",
      ...rows.map((r) =>
        [
          `- ${r.name} (${r.code}):`,
          `current ${r.currentPercent.toFixed(0)}%,`,
          `${r.attended} attended of ${r.conducted} held so far,`,
          `${r.remaining} classes left until the planning date,`,
          `must attend ${r.mustAttendForSafe} more to finish at or above 75%,`,
          `must attend ${r.mustAttendForTarget} more to finish at or above 90%,`,
          `can miss ${r.canSkip} more and still stay above 75%,`,
          `projected finish ${r.projectedPercent.toFixed(1)}%,`,
          r.safeReachable
            ? "75% is still reachable."
            : "75% is NO LONGER reachable by the planning date.",
        ].join(" "),
      ),
    ];
    return lines.join("\n");
  }, [section, rows, today, planDate, state.holidays, state.leaves]);

  if (!hydrated) {
    return <div className="min-h-screen" />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-10 sm:px-6">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Attendance Planner</p>
        <h1 className="mt-2 text-3xl font-bold text-gradient sm:text-4xl">
          Know exactly how many classes you can afford to miss
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Semester runs {formatLong(SEMESTER_START)} to {formatLong(SEMESTER_END)}. Everything stays on
          this device.
        </p>
      </header>

      <section className="panel mb-6 grid gap-4 p-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Your section</Label>
          <Select
            value={state.sectionId ?? ""}
            onValueChange={(value) => update({ sectionId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose your section" />
            </SelectTrigger>
            <SelectContent>
              {SECTIONS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} — {s.venue}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="plan-date">Plan up to</Label>
          <Input
            id="plan-date"
            type="date"
            min={today}
            max={SEMESTER_END}
            value={planDate}
            onChange={(e) => update({ planDate: clampDate(e.target.value || SEMESTER_END) })}
          />
          <p className="text-xs text-muted-foreground">
            Today is {formatLong(today)} — counting up to {formatLong(planDate)}.
          </p>
        </div>
      </section>

      {!section && (
        <p className="panel p-6 text-sm text-muted-foreground">
          Pick your section to load your timetable and start planning.
        </p>
      )}

      {section && (
        <>
          <section className="panel mb-6 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Your attendance right now
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {section.subjects.map((subject) => (
                <div key={subject.slot} className="rounded-lg border border-border bg-secondary/40 p-3">
                  <p className="text-sm font-medium leading-tight">{subject.name}</p>
                  <p className="text-xs text-muted-foreground">{subject.code}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      inputMode="decimal"
                      placeholder="0"
                      value={percents[subject.slot] ?? ""}
                      onChange={(e) =>
                        update({
                          percents: {
                            ...state.percents,
                            [section.id]: {
                              ...percents,
                              [subject.slot]: Number(e.target.value),
                            },
                          },
                        })
                      }
                      className="h-9"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {doomed.length > 0 && (
            <section className="alert-pulse mb-6 rounded-xl border border-destructive/60 bg-destructive/10 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 size-6 shrink-0 text-destructive" />
                <div>
                  <h2 className="text-lg font-bold text-destructive">Irreversible detention</h2>
                  <p className="mt-1 text-sm text-destructive-foreground/90">
                    Even by attending every single remaining class up to {formatLong(planDate)}, these
                    subjects cannot get back to {DANGER_THRESHOLD}%:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm font-medium text-destructive">
                    {doomed.map((r) => (
                      <li key={r.slot}>
                        {r.name} — best possible finish {r.bestPossiblePercent.toFixed(1)}%
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Talk to your faculty advisor about on-duty or medical condonation right away.
                  </p>
                </div>
              </div>
            </section>
          )}

          {doomed.length === 0 && atRisk.length > 0 && (
            <section className="mb-6 rounded-xl border border-warning/50 bg-warning/10 p-4">
              <div className="flex items-center gap-3">
                <TriangleAlert className="size-5 text-warning" />
                <p className="text-sm">
                  {atRisk.length} subject{atRisk.length > 1 ? "s are" : " is"} heading below{" "}
                  {DANGER_THRESHOLD}% on your current plan. Fix them before it gets locked in.
                </p>
              </div>
            </section>
          )}

          {doomed.length === 0 && atRisk.length === 0 && (
            <section className="mb-6 rounded-xl border border-success/40 bg-success/10 p-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-5 text-success" />
                <p className="text-sm">You are clear of the detention zone on this plan.</p>
              </div>
            </section>
          )}

          <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Overall now"
              value={`${overallPercent(rows).toFixed(1)}%`}
              hint={`Target ${TARGET_THRESHOLD}% · danger below ${DANGER_THRESHOLD}%`}
            />
            <Stat label="Classes left" value={`${classesLeft}`} hint={`Until ${formatLong(planDate)}`} />
            <Stat label="Must attend to stay safe" value={`${mustAttend}`} hint="Across all subjects" />
            <Stat label="Must attend for 90%" value={`${forTarget}`} hint={`You can miss ${canSkip} in total`} />
          </section>

          <section className="mb-6 grid gap-4 lg:grid-cols-2">
            <div className="panel p-5">
              <h3 className="mb-3 text-sm font-semibold">Now vs projected finish</h3>
              <CurrentVsProjectedChart rows={rows} />
            </div>
            <div className="panel p-5">
              <h3 className="mb-3 text-sm font-semibold">Best case vs worst case</h3>
              <RangeChart rows={rows} />
            </div>
          </section>

          <section className="panel mb-6 overflow-x-auto p-5">
            <h3 className="mb-4 text-sm font-semibold">Subject by subject</h3>
            <table className="w-full min-w-[46rem] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2">Subject</th>
                  <th className="pb-2">Now</th>
                  <th className="pb-2">Left</th>
                  <th className="pb-2">Attend for 75%</th>
                  <th className="pb-2">Attend for 90%</th>
                  <th className="pb-2">Can miss</th>
                  <th className="pb-2">Projected</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.slot} className="border-t border-border/70">
                    <td className="py-3 pr-3">
                      <p className="font-medium leading-tight">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.code}</p>
                    </td>
                    <td className="py-3">{r.currentPercent.toFixed(0)}%</td>
                    <td className="py-3">{r.remaining}</td>
                    <td className="py-3">{r.safeReachable ? r.mustAttendForSafe : "—"}</td>
                    <td className="py-3">{r.targetReachable ? r.mustAttendForTarget : "—"}</td>
                    <td className="py-3">{r.canSkip}</td>
                    <td className="py-3">{r.projectedPercent.toFixed(1)}%</td>
                    <td className="py-3">
                      <span
                        className={`inline-block rounded-full border px-2 py-0.5 text-xs ${STATUS_META[r.status].className}`}
                      >
                        {STATUS_META[r.status].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="mb-6 grid gap-4 lg:grid-cols-2">
            <div className="panel p-5">
              <h3 className="text-sm font-semibold">Leave simulator</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Add an OD, medical leave or plain absence and the numbers above update instantly.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label htmlFor="leave-start" className="text-xs">
                    Starts
                  </Label>
                  <Input
                    id="leave-start"
                    type="date"
                    min={today}
                    max={SEMESTER_END}
                    value={leaveDraft.start}
                    onChange={(e) => setLeaveDraft((d) => ({ ...d, start: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="leave-days" className="text-xs">
                    Days
                  </Label>
                  <Input
                    id="leave-days"
                    type="number"
                    min={1}
                    max={60}
                    value={leaveDraft.days}
                    onChange={(e) => setLeaveDraft((d) => ({ ...d, days: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={leaveDraft.kind}
                    onValueChange={(value) => setLeaveDraft((d) => ({ ...d, kind: value as LeaveKind }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(LEAVE_LABEL) as LeaveKind[]).map((k) => (
                        <SelectItem key={k} value={k}>
                          {LEAVE_LABEL[k]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                className="mt-4"
                onClick={() => {
                  const entry: LeaveEntry = {
                    id: `${Date.now()}`,
                    start: clampDate(leaveDraft.start),
                    days: Math.max(1, leaveDraft.days),
                    kind: leaveDraft.kind,
                    label: LEAVE_LABEL[leaveDraft.kind],
                  };
                  update({ leaves: [...state.leaves, entry] });
                }}
              >
                <Plus className="size-4" /> Simulate this leave
              </Button>

              <ul className="mt-4 space-y-2">
                {state.leaves.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm"
                  >
                    <span>
                      {LEAVE_LABEL[l.kind]} · {formatLong(l.start)} · {l.days} day
                      {l.days > 1 ? "s" : ""}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remove leave"
                      onClick={() => update({ leaves: state.leaves.filter((x) => x.id !== l.id) })}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel p-5">
              <h3 className="text-sm font-semibold">Holidays</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Saturdays and Sundays are already off. Add any other college holiday so the counts stay
                honest.
              </p>
              <div className="mt-4 flex gap-2">
                <Input
                  type="date"
                  min={SEMESTER_START}
                  max={SEMESTER_END}
                  value={newHoliday}
                  onChange={(e) => setNewHoliday(e.target.value)}
                />
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (!newHoliday || state.holidays.includes(newHoliday)) return;
                    update({ holidays: [...state.holidays, newHoliday].sort() });
                    setNewHoliday("");
                  }}
                >
                  <CalendarDays className="size-4" /> Add
                </Button>
              </div>
              <ul className="mt-4 flex flex-wrap gap-2">
                {state.holidays.map((h) => (
                  <li key={h}>
                    <button
                      type="button"
                      onClick={() => update({ holidays: state.holidays.filter((x) => x !== h) })}
                      className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs hover:border-destructive hover:text-destructive"
                    >
                      {formatLong(h)} ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </>
      )}

      <AdvisorChat snapshot={snapshot} />
    </div>
  );
}
