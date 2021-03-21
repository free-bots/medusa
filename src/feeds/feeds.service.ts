import { Injectable, NotFoundException } from '@nestjs/common';
import { SnakeFactoryService } from '../snake-factory/snake-factory.service';
import { FeederSnake } from '../snake-factory/models/feeder-snake.model';
import { RssBuilderService } from '../common/rss-builder/rss-builder.service';
import { RequestedFeedFormat } from '../common/RequestedFeedFormat';
import { RssFetcherService } from '../common/rss-fetcher/rss-fetcher.service';
import { HttpclientService } from '../common/httpclient/httpclient.service';

@Injectable()
export class FeedsService {
  constructor(
    private readonly snakeFactoryService: SnakeFactoryService,
    private readonly rssBuilderService: RssBuilderService,
    private readonly rssFetcherService: RssFetcherService,
    private readonly httpclientService: HttpclientService,
  ) {}

  public async findFeedById(id: string, params?: any, format?: RequestedFeedFormat): Promise<string> {
    const snake = this.snakeFactoryService.feederSnakes.find((snake: FeederSnake) => snake.name === id);
    if (!snake) {
      throw new NotFoundException();
    }

    snake.inject(params, {
      rssFetcher: this.rssFetcherService,
      httpClient: this.httpclientService,
    });

    await snake.prepare();
    const feedInformation = await snake.buildFeed();

    return this.rssBuilderService.build(feedInformation, format);
  }

  public async findAll(): Promise<string[]> {
    return ['feed', 'feed'];
  }
}
