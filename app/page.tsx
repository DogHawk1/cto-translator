"use client";

import { useState } from "react";

type Category =
  | "Infrastructure"
  | "Security"
  | "Performance"
  | "Developer Productivity"
  | "Platform/Architecture"
  | "Data/AI"
  | "Compliance";

type Effort = "Small" | "Medium" | "Large";
type Status = "Completed" | "In Progress" | "Planned";

interface TranslationOutput {
  boardRestatement: string;
  primaryFrame: string;
  suggestedMetrics: string[];
  boardSlide: string;
}

// ─── Translation engine ───────────────────────────────────────────────────────

const effortAdj: Record<Effort, string> = {
  Small: "targeted",
  Medium: "foundational",
  Large: "strategic",
};

type StatusMeta = { prefix: string; verb: string; outcomePrefix: string };
const statusMeta: Record<Status, StatusMeta> = {
  Completed: {
    prefix: "Our",
    verb: "addressed",
    outcomePrefix: "The result is",
  },
  "In Progress": {
    prefix: "Our ongoing",
    verb: "is addressing",
    outcomePrefix: "The expected outcome is",
  },
  Planned: {
    prefix: "A proposed",
    verb: "will address",
    outcomePrefix: "The anticipated outcome is",
  },
};

interface CategoryConfig {
  frame: string;
  businessProblem: string;
  techToBusinessBridge: (effort: Effort, sm: StatusMeta) => string;
  outcomeStatement: (sm: StatusMeta) => string;
  metrics: string[];
  boardSlide: string;
}

const categoryConfig: Record<Category, CategoryConfig> = {
  Infrastructure: {
    frame: "Revenue Protection",
    businessProblem:
      "Unplanned downtime carries direct revenue impact and erodes customer trust in ways that are difficult to recover.",
    techToBusinessBridge: (effort, sm) =>
      `We are making a ${effortAdj[effort]} investment to ${sm.verb === "addressed" ? "address" : sm.verb === "is addressing" ? "address" : "address"} the reliability constraints that expose the business to service interruptions and the revenue loss that follows them.`,
    outcomeStatement: (sm) =>
      `${sm.outcomePrefix} measurable improvement in system availability, reduced incident frequency, and a lower probability of revenue-affecting outages.`,
    metrics: [
      "System uptime / availability vs. current SLA baseline",
      "Mean time to recovery (MTTR) — before and after",
      "Estimated revenue-at-risk per hour of unplanned downtime",
      "Incident frequency and severity trend",
    ],
    boardSlide:
      "This initiative reduces the probability and blast radius of service outages, protecting an estimated $[X] in revenue-at-risk per hour of downtime — a direct improvement to our reliability SLA.",
  },

  Security: {
    frame: "Risk Reduction",
    businessProblem:
      "The current threat landscape carries material financial and reputational exposure that the board needs to understand in terms of liability, not technology.",
    techToBusinessBridge: (effort, sm) =>
      `We are making a ${effortAdj[effort]} investment to close a specific class of risk that, if left unaddressed, could result in regulatory penalties, liability claims, or loss of enterprise customer trust.`,
    outcomeStatement: (sm) =>
      `${sm.outcomePrefix} a measurable reduction in our risk exposure profile, protecting the balance sheet and our ability to win and retain enterprise deals.`,
    metrics: [
      "Risk severity rating before and after (e.g., CVE scoring, audit findings)",
      "Estimated cost of a breach or regulatory penalty — pre vs. post",
      "Number of enterprise security requirements now satisfied",
      "Time-to-remediation for critical vulnerabilities",
    ],
    boardSlide:
      "This initiative eliminates a material security exposure, reducing estimated liability by $[X] and satisfying the security requirements currently gating $[Y] in enterprise pipeline.",
  },

  Performance: {
    frame: "Growth Enablement",
    businessProblem:
      "Application performance is directly correlated with customer conversion rates and churn — underperformance has a measurable top-line cost.",
    techToBusinessBridge: (effort, sm) =>
      `We are making a ${effortAdj[effort]} investment to address the performance constraints that are degrading user experience and measurably impacting conversion and retention.`,
    outcomeStatement: (sm) =>
      `${sm.outcomePrefix} faster load times, improved conversion rates, and lower churn — compounding gains that flow directly to revenue.`,
    metrics: [
      "Page load time / API p95 latency — before and after",
      "Conversion rate change attributed to performance improvement",
      "Customer churn rate — cohort comparison",
      "Core Web Vitals scores (if customer-facing)",
    ],
    boardSlide:
      "This initiative targets a [X]ms reduction in load time — a performance improvement that industry benchmarks associate with a [Y]% uplift in conversion, translating to an estimated $[Z] in incremental revenue.",
  },

  "Developer Productivity": {
    frame: "Competitive Position",
    businessProblem:
      "Delivery speed is a direct competitive input. Every week of delay in shipping product is a week our competitors can use to close the gap or extend their lead.",
    techToBusinessBridge: (effort, sm) =>
      `We are making a ${effortAdj[effort]} investment to remove the friction in our engineering delivery process that slows our ability to ship customer value and respond to market changes.`,
    outcomeStatement: (sm) =>
      `${sm.outcomePrefix} a meaningful compression in our time-to-market, enabling the business to move faster than competitors who are still operating with more overhead.`,
    metrics: [
      "Deployment frequency — before and after",
      "Lead time for changes (idea to production)",
      "Change failure rate and mean time to restore",
      "Developer satisfaction / eNPS",
    ],
    boardSlide:
      "This initiative accelerates our delivery capability, targeting a [X]% reduction in cycle time — compressing our ability to respond to competitive threats from [Y weeks] to [Z weeks].",
  },

  "Platform/Architecture": {
    frame: "Revenue Ceiling Removal",
    businessProblem:
      "Our current architecture constrains the scale at which we can operate and serve customers — without addressing it, growth creates fragility rather than leverage.",
    techToBusinessBridge: (effort, sm) =>
      `We are making a ${effortAdj[effort]} investment to remove the structural constraints that would otherwise prevent us from serving larger customers, higher transaction volumes, or new market segments profitably.`,
    outcomeStatement: (sm) =>
      `${sm.outcomePrefix} the removal of the architectural ceiling that currently limits our growth, enabling the business to scale without proportional cost or risk increase.`,
    metrics: [
      "Transaction throughput capacity — before and after",
      "Cost-per-unit at scale (unit economics improvement)",
      "Largest customer or contract tier now serviceable",
      "Percentage of pipeline previously blocked by scale limitations",
    ],
    boardSlide:
      "This initiative removes the architectural ceiling that currently limits us to [X] scale, enabling the business to pursue [Y] customer tier and [Z] transaction volume without re-platforming.",
  },

  "Data/AI": {
    frame: "Margin & Efficiency Gains",
    businessProblem:
      "Better data and AI capabilities directly improve the quality and speed of decisions across the business — poor data means slower cycles, more waste, and missed revenue signals.",
    techToBusinessBridge: (effort, sm) =>
      `We are making a ${effortAdj[effort]} investment to close the data quality and analytical gaps that slow decision-making, reduce operational efficiency, and limit our ability to act on revenue opportunities faster than competitors.`,
    outcomeStatement: (sm) =>
      `${sm.outcomePrefix} faster, higher-quality decisions, measurable cost reduction from automated workflows, and a compounding advantage as more business processes become data-informed.`,
    metrics: [
      "Decision cycle time — before and after",
      "Process automation rate (manual steps eliminated)",
      "Cost savings from automated or data-optimized workflows",
      "Revenue attributed to data-driven recommendations or interventions",
    ],
    boardSlide:
      "This initiative improves decision quality and operational efficiency across [X] business processes, targeting $[Y] in cost reduction and a [Z]% improvement in [specific business metric].",
  },

  Compliance: {
    frame: "Risk & Deal Enablement",
    businessProblem:
      "Regulatory non-compliance carries direct financial exposure and is increasingly a prerequisite for enterprise sales — compliance gaps are both a liability and a revenue blocker.",
    techToBusinessBridge: (effort, sm) =>
      `We are making a ${effortAdj[effort]} investment to close the compliance gap that currently exposes the business to regulatory penalties and blocks our ability to close security-sensitive enterprise deals.`,
    outcomeStatement: (sm) =>
      `${sm.outcomePrefix} the elimination of a quantifiable regulatory liability and the conversion of a compliance requirement into a competitive differentiator.`,
    metrics: [
      "Regulatory fine exposure eliminated (estimated)",
      "Compliance certifications achieved (SOC 2, ISO 27001, GDPR, etc.)",
      "Enterprise deals in pipeline unblocked by certification",
      "Audit readiness timeline compression",
    ],
    boardSlide:
      "This initiative achieves [specific compliance standard], eliminating an estimated $[X] in regulatory exposure and satisfying the requirement currently blocking $[Y] in enterprise pipeline.",
  },
};

function translate(
  name: string,
  category: Category,
  effort: Effort,
  status: Status
): TranslationOutput {
  const config = categoryConfig[category];
  const sm = statusMeta[status];

  const boardRestatement = [
    config.businessProblem,
    config.techToBusinessBridge(effort, sm),
    config.outcomeStatement(sm),
  ].join(" ");

  return {
    boardRestatement,
    primaryFrame: config.frame,
    suggestedMetrics: config.metrics,
    boardSlide: config.boardSlide,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  "Infrastructure",
  "Security",
  "Performance",
  "Developer Productivity",
  "Platform/Architecture",
  "Data/AI",
  "Compliance",
];

const EFFORTS: Effort[] = ["Small", "Medium", "Large"];
const STATUSES: Status[] = ["Completed", "In Progress", "Planned"];

const FRAME_COLORS: Record<string, string> = {
  "Revenue Protection": "#10b981",
  "Risk Reduction": "#ef4444",
  "Growth Enablement": "#3b82f6",
  "Competitive Position": "#8b5cf6",
  "Revenue Ceiling Removal": "#f59e0b",
  "Margin & Efficiency Gains": "#06b6d4",
  "Risk & Deal Enablement": "#f97316",
};

export default function CTOTranslator() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [effort, setEffort] = useState<Effort | "">("");
  const [status, setStatus] = useState<Status | "">("");
  const [output, setOutput] = useState<TranslationOutput | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canTranslate = name.trim() && category && effort && status;

  async function handleTranslate() {
    if (!canTranslate) return;
    setLoading(true);
    setError(null);

    const deterministic = translate(name.trim(), category as Category, effort as Effort, status as Status);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), category, effort, status }),
      });
      const data = await res.json();
      if (!res.ok || !data.boardRestatement) throw new Error(data.error ?? "Unknown error");
      setOutput({ ...deterministic, boardRestatement: data.boardRestatement });
    } catch (err) {
      // Fall back to deterministic restatement if AI call fails
      setOutput(deterministic);
      setError("AI restatement unavailable — showing template version.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!output) return;
    const text = [
      `INITIATIVE: ${name}`,
      `CATEGORY: ${category} | EFFORT: ${effort} | STATUS: ${status}`,
      "",
      "BOARD RESTATEMENT",
      output.boardRestatement,
      "",
      `PRIMARY OUTCOME FRAME: ${output.primaryFrame}`,
      "",
      "SUGGESTED METRICS",
      ...output.suggestedMetrics.map((m) => `• ${m}`),
      "",
      "SUGGESTED BOARD SLIDE SENTENCE",
      output.boardSlide,
    ].join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handlePrint() {
    window.print();
  }

  const frameColor = output ? (FRAME_COLORS[output.primaryFrame] ?? "#b56422") : "#b56422";

  return (
    <div className="min-h-screen bg-navy print:bg-white">
      {/* Header */}
      <header className="border-b border-white/10 print:border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-white print:text-navy font-marcellus text-xl">
              CTO → Board Translator
            </h1>
            <p className="text-white/40 print:text-gray-500 text-xs mt-0.5">
              Translate technical initiatives into board-ready business language
            </p>
          </div>
          <a
            href="https://stevenhdoherty.com/appointment/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors print:hidden"
            style={{ background: "#b56422", color: "#fff" }}
          >
            Book a Call
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-2 gap-8 items-start">

          {/* ── Left panel: Inputs ── */}
          <div className="bg-white/5 print:bg-white border border-white/10 print:border-gray-200 rounded-2xl p-8 space-y-6 print:hidden">
            <div>
              <h2 className="text-white font-semibold text-base mb-1">Initiative Details</h2>
              <p className="text-white/40 text-sm">Describe the initiative as you would to your engineering team. The translator handles the rest.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-white/70 text-sm font-medium">
                Initiative Name / Description <span style={{ color: "#b56422" }}>*</span>
              </label>
              <textarea
                id="initiative-input"
                rows={3}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Migrate core services to Kubernetes to improve deployment reliability and reduce infrastructure costs"
                className="w-full rounded-lg px-4 py-3 text-sm border border-white/10 focus:outline-none resize-none placeholder-navy/40"
                style={{ background: "#FDF8F0", color: "#0f1644" }}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-white/70 text-sm font-medium">Category <span style={{ color: "#b56422" }}>*</span></label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category | "")}
                className="w-full rounded-lg px-4 py-3 text-sm border border-white/10 focus:outline-none appearance-none text-navy"
                style={{ background: "#FDF8F0" }}
              >
                <option value="">Select a category…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {category && (
                <p className="text-white/30 text-xs mt-1">
                  Frame: <span className="text-white/50">{categoryConfig[category as Category].frame}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-white/70 text-sm font-medium">Effort Level <span style={{ color: "#b56422" }}>*</span></label>
                <div className="flex gap-2">
                  {EFFORTS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setEffort(e)}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors"
                      style={
                        effort === e
                          ? { background: "#b56422", borderColor: "#b56422", color: "#fff" }
                          : { background: "rgba(235,216,174,0.08)", borderColor: "rgba(235,216,174,0.3)", color: "#ebd8ae" }
                      }
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-white/70 text-sm font-medium">Status <span style={{ color: "#b56422" }}>*</span></label>
                <div className="flex gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors"
                      style={
                        status === s
                          ? { background: "#b56422", borderColor: "#b56422", color: "#fff" }
                          : { background: "rgba(235,216,174,0.08)", borderColor: "rgba(235,216,174,0.3)", color: "#ebd8ae" }
                      }
                    >
                      {s === "In Progress" ? "In Prog." : s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleTranslate}
              disabled={!canTranslate || loading}
              className="w-full py-4 rounded-xl text-base font-bold transition-all"
              style={
                canTranslate && !loading
                  ? { background: "#b56422", color: "#fff", cursor: "pointer" }
                  : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.25)", cursor: "not-allowed" }
              }
            >
              {loading ? "Translating…" : "Translate →"}
            </button>

            {error && (
              <p className="text-amber-400 text-xs text-center">{error}</p>
            )}

            <div className="border-t border-white/8 pt-6">
              <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-3">Category → Business Frame</p>
              <div className="space-y-2">
                {CATEGORIES.map((c) => (
                  <div key={c} className="flex items-center justify-between text-xs">
                    <span className="text-white/40">{c}</span>
                    <span className="text-white/25">→</span>
                    <span className="text-white/50 text-right">{categoryConfig[c].frame}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right panel: Output ── */}
          <div className="space-y-4">
            {!output ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center mb-4">
                  <span className="text-white/20 text-2xl">→</span>
                </div>
                <p className="text-white/30 text-sm">Fill in the initiative details and click <strong className="text-white/50">Translate</strong> to generate your board-ready output.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-white print:text-navy font-semibold text-base">{name}</h2>
                    <p className="text-white/40 print:text-gray-500 text-xs mt-0.5">{category} · {effort} · {status}</p>
                  </div>
                  <div className="flex gap-2 print:hidden">
                    <button
                      onClick={handleCopy}
                      className="px-3 py-2 rounded-lg text-xs font-semibold border border-white/15 text-white/60 hover:text-white hover:border-white/30 transition-colors"
                    >
                      {copied ? "✓ Copied" : "Copy"}
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-3 py-2 rounded-lg text-xs font-semibold border border-white/15 text-white/60 hover:text-white hover:border-white/30 transition-colors"
                    >
                      Export PDF
                    </button>
                  </div>
                </div>

                <div
                  className="rounded-xl p-4 border"
                  style={{ background: `${frameColor}14`, borderColor: `${frameColor}30` }}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: frameColor }}>
                    Primary Outcome Frame
                  </p>
                  <p className="font-bold text-lg" style={{ color: frameColor }}>
                    {output.primaryFrame}
                  </p>
                </div>

                <div className="bg-white/5 print:bg-gray-50 border border-white/10 print:border-gray-200 rounded-xl p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/40 print:text-gray-500 mb-3">
                    Board-Language Restatement
                  </p>
                  <p className="text-white/90 print:text-gray-800 text-sm leading-relaxed">
                    {output.boardRestatement}
                  </p>
                </div>

                <div className="bg-white/5 print:bg-gray-50 border border-white/10 print:border-gray-200 rounded-xl p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/40 print:text-gray-500 mb-3">
                    Suggested Metrics to Attach
                  </p>
                  <p className="text-white/30 print:text-gray-400 text-xs mb-4">
                    The tool provides the frame — you fill in the figures that make sense for your business.
                  </p>
                  <ul className="space-y-3">
                    {output.suggestedMetrics.map((m, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="shrink-0 mt-0.5 font-bold" style={{ color: "#b56422" }}>→</span>
                        <span className="text-white/80 print:text-gray-700 leading-relaxed">{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl p-6 border" style={{ background: "rgba(9,97,145,0.15)", borderColor: "rgba(9,97,145,0.3)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#096191" }}>
                    Suggested Board Slide Sentence
                  </p>
                  <p className="text-white/90 print:text-gray-800 text-sm leading-relaxed italic">
                    &ldquo;{output.boardSlide}&rdquo;
                  </p>
                  <p className="text-white/25 print:text-gray-400 text-xs mt-3">
                    Replace [bracketed] values with your own figures.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 print:border-gray-200 py-8 text-center text-white/20 print:text-gray-400 text-xs mt-8">
        © {new Date().getFullYear()} Steve Doherty ·{" "}
        <a href="https://stevenhdoherty.com" className="hover:text-white/50 transition-colors">
          stevenhdoherty.com
        </a>
      </footer>

      <style>{`
        @media print {
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}
