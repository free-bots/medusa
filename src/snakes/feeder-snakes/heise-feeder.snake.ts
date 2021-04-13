import { FillFeederSnake } from '../../snake-factory/models/fill-feeder-snake.model';
import { SnakeFeedItem, SnakeParam } from '../../snake-factory/models/feeder-snake.model';
import * as cheerio from 'cheerio';

export class HeiseFeederSnake extends FillFeederSnake {
  public name = 'Heise';

  public registerParams(): SnakeParam[] {
    return [];
  }

  public fillFeedItem(feedItem: SnakeFeedItem): () => Promise<SnakeFeedItem> {
    return () =>
      new Promise<SnakeFeedItem>(async (resolve) => {
        const link = `${HeiseFeederSnake.removeWebTrekk(feedItem.link)}?seite=all`;
        if (!feedItem.link) {
          return resolve(feedItem);
        }

        const data = await this.context.httpClient.getAndRetry(link);
        const $ = cheerio.load(data);

        feedItem.author = $('meta[name=author]').attr('content');
        feedItem.link = link;

        let $content = $('div.article-content');

        if (!$content.length) {
          $content = $('#article_content');
        }

        feedItem.content = '';
        $content.find('p, h3, ul, table, pre, img').each((index, element) => {
          feedItem.content += $(element).html();
        });

        resolve(feedItem);
      });
  }

  public async provideFetchedFeed(): Promise<any> {
    return this.context.rssFetcher.getFeed('https://www.heise.de/rss/heise-atom.xml');
  }

  private static removeWebTrekk(url: string): string {
    return url.substring(0, url.indexOf('?wt_mc='));
  }
}
