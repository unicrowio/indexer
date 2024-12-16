import { GraphQLClient } from "graphql-request";

import config from "../env.js";
import logger from "../infra/logger.js";

logger.info(`HASURA_GRAPHQL_URL: ${config.HASURA_GRAPHQL_URL}`);

const client = new GraphQLClient(config.HASURA_GRAPHQL_URL, {
  headers: {
    "content-type": "application/json",
    "x-hasura-admin-secret": config.HASURA_GRAPHQL_ADMIN_SECRET,
    "x-hasura-role": "admin",
  },
});

export default client;
