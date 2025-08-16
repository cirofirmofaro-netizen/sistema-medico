-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'MEDICO', 'ENFERMEIRO', 'RECEPCIONISTA');

-- AlterTable
ALTER TABLE "public"."Consulta" ADD COLUMN     "usuarioId" TEXT;

-- AlterTable
ALTER TABLE "public"."DocumentoClinico" ADD COLUMN     "usuarioId" TEXT;

-- AlterTable
ALTER TABLE "public"."Episodio" ADD COLUMN     "usuarioId" TEXT;

-- AlterTable
ALTER TABLE "public"."Evolucao" ADD COLUMN     "usuarioId" TEXT;

-- AlterTable
ALTER TABLE "public"."Plantao" ADD COLUMN     "usuarioId" TEXT;

-- CreateTable
CREATE TABLE "public"."Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "crm" TEXT,
    "especialidade" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "role" "public"."UserRole" NOT NULL DEFAULT 'MEDICO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "public"."Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_crm_key" ON "public"."Usuario"("crm");

-- AddForeignKey
ALTER TABLE "public"."Consulta" ADD CONSTRAINT "Consulta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Episodio" ADD CONSTRAINT "Episodio_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Evolucao" ADD CONSTRAINT "Evolucao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Plantao" ADD CONSTRAINT "Plantao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DocumentoClinico" ADD CONSTRAINT "DocumentoClinico_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
