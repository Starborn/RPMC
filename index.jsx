import { useState, useCallback } from "react";

// ===== REVIEW PROCESS MODEL CARD SCHEMA =====
const SCHEMA = {
  submission: {
    title: "Submission Metadata",
    fields: [
      { id: "sub_id", label: "Submission ID", type: "text", required: true, help: "Unique identifier assigned at receipt" },
      { id: "sub_date", label: "Date Received", type: "date", required: true, help: "ISO 8601 timestamp of submission receipt" },
      { id: "venue_name", label: "Venue Name", type: "text", required: true, help: "Journal, conference, or funding body" },
      { id: "venue_type", label: "Venue Type", type: "select", required: true, options: ["journal", "conference", "funding-body", "promotion-committee"], help: "Type of assessment venue" },
      { id: "track", label: "Track / Category", type: "text", required: false, help: "Submission track or category if applicable" },
    ]
  },
  demographics: {
    title: "Author Demographics (Aggregated)",
    fields: [
      { id: "author_count", label: "Number of Authors", type: "number", required: true, help: "Total number of authors on submission" },
      { id: "author_regions", label: "Author Region(s)", type: "multiselect", required: true, options: ["Africa", "Asia-Pacific", "Europe", "Latin America", "Middle East", "North America", "Oceania"], help: "Geographic regions represented among authors" },
      { id: "career_stages", label: "Career Stage(s)", type: "multiselect", required: true, options: ["student", "early-career", "mid-career", "senior", "independent-scholar", "industry"], help: "Career stages represented among authors" },
      { id: "institution_types", label: "Institution Type(s)", type: "multiselect", required: true, options: ["R1-university", "teaching-institution", "independent-institute", "industry-lab", "government-agency", "unaffiliated"], help: "Types of institutions represented" },
      { id: "language_background", label: "Primary Language Background", type: "select", required: false, options: ["native-English", "non-native-English", "mixed", "undisclosed"], help: "Relevant for LLM detector bias analysis" },
    ]
  },
  ai_tools: {
    title: "AI Tools Invoked",
    fields: [
      { id: "tools_used", label: "AI Tools Used", type: "tool_list", required: true, help: "List all AI tools applied to this submission" },
    ]
  },
  review_process: {
    title: "Review Process (Pseudonymised)",
    fields: [
      { id: "num_reviewers", label: "Number of Reviewers Assigned", type: "number", required: true, help: "Total reviewers assigned (identity protected)" },
      { id: "assignment_date", label: "Reviewer Assignment Date", type: "date", required: true, help: "Date reviewers were assigned" },
      { id: "coi_check", label: "COI Check Performed", type: "select", required: true, options: ["yes-automated", "yes-manual", "yes-both", "no", "undisclosed"], help: "Whether conflict of interest checks were performed" },
      { id: "review_criteria_published", label: "Review Criteria Published in Advance", type: "select", required: true, options: ["yes", "partially", "no"], help: "Whether evaluation criteria were published before submission" },
      { id: "reviews_complete", label: "All Reviews Completed", type: "select", required: true, options: ["yes", "partial", "no"], help: "Whether all assigned reviewers submitted reviews" },
      { id: "review_completion_date", label: "Last Review Completion Date", type: "date", required: false, help: "Date the final review was submitted" },
      { id: "human_review_of_ai", label: "Human Review of AI Tool Outputs", type: "select", required: true, options: ["yes-mandatory", "yes-optional", "no", "not-applicable"], help: "Whether human review was required before acting on AI outputs" },
    ]
  },
  review_quality: {
    title: "Review Quality Indicators (Per Review, Pseudonymised)",
    fields: [
      { id: "review_quality_entries", label: "Review Quality Entries", type: "review_quality_list", required: false, help: "Quality indicators for each review, identified by pseudonym only" },
    ]
  },
  decision: {
    title: "Decision Record",
    fields: [
      { id: "decision_date", label: "Decision Date", type: "date", required: true, help: "Date the editorial/committee decision was communicated" },
      { id: "decision_outcome", label: "Decision Outcome", type: "select", required: true, options: ["accept", "minor-revision", "major-revision", "reject", "desk-reject", "withdrawn"], help: "Final decision outcome" },
      { id: "decision_consistent", label: "Decision Consistent with Aggregate Scores", type: "select", required: true, options: ["yes", "no-override-justified", "no-override-unjustified", "not-applicable"], help: "Whether the decision aligned with reviewer recommendations" },
      { id: "override_reason", label: "Override Reason (if applicable)", type: "select", required: false, options: ["editorial-judgment", "scope-mismatch", "integrity-concern", "capacity-constraint", "other"], help: "Coded reason if decision overrode reviewer consensus" },
      { id: "appeal_available", label: "Appeal Process Available", type: "select", required: true, options: ["yes-structured", "yes-informal", "no"], help: "Whether a formal appeal pathway exists" },
      { id: "appeal_status", label: "Appeal Status", type: "select", required: false, options: ["not-filed", "filed-pending", "filed-upheld", "filed-overturned", "not-applicable"], help: "Current status of any appeal" },
    ]
  }
};

// ===== STYLES =====
const colors = {
  bg: "#0a0f1a",
  surface: "#111827",
  surfaceLight: "#1e293b",
  border: "#2d3a4f",
  borderLight: "#3b4d66",
  accent: "#38bdf8",
  accentDim: "#1e6fa0",
  text: "#e2e8f0",
  textDim: "#94a3b8",
  textMuted: "#64748b",
  success: "#4ade80",
  warning: "#fbbf24",
  error: "#f87171",
  white: "#ffffff",
};

const font = "'IBM Plex Mono', 'Fira Code', monospace";
const fontSans = "'IBM Plex Sans', 'Segoe UI', sans-serif";

// ===== MAIN APP =====
export default function App() {
  const [tab, setTab] = useState("schema");

  return (
    <div style={{ minHeight: "100vh", background: colors.bg, color: colors.text, fontFamily: fontSans }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <header style={{ background: colors.surface, borderBottom: `1px solid ${colors.border}`, padding: "24px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
            <span style={{ fontFamily: font, fontSize: 13, color: colors.accent, letterSpacing: 3, textTransform: "uppercase" }}>OAMAP</span>
            <span style={{ fontSize: 13, color: colors.textMuted }}>Review Process Model Card</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>
            Review Process Model Card
          </h1>
          <p style={{ fontSize: 14, color: colors.textDim, margin: "8px 0 0", maxWidth: 700 }}>
            Structured documentation for academic review processes. Transparency without exposure. Auditability without opacity.
          </p>
        </div>
      </header>

      {/* Tab Nav */}
      <nav style={{ background: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "flex", gap: 0 }}>
          {[
            { id: "schema", label: "1. Schema" },
            { id: "generator", label: "2. Generator" },
            { id: "tutorial", label: "3. Tutorial" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "14px 24px", fontSize: 14, fontWeight: 500, fontFamily: fontSans,
              background: "transparent", border: "none", cursor: "pointer",
              color: tab === t.id ? colors.accent : colors.textMuted,
              borderBottom: tab === t.id ? `2px solid ${colors.accent}` : "2px solid transparent",
              transition: "all 0.2s",
            }}>{t.label}</button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {tab === "schema" && <SchemaTab />}
        {tab === "generator" && <GeneratorTab />}
        {tab === "tutorial" && <TutorialTab />}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${colors.border}`, padding: "24px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: colors.textMuted, margin: 0 }}>
          W3C AI Knowledge Representation Community Group | Epistemic Systems Lab, Ronin Institute | 2026
        </p>
        <p style={{ fontSize: 11, color: colors.textMuted, margin: "4px 0 0" }}>
          Part of the OAMAP framework for auditable research assessment
        </p>
      </footer>
    </div>
  );
}

// ===== SCHEMA TAB =====
function SchemaTab() {
  return (
    <div>
      <SectionHeader title="Review Process Model Card Schema" subtitle="A structured documentation framework for making academic review processes transparent and auditable while preserving reviewer anonymity." />

      <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 8, padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 12px", color: colors.accent }}>Design Principles</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { title: "Anonymity Preserved", desc: "Reviewer identities are never exposed. All review-level data uses pseudonymous identifiers." },
            { title: "Opacity Eliminated", desc: "Every procedural step is timestamped and recorded. Process irregularities become detectable." },
            { title: "Demographic Fairness", desc: "Aggregated author demographics enable bias detection across groups without identifying individuals." },
            { title: "AI Tool Traceability", desc: "All AI tools invoked on a submission are logged with version, output, and confidence -- linking to DF-MC documentation." },
          ].map((p, i) => (
            <div key={i} style={{ background: colors.surfaceLight, padding: 16, borderRadius: 6, border: `1px solid ${colors.border}` }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 6px", color: colors.text }}>{p.title}</h4>
              <p style={{ fontSize: 13, color: colors.textDim, margin: 0, lineHeight: 1.5 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {Object.entries(SCHEMA).map(([key, section]) => (
        <div key={key} style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 8, padding: 24, marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 16px", color: colors.accent, fontFamily: font }}>{section.title}</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                <th style={{ textAlign: "left", padding: "8px 12px", color: colors.textMuted, fontWeight: 500 }}>Field</th>
                <th style={{ textAlign: "left", padding: "8px 12px", color: colors.textMuted, fontWeight: 500 }}>Type</th>
                <th style={{ textAlign: "center", padding: "8px 12px", color: colors.textMuted, fontWeight: 500 }}>Required</th>
                <th style={{ textAlign: "left", padding: "8px 12px", color: colors.textMuted, fontWeight: 500 }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {section.fields.map(f => (
                <tr key={f.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={{ padding: "10px 12px", fontFamily: font, color: colors.text, fontSize: 12 }}>{f.id}</td>
                  <td style={{ padding: "10px 12px", color: colors.textDim }}>{f.type === "select" || f.type === "multiselect" ? `${f.type} [${(f.options||[]).length}]` : f.type}</td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    <span style={{ color: f.required ? colors.success : colors.textMuted, fontSize: 12 }}>{f.required ? "Required" : "Optional"}</span>
                  </td>
                  <td style={{ padding: "10px 12px", color: colors.textDim, maxWidth: 400 }}>{f.help}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {section.fields.some(f => f.options) && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${colors.border}` }}>
              {section.fields.filter(f => f.options).map(f => (
                <div key={f.id} style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: font }}>{f.id}: </span>
                  <span style={{ fontSize: 12, color: colors.textDim }}>{f.options.join(" | ")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 8, padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 12px", color: colors.accent }}>JSON Output Structure</h3>
        <pre style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 6, padding: 16, fontSize: 12, fontFamily: font, color: colors.textDim, overflowX: "auto", lineHeight: 1.6 }}>{`{
  "schema_version": "1.0",
  "generated_date": "2026-04-21T00:00:00Z",
  "submission": { "sub_id": "", "sub_date": "", "venue_name": "", ... },
  "demographics": { "author_count": 0, "author_regions": [], ... },
  "ai_tools": [
    { "tool_name": "", "tool_version": "", "dfmc_url": "",
      "output_classification": "", "confidence_score": 0.0,
      "human_reviewed": true }
  ],
  "review_process": { "num_reviewers": 0, "coi_check": "", ... },
  "reviews": [
    { "pseudonym": "Reviewer-A", "criteria_addressed": 0,
      "criteria_total": 0, "word_count": 0,
      "actionable_feedback": true, "methodology_engaged": true }
  ],
  "decision": { "decision_date": "", "decision_outcome": "", ... }
}`}</pre>
      </div>
    </div>
  );
}

// ===== GENERATOR TAB =====
function GeneratorTab() {
  const [formData, setFormData] = useState({});
  const [aiTools, setAiTools] = useState([{ tool_name: "", tool_version: "", dfmc_url: "", output: "", confidence: "", human_reviewed: "yes" }]);
  const [reviews, setReviews] = useState([{ pseudonym: "Reviewer-A", criteria_addressed: "", criteria_total: "", word_count: "", actionable: "yes", methodology: "yes" }]);
  const [output, setOutput] = useState(null);

  const updateField = (id, val) => setFormData(prev => ({ ...prev, [id]: val }));
  const updateMulti = (id, val) => {
    setFormData(prev => {
      const curr = prev[id] || [];
      return { ...prev, [id]: curr.includes(val) ? curr.filter(v => v !== val) : [...curr, val] };
    });
  };

  const generate = () => {
    const card = {
      schema_version: "1.0",
      generated_date: new Date().toISOString(),
      submission: {},
      demographics: {},
      ai_tools: aiTools,
      review_process: {},
      reviews: reviews.map(r => ({
        ...r,
        criteria_addressed: parseInt(r.criteria_addressed) || 0,
        criteria_total: parseInt(r.criteria_total) || 0,
        word_count: parseInt(r.word_count) || 0,
        actionable_feedback: r.actionable === "yes",
        methodology_engaged: r.methodology === "yes",
      })),
      decision: {},
    };
    Object.entries(SCHEMA).forEach(([section, def]) => {
      if (section === "ai_tools" || section === "review_quality") return;
      const target = section === "review_process" ? "review_process" : section;
      def.fields.forEach(f => {
        if (card[target]) card[target][f.id] = formData[f.id] || "";
      });
    });
    setOutput(card);
  };

  const renderField = (f) => {
    const baseStyle = { width: "100%", padding: "8px 12px", fontSize: 13, fontFamily: fontSans, background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 4, color: colors.text, outline: "none" };

    if (f.type === "select") {
      return (
        <select value={formData[f.id] || ""} onChange={e => updateField(f.id, e.target.value)} style={baseStyle}>
          <option value="">-- Select --</option>
          {f.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    }
    if (f.type === "multiselect") {
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {f.options.map(o => {
            const sel = (formData[f.id] || []).includes(o);
            return (
              <button key={o} onClick={() => updateMulti(f.id, o)} style={{
                padding: "4px 10px", fontSize: 12, borderRadius: 4, cursor: "pointer", fontFamily: fontSans,
                background: sel ? colors.accentDim : "transparent",
                border: `1px solid ${sel ? colors.accent : colors.border}`,
                color: sel ? colors.white : colors.textDim,
              }}>{o}</button>
            );
          })}
        </div>
      );
    }
    if (f.type === "tool_list" || f.type === "review_quality_list") return null;
    return <input type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"} value={formData[f.id] || ""} onChange={e => updateField(f.id, e.target.value)} style={baseStyle} />;
  };

  return (
    <div>
      <SectionHeader title="Review Process Model Card Generator" subtitle="Fill in the fields below to generate a structured, machine-readable model card for a review process. All reviewer identities are pseudonymised." />

      {Object.entries(SCHEMA).map(([key, section]) => (
        <div key={key} style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 8, padding: 24, marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 16px", color: colors.accent }}>{section.title}</h3>
          {section.fields.filter(f => f.type !== "tool_list" && f.type !== "review_quality_list").map(f => (
            <div key={f.id} style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4, color: colors.text }}>
                {f.label} {f.required && <span style={{ color: colors.error, fontSize: 11 }}>*</span>}
              </label>
              <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>{f.help}</div>
              {renderField(f)}
            </div>
          ))}

          {key === "ai_tools" && (
            <div>
              {aiTools.map((tool, i) => (
                <div key={i} style={{ background: colors.surfaceLight, border: `1px solid ${colors.border}`, borderRadius: 6, padding: 16, marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: colors.accent, fontFamily: font, marginBottom: 8 }}>AI Tool {i + 1}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <input placeholder="Tool name" value={tool.tool_name} onChange={e => { const n = [...aiTools]; n[i].tool_name = e.target.value; setAiTools(n); }} style={{ padding: "6px 10px", fontSize: 12, background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 4, color: colors.text, fontFamily: fontSans }} />
                    <input placeholder="Version" value={tool.tool_version} onChange={e => { const n = [...aiTools]; n[i].tool_version = e.target.value; setAiTools(n); }} style={{ padding: "6px 10px", fontSize: 12, background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 4, color: colors.text, fontFamily: fontSans }} />
                    <input placeholder="DF-MC URL (if available)" value={tool.dfmc_url} onChange={e => { const n = [...aiTools]; n[i].dfmc_url = e.target.value; setAiTools(n); }} style={{ padding: "6px 10px", fontSize: 12, background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 4, color: colors.text, fontFamily: fontSans, gridColumn: "1/3" }} />
                    <input placeholder="Output classification" value={tool.output} onChange={e => { const n = [...aiTools]; n[i].output = e.target.value; setAiTools(n); }} style={{ padding: "6px 10px", fontSize: 12, background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 4, color: colors.text, fontFamily: fontSans }} />
                    <input placeholder="Confidence (0-1)" value={tool.confidence} onChange={e => { const n = [...aiTools]; n[i].confidence = e.target.value; setAiTools(n); }} style={{ padding: "6px 10px", fontSize: 12, background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 4, color: colors.text, fontFamily: fontSans }} />
                  </div>
                </div>
              ))}
              <button onClick={() => setAiTools([...aiTools, { tool_name: "", tool_version: "", dfmc_url: "", output: "", confidence: "", human_reviewed: "yes" }])} style={{ padding: "6px 14px", fontSize: 12, background: "transparent", border: `1px solid ${colors.border}`, borderRadius: 4, color: colors.accent, cursor: "pointer", fontFamily: fontSans }}>+ Add AI Tool</button>
            </div>
          )}

          {key === "review_quality" && (
            <div>
              {reviews.map((r, i) => (
                <div key={i} style={{ background: colors.surfaceLight, border: `1px solid ${colors.border}`, borderRadius: 6, padding: 16, marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: colors.accent, fontFamily: font, marginBottom: 8 }}>{r.pseudonym}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    <input placeholder="Criteria addressed" value={r.criteria_addressed} onChange={e => { const n = [...reviews]; n[i].criteria_addressed = e.target.value; setReviews(n); }} style={{ padding: "6px 10px", fontSize: 12, background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 4, color: colors.text, fontFamily: fontSans }} />
                    <input placeholder="Criteria total" value={r.criteria_total} onChange={e => { const n = [...reviews]; n[i].criteria_total = e.target.value; setReviews(n); }} style={{ padding: "6px 10px", fontSize: 12, background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 4, color: colors.text, fontFamily: fontSans }} />
                    <input placeholder="Word count" value={r.word_count} onChange={e => { const n = [...reviews]; n[i].word_count = e.target.value; setReviews(n); }} style={{ padding: "6px 10px", fontSize: 12, background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 4, color: colors.text, fontFamily: fontSans }} />
                  </div>
                </div>
              ))}
              <button onClick={() => { const ltr = String.fromCharCode(65 + reviews.length); setReviews([...reviews, { pseudonym: `Reviewer-${ltr}`, criteria_addressed: "", criteria_total: "", word_count: "", actionable: "yes", methodology: "yes" }]); }} style={{ padding: "6px 14px", fontSize: 12, background: "transparent", border: `1px solid ${colors.border}`, borderRadius: 4, color: colors.accent, cursor: "pointer", fontFamily: fontSans }}>+ Add Reviewer</button>
            </div>
          )}
        </div>
      ))}

      <button onClick={generate} style={{ padding: "12px 32px", fontSize: 14, fontWeight: 600, background: colors.accent, color: colors.bg, border: "none", borderRadius: 6, cursor: "pointer", fontFamily: fontSans }}>
        Generate Review Process Model Card
      </button>

      {output && (
        <div style={{ marginTop: 24, background: colors.surface, border: `1px solid ${colors.accent}`, borderRadius: 8, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: colors.accent }}>Generated Model Card</h3>
            <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(output, null, 2)); }} style={{ padding: "6px 14px", fontSize: 12, background: colors.surfaceLight, border: `1px solid ${colors.border}`, borderRadius: 4, color: colors.accent, cursor: "pointer", fontFamily: fontSans }}>
              Copy JSON
            </button>
          </div>
          <pre style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 6, padding: 16, fontSize: 11, fontFamily: font, color: colors.textDim, overflowX: "auto", lineHeight: 1.5, maxHeight: 500, overflow: "auto" }}>
            {JSON.stringify(output, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// ===== TUTORIAL TAB =====
function TutorialTab() {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "What is a Review Process Model Card?",
      content: `A Review Process Model Card is structured documentation for an academic review process -- like a nutrition label for peer review. Just as AI model cards (Mitchell et al., 2019) document what a machine learning model can and cannot do, a Review Process Model Card documents what happened during a review: when was the submission received, how many reviewers were assigned, what AI tools were used, whether review criteria were followed, and what decision was reached.

The key innovation is the separation of anonymity from opacity. Reviewer identities are never revealed -- they appear only as pseudonyms (Reviewer-A, Reviewer-B). But the process itself becomes transparent: dates, criteria coverage, AI tool invocations, and decision provenance are all recorded.

This matters because AI tools (LLM detectors, plagiarism checkers, statistical screeners) are increasingly used in review pipelines without any documentation of which tools were used, how they were configured, or how their outputs influenced decisions.`
    },
    {
      title: "Understanding the Schema",
      content: `The schema has six sections, each capturing a different aspect of the review process:

1. Submission Metadata -- basic identification: when was it received, by which venue, in which track.

2. Author Demographics (Aggregated) -- not individual author data, but aggregate characteristics: how many authors, from which regions, at what career stages, from what types of institutions, and what language background. This enables fairness analysis: are submissions from certain regions or career stages being rejected at higher rates?

3. AI Tools Invoked -- every AI tool that processed the submission: its name, version, what it outputted, its confidence score, and whether a human reviewed the output. Each tool links to a Digital Forensics Model Card (DF-MC) that documents the tool's known biases and error rates.

4. Review Process -- the procedural record: how many reviewers, when assigned, whether conflict-of-interest checks were performed, whether criteria were published in advance, whether all reviews were completed.

5. Review Quality Indicators -- per-review metrics using pseudonyms only: how many criteria were addressed, word count (a rough proxy for engagement), whether actionable feedback was provided, whether the methodology was engaged with.

6. Decision Record -- the outcome: accept, reject, revise. Whether the decision was consistent with reviewer scores. If it overrode the scores, what the coded reason was. Whether an appeal pathway exists.`
    },
    {
      title: "Building the Generator: Project Setup",
      content: `To build your own Review Process Model Card Generator, you need basic knowledge of HTML, CSS, and JavaScript. We will use React, a popular library for building web interfaces.

STEP 1: Install Node.js from nodejs.org (version 18 or later).

STEP 2: Create a new React project:
  npx create-react-app review-card-generator
  cd review-card-generator

STEP 3: Open the project in your code editor (VS Code is recommended).

STEP 4: Replace the contents of src/App.js with your generator code.

STEP 5: Run the development server:
  npm start

This opens a browser window at http://localhost:3000 where you can see your app live as you edit it.

The key concept is that React lets you build your interface as components -- reusable pieces of UI. Our generator has three main components: a form (for data entry), a preview (showing the generated card), and an export function (producing JSON output).`
    },
    {
      title: "Building the Generator: The Schema as Data",
      content: `The first thing to do is define your schema as a JavaScript data structure. Instead of hard-coding each form field, we define the schema as an object and generate the form from it. This is the same approach used in the DF-MC generator.

const SCHEMA = {
  submission: {
    title: "Submission Metadata",
    fields: [
      { id: "sub_id", label: "Submission ID",
        type: "text", required: true },
      { id: "sub_date", label: "Date Received",
        type: "date", required: true },
      // ... more fields
    ]
  },
  // ... more sections
};

Why define schema as data? Because:
- You can iterate over it to generate forms automatically
- You can use the same schema to validate output
- You can extend it without changing the rendering code
- You can export the schema itself as documentation

This is a pattern called "schema-driven development" and it is fundamental to how standards-based tools work.`
    },
    {
      title: "Building the Generator: Rendering Forms from Schema",
      content: `With the schema defined as data, rendering the form is a loop:

function GeneratorForm({ schema, formData, onChange }) {
  return (
    <div>
      {Object.entries(schema).map(([key, section]) => (
        <div key={key}>
          <h3>{section.title}</h3>
          {section.fields.map(field => (
            <div key={field.id}>
              <label>{field.label}</label>
              {renderField(field, formData, onChange)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

The renderField function checks the field type and returns the appropriate input element:

function renderField(field, data, onChange) {
  if (field.type === "select") {
    return (
      <select value={data[field.id] || ""}
        onChange={e => onChange(field.id, e.target.value)}>
        <option value="">-- Select --</option>
        {field.options.map(o =>
          <option key={o} value={o}>{o}</option>
        )}
      </select>
    );
  }
  // ... handle other types
  return <input type="text" value={data[field.id] || ""}
    onChange={e => onChange(field.id, e.target.value)} />;
}

This is the core pattern: schema defines structure, code renders it. When you add a new field to the schema, the form updates automatically.`
    },
    {
      title: "Building the Generator: State Management",
      content: `React uses "state" to track data that changes over time. For our generator, the state is the form data -- what the user has entered.

import { useState } from "react";

function App() {
  const [formData, setFormData] = useState({});

  const updateField = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // formData is an object like:
  // { sub_id: "SUB-2026-001",
  //   sub_date: "2026-04-01",
  //   venue_name: "FSI Digital Investigation",
  //   ... }

  return <GeneratorForm
    schema={SCHEMA}
    formData={formData}
    onChange={updateField} />;
}

Key concepts:
- useState({}) creates an empty object to store form values
- updateField creates a new object with the changed field
- React re-renders the form whenever state changes
- The form is always in sync with the data

For multi-select fields (like author regions), we use an array:

const updateMulti = (id, value) => {
  setFormData(prev => {
    const current = prev[id] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)  // remove
      : [...current, value];              // add
    return { ...prev, [id]: updated };
  });
};`
    },
    {
      title: "Building the Generator: Generating JSON Output",
      content: `When the user clicks "Generate," we assemble the form data into the JSON structure defined by the schema:

const generate = () => {
  const card = {
    schema_version: "1.0",
    generated_date: new Date().toISOString(),
    submission: {},
    demographics: {},
    ai_tools: aiToolsState,
    review_process: {},
    reviews: reviewsState,
    decision: {},
  };

  // Map form data to schema sections
  Object.entries(SCHEMA).forEach(([section, def]) => {
    def.fields.forEach(field => {
      if (card[section]) {
        card[section][field.id] = formData[field.id] || "";
      }
    });
  });

  setOutput(card);
};

To let the user copy the JSON:

<button onClick={() => {
  navigator.clipboard.writeText(
    JSON.stringify(output, null, 2)
  );
}}>
  Copy JSON
</button>

The JSON.stringify(output, null, 2) call converts the JavaScript object to a formatted JSON string with 2-space indentation -- the standard format for machine-readable model cards.`
    },
    {
      title: "Building the Generator: Deployment",
      content: `Once your generator works locally, deploy it so others can use it.

OPTION A: Vercel (recommended)
  1. Push your code to GitHub
  2. Go to vercel.com, sign in with GitHub
  3. Click "Import Project" and select your repo
  4. Vercel auto-detects React and deploys
  5. Your app is live at your-project.vercel.app

OPTION B: GitHub Pages
  1. Install gh-pages: npm install gh-pages
  2. Add to package.json:
     "homepage": "https://username.github.io/repo"
  3. Add scripts:
     "predeploy": "npm run build"
     "deploy": "gh-pages -d build"
  4. Run: npm run deploy

OPTION C: Hugging Face Spaces
  Use the Gradio framework (Python) instead of React.
  This is how the DF-MC generator is deployed.

For this project, we chose Vercel because it gives you automatic HTTPS, custom domains, and instant deploys on every git push. The app you are using right now is deployed this way.

NEXT STEPS:
- Add a Fairness Dashboard tab that aggregates model cards across submissions and shows acceptance rates by author region, career stage, and language background
- Connect to the DF-MC Registry to auto-populate AI tool fields
- Export to Markdown for human-readable documentation
- Integrate with OpenReview API for automated data capture`
    },
  ];

  return (
    <div>
      <SectionHeader title="Tutorial: Build a Review Process Model Card Generator" subtitle="A step-by-step guide for undergraduates and non-experts. No prior React experience required." />

      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        {steps.map((s, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            padding: "8px 16px", fontSize: 12, fontFamily: fontSans, borderRadius: 4, cursor: "pointer",
            background: step === i ? colors.accent : "transparent",
            color: step === i ? colors.bg : colors.textDim,
            border: `1px solid ${step === i ? colors.accent : colors.border}`,
            fontWeight: step === i ? 600 : 400,
          }}>Step {i + 1}</button>
        ))}
      </div>

      <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 8, padding: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <span style={{ background: colors.accent, color: colors.bg, width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{step + 1}</span>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{steps[step].title}</h3>
        </div>
        <div style={{ fontSize: 14, color: colors.textDim, lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: fontSans }}>
          {steps[step].content}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} style={{ padding: "8px 20px", fontSize: 13, background: "transparent", border: `1px solid ${colors.border}`, borderRadius: 4, color: colors.textDim, cursor: "pointer", fontFamily: fontSans }}>Previous</button>
          )}
          {step < steps.length - 1 && (
            <button onClick={() => setStep(step + 1)} style={{ padding: "8px 20px", fontSize: 13, background: colors.accent, border: "none", borderRadius: 4, color: colors.bg, cursor: "pointer", fontWeight: 600, fontFamily: fontSans }}>Next Step</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== SHARED COMPONENTS =====
function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px", letterSpacing: -0.3 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 14, color: colors.textDim, margin: 0, maxWidth: 700, lineHeight: 1.5 }}>{subtitle}</p>}
    </div>
  );
}
