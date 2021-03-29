import { Logger } from '@nestjs/common';

export abstract class BaseLoggingContextService {
  protected logger: Logger = new Logger(this.constructor.name);
}
