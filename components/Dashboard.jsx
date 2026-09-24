"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function Dashboard({
  t,
  language,
  changeLanguage,
  todayPatients,
  allPatients,
  loadingPatients,
  syncing,
  syncMessage,
  handleSync,
  getRiskLabel,
  formatTime,
}) {
  // ---- UI-only helpers (derived from already-loaded data) ----
  const RISK_ROWS = [
    { band: "Low", dot: "bg-emerald-400", bar: "bg-emerald-500", pill: "bg-emerald-100 text-emerald-800" },
    { band: "Mild", dot: "bg-yellow-400", bar: "bg-yellow-400", pill: "bg-yellow-100 text-yellow-800" },
    { band: "Moderate", dot: "bg-orange-400", bar: "bg-orange-500", pill: "bg-orange-100 text-orange-800" },
    { band: "Severe", dot: "bg-red-400", bar: "bg-red-500", pill: "bg-red-100 text-red-800" },
    { band: "incomplete", dot: "bg-slate-400", bar: "bg-slate-500", pill: "bg-slate-200 text-slate-700" },
  ];

  const totalAll = allPatients.length;

  const riskCounts = RISK_ROWS.map((row) => {
    const count = allPatients.filter((p) =>
      row.band === "incomplete"
        ? p.combinedScore === null
        : p.combinedScore?.band === row.band,
    ).length;

    return {
      ...row,
      count,
      percent: totalAll > 0 ? Math.round((count / totalAll) * 100) : 0,
    };
  });

  function getRiskStyleDark(band) {
    const row = RISK_ROWS.find((r) => r.band === band);
    return row ? row.pill : "bg-slate-400/15 text-slate-300";
  }

  const glass =
    "rounded-2xl border border-white/15 bg-slate-700/50 shadow-lg shadow-black/25 backdrop-blur-sm";

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-700 via-slate-500 to-slate-300 text-slate-100">
      {/* Top bar */}
      <nav className="bg-slate-800/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <img
              src="/favicon.ico"
              alt="OA Screening"
              className="h-8 w-8 shrink-0 rounded-lg sm:h-9 sm:w-9"
            />

            <div className="min-w-0">
              <span className="hidden md:block truncate text-lg font-bold text-white">
                OrthoEdge
              </span>

              <p className="hidden text-xs text-slate-300 sm:block">
                {t("home.healthcarePlatform")}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {syncMessage && (
              <span className="hidden text-xs text-slate-300 sm:inline">
                {syncMessage}
              </span>
            )}

<select
  value={language}
  onChange={(e) => changeLanguage(e.target.value)}
  aria-label={t("language.select")}
  className="cursor-pointer rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold text-slate-100 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 [&>option]:bg-slate-800 [&>option]:text-slate-100"
>
<option value="en">English</option>
<option value="hi">हिन्दी</option>
<option value="as">অসমীয়া</option>
<option value="bn">বাংলা</option>
<option value="brx">बर'</option>
<option value="mni">মৈতৈলোন্</option>
<option value="lus">Mizo ṭawng</option>
</select>

            <button
              onClick={handleSync}
              disabled={syncing}
              className="rounded-lg border cursor-pointer border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:opacity-50"
            >
              {syncing ? t("sync.syncing") : t("sync.syncData")}
            </button>

            <UserButton />
          </div>
        </div>

        {syncMessage && (
          <p className="px-4 pb-2 text-center text-xs text-slate-300 sm:hidden">
            {syncMessage}
          </p>
        )}
      </nav>

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        {/* Row 1: two big action cards */}
        <div className="grid gap-4 min-[1032px]:grid-cols-2">
          <Link
            href="/screening"
            className={`group relative flex min-h-40 flex-col justify-between overflow-hidden p-4 transition hover:-translate-y-0.5 hover:border-white/25 ${glass} bg-linear-to-br from-slate-700/60 to-slate-900/60 min-[1032px]:bg-[url('/assets/knee_lab.png')] min-[1032px]:bg-cover min-[1032px]:bg-center`}
          >
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-900/70 via-slate-900/20 to-transparent" />

            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-base font-bold text-white">
                +
              </div>

              <h2 className="mt-3 text-base font-bold text-white">
                {t("home.startNewScreening")}
              </h2>

              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-200">
                {t("home.startScreeningDescription")}
              </p>
            </div>

            <div className="relative mt-3 text-xs font-semibold text-white">
              {t("home.startScreening")} →
            </div>
          </Link>

          <Link
            href="/records"
            className={`group relative flex min-h-40 flex-col justify-between p-4 transition hover:-translate-y-0.5 hover:border-white/25 ${glass}`}
          >
            <div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-base font-bold text-white">
                ≡
              </div>

              <h2 className="mt-3 text-base font-bold text-white">
                {t("home.viewAllRecords")}
              </h2>

              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-300">
                {t("home.recordsDescription")}
              </p>
            </div>

            <div className="mt-3 text-xs font-semibold text-white">
              {t("home.viewRecords")} →
            </div>
          </Link>
        </div>

        {/* Row 2: total patients + risk stratification */}
        <div className="mt-4 grid gap-4 min-[1032px]:grid-cols-2">
          <div
            className={`relative flex min-h-44 flex-col justify-between overflow-hidden p-4 ${glass} bg-linear-to-br from-slate-700/60 to-slate-900/60 min-[1032px]:bg-[url('/assets/clinicSense.png')] min-[1032px]:bg-cover min-[1032px]:bg-center`}
          >
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-900/70 via-slate-900/20 to-transparent" />

            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-300">
                {t("home.screeningVolume")}
              </p>

              <h2 className="mt-1 text-lg font-bold text-white">
                {t("home.totalPatientsScreened")}
              </h2>
            </div>

            <div className="relative flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">
                {loadingPatients ? "—" : totalAll}
              </span>

              <span className="text-xs font-semibold uppercase tracking-widest text-slate-300">
                {t("home.totalScreened")}
              </span>
            </div>
          </div>

          <div className={`p-4 ${glass}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-300">
                  {t("home.clinicalOverview")}
                </p>

                <h2 className="mt-1 text-base font-bold text-white">
                  {t("home.riskStratification")}
                </h2>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {riskCounts.map((row) => (
                <div
                  key={row.band}
                  className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 py-2"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`h-2 w-2 rounded-full ${row.dot}`} />

                    <span className="text-sm font-semibold text-white">
                      {row.band === "incomplete"
                        ? t("home.incomplete")
                        : getRiskLabel(row.band)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-white">
                      {row.count}
                    </span>

                    <span
                      className={`min-w-11 rounded-full px-2 py-0.5 text-center text-xs font-bold ${row.pill}`}
                    >
                      {row.percent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              {riskCounts.map((row) =>
                row.percent > 0 ? (
                  <div
                    key={row.band}
                    className={row.bar}
                    style={{ width: `${row.percent}%` }}
                  />
                ) : null,
              )}
            </div>
          </div>
        </div>

        {/* Recent intakes table */}
        <div className={`mt-4 p-4 ${glass}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white">
                {t("home.recentIntakes")}
              </h2>

              <p className="mt-1 text-xs text-slate-300">
                {t("home.recentIntakesSubtitle")}
              </p>
            </div>

            {!loadingPatients && (
              <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                {todayPatients.length} {t("home.records")}
              </span>
            )}
          </div>

          {!loadingPatients && todayPatients.length > 0 && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-160 text-left">
                <thead>
                  <tr className="border-b border-white/15 text-xs uppercase tracking-wide text-slate-300">
                    <th className="px-3 py-2 font-semibold">
                      {t("home.patient")}
                    </th>

                    <th className="px-3 py-2 font-semibold">
                      {t("patient.age")}
                    </th>

                    <th className="px-3 py-2 font-semibold">
                      {t("home.metrics")}
                    </th>

                    <th className="px-3 py-2 font-semibold">
                      {t("home.status")}
                    </th>

                    <th className="px-3 py-2 text-right font-semibold">
                      {t("home.time")}
                    </th>

                    <th className="px-3 py-2 text-right font-semibold">
                      {t("home.action")}
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {todayPatients.slice(0, 5).map((patient) => {
                    const hasResult = patient.combinedScore !== null;

                    return (
                      <tr key={patient.id}>
                        <td className="px-3 py-2">
                          <p className="text-sm font-semibold text-white">
                            {patient.name || t("home.unnamed")}
                          </p>
                        </td>

                        <td className="px-3 py-2 text-sm text-slate-300">
                          {patient.age || "—"}
                          {patient.gender
                            ? ` / ${patient.gender.charAt(0).toUpperCase()}`
                            : ""}
                        </td>

                        <td className="px-3 py-2 text-sm text-slate-300">
                          {patient.height || "—"} / {patient.weight || "—"} /{" "}
                          {patient.bmi || "—"}
                        </td>

                        <td className="px-3 py-2">
                          {hasResult ? (
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getRiskStyleDark(
                                patient.combinedScore.band,
                              )}`}
                            >
                              {getRiskLabel(patient.combinedScore.band)}
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-slate-400/15 px-2.5 py-1 text-xs font-medium text-slate-300">
                              {t("home.incomplete")}
                            </span>
                          )}
                        </td>

                        <td className="px-3 py-2 text-right text-sm text-slate-300">
                          {formatTime(patient.timestamp)}
                        </td>

                        <td className="px-3 py-2 text-right">
                          <Link
                            href={`/records/${patient.id}`}
                            className="text-xs font-semibold text-white hover:text-slate-200"
                          >
                            {t("home.review")} →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loadingPatients && todayPatients.length === 0 && (
            <div className="mt-3 rounded-xl bg-white/5 px-4 py-4 text-center">
              <p className="text-sm text-slate-300">
                {t("home.noPatientsToday")}
              </p>
            </div>
          )}

          {!loadingPatients && todayPatients.length > 5 && (
            <Link
              href="/records"
              className="mt-3 block text-center text-sm font-semibold text-sky-300 hover:text-sky-200"
            >
              {t("home.viewAllCount")} {todayPatients.length}{" "}
              {t("home.records")} →
            </Link>
          )}
        </div>

        {/* Offline note */}
        <div className={`mt-4 p-4 ${glass}`}>
          <div className="flex items-start gap-3">
            <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400" />

            <div>
              <h3 className="text-sm font-semibold text-white">
                {t("home.offlineReady")}
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-300">
                {t("home.offlineDescription")}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-slate-200">
          {t("home.disclaimer")}
        </p>
      </section>
    </div>
  );
}