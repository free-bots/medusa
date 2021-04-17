import { Test, TestingModule } from '@nestjs/testing';
import { Aria2Service } from './aria2.service';

describe('Aria2Service', () => {
  let service: Aria2Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Aria2Service],
    }).compile();

    service = module.get<Aria2Service>(Aria2Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
