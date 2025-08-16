import { Test, TestingModule } from '@nestjs/testing';
import { ProntuarioService } from './prontuario.service';

describe('ProntuarioService', () => {
  let service: ProntuarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProntuarioService],
    }).compile();

    service = module.get<ProntuarioService>(ProntuarioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
