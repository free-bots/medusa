import { Module } from '@nestjs/common';
import { FeedsService } from './feeds.service';
import { FeedsController } from './feedsController';
import { SnakeFactoryModule } from '../snake-factory/snake-factory.module';
import { RssBuilderModule } from '../common/rss-builder/rss-builder.module';
import { RssFetcherModule } from '../common/rss-fetcher/rss-fetcher.module';
import { HttpclientModule } from '../common/httpclient/httpclient.module';
import { CacheModule } from '../common/cache/cache.module';
import { Aria2Module } from '../aria2/aria2.module';
import { ContextBuilderService } from './context-builder/context-builder.service';

@Module({
  providers: [FeedsService, ContextBuilderService],
  controllers: [FeedsController],
  imports: [SnakeFactoryModule, RssBuilderModule, RssFetcherModule, HttpclientModule, CacheModule, Aria2Module],
})
export class FeedsModule {}
