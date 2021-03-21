import { Test, TestingModule } from '@nestjs/testing';
import { SnakeFactoryService } from './snake-factory.service';

describe('SnakeFactoryService', () => {
  let service: SnakeFactoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SnakeFactoryService],
    }).compile();

    service = module.get<SnakeFactoryService>(SnakeFactoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
