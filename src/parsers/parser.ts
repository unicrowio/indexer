import { CONSENSUS, Event, SPLIT } from "./constants";
import logger from "../infra/logger";
import { EventMutationInput, IEvent } from "../types";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const position = {
  BUYER: 0,
  CHALLENGE_PERIOD_OR_EXTENSION: 1,
  SELLER: 2,
  CHALLENGE_PERIOD_START: 3,
  MARKETPLACE: 4,
  MARKETPLACE_FEE: 5,
  CHALLENGE_PERIOD_END: 6,
  CURRENCY: 7,
  CLAIMED: 8,
  CONSENSUS: 9,
  SPLIT: 10,
  AMOUNT: 11,
};

const parseClaim = (e: IEvent): EventMutationInput => {
  const [escrow_id, payments] = e.args[0];

  const [
    amount_buyer,
    amount_seller,
    amount_marketplace,
    amount_protocol,
    amount_arbitrator,
  ] = payments;

  return {
    name: Event.Claim,
    transaction_hash: e.transactionHash,
    block_number: e.blockNumber,
    escrow_id: escrow_id.toString(),
    amount_buyer: amount_buyer.toString(),
    amount_seller: amount_seller.toString(),
    amount_marketplace: amount_marketplace.toString(),
    amount_protocol: amount_protocol.toString(),
    amount_arbitrator: amount_arbitrator.toString(),
  };
};

const parseClaimMultiple = (e: IEvent): EventMutationInput[] => {
  return e.args[0].map((item: any) => {
    const [escrow_id, payments] = item;

    const [
      amount_buyer,
      amount_seller,
      amount_marketplace,
      amount_protocol,
      amount_arbitrator,
    ] = payments;

    return {
      name: Event.Claim,
      transaction_hash: e.transactionHash + "_" + escrow_id.toString(),
      block_number: e.blockNumber,
      escrow_id: escrow_id.toString(),
      amount_buyer: amount_buyer.toString(),
      amount_seller: amount_seller.toString(),
      amount_marketplace: amount_marketplace.toString(),
      amount_protocol: amount_protocol.toString(),
      amount_arbitrator: amount_arbitrator.toString(),
    };
  });
};

export const parse = (e: IEvent) => {
  logger.info(`👉🏼 Parsing event: ${e.event}`);

  const event = e.event;

  if (event === Event.ClaimMultiple) {
    return parseClaimMultiple(e);
  }
  if (event === Event.Claim) {
    return parseClaim(e);
  }

  const escrow_id = "escrowId" in e.args && e.args.escrowId.toNumber();
  const escrow = e.args.escrow;
  const transactionHash = e.transactionHash;
  const blockNumber = e.blockNumber;
  const blockTime = e.args.blockTime;
  const arbitrator = e.args.arbitrator;
  const arbitratorFee = e.args.arbitratorFee;
  const latestSettlementOffer = e.args?.latestSettlementOffer;
  const whoMadelatestSettlementOffer = e.args?.latestSettlementOfferBy;
  const challengePeriod = e.args?.challengePeriod;
  const amounts = e.args?.amounts;

  const name = event;
  const transaction_hash = transactionHash;
  const block_number = blockNumber;
  const consensus = escrow && escrow[position.CONSENSUS];
  const split = escrow && escrow[position.SPLIT];

  const amount = escrow && escrow[position.AMOUNT];
  const currency = escrow && escrow[position.CURRENCY];
  const marketplace = escrow && escrow[position.MARKETPLACE];
  const marketplace_fee = escrow && escrow[position.MARKETPLACE_FEE];
  const challenge_period = challengePeriod?.toNumber() || null;
  const challenge_period_start =
    escrow && escrow[position.CHALLENGE_PERIOD_START];
  const challenge_period_end = escrow && escrow[position.CHALLENGE_PERIOD_END];
  const challenge_period_extension =
    (escrow && escrow[position.CHALLENGE_PERIOD_OR_EXTENSION]?.toNumber()) ||
    null;

  const created_at = blockTime?.toNumber() || null;
  const buyer = escrow && escrow[position.BUYER];
  const seller = escrow && escrow[position.SELLER];
  const _arbitrator = arbitrator === ZERO_ADDRESS ? null : arbitrator;
  const arbitrator_fee =
    arbitrator === ZERO_ADDRESS ? null : arbitratorFee?.toString();

  const latest_settlement_offer_address = whoMadelatestSettlementOffer || null;
  const latest_settlement_offer_buyer: number | null = latestSettlementOffer
    ? latestSettlementOffer[0]
    : null;
  const latest_settlement_offer_seller: number | null = latestSettlementOffer
    ? latestSettlementOffer[1]
    : null;

  const consensus_buyer = consensus && consensus[CONSENSUS.Buyer];
  const consensus_seller = consensus && consensus[CONSENSUS.Seller];

  const split_buyer = split && split[SPLIT.Buyer];
  const split_seller = split && split[SPLIT.Seller];
  const split_marketplace = split && split[SPLIT.Marketplace];
  const split_protocol = split && split[SPLIT.Protocol];

  let _amounts: undefined | Record<string, string>;
  if (amounts) {
    const [
      amount_buyer,
      amount_seller,
      amount_marketplace,
      amount_protocol,
      amount_arbitrator,
    ] = amounts;
    _amounts = {
      amount_buyer: amount_buyer.toString(),
      amount_seller: amount_seller.toString(),
      amount_marketplace: amount_marketplace.toString(),
      amount_protocol: amount_protocol.toString(),
      amount_arbitrator: amount_arbitrator.toString(),
    };
  }

  const variables: EventMutationInput = {
    name,
    transaction_hash,
    block_number,
    escrow_id,
    buyer,
    seller,
    marketplace: marketplace === ZERO_ADDRESS ? null : marketplace,
    currency,
    created_at,
    amount: amount ? amount.toString() : amount,
    split_buyer,
    split_seller,
    split_marketplace,
    split_protocol,
    consensus_buyer,
    consensus_seller,
    marketplace_fee: marketplace_fee
      ? String(marketplace_fee)
      : marketplace_fee,
    challenge_period,
    challenge_period_start: challenge_period_start
      ? challenge_period_start.toNumber()
      : challenge_period_start,
    challenge_period_end: challenge_period_end
      ? challenge_period_end.toNumber()
      : challenge_period_end,
    challenge_period_extension,
    arbitrator: _arbitrator || null,
    arbitrator_fee: arbitrator_fee || null,
    latest_settlement_offer_address,
    latest_settlement_offer_buyer,
    latest_settlement_offer_seller,
    ..._amounts,
  };

  return variables;
};
