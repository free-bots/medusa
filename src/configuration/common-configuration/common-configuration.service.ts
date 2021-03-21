import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class CommonConfiguration {
  port: number;
}

@Injectable()
export class CommonConfigurationService {
  constructor(private readonly configService: ConfigService) {}

  public getConfig(): CommonConfiguration {
    return this.configService.get<CommonConfiguration>('');
  }
}
