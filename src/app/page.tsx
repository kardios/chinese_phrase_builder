"use client";

import { useState, useEffect } from "react";
import PhraseSuggestionCard from "@/components/PhraseSuggestionCard";
import type { PhraseSuggestion } from "@/lib/validators";

type SavedPhrase = {
  id: string;
  chineseText: string;
  pinyin: string;
  englishTranslation: string;
  vocabularyEntry?: { englishWord: string };
};

export default function Home() {
  const [englishWord, setEnglishWord] = useState("");
  const [topicTag, setTopicTag] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("beginner");
  const [tone, setTone] = useState("neutral");
  const [suggestions, setSuggestions] = useState<PhraseSuggestion[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [vocabId, setVocabId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [savingIdx, setSavingIdx] = useState<number | null>(null);
  const [recentPhrases, setRecentPhrases] = useState<SavedPhrase[]>([]);

  useEffect(() => {
    fetch("/api/phrases?sort=recent")
      .then((r) => r.json())
      .then((data) => setRecentPhrases(Array.isArray(data) ? data.slice(0, 5) : []))
      .catch(() => {});
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!englishWord.trim()) return;

    setGenerating(true);
    setError("");
    setSuggestions([]);
    setSavedIds(new Set());
    setVocabId(null);

    try {
      // Create vocab entry first
      const vocabRes = await fetch("/api/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          englishWord: englishWord.trim(),
          topicTag: topicTag || undefined,
          difficultyLevel: difficultyLevel || undefined,
        }),
      });
      const vocab = await vocabRes.json();
      if (!vocabRes.ok) throw new Error("Failed to create vocabulary entry");
      setVocabId(vocab.id);

      // Generate phrases
      const genRes = await fetch("/api/generate-phrases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          englishWord: englishWord.trim(),
          difficultyLevel,
          topicTag: topicTag || undefined,
          tone,
        }),
      });
      const genData = await genRes.json();
      if (!genRes.ok) throw new Error(genData.error || "Generation failed");
      setSuggestions(genData.suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (suggestion: PhraseSuggestion, index: number) => {
    if (!vocabId) return;
    setSavingIdx(index);
    try {
      const res = await fetch("/api/phrases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vocabularyEntryId: vocabId,
          ...suggestion,
        }),
      });
      if (res.ok) {
        setSavedIds((prev) => new Set(prev).add(index));
        const saved = await res.json();
        setRecentPhrases((prev) => [saved, ...prev].slice(0, 5));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save");
      }
    } catch {
      alert("Failed to save phrase");
    } finally {
      setSavingIdx(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Generate Chinese Phrases</h1>
        <p className="text-gray-500">
          Enter an English word and get beginner-friendly Chinese phrases.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div>
          <label htmlFor="englishWord" className="block text-sm font-medium text-gray-700 mb-1">
            English Word *
          </label>
          <input
            id="englishWord"
            value={englishWord}
            onChange={(e) => setEnglishWord(e.target.value)}
            placeholder="e.g., happy, eat, run"
            required
            maxLength={100}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="topicTag" className="block text-sm font-medium text-gray-700 mb-1">
              Topic (optional)
            </label>
            <input
              id="topicTag"
              value={topicTag}
              onChange={(e) => setTopicTag(e.target.value)}
              placeholder="e.g., emotions, food"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty
            </label>
            <select
              id="difficulty"
              value={difficultyLevel}
              onChange={(e) => setDifficultyLevel(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
            </select>
          </div>
          <div>
            <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-1">
              Tone
            </label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="casual">Casual</option>
              <option value="neutral">Neutral</option>
              <option value="polite">Polite</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={generating}
          className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {generating ? "Generating..." : "Generate Phrases"}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      {generating && (
        <div className="text-center py-8 text-gray-500">
          Generating phrases...
        </div>
      )}

      {suggestions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Generated Suggestions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((s, i) => (
              <PhraseSuggestionCard
                key={i}
                suggestion={s}
                onSave={() => handleSave(s, i)}
                saving={savingIdx === i}
                saved={savedIds.has(i)}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Saved Phrases</h2>
        {recentPhrases.length === 0 ? (
          <p className="text-gray-400">No saved phrases yet. Generate some above!</p>
        ) : (
          <div className="space-y-2">
            {recentPhrases.map((p) => (
              <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <span className="text-sm text-indigo-600 font-medium mr-2">
                    {p.vocabularyEntry?.englishWord}
                  </span>
                  <span className="text-lg mr-2">{p.chineseText}</span>
                  <span className="text-gray-500 text-sm italic">{p.pinyin}</span>
                </div>
                <span className="text-gray-400 text-sm">{p.englishTranslation}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
