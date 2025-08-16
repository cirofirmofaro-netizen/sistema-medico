import { PrismaClient } from '@prisma/client'
import { canonicalize } from '../src/common/canonicalize'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding conditions...')

  // Artrite Reumatoide
  const artriteReumatoide = await prisma.condition.create({
    data: {
      name: 'Artrite Reumatoide',
      canonical: canonicalize('Artrite Reumatoide'),
      icd10: 'M06.9',
      chronicDefault: true,
      treatableDefault: true,
      allowRecurrence: true,
      synonyms: {
        create: [
          { value: 'AR', canonical: canonicalize('AR') },
          { value: 'RA', canonical: canonicalize('RA') },
          { value: 'Rheumatoid arthritis', canonical: canonicalize('Rheumatoid arthritis') },
        ]
      }
    }
  })

  // Esclerose Múltipla
  const escleroseMultipla = await prisma.condition.create({
    data: {
      name: 'Esclerose Múltipla',
      canonical: canonicalize('Esclerose Múltipla'),
      icd10: 'G35',
      chronicDefault: true,
      treatableDefault: true,
      allowRecurrence: true,
      synonyms: {
        create: [
          { value: 'EM', canonical: canonicalize('EM') },
          { value: 'MS', canonical: canonicalize('MS') },
        ]
      }
    }
  })

  // Hipertensão Arterial Sistêmica
  const hipertensao = await prisma.condition.create({
    data: {
      name: 'Hipertensão Arterial Sistêmica',
      canonical: canonicalize('Hipertensão Arterial Sistêmica'),
      icd10: 'I10',
      chronicDefault: true,
      treatableDefault: true,
      allowRecurrence: true,
      synonyms: {
        create: [
          { value: 'HAS', canonical: canonicalize('HAS') },
          { value: 'Hypertension', canonical: canonicalize('Hypertension') },
          { value: 'HTN', canonical: canonicalize('HTN') },
        ]
      }
    }
  })

  // Diabetes Mellitus tipo 2
  const diabetes = await prisma.condition.create({
    data: {
      name: 'Diabetes Mellitus tipo 2',
      canonical: canonicalize('Diabetes Mellitus tipo 2'),
      icd10: 'E11',
      chronicDefault: true,
      treatableDefault: true,
      allowRecurrence: true,
      synonyms: {
        create: [
          { value: 'DM2', canonical: canonicalize('DM2') },
          { value: 'T2DM', canonical: canonicalize('T2DM') },
        ]
      }
    }
  })

  // Amigdalite Aguda
  const amigdalite = await prisma.condition.create({
    data: {
      name: 'Amigdalite Aguda',
      canonical: canonicalize('Amigdalite Aguda'),
      icd10: 'J03',
      chronicDefault: false,
      treatableDefault: true,
      allowRecurrence: true,
      typicalDurationDays: 7,
      synonyms: {
        create: [
          { value: 'Amigdalite', canonical: canonicalize('Amigdalite') },
          { value: 'Tonsillitis', canonical: canonicalize('Tonsillitis') },
        ]
      }
    }
  })

  console.log('✅ Conditions seeded successfully!')
  console.log(`Created ${await prisma.condition.count()} conditions`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
