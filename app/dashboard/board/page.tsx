"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, PlusCircle, Save, Trash2 } from "lucide-react";
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
};

type BoardTime = {
  id: string;
  show_up_time: string;
  label: string | null;
  sort_order: number | null;
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
  id: string;
  be_off_total_slots: number;
  be_off_used_slots: number;
  standby_total_slots: number;
  standby_used_slots: number;
};

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-[#1597d3]";

export default function BoardSetupPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [pickEvent, setPickEvent] = useState<PickEvent | null>(null);
  const [boardTimes, setBoardTimes] = useState<BoardTime[]>([]);
  const [boardSlots, setBoardSlots] = useState<BoardSlot[]>([]);
  const [pickLimit, setPickLimit] = useState<PickLimit | null>(null);

  const [showUpTime, setShowUpTime] = useState("");
  const [showUpLabel, setShowUpLabel] = useState("");
  const [slotCount, setSlotCount] = useState("1");

  const [beOffTotal, setBeOffTotal] = useState("0");
  const [standbyTotal, setStandbyTotal] = useState("0");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadBoardData(activePickId: string, garageCode: string) {
    const { data: timesData, error: timesError } = await supabase
      .from("holiday_board_times")
      .select("*")
      .eq("pick_event_id", activePickId)
      .eq("garage_code", garageCode)
      .eq("is_active", true)
      .order("show_up_time", { ascending: true });

    if (timesError) {
      setErrorMessage(timesError.message);
      return;
    }

    setBoardTimes(timesData || []);

    const { data: slotsData, error: slotsError } = await supabase
      .from("holiday_board_slots")
      .select("*")
      .eq("pick_event_id", activePickId)
      .eq("garage_code", garageCode)
      .order("slot_number", { ascending: true });

    if (slotsError) {
      setErrorMessage(slotsError.message);
      return;
    }

    setBoardSlots(slotsData || []);

    const { data: limitData, error: limitError } = await supabase
      .from("holiday_pick_limits")
      .select("*")
      .eq("pick_event_id", activePickId)
      .eq("garage_code", garageCode)
      .maybeSingle();

    if (limitError) {
      setErrorMessage(limitError.message);
      return;
    }

    setPickLimit(limitData || null);
    setBeOffTotal(String(limitData?.be_off_total_slots ?? 0));
    setStandbyTotal(String(limitData?.standby_total_slots ?? 0));
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
        .select("id,title")
        .eq("title", "July 4th Holiday Pick")
        .maybeSingle();

      if (!pickData) {
        setErrorMessage("Could not find the July 4th Holiday Pick.");
        setLoading(false);
        return;
      }

      setProfile(profileData);
      setPickEvent(pickData);

      await loadBoardData(pickData.id, profileData.garage_code || "QG");

      setLoading(false);
    }

    loadPage();
  }, [router]);

  async function handleAddBoardTime(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!profile || !pickEvent) return;

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const garageCode = profile.garage_code || "QG";
    const numberOfSlots = Number(slotCount);

    if (!showUpTime) {
      setErrorMessage("Show-up time is required.");
      setSaving(false);
      return;
    }

    if (!numberOfSlots || numberOfSlots < 1) {
      setErrorMessage("Slot count must be at least 1.");
      setSaving(false);
      return;
    }

    const { data: timeData, error: timeError } = await supabase
      .from("holiday_board_times")
      .insert({
        pick_event_id: pickEvent.id,
        garage_code: garageCode,
        show_up_time: showUpTime,
        label: showUpLabel.trim() || null,
        sort_order: boardTimes.length + 1,
        is_active: true,
      })
      .select()
      .single();

    if (timeError || !timeData) {
      setErrorMessage(timeError?.message || "Could not add board time.");
      setSaving(false);
      return;
    }

    const slotsToInsert = Array.from({ length: numberOfSlots }).map(
      (_, index) => ({
        pick_event_id: pickEvent.id,
        board_time_id: timeData.id,
        garage_code: garageCode,
        slot_number: index + 1,
        selection_status: "available",
      })
    );

    const { error: slotsError } = await supabase
      .from("holiday_board_slots")
      .insert(slotsToInsert);

    if (slotsError) {
      setErrorMessage(slotsError.message);
      setSaving(false);
      return;
    }

    setShowUpTime("");
    setShowUpLabel("");
    setSlotCount("1");

    await loadBoardData(pickEvent.id, garageCode);

    setSuccessMessage("Board show-up time and slots added.");
    setSaving(false);
  }

  async function handleSaveLimits(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!profile || !pickEvent) return;

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const garageCode = profile.garage_code || "QG";

    const payload = {
      pick_event_id: pickEvent.id,
      garage_code: garageCode,
      be_off_total_slots: Number(beOffTotal) || 0,
      standby_total_slots: Number(standbyTotal) || 0,
      updated_by_profile_id: profile.id,
    };

    const { error } = await supabase
      .from("holiday_pick_limits")
      .upsert(payload, {
        onConflict: "pick_event_id,garage_code",
      });

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    await loadBoardData(pickEvent.id, garageCode);

    setSuccessMessage("Be Off and Stand-by limits saved.");
    setSaving(false);
  }

  async function handleDeactivateBoardTime(boardTimeId: string) {
    if (!profile || !pickEvent) return;

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("holiday_board_times")
      .update({ is_active: false })
      .eq("id", boardTimeId);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    await loadBoardData(pickEvent.id, profile.garage_code || "QG");

    setSuccessMessage("Board time hidden from active setup.");
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#07111f] text-white flex items-center justify-center">
        Loading board setup...
      </main>
    );
  }

  if (!profile || !pickEvent) {
    return (
      <main className="min-h-screen bg-[#07111f] text-white flex items-center justify-center">
        Setup could not load.
      </main>
    );
  }

  const garageName =
    profile.garage_code === "BH" ? "Bond Hill" : "Queensgate";

  return (
    <DashboardLayout profile={profile}>
      <section className="mb-6 flex items-start justify-between gap-6">
        <div>
          <Link
            href="/dashboard/holiday-pick"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#1597d3] hover:text-[#0f7fb4] mb-4"
          >
            <ArrowLeft size={18} />
            Back to Holiday Pick
          </Link>

          <p className="text-sm uppercase tracking-[0.25em] text-[#1597d3] font-bold">
            Board / Off / Stand-by Setup
          </p>

          <h2 className="text-3xl font-black text-[#07111f] mt-2">
            {pickEvent.title}
          </h2>

          <p className="text-slate-600 mt-2">
            Build the board show-up times, available board slots, Be Off slots,
            and Stand-by slots for {garageName}.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">
            Garage
          </p>
          <p className="text-xl font-black text-[#07111f] mt-1">
            {profile.garage_code}
          </p>
        </div>
      </section>

      {errorMessage && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-700">
          {successMessage}
        </div>
      )}

      <section className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <PlusCircle className="text-[#1597d3]" />
              <h3 className="text-xl font-black text-[#07111f]">
                Add Board Show-Up Time
              </h3>
            </div>

            <form onSubmit={handleAddBoardTime} className="space-y-4">
              <FormField label="Show-Up Time">
                <input
                  type="time"
                  value={showUpTime}
                  onChange={(e) => setShowUpTime(e.target.value)}
                  className={inputClass}
                  required
                />
              </FormField>

              <FormField label="Label / Notes">
                <input
                  value={showUpLabel}
                  onChange={(e) => setShowUpLabel(e.target.value)}
                  className={inputClass}
                  placeholder="Example: Noon show-up"
                />
              </FormField>

              <FormField label="Number of Slots Under This Time">
                <input
                  type="number"
                  min={1}
                  value={slotCount}
                  onChange={(e) => setSlotCount(e.target.value)}
                  className={inputClass}
                  required
                />
              </FormField>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-[#1597d3] px-4 py-3 font-black text-white hover:bg-[#0f7fb4] transition disabled:opacity-60"
              >
                {saving ? "Saving..." : "Add Show-Up Time"}
              </button>
            </form>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <Save className="text-[#f47b20]" />
              <h3 className="text-xl font-black text-[#07111f]">
                Be Off / Stand-by Limits
              </h3>
            </div>

            <form onSubmit={handleSaveLimits} className="space-y-4">
              <FormField label="Available Be Off Slots">
                <input
                  type="number"
                  min={0}
                  value={beOffTotal}
                  onChange={(e) => setBeOffTotal(e.target.value)}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Available Stand-by Slots">
                <input
                  type="number"
                  min={0}
                  value={standbyTotal}
                  onChange={(e) => setStandbyTotal(e.target.value)}
                  className={inputClass}
                />
              </FormField>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-[#07111f] px-4 py-3 font-black text-white hover:bg-slate-800 transition disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Limits"}
              </button>
            </form>
          </div>
        </div>

        <div className="xl:col-span-3 space-y-6">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <Clock className="text-[#1597d3]" />
                <div>
                  <h3 className="text-xl font-black text-[#07111f]">
                    Board Setup Preview
                  </h3>
                  <p className="text-sm text-slate-600">
                    Drivers may choose any open slot under any show-up time.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {boardTimes.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 text-center text-slate-500 font-semibold">
                  No board show-up times added yet.
                </div>
              ) : (
                boardTimes.map((boardTime) => {
                  const slotsForTime = boardSlots.filter(
                    (slot) => slot.board_time_id === boardTime.id
                  );

                  return (
                    <div
                      key={boardTime.id}
                      className="rounded-2xl border border-slate-200 overflow-hidden"
                    >
                      <div className="bg-[#b9ecff] px-5 py-4 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xl font-black text-[#07111f]">
                            {formatTime(boardTime.show_up_time)}
                          </p>
                          <p className="text-sm font-semibold text-slate-700">
                            {boardTime.label || "Board show-up time"}
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            handleDeactivateBoardTime(boardTime.id)
                          }
                          className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-red-600 border border-red-100 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-white">
                        {slotsForTime.map((slot) => (
                          <div
                            key={slot.id}
                            className={`rounded-xl border px-4 py-3 ${
                              slot.selection_status === "available"
                                ? "bg-slate-50 border-slate-200"
                                : "bg-green-50 border-green-200"
                            }`}
                          >
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">
                              Slot {slot.slot_number}
                            </p>
                            <p className="mt-1 font-black text-[#07111f]">
                              {slot.selection_status === "available"
                                ? "Available"
                                : slot.selected_driver_name || "Selected"}
                            </p>
                            {slot.selected_badge_number && (
                              <p className="text-sm text-slate-600">
                                Badge {slot.selected_badge_number}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <LimitCard
              title="Be Off"
              total={pickLimit?.be_off_total_slots ?? Number(beOffTotal) ?? 0}
              used={pickLimit?.be_off_used_slots ?? 0}
              color="bg-[#ef4f7a]"
            />

            <LimitCard
              title="Stand-by"
              total={
                pickLimit?.standby_total_slots ?? Number(standbyTotal) ?? 0
              }
              used={pickLimit?.standby_used_slots ?? 0}
              color="bg-[#f47b20]"
            />
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
      <span className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function LimitCard({
  title,
  total,
  used,
  color,
}: {
  title: string;
  total: number;
  used: number;
  color: string;
}) {
  const remaining = Math.max(total - used, 0);

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
      <div className={`h-2 rounded-full ${color} mb-5`} />

      <p className="text-sm uppercase tracking-[0.25em] text-slate-500 font-bold">
        {title}
      </p>

      <p className="mt-3 text-4xl font-black text-[#07111f]">
        {remaining}
      </p>

      <p className="mt-1 text-sm text-slate-600">
        {used} used / {total} total
      </p>
    </div>
  );
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