import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const canonicalize = (s?: string) =>
  (s ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

async function seedAllergens() {
  try {
    console.log('🌱 Iniciando seed de alergenos...');

    // 1. Dipirona (metamizol)
    const dipirona = await prisma.allergen.create({
      data: {
        name: 'Dipirona',
        canonical: canonicalize('Dipirona'),
        category: 'DRUG',
        snomed: 'SCTID:387458008',
        synonyms: {
          create: [
            { value: 'Metamizol', canonical: canonicalize('Metamizol') },
            { value: 'Novalgina', canonical: canonicalize('Novalgina') },
          ],
        },
      },
    });

    // 2. Amoxicilina
    const amoxicilina = await prisma.allergen.create({
      data: {
        name: 'Amoxicilina',
        canonical: canonicalize('Amoxicilina'),
        category: 'DRUG',
        snomed: 'SCTID:387458009',
        synonyms: {
          create: [
            { value: 'Amox', canonical: canonicalize('Amox') },
            { value: 'Amoxil', canonical: canonicalize('Amoxil') },
          ],
        },
      },
    });

    // 3. Penicilinas
    const penicilinas = await prisma.allergen.create({
      data: {
        name: 'Penicilinas',
        canonical: canonicalize('Penicilinas'),
        category: 'DRUG',
        snomed: 'SCTID:387458010',
        synonyms: {
          create: [
            { value: 'Penicillin', canonical: canonicalize('Penicillin') },
            { value: 'Penicilina', canonical: canonicalize('Penicilina') },
          ],
        },
      },
    });

    // 4. AAS (ácido acetilsalicílico)
    const aas = await prisma.allergen.create({
      data: {
        name: 'AAS (Ácido Acetilsalicílico)',
        canonical: canonicalize('AAS (Ácido Acetilsalicílico)'),
        category: 'DRUG',
        snomed: 'SCTID:387458011',
        synonyms: {
          create: [
            { value: 'Aspirina', canonical: canonicalize('Aspirina') },
            { value: 'Ácido Acetilsalicílico', canonical: canonicalize('Ácido Acetilsalicílico') },
          ],
        },
      },
    });

    // 5. Amendoim
    const amendoim = await prisma.allergen.create({
      data: {
        name: 'Amendoim',
        canonical: canonicalize('Amendoim'),
        category: 'FOOD',
        snomed: 'SCTID:387458012',
        synonyms: {
          create: [
            { value: 'Peanut', canonical: canonicalize('Peanut') },
            { value: 'Groundnut', canonical: canonicalize('Groundnut') },
          ],
        },
      },
    });

    // 6. Látex
    const latex = await prisma.allergen.create({
      data: {
        name: 'Látex',
        canonical: canonicalize('Látex'),
        category: 'ENVIRONMENT',
        snomed: 'SCTID:387458013',
        synonyms: {
          create: [
            { value: 'Latex', canonical: canonicalize('Latex') },
            { value: 'Borracha Natural', canonical: canonicalize('Borracha Natural') },
          ],
        },
      },
    });

    // 7. Criar cross-reference entre Penicilinas e Amoxicilina
    await prisma.allergenCrossRef.create({
      data: {
        fromId: penicilinas.id,
        toId: amoxicilina.id,
        relation: 'CLASS_MEMBER',
      },
    });

    console.log('✅ Seed de alergenos concluído!');
    console.log(`📊 Criados ${await prisma.allergen.count()} alergenos`);
    console.log(`📊 Criados ${await prisma.allergenSynonym.count()} sinônimos`);
    console.log(`📊 Criados ${await prisma.allergenCrossRef.count()} cross-references`);

  } catch (error) {
    console.error('❌ Erro no seed de alergenos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedAllergens();
}

export { seedAllergens };
