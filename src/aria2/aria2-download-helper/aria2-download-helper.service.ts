import { Injectable } from '@nestjs/common';

@Injectable()
export class Aria2DownloadHelperService {
  // todo get current server url
  public createDownloadUrl(url: string): string {
    return `${'http://localhost:3000'}/aria2/add?url=${encodeURIComponent(url)}`;
  }
}
