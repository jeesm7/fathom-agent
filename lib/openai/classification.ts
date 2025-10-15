import { openai, MODELS } from "./client";

export type DeliverableType =
  | "PROPOSAL"
  | "LEGAL_RESEARCH"
  | "SERVICE_AGREEMENT"
  | "SCOPE_OF_WORK"
  | "FOLLOWUP_EMAIL";

export interface ClassificationResult {
  deliverables: DeliverableType[];
  confidence: Record<DeliverableType, number>;
  reasoning: string;
}

const LEGAL_KEYWORDS = [
  "legal",
  "law",
  "statute",
  "regulation",
  "compliance",
  "consent",
  "autodialer",
  "robocall",
  "TCPA",
  "do not call",
  "opt in",
  "disclosure",
  "loophole",
  "grey area",
];

export async function classifyDeliverables(
  transcript: string,
  minConfidence = 0.55
): Promise<ClassificationResult> {
  const prompt = `Analyze this meeting transcript and determine what deliverables should be generated.

Available deliverable types:
- PROPOSAL: Client needs a business proposal with pricing, scope, milestones
- LEGAL_RESEARCH: Legal questions were raised requiring research and analysis
- SERVICE_AGREEMENT: Need to draft a service agreement or contract
- SCOPE_OF_WORK: Need a detailed scope of work document
- FOLLOWUP_EMAIL: Need to send a follow-up email (almost always true)

Transcript:
${transcript}

Respond in JSON format with:
{
  "deliverables": ["TYPE1", "TYPE2", ...],
  "confidence": {"TYPE1": 0.9, "TYPE2": 0.7, ...},
  "reasoning": "Brief explanation of why these deliverables are needed"
}`;

  const response = await openai.chat.completions.create({
    model: MODELS.standard,
    messages: [
      {
        role: "system",
        content:
          "You are an expert at analyzing business meeting transcripts and identifying required deliverables. Respond only with valid JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const result = JSON.parse(
    response.choices[0].message.content || "{}"
  ) as ClassificationResult;

  // Apply heuristics for legal research
  const hasLegalKeywords = LEGAL_KEYWORDS.some((keyword) =>
    transcript.toLowerCase().includes(keyword.toLowerCase())
  );

  if (hasLegalKeywords && !result.deliverables.includes("LEGAL_RESEARCH")) {
    result.deliverables.push("LEGAL_RESEARCH");
    result.confidence["LEGAL_RESEARCH"] = 0.7;
  }

  // Filter by minimum confidence
  const filteredDeliverables = result.deliverables.filter(
    (d) => (result.confidence[d] || 0) >= minConfidence
  );

  return {
    ...result,
    deliverables: filteredDeliverables,
  };
}

