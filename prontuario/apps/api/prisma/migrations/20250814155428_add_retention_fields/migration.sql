-- AlterTable
ALTER TABLE "public"."Anexo" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "lastPatientActivity" TIMESTAMP(3),
ADD COLUMN     "legalHold" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "retainedUntil" TIMESTAMP(3),
ADD COLUMN     "retentionReason" TEXT;

-- CreateIndex
CREATE INDEX "Anexo_retainedUntil_idx" ON "public"."Anexo"("retainedUntil");

-- CreateIndex
CREATE INDEX "Anexo_legalHold_idx" ON "public"."Anexo"("legalHold");
