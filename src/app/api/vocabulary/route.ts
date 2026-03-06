import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createVocabularySchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const topicTag = searchParams.get("topicTag") || undefined;
  const difficultyLevel = searchParams.get("difficultyLevel") || undefined;

  const entries = await prisma.vocabularyEntry.findMany({
    where: {
      ...(search && { englishWord: { contains: search } }),
      ...(topicTag && { topicTag }),
      ...(difficultyLevel && { difficultyLevel }),
    },
    include: { savedPhrases: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = createVocabularySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  // Find existing entry with the same word, or create a new one
  const existing = await prisma.vocabularyEntry.findFirst({
    where: { englishWord: parsed.data.englishWord },
  });

  if (existing) {
    return NextResponse.json(existing);
  }

  const entry = await prisma.vocabularyEntry.create({ data: parsed.data });
  return NextResponse.json(entry, { status: 201 });
}
