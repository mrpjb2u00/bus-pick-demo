"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bus,
  CalendarDays,
  ClipboardList,
  FileUp,
  Monitor,
  Radio,
  Settings,
  Users,
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
  holiday_date: string | null;
  observed_date: string | null;
  service_date: string | null;
  service_schedule: string | null;
  schedule_color: string | null;
  notes: string | null;
};

export default function HolidayPickPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [pickEvent, setPickEvent] = useState<PickEvent | null>(null);
  const [driverCount, setDriverCount] = useState(0);
  const [runCount, setRunCount] = useState(0);
  const [boardSlotCount, setBoardSlotCount] = useState(0);
  const [beOffSlots, setBeOffSlots] = useState(0);
  const [standbySlots, setStandbySlots] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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

      const garageCode = profileData.garage_code || "QG";

      const { data: pickData } = await supabase
        .from("pick_events")
        .select("*")
        .eq("title", "July 4th Holiday Pick")
        .maybeSingle();

      if (!pickData) {
        setErrorMessage("Could not find the July 4th Holiday Pick.");
        setLoading(false);
        return;
      }

      setProfile(profileData);
      setPickEvent(pickData);

      const { count: workersCount } = await supabase
        .from("workers")
        .select("*", { count: "exact", head: true })
        .eq("garage_code", garageCode);

      setDriverCount(workersCount || 0);

      const { count: runsTotal } = await supabase
        .from("runs")
        .select("*", { count: "exact", head: true })
        .eq("pick_event_id", pickData.id)
        .eq("garage_code", garageCode);

      setRunCount(runsTotal || 0);

      const { count: slotsTotal } = await supabase
        .from("holiday_board_slots")
        .select("*", { count: "exact", head: true })
        .eq("pick_event_id", pickData.id)
        .eq("garage_code", garageCode);

      setBoardSlotCount(slotsTotal || 0);

      const { data: limitsData } = await supabase
        .from("holiday_pick_limits")
        .select("*")
        .eq("pick_event_id", pickData.id)
        .eq("garage_code", garageCode)
        .maybeSingle();

      setBeOffSlots(limitsData?.be_off_total_slots || 0);
      setStandbySlots(limitsData?.standby_total_slots || 0);

      setLoading(false);
    }

    loadPage();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#07111f] text-white flex items-center justify-center">
        Loading holiday pick...
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

  const garageName =
    profile.garage_code === "BH" ? "Bond Hill" : "Queensgate";

  const isSaturday = pickEvent?.service_schedule === "saturday";

  return (
    <DashboardLayout profile={profile}>
      <section className="mb-6 flex items-start justify-between gap-6">
        <div>
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center gap-2 text-sm font-black text-[#1597d3]"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>

          <p className="text-sm uppercase tracking-[0.25em] text-[#1597d3] font-black">
            Holiday Pick Setup
          </p>

          <h1 className="mt-2 text-4xl font-black text-[#07111f]">
            {pickEvent?.title || "July 4th Holiday Pick"}
          </h1>

          <p className="mt-3 max-w-3xl text-slate-600">
            Prepare the holiday pick for {garageName}. Add runs, build the
            board, set Be Off / Stand-by slots, then manage the live approval
            workflow when the pick begins.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-right shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-black">
            Garage
          </p>

          <p className="mt-1 text-2xl font-black text-[#07111f]">
            {profile.garage_code}
          </p>
        </div>
      </section>

      {errorMessage && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {errorMessage}
        </div>
      )}

      <section
        className={`mb-6 rounded-3xl border p-6 shadow-sm ${
          isSaturday
            ? "border-[#1597d3] bg-[#dff6ff]"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
          <InfoCard
            icon={<CalendarDays />}
            label="Observed Date"
            value={formatDate(pickEvent?.observed_date || "2026-07-03")}
            detail="Friday before July 4th"
          />

          <InfoCard
            icon={<Bus />}
            label="Service Schedule"
            value={formatSchedule(pickEvent?.service_schedule || "saturday")}
            detail="Saturday = sky blue"
          />

          <InfoCard
            icon={<Users />}
            label="Drivers"
            value={String(driverCount)}
            detail={`${garageName} only`}
          />

          <InfoCard
            icon={<ClipboardList />}
            label="Runs"
            value={String(runCount)}
            detail="Available run records"
          />
        </div>

        {pickEvent?.notes && (
          <div className="mt-5 rounded-2xl bg-white/80 p-5 text-sm font-semibold text-slate-700">
            {pickEvent.notes}
          </div>
        )}
      </section>

      <section className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-4">
        <StatusCard
          title="Board Slots"
          value={String(boardSlotCount)}
          label="Sub-driver board choices"
          color="bg-[#1597d3]"
        />

        <StatusCard
          title="Be Off"
          value={String(beOffSlots)}
          label="Available off selections"
          color="bg-[#ef4f7a]"
        />

        <StatusCard
          title="Stand-by"
          value={String(standbySlots)}
          label="Available standby selections"
          color="bg-[#f47b20]"
        />

        <StatusCard
          title="Pick Status"
          value="Setup"
          label="Ready for live control"
          color="bg-[#52b947]"
        />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <ActionCard
          href="/dashboard/drivers"
          icon={<Users />}
          eyebrow="Workers"
          title="Add Drivers / Workers"
          text="Manually add drivers, verify seniority, and keep each garage separated."
          color="border-[#1597d3]"
        />

        <ActionCard
          href="/dashboard/runs"
          icon={<Bus />}
          eyebrow="Runs"
          title="Add Holiday Runs"
          text="Add runs manually or prepare for PDF upload and run categorization."
          color="border-[#52b947]"
        />

        <ActionCard
          href="/dashboard/board"
          icon={<Settings />}
          eyebrow="Board Setup"
          title="Board / Be Off / Stand-by"
          text="Create show-up times, board slots, Be Off slots, and Stand-by slots."
          color="border-[#f47b20]"
        />

        <ActionCard
          href="/dashboard/live-pick"
          icon={<Radio />}
          eyebrow="Live Pick"
          title="Clerk Approval Screen"
          text="Approve driver selections, process ranked choices, and manage the live pick."
          color="border-[#1597d3]"
          featured
        />

        <ActionCard
          href="/pick"
          icon={<Monitor />}
          eyebrow="Driver View"
          title="Preview Driver Pick"
          text="Open the mobile-friendly driver-facing pick screen."
          color="border-[#f7c948]"
        />

        <ActionCard
          href="#"
          icon={<FileUp />}
          eyebrow="Future"
          title="Upload Run PDF"
          text="Import real run sheets, classify ranges, and review parsed runs."
          color="border-slate-300"
          disabled
        />
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.25em] text-[#1597d3] font-black">
          Setup Checklist
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          <ChecklistItem done={driverCount > 0} text="Drivers/workers added for this garage" />
          <ChecklistItem done={runCount > 0} text="Holiday runs added for this garage" />
          <ChecklistItem done={boardSlotCount > 0} text="Board show-up times and slots created" />
          <ChecklistItem done={beOffSlots > 0} text="Be Off slots configured" />
          <ChecklistItem done={standbySlots > 0} text="Stand-by slots configured" />
          <ChecklistItem done text="Live clerk approval screen available" />
        </div>
      </section>
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
    <div className="rounded-2xl border border-white/70 bg-white p-5 shadow-sm">
      <div className="text-[#1597d3]">{icon}</div>

      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500 font-black">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black text-[#07111f]">{value}</p>

      <p className="mt-1 text-sm text-slate-600">{detail}</p>
    </div>
  );
}

function StatusCard({
  title,
  value,
  label,
  color,
}: {
  title: string;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-4 h-2 rounded-full ${color}`} />

      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-black">
        {title}
      </p>

      <p className="mt-2 text-4xl font-black text-[#07111f]">{value}</p>

      <p className="mt-1 text-sm text-slate-600">{label}</p>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  eyebrow,
  title,
  text,
  color,
  featured = false,
  disabled = false,
}: {
  href: string;
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  text: string;
  color: string;
  featured?: boolean;
  disabled?: boolean;
}) {
  const content = (
    <div
      className={`h-full rounded-3xl border-l-4 ${color} ${
        featured ? "bg-[#dff6ff]" : "bg-white"
      } p-6 shadow-sm transition ${
        disabled ? "opacity-60" : "hover:-translate-y-1 hover:shadow-lg"
      }`}
    >
      <div className="text-[#1597d3]">{icon}</div>

      <p className="mt-4 text-xs uppercase tracking-[0.25em] text-slate-500 font-black">
        {eyebrow}
      </p>

      <h3 className="mt-2 text-2xl font-black text-[#07111f]">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );

  if (disabled) return <div>{content}</div>;

  return <Link href={href}>{content}</Link>;
}

function ChecklistItem({ done, text }: { done: boolean; text: string }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
        done
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {done ? "✓" : "○"} {text}
    </div>
  );
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatSchedule(value: string) {
  if (value === "saturday") return "Saturday";
  if (value === "sunday") return "Sunday";
  if (value === "weekday") return "Weekday";
  return value;
}