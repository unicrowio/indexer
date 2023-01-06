DROP VIEW IF EXISTS "public"."escrow_status_view";

DROP TRIGGER IF EXISTS update_escrow_status_trigger on "events";

DROP TRIGGER IF EXISTS check_marketplace_address_trigger on "events";

DROP FUNCTION IF EXISTS "public"."check_marketplace_address";

DROP FUNCTION IF EXISTS "public"."update_escrow_status";

DROP TABLE IF EXISTS "public"."escrow_status";

DROP TABLE IF EXISTS "public"."last_block_number";

DROP TABLE IF EXISTS "public"."events";

DROP TABLE IF EXISTS "public"."marketplace"
