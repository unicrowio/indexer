import dotenv from "dotenv";

dotenv.config();

export interface Network {
  index: boolean;
  startingBlock: number;
  rpcHost: string;
  unicrowAddress: string;
  unicrowDisputeAddress: string;
  unicrowArbitratorAddress: string;
  unicrowClaimAddress: string;
}

interface Networks {
  [key: string]: Network;
}

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

function getValidateNetworks(key: string): Networks {
  try {
    const nets: Networks = JSON.parse(process.env[key] as string);

    for (const [name, cfg] of Object.entries(nets)) {
      if (cfg.index) {
        const url: string = cfg.rpcHost;

        if (!isValidUrl(url)) {
          throw new Error(
            `network: ${name} is configured to be indexed (index=true) in .env, but its rpcHost is invalid (${url})`,
          );
        }
      }

      Object.entries(cfg).forEach(([field, value]) => {
        if (value === undefined || value === null || value === "") {
          throw new Error(
            `network: ${name} has an empty or missing value for the field: ${field}`,
          );
        }
      });
    }

    return nets;
  } catch (e) {
    throw new Error(
      `failed to parse json in NETWORKS .env variable. Error: ${e}`,
    );
  }
}

function isValidUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch (e) {
    return false;
  }
}

export default {
  CROW_INDEXER_HOST: getEnvVar("CROW_INDEXER_HOST"),
  PORT: getEnvVar("PORT"),
  NETWORKS: getValidateNetworks("NETWORKS"),
  TIME: parseInt(getEnvVar("TIME", "10000")), // default 10 seconds
  HASURA_GRAPHQL_URL: getEnvVar("HASURA_GRAPHQL_URL"),
  HASURA_GRAPHQL_ADMIN_SECRET: getEnvVar("HASURA_GRAPHQL_ADMIN_SECRET"),
};
