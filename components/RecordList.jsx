"use client";

import { useEffect, useState } from "react";
import { getAllPatients } from "@/lib/db";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export default function RecordsList() {
  const { t } = useLanguage();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecords() {
      try {
        const patients = await getAllPatients();

        const sortedPatients = patients.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
        );

        setRecords(sortedPatients);
      } catch (error) {
        console.error("Failed to load records:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecords();
  }, []);

function getRiskStyle(band) {
  switch (band) {
    case "Low":
      return "bg-green-100 text-green-700 border-green-200";

    case "Moderate":
      return "bg-amber-100 text-amber-700 border-amber-200";

    case "High":
      return "bg-red-100 text-red-700 border-red-200";

    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

  function getRiskLabel(band) {
    if (!band) return band;

    const key = band.charAt(0).toLowerCase() + band.slice(1).toLowerCase();

    return t(`risk.${key}`);
  }

  function formatDate(timestamp) {
    if (!timestamp) return t("records.dateUnavailable");

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return t("records.dateUnavailable");
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-gray-600">
            {t("records.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            {t("records.noScreenings")}
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {t("records.noScreeningsDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {t("records.title")}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {records.length}{" "}
          {records.length === 1
            ? t("records.record")
            : t("records.records")}{" "}
          {t("records.storedLocally")}
        </p>
      </div>

      <div className="space-y-4">
        {records.map((patient) => {
          const hasResult = patient.combinedScore !== null;

          return (
            <Link
              key={patient.id}
              href={`/records/${patient.id}`}
              className="block rounded-2xl border bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {patient.name || t("records.unnamedPatient")}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {t("records.age")}: {patient.age || "N/A"}
                    </p>
                  </div>

                  {hasResult ? (
                    <div
                      className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold ${getRiskStyle(
                        patient.combinedScore.band,
                      )}`}
                    >
                      {getRiskLabel(patient.combinedScore.band)}
                    </div>
                  ) : (
                    <div className="shrink-0 rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600">
                      {t("records.screeningIncomplete")}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 border-t pt-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      {t("records.abhaNumber")}
                    </p>

                    <p className="mt-1 break-all text-sm font-semibold text-gray-900">
                      {patient.abhaNumber || t("records.notProvided")}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      {t("records.date")}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {formatDate(patient.timestamp)}
                    </p>
                  </div>
                </div>

                {hasResult && (
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                    <span className="text-sm font-medium text-gray-600">
                      {t("records.combinedRiskScore")}
                    </span>

                    <span className="text-xl font-bold text-gray-900">
                      {patient.combinedScore.combinedScore}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}