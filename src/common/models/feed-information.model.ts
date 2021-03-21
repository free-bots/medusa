import { FeedItem } from './feed-item.model';

export class FeedInformation {
  title: string;
  link: string;
  description?: string;
  image?: string;
  favicon?: string;
  items: FeedItem[];
}
