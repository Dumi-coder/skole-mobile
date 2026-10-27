export type FeedPostAsset = {
  id: string;
  url: string;
  mediaType: "image" | "video";
  durationSeconds?: number | null;
};

export type FeedPost = {
  id: string;
  author: string;
  authorAvatar?: string;
  avatarUrl?: string | null;
  text: string;
  timeLabel: string;
  imageUrl?: string;
  imageUrls?: string[];
  assets?: FeedPostAsset[];
  subject?: string;
};

export type FeedResponse = {
  posts: FeedPost[];
  totalCount: number;
  nextPage: number | null;
};
