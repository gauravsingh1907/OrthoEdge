"use client";

import { updatePatient } from "@/lib/db";
import RiskScore from "@/lib/RiskScore";
import { useLanguage } from "@/components/LanguageProvider";
import React, { useState } from "react";

const Questionnaire = ({ patientId, onComplete }) => {
  const { t } = useLanguage();

  const [answer, setAnswer] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Keep values unchanged because they are used for storing/scoring.
  const answerOptions = [
    { value: 0, label: "None", labelKey: "questionnaire.none" },
    { value: 1, label: "Mild", labelKey: "questionnaire.mild" },
    { value: 2, label: "Moderate", labelKey: "questionnaire.moderate" },
    { value: 3, label: "Severe", labelKey: "questionnaire.severe" },
    { value: 4, label: "Extreme", labelKey: "questionnaire.extreme" },
  ];

  // Keep these IDs and groups unchanged because they are part of your data.
  const questions = [
    {
      id: "pain_walking_flat",
      group: "Pain",
      question: "How much pain do you feel when walking on a flat surface?",
      questionKey: "questionnaire.questions.painWalkingFlat",
    },
    {
      id: "pain_stairs",
      group: "Pain",
      question:
        "How much pain do you feel when going up or down stairs?",
      questionKey: "questionnaire.questions.painStairs",
    },
    {
      id: "pain_night",
      group: "Pain",
      question: "How much pain do you feel at night while in bed?",
      questionKey: "questionnaire.questions.painNight",
    },
    {
      id: "pain_sitting_lying",
      group: "Pain",
      question:
        "How much pain do you feel while sitting or lying down?",
      questionKey: "questionnaire.questions.painSittingLying",
    },
    {
      id: "pain_standing",
      group: "Pain",
      question: "How much pain do you feel while standing upright?",
      questionKey: "questionnaire.questions.painStanding",
    },
    {
      id: "stiffness_morning",
      group: "Stiffness",
      question:
        "How stiff are your joints right after waking up in the morning?",
      questionKey: "questionnaire.questions.stiffnessMorning",
    },
    {
      id: "stiffness_later_day",
      group: "Stiffness",
      question:
        "How stiff do your joints get later in the day, after sitting or resting?",
      questionKey: "questionnaire.questions.stiffnessLaterDay",
    },
    {
      id: "function_down_stairs",
      group: "Physical Function",
      question:
        "How much difficulty do you have going down stairs?",
      questionKey: "questionnaire.questions.functionDownStairs",
    },
    {
      id: "function_up_stairs",
      group: "Physical Function",
      question:
        "How much difficulty do you have going up stairs?",
      questionKey: "questionnaire.questions.functionUpStairs",
    },
    {
      id: "function_rising",
      group: "Physical Function",
      question:
        "How much difficulty do you have rising from sitting?",
      questionKey: "questionnaire.questions.functionRising",
    },
    {
      id: "function_standing",
      group: "Physical Function",
      question:
        "How much difficulty do you have standing?",
      questionKey: "questionnaire.questions.functionStanding",
    },
    {
      id: "function_bending",
      group: "Physical Function",
      question:
        "How much difficulty do you have bending to the floor?",
      questionKey: "questionnaire.questions.functionBending",
    },
    {
      id: "function_walking",
      group: "Physical Function",
      question:
        "How much difficulty do you have walking on flat ground?",
      questionKey: "questionnaire.questions.functionWalking",
    },
    {
      id: "function_vehicle",
      group: "Physical Function",
      question:
        "How much difficulty do you have getting in or out of a vehicle?",
      questionKey: "questionnaire.questions.functionVehicle",
    },
    {
      id: "function_heavy_work",
      group: "Physical Function",
      question:
        "How much difficulty do you have doing heavy household or farm work?",
      questionKey: "questionnaire.questions.functionHeavyWork",
    },
    {
      id: "function_bed",
      group: "Physical Function",
      question:
        "How much difficulty do you have getting in or out of bed?",
      questionKey: "questionnaire.questions.functionBed",
    },
    {
      id: "function_squatting",
      group: "Physical Function",
      question:
        "How much difficulty do you have squatting?",
      questionKey: "questionnaire.questions.functionSquatting",
    },
  ];

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const isFirstQuestion = currentQuestion === 0;

  const selectedValue = answer[question.group]?.[question.id];

  const progress =
    ((currentQuestion + 1) / questions.length) * 100;

  const groupKey = {
    Pain: "questionnaire.pain",
    Stiffness: "questionnaire.stiffness",
    "Physical Function": "questionnaire.physicalFunction",
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              {t("questionnaire.title")}
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
            {t(groupKey[question.group])}
          </span>

          <h2 className="mt-5 text-xl font-semibold leading-8 text-gray-900 sm:text-2xl">
            {t(question.questionKey)}
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
                className={`flex min-h-14 w-full cursor-pointer items-center justify-between rounded-xl border-2 px-4 text-left transition ${
                  isSelected
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-gray-50"
                }`}
              >
                <span className="font-medium">
                  {t(option.labelKey)}
                </span>

                <span
                  className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border text-sm font-semibold ${
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
            className="min-h-12 flex-1 cursor-pointer rounded-xl border border-gray-300 px-4 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("common.back")}
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
            className="min-h-12 flex-1 cursor-pointer rounded-xl bg-blue-600 px-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isLastQuestion
              ? t("common.submit")
              : t("common.next")}
          </button>
        </div>
      </div>

      <p className="mt-5 text-center text-xs leading-5 text-gray-500">
        {t("questionnaire.instruction")}
      </p>
    </div>
  );
};

export default Questionnaire;