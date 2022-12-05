import client from './connection'
import { bulkInsertEventsMutation } from './mutations'
import { getBlockNumberQuery } from './queries'
import logger from '../infra/logger'
import { EventMutationInput } from '../types'

export const getBlockNumber = async () => {
  try {
    const data = await client.rawRequest(getBlockNumberQuery)
    const blockNumber = data.data.last_block_number[0].block_number
    return blockNumber
  } catch (error) {
    logger.error(error)
  }
}

export const multipleInserts = async (
  events: EventMutationInput[],
  blockNumber: number
) => {
  try {
    await client.request(bulkInsertEventsMutation, {
      events,
      blockNumber
    })
  } catch (error) {
    logger.error(error)
  }
}
