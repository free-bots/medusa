import { FeederSnake, SnakeFeedInformation, SnakeFeedItem, SnakeParam } from '../../snake-factory/models/feeder-snake.model';
import { buildImage, buildLink } from '../../common/html-tag-builder';

export class RedditFeederSnake extends FeederSnake {
  public name = 'Reddit';

  private response: any;
  private url = '';
  private baseUrl = 'https://www.reddit.com';

  public registerParams(): SnakeParam[] {
    return [
      { name: 'name', description: 'Name of the subreddit for type r or the username for type u', type: 'string', defaultValue: null },
      { name: 'type', description: 'Use r for a subreddit or u for an user', type: 'string', defaultValue: 'r' },
    ];
  }

  public async prepare(): Promise<void> {
    try {
      this.url = `${this.baseUrl}/${this.getParam<string>('type') === 'r' ? 'r/' : 'user/'}${this.getParam<string>('name')}`;
      this.response = await this.context.httpClient.get(`${this.url}.json`);
    } catch (e) {
      this.logger.error(e);
    }

    return Promise.resolve(undefined);
  }

  public cleanUp(): Promise<void> {
    this.response = null;
    return Promise.resolve(undefined);
  }

  public async provideFeedInformation(): Promise<SnakeFeedInformation> {
    return {
      description: 'Reddit',
      favicon: 'https://www.redditstatic.com/desktop2x/img/favicon/favicon-96x96.png',
      image: 'https://www.redditstatic.com/desktop2x/img/favicon/favicon-96x96.png',
      link: this.url,
      title: 'Reddit Snake',
    };
  }

  public async provideItems(): Promise<(() => Promise<SnakeFeedItem>)[]> {
    return this.response.data.children
      .filter((post) => post.kind !== 't1')
      .map((post) => {
        const data = post.data;
        return () =>
          Promise.resolve({
            title: data.title,
            id: data.id,
            link: this.getEncodePermalink(data.permalink),
            content: this.getContent(data),
            author: data.author,
            date: new Date(post.created_utc || null),
          } as SnakeFeedItem);
      });
  }

  private getEncodePermalink(link: string): string {
    return (
      this.baseUrl +
      link
        .split('/')
        .map((part) => escape(part))
        .join('/')
    );
  }

  private static createTemplate(href: string, src: string, caption: string): string {
    return buildLink(href, `<figure><figcaption>${caption}</figcaption>${buildImage(src)}</figure>`);
  }

  private getContent(data: any): string {
    if (data.is_self) {
      return unescape(data.selftext_html);
    }

    if (data.post_hint === 'link') {
      let embed = '';
      if (data.media) {
        embed = unescape(data.media.oembed.html);
      }

      return RedditFeederSnake.createTemplate(data.url, data.thumbnail, data.domain) + embed;
    }

    if (data.post_hint === 'image') {
      return buildLink(this.getEncodePermalink(data.permalink), buildImage(data.url));
    }

    if (data.is_gallery) {
      data.gallery_data.items
        .map((mediaItem) => {
          const { media_id } = mediaItem;
          const type = data.media_metadata[media_id].m === 'image/gif' ? 'gif' : 'u';
          const src = data.media_metadata[media_id].s[type];
          return `<figure><img src="${src}" alt="img"/></figure>`;
        })
        .join('');
    }

    if (data.is_video) {
      const resolutions = data.preview.images[0].resolutions;
      return RedditFeederSnake.createTemplate(data.url, data.preview.images[0].resolutions[resolutions.length - 1].url, 'Video');
    }

    if (data.media.type === 'youtube.com') {
      return RedditFeederSnake.createTemplate(data.url, data.media.oembed.thumbnail_url, 'YouTube');
    }

    const domains = data.domain.split('.');
    if (domains[0] == 'self') {
      return buildLink(this.getEncodePermalink(data.permalink), `Crossposted from r/${domains[1]}`);
    }

    return buildLink(data.url, data.domain);
  }
}
