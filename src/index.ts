import dotenv from "dotenv";
import { createServer } from "http";
import { storeEvents } from "./batch/storeEvents";
import app from "./app";
import env from "./env";
import logger from "./infra/logger";

dotenv.config();

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const listenEvents = async () => {
  while (true) {
    try {
      logger.info("🎧 listening for events...");
      await storeEvents();
    } catch (error) {
      logger.error(error);
      await sleep(10000);
    }
  }
};

const server = createServer(app.callback());

server.listen(env.PORT, () => {
  logger.info(`🚀 server running at ${env.CROW_INDEXER_HOST}:${env.PORT} 💻`);
});

listenEvents();
