/*
  Warnings:

  - You are about to drop the column `resumo` on the `EvolucaoVersion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[usuarioId,patientId,serviceDate]` on the table `Atendimento` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[usuarioId,cnpj]` on the table `FontePagadora` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[usuarioId,fontePagadoraId,anoRef]` on the table `InformeRendimento` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[usuarioId,cpf]` on the table `Paciente` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[usuarioId,patientId,allergenId,status]` on the table `PatientAllergy` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `usuarioId` to the `Alergia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `Anexo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Atendimento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `Atendimento` table without a default value. This is not possible if the table is not empty.
  - Made the column `usuarioId` on table `Consulta` required. This step will fail if there are existing NULL values in that column.
  - Made the column `usuarioId` on table `DocumentoClinico` required. This step will fail if there are existing NULL values in that column.
  - Made the column `usuarioId` on table `Episodio` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `usuarioId` to the `Evolucao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `FontePagadora` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `InformeRendimento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `MedicacaoAtiva` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `ModeloPlantao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `NotaFiscal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `Paciente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `Pagamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `PatientAllergy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `PatientCondition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `PatientMedication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `Plantao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `ProblemaClinico` table without a default value. This is not possible if the table is not empty.
  - Made the column `usuarioId` on table `SinaisVitais` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Consulta" DROP CONSTRAINT "Consulta_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DocumentoClinico" DROP CONSTRAINT "DocumentoClinico_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Episodio" DROP CONSTRAINT "Episodio_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SinaisVitais" DROP CONSTRAINT "SinaisVitais_usuarioId_fkey";

-- DropIndex
DROP INDEX "public"."Atendimento_patientId_serviceDate_idx";

-- DropIndex
DROP INDEX "public"."Atendimento_patientId_serviceDate_key";

-- DropIndex
DROP INDEX "public"."Evolucao_atendimentoId_idx";

-- DropIndex
DROP INDEX "public"."FontePagadora_cnpj_key";

-- DropIndex
DROP INDEX "public"."InformeRendimento_fontePagadoraId_anoRef_key";

-- DropIndex
DROP INDEX "public"."Paciente_cpf_key";

-- DropIndex
DROP INDEX "public"."PatientAllergy_patientId_allergenId_status_key";

-- AlterTable
ALTER TABLE "public"."Alergia" ADD COLUMN     "usuarioId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Anexo" ADD COLUMN     "usuarioId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Atendimento" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "usuarioId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Consulta" ALTER COLUMN "usuarioId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."DocumentoClinico" ALTER COLUMN "usuarioId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Episodio" ALTER COLUMN "usuarioId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Evolucao" ADD COLUMN     "usuarioId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."EvolucaoVersion" DROP COLUMN "resumo";

-- AlterTable
ALTER TABLE "public"."FontePagadora" ADD COLUMN     "usuarioId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."InformeRendimento" ADD COLUMN     "usuarioId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."MedicacaoAtiva" ADD COLUMN     "usuarioId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."ModeloPlantao" ADD COLUMN     "usuarioId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."NotaFiscal" ADD COLUMN     "usuarioId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Paciente" ADD COLUMN     "usuarioId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Pagamento" ADD COLUMN     "usuarioId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."PatientAllergy" ADD COLUMN     "usuarioId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."PatientCondition" ADD COLUMN     "usuarioId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."PatientMedication" ADD COLUMN     "usuarioId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Plantao" ADD COLUMN     "usuarioId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."ProblemaClinico" ADD COLUMN     "usuarioId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."SinaisVitais" ALTER COLUMN "usuarioId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Alergia_usuarioId_idx" ON "public"."Alergia"("usuarioId");

-- CreateIndex
CREATE INDEX "Alergia_usuarioId_pacienteId_idx" ON "public"."Alergia"("usuarioId", "pacienteId");

-- CreateIndex
CREATE INDEX "Anexo_usuarioId_idx" ON "public"."Anexo"("usuarioId");

-- CreateIndex
CREATE INDEX "Anexo_usuarioId_createdAt_idx" ON "public"."Anexo"("usuarioId", "createdAt");

-- CreateIndex
CREATE INDEX "Atendimento_usuarioId_patientId_serviceDate_idx" ON "public"."Atendimento"("usuarioId", "patientId", "serviceDate");

-- CreateIndex
CREATE INDEX "Atendimento_usuarioId_serviceDate_idx" ON "public"."Atendimento"("usuarioId", "serviceDate");

-- CreateIndex
CREATE INDEX "Atendimento_usuarioId_status_idx" ON "public"."Atendimento"("usuarioId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Atendimento_usuarioId_patientId_serviceDate_key" ON "public"."Atendimento"("usuarioId", "patientId", "serviceDate");

-- CreateIndex
CREATE INDEX "Consulta_usuarioId_idx" ON "public"."Consulta"("usuarioId");

-- CreateIndex
CREATE INDEX "Consulta_usuarioId_inicio_idx" ON "public"."Consulta"("usuarioId", "inicio");

-- CreateIndex
CREATE INDEX "DocumentoClinico_usuarioId_idx" ON "public"."DocumentoClinico"("usuarioId");

-- CreateIndex
CREATE INDEX "DocumentoClinico_usuarioId_tipo_idx" ON "public"."DocumentoClinico"("usuarioId", "tipo");

-- CreateIndex
CREATE INDEX "DocumentoClinico_usuarioId_createdAt_idx" ON "public"."DocumentoClinico"("usuarioId", "createdAt");

-- CreateIndex
CREATE INDEX "Episodio_usuarioId_idx" ON "public"."Episodio"("usuarioId");

-- CreateIndex
CREATE INDEX "Episodio_usuarioId_abertoEm_idx" ON "public"."Episodio"("usuarioId", "abertoEm");

-- CreateIndex
CREATE INDEX "Evolucao_usuarioId_idx" ON "public"."Evolucao"("usuarioId");

-- CreateIndex
CREATE INDEX "Evolucao_usuarioId_registradoEm_idx" ON "public"."Evolucao"("usuarioId", "registradoEm");

-- CreateIndex
CREATE INDEX "FontePagadora_usuarioId_idx" ON "public"."FontePagadora"("usuarioId");

-- CreateIndex
CREATE INDEX "FontePagadora_usuarioId_ativo_idx" ON "public"."FontePagadora"("usuarioId", "ativo");

-- CreateIndex
CREATE UNIQUE INDEX "FontePagadora_usuarioId_cnpj_key" ON "public"."FontePagadora"("usuarioId", "cnpj");

-- CreateIndex
CREATE INDEX "InformeRendimento_usuarioId_idx" ON "public"."InformeRendimento"("usuarioId");

-- CreateIndex
CREATE INDEX "InformeRendimento_usuarioId_anoRef_idx" ON "public"."InformeRendimento"("usuarioId", "anoRef");

-- CreateIndex
CREATE INDEX "InformeRendimento_usuarioId_status_idx" ON "public"."InformeRendimento"("usuarioId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "InformeRendimento_usuarioId_fontePagadoraId_anoRef_key" ON "public"."InformeRendimento"("usuarioId", "fontePagadoraId", "anoRef");

-- CreateIndex
CREATE INDEX "MedicacaoAtiva_usuarioId_idx" ON "public"."MedicacaoAtiva"("usuarioId");

-- CreateIndex
CREATE INDEX "MedicacaoAtiva_usuarioId_pacienteId_idx" ON "public"."MedicacaoAtiva"("usuarioId", "pacienteId");

-- CreateIndex
CREATE INDEX "ModeloPlantao_usuarioId_idx" ON "public"."ModeloPlantao"("usuarioId");

-- CreateIndex
CREATE INDEX "ModeloPlantao_usuarioId_fontePagadoraId_idx" ON "public"."ModeloPlantao"("usuarioId", "fontePagadoraId");

-- CreateIndex
CREATE INDEX "NotaFiscal_usuarioId_idx" ON "public"."NotaFiscal"("usuarioId");

-- CreateIndex
CREATE INDEX "NotaFiscal_usuarioId_dataEmissao_idx" ON "public"."NotaFiscal"("usuarioId", "dataEmissao");

-- CreateIndex
CREATE INDEX "Paciente_usuarioId_idx" ON "public"."Paciente"("usuarioId");

-- CreateIndex
CREATE INDEX "Paciente_usuarioId_createdAt_idx" ON "public"."Paciente"("usuarioId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_usuarioId_cpf_key" ON "public"."Paciente"("usuarioId", "cpf");

-- CreateIndex
CREATE INDEX "Pagamento_usuarioId_idx" ON "public"."Pagamento"("usuarioId");

-- CreateIndex
CREATE INDEX "Pagamento_usuarioId_competencia_idx" ON "public"."Pagamento"("usuarioId", "competencia");

-- CreateIndex
CREATE INDEX "Pagamento_usuarioId_status_idx" ON "public"."Pagamento"("usuarioId", "status");

-- CreateIndex
CREATE INDEX "Pagamento_usuarioId_fontePagadoraId_idx" ON "public"."Pagamento"("usuarioId", "fontePagadoraId");

-- CreateIndex
CREATE INDEX "PatientAllergy_usuarioId_idx" ON "public"."PatientAllergy"("usuarioId");

-- CreateIndex
CREATE INDEX "PatientAllergy_usuarioId_patientId_idx" ON "public"."PatientAllergy"("usuarioId", "patientId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientAllergy_usuarioId_patientId_allergenId_status_key" ON "public"."PatientAllergy"("usuarioId", "patientId", "allergenId", "status");

-- CreateIndex
CREATE INDEX "PatientCondition_usuarioId_idx" ON "public"."PatientCondition"("usuarioId");

-- CreateIndex
CREATE INDEX "PatientCondition_usuarioId_patientId_idx" ON "public"."PatientCondition"("usuarioId", "patientId");

-- CreateIndex
CREATE INDEX "PatientCondition_usuarioId_status_idx" ON "public"."PatientCondition"("usuarioId", "status");

-- CreateIndex
CREATE INDEX "PatientMedication_usuarioId_idx" ON "public"."PatientMedication"("usuarioId");

-- CreateIndex
CREATE INDEX "PatientMedication_usuarioId_patientId_idx" ON "public"."PatientMedication"("usuarioId", "patientId");

-- CreateIndex
CREATE INDEX "PatientMedication_usuarioId_active_idx" ON "public"."PatientMedication"("usuarioId", "active");

-- CreateIndex
CREATE INDEX "Plantao_usuarioId_idx" ON "public"."Plantao"("usuarioId");

-- CreateIndex
CREATE INDEX "Plantao_usuarioId_data_idx" ON "public"."Plantao"("usuarioId", "data");

-- CreateIndex
CREATE INDEX "Plantao_usuarioId_status_idx" ON "public"."Plantao"("usuarioId", "status");

-- CreateIndex
CREATE INDEX "Plantao_usuarioId_fontePagadoraId_idx" ON "public"."Plantao"("usuarioId", "fontePagadoraId");

-- CreateIndex
CREATE INDEX "ProblemaClinico_usuarioId_idx" ON "public"."ProblemaClinico"("usuarioId");

-- CreateIndex
CREATE INDEX "ProblemaClinico_usuarioId_pacienteId_idx" ON "public"."ProblemaClinico"("usuarioId", "pacienteId");

-- CreateIndex
CREATE INDEX "SinaisVitais_usuarioId_idx" ON "public"."SinaisVitais"("usuarioId");

-- CreateIndex
CREATE INDEX "SinaisVitais_usuarioId_registradoEm_idx" ON "public"."SinaisVitais"("usuarioId", "registradoEm");

-- AddForeignKey
ALTER TABLE "public"."Paciente" ADD CONSTRAINT "Paciente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Consulta" ADD CONSTRAINT "Consulta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Episodio" ADD CONSTRAINT "Episodio_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Evolucao" ADD CONSTRAINT "Evolucao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SinaisVitais" ADD CONSTRAINT "SinaisVitais_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Anexo" ADD CONSTRAINT "Anexo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Alergia" ADD CONSTRAINT "Alergia_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedicacaoAtiva" ADD CONSTRAINT "MedicacaoAtiva_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProblemaClinico" ADD CONSTRAINT "ProblemaClinico_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DocumentoClinico" ADD CONSTRAINT "DocumentoClinico_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PatientCondition" ADD CONSTRAINT "PatientCondition_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PatientMedication" ADD CONSTRAINT "PatientMedication_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Atendimento" ADD CONSTRAINT "Atendimento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PatientAllergy" ADD CONSTRAINT "PatientAllergy_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FontePagadora" ADD CONSTRAINT "FontePagadora_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ModeloPlantao" ADD CONSTRAINT "ModeloPlantao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Plantao" ADD CONSTRAINT "Plantao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pagamento" ADD CONSTRAINT "Pagamento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotaFiscal" ADD CONSTRAINT "NotaFiscal_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InformeRendimento" ADD CONSTRAINT "InformeRendimento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
