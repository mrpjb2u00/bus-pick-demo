import Link from "next/link";

type Driver = {
  name: string;
  rank: number;
  pickDate: string;
  pickTime: string;
  status: string;
};

const sampleDrivers: Record<string, Driver> = {
  "4021": {
    name: "Paul Browner",
    rank: 239,
    pickDate: "Wednesday, April 29, 2026",
    pickTime: "2:15 PM",
    status: "Not Started",
  },
  "4908": {
    name: "Eugene Butler",
    rank: 232,
    pickDate: "Wednesday, April 29, 2026",
    pickTime: "10:40 AM",
    status: "Not Started",
  },
  "5235": {
    name: "Kenneth Brooks",
    rank: 213,
    pickDate: "Tuesday, April 28, 2026",
    pickTime: "11:55 AM",
    status: "Submitted",
  },
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ badge?: string }>;
}) {
  const params = await searchParams;
  const badge = params.badge ?? "";

  const driver = sampleDrivers[badge] || {
    name: "Sample Driver",
    rank: 999,
    pickDate: "To Be Assigned",
    pickTime: "To Be Assigned",
    status: "Unknown",
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Driver Dashboard
          </p>

          <h1 className="mb-2 text-3xl font-bold text-slate-900">
            Welcome, {driver.name}
          </h1>

          <p className="mb-8 text-slate-600">
            This is the sample dashboard for the Metro Work Pick Demo.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Badge Number</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {badge || "N/A"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Seniority Rank</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                #{driver.rank}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Pick Date</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {driver.pickDate}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Pick Time</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {driver.pickTime}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Status</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {driver.status}
            </p>
          </div>

          <div className="mt-8">
            <Link
              href={`/seniority?badge=${badge}`}
              className="inline-flex rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800"
            >
              View Seniority List
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}