"use client";

import { useEffect, useState } from "react";
import { getPatient, updatePatient } from "@/lib/db";
import { combineRisk } from "@/lib/combinedRisk";
import RiskResultCard from "@/components/RiskResultCard";
import { useUser } from "@clerk/nextjs";
import { useLanguage } from "@/components/LanguageProvider";
import { questions, answerOptions } from "@/lib/questionnaireData";
import Link from "next/link";

export default function Result({ patientId, onComplete, onContinueScreening }) {
  const { t } = useLanguage();

  const [patient, setPatient] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const { user } = useUser();

  useEffect(() => {
    async function fetchAndCompute() {
      try {
        const patient = await getPatient(patientId);

        if (!patient) {
          throw new Error("Patient not found");
        }

        if (
          patient.womacScore === null ||
          patient.womacScore === undefined ||
          patient.gaitScore === null ||
          patient.gaitScore === undefined
        ) {
          throw new Error(
            "This screening is incomplete — no results available yet.",
          );
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
        setError(t("result.loadError"));
      }
    }

    fetchAndCompute();
  }, [patientId, t]);

  if (error) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="text-lg font-semibold text-red-700">
            {t("result.somethingWentWrong")}
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
            {t("result.loading")}
          </p>
        </div>
      </div>
    );
  }
const recommendationKey = {
  None: "result.recommendationNone",
  Low: "result.recommendationLow",
  Mild: "result.recommendationMild",
  Moderate: "result.recommendationModerate",
  Severe: "result.recommendationSevere",
}[result.band];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      {/* Action buttons */}
      <div className="mb-6 print:hidden">
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => window.print()}
            className="flex-1 cursor-pointer rounded-xl border border-gray-300 bg-white px-5 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            {t("result.printReport")}
          </button>

          <Link
            href="/"
            className="flex-1 cursor-pointer rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
          >
            {t("result.goHome")}
          </Link>
        </div>

        {onComplete && (
          <button
            onClick={onComplete}
            className="mt-3 flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            {t("result.continueReferral")}
          </button>
        )}
                {onContinueScreening && (
          <button
            onClick={onContinueScreening}
            className="mt-3 flex w-full cursor-pointer items-center justify-center rounded-xl border border-blue-600 bg-white px-5 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            {t("result.continueScreening")}
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Report header */}
        <div className="border-b border-gray-200 bg-blue-600 px-6 py-5 text-white print:border-b-2 print:border-gray-900 print:bg-white print:text-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-100 print:text-gray-500">
                {t("result.reportTitle")}
              </p>

              <h1 className="mt-1 text-xl font-bold">
                {t("result.assessmentTitle")}
              </h1>
            </div>

            <p className="text-xs text-blue-100 print:text-gray-500">
              {new Date(patient.timestamp).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Patient details */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            {t("result.patientDetails")}
          </h2>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-gray-500">{t("result.name")}</dt>
              <dd className="font-semibold text-gray-900">{patient.name}</dd>
            </div>

            <div>
              <dt className="text-gray-500">{t("result.age")}</dt>
              <dd className="font-semibold text-gray-900">{patient.age}</dd>
            </div>

            <div>
              <dt className="text-gray-500">{t("result.gender")}</dt>
              <dd className="font-semibold text-gray-900">{patient.gender}</dd>
            </div>

            <div>
              <dt className="text-gray-500">{t("result.abhaNumber")}</dt>
              <dd className="break-all font-semibold text-gray-900">
                {patient.abhaNumber || "—"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Questionnaire Responses */}
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
            {t("result.questionnaireResponses")}
          </h2>

          <div className="space-y-4">
            {questions.map((question, index) => {
              const value =
                patient.questionnaireAnswers?.[question.group]?.[question.id];

              return (
                <div
                  key={question.id}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                >
                  <p className="text-sm leading-6 text-gray-800">
                    <span className="font-semibold">{index + 1}. </span>
                    {t(question.questionKey)}
                  </p>

                  <p className="mt-2 text-sm font-semibold text-blue-700">
                    {value !== undefined
                      ? `${t(answerOptions[value].labelKey)}`
                      : "—"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assessment */}
        <div className="px-6 py-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            {t("result.riskAssessment")}
          </h2>

          <RiskResultCard scores={result} />
        <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
          <p className="text-sm font-semibold text-blue-900">
            {t("result.recommendationTitle")}
          </p>

          <p className="mt-1 text-sm leading-6 text-blue-800">
            {t(recommendationKey)}
          </p>
        </div>
        </div>

        {/* Footer disclaimer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 print:bg-white">
          <p className="text-xs text-gray-500">
            {t("result.disclaimer")} {t("result.administeredBy")}{" "}
            {user?.fullName || t("result.healthcareWorker")}{" "}
            {t("result.viaPlatform")}
          </p>
        </div>
      </div>
    </div>
  );
}
