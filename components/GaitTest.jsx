"use client";

import { useEffect, useRef, useState } from "react";
import { updatePatient } from "@/lib/db";
import { useLanguage } from "@/components/LanguageProvider";

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
const TEST_DURATION_S = 60;
const SMOOTH_WINDOW = 5;

export default function GaitTest({ patientId, onComplete }) {
  const { t } = useLanguage();

  // idle -> connecting -> recording -> complete
  const [status, setStatus] = useState("idle");
  const [countdown, setCountdown] = useState(TEST_DURATION_S);
  const [connectError, setConnectError] = useState(null);
  const [kneeAngle, setKneeAngle] = useState(0);
  const [windowsProcessed, setWindowsProcessed] = useState(0);
  const [report, setReport] = useState(null); // { igri, sMl, sConsist, sCoord, winHealthy, winModerate, winBad }

  const deviceRef = useRef(null);
  const characteristicRef = useRef(null);
  const angleHistoryRef = useRef([]);
  const textDecoderRef = useRef(new TextDecoder("utf-8"));

  // ---------- BLE connect ----------
  const handleConnect = async () => {
    setConnectError(null);

    if (!navigator.bluetooth) {
      setConnectError(t("gait.bleUnsupported") || "This browser doesn't support Bluetooth. Try Chrome on Android or desktop.");
      return;
    }

    setStatus("connecting");

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ name: "OrthoEdge" }],
        optionalServices: [SERVICE_UUID],
      });

      deviceRef.current = device;
      device.addEventListener("gattserverdisconnected", handleDisconnected);

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(SERVICE_UUID);
      const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);
      characteristicRef.current = characteristic;

      await characteristic.startNotifications();
      characteristic.addEventListener("characteristicvaluechanged", handleNotification);

      // Device auto-starts its own 60s session ~1.5s after connecting.
      // We mirror that here; actual state flips to "recording" when we see
      // the first LOG/DATA line, in case timing drifts.
      setTimeout(() => {
        setStatus((prev) => (prev === "connecting" ? "recording" : prev));
      }, 1500);
    } catch (err) {
      console.error("BLE connect failed:", err);
      setConnectError(
        err?.message || t("gait.connectFailed") || "Couldn't connect to the sensor. Try again."
      );
      setStatus("idle");
    }
  };

  const handleDisconnected = () => {
    if (status === "recording" || status === "connecting") {
      setConnectError(t("gait.connectionLost") || "Connection lost. Test stopped.");
      setStatus("idle");
    }
  };

  // ---------- Parse incoming BLE lines ----------
  const handleNotification = (event) => {
    const value = event.target.value;
    const line = textDecoderRef.current.decode(value).trim();
    if (!line) return;

    const parts = line.split(",");
    const type = parts[0];

    if (type === "DATA") {
      // thighAccel.pitch = parts[2], shankAccel.pitch = parts[8]
      const thighPitch = parseFloat(parts[2]);
      const shankPitch = parseFloat(parts[8]);
      if (!Number.isFinite(thighPitch) || !Number.isFinite(shankPitch)) return;

      let delta = thighPitch - shankPitch;
      // normalize wrap-around since these are 0-360 euler angles
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      const clamped = Math.min(140, Math.max(0, Math.abs(delta)));

      const history = angleHistoryRef.current;
      history.push(clamped);
      if (history.length > SMOOTH_WINDOW) history.shift();
      const avg = history.reduce((a, b) => a + b, 0) / history.length;

      setKneeAngle(avg);
      setStatus((prev) => (prev === "connecting" ? "recording" : prev));
    } else if (type === "LOG") {
      const match = line.match(/Processed Window (\d+)\/(\d+)/);
      if (match) setWindowsProcessed(parseInt(match[1], 10));
    } else if (type === "REPORT") {
      const [, igri, sMl, sConsist, sCoord, winHealthy, winModerate, winBad] = parts;
      setReport({
        igri: parseFloat(igri),
        sMl: parseFloat(sMl),
        sConsist: parseFloat(sConsist),
        sCoord: parseFloat(sCoord),
        winHealthy: parseInt(winHealthy, 10),
        winModerate: parseInt(winModerate, 10),
        winBad: parseInt(winBad, 10),
      });
    } else if (type === "SESSION_END") {
      setStatus("complete");
    }
  };

  // ---------- Local 60s countdown (mirrors firmware timing for UI only) ----------
  useEffect(() => {
    if (status !== "recording") return;

    setCountdown(TEST_DURATION_S);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

// ---------- Save gait score on complete ----------
useEffect(() => {
  if (status !== "complete") return;

  let timeout;

  const saveResult = async () => {
    const finalScore = report?.igri ?? 0;

    await updatePatient(patientId, {
      gaitScore: finalScore,
    });

    timeout = setTimeout(() => {
      onComplete();
    }, 1000);
  };

  saveResult();

  return () => {
    if (timeout) clearTimeout(timeout);
  };
}, [status, patientId, onComplete, report]);
  // ---------- Cleanup BLE on unmount ----------
  useEffect(() => {
    return () => {
      const characteristic = characteristicRef.current;
      if (characteristic) {
        characteristic.removeEventListener("characteristicvaluechanged", handleNotification);
      }
      const device = deviceRef.current;
      if (device?.gatt?.connected) {
        device.gatt.disconnect();
      }
    };
  }, []);

  const progress =
    status === "idle" ? 0 : status === "connecting" ? 25 : status === "recording" ? 65 : 100;

    // ---------- Temporary gait simulator ----------
const handleSimulate = () => {
  setConnectError(null);
  setStatus("recording");
  setCountdown(TEST_DURATION_S);
  setWindowsProcessed(0);
  setReport(null);
  angleHistoryRef.current = [];

  // Simulate knee movement
  let elapsed = 0;

  const dataTimer = setInterval(() => {
    elapsed += 1;

    // Simulated knee angle
    const simulatedAngle = 30 + Math.sin(elapsed / 2) * 20;
    setKneeAngle(Math.max(0, simulatedAngle));

    // Simulate processed windows
    if (elapsed % 2 === 0) {
      setWindowsProcessed((prev) => Math.min(prev + 1, 25));
    }

    if (elapsed >= TEST_DURATION_S) {
      clearInterval(dataTimer);

      // Simulated REPORT
      setReport({
        igri: 72,
        sMl: 70,
        sConsist: 75,
        sCoord: 71,
        winHealthy: 15,
        winModerate: 7,
        winBad: 3,
      });

      // Simulate SESSION_END
      setStatus("complete");
    }
  }, 1000);
};

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                {t("gait.assessment")} 03 / 03
              </p>
              <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                {t("gait.title")}
              </h1>
              <p className="mt-1 text-sm text-slate-500">{t("gait.subtitle")}</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
              <span>{t("gait.assessmentProgress")}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* IDLE */}
        {status === "idle" && (
          <div className="p-6 sm:p-8">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <div className="h-3 w-3 rounded-full bg-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{t("gait.ready")}</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                    {t("gait.readyDescription")}
                  </p>
                </div>
              </div>
            </div>

            {/* Sensor connect slots */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">
                  {t("gait.sensorOne") || "Sensor 1 · Thigh & shank"}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {t("gait.sensorOneDescription") || "OrthoEdge unit on the affected leg."}
                </p>
              </div>

              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 opacity-70">
                <p className="text-sm font-semibold text-slate-500">
                  {t("gait.sensorTwo") || "Sensor 2 · Coming soon"}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  {t("gait.sensorTwoDescription") || "Second leg tracking will connect here."}
                </p>
              </div>
            </div>

            {connectError && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                {connectError}
              </p>
            )}

            <button
              type="button"
              onClick={handleConnect}
              className="mt-7 w-full rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99]"
            >
              {t("gait.start")}
            </button>
<button
  type="button"
  onClick={handleSimulate}
  className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
>
  Simulate Gait Test
</button>
            <p className="mt-3 text-center text-xs text-slate-400">{t("gait.sensorReminder")}</p>
          </div>
        )}

        {/* CONNECTING */}
        {status === "connecting" && (
          <div className="p-8 text-center sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-blue-100 bg-blue-50">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            </div>
            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.15em] text-blue-600">
              {t("gait.deviceSetup")}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {t("gait.connecting")}
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
              {t("gait.connectingDescription")}
            </p>
          </div>
        )}

        {/* RECORDING */}
        {status === "recording" && (
          <div className="p-6 text-center sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-xs font-semibold tracking-wide text-red-600">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              {t("gait.recordingInProgress")}
            </div>

            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">
              {t("gait.walkNormally")}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {t("gait.recordingDescription")}
            </p>

            <KneeSvg angleDeg={kneeAngle} />

            <div className="mx-auto mt-6 max-w-sm">
              <div className="flex justify-between text-xs text-slate-400">
                <span>{t("gait.recordingProgress")}</span>
                <span>{TEST_DURATION_S - countdown}/{TEST_DURATION_S}s</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${((TEST_DURATION_S - countdown) / TEST_DURATION_S) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {t("gait.windowsProcessed") || "Windows processed"}: {windowsProcessed}/25
              </p>
            </div>
          </div>
        )}

        {/* COMPLETE */}
        {status === "complete" && (
          <div className="p-8 text-center sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600">
                <span className="text-lg font-semibold text-white">✓</span>
              </div>
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-600">
              {t("gait.completed")}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {t("gait.analysisComplete")}
            </h2>

            {report && (
              <div className="mx-auto mt-6 max-w-sm rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                <p className="text-sm font-semibold text-slate-900">
                  {t("gait.igriScore") || "IGRI score"}: {Math.round(report.igri)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  ML {Math.round(report.sMl)} · Consistency {Math.round(report.sConsist)} · Coordination {Math.round(report.sCoord)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {report.winHealthy} healthy / {report.winModerate} moderate / {report.winBad} at-risk windows
                </p>
              </div>
            )}

            <div className="mx-auto mt-6 h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-full animate-pulse rounded-full bg-blue-600" />
            </div>
          </div>
        )}
      </div>

      <p className="mt-5 text-center text-xs text-slate-400">{t("gait.footer")}</p>
    </div>
  );
}

function KneeSvg({ angleDeg }) {
  return (
    <div className="mx-auto mt-6 max-w-55">
      <svg viewBox="0 0 280 320" role="img" aria-label="Live knee flexion angle">
        <title>Knee flexion</title>
        <line x1="20" y1="290" x2="260" y2="290" stroke="#e2e8f0" strokeWidth="1" />
        <g>
          <line x1="140" y1="60" x2="140" y2="170" stroke="#378ADD" strokeWidth="18" strokeLinecap="round" />
          <circle cx="140" cy="60" r="22" fill="#378ADD" />
        </g>
        <g transform={`rotate(${angleDeg} 140 170)`}>
          <line x1="140" y1="170" x2="140" y2="270" stroke="#1D9E75" strokeWidth="16" strokeLinecap="round" />
          <ellipse cx="140" cy="270" rx="26" ry="10" fill="#1D9E75" />
        </g>
        <circle cx="140" cy="170" r="10" fill="#ffffff" stroke="#0C443C" strokeWidth="2" />
      </svg>
      <p className="mt-2 text-center text-lg font-semibold text-slate-900">
        {Math.round(angleDeg)}°
      </p>
      <p className="text-center text-xs text-slate-500">{"knee flexion"}</p>
    </div>
  );
}