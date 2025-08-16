import { Test, TestingModule } from '@nestjs/testing';
import { ExportService } from './export.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ExportService', () => {
  let service: ExportService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    paciente: {
      findUnique: jest.fn(),
    },
    episodio: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ExportService>(ExportService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('prontuarioPDF', () => {
    it('should throw NotFoundException when paciente not found', async () => {
      mockPrismaService.paciente.findUnique.mockResolvedValue(null);

      await expect(
        service.prontuarioPDF({ pacienteId: 'non-existent-id' })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException with correct message', async () => {
      mockPrismaService.paciente.findUnique.mockResolvedValue(null);

      await expect(
        service.prontuarioPDF({ pacienteId: 'non-existent-id' })
      ).rejects.toThrow('Paciente não encontrado');
    });
  });
});
