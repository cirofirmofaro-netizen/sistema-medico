-- CreateTable
CREATE TABLE "public"."Anexo" (
    "id" TEXT NOT NULL,
    "evolucaoId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "urlPublica" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Anexo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Anexo" ADD CONSTRAINT "Anexo_evolucaoId_fkey" FOREIGN KEY ("evolucaoId") REFERENCES "public"."Evolucao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
