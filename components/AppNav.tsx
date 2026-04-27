"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AppNav() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

  const isClerk = currentUser?.role === "clerk";

  function logout() {
    localStorage.removeItem("currentUser");
    router.push("/login");
  }

  const links = (
    <>
      <Link href="/" className="rounded-lg px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100">
        Home
      </Link>

      <Link href="/runs" className="rounded-lg px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100">
        Runs
      </Link>

      <Link href="/seniority" className="rounded-lg px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100">
        Seniority
      </Link>

      {isClerk && (
        <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100">
          Dashboard
        </Link>
      )}
    </>
  );

  return (
    <nav className="mb-4 rounded-2xl bg-white p-4 shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900">
            Pick System
          </p>
          {currentUser && (
            <p className="text-xs text-slate-500">
              {currentUser.full_name || currentUser.name} • {currentUser.garage}
            </p>
          )}
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          {links}

          <button
            onClick={logout}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white sm:hidden"
        >
          Menu
        </button>
      </div>

      {menuOpen && (
        <div className="mt-4 grid gap-2 border-t pt-4 sm:hidden">
          {links}

          <button
            onClick={logout}
            className="rounded-lg bg-red-600 px-4 py-2 text-left text-sm font-bold text-white"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}