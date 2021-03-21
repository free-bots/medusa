import { Injectable } from '@nestjs/common';
import { Feed } from 'feed';
import { RequestedFeedFormat } from '../RequestedFeedFormat';
import { v4 as uuidv4 } from 'uuid';
import { FeedInformation } from '../models/feed-information.model';

@Injectable()
export class RssBuilderService {
  public async build(feed: FeedInformation, format: RequestedFeedFormat): Promise<string> {
    const feedBuilder = new Feed({ ...feed, id: feed.link || uuidv4(), copyright: '' });

    feed.items.forEach((item: any) => {
      feedBuilder.addItem({ ...item, author: { name: item.author, link: null, email: null } });
    });

    switch (format) {
      case RequestedFeedFormat.RSS:
        return feedBuilder.rss2();
      case RequestedFeedFormat.ATOM:
        return feedBuilder.atom1();
      case RequestedFeedFormat.JSON:
        return feedBuilder.json1();
      default:
        throw new Error('Unknown format');
    }
  }
}
