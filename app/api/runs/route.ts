import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  // TODO: Add authentication when NextAuth is configured

  const runs = await prisma.run.findMany({
    include: {
      outputs: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  return NextResponse.json(runs);
}

