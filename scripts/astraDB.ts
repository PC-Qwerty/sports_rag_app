import { DataAPIClient } from "@datastax/astra-db-ts"
import { cleanedEnv } from "./cleanedEnv";

type SimilarityMetric = "cosine" | "dot_product" | "euclidean"

const {
  ASTRA_DB_API_ENDPOINT: endpoint,
  ASTRA_DB_APP_TOKEN: token,
  ASTRA_DB_NAMESPACE: namespace,
  ASTRA_DB_COLLECTION: astra_collection,
} = cleanedEnv;

export const connectToAstraDB = async () => {
    if(!endpoint || !token) {
        throw new Error("Missing env variables: ASTRA_DB_API_ENDPOINT and ASTRA_DB_APP_TOKEN")
    }
    const client = new DataAPIClient(token);
    const db = client.db(endpoint, {
        namespace : namespace,
    });
    return db
}

export const createCollection = async (similarityMetric: SimilarityMetric = "dot_product") => {
    const db = await connectToAstraDB();

    const collection = db.createCollection(astra_collection, {
        vector : {
            dimension : 384,
            metric : similarityMetric,
        }
    })
    return collection
}
