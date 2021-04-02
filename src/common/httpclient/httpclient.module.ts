import { HttpModule, Module } from '@nestjs/common';
import { HttpclientService } from './httpclient.service';
import { CacheModule } from '../cache/cache.module';

@Module({
  providers: [HttpclientService],
  imports: [HttpModule, CacheModule],
  exports: [HttpclientService],
})
export class HttpclientModule {}
