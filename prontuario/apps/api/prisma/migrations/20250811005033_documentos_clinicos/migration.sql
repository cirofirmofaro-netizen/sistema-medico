-- CreateEnum
CREATE TYPE "public"."DocumentoTipo" AS ENUM ('RECEITA', 'ATESTADO');

-- CreateEnum
CREATE TYPE "public"."AssinaturaStatus" AS ENUM ('NAO_ASSINADO', 'ASSINADO');

-- CreateTable
CREATE TABLE "public"."DocumentoClinico" (
    "id" TEXT NOT NULL,
    "tipo" "public"."DocumentoTipo" NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "evolucaoId" TEXT,
    "fileKey" TEXT NOT NULL,
    "urlPublica" TEXT,
    "mimeType" TEXT NOT NULL DEFAULT 'application/pdf',
    "hashSha256" TEXT,
    "tamanhoBytes" INTEGER,
    "assinaturaStatus" "public"."AssinaturaStatus" NOT NULL DEFAULT 'NAO_ASSINADO',
    "signedAt" TIMESTAMP(3),
    "signerName" TEXT,
    "payloadJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentoClinico_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."DocumentoClinico" ADD CONSTRAINT "DocumentoClinico_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "public"."Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DocumentoClinico" ADD CONSTRAINT "DocumentoClinico_evolucaoId_fkey" FOREIGN KEY ("evolucaoId") REFERENCES "public"."Evolucao"("id") ON DELETE SET NULL ON UPDATE CASCADE;
