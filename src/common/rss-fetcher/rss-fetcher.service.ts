import { Injectable } from '@nestjs/common';
import * as rssParser from 'rss-parser';
import Parser, { Output } from 'rss-parser';
import { CacheConfig, CacheService } from '../cache/cache.service';

@Injectable()
export class RssFetcherService {
  constructor(private readonly cacheService: CacheService) {}
  private static parser: Parser = new rssParser({
    customFields: {},
  });

  public async getFeed(url: string, useCache = true, cacheConfig?: CacheConfig): Promise<Output<{ [key: string]: string }>> {
    const cachedResponse = useCache ? await this.cacheService.get<Output<{ [key: string]: string }>>(url) : null;
    return (
      cachedResponse ||
      RssFetcherService.parser.parseURL(url).then(async (paredRssFeed) => {
        await this.cacheService.set(url, paredRssFeed, cacheConfig);
        return paredRssFeed;
      })
    );
  }
}
