/*
  Warnings:

  - You are about to drop the column `evolucaoId` on the `Anexo` table. All the data in the column will be lost.
  - You are about to drop the column `evolucaoId` on the `DocumentoClinico` table. All the data in the column will be lost.
  - You are about to drop the column `episodioId` on the `Evolucao` table. All the data in the column will be lost.
  - You are about to drop the column `sinaisVitais` on the `Evolucao` table. All the data in the column will be lost.
  - You are about to drop the column `usuarioId` on the `Evolucao` table. All the data in the column will be lost.
  - You are about to drop the column `ativo` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `crm` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `especialidade` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Usuario` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."AllergyCategory" AS ENUM ('DRUG', 'FOOD', 'ENVIRONMENT', 'CONTACT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."AllergySeverity" AS ENUM ('MILD', 'MODERATE', 'SEVERE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "public"."AllergyStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."AllergySource" AS ENUM ('PATIENT', 'REPORTED', 'CLINICAL', 'LAB');

-- CreateTable
CREATE TABLE "public"."Allergen" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "canonical" TEXT NOT NULL,
    "category" "public"."AllergyCategory" NOT NULL,
    "snomed" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Allergen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AllergenSynonym" (
    "id" TEXT NOT NULL,
    "allergenId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "canonical" TEXT NOT NULL,

    CONSTRAINT "AllergenSynonym_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AllergenCrossRef" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "relation" TEXT NOT NULL,

    CONSTRAINT "AllergenCrossRef_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PatientAllergy" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "allergenId" TEXT NOT NULL,
    "status" "public"."AllergyStatus" NOT NULL DEFAULT 'ACTIVE',
    "severity" "public"."AllergySeverity" NOT NULL DEFAULT 'UNKNOWN',
    "reactions" TEXT,
    "onsetDate" TIMESTAMP(3),
    "notes" TEXT,
    "source" "public"."AllergySource" NOT NULL DEFAULT 'PATIENT',
    "recordedBy" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientAllergy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Allergen_name_key" ON "public"."Allergen"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Allergen_canonical_key" ON "public"."Allergen"("canonical");

-- CreateIndex
CREATE INDEX "Allergen_canonical_idx" ON "public"."Allergen"("canonical");

-- CreateIndex
CREATE INDEX "AllergenSynonym_canonical_idx" ON "public"."AllergenSynonym"("canonical");

-- CreateIndex
CREATE INDEX "PatientAllergy_patientId_status_idx" ON "public"."PatientAllergy"("patientId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PatientAllergy_patientId_allergenId_status_key" ON "public"."PatientAllergy"("patientId", "allergenId", "status");

-- AddForeignKey
ALTER TABLE "public"."AllergenSynonym" ADD CONSTRAINT "AllergenSynonym_allergenId_fkey" FOREIGN KEY ("allergenId") REFERENCES "public"."Allergen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AllergenCrossRef" ADD CONSTRAINT "AllergenCrossRef_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "public"."Allergen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllergenCrossRef" ADD CONSTRAINT "AllergenCrossRef_toId_fkey" FOREIGN KEY ("toId") REFERENCES "public"."Allergen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PatientAllergy" ADD CONSTRAINT "PatientAllergy_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PatientAllergy" ADD CONSTRAINT "PatientAllergy_allergenId_fkey" FOREIGN KEY ("allergenId") REFERENCES "public"."Allergen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PatientAllergy" ADD CONSTRAINT "PatientAllergy_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "public"."Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
