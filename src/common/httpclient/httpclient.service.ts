import { HttpService, Injectable } from '@nestjs/common';
import { BaseLoggingContextService } from '../services/base-logging-context.service';

@Injectable()
export class HttpclientService extends BaseLoggingContextService {
  constructor(private readonly httpService: HttpService) {
    super();
  }

  public get(url: string): Promise<any> {
    return this.httpService
      .get(url)
      .toPromise()
      .then((value) => value.data);
  }

  public getAndRetry(url: string, retryCount = 3, sleep = 2000): Promise<any> {
    if (retryCount <= -1) {
      throw Error('Too many retries');
    }

    return this.get(url).catch((reason) => {
      this.logger.log(reason);

      return new Promise(async (resolve) => {
        setTimeout(() => {
          resolve(this.getAndRetry(url, retryCount - 1, sleep));
        }, sleep);
      });
    });
  }
}
