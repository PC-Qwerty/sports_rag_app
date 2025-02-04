/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectToAstraDB } from "../../../../scripts/astraDB";
import { cleanedEnv } from "../../../../scripts/cleanedEnv";
import type { Message } from "@/app/components/chat-area";
import PCA from "pca-js";

const { ASTRA_DB_COLLECTION: astra_collection, COHERE_API_KEY } = cleanedEnv;

async function callCohere(endpoint: string, payload: any): Promise<any> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${COHERE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(`Error calling endpoint ${endpoint}: ${errorMsg}`);
  }
  return res.json();
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const latestMessage: Message = messages[messages.length - 1];

    // ===== Step 1: Generate a 4096-dim embedding using Cohere
    const embedEndpoint = "https://api.cohere.ai/embed";
    const embedPayload = {
      texts: [latestMessage.text],
      truncate: "NONE",
    };
    const embeddingResponse = await callCohere(embedEndpoint, embedPayload);
    const [fullEmbedding] = embeddingResponse.embeddings; // 4096-dimensional array

    // ===== Step 2: Apply PCA to reduce to 384 dimensions
    // Note: PCA requires a dataset; for demonstration, we'll use the single embedding.
    // In practice, you should fit PCA on a representative dataset of embeddings.
    const pcaInput = [fullEmbedding];
    const eigenVectors = PCA.getEigenVectors(pcaInput);
    const adjustedData = PCA.computeAdjustedData(pcaInput, eigenVectors[0]);
    const reducedEmbedding = adjustedData.adjustedData[0].slice(0, 384); // 384-dimensional array

    // ===== Step 3: Retrieve relevant context from AstraDB using the reduced vector
    let docContext = "";
    try {
      const db = await connectToAstraDB();
      const collection = await db.collection(astra_collection);
      const res = await collection.find(null, {
        sort: { $vector: reducedEmbedding },
        limit: 10,
      });
      const docs = await res.toArray();
      const docMapping = docs.map((doc: any) => doc.text);
      docContext = JSON.stringify(docMapping);
    } catch (err) {
      console.error("Error fetching documents from AstraDB:", err);
      // Continue without context if necessary
    }

    // ===== Step 4: Build the prompt for text generation
    const prompt = `
You are an assistant with deep knowledge of Sports. Use the context below to help answer the user's question. If the context is insufficient, rely on your own knowledge without mentioning the context.

------------
START context
${docContext}
END context
------------

QUESTION: ${latestMessage.text}
`;

    // ===== Step 5: Generate a response using Cohere's text generation endpoint
    const generateEndpoint = "https://api.cohere.ai/generate";
    const generatePayload = {
      prompt: prompt,
      max_tokens: 200,
      temperature: 0.7,
      k: 0,
      p: 0.75,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    };
    const generationResponse = await callCohere(generateEndpoint, generatePayload);
    const generatedText = generationResponse.text;

    return new Response(JSON.stringify({ response: generatedText }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Error in API:", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
