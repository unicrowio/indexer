import { CONSENSUS, Event, SPLIT } from "./constants.js";
import logger from "../infra/logger.js";
import { EventMutationInput, IEvent } from "../types/index.js";

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
  PAYMENT_REFERENCE: 12,
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
    escrow_id: Number(escrow_id),
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
      transaction_hash: `${e.transactionHash}_${escrow_id.toString()}`,
      block_number: e.blockNumber,
      escrow_id: Number(escrow_id),
      amount_buyer: amount_buyer.toString(),
      amount_seller: amount_seller.toString(),
      amount_marketplace: amount_marketplace.toString(),
      amount_protocol: amount_protocol.toString(),
      amount_arbitrator: amount_arbitrator.toString(),
    };
  });
};

export const parse = (e: IEvent) => {
  logger.info(`👉🏼 Parsing event: ${e.fragment.name}`);

  const event = e.fragment.name;

  if (event === Event.ClaimMultiple) {
    return parseClaimMultiple(e);
  }
  if (event === Event.Claim) {
    return parseClaim(e);
  }

  const escrow_id = Number(e.args.escrowId);
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
  const consensus = escrow?.[position.CONSENSUS];
  const split = escrow?.[position.SPLIT];

  const amount = escrow?.[position.AMOUNT];
  const payment_reference = escrow?.[position.PAYMENT_REFERENCE];
  const currency = escrow?.[position.CURRENCY];
  const marketplace = escrow?.[position.MARKETPLACE];
  const marketplace_fee = escrow?.[position.MARKETPLACE_FEE];
  const challenge_period = challengePeriod
    ? Number(challengePeriod)
    : undefined;
  const challenge_period_start = escrow?.[position.CHALLENGE_PERIOD_START]
    ? Number(escrow?.[position.CHALLENGE_PERIOD_START])
    : undefined;
  const challenge_period_end = escrow?.[position.CHALLENGE_PERIOD_END]
    ? Number(escrow?.[position.CHALLENGE_PERIOD_END])
    : undefined;
  const challenge_period_extension = escrow?.[
    position.CHALLENGE_PERIOD_OR_EXTENSION
  ]
    ? Number(escrow?.[position.CHALLENGE_PERIOD_OR_EXTENSION])
    : undefined;

  const created_at = Number(blockTime);
  const buyer = escrow?.[position.BUYER];
  const seller = escrow?.[position.SELLER];
  const _arbitrator = arbitrator === ZERO_ADDRESS ? undefined : arbitrator;
  const arbitrator_fee =
    arbitrator === ZERO_ADDRESS ? undefined : arbitratorFee?.toString();

  const latest_settlement_offer_address =
    whoMadelatestSettlementOffer || undefined;
  const latest_settlement_offer_buyer: number | undefined =
    latestSettlementOffer ? Number(latestSettlementOffer[0]) : undefined;
  const latest_settlement_offer_seller: number | undefined =
    latestSettlementOffer ? Number(latestSettlementOffer[1]) : undefined;

  const consensus_buyer = consensus && Number(consensus[CONSENSUS.Buyer]);
  const consensus_seller = consensus && Number(consensus[CONSENSUS.Seller]);

  const split_buyer = split && Number(split[SPLIT.Buyer]);
  const split_seller = split && Number(split[SPLIT.Seller]);
  const split_marketplace = split && Number(split[SPLIT.Marketplace]);
  const split_protocol = split && Number(split[SPLIT.Protocol]);

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
    marketplace: marketplace === ZERO_ADDRESS ? undefined : marketplace,
    currency,
    created_at,
    amount: amount?.toString(),
    split_buyer,
    split_seller,
    split_marketplace,
    split_protocol,
    consensus_buyer,
    consensus_seller,
    marketplace_fee: marketplace_fee?.toString(),
    challenge_period,
    challenge_period_start,
    challenge_period_end,
    challenge_period_extension,
    arbitrator: _arbitrator || undefined,
    arbitrator_fee: arbitrator_fee || undefined,
    latest_settlement_offer_address,
    latest_settlement_offer_buyer,
    latest_settlement_offer_seller,
    ..._amounts,
    payment_reference,
  };

  return variables;
};
