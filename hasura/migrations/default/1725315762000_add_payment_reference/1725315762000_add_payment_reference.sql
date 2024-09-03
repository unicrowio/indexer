-- 1725315762000_add_payment_reference.sql

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='escrow_status' 
        AND column_name='reference'
    ) THEN
        ALTER TABLE escrow_status
        RENAME COLUMN reference TO payment_reference;
    ELSE
        ALTER TABLE escrow_status
        ADD COLUMN payment_reference VARCHAR;
    END IF;
END $$;

ALTER TABLE events
ADD COLUMN payment_reference VARCHAR;

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
        INSERT INTO escrow_status("name", "transaction_hash", "escrow_id", "buyer", "seller", "currency", "amount", "split_seller", "split_buyer", "split_marketplace", "split_protocol", "consensus_seller", "consensus_buyer", "marketplace", "marketplace_fee", "arbitrator", "arbitrator_fee", "arbitrator_proposer","status_arbitration", "challenge_period", "challenge_period_start", "challenge_period_end", "challenge_period_extension", "block_number", "paid_at", "claimed", "deposit_transaction_hash", "payment_reference")
        VALUES (NEW.name, NEW.transaction_hash, NEW.escrow_id, NEW.buyer, NEW.seller, NEW.currency, NEW.amount, NEW.split_seller, NEW.split_buyer, NEW.split_marketplace, NEW.split_protocol, NEW.consensus_seller, NEW.consensus_buyer, NEW.marketplace, NEW.marketplace_fee, NEW.arbitrator, NEW.arbitrator_fee, NEW.arbitrator_proposer, status_arbitration, NEW.challenge_period, NEW.challenge_period_start, NEW.challenge_period_end, NEW.challenge_period_extension, NEW.block_number, NEW.created_at, false, NEW.transaction_hash, NEW.payment_reference);
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
