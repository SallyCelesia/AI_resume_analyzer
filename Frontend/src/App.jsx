import { useRef, useState } from "react";
import { createComparison } from "./api/comparisons.js";
import Analysis from "./components/Analysis.jsx";

function App() {
  const fileInputRef = useRef(null);
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [comparison, setComparison] = useState(null);
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleFile(file) {
    if (!file) return;
    setError("");
    setComparison(null);

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setResume(null);
      setError("That doesn't look like a PDF — try a .pdf file.");
      return;
    }

    setResume(file);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragOver(false);
    handleFile(event.dataTransfer.files[0]);
  }

  function handleDropzoneKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      fileInputRef.current?.click();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!resume) {
      setError("Choose a resume PDF before submitting.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Enter the job description before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createComparison(resume, jobDescription);
      setComparison(result.comparison);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function reset() {
    setResume(null);
    setJobDescription("");
    setComparison(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // The backend only responds 201 once the analysis exists, so a successful
  // submission always arrives with one. Failures surface through `error`.
  const analysis = comparison?.analysis;

  return (
    <>
      <div className="blob blob-1" aria-hidden="true" />
      <div className="blob blob-2" aria-hidden="true" />
      <div className="blob blob-3" aria-hidden="true" />

      <header className="nav glass">
        <span className="logo">
          Zero<span>2</span>Shipped
        </span>
        <span className="tag">AI Resume Parser</span>
      </header>

      <main>
        <section className="hero">
          <h1>
            Compare your resume to a <em>job description</em>
          </h1>
          <p>
            Upload a resume PDF and add the job description. It is scored out of
            100, with the skills present and missing, and the top 3 fixes worth
            making first.
          </p>
        </section>

        <form className="upload-card glass" onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="resume-upload">
            Resume PDF
          </label>
          <div
            className={`dropzone${isDragOver ? " dragover" : ""}`}
            role="button"
            tabIndex={0}
            aria-disabled={isSubmitting}
            onClick={() => {
              if (!isSubmitting) fileInputRef.current?.click();
            }}
            onKeyDown={handleDropzoneKeyDown}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragOver(true);
            }}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragOver(false);
            }}
            onDrop={handleDrop}
            aria-label="Choose or drop a resume PDF"
          >
            <div className="dz-icon" aria-hidden="true">
              📄
            </div>
            {resume ? (
              <p>
                <strong>{resume.name}</strong>{" "}
                <span className="browse">Change file</span>
              </p>
            ) : (
              <p>
                <strong>Drop your PDF here</strong> or{" "}
                <span className="browse">browse</span>
              </p>
            )}
            <p className="hint">PDF only · maximum file size 10 MB</p>
          </div>
          <input
            ref={fileInputRef}
            id="resume-upload"
            type="file"
            accept="application/pdf,.pdf"
            className="file-input"
            aria-label="Choose a resume PDF"
            disabled={isSubmitting}
            onChange={(event) => handleFile(event.target.files[0])}
          />

          <label className="field-label" htmlFor="job-description">
            Job description
          </label>
          <textarea
            id="job-description"
            className="job-description"
            value={jobDescription}
            onChange={(event) => {
              setJobDescription(event.target.value);
              setComparison(null);
              setError("");
            }}
            placeholder="Paste the job description here…"
            rows={8}
            maxLength={20000}
            required
            disabled={isSubmitting}
          />
          <p className="hint character-count">
            {jobDescription.length.toLocaleString()} / 20,000 characters
          </p>

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}

          <button className="btn submit-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Analysing…
              </>
            ) : (
              "Submit for comparison"
            )}
          </button>
        </form>

        {analysis && (
          <section className="results" aria-label="Comparison result">
            <div className="score-card glass">
              <h2>Your match score</h2>
              <Analysis analysis={analysis} />
              {analysis.summary && <p className="verdict">{analysis.summary}</p>}
              <p className="file-note">
                {comparison.resume.fileName} ·{" "}
                {(comparison.resume.size / 1024).toFixed(0)} KB
              </p>
              <button className="btn" type="button" onClick={reset}>
                Start another comparison
              </button>
            </div>
          </section>
        )}
      </main>

      <footer>AI_Resume_Analyzer workshop · scored by labd</footer>
    </>
  );
}

export default App;
