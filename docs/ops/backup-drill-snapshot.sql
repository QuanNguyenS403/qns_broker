-- BACKUP DRILL AGGREGATED SQL SNAPSHOT
-- Generated: 2026-10-03T18:34:15.031Z


-- Migration: 20260901021506_init
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'broker', 'admin');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('sale', 'rent');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('pending', 'active', 'expired', 'rejected', 'removed');

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "full_name" VARCHAR(150),
    "password_hash" TEXT,
    "avatar_url" TEXT,
    "is_phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_id_verified" BOOLEAN NOT NULL DEFAULT false,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" SERIAL NOT NULL,
    "parent_id" INTEGER,
    "level" VARCHAR(20) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(220) NOT NULL,
    "developer_name" VARCHAR(200),
    "location_id" INTEGER NOT NULL,
    "handover_year" SMALLINT,
    "price_from" BIGINT,
    "price_per_m2_min" INTEGER,
    "price_per_m2_max" INTEGER,
    "thumbnail_url" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" BIGSERIAL NOT NULL,
    "owner_id" BIGINT NOT NULL,
    "project_id" BIGINT,
    "location_id" INTEGER NOT NULL,
    "transaction_type" "TransactionType" NOT NULL,
    "property_type" VARCHAR(30) NOT NULL,
    "title" VARCHAR(250) NOT NULL,
    "slug" VARCHAR(280) NOT NULL,
    "description" TEXT,
    "price" BIGINT NOT NULL,
    "area_m2" DECIMAL(10,2) NOT NULL,
    "bedrooms" SMALLINT,
    "bathrooms" SMALLINT,
    "legal_status" VARCHAR(50),
    "address_detail" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "status" "ListingStatus" NOT NULL DEFAULT 'pending',
    "published_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "refreshed_at" TIMESTAMP(3),
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "reveal_phone_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_images" (
    "id" BIGSERIAL NOT NULL,
    "listing_id" BIGINT NOT NULL,
    "image_url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "listing_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_listings" (
    "user_id" BIGINT NOT NULL,
    "listing_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_listings_pkey" PRIMARY KEY ("user_id","listing_id")
);

-- CreateTable
CREATE TABLE "saved_searches" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "filters" JSONB NOT NULL,
    "notify_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_index" (
    "id" SERIAL NOT NULL,
    "location_id" INTEGER NOT NULL,
    "period" DATE NOT NULL,
    "avg_price_per_m2" BIGINT NOT NULL,
    "change_percent" DECIMAL(5,2) NOT NULL,
    "sample_size" INTEGER NOT NULL,

    CONSTRAINT "price_index_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_reports" (
    "id" BIGSERIAL NOT NULL,
    "listing_id" BIGINT NOT NULL,
    "reporter_id" BIGINT,
    "reason" VARCHAR(100) NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phone_reveal_logs" (
    "id" BIGSERIAL NOT NULL,
    "listing_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phone_reveal_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "locations_slug_key" ON "locations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "listings_slug_key" ON "listings"("slug");

-- CreateIndex
CREATE INDEX "listings_status_transaction_type_property_type_location_id_idx" ON "listings"("status", "transaction_type", "property_type", "location_id");

-- CreateIndex
CREATE UNIQUE INDEX "price_index_location_id_period_key" ON "price_index"("location_id", "period");

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_images" ADD CONSTRAINT "listing_images_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_listings" ADD CONSTRAINT "saved_listings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_listings" ADD CONSTRAINT "saved_listings_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_searches" ADD CONSTRAINT "saved_searches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_index" ADD CONSTRAINT "price_index_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_reports" ADD CONSTRAINT "listing_reports_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_reports" ADD CONSTRAINT "listing_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone_reveal_logs" ADD CONSTRAINT "phone_reveal_logs_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone_reveal_logs" ADD CONSTRAINT "phone_reveal_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Migration: 20260903132223_add_admin_fields
-- AlterTable
ALTER TABLE "listing_reports" ADD COLUMN     "resolved_at" TIMESTAMP(3),
ADD COLUMN     "status" VARCHAR(20) NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "rejection_reason" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_blocked" BOOLEAN NOT NULL DEFAULT false;


-- Migration: 20260905000000_pivot_rental_specialization
-- AlterTable: Bổ sung các trường chuyên biệt cho thuê phòng trọ / căn hộ
ALTER TABLE "listings"
ADD COLUMN IF NOT EXISTS "deposit_amount" BIGINT,
ADD COLUMN IF NOT EXISTS "min_lease_months" SMALLINT,
ADD COLUMN IF NOT EXISTS "utilities_included" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "electricity_price_per_kwh" INTEGER,
ADD COLUMN IF NOT EXISTS "water_price_per_m3" INTEGER,
ADD COLUMN IF NOT EXISTS "water_price_flat" INTEGER,
ADD COLUMN IF NOT EXISTS "amenities" JSONB;

-- CreateTable: Danh mục các trường Đại học / Cao đẳng
CREATE TABLE IF NOT EXISTS "universities" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "abbreviation" VARCHAR(50),
    "slug" VARCHAR(220) NOT NULL,
    "address" VARCHAR(250),
    "location_id" INTEGER,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Bảng liên kết Tin cho thuê và Trường Đại học lân cận
CREATE TABLE IF NOT EXISTS "listing_universities" (
    "listing_id" BIGINT NOT NULL,
    "university_id" INTEGER NOT NULL,
    "distance_meters" INTEGER,
    "travel_time_minutes" INTEGER,

    CONSTRAINT "listing_universities_pkey" PRIMARY KEY ("listing_id","university_id")
);

-- CreateIndex: Đảm bảo slug trường Đại học là duy nhất
CREATE UNIQUE INDEX IF NOT EXISTS "universities_slug_key" ON "universities"("slug");

-- AddForeignKey: universities -> locations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'universities_location_id_fkey'
    ) THEN
        ALTER TABLE "universities" ADD CONSTRAINT "universities_location_id_fkey"
        FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: listing_universities -> listings
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'listing_universities_listing_id_fkey'
    ) THEN
        ALTER TABLE "listing_universities" ADD CONSTRAINT "listing_universities_listing_id_fkey"
        FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: listing_universities -> universities
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'listing_universities_university_id_fkey'
    ) THEN
        ALTER TABLE "listing_universities" ADD CONSTRAINT "listing_universities_university_id_fkey"
        FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;


-- Migration: 20260912000000_membership_surge_pricing_verification
-- CreateEnum: Trạng thái gói thành viên của người dùng
DO $$ BEGIN
    CREATE TYPE "MembershipStatus" AS ENUM ('pending', 'active', 'expired', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum: Trạng thái xác thực thực tế của tin đăng (Giai đoạn 2 Trust-as-a-Service)
DO $$ BEGIN
    CREATE TYPE "VerificationStatus" AS ENUM ('chua_xac_thuc', 'cho_xac_thuc', 'da_xac_thuc');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable: Bổ sung các trường xác thực trên bảng listings
ALTER TABLE "listings"
ADD COLUMN IF NOT EXISTS "verification_status" "VerificationStatus" NOT NULL DEFAULT 'chua_xac_thuc',
ADD COLUMN IF NOT EXISTS "verified_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "verified_by_user_id" BIGINT;

-- AddForeignKey: listings.verified_by_user_id -> users(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'listings_verified_by_user_id_fkey'
    ) THEN
        ALTER TABLE "listings" ADD CONSTRAINT "listings_verified_by_user_id_fkey"
        FOREIGN KEY ("verified_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateTable: Gói thành viên (membership_plans)
CREATE TABLE IF NOT EXISTS "membership_plans" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "price" BIGINT NOT NULL,
    "duration_days" INTEGER NOT NULL DEFAULT 30,
    "max_active_listings" INTEGER NOT NULL,
    "region_scope" VARCHAR(100) DEFAULT 'Toàn quốc',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membership_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Code gói duy nhất
CREATE UNIQUE INDEX IF NOT EXISTS "membership_plans_code_key" ON "membership_plans"("code");

-- CreateTable: Cấu hình mùa cao điểm & Surge Pricing (pricing_seasons)
CREATE TABLE IF NOT EXISTS "pricing_seasons" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "price_multiplier" DECIMAL(4,2) NOT NULL DEFAULT 1.00,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pricing_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Đăng ký và sử dụng gói thành viên (user_memberships)
CREATE TABLE IF NOT EXISTS "user_memberships" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "plan_id" INTEGER NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'pending',
    "price_paid" BIGINT NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "payment_note" TEXT,
    "approved_at" TIMESTAMP(3),
    "approved_by_user_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_memberships_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey: user_memberships.user_id -> users(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_memberships_user_id_fkey'
    ) THEN
        ALTER TABLE "user_memberships" ADD CONSTRAINT "user_memberships_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: user_memberships.plan_id -> membership_plans(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_memberships_plan_id_fkey'
    ) THEN
        ALTER TABLE "user_memberships" ADD CONSTRAINT "user_memberships_plan_id_fkey"
        FOREIGN KEY ("plan_id") REFERENCES "membership_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;


-- Migration: 20260912100000_add_lead_entity_p0_02
-- CreateTable: leads
CREATE TABLE IF NOT EXISTS "leads" (
    "id" BIGSERIAL NOT NULL,
    "listing_id" BIGINT NOT NULL,
    "requester_id" BIGINT,
    "full_name" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(150),
    "message" TEXT,
    "channel" VARCHAR(50) NOT NULL DEFAULT 'web_form',
    "consent" BOOLEAN NOT NULL DEFAULT true,
    "status" VARCHAR(30) NOT NULL DEFAULT 'new',
    "dedupe_key" VARCHAR(128) NOT NULL,
    "assigned_to_user_id" BIGINT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "leads_dedupe_key_key" ON "leads"("dedupe_key");
CREATE INDEX IF NOT EXISTS "leads_listing_id_status_idx" ON "leads"("listing_id", "status");
CREATE INDEX IF NOT EXISTS "leads_phone_idx" ON "leads"("phone");
CREATE INDEX IF NOT EXISTS "leads_created_at_idx" ON "leads"("created_at");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'leads_listing_id_fkey'
    ) THEN
        ALTER TABLE "leads" ADD CONSTRAINT "leads_listing_id_fkey"
        FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'leads_requester_id_fkey'
    ) THEN
        ALTER TABLE "leads" ADD CONSTRAINT "leads_requester_id_fkey"
        FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'leads_assigned_to_user_id_fkey'
    ) THEN
        ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_to_user_id_fkey"
        FOREIGN KEY ("assigned_to_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;


-- Migration: 20260912110000_phone_reveal_unique_constraint_be_09
-- CreateIndex: composite unique constraint cho phone_reveal_logs (BE-09)
CREATE UNIQUE INDEX IF NOT EXISTS "phone_reveal_logs_user_id_listing_id_key" ON "phone_reveal_logs"("user_id", "listing_id");


-- Migration: 20260912120000_user_token_version_be_02
-- Migration DDL for BE-02: User tokenVersion for instant session revocation
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "token_version" INTEGER NOT NULL DEFAULT 0;


-- Migration: 20260912130000_finance_ledger_audit_events_af_wave4
-- AlterTable
ALTER TABLE "user_memberships" 
  ADD COLUMN "quoted_amount" BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN "confirmed_payment_amount" BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN "external_transaction_id" VARCHAR(150),
  ADD COLUMN "plan_snapshot" JSONB,
  ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "rejection_reason" TEXT;

-- CreateIndex
CREATE INDEX "user_memberships_user_id_status_idx" ON "user_memberships"("user_id", "status");

-- CreateTable
CREATE TABLE "finance_ledgers" (
    "id" BIGSERIAL NOT NULL,
    "transaction_type" VARCHAR(50) NOT NULL,
    "amount" BIGINT NOT NULL,
    "user_membership_id" BIGINT,
    "user_id" BIGINT NOT NULL,
    "external_transaction_id" VARCHAR(150),
    "note" TEXT,
    "recorded_by_user_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "finance_ledgers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "finance_ledgers_external_transaction_id_key" ON "finance_ledgers"("external_transaction_id");
CREATE INDEX "finance_ledgers_user_id_idx" ON "finance_ledgers"("user_id");
CREATE INDEX "finance_ledgers_transaction_type_idx" ON "finance_ledgers"("transaction_type");
CREATE INDEX "finance_ledgers_created_at_idx" ON "finance_ledgers"("created_at");

-- AddForeignKey
ALTER TABLE "finance_ledgers" ADD CONSTRAINT "finance_ledgers_user_membership_id_fkey" FOREIGN KEY ("user_membership_id") REFERENCES "user_memberships"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "finance_ledgers" ADD CONSTRAINT "finance_ledgers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "audit_events" (
    "id" BIGSERIAL NOT NULL,
    "actor_id" BIGINT,
    "actor_phone" VARCHAR(50),
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(100) NOT NULL,
    "entity_id" VARCHAR(100) NOT NULL,
    "before_state" JSONB,
    "after_state" JSONB,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_events_entity_type_entity_id_idx" ON "audit_events"("entity_type", "entity_id");
CREATE INDEX "audit_events_action_idx" ON "audit_events"("action");
CREATE INDEX "audit_events_created_at_idx" ON "audit_events"("created_at");


-- Migration: 20260912140000_outbox_events_wave5
-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "outbox_events" (
    "id" BIGSERIAL NOT NULL,
    "aggregate_type" VARCHAR(100) NOT NULL,
    "aggregate_id" VARCHAR(100) NOT NULL,
    "event_type" VARCHAR(100) NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "max_retries" INTEGER NOT NULL DEFAULT 5,
    "next_retry_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "error_message" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "outbox_events_status_next_retry_at_idx" ON "outbox_events"("status", "next_retry_at");
CREATE INDEX "outbox_events_aggregate_type_aggregate_id_idx" ON "outbox_events"("aggregate_type", "aggregate_id");


-- Migration: 20260913000000_audit_remediation_core
-- AlterEnum: Add 'rented' to ListingStatus
ALTER TYPE "ListingStatus" ADD VALUE IF NOT EXISTS 'rented';

-- AlterTable: OutboxEvent add worker_id and locked_until for lease/reclaim (RB-07)
ALTER TABLE "outbox_events" ADD COLUMN IF NOT EXISTS "worker_id" VARCHAR(100);
ALTER TABLE "outbox_events" ADD COLUMN IF NOT EXISTS "locked_until" TIMESTAMP(3);

-- CreateIndex for OutboxEvent worker lease/reclaim
CREATE INDEX IF NOT EXISTS "outbox_events_status_locked_until_idx" ON "outbox_events"("status", "locked_until");

-- AlterTable: UserMembership add idempotency_key (FIN-04, RB-05)
ALTER TABLE "user_memberships" ADD COLUMN IF NOT EXISTS "idempotency_key" VARCHAR(128);
CREATE UNIQUE INDEX IF NOT EXISTS "user_memberships_idempotency_key_key" ON "user_memberships"("idempotency_key");

-- AlterTable & ForeignKey: Fix FIN-08 FinanceLedger user FK to RESTRICT
ALTER TABLE "finance_ledgers" DROP CONSTRAINT IF EXISTS "finance_ledgers_user_id_fkey";
ALTER TABLE "finance_ledgers" ADD CONSTRAINT "finance_ledgers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex: Compound indexes for Listing search and filtering performance (A5)
CREATE INDEX IF NOT EXISTS "listings_owner_id_status_idx" ON "listings"("owner_id", "status");
CREATE INDEX IF NOT EXISTS "listings_status_expires_at_created_at_idx" ON "listings"("status", "expires_at", "created_at");
CREATE INDEX IF NOT EXISTS "listings_status_price_idx" ON "listings"("status", "price");
CREATE INDEX IF NOT EXISTS "listings_status_location_id_idx" ON "listings"("status", "location_id");


-- Migration: 20260924000000_brokerage_pivot_entities
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionType_new" AS ENUM ('rent');
ALTER TABLE "listings" ALTER COLUMN "transaction_type" TYPE "TransactionType_new" USING ("transaction_type"::text::"TransactionType_new");
ALTER TYPE "TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "TransactionType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "leads" DROP CONSTRAINT "leads_listing_id_fkey";

-- AlterTable
ALTER TABLE "finance_ledgers" ADD COLUMN     "commission_id" BIGINT,
ADD COLUMN     "source_type" VARCHAR(50) NOT NULL DEFAULT 'membership';

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "request_id" BIGINT,
ADD COLUMN     "unit_id" BIGINT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "contact_agent_id" BIGINT,
ADD COLUMN     "unit_id" BIGINT,
ALTER COLUMN "transaction_type" SET DEFAULT 'rent';

-- AlterTable
ALTER TABLE "membership_plans" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "pricing_seasons" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "user_memberships" ALTER COLUMN "price_paid" SET DEFAULT 0,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateTable
CREATE TABLE "agency_profiles" (
    "id" SERIAL NOT NULL,
    "legal_name" VARCHAR(200) NOT NULL,
    "tax_code" VARCHAR(50),
    "license_number" VARCHAR(100),
    "address" VARCHAR(255) NOT NULL,
    "bank_name" VARCHAR(100) NOT NULL,
    "bank_account_number" VARCHAR(50) NOT NULL,
    "bank_account_holder" VARCHAR(150) NOT NULL,
    "hotline" VARCHAR(30) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agency_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_profiles" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "agency_id" INTEGER,
    "display_name" VARCHAR(150) NOT NULL,
    "work_phone" VARCHAR(20) NOT NULL,
    "zalo_phone" VARCHAR(20),
    "bio" TEXT,
    "avatar_url" TEXT,
    "broker_license_number" VARCHAR(100),
    "max_daily_viewings" INTEGER NOT NULL DEFAULT 3,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owner_profiles" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "legal_full_name" VARCHAR(150) NOT NULL,
    "identity_number" VARCHAR(50),
    "authority_type" VARCHAR(50) NOT NULL DEFAULT 'owner',
    "authority_doc_url" TEXT,
    "bank_account_name" VARCHAR(150),
    "bank_account_number" VARCHAR(50),
    "bank_name" VARCHAR(100),
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owner_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_units" (
    "id" BIGSERIAL NOT NULL,
    "unit_code" VARCHAR(50) NOT NULL,
    "owner_id" BIGINT NOT NULL,
    "owner_profile_id" BIGINT,
    "project_id" BIGINT,
    "location_id" INTEGER NOT NULL,
    "address_detail" VARCHAR(255) NOT NULL,
    "room_number" VARCHAR(50),
    "property_type" VARCHAR(30) NOT NULL,
    "area_m2" DECIMAL(10,2) NOT NULL,
    "bedrooms" SMALLINT,
    "bathrooms" SMALLINT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'available',
    "available_from" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rental_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owner_service_agreements" (
    "id" BIGSERIAL NOT NULL,
    "agreement_code" VARCHAR(64) NOT NULL,
    "owner_id" BIGINT NOT NULL,
    "owner_profile_id" BIGINT,
    "agency_id" INTEGER,
    "agent_id" BIGINT,
    "commission_rate_bps" INTEGER NOT NULL DEFAULT 4000,
    "terms_version" VARCHAR(20) NOT NULL DEFAULT '1.0',
    "status" VARCHAR(30) NOT NULL DEFAULT 'draft',
    "signed_at" TIMESTAMP(3),
    "valid_from" TIMESTAMP(3),
    "valid_until" TIMESTAMP(3),
    "document_url" TEXT,
    "document_hash" VARCHAR(128),
    "protection_days" INTEGER NOT NULL DEFAULT 90,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owner_service_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agreement_units" (
    "id" BIGSERIAL NOT NULL,
    "agreement_id" BIGINT NOT NULL,
    "unit_id" BIGINT NOT NULL,
    "base_monthly_rent" BIGINT NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(30) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agreement_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_requests" (
    "id" BIGSERIAL NOT NULL,
    "request_code" VARCHAR(64) NOT NULL,
    "user_id" BIGINT,
    "full_name" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "budget_min" BIGINT,
    "budget_max" BIGINT,
    "target_move_in_date" TIMESTAMP(3),
    "lease_term_months" INTEGER,
    "occupants_count" INTEGER,
    "preferred_location" VARCHAR(200),
    "notes" TEXT,
    "is_phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rental_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "introductions" (
    "id" BIGSERIAL NOT NULL,
    "intro_code" VARCHAR(64) NOT NULL,
    "agreement_id" BIGINT NOT NULL,
    "unit_id" BIGINT,
    "request_id" BIGINT,
    "client_phone" VARCHAR(20) NOT NULL,
    "client_name" VARCHAR(150) NOT NULL,
    "introduced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "protection_expires_at" TIMESTAMP(3) NOT NULL,
    "owner_acknowledged_at" TIMESTAMP(3),
    "is_disputed" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(30) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "introductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "viewings" (
    "id" BIGSERIAL NOT NULL,
    "viewing_code" VARCHAR(64) NOT NULL,
    "unit_id" BIGINT NOT NULL,
    "agent_id" BIGINT NOT NULL,
    "request_id" BIGINT,
    "intro_id" BIGINT,
    "client_name" VARCHAR(150) NOT NULL,
    "client_phone" VARCHAR(20) NOT NULL,
    "scheduled_start_time" TIMESTAMP(3) NOT NULL,
    "scheduled_end_time" TIMESTAMP(3) NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'requested',
    "checkin_code" VARCHAR(20),
    "completed_at" TIMESTAMP(3),
    "client_feedback" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "viewings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_reservations" (
    "id" BIGSERIAL NOT NULL,
    "unit_id" BIGINT NOT NULL,
    "deal_id" BIGINT,
    "reserved_from" TIMESTAMP(3) NOT NULL,
    "reserved_until" TIMESTAMP(3) NOT NULL,
    "hold_reason" VARCHAR(50) NOT NULL DEFAULT 'viewing_interest',
    "status" VARCHAR(30) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_deals" (
    "id" BIGSERIAL NOT NULL,
    "deal_code" VARCHAR(64) NOT NULL,
    "unit_id" BIGINT NOT NULL,
    "agreement_id" BIGINT NOT NULL,
    "intro_id" BIGINT,
    "owner_id" BIGINT NOT NULL,
    "owner_profile_id" BIGINT,
    "tenant_user_id" BIGINT,
    "tenant_name" VARCHAR(150) NOT NULL,
    "tenant_phone" VARCHAR(20) NOT NULL,
    "tenant_identity" VARCHAR(50),
    "actual_monthly_rent" BIGINT NOT NULL,
    "deposit_amount" BIGINT NOT NULL DEFAULT 0,
    "lease_start_date" TIMESTAMP(3) NOT NULL,
    "lease_end_date" TIMESTAMP(3) NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'negotiating',
    "contract_signed_at" TIMESTAMP(3),
    "first_month_paid_at" TIMESTAMP(3),
    "handover_completed_at" TIMESTAMP(3),
    "success_at" TIMESTAMP(3),
    "contract_url" TEXT,
    "contract_hash" VARCHAR(128),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rental_deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deposit_records" (
    "id" BIGSERIAL NOT NULL,
    "deal_id" BIGINT NOT NULL,
    "amount" BIGINT NOT NULL,
    "recipient_name" VARCHAR(150) NOT NULL,
    "recipient_account" VARCHAR(50),
    "recipient_bank" VARCHAR(100),
    "deposited_at" TIMESTAMP(3) NOT NULL,
    "hold_until" TIMESTAMP(3),
    "receipt_url" TEXT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'held_by_owner',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deposit_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "handover_records" (
    "id" BIGSERIAL NOT NULL,
    "deal_id" BIGINT NOT NULL,
    "handover_date" TIMESTAMP(3) NOT NULL,
    "electric_meter_number" DECIMAL(10,2),
    "water_meter_number" DECIMAL(10,2),
    "keys_count" INTEGER NOT NULL DEFAULT 1,
    "condition_notes" TEXT,
    "handover_doc_url" TEXT,
    "handover_doc_hash" VARCHAR(128),
    "owner_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "tenant_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "agent_witnessed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "handover_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commissions" (
    "id" BIGSERIAL NOT NULL,
    "deal_id" BIGINT NOT NULL,
    "agency_id" INTEGER,
    "commission_base_vnd" BIGINT NOT NULL,
    "rate_bps" INTEGER NOT NULL DEFAULT 4000,
    "commission_amount_vnd" BIGINT NOT NULL,
    "tax_amount_vnd" BIGINT NOT NULL DEFAULT 0,
    "total_due_vnd" BIGINT NOT NULL,
    "paid_amount_vnd" BIGINT NOT NULL DEFAULT 0,
    "refunded_amount_vnd" BIGINT NOT NULL DEFAULT 0,
    "due_at" TIMESTAMP(3),
    "status" VARCHAR(30) NOT NULL DEFAULT 'estimated',
    "policy_version" VARCHAR(20) NOT NULL DEFAULT '1.0',
    "payment_reference_code" VARCHAR(64) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" BIGSERIAL NOT NULL,
    "payment_code" VARCHAR(64) NOT NULL,
    "external_bank_tx_id" VARCHAR(150) NOT NULL,
    "bank_name" VARCHAR(100) NOT NULL,
    "account_number" VARCHAR(50) NOT NULL,
    "amount" BIGINT NOT NULL,
    "allocated_amount" BIGINT NOT NULL DEFAULT 0,
    "remitter_name" VARCHAR(150),
    "remitter_account" VARCHAR(50),
    "payment_time" TIMESTAMP(3) NOT NULL,
    "raw_description" TEXT,
    "reconciled_by_user_id" BIGINT,
    "reconciled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_allocations" (
    "id" BIGSERIAL NOT NULL,
    "payment_id" BIGINT NOT NULL,
    "commission_id" BIGINT NOT NULL,
    "amount" BIGINT NOT NULL,
    "allocated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" BIGSERIAL NOT NULL,
    "doc_code" VARCHAR(64) NOT NULL,
    "doc_type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "version" VARCHAR(20) NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_hash" VARCHAR(128) NOT NULL,
    "mime_type" VARCHAR(100),
    "file_size_bytes" INTEGER,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_acceptances" (
    "id" BIGSERIAL NOT NULL,
    "document_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "accepted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" VARCHAR(50),
    "user_agent" VARCHAR(255),
    "acceptance_method" VARCHAR(50) NOT NULL DEFAULT 'click_agree',

    CONSTRAINT "document_acceptances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_records" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT,
    "request_id" BIGINT,
    "purpose" VARCHAR(100) NOT NULL,
    "is_agreed" BOOLEAN NOT NULL DEFAULT false,
    "notice_version" VARCHAR(20) NOT NULL DEFAULT '1.0',
    "agreed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),
    "ip_address" VARCHAR(50),

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" BIGSERIAL NOT NULL,
    "dispute_code" VARCHAR(64) NOT NULL,
    "deal_id" BIGINT,
    "commission_id" BIGINT,
    "raised_by_user_id" BIGINT NOT NULL,
    "reason" VARCHAR(200) NOT NULL,
    "details" TEXT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'open',
    "resolved_at" TIMESTAMP(3),
    "resolved_by_user_id" BIGINT,
    "resolution_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agent_profiles_user_id_key" ON "agent_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "owner_profiles_user_id_key" ON "owner_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "rental_units_unit_code_key" ON "rental_units"("unit_code");

-- CreateIndex
CREATE INDEX "rental_units_owner_id_status_idx" ON "rental_units"("owner_id", "status");

-- CreateIndex
CREATE INDEX "rental_units_location_id_status_idx" ON "rental_units"("location_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "owner_service_agreements_agreement_code_key" ON "owner_service_agreements"("agreement_code");

-- CreateIndex
CREATE INDEX "owner_service_agreements_owner_id_status_idx" ON "owner_service_agreements"("owner_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "agreement_units_agreement_id_unit_id_key" ON "agreement_units"("agreement_id", "unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "rental_requests_request_code_key" ON "rental_requests"("request_code");

-- CreateIndex
CREATE INDEX "rental_requests_phone_idx" ON "rental_requests"("phone");

-- CreateIndex
CREATE INDEX "rental_requests_created_at_idx" ON "rental_requests"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "introductions_intro_code_key" ON "introductions"("intro_code");

-- CreateIndex
CREATE INDEX "introductions_agreement_id_client_phone_idx" ON "introductions"("agreement_id", "client_phone");

-- CreateIndex
CREATE INDEX "introductions_protection_expires_at_idx" ON "introductions"("protection_expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "viewings_viewing_code_key" ON "viewings"("viewing_code");

-- CreateIndex
CREATE INDEX "viewings_agent_id_scheduled_start_time_idx" ON "viewings"("agent_id", "scheduled_start_time");

-- CreateIndex
CREATE INDEX "viewings_unit_id_scheduled_start_time_idx" ON "viewings"("unit_id", "scheduled_start_time");

-- CreateIndex
CREATE INDEX "unit_reservations_unit_id_status_idx" ON "unit_reservations"("unit_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "rental_deals_deal_code_key" ON "rental_deals"("deal_code");

-- CreateIndex
CREATE INDEX "rental_deals_owner_id_status_idx" ON "rental_deals"("owner_id", "status");

-- CreateIndex
CREATE INDEX "rental_deals_unit_id_status_idx" ON "rental_deals"("unit_id", "status");

-- CreateIndex
CREATE INDEX "deposit_records_deal_id_idx" ON "deposit_records"("deal_id");

-- CreateIndex
CREATE INDEX "handover_records_deal_id_idx" ON "handover_records"("deal_id");

-- CreateIndex
CREATE UNIQUE INDEX "commissions_deal_id_key" ON "commissions"("deal_id");

-- CreateIndex
CREATE UNIQUE INDEX "commissions_payment_reference_code_key" ON "commissions"("payment_reference_code");

-- CreateIndex
CREATE INDEX "commissions_status_due_at_idx" ON "commissions"("status", "due_at");

-- CreateIndex
CREATE UNIQUE INDEX "payments_payment_code_key" ON "payments"("payment_code");

-- CreateIndex
CREATE UNIQUE INDEX "payments_external_bank_tx_id_key" ON "payments"("external_bank_tx_id");

-- CreateIndex
CREATE INDEX "payments_external_bank_tx_id_idx" ON "payments"("external_bank_tx_id");

-- CreateIndex
CREATE INDEX "payments_payment_time_idx" ON "payments"("payment_time");

-- CreateIndex
CREATE UNIQUE INDEX "payment_allocations_payment_id_commission_id_key" ON "payment_allocations"("payment_id", "commission_id");

-- CreateIndex
CREATE UNIQUE INDEX "documents_doc_code_key" ON "documents"("doc_code");

-- CreateIndex
CREATE UNIQUE INDEX "document_acceptances_document_id_user_id_key" ON "document_acceptances"("document_id", "user_id");

-- CreateIndex
CREATE INDEX "consent_records_user_id_purpose_idx" ON "consent_records"("user_id", "purpose");

-- CreateIndex
CREATE UNIQUE INDEX "disputes_dispute_code_key" ON "disputes"("dispute_code");

-- CreateIndex
CREATE INDEX "disputes_deal_id_idx" ON "disputes"("deal_id");

-- CreateIndex
CREATE INDEX "disputes_commission_id_idx" ON "disputes"("commission_id");

-- CreateIndex
CREATE INDEX "finance_ledgers_source_type_idx" ON "finance_ledgers"("source_type");

-- CreateIndex
CREATE INDEX "finance_ledgers_commission_id_idx" ON "finance_ledgers"("commission_id");

-- CreateIndex
CREATE INDEX "leads_unit_id_status_idx" ON "leads"("unit_id", "status");

-- CreateIndex
CREATE INDEX "listings_unit_id_idx" ON "listings"("unit_id");

-- CreateIndex
CREATE INDEX "listings_contact_agent_id_idx" ON "listings"("contact_agent_id");

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "rental_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_contact_agent_id_fkey" FOREIGN KEY ("contact_agent_id") REFERENCES "agent_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "rental_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "rental_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_ledgers" ADD CONSTRAINT "finance_ledgers_commission_id_fkey" FOREIGN KEY ("commission_id") REFERENCES "commissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_profiles" ADD CONSTRAINT "agent_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_profiles" ADD CONSTRAINT "agent_profiles_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agency_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owner_profiles" ADD CONSTRAINT "owner_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_units" ADD CONSTRAINT "rental_units_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_units" ADD CONSTRAINT "rental_units_owner_profile_id_fkey" FOREIGN KEY ("owner_profile_id") REFERENCES "owner_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_units" ADD CONSTRAINT "rental_units_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_units" ADD CONSTRAINT "rental_units_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owner_service_agreements" ADD CONSTRAINT "owner_service_agreements_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owner_service_agreements" ADD CONSTRAINT "owner_service_agreements_owner_profile_id_fkey" FOREIGN KEY ("owner_profile_id") REFERENCES "owner_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owner_service_agreements" ADD CONSTRAINT "owner_service_agreements_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agency_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owner_service_agreements" ADD CONSTRAINT "owner_service_agreements_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agent_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreement_units" ADD CONSTRAINT "agreement_units_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "owner_service_agreements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreement_units" ADD CONSTRAINT "agreement_units_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "rental_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_requests" ADD CONSTRAINT "rental_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "introductions" ADD CONSTRAINT "introductions_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "owner_service_agreements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "introductions" ADD CONSTRAINT "introductions_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "rental_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viewings" ADD CONSTRAINT "viewings_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "rental_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viewings" ADD CONSTRAINT "viewings_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agent_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viewings" ADD CONSTRAINT "viewings_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "rental_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viewings" ADD CONSTRAINT "viewings_intro_id_fkey" FOREIGN KEY ("intro_id") REFERENCES "introductions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_reservations" ADD CONSTRAINT "unit_reservations_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "rental_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_reservations" ADD CONSTRAINT "unit_reservations_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "rental_deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_deals" ADD CONSTRAINT "rental_deals_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "rental_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_deals" ADD CONSTRAINT "rental_deals_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "owner_service_agreements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_deals" ADD CONSTRAINT "rental_deals_intro_id_fkey" FOREIGN KEY ("intro_id") REFERENCES "introductions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_deals" ADD CONSTRAINT "rental_deals_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_deals" ADD CONSTRAINT "rental_deals_owner_profile_id_fkey" FOREIGN KEY ("owner_profile_id") REFERENCES "owner_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_deals" ADD CONSTRAINT "rental_deals_tenant_user_id_fkey" FOREIGN KEY ("tenant_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposit_records" ADD CONSTRAINT "deposit_records_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "rental_deals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handover_records" ADD CONSTRAINT "handover_records_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "rental_deals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "rental_deals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agency_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_commission_id_fkey" FOREIGN KEY ("commission_id") REFERENCES "commissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_acceptances" ADD CONSTRAINT "document_acceptances_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_acceptances" ADD CONSTRAINT "document_acceptances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "rental_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "rental_deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_commission_id_fkey" FOREIGN KEY ("commission_id") REFERENCES "commissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_raised_by_user_id_fkey" FOREIGN KEY ("raised_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


