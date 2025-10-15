import { ResearchResult } from "./research";

export async function searchWithTavily(query: string): Promise<ResearchResult> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    console.warn("Tavily API key not configured, returning empty results");
    return {
      synthesis: "Web search unavailable. Please configure TAVILY_API_KEY.",
      citations: [],
      sources: [],
    };
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "advanced",
        include_answer: true,
        max_results: 10,
      }),
    });

    const data = await response.json();

    const citations = (data.results || []).map((result: any) => ({
      title: result.title || "",
      url: result.url || "",
      snippet: result.content || "",
    }));

    const sources = citations.map((c) => c.url);

    return {
      synthesis: data.answer || "No answer provided",
      citations,
      sources,
    };
  } catch (error) {
    console.error("Tavily search failed:", error);
    return {
      synthesis: "Search failed. Please try again.",
      citations: [],
      sources: [],
    };
  }
}

