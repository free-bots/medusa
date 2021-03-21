import { Injectable } from '@nestjs/common';
import * as rssParser from 'rss-parser';
import Parser, { Output } from 'rss-parser';

@Injectable()
export class RssFetcherService {
  private static parser: Parser = new rssParser({
    customFields: {},
  });

  public getFeed(url: string): Promise<Output<{ [key: string]: string }>> {
    return RssFetcherService.parser.parseURL(url);
  }
}
