import { Controller, Get, Header, Param, Query, Request, Response } from '@nestjs/common';
import { FiltersService } from './filters.service';
import { catchHttpException } from '../security/express-http-exception.filter';
import { requestedFeedFormatBuilder } from '../common/RequestedFeedFormatBuilder';
import { RequestedFeedFormat } from '../common/RequestedFeedFormat';

@Controller('filters')
export class FiltersController {
  constructor(private readonly filterService: FiltersService) {}

  @Header('Content-Type', 'application/atom+xml;charset=UTF-8')
  @Get([':id', ':id/.:format'])
  public getApplyFilter(@Param('id') id: string, @Param('format') format: string, @Query() query, @Response() res, @Request() req) {
    catchHttpException(
      req,
      res,
      this.filterService
        .applyFilterById(id, query, requestedFeedFormatBuilder(format, RequestedFeedFormat.ATOM))
        .then((value) => res.send(value)),
    );
  }
}
