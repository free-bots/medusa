import { FeederSnake, SnakeFeedInformation, SnakeFeedItem } from '../../snake-factory/models/feeder-snake.model';
import { buildImage, buildLink } from '../../common/html-tag-builder';

export class GnomeExtensionsFeederSnake extends FeederSnake {
  public name = 'GnomeExtensions';

  private url = 'https://extensions.gnome.org';

  public prepare(): Promise<void> {
    return Promise.resolve(undefined);
  }

  public async provideFeedInformation(): Promise<SnakeFeedInformation> {
    return {
      description: 'Gnome Shell-Extensions sorted by category',
      favicon: 'https://extensions.gnome.org/static/images/favicon.b73b0c0e30d2.png',
      image: 'https://extensions.gnome.org/static/images/favicon.b73b0c0e30d2.png',
      link: this.url,
      title: 'GNOME Shell-Extensions',
    };
  }

  public async provideItems(): Promise<SnakeFeedItem[]> {
    const items: SnakeFeedItem[] = [];
    const pages = this.params.pageCount || 10;

    let totalPages = 0;
    let availablePages = -1;

    for (let i = 1; i <= pages; i++) {
      if (availablePages !== -1 && availablePages <= totalPages) {
        continue;
      }

      const extensions = await this.utils.httpClient.get(this.createQueryUrl(i)).then((data) => {
        const extensions = data.extensions;
        availablePages = extensions.numpages;
        return extensions.map((extension) => ({
          title: extension.name,
          id: extension.uuid,
          link: extension.link,
          content: this.createContent(extension),
          author: extension.creator,
          date: new Date(),
        }));
      });

      items.push(...extensions);

      totalPages++;
    }

    return items;
  }

  private createUri(rawUri: string): string {
    return `${this.url}${rawUri.replace('\\', '')}`;
  }

  private createSortParam(): string {
    return ['name', 'recent', 'downloads', 'popularity'].find((item) => item === (this.params.sort || 'recent'));
  }

  private createQueryUrl(pageNumber): string {
    return `${this.url}/extension-query/?sort=${this.createSortParam()}&page=${pageNumber}&shell_version=all`;
  }

  private createContent(extension: any): string {
    const icon = extension.icon;
    const screenshot = extension.screenshot;
    const description = extension.description;
    const uri = extension.link;

    return buildLink(
      this.createUri(uri),
      (icon ? buildImage(this.createUri(icon)) : '') +
        (screenshot ? buildImage(this.createUri(screenshot)) : '') +
        `<p>${description.replace(/(?:\r\n|\r|\n)/g, '<br>')}</p>`,
    );
  }
}
