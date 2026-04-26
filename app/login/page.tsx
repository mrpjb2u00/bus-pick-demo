"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [badgeNumber, setBadgeNumber] = useState("");
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const badge = badgeNumber.trim();

    if (!badge) {
      setError("Please enter your badge number.");
      return;
    }

    if (badge === "4021") {
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          badgeNumber: "4021",
          name: "Paul Browner",
          role: "clerk",
          garage: "QG",
        })
      );

      router.push("/dashboard");
      return;
    }

    setError("Badge number not found yet. Drivers will be added by the clerk later.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 text-slate-900">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
          Driver / Clerk Login
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Sign in with badge number
        </h1>

        <p className="mt-3 text-sm text-slate-600">
          Enter your employee badge number to access the pick system.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="badgeNumber"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Badge Number
            </label>

            <input
              id="badgeNumber"
              value={badgeNumber}
              onChange={(e) => setBadgeNumber(e.target.value)}
              inputMode="numeric"
              placeholder="Enter badge number"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 px-5 py-3 text-base font-bold text-white shadow hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </section>
    </main>
  );
}