import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MedicationsService {
  constructor(private prisma: PrismaService) {}

  async getPatientMedications(patientId: string) {
    const medications = await this.prisma.patientMedication.findMany({
      where: { patientId },
      orderBy: [
        { active: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return medications;
  }

  async createMedication(patientId: string, data: any) {
    const medication = await this.prisma.patientMedication.create({
      data: {
        patientId,
        name: data.name,
        dose: data.dose,
        frequency: data.frequency,
        route: data.route,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        notes: data.notes,
        active: data.active !== false // default true
      } as any
    });

    return medication;
  }

  async updateMedication(patientId: string, medId: string, data: any) {
    const medication = await this.prisma.patientMedication.update({
      where: { 
        id: medId,
        patientId // Garantir que pertence ao paciente
      },
      data: {
        name: data.name,
        dose: data.dose,
        frequency: data.frequency,
        route: data.route,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        notes: data.notes,
        active: data.active
      }
    });

    return medication;
  }
}
