"use client";

import Link from "next/link";

const STORAGE_KEY = "metro-work-pick-demo";

const sundayRuns = [
  {
    run: "375",
    route: "21&6",
    start: "5:40 AM",
    end: "3:40 PM",
    total: "10h15",
    type: "Day Run",
    status: "Available",
  },
  {
    run: "376",
    route: "6",
    start: "6:11 AM",
    end: "3:22 PM",
    total: "9h26",
    type: "Day Run",
    status: "Available",
  },
  {
    run: "377",
    route: "19&16",
    start: "3:39 AM",
    end: "12:53 PM",
    total: "9h24",
    type: "Split Run",
    status: "Taken - Brooks 5235",
  },
  {
    run: "378",
    route: "19&16",
    start: "4:14 AM",
    end: "2:06 PM",
    total: "10h02",
    type: "Day Run",
    status: "Available",
  },
  {
    run: "381",
    route: "17",
    start: "3:18 AM",
    end: "11:36 AM",
    total: "8h28",
    type: "Early Run",
    status: "Available",
  },
  {
    run: "382",
    route: "17",
    start: "3:48 AM",
    end: "2:58 PM",
    total: "11h20",
    type: "Day Run",
    status: "Available",
  },
];

function saveSundayRun(value: string) {
  if (typeof window === "undefined") return;

  const existingRaw = localStorage.getItem(STORAGE_KEY);
  let existingData: Record<string, unknown> = {};

  if (existingRaw) {
    try {
      existingData = JSON.parse(existingRaw) as Record<string, unknown>;
    } catch {
      existingData = {};
    }
  }

  const updatedData = {
    ...existingData,
    selectedSunday: value,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
}

export default function SundayPickPage() {
  return (
    <main className="min-h-screen bg-pink-50 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-700">
              Metro Work Pick Demo
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Choose Sunday Run
            </h1>
            <p className="mt-2 max-w-2xl text-slate-700">
              Select a Sunday run for your weekly pick. Later, this page can support
              search, filters, and full-book browsing.
            </p>
          </div>

          <Link
            href="/pick"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800"
          >
            Back to Weekly Pick
          </Link>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-pink-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Future Filter</p>
            <p className="mt-1 text-base font-semibold text-slate-900">Day Runs</p>
          </div>

          <div className="rounded-xl border border-pink-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Future Filter</p>
            <p className="mt-1 text-base font-semibold text-slate-900">Late Runs</p>
          </div>

          <div className="rounded-xl border border-pink-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Future Filter</p>
            <p className="mt-1 text-base font-semibold text-slate-900">Split Runs</p>
          </div>
        </div>

        <div className="grid gap-4">
          {sundayRuns.map((run) => {
            const isTaken = run.status.startsWith("Taken");
            const selectedValue = `${run.run} - ${run.route} - ${run.start} to ${run.end}`;

            return (
              <div
                key={run.run}
                className="rounded-2xl border border-pink-100 bg-white p-5 shadow-lg"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold uppercase tracking-wide text-pink-700">
                      Run {run.run}
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-slate-900">
                      Route {run.route}
                    </h2>

                    <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                      <div className="rounded-lg bg-pink-50 px-3 py-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Start
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">{run.start}</p>
                      </div>

                      <div className="rounded-lg bg-pink-50 px-3 py-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          End
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">{run.end}</p>
                      </div>

                      <div className="rounded-lg bg-pink-50 px-3 py-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Total
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">{run.total}</p>
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-slate-700">
                      <span className="font-semibold text-slate-900">Type:</span> {run.type}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 lg:min-w-[180px] lg:items-end">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                        isTaken
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {run.status}
                    </span>

                    {isTaken ? (
                      <button
                        disabled
                        className="cursor-not-allowed rounded-lg bg-slate-400 px-4 py-2 font-semibold text-white"
                      >
                        Unavailable
                      </button>
                    ) : (
                      <Link
                        href="/pick"
                        onClick={() => saveSundayRun(selectedValue)}
                        className="inline-flex items-center justify-center rounded-lg bg-pink-600 px-4 py-2 font-semibold text-white hover:bg-pink-700"
                      >
                        Select Run
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}