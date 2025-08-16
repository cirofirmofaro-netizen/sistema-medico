import { Test, TestingModule } from '@nestjs/testing';
import { PlantoesController } from './plantoes.controller';

describe('PlantoesController', () => {
  let controller: PlantoesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlantoesController],
    }).compile();

    controller = module.get<PlantoesController>(PlantoesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
