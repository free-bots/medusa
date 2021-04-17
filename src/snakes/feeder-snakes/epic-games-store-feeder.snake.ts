import { FeederSnake, SnakeFeedInformation, SnakeFeedItem, SnakeParam } from '../../snake-factory/models/feeder-snake.model';
import * as moment from 'moment';
import { buildImage, buildLink } from '../../common/html-tag-builder';

export class EpicGamesStoreFeederSnake extends FeederSnake {
  public name = 'EpicGamesStore';

  private baseUrl = 'https://www.epicgames.com/store/';

  public cleanUp(): Promise<void> {
    return Promise.resolve(undefined);
  }

  public prepare(): Promise<void> {
    return Promise.resolve(undefined);
  }

  public async provideFeedInformation(): Promise<SnakeFeedInformation> {
    return {
      description: 'Get information about the current free games',
      favicon: 'https://static-assets-prod.epicgames.com/epic-store/static/favicon.ico',
      image: 'https://static-assets-prod.epicgames.com/epic-store/static/favicon.ico',
      link: `${this.baseUrl}free-games`,
      title: 'EpicGamesStore',
    };
  }

  public async provideItems(): Promise<(() => Promise<SnakeFeedItem>)[]> {
    const data = await this.context.httpClient.get('https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions');

    const elements: Element[] = data.data.Catalog.searchStore.elements.filter((element) => element.status === 'ACTIVE');

    return elements.map((element) => () =>
      Promise.resolve({
        id: element.id,
        title: element.title,
        link: this.createUrl(element),
        author: EpicGamesStoreFeederSnake.getAuthor(element),
        date: moment(element.effectiveDate).toDate() || new Date(),
        content: this.createContent(element),
      } as SnakeFeedItem),
    );
  }

  public registerParams(): SnakeParam[] {
    return [];
  }

  private createUrl(element: Element) {
    return `${this.baseUrl}p/${element.productSlug}`;
  }

  private static getAuthor(element: Element): string {
    const customAttributes = element.customAttributes;
    return customAttributes?.find((attribute) => attribute.key === 'publisherName' || attribute.key === 'developerName')?.value || 'Epic';
  }

  private createContent(element: Element): string {
    const promotions = element.promotions
      ? element.promotions.promotionalOffers.length
        ? element.promotions.promotionalOffers
        : element.promotions.upcomingPromotionalOffers
      : null;

    const date = promotions
      ? `<p>Available from${EpicGamesStoreFeederSnake.formatDate(
          promotions[0].promotionalOffers[0].startDate,
        )} until:${EpicGamesStoreFeederSnake.formatDate(promotions[0].promotionalOffers[0].endDate)}</p>`
      : '<p>Unknown Date</p>';

    return buildLink(
      this.createUrl(element),
      `<p>${element.description}</p>${date}${buildImage(element.keyImages.find((image) => image.type === 'Thumbnail')?.url)}`,
    );
  }

  private static formatDate(date: string): string {
    return moment(date).format('DD-MM-YYYY HH:MM:SS');
  }
}

interface Element {
  title: string;
  id: string;
  description: string;
  offerType: string;
  status: string;
  effectiveDate: string;
  keyImages: {
    type: string;
    url: string;
  }[];
  productSlug: string;
  customAttributes: { key: string; value: string }[];
  promotions: {
    promotionalOffers: {
      promotionalOffers: {
        startDate: string;
        endDate: string;
      }[];
    }[];
    upcomingPromotionalOffers: {
      promotionalOffers: {
        startDate: string;
        endDate: string;
      }[];
    }[];
  };
}
