import { Test, TestingModule } from '@nestjs/testing';
import { AssinaturaService } from './assinatura.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('AssinaturaService', () => {
  let service: AssinaturaService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    documentoClinico: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssinaturaService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AssinaturaService>(AssinaturaService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signRequest', () => {
    it('should throw NotFoundException when documento not found', async () => {
      mockPrismaService.documentoClinico.findUnique.mockResolvedValue(null);

      await expect(
        service.signRequest('non-existent-id')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when documento already signed', async () => {
      mockPrismaService.documentoClinico.findUnique.mockResolvedValue({
        id: 'test-id',
        assinaturaStatus: 'ASSINADO',
        fileKey: 'test.pdf',
      });

      await expect(
        service.signRequest('test-id')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('signCallback', () => {
    it('should throw NotFoundException when documento not found', async () => {
      mockPrismaService.documentoClinico.findUnique.mockResolvedValue(null);

      await expect(
        service.signCallback('non-existent-id', {
          formato: 'PAdES',
          assinaturaBase64: 'test',
        })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when documento already signed', async () => {
      mockPrismaService.documentoClinico.findUnique.mockResolvedValue({
        id: 'test-id',
        assinaturaStatus: 'ASSINADO',
        fileKey: 'test.pdf',
      });

      await expect(
        service.signCallback('test-id', {
          formato: 'PAdES',
          assinaturaBase64: 'test',
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('signedUrl', () => {
    it('should throw NotFoundException when documento not found', async () => {
      mockPrismaService.documentoClinico.findUnique.mockResolvedValue(null);

      await expect(
        service.signedUrl('non-existent-id')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when documento not signed', async () => {
      mockPrismaService.documentoClinico.findUnique.mockResolvedValue({
        id: 'test-id',
        assinaturaStatus: 'NAO_ASSINADO',
        fileKey: 'test.pdf',
      });

      await expect(
        service.signedUrl('test-id')
      ).rejects.toThrow(BadRequestException);
    });
  });
});
