"use client";

import AppNav from "@/components/AppNav";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type StagedRun = {
  id: string;
  garage: "QG" | "BH";
  service_day: string;
  pick_bucket: "sunday" | "weekday" | "amExtra" | "pmExtra" | "sat";
  run_number: string;
  route: string;
  block: string;
  relief_point: string;
  start_time: string;
  end_time: string;
  relief_point_2: string;
  total_time: string;
  display_order: number;
  notes: string | null;
};

type CurrentUser = {
  id: string;
  badge_number: string;
  full_name: string;
  name?: string;
  role: "driver" | "clerk";
  garage: "QG" | "BH";
};

const categories = [
  { label: "Sunday Runs", value: "sunday" },
  { label: "Weekday Runs", value: "weekday" },
  { label: "AM Extras", value: "amExtra" },
  { label: "PM Extras", value: "pmExtra" },
  { label: "Saturday Runs", value: "sat" },
] as const;

export default function RunsPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [garage, setGarage] = useState<"QG" | "BH">("QG");
  const [category, setCategory] = useState<
    "sunday" | "weekday" | "amExtra" | "pmExtra" | "sat"
  >("sunday");

  const [runs, setRuns] = useState<StagedRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");

    if (!storedUser) {
      window.location.href = "/login";
      return;
    }

    const user = JSON.parse(storedUser) as CurrentUser;
    setCurrentUser(user);

    if (user.garage === "QG" || user.garage === "BH") {
      setGarage(user.garage);
    }
  }, []);

  useEffect(() => {
    loadRuns();
  }, [garage, category]);

  async function loadRuns() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("run_import_staging")
      .select("*")
      .eq("garage", garage)
      .eq("pick_bucket", category)
      .order("display_order", { ascending: true });

    if (error) {
      setMessage(error.message);
      setRuns([]);
    } else {
      setRuns((data ?? []) as StagedRun[]);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-900 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <AppNav />

        <section className="mb-4 rounded-2xl bg-white p-5 shadow">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Runs Board</h1>

              {currentUser && (
                <p className="mt-1 text-sm text-slate-600">
                  {currentUser.full_name || currentUser.name} • Badge{" "}
                  {currentUser.badge_number} • Home Garage: {currentUser.garage}
                </p>
              )}

              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                System Pick Demo — both garages available
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setGarage("QG")}
                className={`rounded-lg px-4 py-2 text-sm font-bold ${
                  garage === "QG"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-800 hover:bg-slate-300"
                }`}
              >
                QG
              </button>

              <button
                onClick={() => setGarage("BH")}
                className={`rounded-lg px-4 py-2 text-sm font-bold ${
                  garage === "BH"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-800 hover:bg-slate-300"
                }`}
              >
                BH
              </button>
            </div>
          </div>
        </section>

        <section className="mb-4 rounded-2xl bg-white p-4 shadow">
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item.value}
                onClick={() => setCategory(item.value)}
                className={`rounded-lg px-4 py-2 text-sm font-bold ${
                  category === item.value
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-4 rounded-2xl bg-white p-4 shadow">
          <p className="text-sm font-semibold text-slate-700">
            Showing {runs.length} run(s) for {garage}
          </p>
        </section>

        {message && (
          <section className="mb-4 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700 shadow">
            {message}
          </section>
        )}

        {loading ? (
          <section className="rounded-2xl bg-white p-6 text-slate-600 shadow">
            Loading runs...
          </section>
        ) : runs.length === 0 ? (
          <section className="rounded-2xl bg-white p-6 text-slate-600 shadow">
            No runs found for this garage/category.
          </section>
        ) : (
          <section className="grid gap-4">
            {runs.map((run) => (
              <div
                key={run.id}
                className="rounded-2xl bg-white p-4 shadow sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xl font-bold text-slate-900">
                      Run {run.run_number}
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      Route {run.route || "—"} • Block {run.block || "—"}
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      {run.relief_point || "—"} • {run.start_time || "—"} →{" "}
                      {run.end_time || "—"} • {run.relief_point_2 || "—"}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      Total Time: {run.total_time || "—"}
                    </p>

                    {run.notes && (
                      <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
                        {run.notes}
                      </p>
                    )}
                  </div>

                  <button className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700">
                    Select
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}