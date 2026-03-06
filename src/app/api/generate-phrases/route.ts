import { NextRequest, NextResponse } from "next/server";
import { generatePhrasesSchema } from "@/lib/validators";
import { generateChinesePhrases } from "@/lib/phraseGenerator";

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = generatePhrasesSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  try {
    const suggestions = await generateChinesePhrases(parsed.data);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate phrases. Please try again." },
      { status: 500 }
    );
  }
}
