import { FeedItem, FeedItemMatcher, FilterSnake } from '../../snake-factory/models/filter-snake.model';

export class GeneralFilterSnake extends FilterSnake {
  public name = 'GeneralFilter';

  public onFilterFeedItems(feedItem: FeedItem<string>, params?: any): Promise<FeedItemMatcher> {
    return Promise.resolve({
      categories: this.buildIgnoringFilter(),
      content: this.buildPipedFilter(params, 'contentFilter'),
      contentSnippet: this.buildIgnoringFilter(),
      creator: this.buildIgnoringFilter(),
      guid: this.buildIgnoringFilter(),
      isoDate: this.buildIgnoringFilter(),
      link: this.buildIgnoringFilter(),
      pubDate: this.buildIgnoringFilter(),
      title: this.buildPipedFilter(params, 'titleFilter'),
    });
  }
}
