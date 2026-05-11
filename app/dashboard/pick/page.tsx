"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  ListChecks,
  Route,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
  badge_number: string;
  full_name: string;
  garage_code: string;
  seniority_rank: number | null;
};

type PickEvent = {
  id: string;
  title: string;
  pick_type: string | null;
  service_schedule: string;
};

type PickAssignment = {
  id: string;
  pick_date: string;
  pick_time: string;
  pick_status: string;
  workers: Worker | null;
};

type Run = {
  id: string;
  garage_code: string;
  run_number: string;
  route: string | null;
  block: string | null;
  on_location: string | null;
  on_time: string | null;
  off_time: string | null;
  off_location: string | null;
  piece_time: string | null;
  platform_time: string | null;
  total_time: string | null;
  spread_pay: string | null;
  markup_time: string | null;
  line_premium: string | null;
  run_category: string;
  service_schedule: string;
  is_active: boolean | null;
};

type ViewMode = "pick-list" | "runs";
type RunFilter = "all" | "day" | "late" | "split" | "extra";

function normalizeWorker(workerValue: unknown): Worker | null {
  if (!workerValue) return null;

  if (Array.isArray(workerValue)) {
    return (workerValue[0] as Worker) || null;
  }

  return workerValue as Worker;
}

function normalizeAssignment(item: any): PickAssignment {
  return {
    id: item.id,
    pick_date: item.pick_date,
    pick_time: item.pick_time,
    pick_status: item.pick_status,
    workers: normalizeWorker(item.workers),
  };
}

export default function DashboardPickPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [pickEvent, setPickEvent] = useState<PickEvent | null>(null);
  const [assignments, setAssignments] = useState<PickAssignment[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("pick-list");
  const [activeFilter, setActiveFilter] = useState<RunFilter>("all");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const userGarage = profile?.garage_code || "QG";
  const isSystemPick = pickEvent?.pick_type === "system";
  const isSaturday = pickEvent?.service_schedule === "saturday";

  const visibleRuns = useMemo(() => {
    if (isSystemPick) return runs;
    return runs.filter((run) => run.garage_code === userGarage);
  }, [runs, isSystemPick, userGarage]);

  const filteredRuns = useMemo(() => {
    if (activeFilter === "all") return visibleRuns;
    return visibleRuns.filter((run) => run.run_category === activeFilter);
  }, [visibleRuns, activeFilter]);

  useEffect(() => {
    async function loadPage() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError || !profileData) {
        setErrorMessage("Could not load your profile.");
        setLoading(false);
        return;
      }

      const { data: pickData, error: pickError } = await supabase
        .from("pick_events")
        .select("*")
        .eq("title", "July 4th Holiday Pick")
        .maybeSingle();

      setProfile(profileData as Profile);

      if (pickError || !pickData) {
        setErrorMessage("Could not load the July 4th Holiday Pick.");
        setLoading(false);
        return;
      }

      setPickEvent(pickData as PickEvent);

      const garageCode = profileData.garage_code || "QG";
      const isSystem = pickData.pick_type === "system";

      const { data: assignmentData, error: assignmentError } = await supabase
        .from("pick_assignments")
        .select(
          `
          id,
          pick_date,
          pick_time,
          pick_status,
          workers (
            badge_number,
            full_name,
            garage_code,
            seniority_rank
          )
        `
        )
        .eq("pick_event_id", pickData.id)
        .order("pick_date", { ascending: true })
        .order("pick_time", { ascending: true });

      if (assignmentError) {
        setErrorMessage(assignmentError.message);
        setLoading(false);
        return;
      }

      const normalizedAssignments = (assignmentData || []).map((item) =>
        normalizeAssignment(item)
      );

      const visibleAssignments = normalizedAssignments.filter(
        (assignment) =>
          isSystem || assignment.workers?.garage_code === garageCode
      );

      setAssignments(visibleAssignments);

      const { data: runData, error: runError } = await supabase
        .from("runs")
        .select("*")
        .eq("pick_event_id", pickData.id);

      if (runError) {
        setErrorMessage(runError.message);
        setLoading(false);
        return;
      }

      const sortedRuns = [...((runData || []) as Run[])].sort((a, b) => {
        const aRun = Number(a.run_number);
        const bRun = Number(b.run_number);

        if (Number.isNaN(aRun) || Number.isNaN(bRun)) {
          return String(a.run_number).localeCompare(String(b.run_number));
        }

        return aRun - bRun;
      });

      setRuns(sortedRuns);
      setLoading(false);
    }

    loadPage();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#07111f] text-white flex items-center justify-center">
        Loading pick preview...
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#07111f] text-white flex items-center justify-center">
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
            className="mb-4 inline-flex items-center gap-2 text-sm font-black text-[#1597d3]"
          >
            <ArrowLeft size={18} />
            Back to Holiday Pick
          </Link>

          <p className="text-sm uppercase tracking-[0.25em] text-[#1597d3] font-black">
            Clerk Pick Preview
          </p>

          <h1 className="mt-2 text-4xl font-black text-[#07111f]">
            {pickEvent?.title || "July 4th Holiday Pick"}
          </h1>

          <p className="mt-3 max-w-3xl text-slate-600">
            Preview the driver pick list and available runs for your garage.
            Drivers only see their assigned garage unless this is a System Pick.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-right shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-black">
            Your Garage
          </p>
          <p className="mt-1 text-2xl font-black text-[#07111f]">
            {profile.garage_code || "N/A"}
          </p>
        </div>
      </section>

      {errorMessage && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {errorMessage}
        </div>
      )}

      <section className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <InfoCard
          icon={<CalendarDays />}
          label="Pick Date"
          value="July 3, 2026"
          detail="Observed holiday date"
        />
        <InfoCard
          icon={<Clock />}
          label="Schedule"
          value={pickEvent?.service_schedule || "Saturday"}
          detail="Saturday service"
        />
        <InfoCard
          icon={<ListChecks />}
          label="Pick Assignments"
          value={String(assignments.length)}
          detail="Visible for your garage"
        />
        <InfoCard
          icon={<Route />}
          label="Available Runs"
          value={String(visibleRuns.length)}
          detail="Visible for your garage"
        />
      </section>

      <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex w-fit gap-2">
          <button
            onClick={() => setViewMode("pick-list")}
            className={`rounded-xl px-5 py-3 text-sm font-black ${
              viewMode === "pick-list"
                ? "bg-[#07111f] text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Pick List
          </button>

          <button
            onClick={() => setViewMode("runs")}
            className={`rounded-xl px-5 py-3 text-sm font-black ${
              viewMode === "runs"
                ? "bg-[#07111f] text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Runs
          </button>
        </div>
      </section>

      {viewMode === "pick-list" ? (
        <PickListTable assignments={assignments} />
      ) : (
        <RunsPreview
          isSaturday={isSaturday}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          visibleRuns={visibleRuns}
          filteredRuns={filteredRuns}
          garageCode={profile.garage_code || "QG"}
        />
      )}
    </DashboardLayout>
  );
}

function InfoCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
      <div className="text-[#1597d3]">{icon}</div>
      <p className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-[#07111f]">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{detail}</p>
    </div>
  );
}

function PickListTable({
  assignments,
}: {
  assignments: PickAssignment[];
}) {
  return (
    <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
      <h2 className="text-2xl font-black text-[#07111f]">Pick List</h2>
      <p className="mt-1 text-sm text-slate-600">
        Drivers are listed in scheduled pick order.
      </p>

      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3 text-left font-black">Pick Time</th>
              <th className="p-3 text-left font-black">Driver</th>
              <th className="p-3 text-left font-black">Badge</th>
              <th className="p-3 text-left font-black">Garage</th>
              <th className="p-3 text-left font-black">Seniority</th>
              <th className="p-3 text-left font-black">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {assignments.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  No drivers are scheduled for this pick yet.
                </td>
              </tr>
            ) : (
              assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td className="p-3 font-bold text-slate-900">
                    {formatDate(assignment.pick_date)} ·{" "}
                    {formatTime(assignment.pick_time)}
                  </td>
                  <td className="p-3 font-semibold text-slate-900">
                    {assignment.workers?.full_name || "Unknown Driver"}
                  </td>
                  <td className="p-3 text-slate-700">
                    {assignment.workers?.badge_number || "—"}
                  </td>
                  <td className="p-3 text-slate-700">
                    {assignment.workers?.garage_code || "—"}
                  </td>
                  <td className="p-3 text-slate-700">
                    {assignment.workers?.seniority_rank || "—"}
                  </td>
                  <td className="p-3">
                    <span className={statusClass(assignment.pick_status)}>
                      {formatStatus(assignment.pick_status)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RunsPreview({
  isSaturday,
  activeFilter,
  setActiveFilter,
  visibleRuns,
  filteredRuns,
  garageCode,
}: {
  isSaturday: boolean;
  activeFilter: RunFilter;
  setActiveFilter: (filter: RunFilter) => void;
  visibleRuns: Run[];
  filteredRuns: Run[];
  garageCode: string;
}) {
  return (
    <section
      className={`rounded-2xl border p-5 shadow-sm ${
        isSaturday
          ? "border-[#1597d3] bg-[#dff6ff]"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#07111f]">
            Available Runs
          </h2>
          <p className="mt-1 text-sm text-slate-700">
            Full run sheet preview for {garageCode}.
          </p>
        </div>

        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value as RunFilter)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-[#07111f]"
        >
          <option value="all">All ({visibleRuns.length})</option>
          <option value="day">
            Day ({visibleRuns.filter((run) => run.run_category === "day").length})
          </option>
          <option value="late">
            Late ({visibleRuns.filter((run) => run.run_category === "late").length})
          </option>
          <option value="split">
            Split ({visibleRuns.filter((run) => run.run_category === "split").length})
          </option>
          <option value="extra">
            Extra ({visibleRuns.filter((run) => run.run_category === "extra").length})
          </option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white">
        <table className="w-full min-w-[1000px] text-xs">
          <thead className="border-b-2 border-slate-900 bg-white">
            <tr>
              <th className="px-3 py-3 text-left font-black">RUN</th>
              <th className="px-3 py-3 text-left font-black">RTE</th>
              <th className="px-3 py-3 text-left font-black">BLK</th>
              <th className="px-3 py-3 text-left font-black">ON LOC</th>
              <th className="px-3 py-3 text-left font-black">ON TIME</th>
              <th className="px-3 py-3 text-left font-black">OFF TIME</th>
              <th className="px-3 py-3 text-left font-black">OFF LOC</th>
              <th className="px-3 py-3 text-left font-black">PIECE</th>
              <th className="px-3 py-3 text-left font-black">PLATF</th>
              <th className="px-3 py-3 text-left font-black">TOTAL</th>
              <th className="px-3 py-3 text-left font-black">TYPE</th>
              <th className="px-3 py-3 text-left font-black">STATUS</th>
            </tr>
          </thead>

          <tbody>
            {filteredRuns.length === 0 ? (
              <tr>
                <td colSpan={12} className="p-6 text-center text-slate-500">
                  No runs found.
                </td>
              </tr>
            ) : (
              filteredRuns.map((run) => (
                <tr key={run.id} className="border-b border-slate-200">
                  <td className="px-3 py-3 font-black">{run.run_number}</td>
                  <td className="px-3 py-3">{run.route || "—"}</td>
                  <td className="px-3 py-3">{run.block || "—"}</td>
                  <td className="px-3 py-3">{run.on_location || "—"}</td>
                  <td className="px-3 py-3">{run.on_time || "—"}</td>
                  <td className="px-3 py-3">{run.off_time || "—"}</td>
                  <td className="px-3 py-3">{run.off_location || "—"}</td>
                  <td className="px-3 py-3">{run.piece_time || "—"}</td>
                  <td className="px-3 py-3">{run.platform_time || "—"}</td>
                  <td className="px-3 py-3 font-bold">{run.total_time || "—"}</td>
                  <td className="px-3 py-3">{formatCategory(run.run_category)}</td>
                  <td className="px-3 py-3">
                    {run.is_active === false ? (
                      <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-black text-slate-700">
                        Taken
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                        Available
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value: string) {
  const [hour, minute] = value.split(":");
  const date = new Date();
  date.setHours(Number(hour), Number(minute));

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatStatus(status: string) {
  if (status === "scheduled") return "Scheduled";
  if (status === "picking") return "Picking";
  if (status === "completed") return "Completed";
  if (status === "skipped") return "Skipped";
  if (status === "missed") return "Missed";
  return status;
}

function statusClass(status: string) {
  if (status === "picking") {
    return "rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700";
  }

  if (status === "completed") {
    return "rounded-full bg-slate-200 px-3 py-1 text-xs font-black text-slate-700";
  }

  if (status === "skipped" || status === "missed") {
    return "rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700";
  }

  return "rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700";
}

function formatCategory(category: string) {
  if (category === "day") return "Day Run";
  if (category === "late") return "Late Run";
  if (category === "split") return "Split Run";
  if (category === "extra") return "Extra";
  return category;
}