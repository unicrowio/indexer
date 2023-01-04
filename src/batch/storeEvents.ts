import { _EVENTS } from "../parsers/constants";
import { getContracts, getProvider } from "../config/contract";
import { getBlockNumber, multipleInserts } from "../graphql/functions";
import { parse } from "../parsers/parser";
import { TypedEvent } from "@unicrowio/ethers-types/types/common";
import { EventMutationInput } from "../types";
import logger from "../infra/logger";

// Limit of the events I can get from blockchain per time. Ex: from: 0 to: 10000
const LIMIT = 10000;

export const storeEvents = async () => {
  const { unicrow, unicrowDispute, unicrowArbitrator, unicrowClaim } =
    getContracts();

  const lastBlockNumberInDatabase: number = await getBlockNumber();

  const provider = getProvider();
  const latestBlockNumberBlockchain = await provider.getBlockNumber();

  // Job no need to execute if lastBlockNumberInDatabase is lower or equal to latestBlockNumberBlockchain
  if (latestBlockNumberBlockchain <= lastBlockNumberInDatabase) return;

  // Paginate the events by 10.000 block number
  const arrUnicrow: TypedEvent<any, any>[] = [];
  const arrDispute: TypedEvent<any, any>[] = [];
  const arrArbitration: TypedEvent<any, any>[] = [];
  const arrClaim: TypedEvent<any, any>[] = [];

  for (
    let from = lastBlockNumberInDatabase;
    from <= latestBlockNumberBlockchain;
    from = from + LIMIT
  ) {
    const lastBlockNumberInDatabasePlusOne = from + 1;
    let lastBlockNumberInDatabasePlusLimit = from + LIMIT;

    if (lastBlockNumberInDatabasePlusLimit > latestBlockNumberBlockchain) {
      lastBlockNumberInDatabasePlusLimit = latestBlockNumberBlockchain;
    }

    const allEventsFromUnicrowCore = await unicrow.queryFilter(
      "*" as any,
      lastBlockNumberInDatabasePlusOne,
      lastBlockNumberInDatabasePlusLimit,
    );

    const allEventsFromUnicrowDispute = await unicrowDispute.queryFilter(
      "*" as any,
      lastBlockNumberInDatabasePlusOne,
      lastBlockNumberInDatabasePlusLimit,
    );

    const allEventsFromUnicrowArbitrator = await unicrowArbitrator.queryFilter(
      "*" as any,
      lastBlockNumberInDatabasePlusOne,
      lastBlockNumberInDatabasePlusLimit,
    );

    const allEventsFromUnicrowClaim = await unicrowClaim.queryFilter(
      "*" as any,
      lastBlockNumberInDatabasePlusOne,
      lastBlockNumberInDatabasePlusLimit,
    );

    arrUnicrow.push(...allEventsFromUnicrowCore);
    arrDispute.push(...allEventsFromUnicrowDispute);
    arrArbitration.push(...allEventsFromUnicrowArbitrator);
    arrClaim.push(...allEventsFromUnicrowClaim);
  }

  const merge: any = [
    ...arrUnicrow,
    ...arrDispute,
    ...arrArbitration,
    ...arrClaim,
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
