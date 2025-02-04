import { HfInference } from "@huggingface/inference";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { cleanedEnv } from "../../scripts/cleanedEnv";

const {
  HUGGING_FACE_API
} = cleanedEnv;
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const hf = new HfInference(HUGGING_FACE_API);
export const getEmbedding = async (text: string | string[]) => {
  try {
    // Ensure the input format is correct for the HuggingFace function
    const formattedInput = Array.isArray(text) ? text : [text];

    const response = await hf.featureExtraction({
      inputs: formattedInput,
      model: "sentence-transformers/all-MiniLM-L6-v2", // Pretrained embedding model
    });

    console.log(response.flat().length);
    return response.flat(); // Return the flattened embedding
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error; // Rethrow the error to handle it in the route
  }
};
