import {
  CalendarDays,
  FileUp,
  Home,
  Route,
  Settings,
  Users,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: Home },
  { label: "Holiday Picks", icon: CalendarDays },
  { label: "Drivers / Workers", icon: Users },
  { label: "Runs", icon: Route },
  { label: "PDF Upload", icon: FileUp },
  { label: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-72 min-h-screen bg-slate-950 text-white flex-col">
      <div className="p-6 border-b border-slate-800">
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">
          Transit Ops
        </p>
        <h2 className="text-2xl font-bold mt-2">Bus Pick</h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        Clerk-first rebuild · July 4th Pick
      </div>
    </aside>
  );
}