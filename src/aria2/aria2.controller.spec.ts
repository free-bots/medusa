import { Test, TestingModule } from '@nestjs/testing';
import { Aria2Controller } from './aria2.controller';

describe('Aria2Controller', () => {
  let controller: Aria2Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Aria2Controller],
    }).compile();

    controller = module.get<Aria2Controller>(Aria2Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
