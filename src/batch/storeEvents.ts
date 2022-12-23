import { _EVENTS } from "../parsers/constants";
import { getContracts, getProvider } from "../config/contract";
import { getBlockNumber, multipleInserts } from "../graphql/functions";
import { parse } from "../parsers/parser";

import { EventMutationInput } from "../types";

import logger from "../infra/logger";

export const storeEvents = async () => {
  const { unicrow, unicrowDispute, unicrowArbitrator, unicrowClaim } =
    getContracts();

  const lastBlockNumberInDatabase: number = await getBlockNumber();

  const provider = getProvider();
  const latestBlockNumberBlockchain = await provider.getBlockNumber();

  // Job no need to execute if lastBlockNumberInDatabase is lower or equal to latestBlockNumberBlockchain
  if (latestBlockNumberBlockchain <= lastBlockNumberInDatabase) return;

  const lastBlockNumberInDatabasePlusOne = lastBlockNumberInDatabase + 1;

  const allEventsFromUnicrowCore = await unicrow.queryFilter(
    "*" as any,
    lastBlockNumberInDatabasePlusOne,
    latestBlockNumberBlockchain,
  );

  const allEventsFromUnicrowDispute = await unicrowDispute.queryFilter(
    "*" as any,
    lastBlockNumberInDatabasePlusOne,
    latestBlockNumberBlockchain,
  );

  const allEventsFromUnicrowArbitrator = await unicrowArbitrator.queryFilter(
    "*" as any,
    lastBlockNumberInDatabasePlusOne,
    latestBlockNumberBlockchain,
  );

  const allEventsFromUnicrowClaim = await unicrowClaim.queryFilter(
    "*" as any,
    lastBlockNumberInDatabasePlusOne,
    latestBlockNumberBlockchain,
  );

  const merge: any = [
    ...allEventsFromUnicrowCore,
    ...allEventsFromUnicrowDispute,
    ...allEventsFromUnicrowArbitrator,
    ...allEventsFromUnicrowClaim,
  ];

  const events = merge.sort((a: any, b: any) => a.blockNumber - b.blockNumber);

  const parsedEvents = events
    .filter((e: any) => _EVENTS.includes(e.event)) // ignore the OwnershipTransferred event and others not related to the indexer
    .flatMap((event: any) => {
      return parse(event);
    }) as EventMutationInput[];

  logger.info("⌗ Storing the events");
  // only update the block_number with latest from blockchain OR store events and update block_number too
  await multipleInserts(
    parsedEvents.length > 0 ? parsedEvents : [],
    latestBlockNumberBlockchain,
  );
};
