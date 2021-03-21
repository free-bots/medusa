import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class RssConfiguration {
  public feeds: any[];
}

@Injectable()
export class RssConfigurationService {
  constructor(private readonly configService: ConfigService) {}

  public getFeeds(): any[] {
    return this.configService.get<any>('feeds');
  }
}
