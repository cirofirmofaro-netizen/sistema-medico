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
CREATE TYPE "public"."AtendimentoStatus" AS ENUM ('EM_ANDAMENTO', 'FINALIZADO', 'CANCELADO');

-- DropForeignKey
ALTER TABLE "public"."Anexo" DROP CONSTRAINT "Anexo_evolucaoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DocumentoClinico" DROP CONSTRAINT "DocumentoClinico_evolucaoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Evolucao" DROP CONSTRAINT "Evolucao_episodioId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Evolucao" DROP CONSTRAINT "Evolucao_usuarioId_fkey";

-- DropIndex
DROP INDEX "public"."Usuario_crm_key";

-- CreateTable
CREATE TABLE "public"."EvolucaoVersion" (
    "id" TEXT NOT NULL,
    "evolucaoId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "resumo" TEXT,
    "texto" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedBy" TEXT NOT NULL,

    CONSTRAINT "EvolucaoVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SinaisVitais" (
    "id" TEXT NOT NULL,
    "atendimentoId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "registradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pressaoSistolica" INTEGER NOT NULL,
    "pressaoDiastolica" INTEGER NOT NULL,
    "frequenciaCardiaca" INTEGER NOT NULL,
    "frequenciaRespiratoria" INTEGER NOT NULL,
    "saturacaoOxigenio" INTEGER NOT NULL,
    "temperatura" DOUBLE PRECISION NOT NULL,
    "peso" DOUBLE PRECISION,
    "altura" DOUBLE PRECISION,
    "observacoes" TEXT,

    CONSTRAINT "SinaisVitais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Atendimento" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" "public"."AtendimentoStatus" NOT NULL DEFAULT 'EM_ANDAMENTO',
    "dayHash" TEXT,

    CONSTRAINT "Atendimento_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "public"."Anexo" DROP COLUMN "evolucaoId",
ADD COLUMN     "atendimentoId" TEXT NOT NULL,
ADD COLUMN     "tipoDocumento" TEXT,
ADD COLUMN     "titulo" TEXT;

-- AlterTable
ALTER TABLE "public"."DocumentoClinico" DROP COLUMN "evolucaoId";

-- AlterTable
ALTER TABLE "public"."Evolucao" DROP COLUMN "episodioId",
DROP COLUMN "sinaisVitais",
DROP COLUMN "usuarioId",
ADD COLUMN     "atendimentoId" TEXT NOT NULL,
ADD COLUMN     "authorId" TEXT NOT NULL,
ADD COLUMN     "currentVersion" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "locked" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "resumo" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Usuario" DROP COLUMN "ativo",
DROP COLUMN "crm",
DROP COLUMN "especialidade",
DROP COLUMN "role",
ADD COLUMN     "tipo" TEXT NOT NULL DEFAULT 'medico';

-- CreateIndex
CREATE UNIQUE INDEX "EvolucaoVersion_evolucaoId_version_key" ON "public"."EvolucaoVersion"("evolucaoId", "version");

-- CreateIndex
CREATE INDEX "SinaisVitais_atendimentoId_idx" ON "public"."SinaisVitais"("atendimentoId");

-- CreateIndex
CREATE INDEX "Atendimento_patientId_serviceDate_idx" ON "public"."Atendimento"("patientId", "serviceDate");

-- CreateIndex
CREATE UNIQUE INDEX "Atendimento_patientId_serviceDate_key" ON "public"."Atendimento"("patientId", "serviceDate");

-- CreateIndex
CREATE INDEX "Anexo_atendimentoId_idx" ON "public"."Anexo"("atendimentoId");

-- CreateIndex
CREATE INDEX "Evolucao_atendimentoId_idx" ON "public"."Evolucao"("atendimentoId");

-- AddForeignKey
ALTER TABLE "public"."Evolucao" ADD CONSTRAINT "Evolucao_atendimentoId_fkey" FOREIGN KEY ("atendimentoId") REFERENCES "public"."Atendimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Evolucao" ADD CONSTRAINT "Evolucao_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EvolucaoVersion" ADD CONSTRAINT "EvolucaoVersion_evolucaoId_fkey" FOREIGN KEY ("evolucaoId") REFERENCES "public"."Evolucao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EvolucaoVersion" ADD CONSTRAINT "EvolucaoVersion_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SinaisVitais" ADD CONSTRAINT "SinaisVitais_atendimentoId_fkey" FOREIGN KEY ("atendimentoId") REFERENCES "public"."Atendimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SinaisVitais" ADD CONSTRAINT "SinaisVitais_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Anexo" ADD CONSTRAINT "Anexo_atendimentoId_fkey" FOREIGN KEY ("atendimentoId") REFERENCES "public"."Atendimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Atendimento" ADD CONSTRAINT "Atendimento_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Atendimento" ADD CONSTRAINT "Atendimento_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
