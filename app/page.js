"use client";

import Link from "next/link";
import { UserButton, Show } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getAllPatients } from "@/lib/db";
import { syncAllPatients } from "@/lib/serviceSync";
import { useLanguage } from "@/components/LanguageProvider";
import LandingHero from "@/components/LandingHero";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const { t, language, changeLanguage } = useLanguage();

  const [todayPatients, setTodayPatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    async function fetchTodayPatients() {
      try {
        const patients = await getAllPatients();

        setAllPatients(patients);

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
    <main className="min-h-screen text-gray-900">
      <Show when="signed-out">
        <LandingHero />
      </Show>

      <Show when="signed-in">
        <Dashboard
          t={t}
          language={language}
          changeLanguage={changeLanguage}
          todayPatients={todayPatients}
          allPatients={allPatients}
          loadingPatients={loadingPatients}
          syncing={syncing}
          syncMessage={syncMessage}
          handleSync={handleSync}
          getRiskLabel={getRiskLabel}
          formatTime={formatTime}
        />
      </Show>
    </main>
  );
}