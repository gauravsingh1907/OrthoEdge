"use client";

import { useLanguage } from "@/components/LanguageProvider";

// Map any incoming band value (including legacy ones) to Low / Moderate / High
const normalizeBand = (band) => {
  if (!band) return null;

  switch (band.toLowerCase()) {
    case "low":
      return "Low";
    case "mild": // legacy value
    case "moderate":
      return "Moderate";
    case "severe": // legacy value
    case "high":
      return "High";
    default:
      return null;
  }
};

function RiskResultCard({ scores }) {
  const { t } = useLanguage();

  const marker = Math.min(Math.max(scores.combinedScore, 0), 100);
  const band = normalizeBand(scores.band);

  const bandColors = {
    Low: "text-green-700",
    Moderate: "text-amber-700",
    High: "text-red-700",
  };

  const getRiskLabel = (band) => {
    if (!band) return "";
    // "Low" -> "risk.low", "Moderate" -> "risk.moderate", "High" -> "risk.high"
    return t(`risk.${band.toLowerCase()}`);
  };

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {t("risk.overallAssessment")}
        </p>
      </div>

      <div className="mt-3 flex items-end gap-3">
        <span className="text-5xl font-bold text-gray-900">
          {scores.combinedScore}
        </span>

        <span className="mb-1 text-lg text-gray-500">/ 100</span>
      </div>

      <p className="mt-1 text-sm font-medium text-gray-500">
        {t("risk.classification")}:{" "}
        <span className={`font-bold ${bandColors[band] || "text-gray-900"}`}>
          {getRiskLabel(band)}
        </span>
      </p>

      {/* Gauge */}
      <div className="mt-5">
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="flex h-full w-full">
            <div className="h-full bg-green-400" style={{ width: "33.33%" }} />
            <div className="h-full bg-amber-400" style={{ width: "33.33%" }} />
            <div className="h-full bg-red-400" style={{ width: "33.34%" }} />
          </div>

          <div
            className="absolute top-1/2 h-4 w-1.5 -translate-y-1/2 rounded-full bg-gray-900"
            style={{ left: `calc(${marker}% - 3px)` }}
          />
        </div>

        <div className="mt-1.5 flex justify-between text-[11px] text-gray-500">
          <span>{t("risk.lowRange")}</span>
          <span>{t("risk.moderateRange")}</span>
          <span>{t("risk.highRange")}</span>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {t("risk.questionnaireScore")}
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {scores.womacScore.toFixed(2)}%
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {t("risk.womacDescription")}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {t("risk.gaitTestScore")}
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {scores.gaitScore.toFixed(2)}%
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {t("risk.gaitDescription")}
          </p>
        </div>
      </div>
    </div>
  );
}

export default RiskResultCard;