-- CreateTable
CREATE TABLE "public"."AssinaturaEvento" (
    "id" TEXT NOT NULL,
    "documentoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "payload" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssinaturaEvento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."AssinaturaEvento" ADD CONSTRAINT "AssinaturaEvento_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "public"."DocumentoClinico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
