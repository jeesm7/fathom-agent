import OpenAI from "openai";

// Initialize OpenAI client lazily to avoid crashes when API key is missing
let _openai: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI API key not configured. Please add it in Settings.");
    }
    _openai = new OpenAI({ apiKey });
  }
  return _openai;
}

// For backwards compatibility, create a proxy that lazily initializes
export const openai = new Proxy({} as OpenAI, {
  get(target, prop) {
    return getOpenAIClient()[prop as keyof OpenAI];
  },
});

export const MODELS = {
  standard: process.env.OPENAI_STANDARD_MODEL || "gpt-4o-mini",
  deepResearch: process.env.OPENAI_DEEP_RESEARCH_MODEL || "o4-mini-deep-research",
};

export const VECTOR_STORE_ID = process.env.OPENAI_VECTOR_STORE_ID || "";

