import { FeederSnake, SnakeFeedInformation, SnakeFeedItem, SnakeParam } from '../../snake-factory/models/feeder-snake.model';
import * as cheerio from 'cheerio';
import * as moment from 'moment';
import Root = cheerio.Root;
import Cheerio = cheerio.Cheerio;

export class XdaThreadFeederSnake extends FeederSnake {
  public name = 'XdaThread';

  private $: Root = null;

  public registerParams(): SnakeParam[] {
    return [{ name: 'url', description: 'Url of the Xda Forum Thread', type: 'string', defaultValue: null }];
  }

  public async prepare(): Promise<void> {
    const data = await this.context.httpClient.get(this.createUrl());
    this.$ = cheerio.load(data);
  }

  public cleanUp(): Promise<void> {
    return Promise.resolve(undefined);
  }

  public async provideFeedInformation(): Promise<SnakeFeedInformation> {
    const title = this.$('h1.p-title-value').text();
    return {
      description: `XDA Thread Feed of ${title}`,
      favicon: 'https://forum.xda-developers.com/styles/xda/xda/favicon.ico',
      image: 'https://forum.xda-developers.com/styles/xda/xda/favicon.ico',
      link: this.createUrl(),
      title: title,
    };
  }

  public async provideItems(): Promise<(() => Promise<SnakeFeedItem>)[]> {
    const items: (() => Promise<SnakeFeedItem>)[] = [];

    this.$('div.block-body')
      .find('article.message')
      .each((index, element) => {
        const $post = this.$(element);
        const title = $post.find('li.u-concealed').find('a').text().trim();
        const $content = $post.find('div.message-content');
        $content
          .find('ul.attachmentList')
          .find('li')
          .each((index, element) => {
            const $listItem = this.$(element);
            XdaThreadFeederSnake.replaceAttachmentUrl($listItem.find('a'), 'href');
            XdaThreadFeederSnake.replaceAttachmentUrl($listItem.find('img'), 'src');
          });

        items.push(() =>
          Promise.resolve({
            id: $post.attr('id'),
            link: $post
              .find('ul.message-attribution-opposite.message-attribution-opposite--list')
              .find('a.message-attribution-gadget')
              .attr('href'),
            author: $post.find('h4.message-name').text(),
            content: $content.html(),
            date: moment(title, 'MMM D, YYYY at H:mm a').toDate(),
            title: title,
          }),
        );
      });

    return items;
  }

  private createUrl(): string {
    return `${this.getParam<string>('url')}/latest`;
  }

  private static replaceAttachmentUrl($element: Cheerio, attribute: string) {
    if (!$element.length) {
      return;
    }
    const url = XdaThreadFeederSnake.createAttachmentUrl($element.attr(attribute));
    $element.attr(attribute, url);
  }

  private static createAttachmentUrl(relativeUrl: string): string {
    return `https://forum.xda-developers.com${relativeUrl}`;
  }
}
