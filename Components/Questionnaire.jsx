"use client";
import RiskScore from "@/lib/RiskScore";
import RiskResultCard from "./RiskResultCard";
import React, { useState } from "react";

const Questionnaire = () => {
  const [answer, setAnswer] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState(null);

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
  const isFirstQuestion = currentQuestion === 0

  return (
    <>
      <h2>{question.group}</h2>

      <div>{question.question}</div>

      <div>
        {answerOptions.map((answer) => {
          return (
            <button
              key={answer.value}
              onClick={() => {
                setAnswer((prev) => ({
                  ...prev,
                  [question.group]: {
                    ...prev[question.group],
                    [question.id]: answer.value,
                  },
                }));
              }}
            >
              {answer.label}
            </button>
          );
        })}
      </div>
      <div>
        {" "}
        selected answer ={" "}
        {
          answerOptions.find(
            (option) => option.value == answer[question.group]?.[question.id],
          )?.label
        }
      </div>
      <button
      disabled={currentQuestion===0}
  onClick={() => {
  setCurrentQuestion(currentQuestion-1)
  }}
>
  Previous
</button>

      <button
       disabled={answer[question.group]?.[question.id] === undefined}
  onClick={() => {
    if (isLastQuestion) {
     let result=  RiskScore(answer);
     setScores(result)
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  }}
>
  {isLastQuestion ? "Submit" : "Next"}
</button>

{scores && <RiskResultCard scores={scores} />}
    </>
  );
};

export default Questionnaire;
