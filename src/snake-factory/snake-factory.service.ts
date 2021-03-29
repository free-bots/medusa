import { Injectable, OnModuleInit } from '@nestjs/common';
import { FilterSnake } from './models/filter-snake.model';
import { FeederSnake } from './models/feeder-snake.model';
import * as glob from 'glob';
import { join, resolve } from 'path';
import { Snake } from './models/snake.model';
import { SnakeType } from './models/snake-type.model';
import { BaseLoggingContextService } from '../common/services/base-logging-context.service';

@Injectable()
export class SnakeFactoryService extends BaseLoggingContextService implements OnModuleInit {
  public get feederSnakes(): FeederSnake[] {
    return this._feederSnakes;
  }
  public get filterSnakes(): FilterSnake[] {
    return this._filterSnakes;
  }
  private _filterSnakes: FilterSnake[] = [];
  private _feederSnakes: FeederSnake[] = [];

  public async onModuleInit(): Promise<void> {
    this.logger.log('init snake factory...');
    await this.loadSnakes();
    this.logger.log('snakes loaded...');
  }

  private async loadSnakes(): Promise<void> {
    await this.loadFilterSnakes();
    await this.loadFeederSnakes();
  }

  private async loadFilterSnakes(): Promise<void> {
    this._filterSnakes = await this.baitTheSnakesOfType<FilterSnake>(SnakeType.FILTER);
    this.logger.log(`loaded ${this._filterSnakes.length} filter-snakes`);
  }

  private async loadFeederSnakes(): Promise<void> {
    this._feederSnakes = await this.baitTheSnakesOfType<FeederSnake>(SnakeType.FEEDER);
    this.logger.log(`loaded ${this._feederSnakes.length} feeder-snakes`);
  }

  private async baitTheSnakesOfType<T extends Snake>(type: SnakeType): Promise<T[]> {
    const path = join(__dirname, '..', 'snakes', type, '*.js');
    const snakePromises = glob.sync(path).map(
      (file) =>
        import(resolve(file))
          .then((snakeEgg) => {
            const snake = this.findClass(snakeEgg);
            return SnakeFactoryService.createInstance<T>(snake);
          })
          .catch((reason) => this.logger.error(reason)) as any,
    ) as Promise<T>[];
    const snakes = await Promise.all(snakePromises);
    return SnakeFactoryService.filterInvalidSnakes<T>(snakes);
  }

  private static filterInvalidSnakes<T>(snakes: T[]): T[] {
    return snakes.filter((snake) => snake !== null && snake !== undefined) as T[];
  }

  private findClass(object: any): any {
    return (Object.values(object).find((value) => value instanceof Object) as any) || null;
  }

  private static createInstance<T>(object: any): T {
    return object ? (new object() as T) : null;
  }
}
