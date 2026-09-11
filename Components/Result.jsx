"use client";

import { useEffect, useState } from "react";
import { getPatient, updatePatient } from "@/lib/db";
import { combineRisk } from "@/lib/combinedRisk";
import RiskResultCard from "@/components/RiskResultCard";

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
          patient.gaitScore
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
      <div className="mb-6 text-center">
        <p className="text-sm font-medium text-blue-600">
          OA Screening Complete
        </p>

        <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
          Final Risk Assessment
        </h1>
      </div>

      <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Patient Summary
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Name
            </p>
            <p className="mt-1 font-semibold text-gray-900">
              {patient.name}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Age
            </p>
            <p className="mt-1 font-semibold text-gray-900">
              {patient.age}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              ABHA Number
            </p>
            <p className="mt-1 break-all font-semibold text-gray-900">
              {patient.abhaNumber || "Not provided"}
            </p>
          </div>
        </div>
      </div>

      <RiskResultCard scores={result} />

      

      <div className="mt-6 rounded-xl bg-gray-50 p-4 text-center text-sm text-gray-500">
        This screening result is intended to support early risk assessment
        and does not replace clinical diagnosis.
      </div>
    </div>
  );
}