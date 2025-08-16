-- CreateEnum
CREATE TYPE "public"."Severidade" AS ENUM ('LEVE', 'MODERADA', 'GRAVE');

-- CreateEnum
CREATE TYPE "public"."StatusProblema" AS ENUM ('ATIVO', 'RESOLVIDO');

-- CreateTable
CREATE TABLE "public"."Alergia" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "reacao" TEXT,
    "severidade" "public"."Severidade",
    "observadoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alergia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MedicacaoAtiva" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "dose" TEXT,
    "via" TEXT,
    "frequencia" TEXT,
    "inicioEm" TIMESTAMP(3),
    "terminoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicacaoAtiva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProblemaClinico" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "cid" TEXT,
    "status" "public"."StatusProblema" NOT NULL DEFAULT 'ATIVO',
    "inicioEm" TIMESTAMP(3),
    "terminoEm" TIMESTAMP(3),
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProblemaClinico_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Alergia" ADD CONSTRAINT "Alergia_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "public"."Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedicacaoAtiva" ADD CONSTRAINT "MedicacaoAtiva_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "public"."Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProblemaClinico" ADD CONSTRAINT "ProblemaClinico_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "public"."Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
