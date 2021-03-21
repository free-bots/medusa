import { Snake } from './snake.model';
import { RssFetcherService } from '../../common/rss-fetcher/rss-fetcher.service';
import { FeedInformation } from '../../common/models/feed-information.model';
import { HttpclientService } from '../../common/httpclient/httpclient.service';

export class SnakeFeedInformation {
  title: string;
  link: string;
  description?: string;
  image?: string;
  favicon?: string;
}

export class SnakeFeedItem {
  title: string;
  id: string;
  link: string;
  content: string;
  author: string;
  date: Date;
}

export class SnakeFeederUtils {
  public rssFetcher: RssFetcherService;
  public httpClient: HttpclientService;
}

export abstract class FeederSnake extends Snake {
  protected utils: SnakeFeederUtils;
  protected params: any;

  private isInjected = false;

  abstract prepare(): Promise<void>;

  abstract provideFeedInformation(): Promise<SnakeFeedInformation>;

  abstract provideItems(): Promise<SnakeFeedItem[]>;

  public inject(params: any, utils: SnakeFeederUtils): void {
    if (!utils) {
      throw new Error('InvalidArgumentException utils is null');
    }
    this.utils = utils;
    this.params = params;

    this.isInjected = true;
  }

  public async buildFeed(): Promise<FeedInformation> {
    if (!this.isInjected) {
      throw new Error('IllegalStateException inject before build feeds!');
    }
    await this.prepare();
    const feedInformation = await this.provideFeedInformation();
    const feeds = await this.provideItems();

    return { ...feedInformation, items: feeds };
  }
}
