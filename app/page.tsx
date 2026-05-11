import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-[#07111f]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/metro-bus.jpg')" }}
      />

      <div className="absolute inset-0 bg-[#07111f]/70" />

      <section className="relative z-10 px-3 py-4 sm:px-6 sm:py-10">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-8">
          <div className="rounded-2xl border border-white/20 bg-white/95 p-4 shadow-2xl sm:rounded-3xl sm:p-8 md:p-10">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-[#1597d3] sm:text-sm">
              Prototype Demo
            </p>

            <h1 className="mt-2 text-3xl font-black leading-[0.95] tracking-tight text-[#07111f] sm:text-5xl md:text-6xl">
              Transit Pick System
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-700 sm:text-lg sm:leading-8">
              A modern digital replacement for paper-based operator picks,
              vacation selection, clerk processing, and presentation boards.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:mt-8 sm:flex sm:flex-wrap sm:gap-4">
              <Link
                href="/login"
                className="rounded-xl bg-[#1597d3] px-4 py-3 text-center text-sm font-extrabold text-white shadow-lg transition hover:bg-[#0f7fb4] sm:rounded-2xl sm:px-6 sm:py-4 sm:text-base"
              >
                Driver / Clerk Sign In
              </Link>

              <Link
                href="/pick"
                className="rounded-xl border-2 border-[#f47b20] bg-white px-4 py-3 text-center text-sm font-extrabold text-[#07111f] transition hover:bg-[#fff3ea] sm:rounded-2xl sm:px-6 sm:py-4 sm:text-base"
              >
                View Driver Pick
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-8 sm:grid-cols-3 sm:gap-4">
              <FeatureCard
                title="Drivers"
                text="Browse work and leave choices."
                color="border-[#1597d3]"
              />

              <FeatureCard
                title="Clerks"
                text="Manage picks and runs."
                color="border-[#f47b20]"
              />

              <FeatureCard
                title="Ready"
                text="Built for uploads and boards."
                color="border-[#52b947]"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/20 bg-[#07111f]/95 p-4 text-white shadow-2xl sm:rounded-3xl sm:p-8 md:p-10">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-[#f7c948] sm:text-sm">
              Vision
            </p>

            <h2 className="mt-2 text-3xl font-black leading-[0.95] sm:text-5xl md:text-6xl">
              Replace paper with a cleaner digital experience
            </h2>

            <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-200 sm:mt-8 sm:space-y-5 sm:text-base sm:leading-7">
              <li>• Drivers review runs and leave ranked choices</li>
              <li>• Clerks manage picks, workers, runs, and submissions</li>
              <li>• Saturday = sky blue, Sunday = pink, Weekday = white</li>
              <li>• Future phases include PDF uploads and live boards</li>
            </ul>

            <div className="mt-4 rounded-xl bg-white/10 p-4 sm:mt-8 sm:rounded-2xl sm:p-5">
              <p className="font-extrabold text-[#b9ecff]">
                Prototype Status
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-200">
                Database-connected demo using staged real run data.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  title,
  text,
  color,
}: {
  title: string;
  text: string;
  color: string;
}) {
  return (
    <div className={`rounded-xl border-l-4 ${color} bg-slate-50 p-3 sm:rounded-2xl sm:p-5`}>
      <h3 className="text-sm font-extrabold text-[#07111f] sm:text-xl">
        {title}
      </h3>
      <p className="mt-1 text-[11px] leading-4 text-slate-600 sm:text-base sm:leading-6">
        {text}
      </p>
    </div>
  );
}