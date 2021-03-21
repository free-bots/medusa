import { Snake } from './snake.model';

export interface FilterFunction {
  matches(attribute: string): Promise<boolean>;
}

export type FeedItemMatcher = FeedItem<FilterFunction>;

export interface FeedItem<T> {
  link: T;
  guid: T;
  title: T;
  pubDate: T;
  creator: T;
  content: T;
  isoDate: T;
  categories: T;
  contentSnippet: T;
}

export abstract class FilterSnake extends Snake {
  abstract onFilterFeedItems(feedItem: FeedItem<string>, params?: any): Promise<FeedItemMatcher>;

  /**
   * dummy filter to ignore the current attribute
   */
  public buildIgnoringFilter(): FilterFunction {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      matches(attribute: string): Promise<boolean> {
        return Promise.resolve(false);
      },
    };
  }

  /**
   * filter for regex
   * @param regex
   */
  public buildRegexFilter(regex: RegExp): FilterFunction {
    return {
      matches(attribute: string): Promise<boolean> {
        return Promise.resolve(regex.test(attribute));
      },
    };
  }

  /**
   * looks for any occurrences of the provided strings
   * @param contains value to find any matches
   */
  public buildContainsFilter(contains: string[]): FilterFunction {
    return {
      matches(attribute: string): Promise<boolean> {
        if (contains === null || contains === undefined) {
          return Promise.resolve(false);
        }
        const found = contains.find((item) => attribute.toLowerCase().includes(item.toLowerCase()));
        return Promise.resolve(found !== null && found !== undefined);
      },
    };
  }

  public buildPipedFilter(params: any, key: string): FilterFunction {
    if (!params || !key || !(key in params)) {
      return this.buildIgnoringFilter();
    }
    const value = params[key] as string;
    return value ? this.buildContainsFilter(value.split('|')) : this.buildIgnoringFilter();
  }
}
