/*
  Warnings:

  - You are about to drop the column `payload` on the `AssinaturaEvento` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."AssinaturaEvento" DROP COLUMN "payload",
ADD COLUMN     "payloadResumo" JSONB;

-- CreateTable
CREATE TABLE "public"."WebhookIdem" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookIdem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WebhookIdem_key_key" ON "public"."WebhookIdem"("key");
