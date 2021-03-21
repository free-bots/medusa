import { Test, TestingModule } from '@nestjs/testing';
import { RssBuilderService } from './rss-builder.service';

describe('RssBuilderService', () => {
  let service: RssBuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RssBuilderService],
    }).compile();

    service = module.get<RssBuilderService>(RssBuilderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
