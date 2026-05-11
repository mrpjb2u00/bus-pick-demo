"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, PlusCircle, RefreshCw, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";

type Profile = {
  id: string;
  badge_number: string | null;
  full_name: string | null;
  role: string;
  garage_code: string | null;
  is_active: boolean | null;
};

type Worker = {
  id: string;
  badge_number: string;
  full_name: string;
  garage_code: string;
  worker_type: string;
  seniority_rank: number | null;
  hire_date: string | null;
  is_active: boolean | null;
};

export default function DriversPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [badgeNumber, setBadgeNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [garageCode, setGarageCode] = useState("QG");
  const [seniorityRank, setSeniorityRank] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadWorkers() {
    const { data, error } = await supabase
      .from("workers")
      .select("*")
      .order("seniority_rank", { ascending: true, nullsFirst: false });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setWorkers(data || []);
  }

  useEffect(() => {
    async function loadPage() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError || !profileData) {
        setErrorMessage("No matching user profile was found.");
        setLoading(false);
        return;
      }

      setProfile(profileData);
      await loadWorkers();
      setLoading(false);
    }

    loadPage();
  }, [router]);

  async function handleAddWorker(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");

    const { error } = await supabase.from("workers").insert({
      badge_number: badgeNumber.trim(),
      full_name: fullName.trim(),
      garage_code: garageCode,
      worker_type: "driver",
      seniority_rank: seniorityRank ? Number(seniorityRank) : null,
      hire_date: hireDate || null,
      is_active: true,
    });

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setBadgeNumber("");
    setFullName("");
    setGarageCode("QG");
    setSeniorityRank("");
    setHireDate("");

    await loadWorkers();
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading drivers...
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Profile not found.
      </main>
    );
  }

  return (
    <DashboardLayout profile={profile}>
      <section className="mb-6 flex items-start justify-between gap-6">
        <div>
          <Link
            href="/dashboard/holiday-pick"
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900 mb-4"
          >
            <ArrowLeft size={18} />
            Back to Holiday Pick
          </Link>

          <p className="text-sm uppercase tracking-[0.25em] text-blue-700 font-bold">
            Drivers / Workers
          </p>

          <h2 className="text-3xl font-bold text-slate-950 mt-2">
            Add and Manage Drivers
          </h2>

          <p className="text-slate-600 mt-2">
            Add workers manually now. Later we’ll add PDF upload/import for bulk
            worker lists.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">
            Active Workers
          </p>
          <p className="text-xl font-bold text-slate-950 mt-1">
            {workers.length}
          </p>
        </div>
      </section>

      {errorMessage && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      <section className="grid grid-cols-5 gap-6">
        <div className="col-span-2 rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <PlusCircle className="text-blue-700" />
            <h3 className="text-xl font-bold text-slate-950">
              Add Driver Manually
            </h3>
          </div>

          <form onSubmit={handleAddWorker} className="space-y-4">
            <FormField label="Badge Number">
              <input
                value={badgeNumber}
                onChange={(e) => setBadgeNumber(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Example: 4021"
                required
              />
            </FormField>

            <FormField label="Full Name">
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Example: Paul Browner"
                required
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Garage">
                <select
                  value={garageCode}
                  onChange={(e) => setGarageCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="QG">Queensgate (QG)</option>
                  <option value="BH">Bond Hill (BH)</option>
                </select>
              </FormField>

              <FormField label="Seniority Rank">
                <input
                  value={seniorityRank}
                  onChange={(e) => setSeniorityRank(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-600"
                  type="number"
                  placeholder="1"
                />
              </FormField>
            </div>

            <FormField label="Hire Date">
              <input
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-600"
                type="date"
              />
            </FormField>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-slate-950 px-4 py-3 font-bold text-white hover:bg-slate-800 transition disabled:opacity-60"
            >
              {saving ? "Saving..." : "Add Driver"}
            </button>
          </form>
        </div>

        <div className="col-span-3 rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Users className="text-blue-700" />
              <h3 className="text-xl font-bold text-slate-950">
                Driver List
              </h3>
            </div>

            <button
              onClick={loadWorkers}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left p-3 font-bold">Rank</th>
                  <th className="text-left p-3 font-bold">Badge</th>
                  <th className="text-left p-3 font-bold">Name</th>
                  <th className="text-left p-3 font-bold">Garage</th>
                  <th className="text-left p-3 font-bold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {workers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-6 text-center text-slate-500 font-medium"
                    >
                      No drivers added yet.
                    </td>
                  </tr>
                ) : (
                  workers.map((worker) => (
                    <tr key={worker.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-800">
                        {worker.seniority_rank || "—"}
                      </td>
                      <td className="p-3 text-slate-700">
                        {worker.badge_number}
                      </td>
                      <td className="p-3 font-semibold text-slate-900">
                        {worker.full_name}
                      </td>
                      <td className="p-3 text-slate-700">
                        {worker.garage_code}
                      </td>
                      <td className="p-3">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                          {worker.is_active === false ? "Inactive" : "Active"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}