const saturdayRuns = [
  {
    run: "250",
    route: "21",
    start: "5:10 AM",
    end: "2:25 PM",
    total: "9h25",
    status: "Available",
  },
  {
    run: "251",
    route: "6",
    start: "6:00 AM",
    end: "3:30 PM",
    total: "9h30",
    status: "Available",
  },
  {
    run: "252",
    route: "19",
    start: "4:20 AM",
    end: "1:15 PM",
    total: "8h55",
    status: "Taken - Brooks 5235",
  },
  {
    run: "253",
    route: "16",
    start: "5:00 AM",
    end: "2:10 PM",
    total: "9h10",
    status: "Available",
  },
  {
    run: "254",
    route: "17",
    start: "3:45 AM",
    end: "12:05 PM",
    total: "8h20",
    status: "Available",
  },
  {
    run: "255",
    route: "33",
    start: "6:30 AM",
    end: "4:00 PM",
    total: "9h30",
    status: "Taken - White 6310",
  },
  {
    run: "256",
    route: "21&6",
    start: "7:00 AM",
    end: "5:10 PM",
    total: "10h10",
    status: "Available",
  },
];

export default function SaturdayRunsPage() {
  return (
    <main className="min-h-screen bg-blue-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Metro Work Pick Demo
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            Saturday Run Board
          </h1>
          <p className="mt-2 text-slate-700">
            Sample Saturday work pieces for the system pick.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-blue-600 text-white">
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
                {saturdayRuns.map((run) => {
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