import { Test, TestingModule } from '@nestjs/testing';
import { ProntuarioController } from './prontuario.controller';

describe('ProntuarioController', () => {
  let controller: ProntuarioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProntuarioController],
    }).compile();

    controller = module.get<ProntuarioController>(ProntuarioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
