"use client";

import type { PhraseSuggestion } from "@/lib/validators";

type Props = {
  suggestion: PhraseSuggestion;
  onSave: (suggestion: PhraseSuggestion) => void;
  saving?: boolean;
  saved?: boolean;
};

export default function PhraseSuggestionCard({ suggestion, onSave, saving, saved }: Props) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <p className="text-2xl mb-1">{suggestion.chineseText}</p>
      <p className="text-gray-500 italic mb-1">{suggestion.pinyin}</p>
      <p className="text-gray-700 mb-2">{suggestion.englishTranslation}</p>
      {suggestion.usageNote && (
        <p className="text-sm text-gray-400 mb-3">{suggestion.usageNote}</p>
      )}
      <button
        onClick={() => onSave(suggestion)}
        disabled={saving || saved}
        className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saved ? "Saved" : saving ? "Saving..." : "Save Phrase"}
      </button>
    </div>
  );
}
