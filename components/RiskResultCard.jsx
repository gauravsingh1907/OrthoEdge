function RiskResultCard({ scores }) {
  const marker = Math.min(Math.max(scores.combinedScore, 0), 100);

  const bandColors = {
    Low: "text-green-700",
    Mild: "text-blue-700",
    Moderate: "text-amber-700",
    Severe: "text-red-700",
  };

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Overall OA risk assessment
        </p>
      </div>

      <div className="mt-3 flex items-end gap-3">
        <span className="text-5xl font-bold text-gray-900">
          {scores.combinedScore}
        </span>
        <span className="mb-1 text-lg text-gray-500">/ 100</span>
      </div>

      <p className="mt-1 text-sm font-medium text-gray-500">
        Classification:{" "}
        <span className={`font-bold ${bandColors[scores.band] || "text-gray-900"}`}>
          {scores.band}
        </span>
      </p>

      {/* Gauge */}
      <div className="mt-5">
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="flex h-full w-full">
            <div className="h-full bg-green-400" style={{ width: "30%" }} />
            <div className="h-full bg-blue-400" style={{ width: "20%" }} />
            <div className="h-full bg-amber-400" style={{ width: "25%" }} />
            <div className="h-full bg-red-400" style={{ width: "25%" }} />
          </div>
          <div
            className="absolute top-1/2 h-4 w-1.5 -translate-y-1/2 rounded-full bg-gray-900"
            style={{ left: `calc(${marker}% - 3px)` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] text-gray-500">
          <span>Low (0–30)</span>
          <span>Mild (31–50)</span>
          <span>Moderate (51–75)</span>
          <span>High (76–100)</span>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Questionnaire score
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {scores.womacScore.toFixed(2)}%
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Self-reported WOMAC (pain, stiffness, function)
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Gait test score
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {scores.gaitScore.toFixed(2)}%
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Sensor-based gait analysis
          </p>
        </div>
      </div>
    </div>
  );
}

export default RiskResultCard;