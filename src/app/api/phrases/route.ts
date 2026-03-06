import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createPhraseSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const topicTag = searchParams.get("topicTag") || undefined;
  const isFavorite = searchParams.get("isFavorite");
  const familiarityMin = searchParams.get("familiarityMin");
  const familiarityMax = searchParams.get("familiarityMax");
  const sort = searchParams.get("sort") || "recent";

  const phrases = await prisma.savedPhrase.findMany({
    where: {
      ...(search && {
        OR: [
          { englishTranslation: { contains: search } },
          { chineseText: { contains: search } },
          { pinyin: { contains: search } },
          { vocabularyEntry: { englishWord: { contains: search } } },
        ],
      }),
      ...(topicTag && { vocabularyEntry: { topicTag } }),
      ...(isFavorite !== null && { isFavorite: isFavorite === "true" }),
      ...(familiarityMin && { familiarityRating: { gte: parseInt(familiarityMin) } }),
      ...(familiarityMax && { familiarityRating: { lte: parseInt(familiarityMax) } }),
    },
    include: { vocabularyEntry: { select: { englishWord: true, topicTag: true } } },
    orderBy: sort === "alphabetical"
      ? { vocabularyEntry: { englishWord: "asc" } }
      : { createdAt: "desc" },
  });

  return NextResponse.json(phrases);
}

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = createPhraseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  // Check for duplicate
  const existing = await prisma.savedPhrase.findFirst({
    where: {
      vocabularyEntryId: parsed.data.vocabularyEntryId,
      chineseText: parsed.data.chineseText,
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "This phrase is already saved for this vocabulary entry." },
      { status: 409 }
    );
  }

  const phrase = await prisma.savedPhrase.create({
    data: parsed.data,
    include: { vocabularyEntry: { select: { englishWord: true, topicTag: true } } },
  });

  return NextResponse.json(phrase, { status: 201 });
}
