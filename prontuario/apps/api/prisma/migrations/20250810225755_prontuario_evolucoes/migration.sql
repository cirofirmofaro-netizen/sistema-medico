-- CreateTable
CREATE TABLE "public"."Episodio" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "abertoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechadoEm" TIMESTAMP(3),

    CONSTRAINT "Episodio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Evolucao" (
    "id" TEXT NOT NULL,
    "episodioId" TEXT NOT NULL,
    "registradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resumo" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "sinaisVitais" JSONB,

    CONSTRAINT "Evolucao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Episodio" ADD CONSTRAINT "Episodio_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "public"."Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Evolucao" ADD CONSTRAINT "Evolucao_episodioId_fkey" FOREIGN KEY ("episodioId") REFERENCES "public"."Episodio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
