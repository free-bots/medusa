import { Module } from '@nestjs/common';
import { FiltersController } from './filters.controller';
import { FiltersService } from './filters.service';
import { SnakeFactoryModule } from '../snake-factory/snake-factory.module';
import { RssFetcherModule } from '../common/rss-fetcher/rss-fetcher.module';
import { RssBuilderModule } from '../common/rss-builder/rss-builder.module';

@Module({
  controllers: [FiltersController],
  providers: [FiltersService],
  imports: [SnakeFactoryModule, RssFetcherModule, RssBuilderModule],
})
export class FiltersModule {}
