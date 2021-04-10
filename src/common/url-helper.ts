const ABSOLUTE_URL_PATTERN = new RegExp('^(?:[a-z]+:)?//', 'i');

export const isRelativeUrl = (url: string): boolean => !ABSOLUTE_URL_PATTERN.test(url);

export const fixRelativeUrl = (baseUrl: string, relativeUrl: string): string =>
  isRelativeUrl(relativeUrl) ? baseUrl + relativeUrl : relativeUrl;
