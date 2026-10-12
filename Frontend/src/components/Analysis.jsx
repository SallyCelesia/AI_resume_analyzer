// Renders the AI analysis: the score out of 100, which skills the job asks for
// that the resume shows and misses, and the three fixes worth making first.
export default function Analysis({ analysis }) {
  if (!analysis) return null;

  const { score, skillsPresent = [], skillsMissing = [], fixes = [] } = analysis;

  return (
    <div className="analysis">
      <p className="score-value">
        {score}
        <span className="score-max">/100</span>
      </p>
      <div
        className="score-meter"
        role="img"
        aria-label={`Resume match score ${score} out of 100`}
      >
        <div className="score-meter-fill" style={{ width: `${score}%` }} />
      </div>

      <div className="skills">
        <div className="skill-group">
          <h3 className="skill-title">Skills present</h3>
          {skillsPresent.length ? (
            <ul className="skill-list">
              {skillsPresent.map((skill) => (
                <li className="pill pill-present" key={skill}>
                  {skill}
                </li>
              ))}
            </ul>
          ) : (
            <p className="hint">No matching skills found.</p>
          )}
        </div>

        <div className="skill-group">
          <h3 className="skill-title">Skills missing</h3>
          {skillsMissing.length ? (
            <ul className="skill-list">
              {skillsMissing.map((skill) => (
                <li className="pill pill-missing" key={skill}>
                  {skill}
                </li>
              ))}
            </ul>
          ) : (
            <p className="hint">Nothing important is missing.</p>
          )}
        </div>
      </div>

      <div className="fixes">
        <h3 className="skill-title">
          {fixes.length === 1 ? "Top fix" : `Top ${fixes.length} fixes`}
        </h3>
        <ol className="fix-list">
          {fixes.map((fix, index) => (
            <li className="fix-item" key={index}>
              <span className="fix-num" aria-hidden="true">
                {index + 1}
              </span>
              <span>{fix}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
