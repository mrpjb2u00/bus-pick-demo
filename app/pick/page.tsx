"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  ListChecks,
  Route,
  Trash2,
  UserCheck,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

type Assignment = {
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
};

type BoardTime = {
  id: string;
  show_up_time: string;
  label: string | null;
};

type BoardSlot = {
  id: string;
  board_time_id: string;
  slot_number: number;
  selection_status: string;
  selected_driver_name: string | null;
  selected_badge_number: string | null;
};

type PickLimit = {
  be_off_total_slots: number;
  be_off_used_slots: number;
  standby_total_slots: number;
  standby_used_slots: number;
};

type Choice = {
  id: string;
  choice_rank: number;
  choice_type: "run" | "board_slot" | "be_off" | "standby";
  run_id: string | null;
  board_slot_id: string | null;
  choice_label: string | null;
  runs: Run | null;
  holiday_board_slots: BoardSlot | null;
};

type MainTab = "pick-list" | "runs" | "board" | "be-off" | "standby";
type RunFilter = "all" | "day" | "late" | "split" | "extra";
type RunViewMode = "compact" | "readable";

export default function DriverPickPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [pickEvent, setPickEvent] = useState<PickEvent | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [boardTimes, setBoardTimes] = useState<BoardTime[]>([]);
  const [boardSlots, setBoardSlots] = useState<BoardSlot[]>([]);
  const [pickLimit, setPickLimit] = useState<PickLimit | null>(null);
  const [choices, setChoices] = useState<Choice[]>([]);

  const [mainTab, setMainTab] = useState<MainTab>("pick-list");
  const [runFilter, setRunFilter] = useState<RunFilter>("all");
  const [runViewMode, setRunViewMode] = useState<RunViewMode>("compact");

  const [loading, setLoading] = useState(true);
  const [savingChoice, setSavingChoice] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [now, setNow] = useState(new Date());

  const userGarage = profile?.garage_code || "QG";
  const isSystemPick = pickEvent?.pick_type === "system";
  const isSaturday = pickEvent?.service_schedule === "saturday";

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const visibleRuns = useMemo(() => {
    if (isSystemPick) return runs;
    return runs.filter((run) => run.garage_code === userGarage);
  }, [runs, isSystemPick, userGarage]);

  const filteredRuns = useMemo(() => {
    if (runFilter === "all") return visibleRuns;
    return visibleRuns.filter((run) => run.run_category === runFilter);
  }, [visibleRuns, runFilter]);

  const sortedChoices = useMemo(
    () => [...choices].sort((a, b) => a.choice_rank - b.choice_rank),
    [choices]
  );

  const currentAssignment = useMemo(() => {
    const active = assignments.find((item) => item.pick_status === "picking");
    if (active) return active;

    return (
      assignments.find((item) => item.pick_status === "scheduled") ||
      assignments[0] ||
      null
    );
  }, [assignments]);

  const onDeckAssignment = useMemo(() => {
    if (!currentAssignment) return null;

    const currentIndex = assignments.findIndex(
      (item) => item.id === currentAssignment.id
    );

    if (currentIndex < 0) return null;

    return assignments[currentIndex + 1] || null;
  }, [assignments, currentAssignment]);

  const userAssignment = useMemo(() => {
    if (!profile?.badge_number) return null;

    return (
      assignments.find(
        (item) => item.workers?.badge_number === profile.badge_number
      ) || null
    );
  }, [assignments, profile?.badge_number]);

  const countdownText = useMemo(() => {
    if (!userAssignment) return "No pick time found";

    const pickDateTime = getAssignmentDateTime(userAssignment);
    const diff = pickDateTime.getTime() - now.getTime();

    if (userAssignment.pick_status === "completed") return "Pick completed";
    if (userAssignment.pick_status === "picking") return "You are up now";
    if (diff <= 0) return "Pick time has arrived";

    return formatCountdown(diff);
  }, [userAssignment, now]);

  async function loadChoices(pickId: string, profileId: string) {
    const { data, error } = await supabase
      .from("driver_pick_choices")
      .select(
        `
        id,
        choice_rank,
        choice_type,
        run_id,
        board_slot_id,
        choice_label,
        runs (*),
        holiday_board_slots (*)
      `
      )
      .eq("pick_event_id", pickId)
      .eq("driver_profile_id", profileId)
      .order("choice_rank", { ascending: true });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    const normalizedChoices = (data || []).map((choice: any) => ({
  ...choice,
  runs: Array.isArray(choice.runs) ? choice.runs[0] || null : choice.runs,
  holiday_board_slots: Array.isArray(choice.holiday_board_slots)
    ? choice.holiday_board_slots[0] || null
    : choice.holiday_board_slots,
})) as Choice[];

setChoices(normalizedChoices);
  }

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

    if (!pickData) {
      setLoading(false);
      return;
    }

    const garageCode = profileData.garage_code || "QG";

    const { data: assignmentData } = await supabase
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

    const normalizedAssignments = (assignmentData || []).map((item: any) => ({
  ...item,
  workers: Array.isArray(item.workers)
    ? item.workers[0] || null
    : item.workers,
})) as Assignment[];

setAssignments(
  normalizedAssignments.filter(
    (item) =>
      pickData.pick_type === "system" ||
      item.workers?.garage_code === garageCode
  )
);

    const { data: runData } = await supabase
      .from("runs")
      .select("*")
      .eq("pick_event_id", pickData.id);

    setRuns(
      [...((runData || []) as Run[])].sort((a, b) => {
        const aRun = Number(a.run_number);
        const bRun = Number(b.run_number);

        if (Number.isNaN(aRun) || Number.isNaN(bRun)) {
          return String(a.run_number).localeCompare(String(b.run_number));
        }

        return aRun - bRun;
      })
    );

    const { data: timeData } = await supabase
      .from("holiday_board_times")
      .select("*")
      .eq("pick_event_id", pickData.id)
      .eq("garage_code", garageCode)
      .eq("is_active", true)
      .order("show_up_time", { ascending: true });

    setBoardTimes((timeData || []) as BoardTime[]);

    const { data: slotData } = await supabase
      .from("holiday_board_slots")
      .select("*")
      .eq("pick_event_id", pickData.id)
      .eq("garage_code", garageCode)
      .order("slot_number", { ascending: true });

    setBoardSlots((slotData || []) as BoardSlot[]);

    const { data: limitData } = await supabase
      .from("holiday_pick_limits")
      .select("*")
      .eq("pick_event_id", pickData.id)
      .eq("garage_code", garageCode)
      .maybeSingle();

    setPickLimit(limitData as PickLimit | null);

    await loadChoices(pickData.id, profileData.id);

    setLoading(false);
  }

  useEffect(() => {
    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addChoice({
    type,
    run,
    boardSlot,
    label,
  }: {
    type: "run" | "board_slot" | "be_off" | "standby";
    run?: Run;
    boardSlot?: BoardSlot;
    label: string;
  }) {
    if (!pickEvent || !profile) return;

    if (choices.length >= 10) {
      setErrorMessage("You can only leave up to 10 choices.");
      return;
    }

    setSavingChoice(true);
    setErrorMessage("");

    const { error } = await supabase.from("driver_pick_choices").insert({
      pick_event_id: pickEvent.id,
      driver_profile_id: profile.id,
      garage_code: profile.garage_code || "QG",
      choice_rank: choices.length + 1,
      choice_type: type,
      run_id: run?.id || null,
      board_slot_id: boardSlot?.id || null,
      choice_label: label,
    });

    if (error) {
      setErrorMessage(error.message);
      setSavingChoice(false);
      return;
    }

    await loadChoices(pickEvent.id, profile.id);
    setSavingChoice(false);
  }

  async function removeChoice(choiceId: string) {
    if (!pickEvent || !profile) return;

    const { error } = await supabase
      .from("driver_pick_choices")
      .delete()
      .eq("id", choiceId);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    await loadChoices(pickEvent.id, profile.id);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        Loading pick...
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        Profile not found.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-4">
      <section className="mx-auto max-w-7xl">
        <header className="mb-4 rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-[#1597d3]">
            Driver Pick
          </p>

          <h1 className="mt-2 text-2xl font-black text-[#07111f]">
            {pickEvent?.title || "No Upcoming Pick"}
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            View pick times, runs, board slots, Be Off, Stand-by, and build your
            top 10 choices.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <InfoCard icon={<CalendarDays />} label="Pick Date" value="July 3, 2026" />
            <InfoCard icon={<Clock />} label="Schedule" value={pickEvent?.service_schedule || "Saturday"} />
            <InfoCard icon={<ListChecks />} label="Choices" value={`${choices.length}/10`} />
            <InfoCard icon={<Route />} label="Garage" value={profile.garage_code || "N/A"} />
          </div>
        </header>

        {pickEvent && (
          <LivePickPanel
            currentAssignment={currentAssignment}
            onDeckAssignment={onDeckAssignment}
            userAssignment={userAssignment}
            countdownText={countdownText}
            profile={profile}
          />
        )}

        {errorMessage && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        {!pickEvent ? (
          <section className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-black text-[#07111f]">No Upcoming Pick</h2>
            <p className="mt-2 text-slate-600">No upcoming pick is available right now.</p>
          </section>
        ) : (
          <>
            <TabBar active={mainTab} onChange={setMainTab} />

            {mainTab === "pick-list" && (
              <PickList
                assignments={assignments}
                currentAssignmentId={currentAssignment?.id || null}
                userBadge={profile.badge_number}
              />
            )}

            {mainTab === "runs" && (
              <RunsSection
                isSaturday={isSaturday}
                runFilter={runFilter}
                setRunFilter={setRunFilter}
                runViewMode={runViewMode}
                setRunViewMode={setRunViewMode}
                visibleRuns={visibleRuns}
                filteredRuns={filteredRuns}
                choices={choices}
                savingChoice={savingChoice}
                addChoice={addChoice}
              />
            )}

            {mainTab === "board" && (
              <BoardSection
                boardTimes={boardTimes}
                boardSlots={boardSlots}
                choices={choices}
                savingChoice={savingChoice}
                addChoice={addChoice}
              />
            )}

            {mainTab === "be-off" && (
              <AvailabilitySection
                title="Be Off"
                total={pickLimit?.be_off_total_slots || 0}
                used={pickLimit?.be_off_used_slots || 0}
                color="bg-[#ef4f7a]"
                onAdd={() => addChoice({ type: "be_off", label: "Be Off" })}
                disabled={savingChoice}
              />
            )}

            {mainTab === "standby" && (
              <AvailabilitySection
                title="Stand-by"
                total={pickLimit?.standby_total_slots || 0}
                used={pickLimit?.standby_used_slots || 0}
                color="bg-[#f47b20]"
                onAdd={() => addChoice({ type: "standby", label: "Stand-by" })}
                disabled={savingChoice}
              />
            )}

            <ChoicesPanel choices={sortedChoices} onRemove={removeChoice} />
          </>
        )}
      </section>
    </main>
  );
}

function LivePickPanel({
  currentAssignment,
  onDeckAssignment,
  userAssignment,
  countdownText,
  profile,
}: {
  currentAssignment: Assignment | null;
  onDeckAssignment: Assignment | null;
  userAssignment: Assignment | null;
  countdownText: string;
  profile: Profile;
}) {
  const userIsCurrent =
    currentAssignment?.workers?.badge_number === profile.badge_number;

  return (
    <section className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
      <div
        className={`rounded-2xl border p-4 shadow-sm ${
          userIsCurrent
            ? "border-[#52b947] bg-green-50"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex items-center gap-2 text-[#1597d3]">
          <UserCheck size={20} />
          <p className="text-xs uppercase tracking-[0.22em] font-black">
            Current Picker
          </p>
        </div>

        <h2 className="mt-3 text-2xl font-black text-[#07111f]">
          {currentAssignment?.workers?.full_name || "Not started"}
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          {currentAssignment?.workers
            ? `Badge ${currentAssignment.workers.badge_number} · ${formatDate(
                currentAssignment.pick_date
              )} ${formatTime(currentAssignment.pick_time)}`
            : "No active picker yet."}
        </p>

        {userIsCurrent && (
          <p className="mt-3 rounded-xl bg-[#52b947] px-4 py-2 text-center text-sm font-black text-white">
            You are up now
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-[#1597d3]">
          <Clock size={20} />
          <p className="text-xs uppercase tracking-[0.22em] font-black">
            Your Pick Countdown
          </p>
        </div>

        <h2 className="mt-3 text-2xl font-black text-[#07111f]">
          {countdownText}
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          {userAssignment
            ? `${formatDate(userAssignment.pick_date)} ${formatTime(
                userAssignment.pick_time
              )}`
            : "Your pick assignment has not been added yet."}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-[#1597d3]">
          <UserRound size={20} />
          <p className="text-xs uppercase tracking-[0.22em] font-black">
            On Deck
          </p>
        </div>

        <h2 className="mt-3 text-2xl font-black text-[#07111f]">
          {onDeckAssignment?.workers?.full_name || "No one on deck"}
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          {onDeckAssignment?.workers
            ? `Badge ${onDeckAssignment.workers.badge_number} · ${formatTime(
                onDeckAssignment.pick_time
              )}`
            : "Waiting for pick list."}
        </p>
      </div>
    </section>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
      <div className="text-[#1597d3]">{icon}</div>
      <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-slate-500 font-black">
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-[#07111f]">{value}</p>
    </div>
  );
}

function TabBar({ active, onChange }: { active: MainTab; onChange: (tab: MainTab) => void }) {
  const tabs: { label: string; value: MainTab }[] = [
    { label: "Pick List", value: "pick-list" },
    { label: "Runs", value: "runs" },
    { label: "Board", value: "board" },
    { label: "Be Off", value: "be-off" },
    { label: "Stand-by", value: "standby" },
  ];

  return (
    <section className="mb-4 overflow-x-auto rounded-2xl bg-white border border-slate-200 p-2 shadow-sm">
      <div className="flex min-w-max gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`rounded-xl px-4 py-3 text-sm font-black ${
              active === tab.value
                ? "bg-[#07111f] text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function PickList({
  assignments,
  currentAssignmentId,
  userBadge,
}: {
  assignments: Assignment[];
  currentAssignmentId: string | null;
  userBadge: string | null;
}) {
  return (
    <section className="mb-4 rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
      <h2 className="text-xl font-black text-[#07111f]">Pick List</h2>

      <div className="mt-4 space-y-3">
        {assignments.length === 0 ? (
          <p className="text-sm text-slate-500">No drivers scheduled yet.</p>
        ) : (
          assignments.map((item) => {
            const isCurrent = item.id === currentAssignmentId;
            const isUser = item.workers?.badge_number === userBadge;

            return (
              <div
                key={item.id}
                className={`rounded-xl border p-3 ${
                  isCurrent
                    ? "border-[#52b947] bg-green-50"
                    : isUser
                    ? "border-[#1597d3] bg-[#dff6ff]"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-[#07111f]">
                      {item.workers?.full_name || "Unknown Driver"}
                    </p>
                    <p className="text-sm text-slate-600">
                      Badge {item.workers?.badge_number} ·{" "}
                      {item.workers?.garage_code} · {formatDate(item.pick_date)}{" "}
                      {formatTime(item.pick_time)}
                    </p>
                  </div>

                  <span className={statusClass(item.pick_status)}>
                    {formatStatus(item.pick_status)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

function RunsSection({
  isSaturday,
  runFilter,
  setRunFilter,
  runViewMode,
  setRunViewMode,
  visibleRuns,
  filteredRuns,
  choices,
  savingChoice,
  addChoice,
}: {
  isSaturday: boolean;
  runFilter: RunFilter;
  setRunFilter: (filter: RunFilter) => void;
  runViewMode: RunViewMode;
  setRunViewMode: (mode: RunViewMode) => void;
  visibleRuns: Run[];
  filteredRuns: Run[];
  choices: Choice[];
  savingChoice: boolean;
  addChoice: (args: { type: "run"; run: Run; label: string }) => void;
}) {
  return (
    <section
      className={`mb-4 rounded-2xl border p-3 shadow-sm ${
        isSaturday
          ? "bg-[#dff6ff] border-[#1597d3]"
          : "bg-white border-slate-200"
      }`}
    >
      <h2 className="text-xl font-black text-[#07111f]">Runs</h2>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <select
          value={runFilter}
          onChange={(e) => setRunFilter(e.target.value as RunFilter)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-bold text-[#07111f] shadow-sm outline-none focus:ring-2 focus:ring-[#1597d3]"
        >
          <option value="all">All ({visibleRuns.length})</option>
          <option value="day">Day ({visibleRuns.filter((r) => r.run_category === "day").length})</option>
          <option value="late">Late ({visibleRuns.filter((r) => r.run_category === "late").length})</option>
          <option value="split">Split ({visibleRuns.filter((r) => r.run_category === "split").length})</option>
          <option value="extra">Extra ({visibleRuns.filter((r) => r.run_category === "extra").length})</option>
        </select>

        <select
          value={runViewMode}
          onChange={(e) => setRunViewMode(e.target.value as RunViewMode)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-bold text-[#07111f] shadow-sm outline-none focus:ring-2 focus:ring-[#1597d3]"
        >
          <option value="compact">Compact PDF View</option>
          <option value="readable">Readable View</option>
        </select>
      </div>

      {runViewMode === "compact" ? (
        <CompactRunSheet
          runs={filteredRuns}
          choices={choices}
          savingChoice={savingChoice}
          addChoice={addChoice}
        />
      ) : (
        <ReadableRuns
          runs={filteredRuns}
          choices={choices}
          savingChoice={savingChoice}
          addChoice={addChoice}
        />
      )}
    </section>
  );
}

function CompactRunSheet({
  runs,
  choices,
  savingChoice,
  addChoice,
}: {
  runs: Run[];
  choices: Choice[];
  savingChoice: boolean;
  addChoice: (args: { type: "run"; run: Run; label: string }) => void;
}) {
  const headers = [
    "RUN",
    "RTE",
    "BLK",
    "ON",
    "TIME",
    "OFF",
    "TIME2",
    "PIECE",
    "PLATF",
    "TOTAL",
    "SPRD",
    "MKUP",
    "PREM",
    "ADD",
  ];

  return (
    <div className="mt-3 rounded-xl bg-white border border-slate-300 overflow-hidden shadow-sm">
      <div className="px-3 py-4 text-center border-b border-slate-300 bg-white">
        <p className="text-xs font-black text-[#07111f]">Runs List Queensgate Saturday</p>
        <p className="text-[9px] text-slate-500">Southwest Ohio Regional Transit Authority / METRO</p>
      </div>

      <div className="overflow-x-auto bg-white">
        <table className="min-w-[900px] w-full text-[10px] leading-tight text-[#07111f]">
          <thead className="border-b-2 border-slate-900 bg-white">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-2 py-2 text-left font-black whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {runs.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="p-4 text-center text-slate-500">
                  No runs found.
                </td>
              </tr>
            ) : (
              runs.map((run) => {
                const existing = choices.find((c) => c.run_id === run.id);

                return (
                  <tr key={run.id} className="border-b border-slate-300">
                    <td className="px-2 py-2 font-black">{run.run_number}</td>
                    <td className="px-2 py-2">{run.route || "—"}</td>
                    <td className="px-2 py-2">{run.block || "—"}</td>
                    <td className="px-2 py-2">{run.on_location || "—"}</td>
                    <td className="px-2 py-2">{run.on_time || "—"}</td>
                    <td className="px-2 py-2">{run.off_location || "—"}</td>
                    <td className="px-2 py-2">{run.off_time || "—"}</td>
                    <td className="px-2 py-2">{run.piece_time || "—"}</td>
                    <td className="px-2 py-2">{run.platform_time || "—"}</td>
                    <td className="px-2 py-2 font-bold">{run.total_time || "—"}</td>
                    <td className="px-2 py-2">{run.spread_pay || "—"}</td>
                    <td className="px-2 py-2">{run.markup_time || "—"}</td>
                    <td className="px-2 py-2">{run.line_premium || "—"}</td>
                    <td className="px-2 py-2">
                      {existing ? (
                        <span className="font-black text-green-700">#{existing.choice_rank}</span>
                      ) : (
                        <button
                          disabled={savingChoice}
                          onClick={() =>
                            addChoice({
                              type: "run",
                              run,
                              label: `Run ${run.run_number}`,
                            })
                          }
                          className="rounded-md bg-[#07111f] px-2 py-1 text-[9px] font-black text-white"
                        >
                          ADD
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReadableRuns({
  runs,
  choices,
  savingChoice,
  addChoice,
}: {
  runs: Run[];
  choices: Choice[];
  savingChoice: boolean;
  addChoice: (args: { type: "run"; run: Run; label: string }) => void;
}) {
  return (
    <div className="mt-3 space-y-3">
      {runs.map((run) => {
        const existing = choices.find((c) => c.run_id === run.id);

        return (
          <div key={run.id} className="rounded-xl bg-white border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-2xl font-black text-[#07111f]">Run {run.run_number}</p>
                <p className="text-sm text-slate-600">
                  Route {run.route} · {run.on_time} - {run.off_time}
                </p>
              </div>

              {existing ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                  Choice #{existing.choice_rank}
                </span>
              ) : (
                <button
                  disabled={savingChoice}
                  onClick={() =>
                    addChoice({
                      type: "run",
                      run,
                      label: `Run ${run.run_number}`,
                    })
                  }
                  className="rounded-xl bg-[#1597d3] px-4 py-2 text-sm font-black text-white"
                >
                  Add
                </button>
              )}
            </div>

            <Link
              href={`/pick/run/${run.id}`}
              className="mt-3 block rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-black text-[#07111f]"
            >
              View Full Details
            </Link>
          </div>
        );
      })}
    </div>
  );
}

function BoardSection({
  boardTimes,
  boardSlots,
  choices,
  savingChoice,
  addChoice,
}: {
  boardTimes: BoardTime[];
  boardSlots: BoardSlot[];
  choices: Choice[];
  savingChoice: boolean;
  addChoice: (args: { type: "board_slot"; boardSlot: BoardSlot; label: string }) => void;
}) {
  return (
    <section className="mb-4 rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
      <h2 className="text-xl font-black text-[#07111f]">Board</h2>

      <div className="mt-4 space-y-4">
        {boardTimes.length === 0 ? (
          <p className="text-sm text-slate-500">No board times added yet.</p>
        ) : (
          boardTimes.map((time) => {
            const slots = boardSlots.filter((s) => s.board_time_id === time.id);

            return (
              <div key={time.id} className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-[#b9ecff] px-4 py-3">
                  <p className="text-xl font-black text-[#07111f]">{formatTime(time.show_up_time)}</p>
                  <p className="text-sm text-slate-600">{time.label || "Show-up time"}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3">
                  {slots.map((slot) => {
                    const existing = choices.find((c) => c.board_slot_id === slot.id);
                    const available = slot.selection_status === "available";

                    return (
                      <button
                        key={slot.id}
                        disabled={!available || savingChoice || !!existing}
                        onClick={() =>
                          addChoice({
                            type: "board_slot",
                            boardSlot: slot,
                            label: `Board ${formatTime(time.show_up_time)} Slot ${slot.slot_number}`,
                          })
                        }
                        className={`rounded-xl border px-3 py-3 text-left ${
                          existing
                            ? "bg-green-50 border-green-200"
                            : available
                            ? "bg-slate-50 border-slate-200"
                            : "bg-slate-200 border-slate-300 opacity-60"
                        }`}
                      >
                        <p className="font-black text-[#07111f]">Slot {slot.slot_number}</p>
                        <p className="text-xs text-slate-600">
                          {existing ? "In your choices" : available ? "Available" : "Taken"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

function AvailabilitySection({
  title,
  total,
  used,
  color,
  onAdd,
  disabled,
}: {
  title: string;
  total: number;
  used: number;
  color: string;
  onAdd: () => void;
  disabled: boolean;
}) {
  const remaining = Math.max(total - used, 0);

  return (
    <section className="mb-4 rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
      <div className={`h-2 rounded-full ${color} mb-5`} />
      <h2 className="text-3xl font-black text-[#07111f]">{title}</h2>
      <p className="mt-2 text-slate-600">
        {remaining} available out of {total}
      </p>

      <button
        disabled={remaining <= 0 || disabled}
        onClick={onAdd}
        className="mt-5 w-full rounded-xl bg-[#1597d3] px-4 py-3 font-black text-white disabled:opacity-50"
      >
        Add {title} to Choices
      </button>
    </section>
  );
}

function ChoicesPanel({
  choices,
  onRemove,
}: {
  choices: Choice[];
  onRemove: (id: string) => void;
}) {
  return (
    <aside className="mb-4 rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
      <h2 className="text-xl font-black text-[#07111f]">Your Top 10 Choices</h2>

      <div className="mt-4 space-y-3">
        {choices.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            No choices yet.
          </p>
        ) : (
          choices.map((choice) => (
            <div
              key={choice.id}
              className="rounded-xl bg-slate-50 border border-slate-200 p-3 flex items-start justify-between gap-3"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.2em] font-black text-[#1597d3]">
                  Choice #{choice.choice_rank}
                </p>
                <p className="font-black text-[#07111f]">
                  {choice.choice_label || choice.choice_type}
                </p>
              </div>

              <button
                onClick={() => onRemove(choice.id)}
                className="rounded-lg bg-white p-2 text-red-600 border border-red-100"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

function getAssignmentDateTime(assignment: Assignment) {
  return new Date(`${assignment.pick_date}T${assignment.pick_time}`);
}

function formatCountdown(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
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