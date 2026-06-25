import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const EFFORT_CONTEXT: Record<string, string> = {
  Small: "a targeted, scoped investment with a focused outcome",
  Medium: "a foundational, mid-scale investment with meaningful organizational impact",
  Large: "a strategic, organization-wide investment with long-term business consequences",
};

const STATUS_CONTEXT: Record<string, string> = {
  Completed: "This work has been completed. Write in past tense — describe what was achieved and the business outcome now realized.",
  "In Progress": "This work is currently underway. Write in present tense — describe the business problem being actively addressed and the outcome being pursued.",
  Planned: "This is a planned investment. Write in future tense — describe the business case for why this investment should be made.",
};

const FRAME_CONTEXT: Record<string, string> = {
  Infrastructure: "Revenue Protection — frame this around protecting the business from the financial and reputational cost of service failures and downtime.",
  Security: "Risk Reduction — frame this around reducing material financial, legal, or reputational exposure, and protecting the business's ability to win and retain enterprise customers.",
  Performance: "Growth Enablement — frame this around the direct relationship between application speed and customer conversion, retention, and revenue.",
  "Developer Productivity": "Competitive Position — frame this around delivery speed as a strategic input: the faster the team ships, the faster the business can respond to market opportunities and competitive threats.",
  "Platform/Architecture": "Revenue Ceiling Removal — frame this around removing the structural constraints that limit how large the business can grow or how profitably it can scale.",
  "Data/AI": "Margin & Efficiency Gains — frame this around better decisions, faster cycles, and cost reduction through automation and data-informed action.",
  Compliance: "Risk & Deal Enablement — frame this around eliminating regulatory exposure and converting compliance into a competitive advantage that unblocks enterprise sales.",
};

export async function POST(req: NextRequest) {
  try {
    const { name, category, effort, status } = await req.json();

    if (!name || !category || !effort || !status) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured." }, { status: 500 });
    }

    const client = new Anthropic({ apiKey });

    const prompt = `You are helping a CTO communicate a technical initiative to a non-technical board of directors.

Initiative description (as the CTO would explain it to engineers): "${name}"
Category: ${category}
Effort scale: ${effort} — ${EFFORT_CONTEXT[effort] ?? ""}
Status: ${status} — ${STATUS_CONTEXT[status] ?? ""}
Business frame to use: ${FRAME_CONTEXT[category] ?? ""}

Write a 2-3 sentence board-language restatement of this initiative.

Critical rules:
- The initiative description above may be rough, informal, or written in the first person — interpret the underlying intent and rewrite it professionally
- Do NOT quote, paraphrase, or repeat any of the initiative description's phrasing
- Do NOT use technical jargon (no specific tools, languages, frameworks, or infrastructure terms)
- Translate the WHAT into the business WHY — what problem does this solve, and what is the cost of inaction?
- Apply the business frame above as your primary lens
- Match tense to the status (past/present/future as instructed above)
- Write in the confident, precise voice of a CTO presenting to a board — no hedging, no filler
- 2-3 sentences only. Output the sentences directly with no labels, preamble, or bullet points.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text.trim() : "";

    return NextResponse.json({ boardRestatement: text });
  } catch (err) {
    console.error("Translate API error:", err);
    return NextResponse.json({ error: "Failed to generate restatement." }, { status: 500 });
  }
}
