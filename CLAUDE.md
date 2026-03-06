# Chinese Phrase Builder

A Next.js app that generates beginner-friendly Chinese phrases from English words using Claude AI.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (strict mode)
- **Database**: SQLite via Prisma ORM
- **AI**: Claude Haiku 4.5 via `@ai-sdk/anthropic` + Vercel AI SDK
- **Styling**: Tailwind CSS v4
- **Validation**: Zod v4 (import from `zod/v4`)

## Project Structure

```
src/
  app/
    page.tsx                    # Home — generate phrases from English words
    layout.tsx                  # Root layout with nav
    globals.css                 # Tailwind import
    vocabulary/
      page.tsx                  # Vocabulary list (CRUD)
      [id]/page.tsx             # Vocabulary detail + phrase generation
    phrases/
      page.tsx                  # Saved phrases with search/filter/sort
    api/
      vocabulary/route.ts       # GET (list), POST (create)
      vocabulary/[id]/route.ts  # GET, PATCH, DELETE
      generate-phrases/route.ts # POST — calls Claude to generate phrases
      phrases/route.ts          # GET (list), POST (create with duplicate check)
      phrases/[id]/route.ts     # GET, PATCH, DELETE
  lib/
    db.ts                       # Prisma singleton
    validators.ts               # Zod schemas and types
    phraseGenerator.ts          # Claude AI phrase generation
  components/
    PhraseSuggestionCard.tsx     # AI-generated suggestion card
    SavedPhraseCard.tsx         # Saved phrase with edit/delete/favorite
    EditPhraseModal.tsx         # Modal for editing phrases
prisma/
  schema.prisma                 # VocabularyEntry, SavedPhrase models
  seed.ts                       # Seed data
  dev.db                        # SQLite database (gitignored)
```

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run db:push      # Push Prisma schema to database
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio
```

## Database

Two models with a one-to-many relationship:
- **VocabularyEntry** — English word with metadata (part of speech, topic, difficulty)
- **SavedPhrase** — Chinese phrase linked to a vocabulary entry (chinese text, pinyin, translation, familiarity rating, favorite flag)

Cascade delete: deleting a vocabulary entry removes all its saved phrases.

## Key Conventions

- All pages are client components (`"use client"`)
- API routes validate input with Zod schemas from `src/lib/validators.ts`
- API routes wrap `request.json()` in try/catch to return 400 on invalid JSON
- Shared types (`PhraseType`, `VocabEntry`) are defined once in `src/lib/validators.ts` and imported everywhere
- Prisma client is a singleton via `src/lib/db.ts` to avoid connection leaks in dev
- Prisma datasource URL uses `env("DATABASE_URL")` — set in `.env` (gitignored)
- Environment variables: `DATABASE_URL`, `ANTHROPIC_API_KEY` (in `.env`, gitignored)
- Navigation uses Next.js `<Link>` for client-side transitions
- Phrase generation uses `generateObject` from the AI SDK (structured output, no manual JSON parsing)
- Vocabulary POST endpoint deduplicates by `englishWord` — returns existing entry if found
- ESM project (`"type": "module"` in package.json)
- Anthropic API does not support `minItems`/`maxItems` in JSON schemas — avoid these on schemas passed to `generateObject`

## Known Issues

- No debounce on search inputs
