import { NextResponse } from "next/server";

export async function GET() {
  // Return environment variables that are configured
  // This allows the UI to show which values are already set via .env
  return NextResponse.json({
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasGoogle: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    hasTavily: !!process.env.TAVILY_API_KEY,
    hasFathom: !!process.env.FATHOM_WEBHOOK_SECRET,
    // Don't send actual values for security - just indicate they're configured
  });
}

