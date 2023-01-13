CREATE TABLE "public"."last_block_number" ("id" serial NOT NULL, "block_number" integer NOT NULL, PRIMARY KEY ("id") , UNIQUE ("id"));

CREATE TABLE "public"."marketplace" ("address" text NOT NULL, PRIMARY KEY ("address") , UNIQUE ("address"));

INSERT INTO marketplace (address) VALUES ('*'); -- Add your marketplace address, * you will get events from all marketplaces. Duplicate the line to add more
INSERT INTO last_block_number (block_number) VALUES (0); -- replace 0 with the block number from which the indexing should start (if you're deploying a new app, than most probably the latest block)

CREATE TABLE "public"."events" ("id" serial NOT NULL, "name" text NOT NULL, "transaction_hash" text NOT NULL,
"block_number" integer NOT NULL, "escrow_id" numeric NOT NULL, "buyer" text, "seller" text,
"currency" text, "amount" numeric, "split_seller" integer, "split_buyer" integer, "split_marketplace" integer,
"split_protocol" integer, "consensus_seller" integer, "consensus_buyer" integer,
"marketplace" text, "marketplace_fee" numeric, "challenge_period" numeric null, "challenge_period_start" numeric null,
"challenge_period_end" numeric null,"challenge_period_extension" numeric null,
"created_at" integer null, "arbitrator" text null, "arbitrator_fee" numeric null, "arbitrator_proposer" text null,
"latest_settlement_offer_address" text null, "latest_settlement_offer_seller" integer null, "latest_settlement_offer_buyer" integer null,
"amount_seller" numeric null, "amount_buyer" numeric null, "amount_protocol" numeric null, "amount_arbitrator" numeric null,
"amount_marketplace" numeric null, PRIMARY KEY ("id", "transaction_hash"), UNIQUE ("id"));

CREATE  INDEX "buyer_indexer" ON
  "public"."events" using btree ("buyer");

CREATE  INDEX "seller_indexer" ON
  "public"."events" using btree ("seller");

CREATE  INDEX "escrowid-indexer" ON
  "public"."events" using btree ("escrow_id");




CREATE TABLE "public"."escrow_status" ("name" text NOT NULL, "escrow_id" numeric NOT NULL, "transaction_hash" text NOT NULL, "block_number" integer, "deposit_transaction_hash" text NOT NULL,
 "buyer" text NOT NULL, "seller" text NOT NULL, "currency" text NOT NULL, "amount" numeric NOT NULL, "split_seller" integer,
 "split_buyer" integer, "split_marketplace" integer, "split_protocol" integer, "consensus_seller" integer null,
 "consensus_buyer" integer null, "marketplace" text null, "marketplace_fee" numeric null,
 "arbitrator" text null, "arbitrator_fee" numeric null, "arbitrator_proposer" text null, "status_arbitration" text null, "challenge_period" numeric null, "challenge_period_start" numeric null,
"challenge_period_end" numeric null,"challenge_period_extension" numeric null, "paid_at" integer null, "released_at" integer null,
 "refunded_at" integer null, "settled_at" integer null, "challenged_at" integer null,
 "claimed" boolean NOT NULL DEFAULT false, "arbitrated" boolean NOT NULL DEFAULT false,
 "latest_settlement_offer_address" text null, "latest_settlement_offer_seller" integer null, "latest_settlement_offer_buyer" integer null,
 "amount_seller" numeric null, "amount_buyer" numeric null, "amount_protocol" numeric null, "amount_arbitrator" numeric null,
 "amount_marketplace" numeric null, PRIMARY KEY ("escrow_id"), UNIQUE ("escrow_id"), UNIQUE ("deposit_transaction_hash"));




CREATE OR REPLACE FUNCTION update_escrow_status()
    RETURNS trigger AS $BODY$
    DECLARE escrow escrow_status%rowtype;
    DECLARE status_arbitration text DEFAULT NULL;

    BEGIN
    DROP TABLE IF EXISTS escrow;

    IF NEW.name = 'Pay' THEN
        status_arbitration = NEW.arbitrator;
        IF status_arbitration IS NOT NULL THEN
            status_arbitration = 'ArbitratorApproved';
        END IF;
        INSERT INTO escrow_status("name", "transaction_hash", "escrow_id", "buyer", "seller", "currency", "amount", "split_seller", "split_buyer", "split_marketplace", "split_protocol", "consensus_seller", "consensus_buyer", "marketplace", "marketplace_fee", "arbitrator", "arbitrator_fee", "arbitrator_proposer","status_arbitration", "challenge_period", "challenge_period_start", "challenge_period_end", "challenge_period_extension", "block_number", "paid_at", "claimed", "deposit_transaction_hash")
        VALUES (NEW.name, NEW.transaction_hash, NEW.escrow_id, NEW.buyer, NEW.seller, NEW.currency, NEW.amount, NEW.split_seller, NEW.split_buyer, NEW.split_marketplace, NEW.split_protocol, NEW.consensus_seller, NEW.consensus_buyer, NEW.marketplace, NEW.marketplace_fee, NEW.arbitrator, NEW.arbitrator_fee, NEW.arbitrator_proposer, status_arbitration, NEW.challenge_period, NEW.challenge_period_start, NEW.challenge_period_end, NEW.challenge_period_extension, NEW.block_number, NEW.created_at, false, NEW.transaction_hash);
    ELSE
        SELECT * INTO escrow FROM escrow_status es where es.escrow_id = NEW.escrow_id;
        -- fallback - If the current block number is greater than the new event block number, then it out of date, don't need to update
        IF escrow.block_number > NEW.block_number THEN
           RAISE NOTICE 'BLOCK NUMBER ALREADY UPDATED';
            RETURN NULL;
        END IF;
        -- don't allow to update status if the block_number is lower than what is comming to event.
        CASE
            WHEN NEW.name = 'Release' THEN
             UPDATE escrow_status SET transaction_hash = NEW.transaction_hash, block_number = NEW.block_number, name = NEW.name, split_seller = NEW.split_seller, split_buyer = NEW.split_buyer, split_marketplace = NEW.split_marketplace, split_protocol = NEW.split_protocol, consensus_seller = NEW.consensus_seller, consensus_buyer = NEW.consensus_buyer, released_at = NEW.created_at, claimed = true, amount_seller = NEW.amount_seller, amount_buyer = NEW.amount_buyer, amount_protocol = NEW.amount_protocol, amount_arbitrator = NEW.amount_arbitrator, amount_marketplace = NEW.amount_marketplace WHERE escrow_id = escrow.escrow_id;

            WHEN NEW.name = 'Refund' THEN
             UPDATE escrow_status SET transaction_hash = NEW.transaction_hash, block_number = NEW.block_number, name = NEW.name, split_seller = NEW.split_seller, split_buyer = NEW.split_buyer, split_marketplace = NEW.split_marketplace, split_protocol = NEW.split_protocol, consensus_seller = NEW.consensus_seller, consensus_buyer = NEW.consensus_buyer, refunded_at = NEW.created_at, claimed = true WHERE escrow_id = escrow.escrow_id;

            WHEN NEW.name = 'Challenge' THEN
             UPDATE escrow_status SET transaction_hash = NEW.transaction_hash, block_number = NEW.block_number, name = NEW.name, split_seller = NEW.split_seller, split_buyer = NEW.split_buyer, split_marketplace = NEW.split_marketplace, split_protocol = NEW.split_protocol, consensus_seller = NEW.consensus_seller, consensus_buyer = NEW.consensus_buyer, challenged_at = NEW.created_at, challenge_period_start = NEW.challenge_period_start,  challenge_period_end = NEW.challenge_period_end, claimed = false WHERE escrow_id = escrow.escrow_id;

            WHEN NEW.name = 'SettlementOffer' THEN
             UPDATE escrow_status SET transaction_hash = NEW.transaction_hash, block_number = NEW.block_number, name = NEW.name, latest_settlement_offer_address = NEW.latest_settlement_offer_address, latest_settlement_offer_seller = NEW.latest_settlement_offer_seller, latest_settlement_offer_buyer = NEW.latest_settlement_offer_buyer WHERE escrow_id = escrow.escrow_id;

            WHEN NEW.name = 'ApproveOffer' THEN
             UPDATE escrow_status SET transaction_hash = NEW.transaction_hash, block_number = NEW.block_number, name = 'Settled', settled_at = NEW.created_at, split_seller = NEW.latest_settlement_offer_seller, split_buyer = NEW.latest_settlement_offer_buyer,  latest_settlement_offer_seller = NEW.latest_settlement_offer_seller, latest_settlement_offer_buyer = NEW.latest_settlement_offer_buyer, claimed = true, amount_seller = NEW.amount_seller, amount_buyer = NEW.amount_buyer, amount_protocol = NEW.amount_protocol, amount_arbitrator = NEW.amount_arbitrator, amount_marketplace = NEW.amount_marketplace WHERE escrow_id = escrow.escrow_id;

            WHEN NEW.name = 'ArbitratorProposed' THEN
             UPDATE escrow_status SET transaction_hash = NEW.transaction_hash, block_number = NEW.block_number, arbitrator = NEW.arbitrator, arbitrator_fee = NEW.arbitrator_fee, arbitrator_proposer = NEW.arbitrator_proposer, status_arbitration = NEW.name WHERE escrow_id = escrow.escrow_id;

            WHEN NEW.name = 'ArbitratorApproved' THEN
             UPDATE escrow_status SET transaction_hash = NEW.transaction_hash, block_number = NEW.block_number, arbitrator = NEW.arbitrator, arbitrator_fee = NEW.arbitrator_fee, status_arbitration = NEW.name WHERE escrow_id = escrow.escrow_id;

            WHEN NEW.name = 'Claim' THEN
             UPDATE escrow_status SET transaction_hash = split_part(NEW.transaction_hash, '_', 1), block_number = NEW.block_number, claimed = true, amount_seller = NEW.amount_seller, amount_buyer = NEW.amount_buyer, amount_protocol = NEW.amount_protocol, amount_arbitrator = NEW.amount_arbitrator, amount_marketplace = NEW.amount_marketplace WHERE escrow_id = escrow.escrow_id;

            WHEN NEW.name = 'Arbitrated' THEN
              IF NEW.split_buyer > 0 AND NEW.split_seller <= 0 THEN
                  UPDATE escrow_status SET transaction_hash = NEW.transaction_hash, block_number = NEW.block_number, split_seller = NEW.split_seller, split_buyer = NEW.split_buyer, split_marketplace = NEW.split_marketplace, split_protocol = NEW.split_protocol, consensus_seller = NEW.consensus_seller, consensus_buyer = NEW.consensus_buyer, claimed = true, arbitrated = true, refunded_at = NEW.created_at, amount_seller = NEW.amount_seller, amount_buyer = NEW.amount_buyer, amount_protocol = NEW.amount_protocol, amount_arbitrator = NEW.amount_arbitrator, amount_marketplace = NEW.amount_marketplace WHERE escrow_id = escrow.escrow_id;
              END IF;
              IF NEW.split_buyer <= 0 AND NEW.split_seller > 0 THEN
                  UPDATE escrow_status SET transaction_hash = NEW.transaction_hash, block_number = NEW.block_number, split_seller = NEW.split_seller, split_buyer = NEW.split_buyer, split_marketplace = NEW.split_marketplace, split_protocol = NEW.split_protocol, consensus_seller = NEW.consensus_seller, consensus_buyer = NEW.consensus_buyer, claimed = true, arbitrated = true, released_at = NEW.created_at, amount_seller = NEW.amount_seller, amount_buyer = NEW.amount_buyer, amount_protocol = NEW.amount_protocol, amount_arbitrator = NEW.amount_arbitrator, amount_marketplace = NEW.amount_marketplace WHERE escrow_id = escrow.escrow_id;
              END IF;
              IF NEW.split_buyer > 0 AND NEW.split_seller > 0 THEN
                  UPDATE escrow_status SET transaction_hash = NEW.transaction_hash, block_number = NEW.block_number, split_seller = NEW.split_seller, split_buyer = NEW.split_buyer, split_marketplace = NEW.split_marketplace, split_protocol = NEW.split_protocol, consensus_seller = NEW.consensus_seller, consensus_buyer = NEW.consensus_buyer, claimed = true, arbitrated = true, settled_at = NEW.created_at, amount_seller = NEW.amount_seller, amount_buyer = NEW.amount_buyer, amount_protocol = NEW.amount_protocol, amount_arbitrator = NEW.amount_arbitrator, amount_marketplace = NEW.amount_marketplace WHERE escrow_id = escrow.escrow_id;
              END IF;
            ELSE
               RETURN NULL;
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
        WHEN e.challenge_period_end < cast(extract(epoch from now()) as integer) AND (e.name != 'Release' AND e.name != 'Refund') THEN 'PERIOD_EXPIRED'
        WHEN e.name = 'Pay' THEN 'PAID'
        WHEN e.name = 'Release' THEN 'RELEASED'
        WHEN e.name = 'Refund' THEN 'REFUNDED'
        WHEN e.name = 'Challenge' THEN 'CHALLENGED'
        WHEN e.name = 'SettlementOffer' THEN 'SETTLEMENT'
        WHEN e.name = 'Settled' THEN 'SETTLED'
        ELSE UPPER(e.name)
    END status
from escrow_status e;



CREATE OR REPLACE FUNCTION check_marketplace_address()
    RETURNS trigger AS $BODY$

    BEGIN

        IF EXISTS (SELECT FROM marketplace m WHERE m.address = '*') THEN 
            RETURN NEW;
        END IF;

        IF EXISTS (SELECT FROM marketplace m WHERE UPPER(m.address) = UPPER(NEW.marketplace)) THEN 
            RETURN NEW;
        END IF;
    
        IF EXISTS (SELECT FROM events e where e.escrow_id = NEW.escrow_id) THEN
            RETURN NEW;
        END IF;
    
        RETURN NULL;

    END;

    $BODY$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS check_marketplace_address_trigger on "events";

CREATE TRIGGER check_marketplace_address_trigger BEFORE INSERT ON "events" FOR EACH ROW EXECUTE PROCEDURE check_marketplace_address();
