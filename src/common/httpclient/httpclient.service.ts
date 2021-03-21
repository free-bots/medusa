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
}
