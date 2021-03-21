import { RequestedFeedFormat } from './RequestedFeedFormat';

export function requestedFeedFormatBuilder(format: string, fallbackFormat: RequestedFeedFormat): RequestedFeedFormat {
  return Object.values(RequestedFeedFormat).find((item) => item === `.${format}`) || fallbackFormat;
}
