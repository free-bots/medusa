import { Module } from '@nestjs/common';
import { RssFetcherService } from './rss-fetcher.service';

@Module({
  providers: [RssFetcherService],
  exports: [RssFetcherService],
})
export class RssFetcherModule {}
