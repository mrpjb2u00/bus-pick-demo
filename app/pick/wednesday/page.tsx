import Link from "next/link";

const wednesdayRuns = [
  {
    run: "001",
    route: "33&6",
    start: "3:15 AM",
    end: "10:51 AM",
    total: "7h51",
    type: "Day Run",
    status: "Available",
  },
  {
    run: "002",
    route: "21&6",
    start: "4:54 AM",
    end: "2:09 PM",
    total: "9h30",
    type: "Day Run",
    status: "Available",
  },
  {
    run: "004",
    route: "16",
    start: "3:38 AM",
    end: "11:29 AM",
    total: "8h01",
    type: "Early Run",
    status: "Available",
  },
  {
    run: "005",
    route: "16",
    start: "4:08 AM",
    end: "11:59 AM",
    total: "8h01",
    type: "Early Run",
    status: "Available",
  },
  {
    run: "006",
    route: "16&19",
    start: "4:36 AM",
    end: "4:08 PM",
    total: "11h42",
    type: "Split Run",
    status: "Taken - White 6310",
  },
  {
    run: "008",
    route: "16",
    start: "6:00 AM",
    end: "4:26 PM",
    total: "10h36",
    type: "Day Run",
    status: "Available",
  },
  {
    run: "016",
    route: "17",
    start: "7:42 AM",
    end: "6:27 PM",
    total: "10h55",
    type: "Late Run",
    status: "Available",
  },
];

export default function WednesdayPickPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">
              Metro Work Pick Demo
            </p>
            <h1 className="text-3xl font-bold text-slate-900">
              Choose Wednesday Run
            </h1>
            <p className="mt-2 text-slate-700">
              This dedicated selection page is designed to scale better for larger weekday run lists.
            </p>
          </div>

          <Link
            href="/pick"
            className="inline-flex rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800"
          >
            Back to Weekly Pick
          </Link>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-4 shadow-lg">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-medium text-slate-600">Future Filter</p>
              <p className="mt-1 font-semibold text-slate-900">Day Runs</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-medium text-slate-600">Future Filter</p>
              <p className="mt-1 font-semibold text-slate-900">Late Runs</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-medium text-slate-600">Future Filter</p>
              <p className="mt-1 font-semibold text-slate-900">Split Runs</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {wednesdayRuns.map((run) => {
            const isTaken = run.status.startsWith("Taken");

            return (
              <div
                key={run.run}
                className="rounded-2xl bg-white p-5 shadow-lg"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                      Run {run.run}
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-900">
                      Route {run.route}
                    </h2>
                    <p className="mt-2 text-slate-700">
                      {run.start} to {run.end}
                    </p>
                    <p className="text-slate-700">Total: {run.total}</p>
                    <p className="text-slate-700">Type: {run.type}</p>
                  </div>

                  <div className="flex flex-col gap-3 md:items-end">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        isTaken
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {run.status}
                    </span>

                    <button
                      disabled={isTaken}
                      className={`rounded-lg px-4 py-2 font-semibold text-white ${
                        isTaken
                          ? "cursor-not-allowed bg-slate-400"
                          : "bg-slate-700 hover:bg-slate-800"
                      }`}
                    >
                      {isTaken ? "Unavailable" : "Select Run"}
                    </button>
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