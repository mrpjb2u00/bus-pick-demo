"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, ListChecks, Route } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";

type Profile = {
  id: string;
  badge_number: string | null;
  full_name: string | null;
  role: string;
  garage_code: string | null;
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
  workers: {
    badge_number: string;
    full_name: string;
    garage_code: string;
    seniority_rank: number | null;
  } | null;
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

export default function PickPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [pickEvent, setPickEvent] = useState<PickEvent | null>(null);
  const [assignments, setAssignments] = useState<PickAssignment[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("pick-list");
  const [activeFilter, setActiveFilter] = useState<RunFilter>("all");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const isSystemPick = pickEvent?.pick_type === "system";
  const userGarage = profile?.garage_code || "QG";
  const isSaturday = pickEvent?.service_schedule === "saturday";

  const visibleRuns = useMemo(() => {
    if (isSystemPick) return runs;
    return runs.filter((run) => run.garage_code === userGarage);
  }, [runs, isSystemPick, userGarage]);

  const filteredRuns = useMemo(() => {
    if (activeFilter === "all") return visibleRuns;
    return visibleRuns.filter((run) => run.run_category === activeFilter);
  }, [visibleRuns, activeFilter]);

  const qgRuns = useMemo(
    () => filteredRuns.filter((run) => run.garage_code === "QG"),
    [filteredRuns]
  );

  const bhRuns = useMemo(
    () => filteredRuns.filter((run) => run.garage_code === "BH"),
    [filteredRuns]
  );

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

      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profileData) {
        setErrorMessage("Could not load your profile.");
        setLoading(false);
        return;
      }

      const { data: pickData } = await supabase
        .from("pick_events")
        .select("*")
        .eq("title", "July 4th Holiday Pick")
        .maybeSingle();

      setProfile(profileData);
      setPickEvent(pickData || null);

      if (pickData?.id) {
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
        } else {
          const isSystem = pickData.pick_type === "system";
          const userGarageCode = profileData.garage_code || "QG";

          const visibleAssignments = (assignmentData || []).filter(
            (assignment) =>
              isSystem ||
              assignment.workers?.garage_code === userGarageCode
          );

          setAssignments(visibleAssignments as PickAssignment[]);
        }

        const { data: runData, error: runError } = await supabase
          .from("runs")
          .select("*")
          .eq("pick_event_id", pickData.id);

        if (runError) {
          setErrorMessage(runError.message);
        } else {
          const sortedRuns = [...(runData || [])].sort((a, b) => {
            const garageCompare = a.garage_code.localeCompare(b.garage_code);
            if (garageCompare !== 0) return garageCompare;

            const aRun = Number(a.run_number);
            const bRun = Number(b.run_number);

            if (Number.isNaN(aRun) || Number.isNaN(bRun)) {
              return String(a.run_number).localeCompare(String(b.run_number));
            }

            return aRun - bRun;
          });

          setRuns(sortedRuns as Run[]);
        }
      }

      setLoading(false);
    }

    loadPage();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading pick screen...
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Error loading profile.
      </main>
    );
  }

  return (
    <DashboardLayout profile={profile}>
      <section className="mb-6 flex items-start justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-blue-700 font-bold">
            Driver Pick Screen
          </p>

          <h2 className="text-3xl font-bold text-slate-950 mt-2">
            {pickEvent?.title || "No Upcoming Pick"}
          </h2>

          <p className="text-slate-600 mt-2">
            View pick order and available runs. Drivers only see their assigned
            garage unless this is a System Pick.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">
            Your Garage
          </p>
          <p className="text-xl font-bold text-slate-950 mt-1">
            {profile.garage_code || "N/A"}
          </p>
        </div>
      </section>

      {errorMessage && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      {!pickEvent ? (
        <section className="flex items-center justify-center min-h-[55vh]">
          <div className="max-w-xl rounded-2xl bg-white p-8 shadow-sm border border-slate-200 text-center">
            <h2 className="text-2xl font-bold text-slate-950">
              No Upcoming Pick
            </h2>

            <p className="text-slate-600 mt-3">
              No upcoming pick is currently available. Please check back later or
              contact the clerk.
            </p>
          </div>
        </section>
      ) : (
        <>
          <section className="mb-5 grid grid-cols-4 gap-5">
            <InfoCard
              icon={<CalendarDays />}
              label="Pick Date"
              value="July 3, 2026"
              detail="Observed holiday date"
            />

            <InfoCard
              icon={<Clock />}
              label="Schedule"
              value={pickEvent.service_schedule || "Saturday"}
              detail="Saturday runs use sky-blue styling"
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

          <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm inline-flex gap-2">
            <button
              onClick={() => setViewMode("pick-list")}
              className={`rounded-xl px-5 py-3 text-sm font-bold transition ${
                viewMode === "pick-list"
                  ? "bg-slate-950 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Pick List
            </button>

            <button
              onClick={() => setViewMode("runs")}
              className={`rounded-xl px-5 py-3 text-sm font-bold transition ${
                viewMode === "runs"
                  ? "bg-slate-950 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Runs
            </button>
          </section>

          {viewMode === "pick-list" ? (
            <PickListTable assignments={assignments} />
          ) : (
            <RunsView
              isSaturday={isSaturday}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              visibleRuns={visibleRuns}
              qgRuns={qgRuns}
              bhRuns={bhRuns}
              userGarage={userGarage}
              isSystemPick={isSystemPick}
            />
          )}
        </>
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
      <div className="mb-3 text-blue-700">{icon}</div>
      <p className="text-sm font-bold text-slate-600">{label}</p>
      <p className="text-2xl font-extrabold text-slate-950 mt-2">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{detail}</p>
    </div>
  );
}

function PickListTable({ assignments }: { assignments: PickAssignment[] }) {
  return (
    <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
      <div className="mb-5">
        <h3 className="text-xl font-bold text-slate-950">Pick List</h3>
        <p className="text-sm text-slate-600 mt-1">
          Drivers are listed in scheduled pick order.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left p-3 font-bold">Pick Time</th>
              <th className="text-left p-3 font-bold">Driver</th>
              <th className="text-left p-3 font-bold">Badge</th>
              <th className="text-left p-3 font-bold">Garage</th>
              <th className="text-left p-3 font-bold">Seniority</th>
              <th className="text-left p-3 font-bold">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {assignments.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-slate-500 font-medium"
                >
                  No drivers are scheduled for this pick yet.
                </td>
              </tr>
            ) : (
              assignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-slate-50">
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
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
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

function RunsView({
  isSaturday,
  activeFilter,
  setActiveFilter,
  visibleRuns,
  qgRuns,
  bhRuns,
  userGarage,
  isSystemPick,
}: {
  isSaturday: boolean;
  activeFilter: RunFilter;
  setActiveFilter: (filter: RunFilter) => void;
  visibleRuns: Run[];
  qgRuns: Run[];
  bhRuns: Run[];
  userGarage: string;
  isSystemPick: boolean;
}) {
  return (
    <section
      className={`rounded-2xl border shadow-sm p-6 ${
        isSaturday ? "bg-sky-100 border-sky-300" : "bg-white border-slate-200"
      }`}
    >
      <div className="mb-5">
        <h3 className="text-xl font-bold text-slate-950">Available Runs</h3>
        <p className="text-sm text-slate-700 mt-1">
          Full run sheet view. Admin controls are hidden from the driver view.
        </p>
      </div>

      <RunFilterBar
        activeFilter={activeFilter}
        onChange={setActiveFilter}
        runs={visibleRuns}
      />

      <div className="mt-5 space-y-6">
        {(isSystemPick || userGarage === "QG") && (
          <RunSheetSection
            title="Runs List Queensgate Saturday"
            garageLabel="Queensgate Division"
            garageCode="QG"
            runs={qgRuns}
            isSaturday={isSaturday}
            activeFilter={activeFilter}
          />
        )}

        {(isSystemPick || userGarage === "BH") && (
          <RunSheetSection
            title="Runs List Bond Hill Saturday"
            garageLabel="Bond Hill Division"
            garageCode="BH"
            runs={bhRuns}
            isSaturday={isSaturday}
            activeFilter={activeFilter}
          />
        )}
      </div>
    </section>
  );
}

function RunFilterBar({
  activeFilter,
  onChange,
  runs,
}: {
  activeFilter: RunFilter;
  onChange: (filter: RunFilter) => void;
  runs: Run[];
}) {
  const filters: { label: string; value: RunFilter }[] = [
    { label: "All", value: "all" },
    { label: "Day Runs", value: "day" },
    { label: "Late Runs", value: "late" },
    { label: "Split Runs", value: "split" },
    { label: "Extras", value: "extra" },
  ];

  function countFor(filter: RunFilter) {
    if (filter === "all") return runs.length;
    return runs.filter((run) => run.run_category === filter).length;
  }

  return (
    <div className="rounded-2xl border border-slate-300 bg-white p-3">
      <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500">
        Filter Runs
      </p>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.value;

          return (
            <button
              key={filter.value}
              onClick={() => onChange(filter.value)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                isActive
                  ? "bg-slate-950 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {filter.label} ({countFor(filter.value)})
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RunSheetSection({
  title,
  garageLabel,
  garageCode,
  runs,
  isSaturday,
  activeFilter,
}: {
  title: string;
  garageLabel: string;
  garageCode: string;
  runs: Run[];
  isSaturday: boolean;
  activeFilter: RunFilter;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-white">
      <div
        className={`px-4 py-3 border-b border-slate-300 ${
          isSaturday ? "bg-sky-200" : "bg-slate-100"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-extrabold text-slate-950 uppercase tracking-[0.2em] text-sm">
              {title}
            </p>
            <p className="text-sm text-slate-700 mt-1">
              Southwest Ohio Regional Transit Authority / METRO / {garageLabel}
            </p>
          </div>

          <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-slate-700 border border-slate-300">
            {garageCode}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1350px] text-xs">
          <thead className="bg-slate-50 text-slate-700 border-b border-slate-300">
            <tr>
              <th className="p-2 text-left font-extrabold">RUN</th>
              <th className="p-2 text-left font-extrabold">RTE</th>
              <th className="p-2 text-left font-extrabold">BLK</th>
              <th className="p-2 text-left font-extrabold">ON LOC</th>
              <th className="p-2 text-left font-extrabold">ON TIME</th>
              <th className="p-2 text-left font-extrabold">OFF TIME</th>
              <th className="p-2 text-left font-extrabold">OFF LOC</th>
              <th className="p-2 text-left font-extrabold">PIECE</th>
              <th className="p-2 text-left font-extrabold">PLATF</th>
              <th className="p-2 text-left font-extrabold">TOTAL</th>
              <th className="p-2 text-left font-extrabold">SPREAD</th>
              <th className="p-2 text-left font-extrabold">MKUP</th>
              <th className="p-2 text-left font-extrabold">LINE PREM</th>
              <th className="p-2 text-left font-extrabold">TYPE</th>
              <th className="p-2 text-left font-extrabold">STATUS</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {runs.length === 0 ? (
              <tr>
                <td
                  colSpan={15}
                  className="p-6 text-center text-slate-500 font-medium"
                >
                  No {garageCode} {filterLabel(activeFilter)} runs found.
                </td>
              </tr>
            ) : (
              runs.map((run) => (
                <tr key={run.id} className="hover:bg-sky-50">
                  <td className="p-2 font-extrabold text-slate-950">
                    {run.run_number}
                  </td>
                  <td className="p-2 text-slate-800">{run.route || "—"}</td>
                  <td className="p-2 text-slate-800">{run.block || "—"}</td>
                  <td className="p-2 text-slate-800">
                    {run.on_location || "—"}
                  </td>
                  <td className="p-2 text-slate-800">{run.on_time || "—"}</td>
                  <td className="p-2 text-slate-800">{run.off_time || "—"}</td>
                  <td className="p-2 text-slate-800">
                    {run.off_location || "—"}
                  </td>
                  <td className="p-2 text-slate-800">
                    {run.piece_time || "—"}
                  </td>
                  <td className="p-2 text-slate-800">
                    {run.platform_time || "—"}
                  </td>
                  <td className="p-2 font-bold text-slate-900">
                    {run.total_time || "—"}
                  </td>
                  <td className="p-2 text-slate-800">
                    {run.spread_pay || "—"}
                  </td>
                  <td className="p-2 text-slate-800">
                    {run.markup_time || "—"}
                  </td>
                  <td className="p-2 text-slate-800">
                    {run.line_premium || "—"}
                  </td>
                  <td className="p-2">
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-[11px] font-bold text-blue-700">
                      {formatCategory(run.run_category)}
                    </span>
                  </td>
                  <td className="p-2">
                    <span className="rounded-full bg-green-100 px-2 py-1 text-[11px] font-bold text-green-700">
                      {run.is_active === false ? "Inactive" : "Active"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value: string) {
  const [hourString, minuteString] = value.split(":");
  const date = new Date();
  date.setHours(Number(hourString));
  date.setMinutes(Number(minuteString));
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

function formatCategory(category: string) {
  if (category === "day") return "Day Run";
  if (category === "late") return "Late Run";
  if (category === "split") return "Split Run";
  if (category === "extra") return "Extra";
  return category;
}

function filterLabel(filter: RunFilter) {
  if (filter === "all") return "";
  if (filter === "day") return "Day";
  if (filter === "late") return "Late";
  if (filter === "split") return "Split";
  if (filter === "extra") return "Extra";
  return "";
}