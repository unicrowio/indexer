import dotenv from 'dotenv'
import { createServer } from 'http'
import { storeEvents } from './batch/storeEvents'
import app from './app'
import env from './env'
import logger from './infra/logger'

dotenv.config()

let COUNTER = 0

export const listenEvents = () => {
  setTimeout(async () => {
    try {
      logger.info(`🎧 listening to events... ${++COUNTER} times`)
      await storeEvents()
      listenEvents()
    } catch (error) {
      logger.error(error)
      logger.info('🚨 - Trying to listen the events again...')
      listenEvents()
    }
  }, env.TIME)
}

const server = createServer(app.callback())

server.listen(env.PORT, () => {
  logger.info(`🚀 server running at ${env.CROW_INDEXER_HOST}:${env.PORT} 💻`)
})

try {
  listenEvents()
} catch (error) {
  logger.error(error)
  listenEvents()
}
