"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import PhraseSuggestionCard from "@/components/PhraseSuggestionCard";
import SavedPhraseCard from "@/components/SavedPhraseCard";
import EditPhraseModal from "@/components/EditPhraseModal";
import type { PhraseSuggestion, PhraseType, VocabEntry } from "@/lib/validators";

export default function VocabularyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [entry, setEntry] = useState<VocabEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<PhraseSuggestion[]>([]);
  const [generating, setGenerating] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [savingIdx, setSavingIdx] = useState<number | null>(null);
  const [editingPhrase, setEditingPhrase] = useState<PhraseType | null>(null);
  const [error, setError] = useState("");

  const fetchEntry = useCallback(async () => {
    const res = await fetch(`/api/vocabulary/${id}`);
    if (res.ok) {
      setEntry(await res.json());
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchEntry();
  }, [fetchEntry]);

  const handleGenerate = async () => {
    if (!entry) return;
    setGenerating(true);
    setError("");
    setSuggestions([]);
    setSavedIds(new Set());
    try {
      const res = await fetch("/api/generate-phrases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          englishWord: entry.englishWord,
          difficultyLevel: entry.difficultyLevel || "beginner",
          topicTag: entry.topicTag || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setSuggestions(data.suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveSuggestion = async (suggestion: PhraseSuggestion, index: number) => {
    if (!entry) return;
    setSavingIdx(index);
    try {
      const res = await fetch("/api/phrases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vocabularyEntryId: entry.id, ...suggestion }),
      });
      if (res.ok) {
        setSavedIds((prev) => new Set(prev).add(index));
        fetchEntry();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save");
      }
    } catch {
      alert("Failed to save");
    } finally {
      setSavingIdx(null);
    }
  };

  const handleUpdatePhrase = async (phraseId: string, data: Record<string, unknown>) => {
    await fetch(`/api/phrases/${phraseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchEntry();
  };

  const handleDeletePhrase = async (phraseId: string) => {
    await fetch(`/api/phrases/${phraseId}`, { method: "DELETE" });
    fetchEntry();
  };

  if (loading) return <p className="text-gray-400">Loading...</p>;
  if (!entry) return <p className="text-red-500">Vocabulary entry not found.</p>;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/vocabulary" className="text-sm text-indigo-600 hover:underline">
          &larr; Back to Vocabulary
        </Link>
        <h1 className="text-2xl font-bold mt-2">{entry.englishWord}</h1>
        <div className="flex gap-2 mt-1 text-sm text-gray-500">
          {entry.partOfSpeech && <span>{entry.partOfSpeech}</span>}
          {entry.topicTag && (
            <span className="bg-gray-100 px-2 py-0.5 rounded">{entry.topicTag}</span>
          )}
          {entry.difficultyLevel && (
            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
              {entry.difficultyLevel}
            </span>
          )}
        </div>
        {entry.notes && <p className="text-gray-500 mt-1">{entry.notes}</p>}
      </div>

      <div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {generating ? "Generating..." : "Generate Phrases"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">{error}</div>
      )}

      {generating && <p className="text-gray-400">Generating phrases...</p>}

      {suggestions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Generated Suggestions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((s, i) => (
              <PhraseSuggestionCard
                key={i}
                suggestion={s}
                onSave={() => handleSaveSuggestion(s, i)}
                saving={savingIdx === i}
                saved={savedIds.has(i)}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">
          Saved Phrases ({entry.savedPhrases.length})
        </h2>
        {entry.savedPhrases.length === 0 ? (
          <p className="text-gray-400">No saved phrases yet. Generate some above!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entry.savedPhrases.map((p) => (
              <SavedPhraseCard
                key={p.id}
                phrase={{ ...p, vocabularyEntry: { englishWord: entry.englishWord, topicTag: entry.topicTag } }}
                onUpdate={handleUpdatePhrase}
                onDelete={handleDeletePhrase}
                onEdit={setEditingPhrase}
              />
            ))}
          </div>
        )}
      </div>

      {editingPhrase && (
        <EditPhraseModal
          phrase={editingPhrase}
          onSave={handleUpdatePhrase}
          onClose={() => setEditingPhrase(null)}
        />
      )}
    </div>
  );
}
