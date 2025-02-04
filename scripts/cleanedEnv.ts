import "dotenv/config";

type envSchema = {
  OPEN_AI_API_KEY: string;
  ASTRA_DB_API_ENDPOINT: string;
  ASTRA_DB_APP_TOKEN: string;
  ASTRA_DB_NAMESPACE: string;
  ASTRA_DB_COLLECTION: string;
  HUGGING_FACE_API : string;
  COHERE_API_KEY : string;
};

export const cleanedEnv: envSchema = {
  OPEN_AI_API_KEY: process.env.OPEN_AI_API_KEY || "",
  ASTRA_DB_API_ENDPOINT: process.env.ASTRA_DB_API_ENDPOINT || "",
  ASTRA_DB_APP_TOKEN: process.env.ASTRA_DB_APP_TOKEN || "",
  ASTRA_DB_NAMESPACE: process.env.ASTRA_DB_NAMESPACE || "",
  ASTRA_DB_COLLECTION: process.env.ASTRA_DB_COLLECTION || "",
  HUGGING_FACE_API : process.env.HUGGING_FACE_API || "",
  COHERE_API_KEY : process.env.COHERE_API_KEY || "",
};
