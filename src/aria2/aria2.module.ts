import { Module } from '@nestjs/common';
import { Aria2Service } from './aria2.service';
import { Aria2Controller } from './aria2.controller';
import { Aria2DownloadHelperService } from './aria2-download-helper/aria2-download-helper.service';

@Module({
  exports: [Aria2Service, Aria2DownloadHelperService],
  providers: [Aria2Service, Aria2DownloadHelperService],
  controllers: [Aria2Controller],
})
export class Aria2Module {}
