"use client";

import { useEffect, useRef, useState } from "react";
import { updatePatient } from "@/lib/db";
import { useLanguage } from "@/components/LanguageProvider";

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8"; // Ensure ESP32s end in 'a9'

const TEST_DURATION_S = 60;
const SMOOTH_WINDOW = 5;

const RIGHT_DEVICE_NAME = "OrthoEdge-Right";
const LEFT_DEVICE_NAME = "OrthoEdge-Left";

function createLegState() {
  return {
    status: "idle",
    connectError: null,
    kneeAngle: 0,
    windowsProcessed: 0,
    report: null,
  };
}

export default function GaitTest({ patientId, onComplete }) {
  const { t } = useLanguage();

  const [right, setRight] = useState(createLegState());
  const [left, setLeft] = useState(createLegState());

  const [saved, setSaved] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const rightRef = useRef(right);
  const leftRef = useRef(left);

  useEffect(() => { rightRef.current = right; }, [right]);
  useEffect(() => { leftRef.current = left; }, [left]);

  const rightCharRef = useRef(null);
  const rightAngleHistoryRef = useRef([]);
  const rightDecoderRef = useRef(new TextDecoder("utf-8"));

  const leftCharRef = useRef(null);
  const leftAngleHistoryRef = useRef([]);
  const leftDecoderRef = useRef(new TextDecoder("utf-8"));

  // --------------------------------------------------
  // BLE connection (Individual Click Requirement)
  // --------------------------------------------------
  const connectLeg = async ({ deviceName, setLegState, legRef, charRef, angleHistoryRef, decoderRef }) => {
    setLegState((prev) => ({ ...prev, connectError: null, status: "connecting" }));

    if (!navigator.bluetooth) {
      setLegState((prev) => ({ ...prev, status: "idle", connectError: "Bluetooth not supported in this browser." }));
      return;
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ name: deviceName }],
        optionalServices: [SERVICE_UUID],
      });

      device.addEventListener("gattserverdisconnected", () => {
        const current = legRef.current;
        if (current.status !== "complete") {
          setLegState((prev) => ({ ...prev, status: "idle", connectError: "Connection lost." }));
        }
      });

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(SERVICE_UUID);
      const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

      charRef.current = characteristic;
      await characteristic.startNotifications();

      characteristic.addEventListener("characteristicvaluechanged", (event) => {
        handleNotification(event, { setLegState, angleHistoryRef, decoderRef });
      });

      setLegState((prev) => ({ ...prev, status: "ready" }));
    } catch (err) {
      console.error(`BLE connect failed (${deviceName}):`, err);
      setLegState((prev) => ({ ...prev, status: "idle", connectError: "Failed to connect. Try again." }));
    }
  };

  const handleStartRight = () => connectLeg({ deviceName: RIGHT_DEVICE_NAME, setLegState: setRight, legRef: rightRef, charRef: rightCharRef, angleHistoryRef: rightAngleHistoryRef, decoderRef: rightDecoderRef });
  const handleStartLeft = () => connectLeg({ deviceName: LEFT_DEVICE_NAME, setLegState: setLeft, legRef: leftRef, charRef: leftCharRef, angleHistoryRef: leftAngleHistoryRef, decoderRef: leftDecoderRef });

  // --------------------------------------------------
  // Trigger Recording
  // --------------------------------------------------
  const handleBeginRecording = async () => {
    if (isSimulating) {
      startSimulationTimer();
      return;
    }

    const encoder = new TextEncoder();
    const command = encoder.encode("START");

    try {
      if (leftCharRef.current) await leftCharRef.current.writeValue(command);
      if (leftCharRef.current && rightCharRef.current) {
        await new Promise(resolve => setTimeout(resolve, 400)); // Crucial Dual-Antenna Pause
      }
      if (rightCharRef.current) await rightCharRef.current.writeValue(command);
    } catch (err) {
      console.error("Failed to send start command:", err);
      alert("Failed to trigger sensors. Please ensure they are connected and try again.");
    }
  };

  // --------------------------------------------------
  // Parse incoming BLE data
  // --------------------------------------------------
  const handleNotification = (event, { setLegState, angleHistoryRef, decoderRef }) => {
    const value = event.target.value;
    const line = decoderRef.current.decode(value).trim();

    if (!line) return;
    const parts = line.split(",");
    const type = parts[0];

    if (type === "DATA") {
      const thighPitch = parseFloat(parts[2]);
      const shankPitch = parseFloat(parts[8]);
      if (!Number.isFinite(thighPitch) || !Number.isFinite(shankPitch)) return;

      let delta = thighPitch - shankPitch;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      const clamped = Math.min(140, Math.max(0, Math.abs(delta)));
      const history = angleHistoryRef.current;
      history.push(clamped);
      if (history.length > SMOOTH_WINDOW) history.shift();

      const avg = history.reduce((a, b) => a + b, 0) / history.length;

      setLegState((prev) => ({
        ...prev,
        kneeAngle: avg,
        status: (prev.status === "ready" || prev.status === "connecting") ? "recording" : prev.status,
      }));
    } else if (type === "LOG") {
      const match = line.match(/Processed Window (\d+)\/(\d+)/);
      if (match) setLegState((prev) => ({ ...prev, windowsProcessed: parseInt(match[1], 10) }));
    } else if (type === "REPORT") {
      const [, igri, sMl, sConsist, sCoord, winHealthy, winModerate, winBad, meanEnergy, meanJerk] = parts;
      setLegState((prev) => ({
        ...prev,
        report: {
          igri: parseFloat(igri), sMl: parseFloat(sMl), sConsist: parseFloat(sConsist), sCoord: parseFloat(sCoord),
          winHealthy: parseInt(winHealthy, 10), winModerate: parseInt(winModerate, 10), winBad: parseInt(winBad, 10),
          meanEnergy: parseFloat(meanEnergy), meanJerk: parseFloat(meanJerk),
        },
      }));
    } else if (type === "SESSION_END") {
      setLegState((prev) => ({ ...prev, status: "complete" }));
    }
  };

  // --------------------------------------------------
  // Overall Status Manager
  // --------------------------------------------------
  const isRightIdle = right.status === "idle";
  const isLeftIdle = left.status === "idle";
  const isRightReady = right.status === "ready";
  const isLeftReady = left.status === "ready";
  
  const anyRecording = right.status === "recording" || left.status === "recording";
  const allComplete = (right.status === "complete" || isRightIdle) && (left.status === "complete" || isLeftIdle) && (!isRightIdle || !isLeftIdle);

  let overallStatus = "idle";
  if (allComplete) overallStatus = "complete";
  else if (anyRecording) overallStatus = "recording";
  else if ((!isRightIdle || !isLeftIdle) && (isRightReady || isLeftReady)) overallStatus = "ready";

  // --------------------------------------------------
  // Countdowns
  // --------------------------------------------------
  const [rightCountdown, setRightCountdown] = useState(TEST_DURATION_S);
  const [leftCountdown, setLeftCountdown] = useState(TEST_DURATION_S);

  useEffect(() => {
    if (right.status !== "recording") return;
    setRightCountdown(TEST_DURATION_S);
    const timer = setInterval(() => setRightCountdown((prev) => (prev <= 1 ? 0 : prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [right.status]);

  useEffect(() => {
    if (left.status !== "recording") return;
    setLeftCountdown(TEST_DURATION_S);
    const timer = setInterval(() => setLeftCountdown((prev) => (prev <= 1 ? 0 : prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [left.status]);

  // --------------------------------------------------
  // Save Math & Final Results
  // --------------------------------------------------
  const bothReported = right.report && left.report;
  let asymmetry = null;

  if (bothReported) {
    const eL = left.report.meanEnergy; const eR = right.report.meanEnergy;
    const jL = left.report.meanJerk; const jR = right.report.meanJerk;
    const bsiEnergy = (Math.abs(eL - eR) / (0.5 * (eL + eR) || 1)) * 100;
    const bsiJerk = (Math.abs(jL - jR) / (0.5 * (jL + jR) || 1)) * 100;
    asymmetry = { bsiEnergy, bsiJerk };
  }

  useEffect(() => {
    if (overallStatus !== "complete" || saved) return;
    let timeout;
    const saveResult = async () => {
      setSaved(true);
      const scores = [right.report?.igri, left.report?.igri].filter(v => typeof v === "number" && Number.isFinite(v));
      const baseline = scores.length > 0 ? Math.max(...scores) : 0;
      
      let maxDeficit = 0;
      if (asymmetry) {
        maxDeficit = Math.max(asymmetry.bsiEnergy || 0, asymmetry.bsiJerk || 0);
      }
      
      let finalScore = baseline + (0.25 * maxDeficit);
      finalScore = Math.min(100, finalScore);

      await updatePatient(patientId, {
        gaitScore: finalScore,
        gaitBsiEnergy: asymmetry?.bsiEnergy ?? null,
        gaitBsiJerk: asymmetry?.bsiJerk ?? null,
        gaitRightIgri: right.report?.igri ?? null,
        gaitLeftIgri: left.report?.igri ?? null,
      });

      timeout = setTimeout(() => { onComplete(); }, 1000);
    };
    saveResult();
    return () => { if (timeout) clearTimeout(timeout); };
  }, [overallStatus, saved, patientId, onComplete, right.report, left.report, asymmetry]);

  // --------------------------------------------------
  // Cleanup
  // --------------------------------------------------
  useEffect(() => {
    return () => {
      if (rightCharRef.current?.service?.device?.gatt?.connected) rightCharRef.current.service.device.gatt.disconnect();
      if (leftCharRef.current?.service?.device?.gatt?.connected) leftCharRef.current.service.device.gatt.disconnect();
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        
        {/* Header */}
        <div className="border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">{t("gait.assessment")} 03 / 03</p>
            <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{t("gait.title")}</h1>
          </div>
        </div>

        {/* SETUP STAGE */}
        {(overallStatus === "idle" || overallStatus === "ready") && (
          <div className="p-6 sm:p-8 text-center">
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              {/* Left Leg Controls */}
              <div className="rounded-xl border border-slate-200 p-6 bg-slate-50">
                <h3 className="text-lg font-bold mb-2">Left Sensor</h3>
                {left.status === "idle" ? (
                  <button onClick={handleStartLeft} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700">Pair Left Leg</button>
                ) : left.status === "connecting" ? (
                  <p className="text-amber-600 font-bold">Connecting...</p>
                ) : (
                  <p className="text-emerald-600 font-bold">✓ Ready</p>
                )}
                {left.connectError && <p className="text-xs text-red-500 mt-2">{left.connectError}</p>}
              </div>

              {/* Right Leg Controls */}
              <div className="rounded-xl border border-slate-200 p-6 bg-slate-50">
                <h3 className="text-lg font-bold mb-2">Right Sensor</h3>
                {right.status === "idle" ? (
                  <button onClick={handleStartRight} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700">Pair Right Leg</button>
                ) : right.status === "connecting" ? (
                  <p className="text-amber-600 font-bold">Connecting...</p>
                ) : (
                  <p className="text-emerald-600 font-bold">✓ Ready</p>
                )}
                {right.connectError && <p className="text-xs text-red-500 mt-2">{right.connectError}</p>}
              </div>
            </div>

            {/* Start Button appears once at least one leg is ready */}
            {(isLeftReady || isRightReady) && (
              <div className="mt-4 border-t pt-8 border-slate-200">
                <p className="text-sm text-slate-500 mb-4">Sensors prepared. Instruct the patient to walk normally.</p>
                <button onClick={handleBeginRecording} className="mx-auto rounded-xl bg-emerald-600 px-10 py-4 text-lg font-bold text-white shadow hover:bg-emerald-700">
                  ▶ START GAIT TEST

                </button>
              </div>
            )}
          </div>
        )}

        {/* RECORDING */}
        {overallStatus === "recording" && (
          <div className="p-6 text-center sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-xs font-semibold tracking-wide text-red-600">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              Recording In Progress
            </div>
            <div className={`mt-6 grid gap-6 ${right.status === "recording" && left.status === "recording" ? "sm:grid-cols-2" : ""}`}>
              {right.status === "recording" && <LegPanel title="Right leg" angle={right.kneeAngle} windowsProcessed={right.windowsProcessed} countdown={rightCountdown} />}
              {left.status === "recording" && <LegPanel title="Left leg" angle={left.kneeAngle} windowsProcessed={left.windowsProcessed} countdown={leftCountdown} />}
            </div>
          </div>
        )}

        {/* COMPLETE */}
        {overallStatus === "complete" && (
          <div className="p-8 text-center sm:p-12">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Analysis Complete</h2>
            <div className="mx-auto mt-6 grid max-w-lg gap-3 text-left sm:grid-cols-2">
              {right.report && <ReportCard title="Right leg" report={right.report} />}
              {left.report && <ReportCard title="Left leg" report={left.report} />}
            </div>
            {asymmetry && (
              <div className="mx-auto mt-4 max-w-lg rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
                <p className="text-sm font-semibold text-amber-800">Bilateral Symmetry</p>
                <p className="mt-1 text-xs text-amber-700">Energy Asymmetry: {asymmetry.bsiEnergy.toFixed(1)}% · Jerk Asymmetry: {asymmetry.bsiJerk.toFixed(1)}%</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LegPanel({ title, angle, windowsProcessed, countdown }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <KneeSvg angleDeg={angle} />
      <div className="mx-auto mt-3 max-w-55">
        <div className="flex justify-between text-xs text-slate-400">
          <span>{TEST_DURATION_S - countdown}/{TEST_DURATION_S}s</span>
          <span>{windowsProcessed}/25 windows</span>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ title, report }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">IGRI: {Math.round(report.igri)}</p>
      <p className="mt-1 text-xs text-slate-500">H: {report.winHealthy} / M: {report.winModerate} / B: {report.winBad}</p>
    </div>
  );
}

function KneeSvg({ angleDeg }) {
  return (
    <div className="mx-auto mt-3 max-w-45">
      <svg viewBox="0 0 280 320" role="img" aria-label="Live knee flexion angle">
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
      <p className="mt-1 text-center text-base font-semibold text-slate-900">{Math.round(angleDeg)}°</p>
      <p className="text-xl font-bold text-blue-600">{Math.round(angleDeg)}°</p>
    </div>
  );
}