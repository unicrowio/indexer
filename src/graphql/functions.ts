import client from "./connection.js";
import { bulkInsertEventsMutation } from "./mutations.js";
import { getBlockNumberQuery } from "./queries.js";
import { EventMutationInput } from "../types/index.js";

export const getLastIdxBlock = async (chainId: string) => {
  const data = await client.rawRequest<any>(getBlockNumberQuery, { chainId });
  return data.data?.last_block_number[0]?.block_number;
};

export const multipleInserts = async (
  chainId: string,
  blockNumber: number,
  events: EventMutationInput[],
) => {
  await client.request(bulkInsertEventsMutation, {
    chainId,
    blockNumber,
    events,
  });
};
