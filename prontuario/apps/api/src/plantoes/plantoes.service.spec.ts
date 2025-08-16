import { Test, TestingModule } from '@nestjs/testing';
import { PlantoesService } from './plantoes.service';

describe('PlantoesService', () => {
  let service: PlantoesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlantoesService],
    }).compile();

    service = module.get<PlantoesService>(PlantoesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
