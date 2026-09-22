"use client";
import { useState } from "react";
import PatientForm from "@/components/PatientForm";
import Questionnaire from "@/components/Questionnaire";
import GaitTest from "@/components/GaitTest";
import Result from "@/components/Result";
import Referral from "./Referral";

export default function ScreeningFlow() {
  const [step, setStep] = useState("patient");
  const [patientId, setPatientId] = useState(null);

  const handleContinueScreening = () => {
    setPatientId(null);
    setStep("patient");
  };

  return (
    <>
      {step === "patient" && (
        <PatientForm
          onComplete={(id) => {
            setPatientId(id);
            setStep("questionnaire");
          }}
        />
      )}

      {step === "questionnaire" && (
        <Questionnaire
          patientId={patientId}
          onComplete={() => {
            setStep("gait-test");
          }}
        />
      )}
      {step === "gait-test" && (
        <GaitTest patientId={patientId} onComplete={() => setStep("result")} />
      )}
{step === 'result' && (
  <Result
    patientId={patientId}
    onComplete={() => setStep('referral')}
    onContinueScreening={handleContinueScreening}
  />
)}

{step === 'referral' && (
  <Referral onContinueScreening={handleContinueScreening} />
)}
    </>
  );
}
