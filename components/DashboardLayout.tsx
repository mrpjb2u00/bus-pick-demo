import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

type Profile = {
  full_name: string | null;
  role: string;
  garage_code: string | null;
  badge_number: string | null;
};

export default function DashboardLayout({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="lg:hidden min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="max-w-md rounded-2xl bg-white p-8 text-slate-900 shadow-2xl text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-blue-700 font-bold mb-4">
            Desktop Required
          </p>

          <h1 className="text-2xl font-bold mb-4">
            Clerk Dashboard Requires a Larger Screen
          </h1>

          <p className="text-slate-600">
            This dashboard is designed for laptop and desktop use because clerks
            need to view picks, drivers, runs, submissions, and reports at the
            same time.
          </p>

          <p className="text-slate-500 text-sm mt-5">
            Please open this page on a larger screen to continue.
          </p>
        </div>
      </div>

      <div className="hidden lg:flex min-h-screen bg-slate-100">
        <Sidebar />

        <div className="flex-1 min-w-0">
          <TopBar profile={profile} />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </>
  );
}