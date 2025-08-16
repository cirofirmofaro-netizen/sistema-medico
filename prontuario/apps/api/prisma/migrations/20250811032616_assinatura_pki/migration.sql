-- AlterTable
ALTER TABLE "public"."DocumentoClinico" ADD COLUMN     "assinaturaAlg" TEXT,
ADD COLUMN     "assinaturaFormato" TEXT,
ADD COLUMN     "assinaturaHash" TEXT,
ADD COLUMN     "assinaturaKey" TEXT,
ADD COLUMN     "signerCertIssuer" TEXT,
ADD COLUMN     "signerCertSubject" TEXT,
ADD COLUMN     "signerSerial" TEXT;
