"use client";

import { useEffect, useState } from "react";
import { getPatient, updatePatient } from "@/lib/db";
import { combineRisk } from "@/lib/combinedRisk";
import RiskResultCard from "@/components/RiskResultCard";
import Link from "next/link";

export default function Result({ patientId }) {
  const [patient, setPatient] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAndCompute() {
      try {
        const patient = await getPatient(patientId);

        if (!patient) {
          throw new Error("Patient not found");
        }

        const combined = combineRisk(
          patient.womacScore.overall.score,
          patient.gaitScore,
        );

        await updatePatient(patientId, {
          combinedScore: combined,
        });

        setPatient(patient);
        setResult(combined);
      } catch (error) {
        console.error(error);
        setError("Unable to load screening results.");
      }
    }

    fetchAndCompute();
  }, [patientId]);

  if (error) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="text-lg font-semibold text-red-700">
            Something went wrong
          </h2>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!patient || !result) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="mt-4 text-lg font-medium text-gray-700">
            Loading results...
          </p>
        </div>
      </div>
    );
  }

return (
  <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">

      {/* Report header */}
      <div className="border-b border-gray-200 bg-blue-600 px-6 py-5 text-white print:bg-white print:text-gray-900 print:border-b-2 print:border-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-100 print:text-gray-500">
              OrthoEdge Screening Report
            </p>
            <h1 className="mt-1 text-xl font-bold">
              Osteoarthritis Risk Assessment
            </h1>
          </div>
          <p className="text-xs text-blue-100 print:text-gray-500">
            {new Date(patient.timestamp).toLocaleDateString("en-IN", {
              day: "2-digit", month: "short", year: "numeric"
            })}
          </p>
        </div>
      </div>

      {/* Patient details - form-style rows */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Patient Details
        </h2>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-gray-500">Name</dt>
            <dd className="font-semibold text-gray-900">{patient.name}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Age</dt>
            <dd className="font-semibold text-gray-900">{patient.age}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Gender</dt>
            <dd className="font-semibold text-gray-900">{patient.gender}</dd>
          </div>
          <div>
            <dt className="text-gray-500">ABHA No.</dt>
            <dd className="break-all font-semibold text-gray-900">
              {patient.abhaNumber || "—"}
            </dd>
          </div>
        </dl>
      </div>

      {/* Assessment section */}
      <div className="px-6 py-5">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Risk Assessment
        </h2>
        <RiskResultCard scores={result} />
      </div>

      {/* Footer disclaimer, inside the report */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 print:bg-white">
        <p className="text-xs text-gray-500">
          This screening result is intended to support early risk assessment
          and does not replace clinical diagnosis. Administered by healthcare
          worker via OrthoEdge screening platform.
        </p>
      </div>
    </div>

    {/* Action buttons - outside the "report" visually, hidden on print */}
    <div className="mt-6 flex flex-col gap-3 sm:flex-row print:hidden">
      <button
        onClick={() => window.print()}
        className="flex-1 rounded-xl border border-gray-300 bg-white px-5 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
      >
        Print report
      </button>
      <Link
        href="/"
        className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
      >
        Back to home
      </Link>
    </div>
  </div>
);
}
