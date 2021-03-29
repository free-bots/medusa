import { BaseLoggingContextService } from '../../common/services/base-logging-context.service';

export abstract class Snake extends BaseLoggingContextService {
  abstract name: string;
}
