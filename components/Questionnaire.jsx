"use client";

import { updatePatient } from "@/lib/db";
import RiskScore from "@/lib/RiskScore";
import React, { useState } from "react";

const Questionnaire = ({ patientId, onComplete }) => {
  const [answer, setAnswer] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const answerOptions = [
    { value: 0, label: "None" },
    { value: 1, label: "Mild" },
    { value: 2, label: "Moderate" },
    { value: 3, label: "Severe" },
    { value: 4, label: "Extreme" },
  ];

  const questions = [
    {
      id: "pain_walking_flat",
      group: "Pain",
      question: "How much pain do you feel when walking on a flat surface?",
    },
    {
      id: "pain_stairs",
      group: "Pain",
      question: "How much pain do you feel when going up or down stairs?",
    },
    {
      id: "pain_night",
      group: "Pain",
      question: "How much pain do you feel at night while in bed?",
    },
    {
      id: "pain_sitting_lying",
      group: "Pain",
      question: "How much pain do you feel while sitting or lying down?",
    },
    {
      id: "pain_standing",
      group: "Pain",
      question: "How much pain do you feel while standing upright?",
    },
    {
      id: "stiffness_morning",
      group: "Stiffness",
      question:
        "How stiff are your joints right after waking up in the morning?",
    },
    {
      id: "stiffness_later_day",
      group: "Stiffness",
      question:
        "How stiff do your joints get later in the day, after sitting or resting?",
    },
    {
      id: "function_down_stairs",
      group: "Physical Function",
      question: "How much difficulty do you have going down stairs?",
    },
    {
      id: "function_up_stairs",
      group: "Physical Function",
      question: "How much difficulty do you have going up stairs?",
    },
    {
      id: "function_rising",
      group: "Physical Function",
      question: "How much difficulty do you have rising from sitting?",
    },
    {
      id: "function_standing",
      group: "Physical Function",
      question: "How much difficulty do you have standing?",
    },
    {
      id: "function_bending",
      group: "Physical Function",
      question: "How much difficulty do you have bending to the floor?",
    },
    {
      id: "function_walking",
      group: "Physical Function",
      question: "How much difficulty do you have walking on flat ground?",
    },
    {
      id: "function_vehicle",
      group: "Physical Function",
      question:
        "How much difficulty do you have getting in or out of a vehicle?",
    },
    {
      id: "function_heavy_work",
      group: "Physical Function",
      question:
        "How much difficulty do you have doing heavy household or farm work?",
    },
    {
      id: "function_bed",
      group: "Physical Function",
      question: "How much difficulty do you have getting in or out of bed?",
    },
    {
      id: "function_squatting",
      group: "Physical Function",
      question: "How much difficulty do you have squatting?",
    },
  ];

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const isFirstQuestion = currentQuestion === 0;

  const selectedValue = answer[question.group]?.[question.id];

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              OA Risk Screening
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              Patient Questionnaire
            </h1>
          </div>

          <div className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-600">
            {currentQuestion + 1}/{questions.length}
          </div>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6">
          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            {question.group}
          </span>

          <h2 className="mt-5 text-xl font-semibold leading-8 text-gray-900 sm:text-2xl">
            {question.question}
          </h2>
        </div>

        <div className="space-y-3">
          {answerOptions.map((option) => {
            const isSelected = selectedValue === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setAnswer((prev) => ({
                    ...prev,
                    [question.group]: {
                      ...prev[question.group],
                      [question.id]: option.value,
                    },
                  }));
                }}
                className={`flex min-h-14 w-full items-center cursor-pointer justify-between rounded-xl border-2 px-4 text-left transition ${
                  isSelected
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-gray-50"
                }`}
              >
                <span className="font-medium">{option.label}</span>

                <span
                  className={`flex h-7 w-7 items-center justify-center cursor-pointer rounded-full border text-sm font-semibold ${
                    isSelected
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-300 text-gray-500"
                  }`}
                >
                  {option.value}
                </span>
              </button>
            );
          })}
        </div>



        <div className="mt-7 flex gap-3">
          <button
            type="button"
            disabled={isFirstQuestion}
            onClick={() => {
              setCurrentQuestion((prev) => prev - 1);
            }}
            className="min-h-12 flex-1 rounded-xl border cursor-pointer border-gray-300 px-4 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <button
            type="button"
            disabled={selectedValue === undefined}
            onClick={async () => {
              if (isLastQuestion) {
                const result = RiskScore(answer);

                await updatePatient(patientId, {
                  questionnaireAnswers: answer,
                  womacScore: result,
                });

                onComplete();
              } else {
                setCurrentQuestion((prev) => prev + 1);
              }
            }}
            className="min-h-12 flex-1 rounded-xl bg-blue-600 px-4 font-semibold text-white cursor-pointer transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isLastQuestion ? "Submit" : "Next"}
          </button>
        </div>
      </div>

      <p className="mt-5 text-center text-xs leading-5 text-gray-500">
        Select the response that best describes the patient's current
        condition.
      </p>
    </div>
  );
};

export default Questionnaire;