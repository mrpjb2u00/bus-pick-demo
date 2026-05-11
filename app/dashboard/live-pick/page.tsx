"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  ClipboardCheck,
  Radio,
  RefreshCw,
  UserCheck,
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

type PickEvent = {
  id: string;
  title: string;
  pick_type: string | null;
};

type Worker = {
  id: string;
  badge_number: string;
  full_name: string;
  garage_code: string;
  seniority_rank: number | null;
};

type Assignment = {
  id: string;
  pick_date: string;
  pick_time: string;
  pick_status: string;
  workers: Worker | null;
};

type Choice = {
  id: string;
  choice_rank: number;
  choice_type: "run" | "board_slot" | "be_off" | "standby";
  choice_label: string | null;
  run_id: string | null;
  board_slot_id: string | null;
  runs: {
    id: string;
    run_number: string;
    route: string | null;
    on_time: string | null;
    off_time: string | null;
    is_active: boolean | null;
  } | null;
  holiday_board_slots: {
    id: string;
    slot_number: number;
    selection_status: string;
  } | null;
};

function normalizeWorker(workerValue: unknown): Worker | null {
  if (!workerValue) return null;

  if (Array.isArray(workerValue)) {
    return (workerValue[0] as Worker) || null;
  }

  return workerValue as Worker;
}

function normalizeAssignment(item: any): Assignment {
  return {
    id: item.id,
    pick_date: item.pick_date,
    pick_time: item.pick_time,
    pick_status: item.pick_status,
    workers: normalizeWorker(item.workers),
  };
}

export default function LivePickPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [pickEvent, setPickEvent] = useState<PickEvent | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const currentAssignment = useMemo(() => {
    return (
      assignments.find((item) => item.pick_status === "picking") ||
      assignments.find((item) => item.pick_status === "scheduled") ||
      null
    );
  }, [assignments]);

  const currentIndex = useMemo(() => {
    if (!currentAssignment) return -1;
    return assignments.findIndex((item) => item.id === currentAssignment.id);
  }, [assignments, currentAssignment]);

  const onDeckAssignment = useMemo(() => {
    if (currentIndex < 0) return null;
    return assignments[currentIndex + 1] || null;
  }, [assignments, currentIndex]);

  const suggestedChoice = useMemo(() => {
    return choices.find((choice) => isChoiceAvailable(choice)) || null;
  }, [choices]);

  async function loadPage() {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

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

    if (!pickData) {
      setErrorMessage("Could not find July 4th Holiday Pick.");
      setLoading(false);
      return;
    }

    setProfile(profileData as Profile);
    setPickEvent(pickData as PickEvent);

    const garageCode = profileData.garage_code || "QG";

    const { data: assignmentData, error: assignmentError } = await supabase
      .from("pick_assignments")
      .select(
        `
        id,
        pick_date,
        pick_time,
        pick_status,
        workers (
          id,
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
      (item) =>
        pickData.pick_type === "system" ||
        item.workers?.garage_code === garageCode
    );

    setAssignments(visibleAssignments);

    const activeAssignment =
      visibleAssignments.find((item) => item.pick_status === "picking") ||
      visibleAssignments.find((item) => item.pick_status === "scheduled") ||
      null;

    if (activeAssignment?.workers) {
      const { data: profileMatch } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("badge_number", activeAssignment.workers.badge_number)
        .maybeSingle();

      if (profileMatch?.id) {
        const { data: choiceData, error: choiceError } = await supabase
          .from("driver_pick_choices")
          .select(
            `
            id,
            choice_rank,
            choice_type,
            choice_label,
            run_id,
            board_slot_id,
            runs (
              id,
              run_number,
              route,
              on_time,
              off_time,
              is_active
            ),
            holiday_board_slots (
              id,
              slot_number,
              selection_status
            )
          `
          )
          .eq("pick_event_id", pickData.id)
          .eq("driver_profile_id", profileMatch.id)
          .order("choice_rank", { ascending: true });

        if (choiceError) {
          setErrorMessage(choiceError.message);
        } else {
          setChoices((choiceData || []) as Choice[]);
        }
      } else {
        setChoices([]);
      }
    } else {
      setChoices([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSetCurrent() {
    if (!currentAssignment) return;

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("pick_assignments")
      .update({ pick_status: "picking" })
      .eq("id", currentAssignment.id);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    await loadPage();
    setSaving(false);
  }

  async function handleApproveChoice(choice: Choice) {
    if (!profile || !pickEvent || !currentAssignment?.workers) return;

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (choice.choice_type === "run" && choice.run_id) {
      const { error } = await supabase
        .from("runs")
        .update({ is_active: false })
        .eq("id", choice.run_id);

      if (error) {
        setErrorMessage(error.message);
        setSaving(false);
        return;
      }
    }

    if (choice.choice_type === "board_slot" && choice.board_slot_id) {
      const { error } = await supabase
        .from("holiday_board_slots")
        .update({
          selection_status: "approved",
          selected_badge_number: currentAssignment.workers.badge_number,
          selected_driver_name: currentAssignment.workers.full_name,
          approved_by_profile_id: profile.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", choice.board_slot_id);

      if (error) {
        setErrorMessage(error.message);
        setSaving(false);
        return;
      }
    }

    if (choice.choice_type === "be_off") {
      const { data: limitData } = await supabase
        .from("holiday_pick_limits")
        .select("be_off_used_slots")
        .eq("pick_event_id", pickEvent.id)
        .eq("garage_code", currentAssignment.workers.garage_code)
        .maybeSingle();

      const nextUsed = (limitData?.be_off_used_slots || 0) + 1;

      const { error: limitError } = await supabase
        .from("holiday_pick_limits")
        .update({ be_off_used_slots: nextUsed })
        .eq("pick_event_id", pickEvent.id)
        .eq("garage_code", currentAssignment.workers.garage_code);

      if (limitError) {
        setErrorMessage(limitError.message);
        setSaving(false);
        return;
      }
    }

    if (choice.choice_type === "standby") {
      const { data: limitData } = await supabase
        .from("holiday_pick_limits")
        .select("standby_used_slots")
        .eq("pick_event_id", pickEvent.id)
        .eq("garage_code", currentAssignment.workers.garage_code)
        .maybeSingle();

      const nextUsed = (limitData?.standby_used_slots || 0) + 1;

      const { error: limitError } = await supabase
        .from("holiday_pick_limits")
        .update({ standby_used_slots: nextUsed })
        .eq("pick_event_id", pickEvent.id)
        .eq("garage_code", currentAssignment.workers.garage_code);

      if (limitError) {
        setErrorMessage(limitError.message);
        setSaving(false);
        return;
      }
    }

    const { error: approvalError } = await supabase
      .from("approved_pick_selections")
      .insert({
        pick_event_id: pickEvent.id,
        assignment_id: currentAssignment.id,
        worker_id: currentAssignment.workers.id,
        approved_by_profile_id: profile.id,
        choice_id: choice.id,
        choice_type: choice.choice_type,
        run_id: choice.run_id,
        board_slot_id: choice.board_slot_id,
        selection_label: choice.choice_label || choice.choice_type,
      });

    if (approvalError) {
      setErrorMessage(approvalError.message);
      setSaving(false);
      return;
    }

    const { error: completeError } = await supabase
      .from("pick_assignments")
      .update({ pick_status: "completed" })
      .eq("id", currentAssignment.id);

    if (completeError) {
      setErrorMessage(completeError.message);
      setSaving(false);
      return;
    }

    const nextScheduled = assignments
      .filter((item) => item.id !== currentAssignment.id)
      .find((item) => item.pick_status === "scheduled");

    if (nextScheduled) {
      const { error: nextError } = await supabase
        .from("pick_assignments")
        .update({ pick_status: "picking" })
        .eq("id", nextScheduled.id);

      if (nextError) {
        setErrorMessage(nextError.message);
        setSaving(false);
        return;
      }
    }

    setSuccessMessage(
      `${currentAssignment.workers.full_name} approved for ${
        choice.choice_label || choice.choice_type
      }. ${
        nextScheduled?.workers
          ? `${nextScheduled.workers.full_name} is now picking.`
          : "No more scheduled drivers are waiting."
      }`
    );

    await loadPage();
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#07111f] text-white flex items-center justify-center">
        Loading live pick...
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
            className="inline-flex items-center gap-2 text-sm font-black text-[#1597d3] mb-4"
          >
            <ArrowLeft size={18} />
            Back to Holiday Pick
          </Link>

          <div className="flex items-center gap-3">
            <Radio className="text-[#1597d3]" />
            <div>
              <p className="text-sm uppercase tracking-[0.25em] font-black text-[#1597d3]">
                Live Pick Control
              </p>

              <h1 className="mt-2 text-3xl font-black text-[#07111f]">
                {pickEvent?.title || "Clerk Approval Workflow"}
              </h1>
            </div>
          </div>
        </div>

        <button
          onClick={loadPage}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 disabled:opacity-60"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </section>

      {errorMessage && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-bold text-green-700">
          {successMessage}
        </div>
      )}

      <section className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <LiveStatusCard
          label="Current Picker"
          value={currentAssignment?.workers?.full_name || "Not started"}
          detail={
            currentAssignment?.workers
              ? `Badge ${currentAssignment.workers.badge_number}`
              : "No current driver"
          }
          color="bg-[#52b947]"
        />

        <LiveStatusCard
          label="On Deck"
          value={onDeckAssignment?.workers?.full_name || "No one on deck"}
          detail={
            onDeckAssignment?.workers
              ? `Badge ${onDeckAssignment.workers.badge_number}`
              : "Waiting for pick list"
          }
          color="bg-[#1597d3]"
        />

        <LiveStatusCard
          label="Remaining Scheduled"
          value={String(
            assignments.filter((item) => item.pick_status === "scheduled")
              .length
          )}
          detail="Drivers waiting to pick"
          color="bg-[#f47b20]"
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <UserCheck className="text-[#1597d3]" />
            <h2 className="text-xl font-black text-[#07111f]">
              Current Driver
            </h2>
          </div>

          {currentAssignment?.workers ? (
            <div className="mt-5">
              <p className="text-3xl font-black text-[#07111f]">
                {currentAssignment.workers.full_name}
              </p>

              <p className="mt-2 text-slate-600">
                Badge {currentAssignment.workers.badge_number} ·{" "}
                {currentAssignment.workers.garage_code}
              </p>

              <p className="mt-1 text-slate-600">
                Pick Time: {formatDate(currentAssignment.pick_date)}{" "}
                {formatTime(currentAssignment.pick_time)}
              </p>

              <span className={statusClass(currentAssignment.pick_status)}>
                {formatStatus(currentAssignment.pick_status)}
              </span>

              {currentAssignment.pick_status === "scheduled" && (
                <button
                  onClick={handleSetCurrent}
                  disabled={saving}
                  className="mt-5 w-full rounded-xl bg-[#1597d3] px-4 py-3 font-black text-white disabled:opacity-60"
                >
                  Set as Picking Now
                </button>
              )}
            </div>
          ) : (
            <p className="mt-5 text-slate-500">No current driver found.</p>
          )}
        </div>

        <div className="xl:col-span-2 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="text-[#1597d3]" />
            <h2 className="text-xl font-black text-[#07111f]">
              Driver Choices
            </h2>
          </div>

          {choices.length === 0 ? (
            <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200 p-6 text-center text-slate-500 font-semibold">
              This driver has not left choices yet.
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {suggestedChoice && (
                <div className="rounded-2xl border-2 border-[#52b947] bg-green-50 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] font-black text-green-700">
                    Suggested First Available Choice
                  </p>

                  <p className="mt-2 text-2xl font-black text-[#07111f]">
                    Choice #{suggestedChoice.choice_rank}:{" "}
                    {suggestedChoice.choice_label ||
                      suggestedChoice.choice_type}
                  </p>

                  <button
                    onClick={() => handleApproveChoice(suggestedChoice)}
                    disabled={saving}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#52b947] px-5 py-3 font-black text-white disabled:opacity-60"
                  >
                    <CheckCircle size={18} />
                    Approve Suggested Choice
                  </button>
                </div>
              )}

              {choices.map((choice) => {
                const available = isChoiceAvailable(choice);

                return (
                  <div
                    key={choice.id}
                    className={`rounded-xl border p-4 ${
                      available
                        ? "bg-white border-slate-200"
                        : "bg-slate-100 border-slate-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] font-black text-[#1597d3]">
                          Choice #{choice.choice_rank}
                        </p>

                        <p className="mt-1 text-xl font-black text-[#07111f]">
                          {choice.choice_label || choice.choice_type}
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                          {choiceStatusText(choice)}
                        </p>
                      </div>

                      {available ? (
                        <button
                          onClick={() => handleApproveChoice(choice)}
                          disabled={saving}
                          className="rounded-xl bg-[#07111f] px-4 py-3 text-sm font-black text-white disabled:opacity-60"
                        >
                          Approve
                        </button>
                      ) : (
                        <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-black text-slate-600">
                          Not Available
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}

function LiveStatusCard({
  label,
  value,
  detail,
  color,
}: {
  label: string;
  value: string;
  detail: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
      <div className={`mb-4 h-2 rounded-full ${color}`} />

      <p className="text-xs uppercase tracking-[0.22em] text-slate-500 font-black">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black text-[#07111f]">{value}</p>

      <p className="mt-1 text-sm text-slate-600">{detail}</p>
    </div>
  );
}

function isChoiceAvailable(choice: Choice) {
  if (choice.choice_type === "run") {
    return choice.runs?.is_active !== false;
  }

  if (choice.choice_type === "board_slot") {
    return choice.holiday_board_slots?.selection_status === "available";
  }

  return true;
}

function choiceStatusText(choice: Choice) {
  if (choice.choice_type === "run") {
    if (choice.runs?.is_active === false) return "Run is no longer available.";
    return `Run ${choice.runs?.run_number || ""} is available.`;
  }

  if (choice.choice_type === "board_slot") {
    return choice.holiday_board_slots?.selection_status === "available"
      ? "Board slot is available."
      : "Board slot is no longer available.";
  }

  if (choice.choice_type === "be_off") return "Be Off request.";
  if (choice.choice_type === "standby") return "Stand-by request.";

  return "Choice status unknown.";
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
    return "mt-4 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700";
  }

  if (status === "completed") {
    return "mt-4 inline-block rounded-full bg-slate-200 px-3 py-1 text-xs font-black text-slate-700";
  }

  return "mt-4 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700";
}