import { FeederSnake, SnakeFeedInformation, SnakeFeedItem } from '../../snake-factory/models/feeder-snake.model';
import * as cheerio from 'cheerio';
import { buildImage, buildLink } from '../../common/html-tag-builder';

export class UhdpaperFeederSnake extends FeederSnake {
  public name = 'Uhdpaper';

  private url = 'https://www.uhdpaper.com/';

  public prepare(): Promise<void> {
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

  public async provideItems(): Promise<SnakeFeedItem[]> {
    const items: SnakeFeedItem[] = [];

    const response = await this.utils.httpClient.get(this.createQueryUrl());
    const $ = cheerio.load(response);
    $('.wp_box').each((index, element) => {
      const $current = $(element);
      const src = $current.find('.lazy').attr('data-src');
      const link = $current.find('a').attr('href');
      const content = UhdpaperFeederSnake.createContent(link, src);
      items.push({ author: '', content: content, date: new Date(), id: '', link: link, title: '' });
    });

    return items;
  }

  private createQueryUrl(): string {
    return `https://www.uhdpaper.com/search?q=${this.createSearch()}&by-date=true`;
  }

  private createSearch(): string {
    return this.params.search || 'Digital+Art';
  }

  private static createContent(link: string, src: string) {
    return buildLink(link, buildImage(src));
  }
}
