function RiskScore(answer) {

  let pain = Object.values(answer.Pain)
    .reduce((sum, score) => sum + score, 0);

  let stiffness = Object.values(answer.Stiffness)
    .reduce((sum, score) => sum + score, 0);

  let physicalfunction = Object.values(answer["Physical Function"])
    .reduce((sum, score) => sum + score, 0);

  let sum = pain + stiffness + physicalfunction;

  let painPercent = (pain / 20) * 100;
  let stiffnessPercent = (stiffness / 8) * 100;
  let physicalfunctionPercent = (physicalfunction / 40) * 100;
  let overallPercent = (sum / 68) * 100;

  function getBand(percent) {
    if (percent <= 33) return "Low";
    if (percent <= 66) return "Medium";
    return "High";
  }

  let overallBand = getBand(overallPercent);
  let painBand = getBand(painPercent);
  let stiffnessBand = getBand(stiffnessPercent);
  let physicalfunctionBand = getBand(physicalfunctionPercent);

  return {
    overall: {
      score: overallPercent,
      band: overallBand
    },
    pain: {
      score: painPercent,
      band: painBand
    },
    stiffness: {
      score: stiffnessPercent,
      band: stiffnessBand
    },
    physicalfunction: {
      score: physicalfunctionPercent,
      band: physicalfunctionBand
    }
  };
}

export default RiskScore;