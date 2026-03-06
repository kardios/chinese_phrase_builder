"use client";

import { useState, useEffect, useCallback } from "react";
import SavedPhraseCard from "@/components/SavedPhraseCard";
import EditPhraseModal from "@/components/EditPhraseModal";
import type { PhraseType } from "@/lib/validators";

export default function PhrasesPage() {
  const [phrases, setPhrases] = useState<PhraseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterFavorite, setFilterFavorite] = useState(false);
  const [filterFamiliarity, setFilterFamiliarity] = useState("");
  const [sort, setSort] = useState("recent");
  const [editingPhrase, setEditingPhrase] = useState<PhraseType | null>(null);

  const fetchPhrases = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterFavorite) params.set("isFavorite", "true");
    if (filterFamiliarity) params.set("familiarityMax", filterFamiliarity);
    params.set("sort", sort);

    const res = await fetch(`/api/phrases?${params}`);
    const data = await res.json();
    setPhrases(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search, filterFavorite, filterFamiliarity, sort]);

  useEffect(() => {
    fetchPhrases();
  }, [fetchPhrases]);

  const handleUpdate = async (id: string, data: Record<string, unknown>) => {
    await fetch(`/api/phrases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchPhrases();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/phrases/${id}`, { method: "DELETE" });
    fetchPhrases();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Saved Phrases</h1>

      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search phrases..."
          className="flex-1 min-w-[200px] border border-gray-300 rounded px-3 py-2"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filterFavorite}
            onChange={(e) => setFilterFavorite(e.target.checked)}
          />
          Favorites only
        </label>
        <select
          value={filterFamiliarity}
          onChange={(e) => setFilterFamiliarity(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="">All levels</option>
          <option value="0">New (0)</option>
          <option value="2">Hard or below (0-2)</option>
          <option value="3">Okay or below (0-3)</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="recent">Most Recent</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : phrases.length === 0 ? (
        <p className="text-gray-400">
          No phrases found. {search || filterFavorite || filterFamiliarity
            ? "Try adjusting your filters."
            : "Generate and save some phrases from the home page!"}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {phrases.map((p) => (
            <SavedPhraseCard
              key={p.id}
              phrase={p}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onEdit={setEditingPhrase}
            />
          ))}
        </div>
      )}

      {editingPhrase && (
        <EditPhraseModal
          phrase={editingPhrase}
          onSave={handleUpdate}
          onClose={() => setEditingPhrase(null)}
        />
      )}
    </div>
  );
}
