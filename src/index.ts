import { createServer } from "http";
import config from "./env.js";
import { getContracts, getProvider } from "./config/contract.js";
import { storeEvents } from "./batch/storeEvents.js";
import app from "./app.js";
import env from "./env.js";
import logger from "./infra/logger.js";

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
