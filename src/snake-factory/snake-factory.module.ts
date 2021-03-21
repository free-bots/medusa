import { Module } from '@nestjs/common';
import { SnakeFactoryService } from './snake-factory.service';

@Module({
  providers: [SnakeFactoryService],
  exports: [SnakeFactoryService],
})
export class SnakeFactoryModule {}
