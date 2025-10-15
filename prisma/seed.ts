import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultPrompts = [
  {
    key: "proposal",
    description: "Business proposal with pricing and scope",
    system:
      "You are an expert business proposal writer. Create professional, compelling proposals that clearly communicate value, scope, and pricing.",
    userTemplate: `Based on this meeting transcript, create a comprehensive business proposal.

Transcript:
{{transcript}}

Example proposals for style reference:
{{examples}}

Include:
- Executive Summary
- Problem Statement
- Proposed Solution
- Scope of Work
- Timeline & Milestones
- Pricing
- Terms & Conditions
- Next Steps

Make it professional, clear, and persuasive.`,
    temperature: 0.7,
    topP: 1.0,
    maxTokens: 4000,
  },
  {
    key: "legal_research",
    description: "Legal research with citations and analysis",
    system:
      "You are a legal research assistant. Provide thorough, well-cited legal analysis. Always include disclaimers that this is not legal advice.",
    userTemplate: `Conduct legal research based on the questions and topics raised in this meeting.

Transcript:
{{transcript}}

Research findings:
{{research}}

Citations:
{{citations}}

Provide:
- Key Legal Questions Identified
- Applicable Laws & Regulations
- Relevant Case Law
- Risk Analysis
- Compliance Recommendations
- Citations & Sources

Be thorough and cite all sources.`,
    temperature: 0.4,
    topP: 0.9,
    maxTokens: 6000,
  },
  {
    key: "service_agreement",
    description: "Service agreement contract",
    system:
      "You are a contracts specialist. Draft clear, comprehensive service agreements that protect both parties and clearly define terms.",
    userTemplate: `Draft a service agreement based on the terms discussed in this meeting.

Transcript:
{{transcript}}

Example agreements for reference:
{{examples}}

Include:
- Parties
- Services Description
- Payment Terms
- Deliverables & Timeline
- Intellectual Property
- Confidentiality
- Termination Clauses
- Governing Law
- Signatures Block

Use clear, professional legal language with placeholders for specific details.`,
    temperature: 0.5,
    topP: 0.95,
    maxTokens: 5000,
  },
  {
    key: "scope_of_work",
    description: "Detailed scope of work document",
    system:
      "You are a project management expert. Create detailed, actionable scope of work documents that prevent scope creep and set clear expectations.",
    userTemplate: `Create a detailed Scope of Work based on this meeting discussion.

Transcript:
{{transcript}}

Example SOWs for reference:
{{examples}}

Include:
- Project Objectives
- Deliverables (specific and measurable)
- Timeline with phases
- Acceptance Criteria
- Out of Scope Items
- Dependencies & Assumptions
- Change Order Process
- Success Metrics

Be specific and actionable.`,
    temperature: 0.6,
    topP: 1.0,
    maxTokens: 4000,
  },
  {
    key: "followup_email",
    description: "Follow-up email draft",
    system:
      "You are a professional business communications expert. Write clear, friendly, and actionable follow-up emails that move deals forward.",
    userTemplate: `Draft a follow-up email based on this meeting.

Transcript:
{{transcript}}

Generated documents (include links):
{{outputs}}

The email should:
- Thank them for their time
- Summarize key discussion points
- Present next steps
- Include links to any generated documents
- Have a clear call-to-action

Tone: Professional but warm. Keep it concise.`,
    temperature: 0.7,
    topP: 1.0,
    maxTokens: 1500,
  },
];

async function main() {
  console.log("Seeding default prompts...");

  for (const prompt of defaultPrompts) {
    await prisma.prompt.upsert({
      where: { key: prompt.key },
      update: prompt,
      create: prompt,
    });
    console.log(`✓ Seeded prompt: ${prompt.key}`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

