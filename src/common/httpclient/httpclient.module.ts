import { HttpModule, Module } from '@nestjs/common';
import { HttpclientService } from './httpclient.service';

@Module({
  providers: [HttpclientService],
  imports: [HttpModule],
  exports: [HttpclientService],
})
export class HttpclientModule {}
