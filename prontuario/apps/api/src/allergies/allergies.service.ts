import { Injectable, ForbiddenException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { canonicalize } from '../common/canonicalize';
import { AllergyStatus, AllergySeverity, AllergySource } from '@prisma/client';

@Injectable()
export class AllergiesService {
  constructor(private prisma: PrismaService) {}

  // Buscar alergenos por termo (incluindo sinônimos)
  async searchAllergens(query: string, take = 20) {
    const canonicalQuery = canonicalize(query);
    
    if (!canonicalQuery) {
      return [];
    }

    return this.prisma.allergen.findMany({
      where: {
        OR: [
          { canonical: { contains: canonicalQuery } },
          { synonyms: { some: { canonical: { contains: canonicalQuery } } } },
        ],
      },
      include: {
        synonyms: {
          select: { value: true },
        },
        crossRefsTo: {
          select: { toId: true, relation: true },
        },
      },
      take,
      orderBy: { name: 'asc' },
    });
  }

  // Listar alergias de um paciente
  async getPatientAllergies(patientId: string) {
    return this.prisma.patientAllergy.findMany({
      where: { patientId },
      include: {
        allergen: {
          include: {
            synonyms: {
              select: { value: true },
            },
          },
        },
        recordedByUser: {
          select: { id: true, nome: true },
        },
      },
      orderBy: [
        { status: 'asc' }, // ACTIVE primeiro
        { severity: 'desc' }, // SEVERE primeiro
        { recordedAt: 'desc' },
      ],
    });
  }

  // Criar alergia do paciente
  async createPatientAllergy(
    patientId: string,
    professionalId: string,
    data: {
      allergenId: string;
      severity?: AllergySeverity;
      reactions?: string;
      onsetDate?: Date;
      notes?: string;
      source?: AllergySource;
      status?: AllergyStatus;
    },
  ) {
    // Verificar se já existe alergia ativa para o mesmo alergeno
    const existingActive = await this.prisma.patientAllergy.findFirst({
      where: {
        patientId,
        allergenId: data.allergenId,
        status: AllergyStatus.ACTIVE,
      },
    });

    if (existingActive) {
      const allergen = await this.prisma.allergen.findUnique({
        where: { id: data.allergenId },
      });
      throw new ConflictException(
        `Paciente já possui alergia ativa para ${allergen?.name || 'este alergeno'}`,
      );
    }

    return this.prisma.patientAllergy.create({
      data: {
        patientId,
        allergenId: data.allergenId,
        severity: data.severity || AllergySeverity.UNKNOWN,
        reactions: data.reactions,
        onsetDate: data.onsetDate,
        notes: data.notes,
        source: data.source || AllergySource.PATIENT,
        recordedBy: professionalId,
        status: data.status || AllergyStatus.ACTIVE,
      } as any,
      include: {
        allergen: {
          include: {
            synonyms: {
              select: { value: true },
            },
          },
        },
        recordedByUser: {
          select: { id: true, nome: true },
        },
      },
    });
  }

  // Atualizar alergia do paciente
  async updatePatientAllergy(
    patientId: string,
    allergyId: string,
    professionalId: string,
    data: {
      severity?: AllergySeverity;
      reactions?: string;
      onsetDate?: Date;
      notes?: string;
      status?: AllergyStatus;
    },
  ) {
    const allergy = await this.prisma.patientAllergy.findFirst({
      where: {
        id: allergyId,
        patientId,
      },
    });

    if (!allergy) {
      throw new NotFoundException('Alergia não encontrada');
    }

    return this.prisma.patientAllergy.update({
      where: { id: allergyId },
      data: {
        severity: data.severity,
        reactions: data.reactions,
        onsetDate: data.onsetDate,
        notes: data.notes,
        status: data.status,
        lastUpdated: new Date(),
      },
      include: {
        allergen: {
          include: {
            synonyms: {
              select: { value: true },
            },
          },
        },
        recordedByUser: {
          select: { id: true, nome: true },
        },
      },
    });
  }

  // Verificar se paciente tem alergias graves ativas
  async hasSevereActiveAllergies(patientId: string) {
    const severeAllergies = await this.prisma.patientAllergy.findMany({
      where: {
        patientId,
        status: AllergyStatus.ACTIVE,
        severity: AllergySeverity.SEVERE,
      },
      include: {
        allergen: {
          select: { name: true },
        },
      },
    });

    return severeAllergies;
  }

  // Verificar interação medicamentosa (stub para futuro)
  async checkDrugInteraction(patientId: string, drugName: string) {
    const canonicalDrug = canonicalize(drugName);
    
    const activeDrugAllergies = await this.prisma.patientAllergy.findMany({
      where: {
        patientId,
        status: AllergyStatus.ACTIVE,
        allergen: {
          category: 'DRUG',
          OR: [
            { canonical: { contains: canonicalDrug } },
            { synonyms: { some: { canonical: { contains: canonicalDrug } } } },
          ],
        },
      },
      include: {
        allergen: {
          select: { name: true, synonyms: { select: { value: true } } },
        },
      },
    });

    return activeDrugAllergies;
  }
}
