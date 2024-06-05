import { _EVENTS } from "../parsers/constants";
import { getContracts, getProvider } from "../config/contract";
import { getBlockNumber, multipleInserts } from "../graphql/functions";
import { parse } from "../parsers/parser";
import { EventMutationInput } from "../types";
import logger from "../infra/logger";
import async from "async";

// Limit of the events I can get from blockchain per time. Ex: from: 0 to: 10000
const LIMIT = 5000;

export const storeEvents = async () => {
  const { unicrow, unicrowDispute, unicrowArbitrator, unicrowClaim } =
    getContracts();

  const lastBlockNumberInDb: number = await getBlockNumber();

  const provider = getProvider();
  const latestBlockNumberBlockchain = await provider.getBlockNumber();

  logger.info(`⌗ Last indexed block: ${lastBlockNumberInDb}`);
  logger.info(`⌗ Chain last block: ${latestBlockNumberBlockchain}`);

  if (latestBlockNumberBlockchain <= lastBlockNumberInDb) return;

  const lastBlockNumberInDbPlusOne = lastBlockNumberInDb + 1;
  let lastBlockNumberInDbPlusLimit = lastBlockNumberInDb + LIMIT;
  if (lastBlockNumberInDbPlusLimit > latestBlockNumberBlockchain) {
    lastBlockNumberInDbPlusLimit = latestBlockNumberBlockchain;
  }

  logger.info(`⌗ Indexing blocks from: ${lastBlockNumberInDbPlusOne} to: ${lastBlockNumberInDbPlusLimit}`);

  const promises = [];

  promises.push(async function () {
    return unicrow.queryFilter(
      "*" as any,
      lastBlockNumberInDbPlusOne,
      lastBlockNumberInDbPlusLimit,
    );
  });

  promises.push(async function () {
    return unicrowDispute.queryFilter(
      "*" as any,
      lastBlockNumberInDbPlusOne,
      lastBlockNumberInDbPlusLimit,
    );
  });

  promises.push(async function () {
    return unicrowArbitrator.queryFilter(
      "*" as any,
      lastBlockNumberInDbPlusOne,
      lastBlockNumberInDbPlusLimit,
    );
  });

  promises.push(async function () {
    return unicrowClaim.queryFilter(
      "*" as any,
      lastBlockNumberInDbPlusOne,
      lastBlockNumberInDbPlusLimit,
    );
  });

  let result: any = await async.parallelLimit(promises, 10);

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
    .filter((e: any) => _EVENTS.includes(e.event)) // ignore the OwnershipTransferred event and others not related to the indexer
    .flatMap((event: any) => {
      return parse(event);
    }) as EventMutationInput[];

  logger.info("⌗ Storing the events");

  // only update the block_number with latest indexed block OR store events and update block_number too
  await multipleInserts(
    parsedEvents.length > 0 ? parsedEvents : [],
    lastBlockNumberInDbPlusLimit,
  );
};
