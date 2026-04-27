"use client";

import AppNav from "@/components/AppNav";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Driver = {
  id: string;
  badge_number: string;
  full_name: string;
  garage: "QG" | "BH";
  hire_date: string;
  role: string;
  is_active: boolean;
};

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  const [badgeNumber, setBadgeNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [garage, setGarage] = useState<"QG" | "BH">("QG");
  const [hireDate, setHireDate] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
  const user = localStorage.getItem("currentUser");

  if (!user) {
    window.location.href = "/login";
    return;
  }

  const parsedUser = JSON.parse(user);

  if (parsedUser.role !== "clerk") {
    window.location.href = "/runs";
    return;
  }

  setCurrentUser(parsedUser);
  loadDrivers();
}, []);

  async function loadDrivers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .eq("is_active", true)
      .not("full_name", "is", null)
      .neq("full_name", "")
      .order("hire_date", { ascending: true })
      .order("full_name", { ascending: true });

    if (error) {
      setMessage(error.message);
      setDrivers([]);
    } else {
      setDrivers((data ?? []) as Driver[]);
    }

    setLoading(false);
  }

  async function addDriver(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (!badgeNumber.trim() || !fullName.trim() || !hireDate) {
      setMessage("Please fill out all driver fields.");
      return;
    }

    const { error } = await supabase.from("drivers").insert({
      badge_number: badgeNumber.trim(),
      full_name: fullName.trim(),
      garage,
      hire_date: hireDate,
      role: "driver",
      is_active: true,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setBadgeNumber("");
    setFullName("");
    setGarage("QG");
    setHireDate("");
    setMessage("Driver added successfully.");
    loadDrivers();
  }

  async function deleteDriver(id: string, badgeNumber: string) {
    if (badgeNumber === "4021") {
      setMessage("The clerk/admin account cannot be deleted.");
      return;
    }

    const confirmed = confirm("Delete this driver?");
    if (!confirmed) return;

    const { error } = await supabase.from("drivers").delete().eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Driver deleted successfully.");
    loadDrivers();
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-900 sm:p-6">
  <AppNav />
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold">Clerk Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">
            Logged in as: {currentUser?.name || "Unknown"}
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <a
            href="/runs"
            className="rounded-xl bg-blue-600 p-4 font-bold text-white shadow hover:bg-blue-700"
          >
            View Runs / Pick Board
          </a>

          <a
            href="/seniority"
            className="rounded-xl bg-slate-900 p-4 font-bold text-white shadow hover:bg-slate-800"
          >
            View Seniority List
          </a>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold">Add Driver</h2>

          <form onSubmit={addDriver} className="mt-4 grid gap-4 sm:grid-cols-2">
            <input
              value={badgeNumber}
              onChange={(e) => setBadgeNumber(e.target.value)}
              placeholder="Badge Number"
              className="rounded-xl border border-slate-300 bg-white p-3 text-slate-900"
            />

            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              className="rounded-xl border border-slate-300 bg-white p-3 text-slate-900"
            />

            <select
              value={garage}
              onChange={(e) => setGarage(e.target.value as "QG" | "BH")}
              className="rounded-xl border border-slate-300 bg-white p-3 text-slate-900"
            >
              <option value="QG">Queensgate</option>
              <option value="BH">Bond Hill</option>
            </select>

            <input
              type="date"
              value={hireDate}
              onChange={(e) => setHireDate(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white p-3 text-slate-900"
            />

            <button
              type="submit"
              className="col-span-full rounded-xl bg-green-600 p-3 font-bold text-white hover:bg-green-700"
            >
              Add Driver
            </button>
          </form>

          {message && (
            <p className="mt-4 rounded-xl bg-slate-100 p-3 text-sm font-semibold text-slate-700">
              {message}
            </p>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold">Seniority List</h2>

          {loading ? (
            <p className="mt-4 text-slate-600">Loading drivers...</p>
          ) : drivers.length === 0 ? (
            <p className="mt-4 text-slate-600">No drivers added yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-600">
                    <th className="p-2">#</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Badge</th>
                    <th className="p-2">Garage</th>
                    <th className="p-2">Hire Date</th>
                    <th className="p-2">Role</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {drivers.map((driver, index) => (
                    <tr key={driver.id} className="border-b">
                      <td className="p-2 font-bold">{index + 1}</td>
                      <td className="p-2">{driver.full_name}</td>
                      <td className="p-2">{driver.badge_number}</td>
                      <td className="p-2">{driver.garage}</td>
                      <td className="p-2">{driver.hire_date}</td>
                      <td className="p-2 capitalize">{driver.role}</td>
                      <td className="p-2">
                        {driver.badge_number === "4021" ? (
                          <span className="text-xs font-semibold text-slate-400">
                            Protected
                          </span>
                        ) : (
                          <button
                            onClick={() =>
                              deleteDriver(driver.id, driver.badge_number)
                            }
                            className="rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}