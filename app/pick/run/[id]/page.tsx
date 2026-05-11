"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bus, CheckCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
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

type Choice = {
  id: string;
  run_id: string | null;
  choice_rank: number;
};

export default function RunDetailPage() {
  const params = useParams();
  const router = useRouter();

  const runId = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [pickEvent, setPickEvent] = useState<PickEvent | null>(null);
  const [run, setRun] = useState<Run | null>(null);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingChoice, setSavingChoice] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const alreadyChosen = choices.some((choice) => choice.run_id === runId);
  const existingChoice = choices.find((choice) => choice.run_id === runId);

  async function loadChoices(activePickId: string, profileId: string) {
    const { data, error } = await supabase
      .from("driver_pick_choices")
      .select("id, run_id, choice_rank")
      .eq("pick_event_id", activePickId)
      .eq("driver_profile_id", profileId)
      .order("choice_rank", { ascending: true });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setChoices((data || []) as Choice[]);
  }

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

      if (pickError || !pickData) {
        setErrorMessage("Could not load the July 4th Holiday Pick.");
        setLoading(false);
        return;
      }

      const { data: runData, error: runError } = await supabase
        .from("runs")
        .select("*")
        .eq("id", runId)
        .single();

      if (runError || !runData) {
        setErrorMessage("Could not load this run.");
        setLoading(false);
        return;
      }

      setProfile(profileData);
      setPickEvent(pickData);
      setRun(runData);

      await loadChoices(pickData.id, profileData.id);

      setLoading(false);
    }

    loadPage();
  }, [router, runId]);

  async function handleAddToChoices() {
    if (!profile || !pickEvent || !run) return;

    setSavingChoice(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (choices.length >= 10) {
      setErrorMessage("You can only leave up to 10 choices.");
      setSavingChoice(false);
      return;
    }

    if (alreadyChosen) {
      setErrorMessage("This run is already in your choices.");
      setSavingChoice(false);
      return;
    }

    const { error } = await supabase.from("driver_pick_choices").insert({
      pick_event_id: pickEvent.id,
      driver_profile_id: profile.id,
      garage_code: profile.garage_code || "QG",
      choice_rank: choices.length + 1,
      choice_type: "run",
      run_id: run.id,
      board_slot_id: null,
      choice_label: `Run ${run.run_number}`,
    });

    if (error) {
      setErrorMessage(error.message);
      setSavingChoice(false);
      return;
    }

    await loadChoices(pickEvent.id, profile.id);

    setSuccessMessage(`Run ${run.run_number} added to your choices.`);
    setSavingChoice(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        Loading run details...
      </main>
    );
  }

  if (!run) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm text-center">
          <p className="font-black text-[#07111f]">Run not found.</p>
          <Link
            href="/pick"
            className="mt-4 inline-block rounded-xl bg-[#1597d3] px-4 py-3 font-black text-white"
          >
            Back to Pick
          </Link>
        </div>
      </main>
    );
  }

  const isSaturday = run.service_schedule === "saturday";

  return (
    <main
      className={`min-h-screen px-4 py-5 ${
        isSaturday ? "bg-[#b9ecff]" : "bg-slate-100"
      }`}
    >
      <section className="mx-auto max-w-4xl">
        <div className="mb-4 rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
          <Link
            href="/pick"
            className="inline-flex items-center gap-2 text-sm font-black text-[#1597d3]"
          >
            <ArrowLeft size={18} />
            Back to Pick
          </Link>

          <div className="mt-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] font-black text-[#1597d3]">
                Run Details
              </p>

              <h1 className="mt-2 text-4xl font-black text-[#07111f]">
                Run {run.run_number}
              </h1>

              <p className="mt-2 text-sm text-slate-600">
                Full run details for review before adding this run to your top
                10 choices.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-black">
                Garage
              </p>
              <p className="text-xl font-black text-[#07111f]">
                {run.garage_code}
              </p>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-bold text-green-700">
            {successMessage}
          </div>
        )}

        <section className="mb-4 rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <Bus className="text-[#1597d3]" />
            <h2 className="text-2xl font-black text-[#07111f]">
              Run Summary
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <DetailBox label="Run" value={run.run_number} />
            <DetailBox label="Route" value={run.route || "—"} />
            <DetailBox label="Block" value={run.block || "—"} />
            <DetailBox label="Type" value={formatCategory(run.run_category)} />
            <DetailBox label="On Location" value={run.on_location || "—"} />
            <DetailBox label="On Time" value={run.on_time || "—"} />
            <DetailBox label="Off Location" value={run.off_location || "—"} />
            <DetailBox label="Off Time" value={run.off_time || "—"} />
          </div>
        </section>

        <section className="mb-4 rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
          <h2 className="text-2xl font-black text-[#07111f]">
            Pay / Time Details
          </h2>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
            <DetailBox label="Piece Time" value={run.piece_time || "—"} />
            <DetailBox label="Platform Time" value={run.platform_time || "—"} />
            <DetailBox label="Total Time" value={run.total_time || "—"} />
            <DetailBox label="Spread Pay" value={run.spread_pay || "—"} />
            <DetailBox label="Markup Time" value={run.markup_time || "—"} />
            <DetailBox label="Line Premium" value={run.line_premium || "—"} />
          </div>
        </section>

        <section className="rounded-2xl bg-[#07111f] p-5 text-white shadow-sm">
          {alreadyChosen ? (
            <div className="flex items-start gap-3">
              <CheckCircle className="text-[#52b947]" />
              <div>
                <h2 className="text-2xl font-black">
                  Already in Your Choices
                </h2>
                <p className="mt-2 text-slate-300">
                  This run is currently Choice #{existingChoice?.choice_rank}.
                </p>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-black">Add This Run?</h2>
              <p className="mt-2 text-sm text-slate-300">
                This will add Run {run.run_number} to the next available spot in
                your top 10 choices.
              </p>

              <button
                onClick={handleAddToChoices}
                disabled={savingChoice}
                className="mt-5 w-full rounded-xl bg-[#1597d3] px-4 py-4 font-black text-white disabled:opacity-60"
              >
                {savingChoice ? "Adding..." : "Add to Choices"}
              </button>
            </>
          )}
        </section>
      </section>
    </main>
  );
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">
        {label}
      </p>
      <p className="mt-2 text-lg font-black text-[#07111f]">{value}</p>
    </div>
  );
}

function formatCategory(category: string) {
  if (category === "day") return "Day Run";
  if (category === "late") return "Late Run";
  if (category === "split") return "Split Run";
  if (category === "extra") return "Extra";
  return category;
}