
"use client";

import { useEffect, useState } from "react";
import { updatePatient } from "@/lib/db";

export default function GaitTest({ patientId, onComplete }) {
  const [status, setStatus] = useState("idle");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (status !== "connecting") return;

    const timer = setTimeout(() => {
      setStatus("recording");
      setCountdown(5);
    }, 1500);

    return () => clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    if (status !== "recording") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus("complete");
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (status !== "complete") return;

    let timeout;

    const saveResult = async () => {
      const mockScore = Math.floor(Math.random() * 101);

      await updatePatient(patientId, {
        gaitScore: mockScore,
      });

      timeout = setTimeout(() => {
        onComplete();
      }, 1000);
    };

    saveResult();

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [status, patientId, onComplete]);

  const handleStart = () => {
    setStatus("connecting");
  };

  const progress =
    status === "idle"
      ? 0
      : status === "connecting"
      ? 25
      : status === "recording"
      ? 65
      : 100;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* Header */}
        <div className="border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                Assessment 03 / 03
              </p>

              <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                Gait Assessment
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Knee movement and gait screening
              </p>
            </div>

            {/* Professional icon */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
              <div className="relative h-5 w-5">
                <div className="absolute left-1.5 top-0 h-2.5 w-2.5 rounded-full border-2 border-slate-600" />
                <div className="absolute left-1.5 top-2.5 h-2.5 w-1.5 rotate-20 rounded-full border-l-2 border-slate-600" />
                <div className="absolute left-2.5 top-3 h-2 w-1.5 -rotate-25 rounded-full border-l-2 border-slate-600" />
                <div className="absolute left-1.25 top-4.5 h-1.5 w-2 -rotate-30 rounded-full border-b-2 border-slate-600" />
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
              <span>Assessment progress</span>
              <span>{progress}%</span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* IDLE */}
        {status === "idle" && (
          <div className="p-6 sm:p-8">

            {/* Intro */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <div className="h-3 w-3 rounded-full bg-blue-600" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Ready for gait assessment
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                    The movement sensor will record walking patterns to identify
                    gait-related risk markers.
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Before starting
              </p>

              <div className="grid gap-3 sm:grid-cols-3">

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">
                    01
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    Fit the sensor
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Secure the knee sensor correctly before starting.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">
                    02
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    Check connection
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    The system will establish the sensor connection.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">
                    03
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    Walk normally
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Maintain your normal walking pace during recording.
                  </p>
                </div>

              </div>
            </div>

            <button
              type="button"
              onClick={handleStart}
              className="mt-7 w-full rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99]"
            >
              Start Gait Assessment
            </button>

            <p className="mt-3 text-center text-xs text-slate-400">
              Ensure the sensor is fitted correctly before continuing.
            </p>
          </div>
        )}

        {/* CONNECTING */}
        {status === "connecting" && (
          <div className="p-8 text-center sm:p-12">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-blue-100 bg-blue-50">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            </div>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.15em] text-blue-600">
              Device setup
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Connecting to sensor
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
              Establishing a connection with the knee movement sensor.
              Please remain ready for the assessment.
            </p>

            <div className="mx-auto mt-7 max-w-sm rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  Sensor status
                </span>

                <span className="flex items-center gap-2 font-medium text-amber-600">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Connecting
                </span>
              </div>
            </div>
          </div>
        )}

        {/* RECORDING */}
        {status === "recording" && (
          <div className="p-6 text-center sm:p-10">

            <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-xs font-semibold tracking-wide text-red-600">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              RECORDING IN PROGRESS
            </div>

            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">
              Walk normally
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Maintain a natural walking pace while the sensor records your
              movement.
            </p>

            {/* Countdown */}
            <div className="mx-auto mt-8 flex h-44 w-44 items-center justify-center rounded-full border-10 border-blue-50 bg-blue-50">
              <div className="flex h-32 w-32 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
                <span className="text-6xl font-semibold tabular-nums tracking-tight text-blue-600">
                  {countdown}
                </span>
              </div>
            </div>

            <div className="mx-auto mt-8 max-w-sm">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Recording progress</span>
                <span>{6 - countdown}/5 sec</span>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300"
                  style={{
                    width: `${((5 - countdown) / 5) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* COMPLETE */}
        {status === "complete" && (
          <div className="p-8 text-center sm:p-12">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600">
                <span className="text-lg font-semibold text-white">
                  ✓
                </span>
              </div>
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-600">
              Assessment completed
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Gait analysis complete
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
              Movement data has been recorded successfully. Preparing the
              final screening result.
            </p>

            <div className="mx-auto mt-7 flex max-w-sm items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                <span className="text-sm font-semibold text-emerald-700">
                  ✓
                </span>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Data saved
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  Gait assessment stored successfully
                </p>
              </div>
            </div>

            <div className="mx-auto mt-6 h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-full animate-pulse rounded-full bg-blue-600" />
            </div>
          </div>
        )}
      </div>

      <p className="mt-5 text-center text-xs text-slate-400">
        OA Screening System · Gait Movement Assessment
      </p>
    </div>
  );
}

