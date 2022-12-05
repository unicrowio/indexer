import config from '../env'
import { GraphQLClient } from 'graphql-request'
import logger from '../infra/logger'

logger.info(`🎧 - HASURA_GRAPHQL_URL: ${config.HASURA_GRAPHQL_URL}`)

const client = new GraphQLClient(config.HASURA_GRAPHQL_URL, {
  headers: {
    'content-type': 'application/json',
    'x-hasura-admin-secret': config.HASURA_GRAPHQL_ADMIN_SECRET,
    'x-hasura-role': 'admin'
  }
})

export default client
