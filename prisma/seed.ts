import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const vocab = await Promise.all([
    prisma.vocabularyEntry.create({
      data: {
        englishWord: "happy",
        partOfSpeech: "adjective",
        topicTag: "emotions",
        difficultyLevel: "beginner",
        savedPhrases: {
          create: {
            chineseText: "\u6211\u4eca\u5929\u5f88\u5f00\u5fc3",
            pinyin: "W\u01d2 j\u012bn ti\u0101n h\u011bn k\u0101i x\u012bn",
            englishTranslation: "I am very happy today.",
            usageNote: "Basic adjective sentence",
          },
        },
      },
    }),
    prisma.vocabularyEntry.create({
      data: {
        englishWord: "eat",
        partOfSpeech: "verb",
        topicTag: "food",
        difficultyLevel: "beginner",
        savedPhrases: {
          create: {
            chineseText: "\u6211\u60f3\u5403\u996d",
            pinyin: "W\u01d2 xi\u01ceng ch\u012b f\u00e0n",
            englishTranslation: "I want to eat.",
            usageNote: "Common beginner phrase",
          },
        },
      },
    }),
    prisma.vocabularyEntry.create({
      data: {
        englishWord: "school",
        partOfSpeech: "noun",
        topicTag: "education",
        difficultyLevel: "beginner",
        savedPhrases: {
          create: {
            chineseText: "\u6211\u6bcf\u5929\u53bb\u5b66\u6821",
            pinyin: "W\u01d2 m\u011bi ti\u0101n q\u00f9 xu\u00e9 xi\u00e0o",
            englishTranslation: "I go to school every day.",
            usageNote: "Daily routine phrase",
          },
        },
      },
    }),
    prisma.vocabularyEntry.create({
      data: { englishWord: "book", partOfSpeech: "noun", topicTag: "education", difficultyLevel: "beginner" },
    }),
    prisma.vocabularyEntry.create({
      data: { englishWord: "run", partOfSpeech: "verb", topicTag: "daily life", difficultyLevel: "beginner" },
    }),
  ]);

  console.log(`Seeded ${vocab.length} vocabulary entries`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
