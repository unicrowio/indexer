import async from "async";
import { ethers } from "ethers";

import { _EVENTS } from "../parsers/constants.js";
import { getBlockNumber, multipleInserts } from "../graphql/functions.js";
import { IContracts } from "../config/contract.js";
import { parse } from "../parsers/parser.js";
import { EventMutationInput } from "../types/index.js";
import logger from "../infra/logger.js";

// Number of blocks per query
const LIMIT = 5000;

export const storeEvents = async (
  provider: ethers.JsonRpcProvider,
  contracts: IContracts,
) => {
  const latestBlockNumberBlockchain = await provider.getBlockNumber();
  const lastBlockNumberInDb: number = await getBlockNumber();

  logger.info(`⌗ Last indexed block: ${lastBlockNumberInDb}`);
  logger.info(`⌗ Chain last block: ${latestBlockNumberBlockchain}`);

  if (latestBlockNumberBlockchain <= lastBlockNumberInDb) return;

  const lastBlockNumberInDbPlusOne = lastBlockNumberInDb + 1;
  let lastBlockNumberInDbPlusLimit = lastBlockNumberInDb + LIMIT;
  if (lastBlockNumberInDbPlusLimit > latestBlockNumberBlockchain) {
    lastBlockNumberInDbPlusLimit = latestBlockNumberBlockchain;
  }

  logger.info(
    `⌗ Indexing blocks from: ${lastBlockNumberInDbPlusOne} to: ${lastBlockNumberInDbPlusLimit}`,
  );

  const promises = [];

  promises.push(async function () {
    return contracts.unicrow.queryFilter(
      "*" as any,
      lastBlockNumberInDbPlusOne,
      lastBlockNumberInDbPlusLimit,
    );
  });

  promises.push(async function () {
    return contracts.unicrowDispute.queryFilter(
      "*" as any,
      lastBlockNumberInDbPlusOne,
      lastBlockNumberInDbPlusLimit,
    );
  });

  promises.push(async function () {
    return contracts.unicrowArbitrator.queryFilter(
      "*" as any,
      lastBlockNumberInDbPlusOne,
      lastBlockNumberInDbPlusLimit,
    );
  });

  promises.push(async function () {
    return contracts.unicrowClaim.queryFilter(
      "*" as any,
      lastBlockNumberInDbPlusOne,
      lastBlockNumberInDbPlusLimit,
    );
  });

  const result: any = await async.parallelLimit(promises, 10);

  // clean the events with only the object event
  const _events = result
    .filter((item: any) => item) // remove undefined
    .filter((j: any) => j.length > 0) // get only arrays with items
    .flat(2); // flatten the array

  // fix the order of events transaction
  const events = _events.sort(
    (a: any, b: any) => a.blockNumber - b.blockNumber,
  );

  const parsedEvents = events
    .filter((e: any) => _EVENTS.includes(e.fragment?.name)) // ignore the OwnershipTransferred event and others not related to the indexer
    .flatMap((event: any) => parse(event)) as EventMutationInput[];

  logger.info("⌗ Storing the events");

  // only update the block_number with latest indexed block OR store events and update block_number too
  await multipleInserts(
    parsedEvents.length > 0 ? parsedEvents : [],
    lastBlockNumberInDbPlusLimit,
  );
};
