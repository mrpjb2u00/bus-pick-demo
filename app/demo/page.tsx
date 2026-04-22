"use client";

import { useState } from "react";

const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT", "SUB"];

const rows = [
  "1ST CHOICE",
  "EXTRA'S",
  "2ND CHOICE",
  "EXTRA'S",
  "3RD CHOICE",
  "EXTRA'S",
  "4TH CHOICE",
  "EXTRA'S",
];

export default function DemoSheet() {
  const [grid, setGrid] = useState<Record<string, string>>({});
  const [vacationWeeks, setVacationWeeks] = useState<number[]>([]);

  const handleClick = (row: string, day: string) => {
    const key = `${row}-${day}`;
    const currentValue = grid[key] || "";

    const value = prompt(
      `Enter value for ${row} - ${day}\n\nExamples:\n- run number like 375\n- X for off day\n- X for SUB\n- leave blank to clear`,
      currentValue
    );

    if (value === null) return;

    const cleaned = value.trim();

    setGrid((prev) => ({
      ...prev,
      [key]: cleaned,
    }));
  };

  const toggleVacationWeek = (week: number) => {
    setVacationWeeks((prev) =>
      prev.includes(week)
        ? prev.filter((w) => w !== week)
        : [...prev, week].sort((a, b) => a - b)
    );
  };

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-6 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-md sm:p-8">
          <div className="border-b border-slate-300 pb-4">
            <h1 className="text-center text-2xl font-bold tracking-wide sm:text-3xl">
              SYSTEM PICK CHOICE SHEET
            </h1>
            <p className="mt-2 text-center text-sm text-slate-600">
              Demo prototype for presentation purposes
            </p>
          </div>

          <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">NAME:</span>
                <span className="min-w-[220px] border-b border-slate-500 px-2 py-1">
                  Paul Browner
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">SELECT A DIVISION:</span>
                <span className="min-w-[120px] border-b border-slate-500 px-2 py-1">
                  QUEENSGATE
                </span>
                <span className="min-w-[120px] border-b border-slate-500 px-2 py-1">
                  BOND HILL
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">BADGE:</span>
                <span className="min-w-[120px] border-b border-slate-500 px-2 py-1">
                  4021
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">PICK TYPE:</span>
                <span className="min-w-[160px] border-b border-slate-500 px-2 py-1">
                  SYSTEM PICK
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-sm leading-6 text-slate-800">
            <p>
              WRITE IN THE RUN NUMBERS ON THE DAYS YOU WISH A SPECIFIC RUN AND PLACE AN
              <span className="font-bold"> “X” </span>
              ON THE DAYS YOU WISH TO BE OFF. CHOOSE SUB BOARD BY AN
              <span className="font-bold"> “X” </span>
              IN THE SUB COLUMN.
            </p>
          </div>

          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-400">
            <table className="w-full min-w-[900px] border-collapse text-center text-sm">
              <thead>
                <tr className="bg-slate-200">
                  <th className="border border-slate-400 p-3 text-left font-bold">
                    
                  </th>
                  {days.map((day) => (
                    <th
                      key={day}
                      className="border border-slate-400 p-3 font-bold tracking-wide"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => (
                  <tr key={`${row}-${index}`}>
                    <td className="border border-slate-400 bg-slate-100 p-3 text-left font-bold">
                      {row}
                    </td>

                    {days.map((day) => {
                      const key = `${row}-${day}`;
                      const value = grid[key] || "";
                      const isOff = value.toUpperCase() === "X";
                      const isSub = day === "SUB" && value.toUpperCase() === "X";

                      return (
                        <td
                          key={key}
                          onClick={() => handleClick(row, day)}
                          className={`h-14 border border-slate-400 p-2 align-middle cursor-pointer transition ${
                            isOff || isSub
                              ? "bg-amber-100 font-bold text-slate-900"
                              : "bg-white text-slate-900 hover:bg-blue-50"
                          }`}
                        >
                          <span className="block text-base font-semibold">
                            {value}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div className="space-y-2">
              <p>
                <span className="font-semibold">I AM ENTITLED TO:</span>{" "}
                1&nbsp;&nbsp;2&nbsp;&nbsp;3&nbsp;&nbsp;4&nbsp;&nbsp;5&nbsp;&nbsp;6 WEEKS OF VACATION
              </p>
              <p>
                <span className="font-semibold">I WISH TO DEPOSIT:</span>{" "}
                1&nbsp;&nbsp;2 WEEKS IN THE VACATION BANK
              </p>
              <p>
                <span className="font-semibold">I WISH TO WITHDRAW:</span>{" "}
                1&nbsp;&nbsp;2&nbsp;&nbsp;3&nbsp;&nbsp;4&nbsp;&nbsp;5&nbsp;&nbsp;6 WEEKS FROM THE BANK VACATION
              </p>
              <p>
                <span className="font-semibold">I WISH TO TAKE PAY-IN-LIEU OF:</span>{" "}
                1&nbsp;&nbsp;2 WEEKS OF VACATION
              </p>
            </div>

            <div className="rounded-xl border border-slate-300 bg-slate-50 p-4">
              <p className="font-semibold">Selected Vacation Weeks</p>
              <p className="mt-2 text-slate-700">
                {vacationWeeks.length > 0
                  ? vacationWeeks.map((w) => `Week ${w}`).join(", ")
                  : "None selected yet"}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-300 bg-white p-4">
            <h2 className="text-lg font-bold">VACATION CHOICES</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              PLEASE LIST YOUR VACATION CHOICES IN ASCENDING ORDER. IF YOU ARE
              ENTITLED TO AT LEAST (2) WEEKS AND WISH TO DESIGNATE DAY-AT-A-TIME,
              PLEASE CIRCLE THE WEEKS YOU WISH TO DESIGNATE.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[1, 2, 3, 4, 5, 6].map((week) => {
                const isSelected = vacationWeeks.includes(week);

                return (
                  <button
                    key={week}
                    onClick={() => toggleVacationWeek(week)}
                    className={`rounded-lg border px-3 py-3 text-sm font-semibold transition ${
                      isSelected
                        ? "border-green-600 bg-green-100 text-green-800"
                        : "border-slate-300 bg-white text-slate-900 hover:bg-green-50"
                    }`}
                  >
                    VACATION WEEK {week}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="font-semibold">CLERK’S INITIALS</p>
              <div className="mt-2 h-10 border-b border-slate-500" />
            </div>

            <div>
              <p className="font-semibold">MANAGER</p>
              <div className="mt-2 h-10 border-b border-slate-500" />
            </div>

            <div>
              <p className="font-semibold">DATE</p>
              <div className="mt-2 h-10 border-b border-slate-500" />
            </div>
          </div>

          <div className="mt-6">
            <p className="font-semibold text-sm">OPERATOR SIGNATURE</p>
            <div className="mt-2 h-10 border-b border-slate-500" />
          </div>

          <button className="mt-8 w-full rounded-lg bg-blue-600 py-3 text-base font-semibold text-white hover:bg-blue-700">
            Submit Demo Sheet
          </button>
        </div>
      </div>
    </main>
  );
}