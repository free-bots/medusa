import { Snake } from './snake.model';
import { RssFetcherService } from '../../common/rss-fetcher/rss-fetcher.service';
import { FeedInformation } from '../../common/models/feed-information.model';
import { HttpclientService } from '../../common/httpclient/httpclient.service';

export class SnakeFeedInformation {
  public title: string;
  public link: string;
  public description?: string;
  public image?: string;
  public favicon?: string;
}

export class SnakeFeedItem {
  public title: string;
  public id: string;
  public link: string;
  public content: string;
  public author: string;
  public date: Date;
}

export class ProvidedFeedItem extends SnakeFeedItem {
  public 'contentEncoded'?: string;
}

export class SnakeParam {
  public name: string;
  public description: string;
  public defaultValue?: string | boolean | number;
  public type: 'string' | 'boolean' | 'number';
}

export enum DefaultParamName {
  MAX_ITEMS = 'maxItems',
}

export class SnakeFeederContext {
  public rssFetcher: RssFetcherService;
  public httpClient: HttpclientService;
}

export abstract class FeederSnake extends Snake {
  protected context: SnakeFeederContext;
  private params: any;
  private registeredParams: SnakeParam[];
  private isInjected = false;

  abstract registerParams(): SnakeParam[];

  abstract prepare(): Promise<void>;

  abstract provideFeedInformation(): Promise<SnakeFeedInformation>;

  abstract provideItems(): Promise<(() => Promise<SnakeFeedItem>)[]>;

  abstract cleanUp(): Promise<void>;

  protected getParam<T>(name: string): T {
    const param = this.registeredParams.find((param) => param.name === name);
    if (!param) {
      throw new Error(`Register param with name ${name} first!`);
    }

    return (this.params[param.name] || param.defaultValue) as T;
  }

  public inject(params: any, context: SnakeFeederContext): void {
    if (!context) {
      throw new Error('InvalidArgumentException context is null');
    }
    this.context = context;
    this.params = params;

    this.isInjected = true;
  }

  public async buildFeed(): Promise<FeedInformation> {
    try {
      this.checkInjection();
      this.prepareParams();
      await this.prepare();

      const feedInformation = await this.provideFeedInformation();
      const feeds = await this.getFeedItems();

      await this.cleanUp();

      return { ...feedInformation, items: feeds };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  private checkInjection() {
    if (!this.isInjected) {
      throw new Error('IllegalStateException inject before build feeds!');
    }
  }

  private async getFeedItems(): Promise<SnakeFeedItem[]> {
    const maxItems = this.getParam(DefaultParamName.MAX_ITEMS) as number;

    const items = await this.provideItems().then((provideFunctions) => {
      return FeederSnake.limit<() => Promise<SnakeFeedItem>>(provideFunctions, maxItems).map((provideFunction) => provideFunction());
    });
    return Promise.all(items);
  }

  private prepareParams() {
    this.registeredParams = this.registerParams() || [];
    this.addDefaultParams();
  }

  private addDefaultParams() {
    this.registeredParams.push({
      name: DefaultParamName.MAX_ITEMS,
      description: 'The maximum amount of items to fetch for this feed. Set this value to 0 to fetch all items',
      type: 'number',
      defaultValue: 0,
    });
  }

  private static limit<T>(array: T[], maxItems: number): T[] {
    return maxItems > 0 ? array.slice(0, maxItems) : array;
  }
}
