import {
  DefaultParamName,
  FeederSnake,
  SnakeFeedInformation,
  SnakeFeedItem,
  SnakeParam,
} from '../../snake-factory/models/feeder-snake.model';
import { buildImage, buildLink } from '../../common/html-tag-builder';

export class GnomeExtensionsFeederSnake extends FeederSnake {
  public name = 'GnomeExtensions';

  private url = 'https://extensions.gnome.org';

  public registerParams(): SnakeParam[] {
    return [
      { name: 'pageCount', description: 'Number of pages to fetch', type: 'number', defaultValue: 10 },
      {
        name: 'sort',
        description: 'Sort type like name, recent, downloads or popularity',
        type: 'string',
        defaultValue: 'recent',
      },
    ];
  }

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

  public async provideItems(): Promise<(() => Promise<SnakeFeedItem>)[]> {
    const pages = this.getParam<number>('pageCount');

    const firstPage = await this.getPage(1);

    const items: (() => Promise<SnakeFeedItem>)[] = [...this.mapToItemFunction(this.createItems(firstPage.extensions))];

    if (items.length >= this.getParam<number>(DefaultParamName.MAX_ITEMS)) {
      return items;
    }

    const maxPages = Math.min(firstPage.pageAmount, pages);
    for (let i = 2; i <= maxPages; i++) {
      const data = await this.getPage(i);
      items.push(...this.mapToItemFunction(this.createItems(data.extensions)));

      if (items.length >= this.getParam<number>(DefaultParamName.MAX_ITEMS)) {
        return items;
      }
    }

    return items;
  }

  private createUri(rawUri: string): string {
    return `${this.url}${rawUri.replace('\\', '')}`;
  }

  private createSortParam(): string {
    return ['name', 'recent', 'downloads', 'popularity'].find((item) => item === this.getParam<string>('sort'));
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

  private async getPage(pageNumber: number): Promise<{ extensions: any[]; pageAmount: number; current: number }> {
    return this.context.httpClient.get(this.createQueryUrl(pageNumber)).then((data) => {
      const extensions = data.extensions;
      return { extensions: extensions, pageAmount: data.numpages, current: data.total };
    });
  }

  private createItems(extensions: any): SnakeFeedItem[] {
    return extensions.map((extension) => ({
      title: extension.name,
      id: extension.uuid,
      link: extension.link,
      content: this.createContent(extension),
      author: extension.creator,
      date: new Date(),
    }));
  }

  private mapToItemFunction(extensionItems: any[]): (() => Promise<SnakeFeedItem>)[] {
    return extensionItems.map((extensionItem) => () => Promise.resolve(extensionItem));
  }
}
