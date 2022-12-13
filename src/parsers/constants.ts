// Values and fields based on the Contract

enum CONSENSUS {
  Buyer = 0,
  Seller = 1
}

enum SPLIT {
  Buyer = 0,
  Seller = 1,
  Marketplace = 2,
  Protocol = 3,
  Arbitrator = 4
}

enum Event {
  Pay = 'Pay',
  Release = 'Release',
  Refund = 'Refund',
  Challenge = 'Challenge',
  SettlementOffer = 'SettlementOffer',
  ApproveOffer = 'ApproveOffer',
  ArbitratorProposed = 'ArbitratorProposed',
  ArbitratorApproved = 'ArbitratorApproved',
  Arbitrated = 'Arbitrated',
  ClaimMultiple = 'ClaimMultiple',
  Claim = 'Claim'
}

const _EVENTS = [
  Event.Pay,
  Event.Release,
  Event.Refund,
  Event.Challenge,
  Event.SettlementOffer,
  Event.ApproveOffer,
  Event.ArbitratorProposed,
  Event.ArbitratorApproved,
  Event.Arbitrated,
  Event.ClaimMultiple,
  Event.Claim
]

export { CONSENSUS, SPLIT, Event, _EVENTS }
