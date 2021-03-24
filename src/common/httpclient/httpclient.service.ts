import { HttpService, Injectable } from '@nestjs/common';

@Injectable()
export class HttpclientService {
  constructor(private readonly httpService: HttpService) {}

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
      console.log(reason);

      return new Promise(async (resolve) => {
        setTimeout(() => {
          resolve(this.getAndRetry(url, retryCount - 1, sleep));
        }, sleep);
      });
    });
  }
}
