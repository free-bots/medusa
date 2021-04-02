import { Injectable, NotFoundException } from '@nestjs/common';
import { SnakeFactoryService } from '../snake-factory/snake-factory.service';
import { FeederSnake } from '../snake-factory/models/feeder-snake.model';
import { RssBuilderService } from '../common/rss-builder/rss-builder.service';
import { RequestedFeedFormat } from '../common/RequestedFeedFormat';
import { RssFetcherService } from '../common/rss-fetcher/rss-fetcher.service';
import { HttpclientService } from '../common/httpclient/httpclient.service';
import { CacheService } from '../common/cache/cache.service';
import { BaseLoggingContextService } from '../common/services/base-logging-context.service';

@Injectable()
export class FeedsService extends BaseLoggingContextService {
  constructor(
    private readonly snakeFactoryService: SnakeFactoryService,
    private readonly rssBuilderService: RssBuilderService,
    private readonly rssFetcherService: RssFetcherService,
    private readonly httpclientService: HttpclientService,
    private readonly cacheService: CacheService,
  ) {
    super();
  }

  public async findFeedById(id: string, params?: any, format?: RequestedFeedFormat): Promise<string> {
    const cacheKey = this.createFindByIdKey(id, params, format);
    const cachedResponse = await this.cacheService.get<string>(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    const snake = this.snakeFactoryService.feederSnakes.find((snake: FeederSnake) => snake.name === id);
    if (!snake) {
      throw new NotFoundException();
    }

    snake.inject(params, {
      rssFetcher: this.rssFetcherService,
      httpClient: this.httpclientService,
    });

    const feedInformation = await snake.buildFeed();
    const response = await this.rssBuilderService.build(feedInformation, format);

    await this.cacheService.set(cacheKey, response);
    return response;
  }

  private createFindByIdKey(id: string, params?: any, format?: RequestedFeedFormat): string {
    try {
      return `${id}-${JSON.stringify(params)}-${format}`;
    } catch (e) {
      this.logger.error(e);
      return `${id}-${format}`;
    }
  }

  public async findAll(): Promise<string[]> {
    return ['feed', 'feed'];
  }
}
