"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import referralData from "@/lib/referralData.json";
import Link from "next/link";

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default function Referral() {
  const { t } = useLanguage();

  const [status, setStatus] = useState("idle");
  const [nearestHospital, setNearestHospital] = useState(null);
  const [error, setError] = useState("");

  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const hospitals = referralData.hospitals;

  const states = [...new Set(hospitals.map((hospital) => hospital.state))];

  const cities = selectedState
    ? [
        ...new Set(
          hospitals
            .filter((hospital) => hospital.state === selectedState)
            .map((hospital) => hospital.city),
        ),
      ]
    : [];

  function findNearestHospital(latitude, longitude) {
    const hospitalsWithDistance = hospitals.map((hospital) => ({
      ...hospital,
      distance: calculateDistance(
        latitude,
        longitude,
        hospital.latitude,
        hospital.longitude,
      ),
    }));

    hospitalsWithDistance.sort((a, b) => a.distance - b.distance);

    setNearestHospital(hospitalsWithDistance[0]);
  }

function getCurrentLocation() {
  setError("");
  setStatus("locating");

  if (!navigator.geolocation) {
    setStatus("error");
    setError(t("referral.locationNotSupported"));
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      findNearestHospital(latitude, longitude);

      setError("");
      setStatus("success");
    },
    (error) => {
      console.log("GPS error:", error);

      setStatus("error");

      if (error.code === 1) {
        setError(t("referral.locationFailed"));
      } else if (error.code === 2) {
        setError(t("referral.locationFailed"));
      } else if (error.code === 3) {
        setError(t("referral.locationFailed"));
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 0,
    }
  );
}

  function handleManualSearch() {
    if (!selectedState || !selectedCity) return;

    const matches = hospitals.filter(
      (hospital) =>
        hospital.state === selectedState && hospital.city === selectedCity,
    );

    if (matches.length > 0) {
      setNearestHospital(matches[0]);
      setStatus("manual");
      setError("");
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      <Link
  href="/"
  className="mb-5 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
>
  <span aria-hidden="true">←</span>
  {t("result.goHome")}
</Link>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          {t("referral.title")}
        </p>

        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          {t("referral.findHospital")}
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          {t("referral.description")}
        </p>
      </div>

      {/* GPS */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          {t("referral.useLocation")}
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          {t("referral.locationDescription")}
        </p>

        <button
          onClick={getCurrentLocation}
          disabled={status === "locating"}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "locating" ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              {t("referral.locating")}
            </>
          ) : (
            <>
              <span className="text-base">⌖</span>
              {t("referral.findUsingGPS")}
            </>
          )}
        </button>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      {/* Manual fallback */}
      <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          {t("referral.manualSelection")}
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          {t("referral.manualDescription")}
        </p>

        <div className="mt-4 space-y-3">
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedCity("");
            }}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="">{t("referral.selectState")}</option>

            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            disabled={!selectedState}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100"
          >
            <option value="">{t("referral.selectCity")}</option>

            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <button
            onClick={handleManualSearch}
            disabled={!selectedState || !selectedCity}
            className="w-full rounded-xl border border-blue-200 bg-blue-50 px-5 py-3.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("referral.findHospital")}
          </button>
        </div>
      </div>

      {/* Result */}
      {nearestHospital && (
        <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            {t("referral.nearestHospital")}
          </p>

          <h2 className="mt-2 text-xl font-bold text-gray-900">
            {nearestHospital.name}
          </h2>

          <p className="mt-2 text-sm text-gray-600">{nearestHospital.type}</p>

          <p className="mt-1 text-sm text-gray-600">
            {nearestHospital.city}, {nearestHospital.state}
          </p>

          {nearestHospital.distance !== undefined && (
            <p className="mt-3 font-semibold text-blue-700">
              {nearestHospital.distance.toFixed(1)} km
            </p>
          )}
        </div>
      )}
    </div>
  );
}
