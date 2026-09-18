  // Keep values unchanged because they are used for storing/scoring.
  export const answerOptions = [
    { value: 0, label: "None", labelKey: "questionnaire.none" },
    { value: 1, label: "Mild", labelKey: "questionnaire.mild" },
    { value: 2, label: "Moderate", labelKey: "questionnaire.moderate" },
    { value: 3, label: "Severe", labelKey: "questionnaire.severe" },
    { value: 4, label: "Extreme", labelKey: "questionnaire.extreme" },
  ];

  // Keep these IDs and groups unchanged because they are part of your data.
 export const questions = [
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