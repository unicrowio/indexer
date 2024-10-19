import client from "./connection.js";
import { bulkInsertEventsMutation } from "./mutations.js";
import { getBlockNumberQuery } from "./queries.js";
import { EventMutationInput } from "../types/index.js";

export const getLastIdxBlock = async (network: string) => {
  const data = await client.rawRequest<any>(getBlockNumberQuery, { network });
  return data.data?.last_block_number[0]?.block_number;
};

export const multipleInserts = async (
  network: string,
  blockNumber: number,
  events: EventMutationInput[],
) => {
  await client.request(bulkInsertEventsMutation, {
    network,
    blockNumber,
    events,
  });
};
