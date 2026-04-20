"use client";

import { useMemo, useState } from "react";

const weekdayExtras = [
  "188 - 19 - 5:55 AM to 8:46 AM",
  "189 - 21 - 6:21 AM to 8:30 AM",
  "190 - 23 - 6:15 AM to 8:24 AM",
  "191 - 29 - 5:29 AM to 8:29 AM",
  "192 - 29 - 5:57 AM to 8:59 AM",
];

const offDayOptions = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

type PickPageClientProps = {
  initialSunday: string;
  initialMonday: string;
  initialTuesday: string;
  initialWednesday: string;
  initialThursday: string;
  initialFriday: string;
  initialSaturday: string;
};

export default function PickPageClient({
  initialSunday,
  initialMonday,
  initialTuesday,
  initialWednesday,
  initialThursday,
  initialFriday,
  initialSaturday,
}: PickPageClientProps) {
  const [isBoardOperator, setIsBoardOperator] = useState(false);

  const [selectedSunday, setSelectedSunday] = useState(initialSunday);
  const [selectedMonday, setSelectedMonday] = useState(initialMonday);
  const [selectedTuesday, setSelectedTuesday] = useState(initialTuesday);
  const [selectedWednesday, setSelectedWednesday] = useState(initialWednesday);
  const [selectedThursday, setSelectedThursday] = useState(initialThursday);
  const [selectedFriday, setSelectedFriday] = useState(initialFriday);

  const [selectedMondayExtra, setSelectedMondayExtra] = useState("");
  const [selectedTuesdayExtra, setSelectedTuesdayExtra] = useState("");
  const [selectedWednesdayExtra, setSelectedWednesdayExtra] = useState("");
  const [selectedThursdayExtra, setSelectedThursdayExtra] = useState("");
  const [selectedFridayExtra, setSelectedFridayExtra] = useState("");

  const [selectedSaturday, setSelectedSaturday] = useState(initialSaturday);
  const [offDay1, setOffDay1] = useState("");
  const [offDay2, setOffDay2] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const disabledDays = useMemo(() => {
    return new Set([offDay1, offDay2].filter(Boolean));
  }, [offDay1, offDay2]);

  const clearSelectionsForDay = (day: string) => {
    switch (day) {
      case "Sunday":
        setSelectedSunday("");
        break;
      case "Monday":
        setSelectedMonday("");
        setSelectedMondayExtra("");
        break;
      case "Tuesday":
        setSelectedTuesday("");
        setSelectedTuesdayExtra("");
        break;
      case "Wednesday":
        setSelectedWednesday("");
        setSelectedWednesdayExtra("");
        break;
      case "Thursday":
        setSelectedThursday("");
        setSelectedThursdayExtra("");
        break;
      case "Friday":
        setSelectedFriday("");
        setSelectedFridayExtra("");
        break;
      case "Saturday":
        setSelectedSaturday("");
        break;
      default:
        break;
    }
  };

  const handleBoardToggle = () => {
    const nextValue = !isBoardOperator;
    setIsBoardOperator(nextValue);
    setErrorMessage("");
    setSuccessMessage("");

    if (nextValue) {
      setSelectedSunday("");
      setSelectedMonday("");
      setSelectedTuesday("");
      setSelectedWednesday("");
      setSelectedThursday("");
      setSelectedFriday("");

      setSelectedMondayExtra("");
      setSelectedTuesdayExtra("");
      setSelectedWednesdayExtra("");
      setSelectedThursdayExtra("");
      setSelectedFridayExtra("");

      setSelectedSaturday("");
      setOffDay1("");
      setOffDay2("");
    }
  };

  const handleOffDay1Change = (value: string) => {
    setErrorMessage("");
    setSuccessMessage("");

    const currentOffDay2 = offDay2;

    if (value && value === currentOffDay2) {
      setOffDay2("");
    }

    setOffDay1(value);

    if (value) {
      clearSelectionsForDay(value);
    }
  };

  const handleOffDay2Change = (value: string) => {
    setErrorMessage("");
    setSuccessMessage("");

    const currentOffDay1 = offDay1;

    if (value && value === currentOffDay1) {
      setOffDay1("");
    }

    setOffDay2(value);

    if (value) {
      clearSelectionsForDay(value);
    }
  };

  const isSundayDisabled = isBoardOperator || disabledDays.has("Sunday");
  const isMondayDisabled = isBoardOperator || disabledDays.has("Monday");
  const isTuesdayDisabled = isBoardOperator || disabledDays.has("Tuesday");
  const isWednesdayDisabled = isBoardOperator || disabledDays.has("Wednesday");
  const isThursdayDisabled = isBoardOperator || disabledDays.has("Thursday");
  const isFridayDisabled = isBoardOperator || disabledDays.has("Friday");
  const isSaturdayDisabled = isBoardOperator || disabledDays.has("Saturday");

  const handleSubmit = () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (isBoardOperator) {
      setSuccessMessage(
        "Board / Sub Operator selection recorded for this sample build."
      );
      return;
    }

    if (!offDay1 || !offDay2) {
      setErrorMessage("Please select both off days.");
      return;
    }

    if (offDay1 === offDay2) {
      setErrorMessage("Off Day 1 and Off Day 2 cannot be the same.");
      return;
    }

    if (!isSundayDisabled && !selectedSunday) {
      setErrorMessage("Please select a Sunday run.");
      return;
    }

    if (!isMondayDisabled && !selectedMonday) {
      setErrorMessage("Please select a Monday run.");
      return;
    }

    if (!isTuesdayDisabled && !selectedTuesday) {
      setErrorMessage("Please select a Tuesday run.");
      return;
    }

    if (!isWednesdayDisabled && !selectedWednesday) {
      setErrorMessage("Please select a Wednesday run.");
      return;
    }

    if (!isThursdayDisabled && !selectedThursday) {
      setErrorMessage("Please select a Thursday run.");
      return;
    }

    if (!isFridayDisabled && !selectedFriday) {
      setErrorMessage("Please select a Friday run.");
      return;
    }

    if (!isSaturdayDisabled && !selectedSaturday) {
      setErrorMessage("Please select a Saturday run.");
      return;
    }

    setSuccessMessage("Weekly pick is valid and ready for submission.");
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Metro Work Pick Demo
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            Weekly Pick Builder
          </h1>
          <p className="mt-2 text-slate-600">
            Choose board status, off days, then select your work for the remaining days.
          </p>
        </div>

        <div className="grid gap-6">
          <section className="rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Board / Sub Operator Option
            </h2>

            <label className="flex items-center gap-3 text-slate-800">
              <input
                type="checkbox"
                checked={isBoardOperator}
                onChange={handleBoardToggle}
                className="h-5 w-5"
              />
              <span className="font-medium">
                I want to be on the board (sub operator)
              </span>
            </label>

            <p className="mt-3 text-sm text-slate-600">
              When selected, run and off-day choices are disabled for this sample build.
            </p>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Off Days First</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <select
                value={offDay1}
                onChange={(e) => handleOffDay1Change(e.target.value)}
                disabled={isBoardOperator}
                className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">Select Off Day 1</option>
                {offDayOptions.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>

              <select
                value={offDay2}
                onChange={(e) => handleOffDay2Change(e.target.value)}
                disabled={isBoardOperator}
                className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">Select Off Day 2</option>
                {offDayOptions.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            {!isBoardOperator && (
              <p className="mt-3 text-sm text-slate-600">
                Any selected off days will disable run selection for those days and clear any existing choices for that day.
              </p>
            )}
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-pink-700">Sunday Work</h2>

            <div className="rounded-xl border border-pink-200 bg-pink-50 p-4">
              <p className="text-sm font-medium text-slate-600">Selected Sunday Run</p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {selectedSunday || "No Sunday run selected yet"}
              </p>

              <a
                href="/pick/sunday"
                className={`mt-4 inline-flex rounded-lg px-4 py-2 font-semibold text-white ${
                  isSundayDisabled
                    ? "pointer-events-none bg-slate-400"
                    : "bg-pink-600 hover:bg-pink-700"
                }`}
              >
                {isSundayDisabled ? "Sunday Disabled" : "Choose Sunday Run"}
              </a>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Weekday Work</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Monday
                </label>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-600">Selected Monday Run</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">
                    {selectedMonday || "No Monday run selected yet"}
                  </p>

                  <a
                    href="/pick/monday"
                    className={`mt-4 inline-flex rounded-lg px-4 py-2 font-semibold text-white ${
                      isMondayDisabled
                        ? "pointer-events-none bg-slate-400"
                        : "bg-slate-700 hover:bg-slate-800"
                    }`}
                  >
                    {isMondayDisabled ? "Monday Disabled" : "Choose Monday Run"}
                  </a>
                </div>

                <label className="mb-2 mt-4 block text-sm font-medium text-emerald-700">
                  Monday Extra (Optional)
                </label>
                <select
                  value={selectedMondayExtra}
                  onChange={(e) => {
                    setSelectedMondayExtra(e.target.value);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  disabled={isMondayDisabled}
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">
                    {isMondayDisabled ? "Monday extra disabled" : "Select Monday extra"}
                  </option>
                  {weekdayExtras.map((extra) => (
                    <option key={`mon-extra-${extra}`} value={extra}>
                      {extra}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Tuesday
                </label>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-600">Selected Tuesday Run</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">
                    {selectedTuesday || "No Tuesday run selected yet"}
                  </p>

                  <a
                    href="/pick/tuesday"
                    className={`mt-4 inline-flex rounded-lg px-4 py-2 font-semibold text-white ${
                      isTuesdayDisabled
                        ? "pointer-events-none bg-slate-400"
                        : "bg-slate-700 hover:bg-slate-800"
                    }`}
                  >
                    {isTuesdayDisabled ? "Tuesday Disabled" : "Choose Tuesday Run"}
                  </a>
                </div>

                <label className="mb-2 mt-4 block text-sm font-medium text-emerald-700">
                  Tuesday Extra (Optional)
                </label>
                <select
                  value={selectedTuesdayExtra}
                  onChange={(e) => {
                    setSelectedTuesdayExtra(e.target.value);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  disabled={isTuesdayDisabled}
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">
                    {isTuesdayDisabled ? "Tuesday extra disabled" : "Select Tuesday extra"}
                  </option>
                  {weekdayExtras.map((extra) => (
                    <option key={`tue-extra-${extra}`} value={extra}>
                      {extra}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Wednesday
                </label>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-600">Selected Wednesday Run</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">
                    {selectedWednesday || "No Wednesday run selected yet"}
                  </p>

                  <a
                    href="/pick/wednesday"
                    className={`mt-4 inline-flex rounded-lg px-4 py-2 font-semibold text-white ${
                      isWednesdayDisabled
                        ? "pointer-events-none bg-slate-400"
                        : "bg-slate-700 hover:bg-slate-800"
                    }`}
                  >
                    {isWednesdayDisabled ? "Wednesday Disabled" : "Choose Wednesday Run"}
                  </a>
                </div>

                <label className="mb-2 mt-4 block text-sm font-medium text-emerald-700">
                  Wednesday Extra (Optional)
                </label>
                <select
                  value={selectedWednesdayExtra}
                  onChange={(e) => {
                    setSelectedWednesdayExtra(e.target.value);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  disabled={isWednesdayDisabled}
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">
                    {isWednesdayDisabled ? "Wednesday extra disabled" : "Select Wednesday extra"}
                  </option>
                  {weekdayExtras.map((extra) => (
                    <option key={`wed-extra-${extra}`} value={extra}>
                      {extra}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Thursday
                </label>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-600">Selected Thursday Run</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">
                    {selectedThursday || "No Thursday run selected yet"}
                  </p>

                  <a
                    href="/pick/thursday"
                    className={`mt-4 inline-flex rounded-lg px-4 py-2 font-semibold text-white ${
                      isThursdayDisabled
                        ? "pointer-events-none bg-slate-400"
                        : "bg-slate-700 hover:bg-slate-800"
                    }`}
                  >
                    {isThursdayDisabled ? "Thursday Disabled" : "Choose Thursday Run"}
                  </a>
                </div>

                <label className="mb-2 mt-4 block text-sm font-medium text-emerald-700">
                  Thursday Extra (Optional)
                </label>
                <select
                  value={selectedThursdayExtra}
                  onChange={(e) => {
                    setSelectedThursdayExtra(e.target.value);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  disabled={isThursdayDisabled}
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">
                    {isThursdayDisabled ? "Thursday extra disabled" : "Select Thursday extra"}
                  </option>
                  {weekdayExtras.map((extra) => (
                    <option key={`thu-extra-${extra}`} value={extra}>
                      {extra}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Friday
                </label>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-600">Selected Friday Run</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">
                    {selectedFriday || "No Friday run selected yet"}
                  </p>

                  <a
                    href="/pick/friday"
                    className={`mt-4 inline-flex rounded-lg px-4 py-2 font-semibold text-white ${
                      isFridayDisabled
                        ? "pointer-events-none bg-slate-400"
                        : "bg-slate-700 hover:bg-slate-800"
                    }`}
                  >
                    {isFridayDisabled ? "Friday Disabled" : "Choose Friday Run"}
                  </a>
                </div>

                <label className="mb-2 mt-4 block text-sm font-medium text-emerald-700">
                  Friday Extra (Optional)
                </label>
                <select
                  value={selectedFridayExtra}
                  onChange={(e) => {
                    setSelectedFridayExtra(e.target.value);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  disabled={isFridayDisabled}
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">
                    {isFridayDisabled ? "Friday extra disabled" : "Select Friday extra"}
                  </option>
                  {weekdayExtras.map((extra) => (
                    <option key={`fri-extra-${extra}`} value={extra}>
                      {extra}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-blue-700">Saturday Work</h2>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-medium text-slate-600">Selected Saturday Run</p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {selectedSaturday || "No Saturday run selected yet"}
              </p>

              <a
                href="/pick/saturday"
                className={`mt-4 inline-flex rounded-lg px-4 py-2 font-semibold text-white ${
                  isSaturdayDisabled
                    ? "pointer-events-none bg-slate-400"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isSaturdayDisabled ? "Saturday Disabled" : "Choose Saturday Run"}
              </a>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Review</h2>

            <div className="space-y-3 text-slate-800">
              <p><span className="font-semibold">Board / Sub Operator:</span> {isBoardOperator ? "Yes" : "No"}</p>
              <p><span className="font-semibold">Off Day 1:</span> {offDay1 || "Not selected"}</p>
              <p><span className="font-semibold">Off Day 2:</span> {offDay2 || "Not selected"}</p>
              <p><span className="font-semibold">Sunday:</span> {selectedSunday || "Not selected"}</p>
              <p><span className="font-semibold">Monday:</span> {selectedMonday || "Not selected"}</p>
              <p><span className="font-semibold">Monday Extra:</span> {selectedMondayExtra || "Not selected"}</p>
              <p><span className="font-semibold">Tuesday:</span> {selectedTuesday || "Not selected"}</p>
              <p><span className="font-semibold">Tuesday Extra:</span> {selectedTuesdayExtra || "Not selected"}</p>
              <p><span className="font-semibold">Wednesday:</span> {selectedWednesday || "Not selected"}</p>
              <p><span className="font-semibold">Wednesday Extra:</span> {selectedWednesdayExtra || "Not selected"}</p>
              <p><span className="font-semibold">Thursday:</span> {selectedThursday || "Not selected"}</p>
              <p><span className="font-semibold">Thursday Extra:</span> {selectedThursdayExtra || "Not selected"}</p>
              <p><span className="font-semibold">Friday:</span> {selectedFriday || "Not selected"}</p>
              <p><span className="font-semibold">Friday Extra:</span> {selectedFridayExtra || "Not selected"}</p>
              <p><span className="font-semibold">Saturday:</span> {selectedSaturday || "Not selected"}</p>
            </div>

            {errorMessage && (
              <div className="mt-6 rounded-lg bg-red-100 px-4 py-3 text-sm font-medium text-red-700">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="mt-6 rounded-lg bg-green-100 px-4 py-3 text-sm font-medium text-green-700">
                {successMessage}
              </div>
            )}

            <button
              className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              onClick={handleSubmit}
            >
              Submit Weekly Pick
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}