import { openai, MODELS, VECTOR_STORE_ID } from "./client";
import { searchWithTavily } from "./tavily";

export interface ResearchResult {
  synthesis: string;
  citations: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  sources: string[];
}

export async function performWebResearch(
  query: string,
  useDeepResearch = false
): Promise<ResearchResult> {
  const deepResearchEnabled = process.env.OPENAI_DEEP_RESEARCH_ENABLED === "true";

  if (useDeepResearch && deepResearchEnabled) {
    return await deepResearchWithOpenAI(query);
  }

  // Try OpenAI web_search tool first
  try {
    return await searchWithOpenAI(query);
  } catch (error) {
    console.warn("OpenAI web search failed, falling back to Tavily:", error);
    // Fallback to Tavily
    return await searchWithTavily(query);
  }
}

async function searchWithOpenAI(query: string): Promise<ResearchResult> {
  // OpenAI web_search tool requires special API access
  // For now, fallback to Tavily which is more reliable
  return await searchWithTavily(query);
}

async function deepResearchWithOpenAI(query: string): Promise<ResearchResult> {
  const response = await openai.chat.completions.create({
    model: MODELS.deepResearch,
    messages: [
      {
        role: "system",
        content:
          "You are a legal and business research expert. Provide thorough research with citations and source links.",
      },
      {
        role: "user",
        content: query,
      },
    ],
    temperature: 0.3,
  });

  const synthesis = response.choices[0].message.content || "";

  // Extract citations from the response (model-specific format)
  const citations: ResearchResult["citations"] = [];
  const sources: string[] = [];

  // Parse citations from markdown links or structured format
  const urlRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
  let match;
  while ((match = urlRegex.exec(synthesis)) !== null) {
    citations.push({
      title: match[1],
      url: match[2],
      snippet: "",
    });
    sources.push(match[2]);
  }

  return { synthesis, citations, sources };
}

export async function searchVectorStore(
  query: string,
  kind?: string
): Promise<string[]> {
  if (!VECTOR_STORE_ID) {
    console.warn("No vector store ID configured");
    return [];
  }

  try {
    const response = await openai.chat.completions.create({
      model: MODELS.standard,
      messages: [
        {
          role: "user",
          content: `Find relevant examples for: ${query}`,
        },
      ],
      tools: [
        {
          type: "file_search",
          file_search: {
            vector_store_ids: [VECTOR_STORE_ID],
            ...(kind && {
              metadata_filter: {
                kind,
              },
            }),
          },
        } as any,
      ],
      temperature: 0.3,
    });

    const message = response.choices[0].message;
    const results: string[] = [];

    if (message.tool_calls) {
      for (const toolCall of message.tool_calls) {
        if (toolCall.type === "file_search") {
          const args = JSON.parse(toolCall.function?.arguments || "{}");
          if (args.results) {
            results.push(...args.results.map((r: any) => r.content || ""));
          }
        }
      }
    }

    return results;
  } catch (error) {
    console.error("Vector store search failed:", error);
    return [];
  }
}

