"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type VocabEntry = {
  id: string;
  englishWord: string;
  partOfSpeech?: string | null;
  topicTag?: string | null;
  difficultyLevel?: string | null;
  notes?: string | null;
  savedPhrases?: { id: string }[];
};

export default function VocabularyPage() {
  const [entries, setEntries] = useState<VocabEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    englishWord: "",
    partOfSpeech: "",
    topicTag: "",
    difficultyLevel: "",
    notes: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/vocabulary?${params}`);
    const data = await res.json();
    setEntries(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/vocabulary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        englishWord: form.englishWord,
        partOfSpeech: form.partOfSpeech || undefined,
        topicTag: form.topicTag || undefined,
        difficultyLevel: form.difficultyLevel || undefined,
        notes: form.notes || undefined,
      }),
    });
    if (res.ok) {
      setForm({ englishWord: "", partOfSpeech: "", topicTag: "", difficultyLevel: "", notes: "" });
      setShowCreate(false);
      fetchEntries();
    }
  };

  const handleUpdate = async (id: string) => {
    await fetch(`/api/vocabulary/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        englishWord: form.englishWord,
        partOfSpeech: form.partOfSpeech || undefined,
        topicTag: form.topicTag || undefined,
        difficultyLevel: form.difficultyLevel || undefined,
        notes: form.notes || undefined,
      }),
    });
    setEditingId(null);
    setForm({ englishWord: "", partOfSpeech: "", topicTag: "", difficultyLevel: "", notes: "" });
    fetchEntries();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/vocabulary/${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    fetchEntries();
  };

  const startEdit = (entry: VocabEntry) => {
    setEditingId(entry.id);
    setForm({
      englishWord: entry.englishWord,
      partOfSpeech: entry.partOfSpeech || "",
      topicTag: entry.topicTag || "",
      difficultyLevel: entry.difficultyLevel || "",
      notes: entry.notes || "",
    });
  };

  const vocabForm = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">English Word *</label>
        <input
          value={form.englishWord}
          onChange={(e) => setForm({ ...form, englishWord: e.target.value })}
          required
          maxLength={100}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Part of Speech</label>
        <input
          value={form.partOfSpeech}
          onChange={(e) => setForm({ ...form, partOfSpeech: e.target.value })}
          placeholder="e.g., noun, verb"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
        <input
          value={form.topicTag}
          onChange={(e) => setForm({ ...form, topicTag: e.target.value })}
          placeholder="e.g., food, emotions"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
        <select
          value={form.difficultyLevel}
          onChange={(e) => setForm({ ...form, difficultyLevel: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="">-</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <input
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vocabulary</h1>
        <button
          onClick={() => {
            setShowCreate(!showCreate);
            setEditingId(null);
            setForm({ englishWord: "", partOfSpeech: "", topicTag: "", difficultyLevel: "", notes: "" });
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          {showCreate ? "Cancel" : "New Word"}
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search vocabulary..."
        className="w-full border border-gray-300 rounded px-3 py-2"
      />

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h2 className="font-semibold">Create Vocabulary Entry</h2>
          {vocabForm}
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Create
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : entries.length === 0 ? (
        <p className="text-gray-400">No vocabulary entries yet. Create one above or generate phrases from the home page.</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white border border-gray-200 rounded-lg p-4">
              {editingId === entry.id ? (
                <div className="space-y-3">
                  {vocabForm}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(entry.id)}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <Link
                      href={`/vocabulary/${entry.id}`}
                      className="text-lg font-medium text-indigo-600 hover:underline"
                    >
                      {entry.englishWord}
                    </Link>
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
                    <p className="text-sm text-gray-400 mt-1">
                      {entry.savedPhrases?.length || 0} phrase(s)
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(entry)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    {deleteConfirm === entry.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1 text-sm border border-gray-300 rounded"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(entry.id)}
                        className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
