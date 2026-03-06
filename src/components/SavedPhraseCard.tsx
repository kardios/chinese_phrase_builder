"use client";

import { useState } from "react";
import type { PhraseType } from "@/lib/validators";

type Props = {
  phrase: PhraseType;
  onUpdate: (id: string, data: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (phrase: PhraseType) => void;
};

const familiarityLabels = ["New", "Very Hard", "Hard", "Okay", "Familiar", "Mastered"];

export default function SavedPhraseCard({ phrase, onUpdate, onDelete, onEdit }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex justify-between items-start mb-2">
        <div>
          {phrase.vocabularyEntry && (
            <span className="text-sm font-medium text-indigo-600">
              {phrase.vocabularyEntry.englishWord}
            </span>
          )}
          {phrase.vocabularyEntry?.topicTag && (
            <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
              {phrase.vocabularyEntry.topicTag}
            </span>
          )}
        </div>
        <button
          onClick={() => onUpdate(phrase.id, { isFavorite: !phrase.isFavorite })}
          className="text-xl"
          title={phrase.isFavorite ? "Unfavorite" : "Favorite"}
        >
          {phrase.isFavorite ? "\u2605" : "\u2606"}
        </button>
      </div>
      <p className="text-2xl mb-1">{phrase.chineseText}</p>
      <p className="text-gray-500 italic mb-1">{phrase.pinyin}</p>
      <p className="text-gray-700 mb-1">{phrase.englishTranslation}</p>
      {phrase.usageNote && (
        <p className="text-sm text-gray-400 mb-2">{phrase.usageNote}</p>
      )}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm text-gray-500">Familiarity:</span>
        <select
          value={phrase.familiarityRating}
          onChange={(e) =>
            onUpdate(phrase.id, { familiarityRating: parseInt(e.target.value) })
          }
          className="text-sm border border-gray-300 rounded px-2 py-1"
        >
          {familiarityLabels.map((label, i) => (
            <option key={i} value={i}>
              {i} - {label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(phrase)}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
        >
          Edit
        </button>
        {confirmDelete ? (
          <div className="flex gap-1">
            <button
              onClick={() => onDelete(phrase.id)}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
