import { FillFeederSnake } from '../../snake-factory/models/fill-feeder-snake.model';
import { SnakeFeedItem, SnakeParam } from '../../snake-factory/models/feeder-snake.model';
import * as cheerio from 'cheerio';

export class SpektrumFeederSnake extends FillFeederSnake {
  public name = 'Spektrum';

  public fillFeedItem(feedItem: SnakeFeedItem): () => Promise<SnakeFeedItem> {
    return async () => {
      if (!feedItem?.link) {
        return feedItem;
      }

      const data = await this.context.httpClient.get(feedItem.link);

      const $ = cheerio.load(data);

      const $article = $('article.content');

      $article.find('div[role="navigation"]').remove();
      $article.find('aside').remove();

      $article.find('img').each((index, element) => {
        const $image = $(element);
        const src = $image.attr('data-src') || $image.attr('src');
        $image.attr('src', `https://www.spektrum.de${src}`);
      });
      feedItem.content = $article.html();

      return feedItem;
    };
  }

  public provideFetchedFeed(): Promise<any> {
    return this.context.rssFetcher.getFeed('https://www.spektrum.de/alias/spektrumdirekt-rss-feed/996406');
  }

  public registerParams(): SnakeParam[] {
    return [];
  }
}
