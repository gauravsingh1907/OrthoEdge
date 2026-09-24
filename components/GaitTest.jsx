"use client";

import { useEffect, useRef, useState } from "react";

import { updatePatient } from "@/lib/db";
import { useLanguage } from "@/components/LanguageProvider";

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

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

  const [testMode, setTestMode] = useState(null);

  const [saved, setSaved] = useState(false);

  const rightRef = useRef(right);
  const leftRef = useRef(left);

  useEffect(() => {
    rightRef.current = right;
  }, [right]);

  useEffect(() => {
    leftRef.current = left;
  }, [left]);

  const rightDeviceRef = useRef(null);
  const rightCharRef = useRef(null);
  const rightAngleHistoryRef = useRef([]);
  const rightDecoderRef = useRef(new TextDecoder("utf-8"));

  const leftDeviceRef = useRef(null);
  const leftCharRef = useRef(null);
  const leftAngleHistoryRef = useRef([]);
  const leftDecoderRef = useRef(new TextDecoder("utf-8"));

  // --------------------------------------------------
  // BLE connection
  // --------------------------------------------------

  const connectLeg = async ({
    deviceName,
    setLegState,
    legRef,
    deviceRef,
    charRef,
    angleHistoryRef,
    decoderRef,
  }) => {
    setLegState((prev) => ({
      ...prev,
      connectError: null,
    }));

    if (!navigator.bluetooth) {
      setLegState((prev) => ({
        ...prev,
        connectError:
          t("gait.bleUnsupported") || "This browser doesn't support Bluetooth.",
      }));
      return false;
    }

    setLegState((prev) => ({
      ...prev,
      status: "connecting",
    }));

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ name: deviceName }],
        optionalServices: [SERVICE_UUID],
      });

      deviceRef.current = device;

      device.addEventListener("gattserverdisconnected", () => {
        const current = legRef.current;

        if (
          current.status === "recording" ||
          current.status === "connecting" ||
          current.status === "ready"
        ) {
          setLegState((prev) => ({
            ...prev,
            status: "idle",
            connectError:
              t("gait.connectionLost") || "Connection lost. Test stopped.",
          }));
        }
      });

      const server = await device.gatt.connect();

      const service = await server.getPrimaryService(SERVICE_UUID);

      const characteristic =
        await service.getCharacteristic(CHARACTERISTIC_UUID);

      charRef.current = characteristic;

      await characteristic.startNotifications();

      characteristic.addEventListener("characteristicvaluechanged", (event) => {
        handleNotification(event, {
          setLegState,
          angleHistoryRef,
          decoderRef,
        });
      });

      /*
       * IMPORTANT:
       *
       * Current ESP firmware automatically starts its
       * 60-second session after connection.
       *
       * Therefore we DON'T send a start command here.
       *
       * We simply mark the sensor as ready after the
       * firmware has had time to start.
       */

      setTimeout(() => {
        setLegState((prev) =>
          prev.status === "connecting"
            ? {
                ...prev,
                status: "ready",
              }
            : prev,
        );
      }, 1500);

      return true;
    } catch (err) {
      console.error(`BLE connect failed (${deviceName}):`, err);

      setLegState((prev) => ({
        ...prev,
        status: "idle",
        connectError:
          err?.message ||
          t("gait.connectFailed") ||
          "Couldn't connect to the sensor. Try again.",
      }));

      return false;
    }
  };

  // --------------------------------------------------
  // Individual start buttons
  // --------------------------------------------------

  const handleStartRight = async () => {
    setTestMode("right");

    await connectLeg({
      deviceName: RIGHT_DEVICE_NAME,
      setLegState: setRight,
      legRef: rightRef,
      deviceRef: rightDeviceRef,
      charRef: rightCharRef,
      angleHistoryRef: rightAngleHistoryRef,
      decoderRef: rightDecoderRef,
    });
  };

  const handleStartLeft = async () => {
    setTestMode("left");

    await connectLeg({
      deviceName: LEFT_DEVICE_NAME,
      setLegState: setLeft,
      legRef: leftRef,
      deviceRef: leftDeviceRef,
      charRef: leftCharRef,
      angleHistoryRef: leftAngleHistoryRef,
      decoderRef: leftDecoderRef,
    });
  };

  /*
   * BOTH mode
   *
   * The first sensor connection starts its firmware session.
   * The second sensor also starts its firmware session when
   * connected.
   *
   * The UI will NOT show the walking screen until both
   * sensors are connected/ready.
   */
  const handleStartBoth = async () => {
    setTestMode("both");

    const rightConnected = await connectLeg({
      deviceName: RIGHT_DEVICE_NAME,
      setLegState: setRight,
      legRef: rightRef,
      deviceRef: rightDeviceRef,
      charRef: rightCharRef,
      angleHistoryRef: rightAngleHistoryRef,
      decoderRef: rightDecoderRef,
    });

    if (!rightConnected) {
      return;
    }

    const leftConnected = await connectLeg({
      deviceName: LEFT_DEVICE_NAME,
      setLegState: setLeft,
      legRef: leftRef,
      deviceRef: leftDeviceRef,
      charRef: leftCharRef,
      angleHistoryRef: leftAngleHistoryRef,
      decoderRef: leftDecoderRef,
    });

    if (!leftConnected) {
      if (rightDeviceRef.current?.gatt?.connected) {
        rightDeviceRef.current.gatt.disconnect();
      }

      setRight(createLegState());
      setLeft(createLegState());
      setTestMode(null);
    }
  };

  // --------------------------------------------------
  // Parse incoming BLE data
  // --------------------------------------------------

  const handleNotification = (
    event,
    { setLegState, angleHistoryRef, decoderRef },
  ) => {
    const value = event.target.value;

    const line = decoderRef.current.decode(value).trim();

    if (!line) return;

    const parts = line.split(",");
    const type = parts[0];

    // ----------------------------------------------
    // DATA
    // ----------------------------------------------

    if (type === "DATA") {
      const thighPitch = parseFloat(parts[2]);
      const shankPitch = parseFloat(parts[8]);

      if (!Number.isFinite(thighPitch) || !Number.isFinite(shankPitch)) {
        return;
      }

      let delta = thighPitch - shankPitch;

      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      const clamped = Math.min(140, Math.max(0, Math.abs(delta)));

      const history = angleHistoryRef.current;

      history.push(clamped);

      if (history.length > SMOOTH_WINDOW) {
        history.shift();
      }

      const avg = history.reduce((a, b) => a + b, 0) / history.length;

      setLegState((prev) => ({
        ...prev,
        kneeAngle: avg,

        /*
         * First real DATA means firmware is actively
         * producing gait data.
         */
        status:
          prev.status === "connecting" || prev.status === "ready"
            ? "recording"
            : prev.status,
      }));
    }

    // ----------------------------------------------
    // LOG
    // ----------------------------------------------
    else if (type === "LOG") {
      const match = line.match(/Processed Window (\d+)\/(\d+)/);

      if (match) {
        const count = parseInt(match[1], 10);

        setLegState((prev) => ({
          ...prev,
          windowsProcessed: count,
        }));
      }
    }

    // ----------------------------------------------
    // REPORT
    // ----------------------------------------------
    else if (type === "REPORT") {
      /*
       * REPORT,
       * igri,
       * sMl,
       * sConsist,
       * sCoord,
       * winHealthy,
       * winModerate,
       * winBad,
       * meanEnergy,
       * meanJerk
       */

      const [
        ,
        igri,
        sMl,
        sConsist,
        sCoord,
        winHealthy,
        winModerate,
        winBad,
        meanEnergy,
        meanJerk,
      ] = parts;

      setLegState((prev) => ({
        ...prev,
        report: {
          igri: parseFloat(igri),
          sMl: parseFloat(sMl),
          sConsist: parseFloat(sConsist),
          sCoord: parseFloat(sCoord),

          winHealthy: parseInt(winHealthy, 10),
          winModerate: parseInt(winModerate, 10),
          winBad: parseInt(winBad, 10),

          meanEnergy: meanEnergy !== undefined ? parseFloat(meanEnergy) : null,

          meanJerk: meanJerk !== undefined ? parseFloat(meanJerk) : null,
        },
      }));
    }

    // ----------------------------------------------
    // SESSION END
    // ----------------------------------------------
    else if (type === "SESSION_END") {
      setLegState((prev) => ({
        ...prev,
        status: "complete",
      }));
    }
  };

  // --------------------------------------------------
  // Connection state
  // --------------------------------------------------

  const rightConnected = right.status !== "idle";
  const leftConnected = left.status !== "idle";

  const bothConnected = rightConnected && leftConnected;

  /*
   * In BOTH mode:
   *
   * If one sensor is ready/recording while the other
   * is still connecting, don't show the walking UI.
   */
  const waitingForOtherLeg =
    testMode === "both" &&
    ((rightConnected && !leftConnected) ||
      (leftConnected && !rightConnected) ||
      (right.status === "ready" && left.status === "connecting") ||
      (left.status === "ready" && right.status === "connecting"));

  const bothPastConnecting =
    testMode !== "both" || (rightConnected && leftConnected);

  // --------------------------------------------------
  // Countdown
  // --------------------------------------------------

  const [rightCountdown, setRightCountdown] = useState(TEST_DURATION_S);

  const [leftCountdown, setLeftCountdown] = useState(TEST_DURATION_S);

  useEffect(() => {
    if (right.status !== "recording" || !bothPastConnecting) {
      return;
    }

    setRightCountdown(TEST_DURATION_S);

    const timer = setInterval(() => {
      setRightCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [right.status, bothPastConnecting]);

  useEffect(() => {
    if (left.status !== "recording" || !bothPastConnecting) {
      return;
    }

    setLeftCountdown(TEST_DURATION_S);

    const timer = setInterval(() => {
      setLeftCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [left.status, bothPastConnecting]);

  // --------------------------------------------------
  // Overall status
  // --------------------------------------------------

  const anyConnected = rightConnected || leftConnected;

  const legsInPlay = [
    rightConnected ? right : null,
    leftConnected ? left : null,
  ].filter(Boolean);

  const allComplete =
    legsInPlay.length > 0 &&
    legsInPlay.every((leg) => leg.status === "complete");

  const anyRecording = legsInPlay.some((leg) => leg.status === "recording");

  const anyConnectingOrReady = legsInPlay.some(
    (leg) => leg.status === "connecting" || leg.status === "ready",
  );

  let overallStatus = "idle";

  if (!anyConnected) {
    overallStatus = "idle";
  } else if (allComplete) {
    overallStatus = "complete";
  } else if (waitingForOtherLeg) {
    overallStatus = "waiting";
  } else if (anyRecording) {
    overallStatus = "recording";
  } else if (anyConnectingOrReady) {
    overallStatus = "connecting";
  }

  // --------------------------------------------------
  // Asymmetry
  // --------------------------------------------------
  const bothReported = right.report && left.report;

  let asymmetry = null;

  if (bothReported) {
    const eL = left.report.meanEnergy;
    const eR = right.report.meanEnergy;
    const jL = left.report.meanJerk;
    const jR = right.report.meanJerk;

    const hasValidEnergy = Number.isFinite(eL) && Number.isFinite(eR);

    const hasValidJerk = Number.isFinite(jL) && Number.isFinite(jR);

    const bsiEnergy = hasValidEnergy
      ? (Math.abs(eL - eR) / (0.5 * (eL + eR) || 1)) * 100
      : null;

    const bsiJerk = hasValidJerk
      ? (Math.abs(jL - jR) / (0.5 * (jL + jR) || 1)) * 100
      : null;

    asymmetry = {
      bsiEnergy,
      bsiJerk,
    };
  }
  // --------------------------------------------------
  // Save result
  // --------------------------------------------------
  useEffect(() => {
    if (overallStatus !== "complete" || saved) {
      return;
    }

    let timeout;

    const saveResult = async () => {
      setSaved(true);

      const scores = [right.report?.igri, left.report?.igri].filter(
        (v) => typeof v === "number" && Number.isFinite(v),
      );

      const finalScore =
        scores.length > 0
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 0;

      let bsiEnergy = null;
      let bsiJerk = null;

      if (right.report && left.report) {
        const eL = left.report.meanEnergy;
        const eR = right.report.meanEnergy;
        const jL = left.report.meanJerk;
        const jR = right.report.meanJerk;

        if (Number.isFinite(eL) && Number.isFinite(eR)) {
          bsiEnergy = (Math.abs(eL - eR) / (0.5 * (eL + eR) || 1)) * 100;
        }

        if (Number.isFinite(jL) && Number.isFinite(jR)) {
          bsiJerk = (Math.abs(jL - jR) / (0.5 * (jL + jR) || 1)) * 100;
        }
      }

      await updatePatient(patientId, {
        gaitScore: finalScore,
        gaitBsiEnergy: bsiEnergy,
        gaitBsiJerk: bsiJerk,
        gaitRightIgri: right.report?.igri ?? null,
        gaitLeftIgri: left.report?.igri ?? null,
      });

      timeout = setTimeout(() => {
        onComplete();
      }, 1000);
    };

    saveResult();

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [overallStatus, saved, patientId, onComplete, right.report, left.report]);
  // --------------------------------------------------
  // Cleanup BLE
  // --------------------------------------------------

  useEffect(() => {
    return () => {
      [rightDeviceRef, leftDeviceRef].forEach((ref) => {
        const device = ref.current;

        if (device?.gatt?.connected) {
          device.gatt.disconnect();
        }
      });
    };
  }, []);

  const handleSimulate = () => {
    setTestMode("both");

    setRight((prev) => ({
      ...prev,
      status: "recording",
      connectError: null,
    }));

    setLeft((prev) => ({
      ...prev,
      status: "recording",
      connectError: null,
    }));

    setRightCountdown(TEST_DURATION_S);
    setLeftCountdown(TEST_DURATION_S);

    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += 1;

      const simulatedAngle = 30 + Math.sin(elapsed / 2) * 20;

      setRight((prev) => ({
        ...prev,
        kneeAngle: Math.max(0, simulatedAngle),
      }));

      setLeft((prev) => ({
        ...prev,
        kneeAngle: Math.max(0, simulatedAngle * 0.9),
      }));

      if (elapsed % 2 === 0) {
        setRight((prev) => ({
          ...prev,
          windowsProcessed: Math.min(prev.windowsProcessed + 1, 25),
        }));

        setLeft((prev) => ({
          ...prev,
          windowsProcessed: Math.min(prev.windowsProcessed + 1, 25),
        }));
      }

      if (elapsed >= TEST_DURATION_S) {
        clearInterval(timer);

        setRight((prev) => ({
          ...prev,
          status: "complete",
          report: {
            igri: 72,
            sMl: 70,
            sConsist: 75,
            sCoord: 71,
            winHealthy: 15,
            winModerate: 7,
            winBad: 3,
            meanEnergy: 24000,
            meanJerk: 1800,
          },
        }));

        setLeft((prev) => ({
          ...prev,
          status: "complete",
          report: {
            igri: 68,
            sMl: 65,
            sConsist: 70,
            sCoord: 68,
            winHealthy: 13,
            winModerate: 8,
            winBad: 4,
            meanEnergy: 21000,
            meanJerk: 2100,
          },
        }));
      }
    }, 1000);
  };

  const progress =
    overallStatus === "idle"
      ? 0
      : overallStatus === "connecting" || overallStatus === "waiting"
        ? 25
        : overallStatus === "recording"
          ? 65
          : 100;

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

              <p className="mt-1 text-sm text-slate-500">
                {t("gait.subtitle")}
              </p>
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
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* IDLE */}

        {overallStatus === "idle" && (
          <div className="p-6 sm:p-8">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <div className="h-3 w-3 rounded-full bg-blue-600" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {t("gait.ready")}
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                    {t("gait.readyDescription")}
                  </p>
                </div>
              </div>
            </div>

            {/* Start buttons */}

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={handleStartRight}
                className="w-full rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                {t("gait.startRight")}
              </button>

              <button
                type="button"
                onClick={handleStartLeft}
                className="w-full rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                {t("gait.startLeft")}
              </button>

              <button
                type="button"
                onClick={handleStartBoth}
                className="w-full rounded-xl border-2 border-blue-600 bg-white px-6 py-3.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
              >
                {t("gait.startBoth")}
              </button>
            </div>

            {/* Information */}

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs leading-5 text-slate-500">
                <span className="font-semibold text-slate-700">Both legs:</span>{" "}
                Connect both OrthoEdge sensors when prompted. The walking screen
                will appear after both sensors are connected.
              </p>
            </div>

            {/* Simulation */}
{/* 
            <button
              type="button"
              onClick={handleSimulate}
              className="mt-4 w-full rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Simulate Gait Test
            </button> */}

            <p className="mt-3 text-center text-xs text-slate-400">
              {t("gait.sensorReminder")}
            </p>
          </div>
        )}

        {/* CONNECTING */}

        {overallStatus === "connecting" && (
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

            {testMode === "both" && (
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                Connect both OrthoEdge sensors to continue.
              </p>
            )}
          </div>
        )}

        {/* WAITING */}

        {overallStatus === "waiting" && (
          <div className="p-8 text-center sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-amber-100 bg-amber-50">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-amber-100 border-t-amber-600" />
            </div>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.15em] text-amber-600">
              {t("gait.waitingForOtherSensor") || "Almost there"}
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {t("gait.waitingTitle") || "Waiting for the other sensor…"}
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
              One sensor is already connected. Connect the other sensor to start
              the bilateral gait display.
            </p>
          </div>
        )}

        {/* RECORDING */}

        {overallStatus === "recording" && (
          <div className="p-6 text-center sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-xs font-semibold tracking-wide text-red-600">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />

              {t("gait.recordingInProgress")}
            </div>

            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">
              {t("gait.walkNormally")}
            </h2>

            {testMode === "both" && (
              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-400">
                Both leg sensors are being monitored.
              </p>
            )}

            <div
              className={`mt-6 grid gap-6 ${
                rightConnected && leftConnected ? "sm:grid-cols-2" : ""
              }`}
            >
              {rightConnected && (
                <LegPanel
                  title="Right leg"
                  angle={right.kneeAngle}
                  windowsProcessed={right.windowsProcessed}
                  countdown={rightCountdown}
                />
              )}

              {leftConnected && (
                <LegPanel
                  title="Left leg"
                  angle={left.kneeAngle}
                  windowsProcessed={left.windowsProcessed}
                  countdown={leftCountdown}
                />
              )}
            </div>
          </div>
        )}

        {/* COMPLETE */}

        {overallStatus === "complete" && (
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

            <div
              className={`mx-auto mt-6 grid max-w-lg gap-3 text-left ${
                right.report && left.report ? "sm:grid-cols-2" : ""
              }`}
            >
              {right.report && (
                <ReportCard title="Right leg" report={right.report} />
              )}

              {left.report && (
                <ReportCard title="Left leg" report={left.report} />
              )}
            </div>

            {asymmetry && (
              <div className="mx-auto mt-4 max-w-lg rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
                <p className="text-sm font-semibold text-amber-800">
                  {t("gait.bilateralSymmetry") || "Bilateral Symmetry"}
                </p>

                <p className="mt-1 text-xs text-amber-700">
                  {t("gait.energyAsymmetry") || "Energy asymmetry"}:{" "}
                  {asymmetry.bsiEnergy.toFixed(1)}% ·{" "}
                  {t("gait.jerkAsymmetry") || "Jerk asymmetry"}:{" "}
                  {asymmetry.bsiJerk.toFixed(1)}%
                </p>
              </div>
            )}

            <div className="mx-auto mt-6 h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-full animate-pulse rounded-full bg-blue-600" />
            </div>
          </div>
        )}
      </div>

      <p className="mt-5 text-center text-xs text-slate-400">
        {t("gait.footer")}
      </p>
    </div>
  );
}

function LegPanel({ title, angle, windowsProcessed, countdown }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>

      <KneeSvg angleDeg={angle} />

      <div className="mx-auto mt-3 max-w-55">
        <div className="flex justify-between text-xs text-slate-400">
          <span>
            {TEST_DURATION_S - countdown}/{TEST_DURATION_S}s
          </span>

          <span>{windowsProcessed}/25 windows</span>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{
              width: `${
                ((TEST_DURATION_S - countdown) / TEST_DURATION_S) * 100
              }%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function ReportCard({ title, report }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-900">
        IGRI: {Math.round(report.igri)}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        ML {Math.round(report.sMl)} · Consistency {Math.round(report.sConsist)}{" "}
        · Coordination {Math.round(report.sCoord)}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {report.winHealthy} healthy / {report.winModerate} moderate /{" "}
        {report.winBad} at-risk
      </p>
    </div>
  );
}

// ==================================================
// KNEE SVG
// ==================================================

function KneeSvg({ angleDeg }) {
  return (
    <div className="mx-auto mt-3 max-w-45">
      <svg
        viewBox="0 0 280 320"
        role="img"
        aria-label="Live knee flexion angle"
      >
        <title>Knee flexion</title>

        <line
          x1="20"
          y1="290"
          x2="260"
          y2="290"
          stroke="#e2e8f0"
          strokeWidth="1"
        />

        <g>
          <line
            x1="140"
            y1="60"
            x2="140"
            y2="170"
            stroke="#378ADD"
            strokeWidth="18"
            strokeLinecap="round"
          />

          <circle cx="140" cy="60" r="22" fill="#378ADD" />
        </g>

        <g transform={`rotate(${angleDeg} 140 170)`}>
          <line
            x1="140"
            y1="170"
            x2="140"
            y2="270"
            stroke="#1D9E75"
            strokeWidth="16"
            strokeLinecap="round"
          />

          <ellipse cx="140" cy="270" rx="26" ry="10" fill="#1D9E75" />
        </g>

        <circle
          cx="140"
          cy="170"
          r="10"
          fill="#ffffff"
          stroke="#0C443C"
          strokeWidth="2"
        />
      </svg>

      <p className="mt-1 text-center text-base font-semibold text-slate-900">
        {Math.round(angleDeg)}°
      </p>
    </div>
  );
}
