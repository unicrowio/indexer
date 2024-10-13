DROP TRIGGER IF EXISTS update_escrow_status_trigger ON "public"."events";
DROP TRIGGER IF EXISTS check_marketplace_address_trigger ON "public"."events";

DROP FUNCTION IF EXISTS update_escrow_status();
DROP FUNCTION IF EXISTS check_marketplace_address();
DROP FUNCTION IF EXISTS generate_random_id(integer);

DROP VIEW IF EXISTS "public"."escrow_status_view";

DROP INDEX IF EXISTS "buyer_indexer";
DROP INDEX IF EXISTS "seller_indexer";
DROP INDEX IF EXISTS "escrowid-indexer";

DROP TABLE IF EXISTS "public"."events";
DROP TABLE IF EXISTS "public"."escrow_status";
DROP TABLE IF EXISTS "public"."marketplace";
DROP TABLE IF EXISTS "public"."last_block_number";
