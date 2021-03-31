import { FeederSnake, SnakeFeedInformation, SnakeFeedItem, SnakeParam } from '../../snake-factory/models/feeder-snake.model';
import * as cheerio from 'cheerio';

export class DuckDuckGoFeederSnake extends FeederSnake {
  public name = 'DuckDuckGo';

  private url = 'https://duckduckgo.com/';

  public registerParams(): SnakeParam[] {
    return [
      {
        name: 'search',
        description: 'Results from DuckDuckGo by the provided keyword',
        type: 'string',
        defaultValue: 'duckduckgo',
      },
    ];
  }

  public cleanUp(): Promise<void> {
    return Promise.resolve(undefined);
  }

  public prepare(): Promise<void> {
    return Promise.resolve(undefined);
  }

  public async provideFeedInformation(): Promise<SnakeFeedInformation> {
    return {
      description: `DuckDuckGo search for: ${this.getParam<string>('search')}`,
      favicon: 'https://duckduckgo.com/favicon.ico',
      image: 'https://duckduckgo.com/favicon.ico',
      link: this.url,
      title: `DuckDuckGo search for: ${this.getParam<string>('search')}`,
    };
  }

  public async provideItems(): Promise<(() => Promise<SnakeFeedItem>)[]> {
    const items: (() => Promise<SnakeFeedItem>)[] = [];
    const data = await this.context.httpClient.get(this.createQueryUrl());
    const $ = cheerio.load(data);

    $('div#links')
      .find('div.result')
      .each((index, element) => {
        const $result = $(element);

        if ($result.hasClass('result--ad')) {
          return;
        }

        const $link = $result.find('h2.result__title').find('a.result__a');
        const link = $link.attr('href');
        const title = $link.text();
        const $content = $('a.result__snippet');

        items.push(() =>
          Promise.resolve({
            id: link,
            link: link,
            title: title,
            author: link,
            content: $content.text(),
            date: new Date(),
          } as SnakeFeedItem),
        );
      });
    return items;
  }

  private createQueryUrl(): string {
    return `${this.url}html?kd=-1&q=${encodeURI(this.getParam<string>('search'))}`;
  }
}
