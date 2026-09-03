function RiskResultCard({ scores }) {
  return (
    <div>
      <h2>OA Risk Screening Result</h2>

      <div>
        <h3>Overall</h3>
        <p>Score: {scores.overall.score.toFixed(1)}%</p>
        <p>Risk: {scores.overall.band}</p>
      </div>

      <div>
        <h3>Pain</h3>
        <p>Score: {scores.pain.score.toFixed(1)}%</p>
        <p>Risk: {scores.pain.band}</p>
      </div>

      <div>
        <h3>Stiffness</h3>
        <p>Score: {scores.stiffness.score.toFixed(1)}%</p>
        <p>Risk: {scores.stiffness.band}</p>
      </div>

      <div>
        <h3>Physical Function</h3>
        <p>Score: {scores.physicalfunction.score.toFixed(1)}%</p>
        <p>Risk: {scores.physicalfunction.band}</p>
      </div>
    </div>
  );
}

export default RiskResultCard;