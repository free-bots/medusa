import { Module } from '@nestjs/common';
import { RssBuilderService } from './rss-builder.service';
import { RssFetcherModule } from '../rss-fetcher/rss-fetcher.module';

@Module({
  providers: [RssBuilderService],
  exports: [RssBuilderService],
  imports: [RssFetcherModule],
})
export class RssBuilderModule {}
