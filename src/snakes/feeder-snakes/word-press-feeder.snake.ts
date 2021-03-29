import { FillFeederSnake } from '../../snake-factory/models/fill-feeder-snake.model';
import { SnakeFeedItem, SnakeParam } from '../../snake-factory/models/feeder-snake.model';
import * as cheerio from 'cheerio';

export class WordPressFeederSnake extends FillFeederSnake {
  public name = 'WordPress';

  public registerParams(): SnakeParam[] {
    return [{ name: 'url', description: 'Url of the Wordpress blog', defaultValue: null, type: 'string' }];
  }

  public fillFeedItem(feedItem: SnakeFeedItem): () => Promise<SnakeFeedItem> {
    return () =>
      new Promise<SnakeFeedItem>(async (resolve) => {
        if (feedItem?.link) {
          try {
            const data = await this.context.httpClient.get(feedItem.link);
            const $ = cheerio.load(data);
            const $article = ['[itemprop=articleBody]', 'article', '.single-content', '.post-content', '.post']
              .map((query) => $(query))
              .find((query) => query.length);

            if ($article?.length) {
              ['script', 'form', 'div.wpa'].forEach((query) => $article.find(query).remove());
              feedItem.content = $article.text();
            }
          } catch (e) {
            this.logger.error(e);
          }
        }

        resolve(feedItem);
      });
  }

  public provideFetchedFeed(): Promise<any> {
    const baseUrl = this.getParam<string>('url');
    return this.context.rssFetcher.getFeed(`${baseUrl}/feed/atom/`).catch((reason) => {
      this.logger.error(reason);
      return this.context.rssFetcher.getFeed(`${baseUrl}/?feed=atom`);
    });
  }
}
