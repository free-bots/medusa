import { FeedItem } from './feed-item.model';

export class FeedInformation {
  public title: string;
  public link: string;
  public description?: string;
  public image?: string;
  public favicon?: string;
  public items: FeedItem[];
}
