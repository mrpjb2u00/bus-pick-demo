"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Profile = {
  full_name: string | null;
  role: string;
  garage_code: string | null;
  badge_number: string | null;
};

export default function TopBar({ profile }: { profile: Profile }) {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="h-auto md:h-20 bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome, {profile.full_name || "Admin"}
        </h1>
        <p className="text-sm text-slate-500">
          Badge {profile.badge_number || "N/A"} · Clerk/Admin Dashboard
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-semibold text-cyan-800">
          {profile.role}
        </span>

        <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
          Garage: {profile.garage_code || "N/A"}
        </span>

        <button
          onClick={handleLogout}
          className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}