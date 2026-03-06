import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod/v4";
import { phraseSuggestionSchema } from "./validators";
import type { PhraseSuggestion } from "./validators";

const generateObjectSchema = z.object({
  suggestions: z.array(phraseSuggestionSchema),
});

export async function generateChinesePhrases(input: {
  englishWord: string;
  difficultyLevel?: string;
  topicTag?: string;
  tone?: string;
}): Promise<PhraseSuggestion[]> {
  const { englishWord, difficultyLevel = "beginner", topicTag, tone = "neutral" } = input;

  const prompt = `Generate 1 to 3 beginner-friendly Chinese phrases using the English word or concept: "${englishWord}".

Requirements:
- Use Simplified Chinese characters
- Include accurate pinyin (with tone marks or tone numbers)
- Include a natural English translation
- Optionally include a brief usage note
- Difficulty level: ${difficultyLevel}
- Tone/register: ${tone}
${topicTag ? `- Topic context: ${topicTag}` : ""}
- If the word has multiple meanings, show different senses
- Keep phrases short and natural for learners
- Avoid literary or obscure wording`;

  const result = await generateObject({
    model: anthropic("claude-haiku-4-5-20251001"),
    prompt,
    schema: generateObjectSchema,
  });

  return result.object.suggestions;
}
