import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-2xl bg-white p-6 shadow-xl sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
              Prototype Demo
            </p>

            <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              Transit Pick System
            </h1>

            <p className="mt-4 max-w-2xl text-base text-slate-700 sm:text-lg">
              A modern digital replacement for paper-based operator picks,
              vacation selection, clerk processing, and presentation boards.
            </p>

            <div className="mt-8">
              <Link
                href="/login"
                className="inline-flex w-full justify-center rounded-xl bg-blue-600 px-6 py-3 text-base font-bold text-white shadow hover:bg-blue-700 sm:w-auto"
              >
                Driver / Clerk Sign In
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Driver-Friendly
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Browse available work and make choices from any device.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Clerk-Friendly
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Designed to reduce paper handling and simplify processing.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Future-Ready
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Built for live boards, approvals, run uploads, and reports.
                </p>
              </div>
            </div>
          </section>

          <aside className="rounded-2xl bg-slate-900 p-6 text-white shadow-xl sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
              Vision
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              Replace the paper process with a cleaner digital experience
            </h2>

            <ul className="mt-6 space-y-4 text-sm text-slate-200">
              <li>• Drivers review runs before and during the pick</li>
              <li>• Drivers make selections through one organized picker</li>
              <li>• Clerks manage runs, drivers, picks, and submissions</li>
              <li>• Future phases can include PDF uploads and live status boards</li>
            </ul>

            <div className="mt-8 rounded-xl bg-white/10 p-4">
              <p className="text-sm font-semibold text-white">Prototype Status</p>
              <p className="mt-2 text-sm text-slate-200">
                Database-connected demo using staged real run data.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}