import "dotenv/config";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
// import { OpenAI } from "openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { cleanedEnv } from "./cleanedEnv";
import { connectToAstraDB } from "./astraDB";
import { getEmbedding } from "@/lib/utils";

const {
  ASTRA_DB_COLLECTION,
  // OPEN_AI_API_KEY,
} = cleanedEnv;


// const openai = new OpenAI({
//   apiKey: OPEN_AI_API_KEY,
// });

const urlsToScrape = [
  // Official Sports Websites
  "https://www.espn.com",
  "https://www.fifa.com",
  "https://www.nba.com",
  "https://www.nfl.com",
  "https://www.mlb.com",
  "https://www.icc-cricket.com",
  "https://www.cricbuzz.com",

  // Sports News Platforms
  "https://www.bbc.com/sport",
  "https://bleacherreport.com",
  "https://www.skysports.com",

  // Social Media
  "https://twitter.com",
  "https://www.reddit.com/r/sports",
  "https://www.reddit.com/r/soccer",
  "https://www.reddit.com/r/nba",

  // Live Score Platforms
  "https://www.flashscore.com",
  "https://www.sofascore.com",
];

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

{
// const getEmbedding = async () => {
//   const response = await openai.embeddings.create({
//     model: "text-embedding-3-small",
//     input: "Hello world",
//     encoding_format: "float",
//   });

//   return response;
// };

// getEmbedding()
//   .then((response) => {
//     console.log(response);
//   })
//   .catch((error) => {
//     console.error("Error generating embedding:", error);
//   });
}
  




{
// getEmbedding("Hello world")
//   .then((embedding) => console.log("Embedding:", embedding))
//   .catch((error) => console.error(error));
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const loadSampleData = async () => {
  const db = await connectToAstraDB();
  const collection = db.collection(ASTRA_DB_COLLECTION);

  let requestsToday = 0;
  const batchSize = 1;
  const delayMs = 600;
  const dailyLimitReq = 1000;

  for await (const url of urlsToScrape) {
    const content = await scrape(url);
    const chunks = await splitter.splitText(content);

    for (let i = 0; i < chunks.length; i += batchSize) {
      if (requestsToday >= dailyLimitReq) {
        console.log("Daily request limit reached. Try again tomorrow.");
        return;
      }
      const batchChunk = chunks.slice(i, i + batchSize);
      {
      // const docChunkEmbedding = await openai.embeddings.create({
      //   model: "text-embedding-3-small",
      //   input: batchChunk,
      //   encoding_format: "float",
      // });
      }

      const docChunkEmbedding = await getEmbedding(batchChunk);
      
      const vectorEmbedding = docChunkEmbedding
      
      const res = await collection.insertOne({
        $vector: vectorEmbedding,
        text: batchChunk,
      });

      requestsToday++;
      await delay(delayMs);
      console.log(res);
    }
  }
};

loadSampleData()

async function scrape(url: string) {
  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: {
      headless: true,
    },
    gotoOptions: {
      waitUntil: "domcontentloaded",
    },
    evaluate : async (page, browser) => {
        const res = await page.evaluate(() => document.body.innerHTML);
        await browser.close()
        return res
    }
  });

  return (await loader.scrape()).replace(/<[^>]*>?/gm,'')
}
