import { Test, TestingModule } from '@nestjs/testing';
import { CommonConfigurationService } from './common-configuration.service';

describe('CommonConfigurationService', () => {
  let service: CommonConfigurationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommonConfigurationService],
    }).compile();

    service = module.get<CommonConfigurationService>(CommonConfigurationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
