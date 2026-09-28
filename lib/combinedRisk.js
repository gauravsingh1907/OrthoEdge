export function combineRisk(womacScore, gaitScore) {
  const combinedScore = Math.round(
    womacScore * 0.4 + gaitScore * 0.6
  );

  let band;

  if (combinedScore <= 29) {
    band = "Low";
  } else if (combinedScore <= 59) {
    band = "Moderate";
  } else {
    band = "High";
  }

  return {
    womacScore,
    gaitScore,
    combinedScore,
    band,
  };
}