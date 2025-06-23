import async from "async";
import { ethers } from "ethers";

import { _EVENTS } from "../parsers/constants.js";
import { getLastIdxBlock, multipleInserts } from "../graphql/functions.js";
import { IContracts } from "../config/contract.js";
import { parse } from "../parsers/parser.js";
import { EventMutationInput } from "../types/index.js";
import logger from "../infra/logger.js";

// Number of blocks per query
const LIMIT = 500;

export const storeEvents = async (
  provider: ethers.JsonRpcProvider,
  chainId: string,
  contracts: IContracts,
) => {
  const lastChainBlock = await provider.getBlockNumber();
  const lastIdxBlock: number = await getLastIdxBlock(chainId);

  logger.info(`[${chainId}] last indexed block: ${lastIdxBlock}`);
  logger.info(`[${chainId}] chain last block: ${lastChainBlock}`);

  if (lastChainBlock <= lastIdxBlock) return;

  const lastIdxBlockPlusOne = lastIdxBlock + 1;
  let lastIdxBlockPlusLimit = lastIdxBlock + LIMIT;
  if (lastIdxBlockPlusLimit > lastChainBlock) {
    lastIdxBlockPlusLimit = lastChainBlock;
  }

  logger.info(
    `[${chainId}] indexing blocks from: ${lastIdxBlockPlusOne} to: ${lastIdxBlockPlusLimit}`,
  );

  const promises = [];

  promises.push(async function () {
    return contracts.unicrow.queryFilter(
      "*" as any,
      lastIdxBlockPlusOne,
      lastIdxBlockPlusLimit,
    );
  });

  promises.push(async function () {
    return contracts.unicrowDispute.queryFilter(
      "*" as any,
      lastIdxBlockPlusOne,
      lastIdxBlockPlusLimit,
    );
  });

  promises.push(async function () {
    return contracts.unicrowArbitrator.queryFilter(
      "*" as any,
      lastIdxBlockPlusOne,
      lastIdxBlockPlusLimit,
    );
  });

  promises.push(async function () {
    return contracts.unicrowClaim.queryFilter(
      "*" as any,
      lastIdxBlockPlusOne,
      lastIdxBlockPlusLimit,
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
    .flatMap((event: any) => parse(chainId, event)) as EventMutationInput[];

  logger.info(`[${chainId}] storing the events`);

  // only update the block_number with latest indexed block OR store events and update block_number too
  await multipleInserts(
    chainId,
    lastIdxBlockPlusLimit,
    parsedEvents.length > 0 ? parsedEvents : [],
  );
};
