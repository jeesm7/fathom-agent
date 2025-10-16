import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // TODO: Add authentication when NextAuth is configured

  const body = await request.json();

  const prompt = await prisma.prompt.update({
    where: { id },
    data: {
      description: body.description,
      system: body.system,
      userTemplate: body.userTemplate,
      temperature: body.temperature,
      topP: body.topP,
      maxTokens: body.maxTokens,
    },
  });

  return NextResponse.json(prompt);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // TODO: Add authentication when NextAuth is configured

  await prisma.prompt.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

