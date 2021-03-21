import { Module } from '@nestjs/common';
import { CommonConfigurationService } from './common-configuration/common-configuration.service';
import { ConfigModule } from '@nestjs/config';
import { RssConfigurationService } from './rss-configuration/rss-configuration.service';
import rssConfiguration from './rss-configuration/rss-configuration';
import commonConfiguration from './common-configuration/common-configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [commonConfiguration, rssConfiguration],
    }),
  ],
  providers: [CommonConfigurationService, RssConfigurationService],
  exports: [CommonConfigurationService, RssConfigurationService],
})
export class ConfigurationModule {}
