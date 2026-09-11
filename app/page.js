"use client";

import Link from "next/link";
import { UserButton, Show } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getAllPatients } from "@/lib/db";

export default function Home() {
  const [todayPatients, setTodayPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

  useEffect(() => {
    async function fetchTodayPatients() {
      try {
        const patients = await getAllPatients();

        const today = new Date();

        const filtered = patients
          .filter((patient) => {
            if (!patient.timestamp) return false;

            const date = new Date(patient.timestamp);

            return (
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear()
            );
          })
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() -
              new Date(a.timestamp).getTime()
          );

        setTodayPatients(filtered);
      } catch (error) {
        console.error("Failed to load today's patients:", error);
      } finally {
        setLoadingPatients(false);
      }
    }

    fetchTodayPatients();
  }, []);

  function getRiskStyle(band) {
    switch (band) {
      case "Low":
        return "bg-green-100 text-green-700";

      case "Mild":
      case "Moderate":
        return "bg-amber-100 text-amber-700";

      case "Severe":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  function formatTime(timestamp) {
    if (!timestamp) return "--";

    return new Date(timestamp).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Show when="signed-out">
        <nav className="border-b bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/favicon.ico"
                alt="OA Screening"
                className="h-9 w-9 rounded-lg"
              />

              <span className="text-xl font-bold text-blue-700">
                OrthoEdge
              </span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 sm:px-4"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </nav>

        <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl items-center px-4 py-12 sm:px-6">
          <div className="grid w-full gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-5 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                AI-Assisted OA Screening
              </div>

              <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Early screening for
                <span className="text-blue-600"> osteoarthritis risk.</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
                A simple screening platform designed to help healthcare
                workers identify early osteoarthritis risk markers using
                patient symptoms, physical function, and gait analysis.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="rounded-xl bg-blue-600 px-6 py-3.5 text-center font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Get Started
                </Link>

                <Link
                  href="/login"
                  className="rounded-xl border border-gray-300 bg-white px-6 py-3.5 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  I already have an account
                </Link>
              </div>

              <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
                <div className="rounded-xl border bg-white p-4">
                  <p className="text-lg font-bold text-blue-600">01</p>
                  <p className="mt-1 text-sm font-medium text-gray-700">
                    Patient
                  </p>
                </div>

                <div className="rounded-xl border bg-white p-4">
                  <p className="text-lg font-bold text-blue-600">02</p>
                  <p className="mt-1 text-sm font-medium text-gray-700">
                    Screening
                  </p>
                </div>

                <div className="rounded-xl border bg-white p-4">
                  <p className="text-lg font-bold text-blue-600">03</p>
                  <p className="mt-1 text-sm font-medium text-gray-700">
                    Risk Result
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <div className="rounded-2xl bg-blue-50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Screening Overview
                      </p>

                      <h2 className="mt-1 text-2xl font-bold text-gray-900">
                        OA Risk Assessment
                      </h2>
                    </div>

                    <img
                      src="/favicon.ico"
                      alt=""
                      className="h-12 w-12 rounded-2xl"
                    />
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between rounded-xl bg-white px-4 py-4">
                      <span className="font-medium text-gray-700">
                        Questionnaire
                      </span>

                      <span className="text-sm font-semibold text-blue-600">
                        Symptoms
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-white px-4 py-4">
                      <span className="font-medium text-gray-700">
                        Gait Analysis
                      </span>

                      <span className="text-sm font-semibold text-blue-600">
                        Movement
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border-2 border-blue-200 bg-white px-4 py-4">
                      <span className="font-semibold text-gray-900">
                        Final Assessment
                      </span>

                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                        Risk Score
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-center text-sm text-gray-500">
                  Designed for simple, accessible screening in low-resource
                  settings.
                </p>
              </div>
            </div>
          </div>
        </section>
      </Show>

      <Show when="signed-in">
        <nav className="border-b bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/favicon.ico"
                alt="OA Screening"
                className="h-9 w-9 rounded-lg"
              />

              <div>
                <span className="text-xl font-bold text-blue-700">
                  OA Screening
                </span>

                <p className="hidden text-xs text-gray-500 sm:block">
                  Healthcare screening platform
                </p>
              </div>
            </Link>

            <UserButton />
          </div>
        </nav>

        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="rounded-3xl bg-blue-600 p-6 text-white shadow-sm sm:p-10">
            <p className="text-sm font-medium text-blue-100">
              Healthcare Worker Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Welcome back
            </h1>

            <p className="mt-3 max-w-2xl leading-6 text-blue-100">
              Start a new patient screening or review previously stored
              screening records.
            </p>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Link
              href="/screening"
              className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl font-bold text-blue-700">
                +
              </div>

              <h2 className="mt-5 text-xl font-bold text-gray-900">
                Start New Screening
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Create a patient record and perform questionnaire and gait
                screening.
              </p>

              <div className="mt-5 font-semibold text-blue-600">
                Start screening →
              </div>
            </Link>

            <Link
              href="/records"
              className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xl font-bold text-gray-700">
                ≡
              </div>

              <h2 className="mt-5 text-xl font-bold text-gray-900">
                View All Records
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                View previously stored patient screening results and risk
                assessments.
              </p>

              <div className="mt-5 font-semibold text-blue-600">
                View records →
              </div>
            </Link>
          </div>

          <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Today
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  Patients Screened
                </h2>
              </div>

              <div className="rounded-xl bg-blue-50 px-4 py-3 text-center">
                <p className="text-2xl font-bold text-blue-700">
                  {loadingPatients ? "—" : todayPatients.length}
                </p>

                <p className="text-xs font-medium text-blue-600">
                  patients
                </p>
              </div>
            </div>

            {!loadingPatients && todayPatients.length > 0 && (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-500px text-left">
                  <thead>
                    <tr className="border-b text-xs uppercase tracking-wide text-gray-500">
                      <th className="px-3 py-3 font-semibold">Patient</th>
                      <th className="px-3 py-3 font-semibold">Age</th>
                      <th className="px-3 py-3 font-semibold">Status</th>
                      <th className="px-3 py-3 text-right font-semibold">
                        Time
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {todayPatients.slice(0, 5).map((patient) => {
                      const hasResult = patient.combinedScore !== null;

                      return (
                        <tr key={patient.id}>
                          <td className="px-3 py-3">
                            <p className="font-semibold text-gray-900">
                              {patient.name || "Unnamed"}
                            </p>
                          </td>

                          <td className="px-3 py-3 text-sm text-gray-600">
                            {patient.age || "—"}
                          </td>

                          <td className="px-3 py-3">
                            {hasResult ? (
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getRiskStyle(
                                  patient.combinedScore.band
                                )}`}
                              >
                                {patient.combinedScore.band}
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                Incomplete
                              </span>
                            )}
                          </td>

                          <td className="px-3 py-3 text-right text-sm text-gray-500">
                            {formatTime(patient.timestamp)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {!loadingPatients && todayPatients.length === 0 && (
              <div className="mt-5 rounded-xl bg-gray-50 px-4 py-5 text-center">
                <p className="text-sm text-gray-500">
                  No patients screened today yet.
                </p>
              </div>
            )}

            {!loadingPatients && todayPatients.length > 5 && (
              <Link
                href="/records"
                className="mt-4 block text-center text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                View all {todayPatients.length} records →
              </Link>
            )}
          </div>

          <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-green-500" />

              <div>
                <h3 className="font-semibold text-gray-900">
                  Offline-ready screening
                </h3>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Patient screening data is currently stored locally on this
                  device using offline storage.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-gray-500">
            OA screening is intended to support early risk assessment and does
            not replace clinical diagnosis.
          </p>
        </section>
      </Show>
    </main>
  );
}