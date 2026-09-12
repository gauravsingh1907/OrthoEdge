function RiskResultCard({ scores }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900">
        OA Risk Screening Result
      </h2>

      <div className="mt-6 rounded-2xl bg-blue-50 p-6 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
          Overall Risk
        </p>

        <p className="mt-2 text-5xl font-bold text-blue-700">
          {scores.combinedScore}
        </p>

        <p className="mt-2 text-xl font-semibold text-gray-900">
          {scores.band}
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-500">
            Questionnaire Score
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {scores.womacScore}%
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-500">
            Gait Test Score
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {scores.gaitScore}%
          </p>
        </div>
      </div>
    </div>
  );
}

export default RiskResultCard;