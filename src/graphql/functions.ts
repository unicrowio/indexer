import client from "./connection";
import { bulkInsertEventsMutation } from "./mutations";
import { getBlockNumberQuery } from "./queries";
import { EventMutationInput } from "../types";

export const getBlockNumber = async () => {
  const data = await client.rawRequest(getBlockNumberQuery);
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
