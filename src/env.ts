import dotenv from "dotenv";
dotenv.config();

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];

  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`env variable ${key} is not defined.`);
  }

  return value;
}

export default {
  PORT: getEnvVar("PORT"),
  RPC_HOST: getEnvVar("RPC_HOST"),
  UNICROW_ADDRESS: getEnvVar("UNICROW_ADDRESS"),
  UNICROW_DISPUTE_ADDRESS: getEnvVar("UNICROW_DISPUTE_ADDRESS"),
  UNICROW_ARBITRATOR_ADDRESS: getEnvVar("UNICROW_ARBITRATOR_ADDRESS"),
  UNICROW_CLAIM_ADDRESS: getEnvVar("UNICROW_CLAIM_ADDRESS"),
  HASURA_GRAPHQL_URL: getEnvVar("HASURA_GRAPHQL_URL"),
  CROW_INDEXER_HOST: getEnvVar("CROW_INDEXER_HOST"),
  TIME: parseInt(getEnvVar("TIME", "10000")), // default 10 seconds
  HASURA_GRAPHQL_ADMIN_SECRET: getEnvVar("HASURA_GRAPHQL_ADMIN_SECRET"),
};
