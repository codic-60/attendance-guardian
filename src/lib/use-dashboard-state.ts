import { useCallback, useEffect, useState } from "react";
import type { LeaveEntry } from "@/lib/attendance";

const KEY = "attendance-planner-v1";

export interface DashboardState {
  sectionId: string | null;
  percents: Record<string, Record<string, number>>;
  planDate: string | null;
  holidays: string[];
  leaves: LeaveEntry[];
}

const EMPTY: DashboardState = {
  sectionId: null,
  percents: {},
  planDate: null,
  holidays: [],
  leaves: [],
};

const read = (): DashboardState => {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<DashboardState>) };
  } catch {
    return EMPTY;
  }
};

export function useDashboardState() {
  const [state, setState] = useState<DashboardState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(read());
    setHydrated(true);
  }, []);

  const update = useCallback((patch: Partial<DashboardState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setState(EMPTY);
  }, []);

  return { state, update, reset, hydrated };
}
