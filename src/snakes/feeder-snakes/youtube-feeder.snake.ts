import { FeederSnake, SnakeFeedInformation, SnakeFeedItem, SnakeParam } from '../../snake-factory/models/feeder-snake.model';
import * as cheerio from 'cheerio';
import { ifPresent } from '../../common/cheerio/cheerio-utils';
import * as moment from 'moment';
import { buildImage, buildLink, newLineToBr } from '../../common/html-tag-builder';
import * as _ from 'lodash';

export class YoutubeFeederSnake extends FeederSnake {
  public name = 'YouTube';

  private url = 'https://www.youtube.com/';

  private request: string;
  private feedName: string;

  private items: SnakeFeedItem[];

  public registerParams(): SnakeParam[] {
    return [
      { name: 'username', description: 'Show videos of username', type: 'string', defaultValue: null },
      { name: 'channelId', description: 'Show videos of a channel by the channelId', type: 'string', defaultValue: null },
      { name: 'playlistId', description: 'Show videos of a playlist by the playlistId', type: 'string', defaultValue: null },
      { name: 'search', description: 'Show search results', type: 'string', defaultValue: null },
      {
        name: 'searchPageNumber',
        description: 'Page number of the search by the provided search parameter',
        type: 'number',
        defaultValue: 1,
      },
      { name: 'searchUseExperimental', description: 'Get content from each video', type: 'boolean', defaultValue: false },
    ];
  }

  public async prepare(): Promise<void> {
    this.items = [];
    await this.fetch();
    return Promise.resolve(undefined);
  }

  public cleanUp(): Promise<void> {
    this.items = [];
    return Promise.resolve(undefined);
  }

  public async provideFeedInformation(): Promise<SnakeFeedInformation> {
    return {
      description: 'YouTube',
      favicon: 'https://www.youtube.com/s/desktop/b4335f76/img/favicon.ico',
      image: 'https://www.youtube.com/s/desktop/b4335f76/img/favicon.ico',
      link: this.url,
      title: this.feedName,
    };
  }

  public async provideItems(): Promise<(() => Promise<SnakeFeedItem>)[]> {
    return this.items.map((value) => () => Promise.resolve(value));
  }

  private async fetch(): Promise<void> {
    let urlFeed = '';
    let urlListing = '';

    const username = this.getParam<string>('username');
    const channelId = this.getParam<string>('channelId');
    const playlistId = this.getParam<string>('playlistId');
    const search = this.getParam<string>('search');

    if (username) {
      this.request = username;
      urlFeed = `${this.url}feeds/videos.xml?user=${this.getEncodedRequest()}`;
      urlListing = `${this.url}user/${this.getEncodedRequest()}/videos`;
    } else if (channelId) {
      this.request = channelId;
      urlFeed = `${this.url}feeds/videos.xml?channel_id=${this.getEncodedRequest()}`;
      urlListing = `${this.url}channel/${this.getEncodedRequest()}/videos`;
    }

    const check = async (url: string, onTrue: (data: any) => Promise<void>): Promise<boolean> => {
      const data = await this.context.httpClient.get(url);
      if (cheerio.load(data).length) {
        await onTrue(data);
        return true;
      }

      return false;
    };

    if (urlFeed && urlListing) {
      let success = await check(urlFeed, async (data) => {
        this.parseXml(data);
      });

      if (success) {
        return;
      }
      success = await check(urlListing, async (data) => {
        await this.parseHtml(data, 'li.channels-content-item', 'h3');
      });

      if (success) {
        return;
      }
      throw new Error('Could not request YouTube');
    }

    if (playlistId) {
      this.request = playlistId;
      urlFeed = `${this.url}feeds/videos.xml?playlist_id=${this.getEncodedRequest()}`;
      urlListing = `${this.url}playlist?list=${this.getEncodedRequest()}`;

      const data = await this.context.httpClient.get(urlListing);
      const $ = cheerio.load(data);

      const possibleItems = await this.parseHtml(data, 'tr.pl-video', '.pl-video-title a', false);

      const success = possibleItems <= 15 && (await check(urlFeed, async (data1) => this.parseXml(data1)));
      if (!success) {
        await this.parseHtml(data, 'tr.pl-video', '.pl-video-title a');
      }

      this.feedName = `Playlist: ${$('title').text().replace(' - YouTube', '')}`;

      this.items = this.items.sort((a, b) => b.date.getTime() - a.date.getTime());
      return;
    }

    if (search) {
      this.request = search;
      const pageNumber = this.getParam<number>('searchPageNumber');

      urlListing = `${
        this.url
      }results?search_query=${this.getEncodedRequest()}&page=${pageNumber}&filters=video&search_sort=video_date_uploaded`;

      const data = await this.context.httpClient.get(urlListing);

      await this.parseHtmlForSearch(data);

      this.feedName = `Search: ${search}`;
      return;
    }
    throw new Error('Bad arguments');
  }

  private getEncodedRequest() {
    return encodeURI(this.request);
  }

  private parseXml(xml: string) {
    const $ = cheerio.load(xml);

    $('entry').each((index, element) => {
      const $entry = $(element);

      const videoId = $entry.find('id').text().replace('yt:video:', '');
      if (YoutubeFeederSnake.isAd(videoId)) {
        return;
      }

      const title = YoutubeFeederSnake.getFormattedTitle($entry.find('title').text());
      const author = $entry.find('name').text();

      const raw = $entry.html();

      let description = raw.substring(
        raw.indexOf('<media:description>') + '<media:description>'.length,
        raw.indexOf('</media:description>'),
      );

      const pattern = /(http[s]?:\/\/[a-zA-Z0-9.\/?&=\-_]{4,})/ims;
      description = _.escape(description);
      description = newLineToBr(description);
      description = description.replace(pattern, (substring) => `<a href="${substring}" target="_blank">${substring}</a> `);

      const time = $entry.find('published').text();

      this.addItem(videoId, title, author, description, moment(time, 'YYYY-MM-DDTTHH:mm:ssZZ').toDate());
    });
    this.feedName = YoutubeFeederSnake.getFormattedTitle($('title').first().text());
  }

  private addItem(videoId: string, title: string, author: string, description: string, date: Date): void {
    this.items.push({
      id: videoId,
      title: title,
      author: author,
      date: date || new Date(),
      link: this.getVideoUrl(videoId),
      content: this.createContent(videoId, description),
    });
  }

  private createContent(videoId: string, description: string): string {
    const image = buildLink(this.getVideoUrl(videoId), buildImage(`${this.url.replace('/www.', '/img.')}vi/${videoId}/0.jpg`));
    return `${image}<br>${description}`;
  }

  private static getFormattedTitle(title: string): string {
    return _.unescape(title);
  }

  private async parseHtmlForSearch(html: string): Promise<void> {
    const varIndex = html.indexOf('var ytInitialData = ');
    const scriptContent = html.substring(varIndex, html.indexOf(';</script>', varIndex)).replace('var ytInitialData = ', '');

    try {
      const json = JSON.parse(scriptContent);
      const contents = _.flatMap(
        json.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents
          .map((content) => content?.itemSectionRenderer)
          .filter((contents) => contents !== null && contents !== undefined),
        (n) => n.contents,
      )
        .map((content) => content.videoRenderer)
        .filter((content) => content?.videoId);

      for (const content of contents) {
        const { videoId, title, descriptionSnippet, longBylineText } = content;

        const useTitle = title.runs[0]?.text;
        const useDescription = descriptionSnippet.runs[0]?.text;
        const useAuthor = longBylineText.runs[0]?.text;

        const useExperimental = this.getParam<boolean>('searchUseExperimental');
        const data = useExperimental ? await this.getVideoInfo(videoId) : null;
        this.addItem(videoId, useTitle, data?.author || useAuthor, data?.description || useDescription, data?.date);
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  private async parseHtml(html: string, elementSelector: string, titleSelector: string, shouldAddItems = true): Promise<number> {
    let possibleItems = 0;

    const $ = cheerio.load(html);

    const $elements = $(elementSelector)
      .toArray()
      .map((element) => $(element));

    for (const $element of $elements) {
      const videoId = $element.find('a').attr('href').replace('/watch?v=', '');

      const title = YoutubeFeederSnake.getFormattedTitle($element.find(titleSelector).text().trim());

      if (YoutubeFeederSnake.isAd(videoId) || title == '[Private video]' || title == '[Deleted video]') {
        continue;
      }

      if (shouldAddItems) {
        const data = await this.getVideoInfo(videoId);
        this.addItem(videoId, title, data.author, data.description, data.date);
      }
      possibleItems++;
    }

    return possibleItems;
  }

  private async getVideoInfo(videoId: string): Promise<{ author: string; description: string; date: Date }> {
    const returnValue = { author: '', description: '', date: new Date() };

    const data = await this.context.httpClient.get(this.getVideoUrl(videoId));

    const $ = cheerio.load(data);

    if ($.html().includes('IS_UNAVAILABLE_PAGE')) {
      return returnValue;
    }

    $('script')
      .toArray()
      .map((element) => $(element))
      .map(($scriptElement) => $scriptElement.text())
      .filter((scriptContent) => scriptContent.indexOf('{') === 0)
      .map((scriptContent) => {
        try {
          return JSON.parse(scriptContent);
        } catch (e) {
          return null;
        }
      })
      .filter((json) => json?.itemListElement)
      .forEach((json) => (returnValue.author = json.itemListElement[0].item.name));

    ifPresent($('#watch-description-text'), ($description) => {
      returnValue.description = $description.text();
    });

    ifPresent($('meta[itemprop=datePublished]'), ($time) => {
      const time = $time.attr('content');
      returnValue.date = moment(time, 'YYY-mm-dd').toDate();
    });

    return returnValue;
  }

  private getVideoUrl(videoId: string): string {
    return `${this.url}watch?v=${videoId}`;
  }

  private static isAd(videoId: string): boolean {
    return videoId.includes('googleads');
  }
}
