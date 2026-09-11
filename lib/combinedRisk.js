
export function combineRisk(womacScore, gaitScore) {
  const combinedScore = Math.round(
    womacScore * 0.4 + gaitScore * 0.6
  );

  let band;

  if (combinedScore === 0) {
    band = "None";
  } else if (combinedScore <= 29) {
    band = "Low";
  } else if (combinedScore <= 49) {
    band = "Mild";
  } else if (combinedScore <= 74) {
    band = "Moderate";
  } else {
    band = "Severe";
  }

  return {
    womacScore,
    gaitScore,
    combinedScore,
    band,
  };
}

