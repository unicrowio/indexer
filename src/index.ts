import { createServer } from "http";
import config from "./env.js";
import { getContracts, getProvider } from "./config/contract.js";
import { storeEvents } from "./batch/storeEvents.js";
import { getLastIdxBlock, multipleInserts } from "./graphql/functions.js";
import app from "./app.js";
import env from "./env.js";
import logger from "./infra/logger.js";

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const listenEvents = async () => {
  const enabledNetworks = Object.entries(config.NETWORKS).filter(
    ([_, network]) => network.index,
  );

  for (const [networkName, networkConfig] of enabledNetworks) {
    const lastIdxBlock = await getLastIdxBlock(networkName);
    if (!lastIdxBlock || lastIdxBlock < networkConfig.startingBlock) {
      logger.info(
        `setting indexing starting block of network ${networkName} to ${networkConfig.startingBlock}...`,
      );
      await multipleInserts(networkName, networkConfig.startingBlock, []);
    }

    const provider = getProvider(networkConfig.rpcHost);
    const contracts = getContracts(provider, networkConfig);

    (async () => {
      while (true) {
        try {
          logger.info(`listening for events on ${networkName}...`);
          await storeEvents(provider, networkName, contracts);
        } catch (error) {
          logger.error(`Error on ${networkName}: ${error}`);
        } finally {
          await sleep(config.TIME);
        }
      }
    })();
  }
};

const server = createServer(app.callback());

server.listen(env.PORT, () => {
  logger.info(`server running at ${env.CROW_INDEXER_HOST}:${env.PORT}`);
});

listenEvents();
