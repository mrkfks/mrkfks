export type FeedItemType = 'blog' | 'project' | 'update' | 'milestone';

export interface FeedItem {
  id: string;
  hash: string;
  date: string;
  title: string;
  type: FeedItemType;
  description: string;
  targetPath: string;
  author: string;
}

export interface Changelog {
  items: FeedItem[];
}
