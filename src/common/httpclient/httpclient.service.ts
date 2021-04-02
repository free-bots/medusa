import { HttpService, Injectable } from '@nestjs/common';
import { BaseLoggingContextService } from '../services/base-logging-context.service';
import { CacheConfig, CacheService } from '../cache/cache.service';

@Injectable()
export class HttpclientService extends BaseLoggingContextService {
  constructor(private readonly httpService: HttpService, private readonly cacheService: CacheService) {
    super();
  }

  public async get(url: string, useCache = true, cacheConfig?: CacheConfig): Promise<any> {
    const cachedResponse = useCache ? await this.cacheService.get(url) : null;
    return (
      cachedResponse ||
      this.httpService
        .get(url)
        .toPromise()
        .then(async (value) => {
          const data = value.data;
          await this.cacheService.set(url, data, cacheConfig);
          return data;
        })
    );
  }

  public getAndRetry(url: string, retryCount = 3, sleep = 2000, useCache = true, cacheConfig?: CacheConfig): Promise<any> {
    if (retryCount <= -1) {
      throw Error('Too many retries');
    }

    return this.get(url).catch((reason) => {
      this.logger.log(reason);

      return new Promise(async (resolve) => {
        setTimeout(() => {
          resolve(this.getAndRetry(url, retryCount - 1, sleep, useCache, cacheConfig));
        }, sleep);
      });
    });
  }
}
