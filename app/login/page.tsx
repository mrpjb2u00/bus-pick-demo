"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [badge, setBadge] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    if (!badge) {
      alert("Enter badge number");
      return;
    }

    router.push(`/dashboard?badge=${badge}`);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-200 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="mb-6 text-center text-3xl font-bold text-slate-900">
          Driver Login
        </h1>

        <label
          htmlFor="badge"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Badge Number
        </label>

        <input
          id="badge"
          type="number"
          value={badge}
          onChange={(e) => setBadge(e.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
          placeholder="Enter your badge number"
        />

        <button
          onClick={handleLogin}
          className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Login
        </button>
      </div>
    </main>
  );
}