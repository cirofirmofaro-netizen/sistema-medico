/*
  Warnings:

  - A unique constraint covering the columns `[patientId,conditionId]` on the table `PatientCondition` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."PatientCondition_patientId_conditionId_status_key";

-- CreateIndex
CREATE UNIQUE INDEX "PatientCondition_patientId_conditionId_key" ON "public"."PatientCondition"("patientId", "conditionId");
