import { FeederSnake, SnakeFeedInformation, SnakeFeedItem, SnakeParam } from '../../snake-factory/models/feeder-snake.model';
import * as cheerio from 'cheerio';
import { fixRelativeUrl } from '../../common/url-helper';

export class ReactNativeBlogFeederSnake extends FeederSnake {
  public name = 'ReactNativeBlog';

  private baseUrl = 'https://reactnative.dev';
  private url = 'https://reactnative.dev/blog';

  public cleanUp(): Promise<void> {
    return Promise.resolve(undefined);
  }

  public prepare(): Promise<void> {
    return Promise.resolve(undefined);
  }

  public async provideFeedInformation(): Promise<SnakeFeedInformation> {
    return {
      description: 'Blogposts from ReactNative',
      favicon: 'https://reactnative.dev/img/favicon.ico',
      image: 'https://reactnative.dev/img/favicon.ico',
      link: this.url,
      title: 'ReactNative Blog',
    };
  }

  public async provideItems(): Promise<(() => Promise<SnakeFeedItem>)[]> {
    const data = await this.context.httpClient.get(this.url);
    const $ = cheerio.load(data);
    const items: (() => Promise<SnakeFeedItem>)[] = [];

    $('article').each((index, element) => {
      const $article = $(element);

      const $title = $article.find('h2');
      const link = `${this.baseUrl}${$title.find('a').attr('href')}`;

      const datetime = $article.find('header').find('time').attr('datetime');

      const $content = $article.find('div.markdown');
      $content.find('a').each((linkIndex, linkElement) => {
        const $articleLink = $(linkElement);
        const href = $articleLink.attr('href');
        if (href) {
          $articleLink.attr('href', fixRelativeUrl(this.baseUrl, href));
        }
      });

      items.push(() =>
        Promise.resolve({
          author: $article.find('div.avatar__name').text(),
          date: new Date(datetime),
          link: link,
          content: $content.html(),
          id: link,
          title: $title.text(),
        } as SnakeFeedItem),
      );
    });
    return items;
  }

  public registerParams(): SnakeParam[] {
    return [];
  }
}
