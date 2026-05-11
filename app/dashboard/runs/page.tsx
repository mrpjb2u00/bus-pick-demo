"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bus, PlusCircle, RefreshCw } from "lucide-react";
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
  service_schedule: string;
  schedule_color: string;
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

type RunFilter = "all" | "day" | "late" | "split" | "extra";

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-600";

export default function RunsPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [pickEvent, setPickEvent] = useState<PickEvent | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [garageCode, setGarageCode] = useState("QG");
  const [runNumber, setRunNumber] = useState("");
  const [route, setRoute] = useState("");
  const [block, setBlock] = useState("");
  const [onLocation, setOnLocation] = useState("");
  const [onTime, setOnTime] = useState("");
  const [offTime, setOffTime] = useState("");
  const [offLocation, setOffLocation] = useState("");

  const [pieceTime, setPieceTime] = useState("");
  const [platformTime, setPlatformTime] = useState("");
  const [totalTime, setTotalTime] = useState("");
  const [spreadPay, setSpreadPay] = useState("");
  const [markupTime, setMarkupTime] = useState("");
  const [linePremium, setLinePremium] = useState("");

  const [runCategory, setRunCategory] = useState("day");
  const [activeFilter, setActiveFilter] = useState<RunFilter>("all");
  const [errorMessage, setErrorMessage] = useState("");

  const isSystemPick = pickEvent?.pick_type === "system";
  const userGarage = profile?.garage_code || "QG";
  const visibleGarage = isSystemPick ? "BOTH" : userGarage;

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

  async function loadRuns(pickId?: string) {
    const activePickId = pickId || pickEvent?.id;

    if (!activePickId) return;

    const { data, error } = await supabase
      .from("runs")
      .select("*")
      .eq("pick_event_id", activePickId);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    const sortedRuns = [...(data || [])].sort((a, b) => {
      const garageCompare = a.garage_code.localeCompare(b.garage_code);
      if (garageCompare !== 0) return garageCompare;

      const aRun = Number(a.run_number);
      const bRun = Number(b.run_number);

      if (Number.isNaN(aRun) || Number.isNaN(bRun)) {
        return String(a.run_number).localeCompare(String(b.run_number));
      }

      return aRun - bRun;
    });

    setRuns(sortedRuns);
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

      const { data: pickData } = await supabase
        .from("pick_events")
        .select("*")
        .eq("title", "July 4th Holiday Pick")
        .maybeSingle();

      if (!profileData) {
        setErrorMessage("Could not load your profile.");
        setLoading(false);
        return;
      }

      setProfile(profileData);
      setPickEvent(pickData || null);

      const defaultGarage =
        pickData?.pick_type === "system"
          ? "QG"
          : profileData.garage_code || "QG";

      setGarageCode(defaultGarage);

      if (pickData?.id) {
        await loadRuns(pickData.id);
      }

      setLoading(false);
    }

    loadPage();
  }, [router]);

  async function handleAddRun(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!pickEvent) {
      setErrorMessage("No pick event found.");
      return;
    }

    const finalGarageCode = isSystemPick ? garageCode : userGarage;

    setSaving(true);
    setErrorMessage("");

    const { error } = await supabase.from("runs").insert({
      pick_event_id: pickEvent.id,
      garage_code: finalGarageCode,
      run_number: runNumber.trim(),
      route: route.trim() || null,
      block: block.trim() || null,
      on_location: onLocation.trim() || null,
      on_time: onTime.trim() || null,
      off_time: offTime.trim() || null,
      off_location: offLocation.trim() || null,

      piece_time: pieceTime.trim() || null,
      platform_time: platformTime.trim() || null,
      total_time: totalTime.trim() || null,
      spread_pay: spreadPay.trim() || null,
      markup_time: markupTime.trim() || null,
      line_premium: linePremium.trim() || null,

      service_schedule: pickEvent.service_schedule || "saturday",
      run_category: runCategory,
      entry_method: "manual",
      is_active: true,
    });

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setRunNumber("");
    setRoute("");
    setBlock("");
    setOnLocation("");
    setOnTime("");
    setOffTime("");
    setOffLocation("");
    setPieceTime("");
    setPlatformTime("");
    setTotalTime("");
    setSpreadPay("");
    setMarkupTime("");
    setLinePremium("");
    setRunCategory("day");

    await loadRuns(pickEvent.id);
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading runs...
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

  const isSaturday = pickEvent?.service_schedule === "saturday";

  return (
    <DashboardLayout profile={profile}>
      <section className="mb-6 flex items-start justify-between gap-6">
        <div>
          <Link
            href="/dashboard/holiday-pick"
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 mb-4"
          >
            <ArrowLeft size={18} />
            Back to Holiday Pick
          </Link>

          <p className="text-sm uppercase tracking-[0.25em] text-blue-700 font-bold">
            Holiday Runs
          </p>

          <h2 className="text-3xl font-bold text-slate-950 mt-2">
            {pickEvent?.title || "July 4th Holiday Pick"}
          </h2>

          <p className="text-slate-600 mt-2">
            Add and manage holiday runs. Non-system picks only show the user’s
            assigned garage.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">
            Visible Garage
          </p>
          <p className="text-xl font-bold text-slate-950 mt-1">
            {visibleGarage === "BOTH" ? "QG + BH" : visibleGarage}
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
              Add Run Manually
            </h3>
          </div>

          <form onSubmit={handleAddRun} className="space-y-4">
            {isSystemPick ? (
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Garage">
                  <select
                    value={garageCode}
                    onChange={(e) => setGarageCode(e.target.value)}
                    className={inputClass}
                  >
                    <option value="QG">Queensgate (QG)</option>
                    <option value="BH">Bond Hill (BH)</option>
                  </select>
                </FormField>

                <FormField label="Run Category">
                  <RunCategorySelect
                    value={runCategory}
                    onChange={setRunCategory}
                  />
                </FormField>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Garage">
                  <div className="w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 font-bold text-slate-800">
                    {userGarage === "BH" ? "Bond Hill (BH)" : "Queensgate (QG)"}
                  </div>
                </FormField>

                <FormField label="Run Category">
                  <RunCategorySelect
                    value={runCategory}
                    onChange={setRunCategory}
                  />
                </FormField>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <FormField label="Run #">
                <input
                  value={runNumber}
                  onChange={(e) => setRunNumber(e.target.value)}
                  className={inputClass}
                  placeholder="250"
                  required
                />
              </FormField>

              <FormField label="Route">
                <input
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  className={inputClass}
                  placeholder="21&6"
                />
              </FormField>

              <FormField label="Block">
                <input
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  className={inputClass}
                  placeholder="6 - 25"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="On Location">
                <input
                  value={onLocation}
                  onChange={(e) => setOnLocation(e.target.value)}
                  className={inputClass}
                  placeholder="QG-G"
                />
              </FormField>

              <FormField label="On Time">
                <input
                  value={onTime}
                  onChange={(e) => setOnTime(e.target.value)}
                  className={inputClass}
                  placeholder="5:40 AM"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Off Time">
                <input
                  value={offTime}
                  onChange={(e) => setOffTime(e.target.value)}
                  className={inputClass}
                  placeholder="3:40 PM"
                />
              </FormField>

              <FormField label="Off Location">
                <input
                  value={offLocation}
                  onChange={(e) => setOffLocation(e.target.value)}
                  className={inputClass}
                  placeholder="MoCo"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField label="Piece Time">
                <input
                  value={pieceTime}
                  onChange={(e) => setPieceTime(e.target.value)}
                  className={inputClass}
                  placeholder="10h00"
                />
              </FormField>

              <FormField label="Platform Time">
                <input
                  value={platformTime}
                  onChange={(e) => setPlatformTime(e.target.value)}
                  className={inputClass}
                  placeholder="9h45"
                />
              </FormField>

              <FormField label="Total Time">
                <input
                  value={totalTime}
                  onChange={(e) => setTotalTime(e.target.value)}
                  className={inputClass}
                  placeholder="10h15"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField label="Spread Pay">
                <input
                  value={spreadPay}
                  onChange={(e) => setSpreadPay(e.target.value)}
                  className={inputClass}
                  placeholder="0h00"
                />
              </FormField>

              <FormField label="Markup Time">
                <input
                  value={markupTime}
                  onChange={(e) => setMarkupTime(e.target.value)}
                  className={inputClass}
                  placeholder="0h00"
                />
              </FormField>

              <FormField label="Line Premium">
                <input
                  value={linePremium}
                  onChange={(e) => setLinePremium(e.target.value)}
                  className={inputClass}
                  placeholder="0h00"
                />
              </FormField>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-slate-950 px-4 py-3 font-bold text-white hover:bg-slate-800 transition disabled:opacity-60"
            >
              {saving ? "Saving Run..." : "Add Run"}
            </button>
          </form>
        </div>

        <div
          className={`col-span-3 rounded-2xl border shadow-sm p-6 ${
            isSaturday
              ? "bg-sky-100 border-sky-300"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Bus className="text-blue-700" />
              <div>
                <h3 className="text-xl font-bold text-slate-950">
                  Run Sheet Preview
                </h3>
                <p className="text-sm text-slate-700">
                  Showing only the garage tied to this user for non-system picks.
                </p>
              </div>
            </div>

            <button
              onClick={() => loadRuns()}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
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
        </div>
      </section>
    </DashboardLayout>
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

function RunCategorySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
    >
      <option value="day">Day Run</option>
      <option value="late">Late Run</option>
      <option value="split">Split Run</option>
      <option value="extra">Extra</option>
    </select>
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