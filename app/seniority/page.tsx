import Link from "next/link";
import AppNav from "@/components/AppNav";
const drivers = [
  {
    rank: 213,
    name: "Kenneth Brooks",
    badge: "5235",
    pickDate: "Tuesday, April 28, 2026",
    pickTime: "11:55 AM",
    status: "Submitted",
  },
  {
    rank: 232,
    name: "Eugene Butler",
    badge: "4908",
    pickDate: "Wednesday, April 29, 2026",
    pickTime: "10:40 AM",
    status: "Not Started",
  },
  {
    rank: 239,
    name: "Paul Browner",
    badge: "4021",
    pickDate: "Wednesday, April 29, 2026",
    pickTime: "2:15 PM",
    status: "Not Started",
  },
  {
    rank: 240,
    name: "Antonio Penman",
    badge: "6317",
    pickDate: "Wednesday, April 29, 2026",
    pickTime: "2:20 PM",
    status: "Not Started",
  },
  {
    rank: 241,
    name: "Gina Tyus",
    badge: "6322",
    pickDate: "Wednesday, April 29, 2026",
    pickTime: "2:35 PM",
    status: "Not Started",
  },
  {
    rank: 242,
    name: "Jason White",
    badge: "6310",
    pickDate: "Wednesday, April 29, 2026",
    pickTime: "1:00 PM",
    status: "Approved",
  },
];

export default async function SeniorityPage({
  searchParams,
}: {
  searchParams: Promise<{ badge?: string }>;
}) {
  const params = await searchParams;
  const activeBadge = params.badge ?? null;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <AppNav />
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
              Metro Work Pick Demo
            </p>
            <h1 className="text-3xl font-bold text-slate-900">
              Seniority List
            </h1>
            <p className="mt-2 text-slate-600">
              Sample seniority order and assigned pick times.
            </p>
          </div>

          <Link
            href={activeBadge ? `/dashboard?badge=${activeBadge}` : "/dashboard"}
            className="inline-flex rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold">Rank</th>
                  <th className="px-4 py-3 text-sm font-semibold">Driver</th>
                  <th className="px-4 py-3 text-sm font-semibold">Badge</th>
                  <th className="px-4 py-3 text-sm font-semibold">Pick Date</th>
                  <th className="px-4 py-3 text-sm font-semibold">Pick Time</th>
                  <th className="px-4 py-3 text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => {
                  const isActive = activeBadge === driver.badge;

                  return (
                    <tr
                      key={driver.badge}
                      className={
                        isActive
                          ? "bg-yellow-100"
                          : "border-t border-slate-200 bg-white"
                      }
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        #{driver.rank}
                      </td>
                      <td className="px-4 py-3 text-slate-800">{driver.name}</td>
                      <td className="px-4 py-3 text-slate-800">{driver.badge}</td>
                      <td className="px-4 py-3 text-slate-700">{driver.pickDate}</td>
                      <td className="px-4 py-3 text-slate-700">{driver.pickTime}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-800">
                          {driver.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {activeBadge && (
          <p className="mt-4 text-sm text-slate-600">
            Highlighted row shows the currently selected driver.
          </p>
        )}
      </div>
    </main>
  );
}