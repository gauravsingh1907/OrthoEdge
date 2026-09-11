"use client"
import { useState } from 'react'
import PatientForm from '@/Components/PatientForm'
import Questionnaire from '@/Components/Questionnaire'
import GaitTest from '@/Components/GaitTest'
import Result from '@/Components/Result'

export default function ScreeningFlow() {
  const [step, setStep] = useState('patient')
  const [patientId, setPatientId] = useState(null)

  return (
    <>
      {step === 'patient' && (
        <PatientForm onComplete={(id) => {
          setPatientId(id)
          setStep('questionnaire')
        }} />
      )}

      {step === 'questionnaire' && (
        <Questionnaire patientId={patientId} onComplete={() => {
          setStep('gait-test')
        }} />
      )}
      {step === 'gait-test' && (
        <GaitTest
          patientId={patientId}
          onComplete={() => setStep('result')}
        />
      )}
      {step === 'result' && (
        <Result
          patientId={patientId}
        />
      )}
    </>
  )
}