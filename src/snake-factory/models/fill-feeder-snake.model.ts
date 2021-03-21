import { FeederSnake, SnakeFeedInformation, SnakeFeedItem } from './feeder-snake.model';

export abstract class FillFeederSnake extends FeederSnake {
  private feedInformation: SnakeFeedInformation;
  private feedItems: SnakeFeedItem[];

  abstract fillFeedItem(feedItem: SnakeFeedItem): Promise<SnakeFeedItem>;

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
          author: item.creator,
          date: new Date(item.isoDate || null),
        } as SnakeFeedItem),
    );

    return Promise.resolve(undefined);
  }

  public provideFeedInformation(): Promise<SnakeFeedInformation> {
    return Promise.resolve(this.feedInformation);
  }

  public provideItems(): Promise<SnakeFeedItem[]> {
    return Promise.all(this.feedItems.map((item) => this.fillFeedItem(item)));
  }
}
