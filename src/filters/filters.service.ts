import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SnakeFactoryService } from '../snake-factory/snake-factory.service';
import { RssFetcherService } from '../common/rss-fetcher/rss-fetcher.service';
import { RssBuilderService } from '../common/rss-builder/rss-builder.service';
import { FeedItem } from '../snake-factory/models/filter-snake.model';
import { RequestedFeedFormat } from '../common/RequestedFeedFormat';
import { BaseLoggingContextService } from '../common/services/base-logging-context.service';

@Injectable()
export class FiltersService extends BaseLoggingContextService {
  constructor(
    private readonly snakeFactoryService: SnakeFactoryService,
    private readonly rssFetcherService: RssFetcherService,
    private rssBuilderService: RssBuilderService,
  ) {
    super();
  }

  public async applyFilterById(id: string, params: any, format?: RequestedFeedFormat): Promise<string> {
    const { url } = params;
    const filter = this.snakeFactoryService.filterSnakes.find((snake) => snake.name === id);

    if (!filter) {
      throw new NotFoundException();
    }

    const feed = await this.rssFetcherService.getFeed(url);

    const filteredFeedItem = [];

    for (const feedItem of feed.items as any[] | FeedItem<string>[]) {
      const matcher = await filter.onFilterFeedItems(feedItem, params);

      const matches = await Promise.all(
        [
          feedItem.categories ? matcher.categories.matches(feedItem.categories) : null,
          feedItem.content ? matcher.content.matches(feedItem.content) : null,
          feedItem.contentSnippet ? matcher.contentSnippet.matches(feedItem.contentSnippet) : null,
          feedItem.creator ? matcher.creator.matches(feedItem.creator) : null,
          feedItem.guid ? matcher.guid.matches(feedItem.guid) : null,
          feedItem.isoDate ? matcher.isoDate.matches(feedItem.isoDate) : null,
          feedItem.link ? matcher.link.matches(feedItem.link) : null,
          feedItem.pubDate ? matcher.pubDate.matches(feedItem.pubDate) : null,
          feedItem.title ? matcher.title.matches(feedItem.title) : null,
        ].filter((matcher) => matcher !== undefined && matcher !== null),
      ).then((matches) => matches.reduce((previousValue, currentValue) => previousValue || currentValue));

      if (!matches) {
        filteredFeedItem.push(feedItem);
      }
    }

    return this.rssBuilderService
      .build(
        {
          link: feed.link,
          image: feed?.image?.link,
          title: feed.title,
          description: feed.description,
          favicon: feed.feedUrl,
          items: filteredFeedItem.map((item) => ({
            id: item.guid,
            author: item.creator,
            title: item.title,
            link: item.link,
            content: item.content,
            date: new Date(item.isoDate || null),
          })),
        },
        format,
      )
      .catch((reason) => {
        this.logger.error(reason);
        throw new BadRequestException();
      });
  }
}
