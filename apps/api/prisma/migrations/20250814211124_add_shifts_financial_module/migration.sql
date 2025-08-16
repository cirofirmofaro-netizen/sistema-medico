-- CreateEnum
CREATE TYPE "public"."ConsultaTipo" AS ENUM ('PRESENCIAL', 'TELE');

-- CreateEnum
CREATE TYPE "public"."ConsultaStatus" AS ENUM ('AGENDADA', 'CONCLUIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "public"."StatusPgto" AS ENUM ('PENDENTE', 'PAGO', 'PARCIAL', 'ATRASADO');

-- CreateTable
CREATE TABLE "public"."Paciente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "dtNasc" TIMESTAMP(3),
    "cpf" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Consulta" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT,
    "tipo" "public"."ConsultaTipo" NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fim" TIMESTAMP(3) NOT NULL,
    "status" "public"."ConsultaStatus" NOT NULL DEFAULT 'AGENDADA',
    "salaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Consulta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Plantao" (
    "id" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fim" TIMESTAMP(3) NOT NULL,
    "local" TEXT NOT NULL,
    "contratante" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valorBruto" DECIMAL(12,2) NOT NULL,
    "valorLiquido" DECIMAL(12,2),
    "statusPgto" "public"."StatusPgto" NOT NULL DEFAULT 'PENDENTE',
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Plantao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PagamentoPlantao" (
    "id" TEXT NOT NULL,
    "plantaoId" TEXT NOT NULL,
    "dtPrevista" TIMESTAMP(3),
    "dtPgto" TIMESTAMP(3),
    "valorPago" DECIMAL(12,2) NOT NULL,
    "comprovanteKey" TEXT,
    "obs" TEXT,

    CONSTRAINT "PagamentoPlantao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_cpf_key" ON "public"."Paciente"("cpf");

-- AddForeignKey
ALTER TABLE "public"."Consulta" ADD CONSTRAINT "Consulta_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "public"."Paciente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PagamentoPlantao" ADD CONSTRAINT "PagamentoPlantao_plantaoId_fkey" FOREIGN KEY ("plantaoId") REFERENCES "public"."Plantao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
