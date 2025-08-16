-- CreateEnum
CREATE TYPE "public"."ConditionSource" AS ENUM ('PRE_EXISTING', 'DIAGNOSED', 'SELF_REPORTED');

-- CreateEnum
CREATE TYPE "public"."ConditionStatus" AS ENUM ('ACTIVE', 'REMISSION', 'RESOLVED', 'RULED_OUT');

-- CreateTable
CREATE TABLE "public"."Condition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "canonical" TEXT NOT NULL,
    "icd10" TEXT,
    "snomed" TEXT,
    "chronicDefault" BOOLEAN NOT NULL DEFAULT false,
    "treatableDefault" BOOLEAN NOT NULL DEFAULT true,
    "allowRecurrence" BOOLEAN NOT NULL DEFAULT true,
    "typicalDurationDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Condition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ConditionSynonym" (
    "id" TEXT NOT NULL,
    "conditionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "canonical" TEXT NOT NULL,

    CONSTRAINT "ConditionSynonym_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PatientCondition" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "conditionId" TEXT NOT NULL,
    "source" "public"."ConditionSource" NOT NULL,
    "status" "public"."ConditionStatus" NOT NULL DEFAULT 'ACTIVE',
    "onsetDate" TIMESTAMP(3),
    "resolutionDate" TIMESTAMP(3),
    "chronicOverride" BOOLEAN,
    "treatableOverride" BOOLEAN,
    "severity" TEXT,
    "notes" TEXT,
    "appointmentId" TEXT,
    "lastReviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ConditionOccurrence" (
    "id" TEXT NOT NULL,
    "patientConditionId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "ConditionOccurrence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PatientMedication" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dose" TEXT,
    "frequency" TEXT,
    "route" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientMedication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Condition_name_key" ON "public"."Condition"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Condition_canonical_key" ON "public"."Condition"("canonical");

-- CreateIndex
CREATE INDEX "Condition_canonical_idx" ON "public"."Condition"("canonical");

-- CreateIndex
CREATE INDEX "ConditionSynonym_canonical_idx" ON "public"."ConditionSynonym"("canonical");

-- CreateIndex
CREATE INDEX "PatientCondition_patientId_idx" ON "public"."PatientCondition"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientCondition_patientId_conditionId_status_key" ON "public"."PatientCondition"("patientId", "conditionId", "status");

-- CreateIndex
CREATE INDEX "ConditionOccurrence_startAt_idx" ON "public"."ConditionOccurrence"("startAt");

-- CreateIndex
CREATE INDEX "PatientMedication_patientId_active_idx" ON "public"."PatientMedication"("patientId", "active");

-- AddForeignKey
ALTER TABLE "public"."ConditionSynonym" ADD CONSTRAINT "ConditionSynonym_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "public"."Condition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PatientCondition" ADD CONSTRAINT "PatientCondition_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PatientCondition" ADD CONSTRAINT "PatientCondition_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "public"."Condition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConditionOccurrence" ADD CONSTRAINT "ConditionOccurrence_patientConditionId_fkey" FOREIGN KEY ("patientConditionId") REFERENCES "public"."PatientCondition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PatientMedication" ADD CONSTRAINT "PatientMedication_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
