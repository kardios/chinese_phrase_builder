import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updatePhraseSchema } from "@/lib/validators";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const phrase = await prisma.savedPhrase.findUnique({
    where: { id },
    include: { vocabularyEntry: true },
  });

  if (!phrase) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(phrase);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = updatePhraseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.familiarityRating !== undefined) {
    data.lastReviewedAt = new Date();
  }

  try {
    const phrase = await prisma.savedPhrase.update({
      where: { id },
      data,
      include: { vocabularyEntry: { select: { englishWord: true, topicTag: true } } },
    });
    return NextResponse.json(phrase);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.savedPhrase.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
