const sundayRuns = [
  {
    run: "375",
    route: "21&6",
    start: "5:40 AM",
    end: "3:40 PM",
    total: "10h15",
    status: "Available",
  },
  {
    run: "376",
    route: "6",
    start: "6:11 AM",
    end: "3:22 PM",
    total: "9h26",
    status: "Available",
  },
  {
    run: "377",
    route: "19&16",
    start: "3:39 AM",
    end: "12:53 PM",
    total: "9h24",
    status: "Taken - Brooks 5235",
  },
  {
    run: "378",
    route: "19&16",
    start: "4:14 AM",
    end: "2:06 PM",
    total: "10h02",
    status: "Available",
  },
  {
    run: "379",
    route: "16",
    start: "4:22 AM",
    end: "2:20 PM",
    total: "10h08",
    status: "Available",
  },
  {
    run: "380",
    route: "16",
    start: "5:05 AM",
    end: "3:03 PM",
    total: "10h08",
    status: "Taken - White 6310",
  },
  {
    run: "381",
    route: "17",
    start: "3:18 AM",
    end: "11:36 AM",
    total: "8h28",
    status: "Available",
  },
  {
    run: "382",
    route: "17",
    start: "3:48 AM",
    end: "2:58 PM",
    total: "11h20",
    status: "Available",
  },
];

export default function SundayRunsPage() {
  return (
    <main className="min-h-screen bg-pink-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-700">
            Metro Work Pick Demo
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            Sunday Run Board
          </h1>
          <p className="mt-2 text-slate-700">
            Sample Sunday work pieces for the system pick.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-pink-600 text-white">
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
                {sundayRuns.map((run) => {
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