import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SubjectProjection } from "@/lib/attendance";
import { DANGER_THRESHOLD, TARGET_THRESHOLD } from "@/lib/attendance";

const statusColor: Record<SubjectProjection["status"], string> = {
  target: "var(--color-success)",
  safe: "var(--color-chart-2)",
  risk: "var(--color-warning)",
  detention: "var(--color-destructive)",
};

const tooltipStyle = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: "0.6rem",
  color: "var(--color-popover-foreground)",
  fontSize: "0.8rem",
};

export function CurrentVsProjectedChart({ rows }: { rows: SubjectProjection[] }) {
  const data = rows.map((r) => ({
    name: r.slot,
    subject: r.name,
    Now: Number(r.currentPercent.toFixed(1)),
    Projected: Number(r.projectedPercent.toFixed(1)),
    status: r.status,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} />
        <YAxis domain={[0, 100]} stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "var(--color-accent)", opacity: 0.25 }}
          labelFormatter={(label) => data.find((d) => d.name === label)?.subject ?? String(label)}
        />
        <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
        <ReferenceLine y={DANGER_THRESHOLD} stroke="var(--color-destructive)" strokeDasharray="4 4" />
        <ReferenceLine y={TARGET_THRESHOLD} stroke="var(--color-success)" strokeDasharray="4 4" />
        <Bar dataKey="Now" radius={[4, 4, 0, 0]} fill="var(--color-chart-2)" />
        <Bar dataKey="Projected" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={statusColor[entry.status]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RangeChart({ rows }: { rows: SubjectProjection[] }) {
  const data = rows.map((r) => ({
    name: r.slot,
    subject: r.name,
    "If you attend all": Number(r.bestPossiblePercent.toFixed(1)),
    "If you stop now": Number(r.worstPossiblePercent.toFixed(1)),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} />
        <YAxis domain={[0, 100]} stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={(label) => data.find((d) => d.name === label)?.subject ?? String(label)}
        />
        <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
        <ReferenceLine y={DANGER_THRESHOLD} stroke="var(--color-destructive)" strokeDasharray="4 4" />
        <ReferenceLine y={TARGET_THRESHOLD} stroke="var(--color-success)" strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="If you attend all"
          stroke="var(--color-success)"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="If you stop now"
          stroke="var(--color-destructive)"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
