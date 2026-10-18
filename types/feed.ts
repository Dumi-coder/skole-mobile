export type FeedPost = {
  id: string;
  author: string;
  authorAvatar?: string;
  text: string;
  timeLabel: string;
  imageUrl?: string;
  subject?: string;
};

export type FeedResponse = {
  posts: FeedPost[];
  totalCount: number;
  nextPage: number | null;
};
