"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bus,
  CalendarDays,
  ClipboardList,
  FileText,
  FileUp,
  PlusCircle,
  Route,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
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

type PickEvent = {
  id: string;
  title: string;
  pick_type: string;
  service_date: string;
  status: string | null;
};

export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [julyPick, setJulyPick] = useState<PickEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
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

      const { data: pickData } = await supabase
        .from("pick_events")
        .select("*")
        .eq("title", "July 4th Holiday Pick")
        .maybeSingle();

      setProfile(profileData);
      setJulyPick(pickData || null);
      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading dashboard...
      </main>
    );
  }

  if (errorMessage || !profile) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="max-w-xl rounded-2xl bg-white p-8 text-slate-900 shadow-xl">
          <h1 className="text-2xl font-bold mb-3">Profile Issue</h1>
          <p className="text-slate-600">{errorMessage}</p>
        </div>
      </main>
    );
  }

  return (
    <DashboardLayout profile={profile}>
      <section className="mb-5 flex items-start justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-blue-700 font-bold">
            Clerk Dashboard — Vision Build
          </p>
          <h2 className="text-3xl font-bold text-slate-950 mt-2">
            Bus Pick Operations Center
          </h2>
          <p className="text-slate-600 mt-2">
            Manage picks, drivers, runs, submissions, seniority, and upload
            workflows from one desktop command center.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">
            Current Garage
          </p>
          <p className="text-xl font-bold text-slate-950 mt-1">
            Queensgate (QG)
          </p>
        </div>
      </section>

      <section className="grid grid-cols-5 gap-4 mb-5">
        <StatCard
          icon={<CalendarDays />}
          color="text-purple-600"
          title="Active Pick"
          value={julyPick?.title || "2026 July 4th Holiday Pick"}
          detailOne="Queensgate (QG)"
          detailTwo="Service Schedule: Sunday"
          buttonText="Manage Pick"
        />

        <StatCard
          icon={<Users />}
          color="text-blue-600"
          title="Drivers"
          value="412"
          detailOne="Total Drivers"
          detailTwo="QG 231 · BH 181"
          buttonText="View Drivers"
        />

        <StatCard
          icon={<ClipboardList />}
          color="text-green-600"
          title="Submissions"
          value="128 / 412"
          detailOne="Submitted"
          detailTwo="31% complete"
          buttonText="View Submissions"
        />

        <StatCard
          icon={<Bus />}
          color="text-orange-600"
          title="Runs"
          value="652"
          detailOne="Total Runs"
          detailTwo="QG 342 · BH 310"
          buttonText="Manage Runs"
        />

        <StatCard
          icon={<Star />}
          color="text-blue-500"
          title="Seniority"
          value="4021"
          detailOne="Paul Browner"
          detailTwo="Top system access"
          buttonText="View Seniority"
        />
      </section>

      <section className="grid grid-cols-5 gap-5 mb-5">
        <div className="col-span-3 rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-950">
              Recent Activity
            </h3>
            <button className="text-sm font-semibold text-blue-700">
              View All Activity
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left p-3 font-bold">Time</th>
                  <th className="text-left p-3 font-bold">Activity</th>
                  <th className="text-left p-3 font-bold">User</th>
                  <th className="text-left p-3 font-bold">Garage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <ActivityRow
                  time="Today 9:41 AM"
                  activity="Created 2026 July 4th Holiday Pick"
                  user="Paul Browner"
                  garage="QG"
                />
                <ActivityRow
                  time="Today 9:32 AM"
                  activity="Connected super admin profile"
                  user="Paul Browner"
                  garage="QG"
                />
                <ActivityRow
                  time="Today 9:15 AM"
                  activity="Dashboard layout rebuilt"
                  user="System"
                  garage="Both"
                />
                <ActivityRow
                  time="Today 8:58 AM"
                  activity="PDF upload module marked coming soon"
                  user="System"
                  garage="Both"
                />
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-2 rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
          <h3 className="text-xl font-bold text-slate-950 mb-4">
            Pick Progress
          </h3>

          <div className="grid grid-cols-2 gap-5">
            <ProgressBlock garage="Queensgate (QG)" submitted="231" total="231" percent="100" />
            <ProgressBlock garage="Bond Hill (BH)" submitted="85" total="181" percent="47" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-5 gap-5">
        <div className="col-span-3 rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
          <h3 className="text-xl font-bold text-slate-950 mb-4">
            Upcoming Picks
          </h3>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left p-3 font-bold">Pick Name</th>
                  <th className="text-left p-3 font-bold">Type</th>
                  <th className="text-left p-3 font-bold">Garage Scope</th>
                  <th className="text-left p-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <UpcomingPickRow
                  name="2026 July 4th Holiday Pick"
                  type="Holiday"
                  scope="QG first"
                  status={julyPick?.status || "Draft"}
                />
                <UpcomingPickRow
                  name="2026 Fall Pick"
                  type="Fall"
                  scope="Both"
                  status="Planned"
                />
                <UpcomingPickRow
                  name="2026 Winter Pick"
                  type="Winter"
                  scope="Both"
                  status="Planned"
                />
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-2 rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
          <h3 className="text-xl font-bold text-slate-950 mb-4">
            Quick Actions
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <QuickAction icon={<CalendarDays />} label="Create New Pick" />
            <QuickAction icon={<FileUp />} label="Upload Runs PDF" />
            <QuickAction icon={<Route />} label="Add New Run" />
            <QuickAction icon={<PlusCircle />} label="Add Driver" />
            <QuickAction icon={<FileText />} label="Reports" />
            <QuickAction icon={<ShieldCheck />} label="Audit Log" />
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}

function StatCard({
  icon,
  color,
  title,
  value,
  detailOne,
  detailTwo,
  buttonText,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  value: string;
  detailOne: string;
  detailTwo: string;
  buttonText: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
      <div className={`${color} mb-3`}>{icon}</div>
      <h3 className="font-bold text-slate-950 mb-3">{title}</h3>
      <p className="text-2xl font-extrabold text-slate-950 leading-tight">
        {value}
      </p>
      <p className="text-sm text-slate-600 mt-2">{detailOne}</p>
      <p className="text-sm text-slate-500 mt-1">{detailTwo}</p>

      <button className="mt-4 w-full rounded-xl border border-blue-200 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50 transition">
        {buttonText}
      </button>
    </div>
  );
}

function ActivityRow({
  time,
  activity,
  user,
  garage,
}: {
  time: string;
  activity: string;
  user: string;
  garage: string;
}) {
  return (
    <tr className="hover:bg-slate-50">
      <td className="p-3 text-slate-600">{time}</td>
      <td className="p-3 font-medium text-slate-800">{activity}</td>
      <td className="p-3 text-slate-600">{user}</td>
      <td className="p-3 font-bold text-slate-700">{garage}</td>
    </tr>
  );
}

function ProgressBlock({
  garage,
  submitted,
  total,
  percent,
}: {
  garage: string;
  submitted: string;
  total: string;
  percent: string;
}) {
  return (
    <div className="text-center">
      <p className="font-bold text-slate-800 mb-4">{garage}</p>

      <div className="mx-auto h-36 w-36 rounded-full border-[18px] border-blue-500 flex items-center justify-center">
        <div>
          <p className="text-lg font-extrabold text-slate-950">
            {submitted} / {total}
          </p>
          <p className="text-2xl font-extrabold text-slate-950">
            {percent}%
          </p>
        </div>
      </div>

      <div className="mt-4 text-sm text-slate-600">
        <p>Submitted: {submitted}</p>
        <p>Pending: {Number(total) - Number(submitted)}</p>
      </div>
    </div>
  );
}

function UpcomingPickRow({
  name,
  type,
  scope,
  status,
}: {
  name: string;
  type: string;
  scope: string;
  status: string;
}) {
  return (
    <tr className="hover:bg-slate-50">
      <td className="p-3 font-semibold text-slate-800">{name}</td>
      <td className="p-3 text-slate-600">{type}</td>
      <td className="p-3 text-slate-600">{scope}</td>
      <td className="p-3">
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
          {status}
        </span>
      </td>
    </tr>
  );
}

function QuickAction({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center hover:bg-blue-50 hover:border-blue-200 transition">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
        {icon}
      </div>
      <p className="text-sm font-bold text-slate-800">{label}</p>
    </button>
  );
}