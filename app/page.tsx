export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="w-full max-w-3xl rounded-2xl bg-white p-10 shadow-lg">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Metro Work Pick Demo
          </p>

          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Bus Driver Work Schedule & Pick Platform
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            A sample web app for digital work picking, seniority tracking,
            clerk approval, and live presentation boards.
          </p>

          <div className="grid gap-4 text-left sm:grid-cols-3">
            <div className="rounded-xl border border-pink-200 bg-pink-50 p-4">
              <h2 className="mb-2 text-lg font-semibold text-pink-700">Sunday</h2>
              <p className="text-sm text-slate-600">
                Drivers will choose Sunday work from the Sunday run board.
              </p>
            </div>

            <div className="rounded-xl border border-slate-300 bg-white p-4">
              <h2 className="mb-2 text-lg font-semibold text-slate-800">Weekday</h2>
              <p className="text-sm text-slate-600">
                Drivers will choose weekday work and optional extras.
              </p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <h2 className="mb-2 text-lg font-semibold text-blue-700">Saturday</h2>
              <p className="text-sm text-slate-600">
                Drivers will choose Saturday work from the Saturday run board.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
            <p className="text-sm text-slate-700">
              Current phase: <span className="font-semibold">Project setup</span>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}