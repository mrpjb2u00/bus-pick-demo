"use client";

import { useMemo, useState } from "react";

const sundayRuns = [
  "375 - 21&6 - 5:40 AM to 3:40 PM",
  "376 - 6 - 6:11 AM to 3:22 PM",
  "378 - 19&16 - 4:14 AM to 2:06 PM",
  "381 - 17 - 3:18 AM to 11:36 AM",
];

const weekdayRuns = [
  "001 - 33&6 - 3:15 AM to 10:51 AM",
  "002 - 21&6 - 4:54 AM to 2:09 PM",
  "004 - 16 - 3:38 AM to 11:29 AM",
  "005 - 16 - 4:08 AM to 11:59 AM",
  "006 - 16&19 - 4:36 AM to 4:08 PM",
  "008 - 16 - 6:00 AM to 4:26 PM",
  "016 - 17 - 7:42 AM to 6:27 PM",
];

const saturdayRuns = [
  "250 - 21 - 5:10 AM to 2:25 PM",
  "251 - 6 - 6:00 AM to 3:30 PM",
  "253 - 16 - 5:00 AM to 2:10 PM",
  "256 - 21&6 - 7:00 AM to 5:10 PM",
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

export default function PickPage() {
  const [isBoardOperator, setIsBoardOperator] = useState(false);

  const [selectedSunday, setSelectedSunday] = useState("");
  const [selectedMonday, setSelectedMonday] = useState("");
  const [selectedTuesday, setSelectedTuesday] = useState("");
  const [selectedWednesday, setSelectedWednesday] = useState("");
  const [selectedThursday, setSelectedThursday] = useState("");
  const [selectedFriday, setSelectedFriday] = useState("");
  const [selectedSaturday, setSelectedSaturday] = useState("");
  const [offDay1, setOffDay1] = useState("");
  const [offDay2, setOffDay2] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const disabledDays = useMemo(() => {
    return new Set([offDay1, offDay2].filter(Boolean));
  }, [offDay1, offDay2]);

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
      setSelectedSaturday("");
      setOffDay1("");
      setOffDay2("");
    }
  };

  const handleOffDay1Change = (value: string) => {
    setErrorMessage("");
    setSuccessMessage("");
    setOffDay1(value);

    if (value && value === offDay2) {
      setOffDay2("");
    }
  };

  const handleOffDay2Change = (value: string) => {
    setErrorMessage("");
    setSuccessMessage("");
    setOffDay2(value);

    if (value && value === offDay1) {
      setOffDay1("");
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
                Any selected off days will disable run selection for those days.
              </p>
            )}
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-pink-700">Sunday Work</h2>
            <select
              value={selectedSunday}
              onChange={(e) => {
                setSelectedSunday(e.target.value);
                setErrorMessage("");
                setSuccessMessage("");
              }}
              disabled={isSundayDisabled}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="">
                {isSundayDisabled ? "Sunday disabled" : "Select Sunday run"}
              </option>
              {sundayRuns.map((run) => (
                <option key={run} value={run}>
                  {run}
                </option>
              ))}
            </select>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Weekday Work</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Monday
                </label>
                <select
                  value={selectedMonday}
                  onChange={(e) => {
                    setSelectedMonday(e.target.value);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  disabled={isMondayDisabled}
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">
                    {isMondayDisabled ? "Monday disabled" : "Select Monday run"}
                  </option>
                  {weekdayRuns.map((run) => (
                    <option key={`mon-${run}`} value={run}>
                      {run}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Tuesday
                </label>
                <select
                  value={selectedTuesday}
                  onChange={(e) => {
                    setSelectedTuesday(e.target.value);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  disabled={isTuesdayDisabled}
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">
                    {isTuesdayDisabled ? "Tuesday disabled" : "Select Tuesday run"}
                  </option>
                  {weekdayRuns.map((run) => (
                    <option key={`tue-${run}`} value={run}>
                      {run}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Wednesday
                </label>
                <select
                  value={selectedWednesday}
                  onChange={(e) => {
                    setSelectedWednesday(e.target.value);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  disabled={isWednesdayDisabled}
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">
                    {isWednesdayDisabled ? "Wednesday disabled" : "Select Wednesday run"}
                  </option>
                  {weekdayRuns.map((run) => (
                    <option key={`wed-${run}`} value={run}>
                      {run}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Thursday
                </label>
                <select
                  value={selectedThursday}
                  onChange={(e) => {
                    setSelectedThursday(e.target.value);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  disabled={isThursdayDisabled}
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">
                    {isThursdayDisabled ? "Thursday disabled" : "Select Thursday run"}
                  </option>
                  {weekdayRuns.map((run) => (
                    <option key={`thu-${run}`} value={run}>
                      {run}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Friday
                </label>
                <select
                  value={selectedFriday}
                  onChange={(e) => {
                    setSelectedFriday(e.target.value);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  disabled={isFridayDisabled}
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">
                    {isFridayDisabled ? "Friday disabled" : "Select Friday run"}
                  </option>
                  {weekdayRuns.map((run) => (
                    <option key={`fri-${run}`} value={run}>
                      {run}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-blue-700">Saturday Work</h2>
            <select
              value={selectedSaturday}
              onChange={(e) => {
                setSelectedSaturday(e.target.value);
                setErrorMessage("");
                setSuccessMessage("");
              }}
              disabled={isSaturdayDisabled}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="">
                {isSaturdayDisabled ? "Saturday disabled" : "Select Saturday run"}
              </option>
              {saturdayRuns.map((run) => (
                <option key={run} value={run}>
                  {run}
                </option>
              ))}
            </select>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Review</h2>

            <div className="space-y-3 text-slate-800">
              <p>
                <span className="font-semibold">Board / Sub Operator:</span>{" "}
                {isBoardOperator ? "Yes" : "No"}
              </p>
              <p>
                <span className="font-semibold">Off Day 1:</span>{" "}
                {offDay1 || "Not selected"}
              </p>
              <p>
                <span className="font-semibold">Off Day 2:</span>{" "}
                {offDay2 || "Not selected"}
              </p>
              <p>
                <span className="font-semibold">Sunday:</span>{" "}
                {selectedSunday || "Not selected"}
              </p>
              <p>
                <span className="font-semibold">Monday:</span>{" "}
                {selectedMonday || "Not selected"}
              </p>
              <p>
                <span className="font-semibold">Tuesday:</span>{" "}
                {selectedTuesday || "Not selected"}
              </p>
              <p>
                <span className="font-semibold">Wednesday:</span>{" "}
                {selectedWednesday || "Not selected"}
              </p>
              <p>
                <span className="font-semibold">Thursday:</span>{" "}
                {selectedThursday || "Not selected"}
              </p>
              <p>
                <span className="font-semibold">Friday:</span>{" "}
                {selectedFriday || "Not selected"}
              </p>
              <p>
                <span className="font-semibold">Saturday:</span>{" "}
                {selectedSaturday || "Not selected"}
              </p>
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