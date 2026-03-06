"use client";

import { useState } from "react";
import type { PhraseType } from "@/lib/validators";

type Props = {
  phrase: PhraseType;
  onSave: (id: string, data: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
};

export default function EditPhraseModal({ phrase, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    chineseText: phrase.chineseText,
    pinyin: phrase.pinyin,
    englishTranslation: phrase.englishTranslation,
    usageNote: phrase.usageNote || "",
    familiarityRating: phrase.familiarityRating,
    isFavorite: phrase.isFavorite,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(phrase.id, form);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Edit Phrase</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chinese Text *
            </label>
            <input
              value={form.chineseText}
              onChange={(e) => setForm({ ...form, chineseText: e.target.value })}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pinyin *
            </label>
            <input
              value={form.pinyin}
              onChange={(e) => setForm({ ...form, pinyin: e.target.value })}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              English Translation *
            </label>
            <input
              value={form.englishTranslation}
              onChange={(e) => setForm({ ...form, englishTranslation: e.target.value })}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usage Note
            </label>
            <input
              value={form.usageNote}
              onChange={(e) => setForm({ ...form, usageNote: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Familiarity (0-5)
            </label>
            <input
              type="number"
              min={0}
              max={5}
              value={form.familiarityRating}
              onChange={(e) => setForm({ ...form, familiarityRating: parseInt(e.target.value) })}
              className="w-20 border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFavorite"
              checked={form.isFavorite}
              onChange={(e) => setForm({ ...form, isFavorite: e.target.checked })}
            />
            <label htmlFor="isFavorite" className="text-sm text-gray-700">
              Favorite
            </label>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
