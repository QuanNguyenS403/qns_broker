-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email" VARCHAR(150);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "google_id" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "users_google_id_key" ON "users"("google_id");
CREATE INDEX IF NOT EXISTS "users_phone_idx" ON "users"("phone");
CREATE INDEX IF NOT EXISTS "users_google_id_idx" ON "users"("google_id");
