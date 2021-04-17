import { Test, TestingModule } from '@nestjs/testing';
import { ContextBuilderService } from './context-builder.service';

describe('ContextBuilderService', () => {
  let service: ContextBuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContextBuilderService],
    }).compile();

    service = module.get<ContextBuilderService>(ContextBuilderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
