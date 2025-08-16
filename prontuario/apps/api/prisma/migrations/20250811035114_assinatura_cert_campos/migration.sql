-- CreateEnum
CREATE TYPE "public"."CertStatus" AS ENUM ('VALIDO', 'REVOGADO', 'DESCONHECIDO');

-- AlterTable
ALTER TABLE "public"."DocumentoClinico" ADD COLUMN     "certStatus" "public"."CertStatus" DEFAULT 'DESCONHECIDO',
ADD COLUMN     "certValidadoEm" TIMESTAMP(3),
ADD COLUMN     "signerChainPem" JSONB;
