import { Controller, Get, Header, Param, Query, Request, Response } from '@nestjs/common';
import { FeedsService } from './feeds.service';
import { catchHttpException } from '../security/express-http-exception.filter';
import { requestedFeedFormatBuilder } from '../common/RequestedFeedFormatBuilder';
import { RequestedFeedFormat } from '../common/RequestedFeedFormat';

@Controller('feeds')
export class FeedsController {
  constructor(private readonly feedService: FeedsService) {}

  @Header('Content-Type', 'application/atom+xml;charset=UTF-8')
  @Get([':id', ':id/.:format'])
  public getFeed(@Param('id') id: string, @Param() format: string, @Query() query, @Response() res, @Request() req) {
    catchHttpException(
      req,
      res,
      this.feedService
        .findFeedById(id, query, requestedFeedFormatBuilder(format, RequestedFeedFormat.ATOM))
        .then((value) => res.send(value)),
    );
  }

  @Get()
  public getFeeds(): Promise<string[]> {
    return this.feedService.findAll();
  }
}
