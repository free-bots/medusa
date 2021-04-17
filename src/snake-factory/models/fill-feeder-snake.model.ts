import { FeederSnake, ProvidedFeedItem, SnakeFeedInformation, SnakeFeedItem } from './feeder-snake.model';

export abstract class FillFeederSnake extends FeederSnake {
  private feedInformation: SnakeFeedInformation;
  private feedItems: SnakeFeedItem[];

  abstract fillFeedItem(feedItem: ProvidedFeedItem): () => Promise<SnakeFeedItem>;

  abstract provideFetchedFeed(): Promise<any>;

  public async prepare(): Promise<void> {
    const feed = await this.provideFetchedFeed();

    this.feedInformation = {
      title: feed.title,
      description: feed.description,
      favicon: feed.image?.link,
      image: feed.image?.link,
      link: feed.link,
    };

    this.feedItems = feed.items.map(
      (item) =>
        ({
          title: item.title,
          id: item.guid,
          link: item.link,
          content: item.content,
          contentEncoded: item['content:encoded'],
          author: item.creator,
          date: new Date(item.isoDate || null),
        } as ProvidedFeedItem),
    );

    return Promise.resolve(undefined);
  }

  public cleanUp(): Promise<void> {
    this.feedInformation = null;
    this.feedItems = [];
    return Promise.resolve(undefined);
  }

  public provideFeedInformation(): Promise<SnakeFeedInformation> {
    return Promise.resolve(this.feedInformation);
  }

  public async provideItems(): Promise<(() => Promise<SnakeFeedItem>)[]> {
    return this.feedItems.map((item) => this.fillFeedItem(item));
  }
}
