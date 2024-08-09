// eslint-disable-next-line import/no-anonymous-default-export
export default {
  PORT: process.env.PORT!,
  RPC_HOST: process.env.RPC_HOST!,
  UNICROW_ADDRESS: process.env.UNICROW_ADDRESS!,
  UNICROW_DISPUTE_ADDRESS: process.env.UNICROW_DISPUTE_ADDRESS!,
  UNICROW_ARBITRATOR_ADDRESS: process.env.UNICROW_ARBITRATOR_ADDRESS!,
  UNICROW_CLAIM_ADDRESS: process.env.UNICROW_CLAIM_ADDRESS!,
  HASURA_GRAPHQL_URL: process.env.HASURA_GRAPHQL_URL!,
  CROW_INDEXER_HOST: process.env.CROW_INDEXER_HOST!,
  TIME: parseInt(process.env.TIME ? process.env.TIME : "5000"), // default value 5 seconds
  HASURA_GRAPHQL_ADMIN_SECRET: process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
};
