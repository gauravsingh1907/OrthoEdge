"use client";

import Link from "next/link";
import { UserButton, Show } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { getAllPatients } from "@/lib/db";
import { syncAllPatients } from "@/lib/serviceSync";
import { useLanguage } from "@/components/LanguageProvider";

export default function Home() {
  const { t, language, changeLanguage } = useLanguage();

  const [todayPatients, setTodayPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

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
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
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

  function getRiskLabel(band) {
    if (!band) return band;

    const key = band.charAt(0).toLowerCase() + band.slice(1).toLowerCase();

    return t(`risk.${key}`);
  }

  function formatTime(timestamp) {
    if (!timestamp) return "--";

    return new Date(timestamp).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function handleSync() {
    setSyncing(true);
    setSyncMessage("");

    try {
      const result = await syncAllPatients();

      setSyncMessage(
        `${t("sync.synced")} ${result.successCount}/${result.total}`,
      );
    } catch (err) {
      setSyncMessage(t("sync.failed"));
      console.error(err);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(""), 4000);
    }
  }

  return (
    <main className="min-h-screen bg-radial from-blue-50 from-30% to-blue-300 text-gray-900">
      <Show when="signed-out">
        <motion.nav
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.12 } },
          }}
          className="border-b border-blue-100 bg-white/80 backdrop-blur-sm"
        >
          <div className="mx-auto flex max-w-8xl items-center justify-between px-4 py-4 sm:px-6">
            <motion.div
              variants={{
                hidden: { opacity: 0, y: -15 },
                visible: { opacity: 1, y: 0 },
              }}
            >
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
            </motion.div>

            <div className="flex items-center gap-2 sm:gap-3">
<motion.div
  variants={{
    hidden: { opacity: 0, y: -15 },
    visible: { opacity: 1, y: 0 },
  }}
>
  <motion.button
    type="button"
    onClick={() => changeLanguage(language === "en" ? "hi" : "en")}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
  >
    {language === "en" ? "हिन्दी" : "English"}
  </motion.button>
</motion.div>
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: -15 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <Link
                  href="/login"
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 sm:px-4"
                >
                  {t("home.login")}
                </Link>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: -15 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <Link
                  href="/signup"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  {t("home.signUp")}
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.nav>

        <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl items-center px-4 py-12 sm:px-6">
          <div className="grid w-full gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
            >
              <motion.h1
                variants={itemVariants}
                className="text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl"
              >
                {t("home.heroTitle")}
                <span className="text-blue-600">
                  {" "}
                  {t("home.heroHighlight")}
                </span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="mt-6 max-w-xl text-base leading-7 text-gray-600 sm:text-lg"
              >
                {t("home.heroDescription")}
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <Link
                  href="/signup"
                  className="rounded-xl bg-blue-600 px-6 py-3.5 text-center font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  {t("home.getStarted")}
                </Link>

                <Link
                  href="/login"
                  className="rounded-xl border border-gray-300 bg-white px-6 py-3.5 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  {t("home.alreadyAccount")}
                </Link>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="mt-8 grid max-w-lg grid-cols-3 gap-3"
              >
                <div className="rounded-xl border bg-white p-4">
                  <p className="text-lg font-bold text-blue-600">01</p>
                  <p className="mt-1 text-sm font-medium text-gray-700">
                    {t("home.patient")}
                  </p>
                </div>

                <div className="rounded-xl border bg-white p-4">
                  <p className="text-lg font-bold text-blue-600">02</p>
                  <p className="mt-1 text-sm font-medium text-gray-700">
                    {t("home.screening")}
                  </p>
                </div>

                <div className="rounded-xl border bg-white p-4">
                  <p className="text-lg font-bold text-blue-600">03</p>
                  <p className="mt-1 text-sm font-medium text-gray-700">
                    {t("home.riskResult")}
                  </p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="hidden lg:block"
            >
              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <div className="rounded-2xl bg-blue-50 p-6">
                  <div className="mx-auto flex items-center justify-center">
                    <div>
                      <p className="text-sm text-center font-medium text-gray-500">
                        {t("home.screeningOverview")}
                      </p>

                      <h2 className="mt-1 text-2xl font-bold text-gray-900">
                        {t("home.oaRiskAssessment")}
                      </h2>
                    </div>
                  </div>

                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={{
                      visible: {
                        transition: {
                          staggerChildren: 0.15,
                          delayChildren: 0.2,
                        },
                      },
                    }}
                    className="mt-6 space-y-3"
                  >
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 },
                      }}
                      className="flex items-center justify-between rounded-xl bg-white px-4 py-4"
                    >
                      <span className="font-medium text-gray-700">
                        {t("home.questionnaire")}
                      </span>

                      <span className="text-sm font-semibold text-blue-600">
                        {t("home.symptoms")}
                      </span>
                    </motion.div>

                    <motion.div
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 },
                      }}
                      className="flex items-center justify-between rounded-xl bg-white px-4 py-4"
                    >
                      <span className="font-medium text-gray-700">
                        {t("home.gaitAnalysis")}
                      </span>

                      <span className="text-sm font-semibold text-blue-600">
                        {t("home.movement")}
                      </span>
                    </motion.div>

                    <motion.div
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 },
                      }}
                      className="flex items-center justify-between rounded-xl border-2 border-blue-200 bg-white px-4 py-4"
                    >
                      <span className="font-semibold text-gray-900">
                        {t("home.finalAssessment")}
                      </span>

                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                        {t("home.riskScore")}
                      </span>
                    </motion.div>
                  </motion.div>
                </div>

                <p className="mt-5 text-center text-sm text-gray-500">
                  {t("home.lowResource")}
                </p>
              </div>
            </motion.div>
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
                  OrthoEdge
                </span>

                <p className="hidden text-xs text-gray-500 sm:block">
                  {t("home.healthcarePlatform")}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <button
                type="button"
                onClick={() => changeLanguage(language === "en" ? "hi" : "en")}
                aria-label={t("language.select")}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                {language === "en" ? "हिन्दी" : "English"}
              </button>

              <button
                onClick={handleSync}
                disabled={syncing}
                className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                {syncing ? t("sync.syncing") : t("sync.syncData")}
              </button>

              {syncMessage && (
                <span className="text-xs text-gray-500">{syncMessage}</span>
              )}

              <UserButton />
            </div>
          </div>
        </nav>

        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="rounded-3xl bg-blue-600 p-6 text-white shadow-sm sm:p-10">
            <p className="text-sm font-medium text-blue-100">
              {t("home.healthcareWorkerDashboard")}
            </p>

            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              {t("home.welcomeBack")}
            </h1>

            <p className="mt-3 max-w-2xl leading-6 text-blue-100">
              {t("home.dashboardDescription")}
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
                {t("home.startNewScreening")}
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                {t("home.startScreeningDescription")}
              </p>

              <div className="mt-5 font-semibold text-blue-600">
                {t("home.startScreening")} →
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
                {t("home.viewAllRecords")}
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                {t("home.recordsDescription")}
              </p>

              <div className="mt-5 font-semibold text-blue-600">
                {t("home.viewRecords")} →
              </div>
            </Link>
          </div>

          <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("home.today")}
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  {t("home.patientsScreened")}
                </h2>
              </div>

              <div className="rounded-xl bg-blue-50 px-4 py-3 text-center">
                <p className="text-2xl font-bold text-blue-700">
                  {loadingPatients ? "—" : todayPatients.length}
                </p>

                <p className="text-xs font-medium text-blue-600">
                  {t("home.patients")}
                </p>
              </div>
            </div>

            {!loadingPatients && todayPatients.length > 0 && (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-500px text-left">
                  <thead>
                    <tr className="border-b text-xs uppercase tracking-wide text-gray-500">
                      <th className="px-3 py-3 font-semibold">
                        {t("home.patient")}
                      </th>

                      <th className="px-3 py-3 font-semibold">
                        {t("patient.age")}
                      </th>

                      <th className="px-3 py-3 font-semibold">
                        {t("home.status")}
                      </th>

                      <th className="px-3 py-3 text-right font-semibold">
                        {t("home.time")}
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
                              {patient.name || t("home.unnamed")}
                            </p>
                          </td>

                          <td className="px-3 py-3 text-sm text-gray-600">
                            {patient.age || "—"}
                          </td>

                          <td className="px-3 py-3">
                            {hasResult ? (
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getRiskStyle(
                                  patient.combinedScore.band,
                                )}`}
                              >
                                {getRiskLabel(patient.combinedScore.band)}
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                {t("home.incomplete")}
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
                  {t("home.noPatientsToday")}
                </p>
              </div>
            )}

            {!loadingPatients && todayPatients.length > 5 && (
              <Link
                href="/records"
                className="mt-4 block text-center text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                {t("home.viewAllCount")} {todayPatients.length}{" "}
                {t("home.records")} →
              </Link>
            )}
          </div>

          <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-green-500" />

              <div>
                <h3 className="font-semibold text-gray-900">
                  {t("home.offlineReady")}
                </h3>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  {t("home.offlineDescription")}
                </p>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-gray-500">
            {t("home.disclaimer")}
          </p>
        </section>
      </Show>
    </main>
  );
}
