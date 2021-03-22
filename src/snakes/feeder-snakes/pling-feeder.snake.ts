import { FeederSnake, SnakeFeedInformation, SnakeFeedItem } from '../../snake-factory/models/feeder-snake.model';
import * as cheerio from 'cheerio';
import { buildImage } from '../../common/html-tag-builder';

export class PlingFeederSnake extends FeederSnake {
  public name = 'Pling';

  private url = 'https://www.pling.com';

  public prepare(): Promise<void> {
    return Promise.resolve(undefined);
  }

  public async provideFeedInformation(): Promise<SnakeFeedInformation> {
    return {
      description: 'Displays current Gnome themes',
      favicon: 'https://www.pling.com/favicon.ico',
      image: 'https://www.pling.com/favicon.ico',
      link: this.url,
      title: 'Pling Snake',
    };
  }

  public async provideItems(): Promise<SnakeFeedItem[]> {
    const items: SnakeFeedItem[] = [];

    const response = await this.utils.httpClient.get(this.createQueryUrl());

    const $ = cheerio.load(response);
    $('.explore-product').each((index, element) => {
      const $current = $(element);
      const $icon = $current.find('div.explore-product-imgcolumn').find('figure').find('a').find('div').find('img.explore-product-image');
      const $details = $current.find('div.explore-product-details');
      const $title = $details.find('a');
      const id = $title.attr('href');

      items.push({
        author: $details.find('div.title').find('b.username').find('a').text().trim(),
        content: PlingFeederSnake.createContent($icon.attr('src'), $details.find('div.productInfo').text()),
        date: new Date(),
        id: id,
        link: `${this.url}${id}`,
        title: $title.text(),
      });
    });

    return items;
  }

  private createQueryUrl() {
    return `${this.url}/s/Gnome/browse/ord/latest/`;
  }

  private static createContent(src: string, text: string): string {
    return `<div><p>${text}</p>${src ? buildImage(src) : ''}</div>`;
  }
}
