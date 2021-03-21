import { Test, TestingModule } from '@nestjs/testing';
import { FeedsController } from './feedsController';

describe('FeedController', () => {
  let controller: FeedsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedsController],
    }).compile();

    controller = module.get<FeedsController>(FeedsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
