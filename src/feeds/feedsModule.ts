import { Module } from '@nestjs/common';
import { FeedsService } from './feeds.service';
import { FeedsController } from './feedsController';
import { SnakeFactoryModule } from '../snake-factory/snake-factory.module';
import { RssBuilderModule } from '../common/rss-builder/rss-builder.module';
import { RssFetcherModule } from '../common/rss-fetcher/rss-fetcher.module';
import { HttpclientModule } from '../common/httpclient/httpclient.module';

@Module({
  providers: [FeedsService],
  controllers: [FeedsController],
  imports: [SnakeFactoryModule, RssBuilderModule, RssFetcherModule, HttpclientModule],
})
export class FeedsModule {}
