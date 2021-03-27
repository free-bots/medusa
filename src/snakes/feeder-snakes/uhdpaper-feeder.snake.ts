import { FeederSnake, SnakeFeedInformation, SnakeFeedItem, SnakeParam } from '../../snake-factory/models/feeder-snake.model';
import * as cheerio from 'cheerio';
import { buildImage, buildLink } from '../../common/html-tag-builder';

export class UhdpaperFeederSnake extends FeederSnake {
  public name = 'Uhdpaper';

  private url = 'https://www.uhdpaper.com/';

  public registerParams(): SnakeParam[] {
    return [
      {
        name: 'search',
        description: 'Wallpaper category tag. Add a + between multiple tags.',
        type: 'string',
        defaultValue: 'Digital+Art',
      },
    ];
  }

  public prepare(): Promise<void> {
    return Promise.resolve(undefined);
  }

  public cleanUp(): Promise<void> {
    return Promise.resolve(undefined);
  }

  public async provideFeedInformation(): Promise<SnakeFeedInformation> {
    return {
      description: 'Displays wallpapers from uhdpaper',
      favicon: 'https://www.uhdpaper.com/favicon.ico',
      image: 'https://www.uhdpaper.com/favicon.ico',
      link: this.url,
      title: 'Uhdpaper Snake',
    };
  }

  public async provideItems(): Promise<(() => Promise<SnakeFeedItem>)[]> {
    const items: (() => Promise<SnakeFeedItem>)[] = [];

    const response = await this.context.httpClient.get(this.createQueryUrl());
    const $ = cheerio.load(response);
    $('.wp_box').each((index, element) => {
      const $current = $(element);
      const src = $current.find('.lazy').attr('data-src');
      const link = $current.find('a').attr('href');
      const content = UhdpaperFeederSnake.createContent(link, src);
      items.push(() => Promise.resolve({ author: '', content: content, date: new Date(), id: '', link: link, title: '' }));
    });

    return items;
  }

  private createQueryUrl(): string {
    return `https://www.uhdpaper.com/search?q=${this.createSearch()}&by-date=true`;
  }

  private createSearch(): string {
    return this.getParam<string>('search');
  }

  private static createContent(link: string, src: string) {
    return buildLink(link, buildImage(src));
  }
}
