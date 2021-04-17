import { FillFeederSnake } from '../../snake-factory/models/fill-feeder-snake.model';
import { ProvidedFeedItem, SnakeFeedItem, SnakeParam } from '../../snake-factory/models/feeder-snake.model';
import * as cheerio from 'cheerio';

export class MediaCccFeederSnake extends FillFeederSnake {
  public name = 'MediaCCC';

  public fillFeedItem(feedItem: ProvidedFeedItem): () => Promise<SnakeFeedItem> {
    return async () => {
      if (feedItem.contentEncoded) {
        const $ = cheerio.load(feedItem.contentEncoded);

        const mediaPage = $('a').has('img').attr('href');

        feedItem.content = await this.createContent(mediaPage, feedItem.contentEncoded);
      }
      return feedItem;
    };
  }

  public provideFetchedFeed(): Promise<any> {
    return this.context.rssFetcher.getFeed('https://media.ccc.de/updates.rdf');
  }

  public registerParams(): SnakeParam[] {
    return [];
  }

  private async createContent(url: string, encodedContent: string): Promise<string> {
    const data = await this.context.httpClient.get(url);

    const $content = cheerio.load(`<div id="wrapper">${encodedContent}</div>`);
    $content('div#wrapper').append('<p>Direct Downloads</p></p><ul id="direct-download"></ul>');

    const $ = cheerio.load(data);

    const $download = $('div.download');
    const $audio = $('div.audio');

    $download.remove('ul');

    // create video content
    $download.find('div.tab-pane').each((index, element) => {
      const $tabPane = $(element);
      const videoType = $tabPane.attr('id');
      $tabPane.find('div.btn-wrap').each((index1, element1) => {
        const $videoItem = $(element1);
        $content('ul#direct-download').append(`<li><p>${videoType}</p>${$videoItem.html()}</li>`);
      });
    });

    // create audio content
    $audio.find('div.btn-wrap').each((index, element) => {
      const $audioItem = $(element);
      $content('ul#direct-download').append(`<li>${$audioItem.html()}</li>`);
    });

    return $content.html();
  }
}
