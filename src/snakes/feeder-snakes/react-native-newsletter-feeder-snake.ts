import { FeederSnake, SnakeFeedInformation, SnakeFeedItem, SnakeParam } from '../../snake-factory/models/feeder-snake.model';
import * as cheerio from 'cheerio';
import * as moment from 'moment';
import { fixRelativeUrl } from '../../common/url-helper';
import { buildLink } from '../../common/html-tag-builder';

export class ReactNativeNewsletterFeederSnake extends FeederSnake {
  public name = 'ReactNativeNewsletter';

  private baseUrl = 'https://reactnative.cc';
  private url = 'https://reactnative.cc/issues.html';

  public cleanUp(): Promise<void> {
    return Promise.resolve(undefined);
  }

  public prepare(): Promise<void> {
    return Promise.resolve(undefined);
  }

  public async provideFeedInformation(): Promise<SnakeFeedInformation> {
    return {
      description: 'ReactNativeNewsletter',
      favicon: 'https://reactnative.cc/favicon.png',
      image: 'https://reactnative.cc/favicon.png',
      link: this.url,
      title: 'ReactNativeNewsletter',
    };
  }

  public async provideItems(): Promise<(() => Promise<SnakeFeedItem>)[]> {
    const items: (() => Promise<SnakeFeedItem>)[] = [];

    const data = await this.context.httpClient.get(this.url);
    const $ = cheerio.load(data);

    const $link = $('div.past-issues').first().find('li').first().find('a');

    const rawUrl = $link.attr('href');
    const url = fixRelativeUrl(this.baseUrl, rawUrl);
    const issueData = await this.context.httpClient.get(url);

    cheerio
      .load(issueData)('.mcnCaptionBottomContent .mcnTextContent h2 a')
      .each((index, element) => {
        const $link = $(element);
        const link = $link.attr('href');

        const rawDates = rawUrl.match(/\d{2}-\d{2}-\d{4}/);
        let date: Date = null;
        if (rawDates?.length) {
          date = moment(rawDates[0], 'MM-DD-YYYY').toDate();
        }

        const title = $link.text().replace(/\s{2,}/, '');

        items.push(() =>
          Promise.resolve({
            title: title,
            id: link,
            content: buildLink(link, title),
            link: link,
            date: date || new Date(),
            author: 'ReactNativeNewsletter',
          } as SnakeFeedItem),
        );
      });

    return items;
  }

  public registerParams(): SnakeParam[] {
    return [];
  }
}
