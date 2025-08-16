/*
  Warnings:

  - You are about to drop the column `contratante` on the `Plantao` table. All the data in the column will be lost.
  - You are about to drop the column `notas` on the `Plantao` table. All the data in the column will be lost.
  - You are about to drop the column `statusPgto` on the `Plantao` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `Plantao` table. All the data in the column will be lost.
  - You are about to drop the column `usuarioId` on the `Plantao` table. All the data in the column will be lost.
  - You are about to drop the column `valorBruto` on the `Plantao` table. All the data in the column will be lost.
  - You are about to drop the column `valorLiquido` on the `Plantao` table. All the data in the column will be lost.
  - You are about to drop the `PagamentoPlantao` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `cnpj` to the `Plantao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `data` to the `Plantao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fontePagadoraId` to the `Plantao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoVinculo` to the `Plantao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valorPrevisto` to the `Plantao` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."TipoVinculo" AS ENUM ('CLT', 'RPA', 'PJ', 'COOPERATIVA', 'AUTONOMO');

-- CreateEnum
CREATE TYPE "public"."Pagador" AS ENUM ('HOSPITAL', 'PLANTONISTA');

-- CreateEnum
CREATE TYPE "public"."StatusPlantao" AS ENUM ('AGENDADO', 'REALIZADO', 'CANCELADO', 'TROCADO');

-- CreateEnum
CREATE TYPE "public"."StatusPagamento" AS ENUM ('PENDENTE', 'PARCIAL', 'PAGO', 'EM_ATRASO');

-- CreateEnum
CREATE TYPE "public"."MeioPagamento" AS ENUM ('HOSPITAL', 'PLANTONISTA');

-- CreateEnum
CREATE TYPE "public"."StatusInforme" AS ENUM ('PENDENTE', 'SOLICITADO', 'RECEBIDO');

-- DropForeignKey
ALTER TABLE "public"."PagamentoPlantao" DROP CONSTRAINT "PagamentoPlantao_plantaoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Plantao" DROP CONSTRAINT "Plantao_usuarioId_fkey";

-- AlterTable
ALTER TABLE "public"."Plantao" DROP COLUMN "contratante",
DROP COLUMN "notas",
DROP COLUMN "statusPgto",
DROP COLUMN "tipo",
DROP COLUMN "usuarioId",
DROP COLUMN "valorBruto",
DROP COLUMN "valorLiquido",
ADD COLUMN     "cnpj" TEXT NOT NULL,
ADD COLUMN     "data" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "ehTroca" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fontePagadoraId" TEXT NOT NULL,
ADD COLUMN     "modeloId" TEXT,
ADD COLUMN     "motivoTroca" TEXT,
ADD COLUMN     "reagendadoPara" TIMESTAMP(3),
ADD COLUMN     "status" "public"."StatusPlantao" NOT NULL DEFAULT 'AGENDADO',
ADD COLUMN     "tipoVinculo" "public"."TipoVinculo" NOT NULL,
ADD COLUMN     "trocaCom" TEXT,
ADD COLUMN     "valorPrevisto" DECIMAL(12,2) NOT NULL;

-- DropTable
DROP TABLE "public"."PagamentoPlantao";

-- DropEnum
DROP TYPE "public"."StatusPgto";

-- CreateTable
CREATE TABLE "public"."FontePagadora" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "tipoVinculo" "public"."TipoVinculo" NOT NULL,
    "contatoEmail" TEXT,
    "contatoFone" TEXT,
    "inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fim" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FontePagadora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ModeloPlantao" (
    "id" TEXT NOT NULL,
    "fontePagadoraId" TEXT NOT NULL,
    "local" TEXT NOT NULL,
    "descricao" TEXT,
    "inicioPadrao" TEXT NOT NULL,
    "fimPadrao" TEXT NOT NULL,
    "duracaoMin" INTEGER NOT NULL,
    "valorPrevisto" DECIMAL(12,2) NOT NULL,
    "tipoVinculo" "public"."TipoVinculo" NOT NULL,
    "pagador" "public"."Pagador" NOT NULL,
    "fixo" BOOLEAN NOT NULL DEFAULT false,
    "recorrencia" JSONB,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModeloPlantao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pagamento" (
    "id" TEXT NOT NULL,
    "plantaoId" TEXT,
    "fontePagadoraId" TEXT NOT NULL,
    "competencia" TEXT NOT NULL,
    "valorPrevisto" DECIMAL(12,2) NOT NULL,
    "valorPago" DECIMAL(12,2) NOT NULL,
    "dataPagamento" TIMESTAMP(3),
    "status" "public"."StatusPagamento" NOT NULL DEFAULT 'PENDENTE',
    "meio" "public"."MeioPagamento" NOT NULL,
    "nfId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NotaFiscal" (
    "id" TEXT NOT NULL,
    "plantaoId" TEXT,
    "fontePagadoraId" TEXT,
    "numero" TEXT NOT NULL,
    "serie" TEXT,
    "valor" DECIMAL(12,2) NOT NULL,
    "dataEmissao" TIMESTAMP(3) NOT NULL,
    "pdfKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotaFiscal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InformeRendimento" (
    "id" TEXT NOT NULL,
    "anoRef" INTEGER NOT NULL,
    "fontePagadoraId" TEXT NOT NULL,
    "status" "public"."StatusInforme" NOT NULL DEFAULT 'PENDENTE',
    "pdfKey" TEXT,
    "anotacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InformeRendimento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FontePagadora_cnpj_key" ON "public"."FontePagadora"("cnpj");

-- CreateIndex
CREATE INDEX "FontePagadora_cnpj_idx" ON "public"."FontePagadora"("cnpj");

-- CreateIndex
CREATE INDEX "FontePagadora_ativo_idx" ON "public"."FontePagadora"("ativo");

-- CreateIndex
CREATE INDEX "ModeloPlantao_fontePagadoraId_idx" ON "public"."ModeloPlantao"("fontePagadoraId");

-- CreateIndex
CREATE INDEX "Pagamento_fontePagadoraId_idx" ON "public"."Pagamento"("fontePagadoraId");

-- CreateIndex
CREATE INDEX "Pagamento_competencia_idx" ON "public"."Pagamento"("competencia");

-- CreateIndex
CREATE INDEX "Pagamento_status_idx" ON "public"."Pagamento"("status");

-- CreateIndex
CREATE INDEX "Pagamento_plantaoId_idx" ON "public"."Pagamento"("plantaoId");

-- CreateIndex
CREATE INDEX "NotaFiscal_numero_idx" ON "public"."NotaFiscal"("numero");

-- CreateIndex
CREATE INDEX "NotaFiscal_dataEmissao_idx" ON "public"."NotaFiscal"("dataEmissao");

-- CreateIndex
CREATE INDEX "InformeRendimento_anoRef_idx" ON "public"."InformeRendimento"("anoRef");

-- CreateIndex
CREATE INDEX "InformeRendimento_status_idx" ON "public"."InformeRendimento"("status");

-- CreateIndex
CREATE UNIQUE INDEX "InformeRendimento_fontePagadoraId_anoRef_key" ON "public"."InformeRendimento"("fontePagadoraId", "anoRef");

-- CreateIndex
CREATE INDEX "Plantao_fontePagadoraId_idx" ON "public"."Plantao"("fontePagadoraId");

-- CreateIndex
CREATE INDEX "Plantao_data_idx" ON "public"."Plantao"("data");

-- CreateIndex
CREATE INDEX "Plantao_status_idx" ON "public"."Plantao"("status");

-- CreateIndex
CREATE INDEX "Plantao_cnpj_idx" ON "public"."Plantao"("cnpj");

-- AddForeignKey
ALTER TABLE "public"."ModeloPlantao" ADD CONSTRAINT "ModeloPlantao_fontePagadoraId_fkey" FOREIGN KEY ("fontePagadoraId") REFERENCES "public"."FontePagadora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Plantao" ADD CONSTRAINT "Plantao_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "public"."ModeloPlantao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Plantao" ADD CONSTRAINT "Plantao_fontePagadoraId_fkey" FOREIGN KEY ("fontePagadoraId") REFERENCES "public"."FontePagadora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pagamento" ADD CONSTRAINT "Pagamento_plantaoId_fkey" FOREIGN KEY ("plantaoId") REFERENCES "public"."Plantao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pagamento" ADD CONSTRAINT "Pagamento_fontePagadoraId_fkey" FOREIGN KEY ("fontePagadoraId") REFERENCES "public"."FontePagadora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pagamento" ADD CONSTRAINT "Pagamento_nfId_fkey" FOREIGN KEY ("nfId") REFERENCES "public"."NotaFiscal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotaFiscal" ADD CONSTRAINT "NotaFiscal_plantaoId_fkey" FOREIGN KEY ("plantaoId") REFERENCES "public"."Plantao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotaFiscal" ADD CONSTRAINT "NotaFiscal_fontePagadoraId_fkey" FOREIGN KEY ("fontePagadoraId") REFERENCES "public"."FontePagadora"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InformeRendimento" ADD CONSTRAINT "InformeRendimento_fontePagadoraId_fkey" FOREIGN KEY ("fontePagadoraId") REFERENCES "public"."FontePagadora"("id") ON DELETE CASCADE ON UPDATE CASCADE;
