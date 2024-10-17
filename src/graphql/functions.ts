import client from "./connection.js";
import { bulkInsertEventsMutation } from "./mutations.js";
import { getBlockNumberQuery } from "./queries.js";
import { EventMutationInput } from "../types/index.js";

export const getBlockNumber = async () => {
  const data = await client.rawRequest<any>(getBlockNumberQuery);
  const blockNumber = data.data.last_block_number[0].block_number;
  return blockNumber;
};

export const multipleInserts = async (
  events: EventMutationInput[],
  blockNumber: number,
) => {
  await client.request(bulkInsertEventsMutation, {
    events,
    blockNumber,
  });
};
