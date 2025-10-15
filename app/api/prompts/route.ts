import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  // TODO: Add authentication when NextAuth is configured

  const prompts = await prisma.prompt.findMany({
    orderBy: { key: "asc" },
  });

  return NextResponse.json(prompts);
}

export async function POST(request: NextRequest) {
  // TODO: Add authentication when NextAuth is configured

  const body = await request.json();

  const prompt = await prisma.prompt.create({
    data: {
      key: body.key,
      description: body.description,
      system: body.system,
      userTemplate: body.userTemplate,
      temperature: body.temperature ?? 0.7,
      topP: body.topP ?? 1.0,
      maxTokens: body.maxTokens ?? 4000,
    },
  });

  return NextResponse.json(prompt);
}

