import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RssFetcherModule } from './common/rss-fetcher/rss-fetcher.module';
import { RssBuilderModule } from './common/rss-builder/rss-builder.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { SnakeFactoryModule } from './snake-factory/snake-factory.module';
import { FeedsModule } from './feeds/feedsModule';
import { FiltersModule } from './filters/filters.module';
import { Aria2Module } from './aria2/aria2.module';

@Module({
  imports: [RssFetcherModule, RssBuilderModule, ConfigurationModule, SnakeFactoryModule, FeedsModule, FiltersModule, Aria2Module],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
