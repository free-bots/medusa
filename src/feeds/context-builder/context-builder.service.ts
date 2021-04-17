import { Injectable } from '@nestjs/common';
import { RssFetcherService } from '../../common/rss-fetcher/rss-fetcher.service';
import { HttpclientService } from '../../common/httpclient/httpclient.service';
import { SnakeFeederContext } from '../../snake-factory/models/feeder-snake.model';
import { Aria2DownloadHelperService } from '../../aria2/aria2-download-helper/aria2-download-helper.service';

@Injectable()
export class ContextBuilderService {
  constructor(
    private readonly rssFetcherService: RssFetcherService,
    private readonly httpclientService: HttpclientService,
    private readonly aria2DownloadHelperService: Aria2DownloadHelperService,
  ) {}

  public buildContext(): SnakeFeederContext {
    return {
      httpClient: this.httpclientService,
      rssFetcher: this.rssFetcherService,
      aria2: this.aria2DownloadHelperService,
    };
  }
}
