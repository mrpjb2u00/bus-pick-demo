import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
        
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Metro Work Pick Demo
        </h1>

        <p className="text-slate-600 mb-6">
          A modern scheduling and pick system for bus operators.
        </p>

        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Login with Badge Number
          </Link>

          <Link
            href="/pick"
            className="block w-full rounded-lg bg-slate-700 px-4 py-3 font-semibold text-white hover:bg-slate-800"
          >
            Go to Demo Pick Page
          </Link>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Demo version for presentation purposes
        </p>
      </div>
    </main>
  );
}