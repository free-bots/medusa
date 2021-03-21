import { Test, TestingModule } from '@nestjs/testing';
import { RssConfigurationService } from './rss-configuration.service';

describe('RssConfigurationService', () => {
  let service: RssConfigurationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RssConfigurationService],
    }).compile();

    service = module.get<RssConfigurationService>(RssConfigurationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
