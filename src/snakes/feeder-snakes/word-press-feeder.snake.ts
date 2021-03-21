import { FillFeederSnake } from '../../snake-factory/models/fill-feeder-snake.model';
import { SnakeFeedItem } from '../../snake-factory/models/feeder-snake.model';
import * as cheerio from 'cheerio';

export class WordPressFeederSnake extends FillFeederSnake {
  public name = 'WordPress';

  public async fillFeedItem(feedItem: SnakeFeedItem): Promise<SnakeFeedItem> {
    if (feedItem?.link) {
      try {
        const data = await this.utils.httpClient.get(feedItem.link);
        const $ = cheerio.load(data);
        const $article = ['[itemprop=articleBody]', 'article', '.single-content', '.post-content', '.post']
          .map((query) => $(query))
          .find((query) => query.length);

        if ($article?.length) {
          ['script', 'form', 'div.wpa'].forEach((query) => $article.find(query).remove());
          feedItem.content = $article.text();
        }
      } catch (e) {
        console.log(e);
      }
    }

    return Promise.resolve(feedItem);
  }

  public provideFetchedFeed(): Promise<any> {
    const baseUrl = this.params.url;
    return this.utils.rssFetcher.getFeed(`${baseUrl}/feed/atom/`).catch((reason) => {
      console.error(reason);
      return this.utils.rssFetcher.getFeed(`${baseUrl}/?feed=atom`);
    });
  }
}
