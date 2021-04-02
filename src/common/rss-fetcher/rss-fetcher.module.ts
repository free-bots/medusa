import { Module } from '@nestjs/common';
import { RssFetcherService } from './rss-fetcher.service';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [CacheModule],
  providers: [RssFetcherService],
  exports: [RssFetcherService],
})
export class RssFetcherModule {}
