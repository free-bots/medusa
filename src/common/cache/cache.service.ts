import { CACHE_MANAGER, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { BaseLoggingContextService } from '../services/base-logging-context.service';

const CACHE_ENABLED = true;

export class CacheConfig {
  public timeToLive: number;
}

@Injectable()
export class CacheService extends BaseLoggingContextService implements OnModuleInit {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    super();
  }

  public onModuleInit(): void {
    this.logger.log(`Cache enabled: ${this.isCacheEnabled()}`);
  }

  public get<T>(key: string): Promise<T> {
    this.logger.debug(`Getting value for ${key}`);
    return this.isCacheEnabled()
      ? this.cacheManager.get<T>(key).then((value) => {
          if (!value) {
            this.logger.debug(`Value for: ${key} was empty`);
          }
          return value;
        })
      : null;
  }

  public set(key: string, value: any, options?: CacheConfig): Promise<void> {
    this.logger.debug(`Setting value for ${key}`);
    return this.isCacheEnabled() ? this.cacheManager.set(key, value, options ? { ttl: options.timeToLive } : undefined) : Promise.resolve();
  }

  private isCacheEnabled(): boolean {
    return CACHE_ENABLED;
  }
}
