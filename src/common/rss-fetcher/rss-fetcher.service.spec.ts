import { Test, TestingModule } from '@nestjs/testing';
import { RssFetcherService } from './rss-fetcher.service';

describe('RssFetcherService', () => {
  let service: RssFetcherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RssFetcherService],
    }).compile();

    service = module.get<RssFetcherService>(RssFetcherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
