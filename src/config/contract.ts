import { ethers } from "ethers";
import {
  Unicrow__factory,
  UnicrowDispute__factory,
  Unicrow,
  UnicrowDispute,
  UnicrowArbitrator,
  UnicrowArbitrator__factory,
  UnicrowClaim,
  UnicrowClaim__factory,
} from "@unicrowio/ethers-types";

import env from "../env";

export const getProvider = () => {
  const provider = new ethers.providers.JsonRpcProvider(env.RPC_HOST);
  return provider;
};

export interface IContracts {
  unicrow: Unicrow;
  unicrowDispute: UnicrowDispute;
  unicrowArbitrator: UnicrowArbitrator;
  unicrowClaim: UnicrowClaim;
}

export const getContracts = (
  provider: ethers.providers.JsonRpcProvider,
): IContracts => {
  const unicrow: Unicrow = Unicrow__factory.connect(
    env.UNICROW_ADDRESS,
    provider,
  );

  const unicrowDispute: UnicrowDispute = UnicrowDispute__factory.connect(
    env.UNICROW_DISPUTE_ADDRESS,
    provider,
  );

  const unicrowArbitrator: UnicrowArbitrator =
    UnicrowArbitrator__factory.connect(
      env.UNICROW_ARBITRATOR_ADDRESS,
      provider,
    );

  const unicrowClaim: UnicrowClaim = UnicrowClaim__factory.connect(
    env.UNICROW_CLAIM_ADDRESS,
    provider,
  );

  return { unicrow, unicrowDispute, unicrowArbitrator, unicrowClaim };
};
