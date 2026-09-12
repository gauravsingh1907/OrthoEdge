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
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10">
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        
        <div className="border-b bg-gray-50 px-5 py-4 sm:px-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Step 3 of 3
              </p>
              <h1 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
                Gait Assessment
              </h1>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl">
              🚶
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {status === "idle" && (
          <div className="p-5 sm:p-8">
            <div className="rounded-2xl bg-blue-50 p-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl shadow-sm">
                🦵
              </div>

              <h2 className="mt-5 text-2xl font-bold text-gray-900">
                Ready for the gait test?
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600">
                The sensor will analyze your walking movement to identify
                gait-related risk markers.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border bg-white p-4">
                <div className="text-lg">🦵</div>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  Fit the band
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Secure the knee sensor properly.
                </p>
              </div>

              <div className="rounded-xl border bg-white p-4">
                <div className="text-lg">📡</div>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  Connect
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  The sensor will connect automatically.
                </p>
              </div>

              <div className="rounded-xl border bg-white p-4">
                <div className="text-lg">🚶</div>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  Walk normally
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Follow your normal walking pattern.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStart}
              className="mt-7 w-full rounded-2xl bg-blue-600 px-6 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99]"
            >
              Start Gait Test
            </button>

            <p className="mt-3 text-center text-xs text-gray-400">
              Make sure the sensor is fitted before starting.
            </p>
          </div>
        )}

        {status === "connecting" && (
          <div className="p-8 text-center sm:p-12">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-50">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            </div>

            <p className="mt-7 text-xs font-semibold uppercase tracking-wider text-blue-600">
              Device setup
            </p>

            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              Connecting to sensor
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500">
              Establishing a connection with the knee movement sensor. Please
              stay ready.
            </p>

            <div className="mx-auto mt-7 max-w-sm rounded-xl border bg-gray-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Sensor status</span>
                <span className="font-semibold text-amber-600">
                  Connecting...
                </span>
              </div>
            </div>
          </div>
        )}

        {status === "recording" && (
          <div className="p-6 text-center sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-600">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              RECORDING
            </div>

            <h2 className="mt-5 text-2xl font-bold text-gray-900">
              Walk normally
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Keep a natural pace while the sensor records your movement.
            </p>

            <div className="mx-auto mt-8 flex h-44 w-44 items-center justify-center rounded-full border-8 border-blue-100 bg-blue-50">
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white shadow-sm">
                <span className="text-6xl font-bold tabular-nums text-blue-600">
                  {countdown}
                </span>
              </div>
            </div>

            <div className="mx-auto mt-8 max-w-sm">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Test progress</span>
                <span>{6 - countdown}/5 sec</span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
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

        {status === "complete" && (
          <div className="p-8 text-center sm:p-12">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-50">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
                ✓
              </div>
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-green-600">
              Test completed
            </p>

            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              Gait analysis complete
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500">
              Your movement data has been recorded successfully. Preparing
              your final screening result...
            </p>

            <div className="mx-auto mt-7 flex max-w-sm items-center gap-3 rounded-xl border bg-gray-50 p-4 text-left">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
                ✓
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Data saved
                </p>
                <p className="text-xs text-gray-500">
                  Gait assessment stored successfully
                </p>
              </div>
            </div>

            <div className="mx-auto mt-6 h-1.5 w-32 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full w-full animate-pulse rounded-full bg-blue-600" />
            </div>
          </div>
        )}
      </div>

      <p className="mt-5 text-center text-xs text-gray-400">
        OA Screening • Gait Movement Assessment
      </p>
    </div>
  );
}