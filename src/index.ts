import { createServer } from "http";
import dotenv from "dotenv";
dotenv.config();

import config from "./env";
import { getContracts, getProvider } from "./config/contract";
import { storeEvents } from "./batch/storeEvents";
import app from "./app";
import env from "./env";
import logger from "./infra/logger";

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const listenEvents = async () => {
  const provider = getProvider();
  const contracts = getContracts(provider);

  while (true) {
    try {
      logger.info("🎧 listening for events...");
      await storeEvents(provider, contracts);
    } catch (error) {
      logger.error(error);
    } finally {
      await sleep(config.TIME);
    }
  }
};

const server = createServer(app.callback());

server.listen(env.PORT, () => {
  logger.info(`🚀 server running at ${env.CROW_INDEXER_HOST}:${env.PORT} 💻`);
});

listenEvents();
