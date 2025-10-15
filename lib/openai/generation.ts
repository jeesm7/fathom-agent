import { openai, MODELS } from "./client";
import { prisma } from "@/lib/prisma";

export interface GenerationOptions {
  promptKey: string;
  variables: Record<string, any>;
  model?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
}

export async function generateContent(
  options: GenerationOptions
): Promise<string> {
  // Fetch prompt template from database
  const promptTemplate = await prisma.prompt.findUnique({
    where: { key: options.promptKey },
  });

  if (!promptTemplate) {
    throw new Error(`Prompt template not found: ${options.promptKey}`);
  }

  // Replace variables in user template
  let userPrompt = promptTemplate.userTemplate;
  for (const [key, value] of Object.entries(options.variables)) {
    userPrompt = userPrompt.replace(
      new RegExp(`\\{\\{${key}\\}\\}`, "g"),
      String(value)
    );
  }

  const response = await openai.chat.completions.create({
    model: options.model || MODELS.standard,
    messages: [
      {
        role: "system",
        content: promptTemplate.system,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    temperature: options.temperature ?? promptTemplate.temperature,
    top_p: options.topP ?? promptTemplate.topP,
    max_tokens: options.maxTokens ?? promptTemplate.maxTokens,
  });

  return response.choices[0].message.content || "";
}

