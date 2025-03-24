export type EventName =
  | "Pay"
  | "Release"
  | "Refund"
  | "Challenge"
  | "SettlementOffer"
  | "ApproveOffer"
  | "ArbitratorProposed"
  | "ArbitratorApproved"
  | "Arbitrated"
  | "ClaimMultiple"
  | "Claim";

export type EventMutationInput = {
  chain_id: string;
  name: EventName;
  transaction_hash: string;
  block_number: number;
  escrow_id: string;
  buyer?: string;
  seller?: string;
  currency?: string | null;
  amount?: string | null;
  marketplace?: string;
  marketplace_fee?: string | null;
  split_seller?: number | null;
  split_buyer?: number | null;
  split_protocol?: number | null;
  split_marketplace?: number | null;
  consensus_seller?: number | null;
  consensus_buyer?: number | null;
  challenge_period?: number | null;
  challenge_period_start?: number | null;
  challenge_period_end?: number | null;
  challenge_period_extension?: number | null;
  created_at?: number | null;
  arbitrator?: string | null;
  arbitrator_fee?: string | null;
  latest_settlement_offer_address?: string | null;
  latest_settlement_offer_seller?: number | null;
  latest_settlement_offer_buyer?: number | null;
  amount_seller?: string | null;
  amount_buyer?: string | null;
  amount_protocol?: string | null;
  amount_arbitrator?: string | null;
  amount_marketplace?: string | null;
  payment_reference?: string | null;
};

export interface IEvent {
  fragment: {
    name: EventName;
  };
  transactionHash: string;
  blockNumber: number;
  args: any;
}
