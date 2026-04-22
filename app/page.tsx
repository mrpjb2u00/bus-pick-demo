import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-2xl bg-white p-8 shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
              Prototype Demo
            </p>

            <h1 className="mt-3 text-4xl font-bold leading-tight text-slate-900">
              Transit Pick System
            </h1>

            <p className="mt-4 max-w-2xl text-lg text-slate-700">
              A modern digital replacement for paper-based operator picks,
              vacation selection, clerk processing, and presentation boards.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h2 className="text-lg font-bold text-slate-900">
                  System Pick Demo
                </h2>
                <p className="mt-2 text-sm text-slate-700">
                  Includes the larger annual pick format with division selection,
                  vacation choices, and the full choice sheet layout.
                </p>
                <Link
                  href="/demo"
                  className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                >
                  Open System Pick
                </Link>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Regular Pick Demo
                </h2>
                <p className="mt-2 text-sm text-slate-700">
                  Shows the smaller pick sheet used for Fall, Winter, and Spring
                  picks without the vacation section.
                </p>
                <Link
                  href="/demo/regular"
                  className="mt-4 inline-flex rounded-lg bg-slate-700 px-4 py-2 font-semibold text-white hover:bg-slate-800"
                >
                  Open Regular Pick
                </Link>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Driver-Friendly
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Familiar sheet layout with a cleaner digital workflow.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Clerk-Friendly
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Built to reduce paper handling and simplify processing.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Future-Ready
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Can later include approvals, live boards, and run imports.
                </p>
              </div>
            </div>
          </section>

          <aside className="rounded-2xl bg-slate-900 p-8 text-white shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
              Vision
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              Replace the paper process with a cleaner digital experience
            </h2>

            <ul className="mt-6 space-y-4 text-sm text-slate-200">
              <li>
                • Drivers can review pick sheets on phone, tablet, or desktop
              </li>
              <li>
                • Clerks can process picks through one organized system
              </li>
              <li>
                • Union and management can preview a polished prototype first
              </li>
              <li>
                • Future phases can add approvals, locking, and live display boards
              </li>
            </ul>

            <div className="mt-8 rounded-xl bg-white/10 p-4">
              <p className="text-sm font-semibold text-white">Prototype Status</p>
              <p className="mt-2 text-sm text-slate-200">
                UI-focused demonstration build for concept approval and feedback.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}