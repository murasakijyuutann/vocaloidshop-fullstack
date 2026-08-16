-- Backfilled migration: these changes were already applied directly to the
-- dev database (likely via `prisma db push` during earlier feature work) but
-- were never captured as a migration file, leaving migration history out of
-- sync with reality. This file exists so `prisma migrate deploy` on a fresh
-- (e.g. production) database produces the same schema the dev database
-- already has, instead of a database silently missing the coupon feature.
-- It is marked as already-applied on the dev database via
-- `prisma migrate resolve --applied`, not re-executed there.

-- CreateEnum
CREATE TYPE "CouponType" AS ENUM ('PERCENTAGE', 'FIXED');

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "coupon_code" TEXT,
ADD COLUMN     "discount_amount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stripe_payment_intent_id" TEXT;

-- CreateTable
CREATE TABLE "coupon" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "type" "CouponType" NOT NULL,
    "value" INTEGER NOT NULL,
    "min_order_amount" INTEGER,
    "max_uses" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_stripe_payment_intent_id_key" ON "order"("stripe_payment_intent_id");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_code_key" ON "coupon"("code");
