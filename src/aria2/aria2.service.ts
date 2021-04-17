import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Aria2 from 'aria2';
import { BaseLoggingContextService } from '../common/services/base-logging-context.service';

@Injectable()
export class Aria2Service extends BaseLoggingContextService implements OnModuleInit {
  private aria2: any;

  // todo config
  public onModuleInit(): void {
    this.logger.log('Init aria2');
    this.aria2 = new Aria2({
      host: 'localhost',
      port: 6800,
      secure: false,
      secret: '',
      path: '/jsonrpc',
    });
  }

  public addUrl(url: string): Promise<string> {
    this.logger.debug(`Add ${url} to aria2 server`);
    return this.aria2.call('addUri', [url]);
  }
}
