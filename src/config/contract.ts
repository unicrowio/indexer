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

import { Network } from "../env.js";

export const getProvider = (rpc_host: string) => {
  const provider = new ethers.JsonRpcProvider(rpc_host);
  return provider;
};

export interface IContracts {
  unicrow: Unicrow;
  unicrowDispute: UnicrowDispute;
  unicrowArbitrator: UnicrowArbitrator;
  unicrowClaim: UnicrowClaim;
}

export const getContracts = (
  provider: ethers.JsonRpcProvider,
  network: Network,
): IContracts => {
  const unicrow: Unicrow = Unicrow__factory.connect(
    network.unicrowAddress,
    provider,
  );

  const unicrowDispute: UnicrowDispute = UnicrowDispute__factory.connect(
    network.unicrowDisputeAddress,
    provider,
  );

  const unicrowArbitrator: UnicrowArbitrator =
    UnicrowArbitrator__factory.connect(
      network.unicrowArbitratorAddress,
      provider,
    );

  const unicrowClaim: UnicrowClaim = UnicrowClaim__factory.connect(
    network.unicrowClaimAddress,
    provider,
  );

  return { unicrow, unicrowDispute, unicrowArbitrator, unicrowClaim };
};
