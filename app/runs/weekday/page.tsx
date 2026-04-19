const weekdayRuns = [
  {
    run: "001",
    route: "33&6",
    start: "3:15 AM",
    end: "10:51 AM",
    total: "7h51",
    status: "Available",
  },
  {
    run: "002",
    route: "21&6",
    start: "4:54 AM",
    end: "2:09 PM",
    total: "9h30",
    status: "Available",
  },
  {
    run: "003",
    route: "19&16",
    start: "3:37 AM",
    end: "11:56 AM",
    total: "8h29",
    status: "Taken - Brooks 5235",
  },
  {
    run: "004",
    route: "16",
    start: "3:38 AM",
    end: "11:29 AM",
    total: "8h01",
    status: "Available",
  },
  {
    run: "005",
    route: "16",
    start: "4:08 AM",
    end: "11:59 AM",
    total: "8h01",
    status: "Available",
  },
  {
    run: "006",
    route: "16&19",
    start: "4:36 AM",
    end: "4:08 PM",
    total: "11h42",
    status: "Taken - White 6310",
  },
  {
    run: "007",
    route: "16",
    start: "5:04 AM",
    end: "1:01 PM",
    total: "8h07",
    status: "Available",
  },
  {
    run: "008",
    route: "16",
    start: "6:00 AM",
    end: "4:26 PM",
    total: "10h36",
    status: "Available",
  },
];

export default function WeekdayRunsPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">
            Metro Work Pick Demo
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            Weekday Run Board
          </h1>
          <p className="mt-2 text-slate-700">
            Sample weekday work pieces for the system pick.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold">Run</th>
                  <th className="px-4 py-3 text-sm font-semibold">Route</th>
                  <th className="px-4 py-3 text-sm font-semibold">Start</th>
                  <th className="px-4 py-3 text-sm font-semibold">End</th>
                  <th className="px-4 py-3 text-sm font-semibold">Total Time</th>
                  <th className="px-4 py-3 text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {weekdayRuns.map((run) => {
                  const isTaken = run.status.startsWith("Taken");

                  return (
                    <tr
                      key={run.run}
                      className="border-t border-slate-200 bg-white"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {run.run}
                      </td>
                      <td className="px-4 py-3 text-slate-800">{run.route}</td>
                      <td className="px-4 py-3 text-slate-700">{run.start}</td>
                      <td className="px-4 py-3 text-slate-700">{run.end}</td>
                      <td className="px-4 py-3 text-slate-700">{run.total}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${
                            isTaken
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {run.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}