"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [badgeNumber, setBadgeNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");

    try {
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("badge_number", badgeNumber)
        .single();

      if (profileError || !profileData) {
        setErrorMessage("Badge number not found.");
        setLoading(false);
        return;
      }

      const email =
        profileData.email ||
        `${profileData.badge_number}@transitops.local`;

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setErrorMessage(authError.message);
        setLoading(false);
        return;
      }

      if (
        profileData.role === "driver" ||
        profileData.role === "worker"
      ) {
        router.push("/pick");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setErrorMessage("Something went wrong.");
    }

    setLoading(false);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07111f]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/metro-bus.jpg')",
        }}
      />

      <div className="absolute inset-0 bg-[#07111f]/75" />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur sm:p-8">
          <div className="mb-6 text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.35em] text-[#1597d3] sm:text-xs">
              Transit Ops
            </p>

            <h1 className="mt-3 text-4xl font-black leading-none text-[#07111f]">
              Bus Pick
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Sign in using your badge number and password.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.25em] text-slate-500">
                Badge Number
              </label>

              <input
                type="text"
                value={badgeNumber}
                onChange={(e) => setBadgeNumber(e.target.value)}
                placeholder="Enter badge number"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-950 outline-none transition focus:border-[#1597d3] focus:ring-4 focus:ring-[#1597d3]/20"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.25em] text-slate-500">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-950 outline-none transition focus:border-[#1597d3] focus:ring-4 focus:ring-[#1597d3]/20"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#1597d3] px-5 py-4 text-base font-extrabold text-white shadow-lg transition hover:bg-[#0f7fb4] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 rounded-2xl bg-[#07111f] p-4 text-white">
            <p className="text-sm font-extrabold text-[#b9ecff]">
              Demo Access
            </p>

            <div className="mt-3 space-y-2 text-sm text-slate-200">
              <p>
                <span className="font-bold text-white">Driver:</span> Routes,
                choices, and pick order
              </p>

              <p>
                <span className="font-bold text-white">Clerk/Admin:</span>{" "}
                Dashboard, runs, workers, and pick management
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}