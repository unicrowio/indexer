CREATE TABLE "public"."last_block_number" ("chain_id" text NOT NULL, "block_number" integer NOT NULL, PRIMARY KEY ("chain_id") , UNIQUE ("chain_id"));

CREATE TABLE "public"."events" ("id" serial NOT NULL, "chain_id" text NOT NULL, "name" text NOT NULL, "transaction_hash" text NOT NULL,
"block_number" integer NOT NULL, "escrow_id" numeric NOT NULL, "buyer" text, "seller" text,
"currency" text, "amount" numeric, "split_seller" integer, "split_buyer" integer, "split_marketplace" integer,
"split_protocol" integer, "consensus_seller" integer, "consensus_buyer" integer,
"marketplace" text, "marketplace_fee" numeric, "challenge_period" numeric null, "challenge_period_start" numeric null,
"challenge_period_end" numeric null,"challenge_period_extension" numeric null,
"created_at" integer null, "arbitrator" text null, "arbitrator_fee" numeric null, "arbitrator_proposer" text null,
"latest_settlement_offer_address" text null, "latest_settlement_offer_seller" integer null, "latest_settlement_offer_buyer" integer null,
"amount_seller" numeric null, "amount_buyer" numeric null, "amount_protocol" numeric null, "amount_arbitrator" numeric null,
"amount_marketplace" numeric null, "payment_reference" text null, PRIMARY KEY ("id", "transaction_hash"), UNIQUE ("id"));

CREATE  INDEX "buyer_indexer" ON
  "public"."events" using btree ("buyer");

CREATE  INDEX "seller_indexer" ON
  "public"."events" using btree ("seller");

CREATE  INDEX "escrowid-indexer" ON
  "public"."events" using btree ("escrow_id");

CREATE OR REPLACE FUNCTION generate_random_id(length integer)
RETURNS text AS $$
DECLARE
  alphabet text;
  nid text := '';
  i integer;
BEGIN
  LOOP
    nid := '';
    alphabet := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    FOR i IN 1..length LOOP
      nid := nid || substr(alphabet, floor(random() * length(alphabet) + 1)::integer, 1);
    END LOOP;
    
    CONTINUE WHEN nid IN (SELECT id FROM escrow_status WHERE id = nid);
    
    RETURN nid;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE "public"."escrow_status" ("id" text default generate_random_id(6) NOT NULL, "chain_id" text NOT NULL, "name" text NOT NULL, "escrow_id" numeric null, "transaction_hash" text null, "block_number" integer, "deposit_transaction_hash" text null,
 "buyer" text null, "seller" text NOT NULL, "currency" text NOT NULL, "amount" numeric NOT NULL, "split_seller" integer,
 "split_buyer" integer, "split_marketplace" integer, "split_protocol" integer, "consensus_seller" integer null,
 "consensus_buyer" integer null, "marketplace" text null, "marketplace_fee" numeric null,
 "arbitrator" text null, "arbitrator_fee" numeric null, "arbitrator_proposer" text null, "status_arbitration" text null, "challenge_period" numeric null, "challenge_period_start" numeric null,
 "challenge_period_end" numeric null,"challenge_period_extension" numeric null, "created_at" date default now(), "paid_at" integer null, "released_at" integer null,
 "refunded_at" integer null, "settled_at" integer null, "challenged_at" integer null,
 "claimed" boolean NOT NULL DEFAULT false, "arbitrated" boolean NOT NULL DEFAULT false,
 "latest_settlement_offer_address" text null, "latest_settlement_offer_seller" integer null, "latest_settlement_offer_buyer" integer null,
 "amount_seller" numeric null, "amount_buyer" numeric null, "amount_protocol" numeric null, "amount_arbitrator" numeric null,
 "amount_marketplace" numeric null, "payment_reference" text null, PRIMARY KEY ("id"), UNIQUE ("id"), UNIQUE ("deposit_transaction_hash"));

CREATE OR REPLACE FUNCTION update_escrow_status()
  RETURNS trigger AS $BODY$
  DECLARE
    escrow_rec        escrow_status%rowtype;
    _status_arbitration text DEFAULT NULL;
    v_transaction_hash text;
    v_name             text;
  BEGIN
  IF NEW.name = 'Pay' THEN
    IF NEW.arbitrator IS NOT NULL THEN
      _status_arbitration = 'ArbitratorApproved';
    END IF;

    INSERT INTO escrow_status AS escrows("chain_id", "name", "transaction_hash", "escrow_id", "buyer", "seller", "currency", "amount", "split_seller", "split_buyer", "split_marketplace", "split_protocol", "consensus_seller", "consensus_buyer", "marketplace", "marketplace_fee", "arbitrator", "arbitrator_fee", "arbitrator_proposer","status_arbitration", "challenge_period", "challenge_period_start", "challenge_period_end", "challenge_period_extension", "block_number", "paid_at", "created_at", "claimed", "deposit_transaction_hash", "payment_reference")
    VALUES (NEW.chain_id, NEW.name, NEW.transaction_hash, NEW.escrow_id, NEW.buyer, NEW.seller, NEW.currency, NEW.amount, NEW.split_seller, NEW.split_buyer, NEW.split_marketplace, NEW.split_protocol, NEW.consensus_seller, NEW.consensus_buyer, NEW.marketplace, NEW.marketplace_fee, NEW.arbitrator, NEW.arbitrator_fee, NEW.arbitrator_proposer, _status_arbitration, NEW.challenge_period, NEW.challenge_period_start, NEW.challenge_period_end, NEW.challenge_period_extension, NEW.block_number, NEW.created_at, to_timestamp(NEW.created_at)::date, false, NEW.transaction_hash, NEW.payment_reference)
    ON CONFLICT ("deposit_transaction_hash")
    DO UPDATE SET chain_id = EXCLUDED.chain_id, name = EXCLUDED.name, transaction_hash = EXCLUDED.transaction_hash, escrow_id = EXCLUDED.escrow_id, buyer = EXCLUDED.buyer, seller = EXCLUDED.seller, currency = EXCLUDED.currency, amount = EXCLUDED.amount, split_seller = EXCLUDED.split_seller, split_buyer = EXCLUDED.split_buyer, split_marketplace = EXCLUDED.split_marketplace, split_protocol = EXCLUDED.split_protocol, consensus_seller = EXCLUDED.consensus_seller, consensus_buyer = EXCLUDED.consensus_buyer, marketplace = EXCLUDED.marketplace, marketplace_fee = EXCLUDED.marketplace_fee, arbitrator = EXCLUDED.arbitrator, arbitrator_proposer = EXCLUDED.arbitrator_proposer, status_arbitration = EXCLUDED.status_arbitration, challenge_period = EXCLUDED.challenge_period, challenge_period_start = EXCLUDED.challenge_period_start, challenge_period_end = EXCLUDED.challenge_period_end, challenge_period_extension = EXCLUDED.challenge_period_extension, block_number = EXCLUDED.block_number, paid_at = EXCLUDED.paid_at, claimed = false, amount_seller = EXCLUDED.amount_seller, amount_buyer = EXCLUDED.amount_buyer, amount_protocol = EXCLUDED.amount_protocol, amount_arbitrator = EXCLUDED.amount_arbitrator, amount_marketplace = EXCLUDED.amount_marketplace, deposit_transaction_hash = EXCLUDED.transaction_hash;

  ELSE
    SELECT * INTO escrow_rec FROM escrow_status es WHERE es.escrow_id = NEW.escrow_id AND es.chain_id = NEW.chain_id;
    IF NOT FOUND THEN
      RETURN NEW;
    END IF;

    -- if the current block number is greater than the new event block number, then it's out of date, don't need to update
    IF escrow_rec.block_number > NEW.block_number THEN
      RAISE NOTICE 'BLOCK NUMBER ALREADY UPDATED';
      RETURN NEW;
    END IF;

    -- prepare variables for common fields
    v_transaction_hash := CASE
                            WHEN NEW.name = 'Claim' THEN split_part(NEW.transaction_hash, '_', 1)
                            ELSE NEW.transaction_hash
                          END;

    v_name := CASE
                WHEN NEW.name = 'ApproveOffer' THEN 'Settled'
                ELSE NEW.name
              END;

    CASE NEW.name
      WHEN 'Release' THEN
        UPDATE escrow_status SET transaction_hash = v_transaction_hash, block_number = NEW.block_number, name = v_name, split_seller = NEW.split_seller, split_buyer = NEW.split_buyer, split_marketplace = NEW.split_marketplace, split_protocol = NEW.split_protocol, consensus_seller = NEW.consensus_seller, consensus_buyer = NEW.consensus_buyer, released_at = NEW.created_at, claimed = true, amount_seller = NEW.amount_seller, amount_buyer = NEW.amount_buyer, amount_protocol = NEW.amount_protocol, amount_arbitrator = NEW.amount_arbitrator, amount_marketplace = NEW.amount_marketplace WHERE escrow_id = escrow_rec.escrow_id AND chain_id = escrow_rec.chain_id;

      WHEN 'Refund' THEN
        UPDATE escrow_status SET transaction_hash = v_transaction_hash, block_number = NEW.block_number, name = v_name, split_seller = NEW.split_seller, split_buyer = NEW.split_buyer, split_marketplace = NEW.split_marketplace, split_protocol = NEW.split_protocol, consensus_seller = NEW.consensus_seller, consensus_buyer = NEW.consensus_buyer, refunded_at = NEW.created_at, claimed = true WHERE escrow_id = escrow_rec.escrow_id AND chain_id = escrow_rec.chain_id;

      WHEN 'Challenge' THEN
        UPDATE escrow_status SET transaction_hash = v_transaction_hash, block_number = NEW.block_number, name = v_name, split_seller = NEW.split_seller, split_buyer = NEW.split_buyer, split_marketplace = NEW.split_marketplace, split_protocol = NEW.split_protocol, consensus_seller = NEW.consensus_seller, consensus_buyer = NEW.consensus_buyer, challenged_at = NEW.created_at, challenge_period_start = NEW.challenge_period_start, challenge_period_end = NEW.challenge_period_end, claimed = false WHERE escrow_id = escrow_rec.escrow_id AND chain_id = escrow_rec.chain_id;

      WHEN 'SettlementOffer' THEN
        UPDATE escrow_status SET transaction_hash = v_transaction_hash, block_number = NEW.block_number, name = v_name, latest_settlement_offer_address = NEW.latest_settlement_offer_address, latest_settlement_offer_seller = NEW.latest_settlement_offer_seller, latest_settlement_offer_buyer = NEW.latest_settlement_offer_buyer WHERE escrow_id = escrow_rec.escrow_id AND chain_id = escrow_rec.chain_id;

      WHEN 'ApproveOffer' THEN
        UPDATE escrow_status SET transaction_hash = v_transaction_hash, block_number = NEW.block_number, name = v_name, settled_at = NEW.created_at, split_seller = NEW.latest_settlement_offer_seller, split_buyer = NEW.latest_settlement_offer_buyer, latest_settlement_offer_seller = NEW.latest_settlement_offer_seller, latest_settlement_offer_buyer = NEW.latest_settlement_offer_buyer, claimed = true, amount_seller = NEW.amount_seller, amount_buyer = NEW.amount_buyer, amount_protocol = NEW.amount_protocol, amount_arbitrator = NEW.amount_arbitrator, amount_marketplace = NEW.amount_marketplace WHERE escrow_id = escrow_rec.escrow_id AND chain_id = escrow_rec.chain_id;

      WHEN 'ArbitratorProposed' THEN
        UPDATE escrow_status SET transaction_hash = v_transaction_hash, block_number = NEW.block_number, arbitrator = NEW.arbitrator, arbitrator_fee = NEW.arbitrator_fee, arbitrator_proposer = NEW.arbitrator_proposer, status_arbitration = NEW.name WHERE escrow_id = escrow_rec.escrow_id AND chain_id = escrow_rec.chain_id;

      WHEN 'ArbitratorApproved' THEN
        UPDATE escrow_status SET transaction_hash = v_transaction_hash, block_number = NEW.block_number, arbitrator = NEW.arbitrator, arbitrator_fee = NEW.arbitrator_fee, status_arbitration = NEW.name WHERE escrow_id = escrow_rec.escrow_id AND chain_id = escrow_rec.chain_id;

      WHEN 'Claim' THEN
        UPDATE escrow_status SET transaction_hash = v_transaction_hash, block_number = NEW.block_number, claimed = true, amount_seller = NEW.amount_seller, amount_buyer = NEW.amount_buyer, amount_protocol = NEW.amount_protocol, amount_arbitrator = NEW.amount_arbitrator, amount_marketplace = NEW.amount_marketplace WHERE escrow_id = escrow_rec.escrow_id AND chain_id = escrow_rec.chain_id;

      WHEN 'Arbitrated' THEN
        UPDATE escrow_status SET
          transaction_hash = v_transaction_hash,
          block_number = NEW.block_number,
          split_seller = NEW.split_seller,
          split_buyer = NEW.split_buyer,
          split_marketplace = NEW.split_marketplace,
          split_protocol = NEW.split_protocol,
          consensus_seller = NEW.consensus_seller,
          consensus_buyer = NEW.consensus_buyer,
          claimed = true,
          arbitrated = true,
          refunded_at = CASE WHEN NEW.split_buyer > 0 AND NEW.split_seller <= 0 THEN NEW.created_at ELSE refunded_at END,
          released_at = CASE WHEN NEW.split_buyer <= 0 AND NEW.split_seller > 0 THEN NEW.created_at ELSE released_at END,
          settled_at = CASE WHEN NEW.split_buyer > 0 AND NEW.split_seller > 0 THEN NEW.created_at ELSE settled_at END,
          amount_seller = NEW.amount_seller,
          amount_buyer = NEW.amount_buyer,
          amount_protocol = NEW.amount_protocol,
          amount_arbitrator = NEW.amount_arbitrator,
          amount_marketplace = NEW.amount_marketplace
        WHERE escrow_id = escrow_rec.escrow_id AND chain_id = escrow_rec.chain_id;

      ELSE
        RETURN NEW;
    END CASE;
  END IF;
  RETURN NEW;
  END;
  $BODY$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_escrow_status_trigger on "events";

CREATE TRIGGER update_escrow_status_trigger AFTER INSERT ON "events" FOR EACH ROW EXECUTE PROCEDURE update_escrow_status();

CREATE OR REPLACE VIEW "public"."escrow_status_view" AS
select e.*,
    CASE
        WHEN e.challenge_period_end < cast(extract(epoch from now()) as integer) AND (e.name != 'Release' AND e.name != 'Refund' AND e.name != 'Settled') THEN 'PERIOD_EXPIRED'
        WHEN e.name = 'Pay' THEN 'PAID'
        WHEN e.name = 'Release' THEN 'RELEASED'
        WHEN e.name = 'Refund' THEN 'REFUNDED'
        WHEN e.name = 'Challenge' THEN 'CHALLENGED'
        WHEN e.name = 'SettlementOffer' THEN 'SETTLEMENT'
        WHEN e.name = 'Settled' THEN 'SETTLED'
        ELSE UPPER(e.name)
    END status
from escrow_status e;
