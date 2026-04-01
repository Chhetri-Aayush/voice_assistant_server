import { db } from "@/db";
import { faqChunks } from "@/db/schema";
import { InferenceClient } from "@huggingface/inference";
import { sql } from "drizzle-orm";

const hf = new InferenceClient(process.env.HF_TOKEN);

async function embedQuery(query: string): Promise<number[]> {
  const embedding = await hf.featureExtraction({
    model: "sentence-transformers/LaBSE",
    inputs: query,
  });

  return Array.isArray(embedding[0])
    ? (embedding as number[][])[0]
    : (embedding as number[]);
}

async function retrieveChunks(query: string, topK = 3): Promise<string[]> {
  const queryEmbedding = await embedQuery(query);
  const vectorString = `[${queryEmbedding.join(",")}]`;

  const results = await db.execute(sql`
    SELECT chunk_text, 
           1 - (embedding <=> ${vectorString}::vector) AS similarity
    FROM faq_chunks
    ORDER BY embedding <=> ${vectorString}::vector
    LIMIT ${topK}
  `);

  // console.log("Retrieved chunks:");
  // results.rows.forEach((row, i) => {
  //   console.log(
  //     `\nChunk ${i + 1} (similarity: ${Number(row.similarity).toFixed(4)}):`,
  //   );
  //   console.log(row.chunk_text);
  // });

  return results.rows.map((row) => row.chunk_text as string);
}

async function generateAnswer(
  context: string,
  question: string,
): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    // `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-latest:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `
तपाईं अस्पतालको AI assistant हुनुहुन्छ।
तल दिइएको FAQ जानकारी प्रयोग गरेर मात्र उत्तर दिनुहोस्।
यदि उत्तर उपलब्ध छैन भने "माफ गर्नुहोस्, जानकारी उपलब्ध छैन।" भन्नुहोस्।

FAQ जानकारी:
${context}

प्रश्न:
${question}

उत्तर नेपालीमा, संक्षिप्त र स्पष्ट दिनुहोस्।
                `,
              },
            ],
          },
        ],
      }),
    },
  );

  const rawText = await response.text();
  // console.log("Status:", response.status);
  // console.log("Raw text:", rawText);

  if (!rawText) {
    console.error("Empty response from Gemini");
    return "माफ गर्नुहोस्, जानकारी उपलब्ध छैन।";
  }

  const data = JSON.parse(rawText);

  if (!data.candidates?.[0]) {
    // console.error("Gemini error:", data.error);
    return "माफ गर्नुहोस्, जानकारी उपलब्ध छैन।";
  }

  return data.candidates[0].content.parts[0].text.trim();
}

export async function answerQuery(userQuery: string): Promise<string> {
  console.log("\n🔍 User query:", userQuery);

  const chunks = await retrieveChunks(userQuery);

  if (chunks.length === 0) {
    return "माफ गर्नुहोस्, जानकारी उपलब्ध छैन।";
  }

  const context = chunks.join("\n\n");
  const answer = await generateAnswer(context, userQuery);

  // console.log("\n✅ Answer:", answer);
  return answer;
}
// (async () => {
//   const answer = await answerQuery("appointment cancel कसरी गर्ने?");
//   console.log(answer);
// })();
