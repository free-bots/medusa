import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Aria2Service } from './aria2.service';

@Controller('aria2')
export class Aria2Controller {
  constructor(private readonly aria2Service: Aria2Service) {}

  @Get('add')
  public addUrlWithGet(@Query('url') url: string): Promise<string> {
    return this.aria2Service.addUrl(url);
  }

  @Post('add')
  public addUrlWithPost(@Body() body: { url: string }): Promise<string> {
    return this.aria2Service.addUrl(body.url);
  }
}
