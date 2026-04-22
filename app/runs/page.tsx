"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type StagedRun = {
  id: string;
  garage: string | null;
  service_day: string | null;
  pick_bucket: string | null;
  run_number: string | null;
  route: string | null;
  block: string | null;
  relief_point: string | null;
  start_time: string | null;
  end_time: string | null;
  relief_point_2: string | null;
  total_time: string | null;
  source_pick: string | null;
  source_file: string | null;
  import_batch: string | null;
  display_order: number | null;
  notes: string | null;
};

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function RunsPage() {
  const [garage, setGarage] = useState<"QG" | "BH">("BH");
  const [category, setCategory] = useState<
    "sunday" | "weekday" | "amExtra" | "pmExtra" | "sat"
  >("sunday");

  const [runs, setRuns] = useState<StagedRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRuns, setSelectedRuns] = useState<
    Record<string, { run: StagedRun; day?: string }>
  >({});
  const [pendingRun, setPendingRun] = useState<StagedRun | null>(null);

  useEffect(() => {
    async function loadRuns() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("run_import_staging")
        .select("*")
        .eq("garage", garage)
        .eq("pick_bucket", category)
        .order("display_order", { ascending: true });

      if (error) {
        setError("Failed to load runs from Supabase.");
        setRuns([]);
        setLoading(false);
        return;
      }

      setRuns((data ?? []) as StagedRun[]);
      setLoading(false);
    }

    loadRuns();
  }, [garage, category]);

  const isDayTaken = (day: string) => {
    return Object.values(selectedRuns).some((entry) => entry.day === day);
  };

  const handleSelect = (run: StagedRun) => {
    if (category === "weekday") {
      setPendingRun(run);
      return;
    }

    setSelectedRuns((prev) => ({
      ...prev,
      [run.id]: { run },
    }));
  };

  const assignWeekdayRun = (day: string) => {
    if (!pendingRun) return;

    if (isDayTaken(day)) {
      alert("You already selected a weekday run for that day.");
      return;
    }

    setSelectedRuns((prev) => ({
      ...prev,
      [pendingRun.id]: { run: pendingRun, day },
    }));

    setPendingRun(null);
  };

  const filteredRuns = useMemo(() => runs, [runs]);

  const tabClass = (active: boolean) =>
    active
      ? "rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
      : "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50";

  const garageClass = (active: boolean) =>
    active
      ? "rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
      : "rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50";

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 rounded-xl bg-white p-5 shadow">
          <h1 className="text-2xl font-bold text-slate-900">Available Runs</h1>
          <p className="mt-1 text-sm text-slate-600">
            Prototype picker using Supabase-staged run-book data.
          </p>
        </div>

        <div className="mb-4 flex gap-2">
          <button onClick={() => setGarage("QG")} className={garageClass(garage === "QG")}>
            Queensgate
          </button>
          <button onClick={() => setGarage("BH")} className={garageClass(garage === "BH")}>
            Bond Hill
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <button onClick={() => setCategory("sunday")} className={tabClass(category === "sunday")}>
            Sunday Runs
          </button>
          <button onClick={() => setCategory("weekday")} className={tabClass(category === "weekday")}>
            Weekday Runs
          </button>
          <button onClick={() => setCategory("amExtra")} className={tabClass(category === "amExtra")}>
            AM Extras
          </button>
          <button onClick={() => setCategory("pmExtra")} className={tabClass(category === "pmExtra")}>
            PM Extras
          </button>
          <button onClick={() => setCategory("sat")} className={tabClass(category === "sat")}>
            Saturday Runs
          </button>
        </div>

        {loading && (
          <div className="rounded-xl bg-white p-6 text-slate-600 shadow">
            Loading runs...
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-100 p-6 text-red-700 shadow">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-4">
            {filteredRuns.map((run) => (
              <div
                key={run.id}
                className="flex flex-col justify-between gap-4 rounded-xl bg-white p-4 shadow md:flex-row md:items-center"
              >
                <div className="min-w-0">
                  <p className="text-lg font-bold text-slate-900">
                    Run {run.run_number}
                  </p>

                  <p className="text-sm text-slate-700">
                    Route {run.route || "—"}
                    {run.block ? ` • Block ${run.block}` : ""}
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {run.start_time || "—"} → {run.end_time || "—"}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    Total: {run.total_time || "—"}
                    {run.relief_point ? ` • ${run.relief_point}` : ""}
                    {run.relief_point_2 ? ` → ${run.relief_point_2}` : ""}
                  </p>

                  {run.notes && (
                    <p className="mt-2 text-xs text-amber-700">
                      Note: {run.notes}
                    </p>
                  )}

                  {selectedRuns[run.id] && (
                    <p className="mt-2 text-sm font-semibold text-green-700">
                      Selected
                      {selectedRuns[run.id].day
                        ? ` (${selectedRuns[run.id].day})`
                        : ""}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-start gap-2 md:items-end">
                  <span className="text-sm text-slate-500">
                    Available
                  </span>

                  <button
                    onClick={() => handleSelect(run)}
                    className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
                  >
                    Select
                  </button>
                </div>
              </div>
            ))}

            {filteredRuns.length === 0 && (
              <div className="rounded-xl bg-white p-6 text-center text-slate-500 shadow">
                No runs available for {garage} / {category}
              </div>
            )}
          </div>
        )}
      </div>

      {pendingRun && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Select day for Run {pendingRun.run_number}
            </h2>

            <div className="grid gap-2">
              {weekdays.map((day) => (
                <button
                  key={day}
                  disabled={isDayTaken(day)}
                  onClick={() => assignWeekdayRun(day)}
                  className={
                    isDayTaken(day)
                      ? "cursor-not-allowed rounded-lg bg-slate-300 p-2 font-semibold text-slate-600"
                      : "rounded-lg bg-blue-600 p-2 font-semibold text-white hover:bg-blue-700"
                  }
                >
                  {day}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPendingRun(null)}
              className="mt-4 text-sm font-medium text-red-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}