import { Test, TestingModule } from '@nestjs/testing';
import { Aria2DownloadHelperService } from './aria2-download-helper.service';

describe('Aria2DownloadHelperService', () => {
  let service: Aria2DownloadHelperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Aria2DownloadHelperService],
    }).compile();

    service = module.get<Aria2DownloadHelperService>(Aria2DownloadHelperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
