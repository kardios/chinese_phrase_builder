import { z } from "zod/v4";

export const createVocabularySchema = z.object({
  englishWord: z.string().min(1, "English word is required").max(100).transform(s => s.trim()),
  partOfSpeech: z.string().optional(),
  topicTag: z.string().optional(),
  difficultyLevel: z.enum(["beginner", "intermediate"]).optional(),
  notes: z.string().optional(),
});

export const updateVocabularySchema = createVocabularySchema.partial();

export const generatePhrasesSchema = z.object({
  englishWord: z.string().min(1).max(100),
  difficultyLevel: z.string().optional(),
  topicTag: z.string().optional(),
  tone: z.enum(["casual", "neutral", "polite"]).optional(),
});

export const createPhraseSchema = z.object({
  vocabularyEntryId: z.string().min(1),
  chineseText: z.string().min(1, "Chinese text is required"),
  pinyin: z.string().min(1, "Pinyin is required"),
  englishTranslation: z.string().min(1, "English translation is required"),
  usageNote: z.string().optional(),
  familiarityRating: z.number().int().min(0).max(5).optional(),
  isFavorite: z.boolean().optional(),
});

export const updatePhraseSchema = z.object({
  chineseText: z.string().min(1).optional(),
  pinyin: z.string().min(1).optional(),
  englishTranslation: z.string().min(1).optional(),
  usageNote: z.string().optional(),
  familiarityRating: z.number().int().min(0).max(5).optional(),
  isFavorite: z.boolean().optional(),
});

export const phraseSuggestionSchema = z.object({
  chineseText: z.string(),
  pinyin: z.string(),
  englishTranslation: z.string(),
  usageNote: z.string().optional(),
});

export const generateResponseSchema = z.object({
  suggestions: z.array(phraseSuggestionSchema).min(1).max(3),
});

export type CreateVocabularyInput = z.infer<typeof createVocabularySchema>;
export type GeneratePhrasesInput = z.infer<typeof generatePhrasesSchema>;
export type CreatePhraseInput = z.infer<typeof createPhraseSchema>;
export type UpdatePhraseInput = z.infer<typeof updatePhraseSchema>;
export type PhraseSuggestion = z.infer<typeof phraseSuggestionSchema>;

export type PhraseType = {
  id: string;
  chineseText: string;
  pinyin: string;
  englishTranslation: string;
  usageNote?: string | null;
  familiarityRating: number;
  isFavorite: boolean;
  vocabularyEntry?: { englishWord: string; topicTag?: string | null };
};

export type VocabEntry = {
  id: string;
  englishWord: string;
  partOfSpeech?: string | null;
  topicTag?: string | null;
  difficultyLevel?: string | null;
  notes?: string | null;
  savedPhrases: PhraseType[];
};
