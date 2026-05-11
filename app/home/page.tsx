"use client";

import Link from "next/link";

const pickCards = [
  {
    title: "July 4th Holiday Pick",
    description: "Observed Friday, July 3, 2026 · Saturday service",
    href: "/pick",
    status: "Live Setup",
    active: true,
    color: "border-[#1597d3]",
    glow: "shadow-[#1597d3]/30",
  },
  {
    title: "Fall Pick",
    description: "Seasonal pick coming later",
    href: "#",
    status: "Coming Soon",
    active: false,
    color: "border-slate-300",
    glow: "",
  },
  {
    title: "Labor Day Pick",
    description: "Holiday pick coming later",
    href: "#",
    status: "Coming Soon",
    active: false,
    color: "border-slate-300",
    glow: "",
  },
  {
    title: "Thanksgiving Pick",
    description: "Holiday pick coming later",
    href: "#",
    status: "Coming Soon",
    active: false,
    color: "border-slate-300",
    glow: "",
  },
  {
    title: "Winter Pick",
    description: "Seasonal pick coming later",
    href: "#",
    status: "Coming Soon",
    active: false,
    color: "border-slate-300",
    glow: "",
  },
  {
    title: "Christmas Pick",
    description: "Holiday pick coming later",
    href: "#",
    status: "Coming Soon",
    active: false,
    color: "border-slate-300",
    glow: "",
  },
  {
    title: "New Year Day Pick",
    description: "Holiday pick coming later",
    href: "#",
    status: "Coming Soon",
    active: false,
    color: "border-slate-300",
    glow: "",
  },
  {
    title: "Spring Pick",
    description: "Seasonal pick coming later",
    href: "#",
    status: "Coming Soon",
    active: false,
    color: "border-slate-300",
    glow: "",
  },
  {
    title: "System Pick",
    description: "Full system-wide garage pick coming last",
    href: "#",
    status: "Future Build",
    active: false,
    color: "border-slate-300",
    glow: "",
  },
  {
    title: "Memorial Day Pick",
    description: "Holiday pick coming later",
    href: "#",
    status: "Coming Soon",
    active: false,
    color: "border-slate-300",
    glow: "",
  },
];

export default function DriverHomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07111f]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/metro-bus.jpg')",
        }}
      />

      <div className="absolute inset-0 bg-[#07111f]/78" />

      <section className="relative z-10 px-4 py-5">
        <div className="mx-auto max-w-6xl">
          <header className="mb-5 rounded-3xl border border-white/15 bg-white/95 p-5 shadow-2xl backdrop-blur sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.35em] text-[#1597d3] sm:text-xs">
                  Driver Home
                </p>

                <h1 className="mt-2 text-4xl font-black leading-none text-[#07111f] sm:text-5xl">
                  Available Picks
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                  Active and upcoming picks will appear here. Live picks are
                  automatically pushed to the top.
                </p>
              </div>

              <div className="hidden rounded-2xl bg-[#07111f] px-5 py-4 text-right text-white shadow-lg sm:block">
                <p className="text-xs uppercase tracking-[0.25em] text-[#b9ecff]">
                  Transit Ops
                </p>

                <p className="mt-1 text-xl font-black">
                  Driver Portal
                </p>
              </div>
            </div>
          </header>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pickCards.map((pick) =>
              pick.active ? (
                <Link
                  key={pick.title}
                  href={pick.href}
                  className={`rounded-3xl border-2 ${pick.color} bg-white p-5 shadow-2xl ${pick.glow} transition duration-300 hover:-translate-y-1 hover:scale-[1.01]`}
                >
                  <PickCardContent pick={pick} />
                </Link>
              ) : (
                <div
                  key={pick.title}
                  className="rounded-3xl border border-white/20 bg-white/90 p-5 shadow-lg backdrop-blur"
                >
                  <PickCardContent pick={pick} />
                </div>
              )
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function PickCardContent({
  pick,
}: {
  pick: {
    title: string;
    description: string;
    status: string;
    active: boolean;
  };
}) {
  return (
    <>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div
          className={`rounded-2xl px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] ${
            pick.active
              ? "bg-[#b9ecff] text-[#07111f]"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {pick.status}
        </div>

        <div
          className={`h-4 w-4 rounded-full ${
            pick.active ? "bg-[#52b947]" : "bg-slate-300"
          }`}
        />
      </div>

      <h2 className="text-2xl font-black leading-tight text-[#07111f]">
        {pick.title}
      </h2>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {pick.description}
      </p>

      {pick.active ? (
        <div className="mt-5 rounded-2xl bg-[#1597d3] px-4 py-3 text-center text-sm font-black text-white shadow-lg">
          Open Pick
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-bold text-slate-500">
          {pick.status}
        </div>
      )}
    </>
  );
}