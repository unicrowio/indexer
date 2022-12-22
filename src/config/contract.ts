import env from "../env";
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
import { ethers } from "ethers";
export const getProvider = () => {
  const provider = new ethers.providers.JsonRpcProvider(env.RPC_HOST);
  return provider;
};

interface IContracts {
  unicrow: Unicrow;
  unicrowDispute: UnicrowDispute;
  unicrowArbitrator: UnicrowArbitrator;
  unicrowClaim: UnicrowClaim;
}

export const getContracts = (): IContracts => {
  const provider = getProvider();

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
