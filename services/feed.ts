import type { FeedPost, FeedResponse } from "@/types/feed";

const feedData: FeedPost[] = [
  {
    id: "f-1",
    author: "Dumindu Perera",
    authorAvatar: "DP",
    text: "Can someone explain this algebra step in a simpler way? I am stuck on factorising x² - 7x + 12.",
    timeLabel: "1h ago",
    subject: "Maths",
  },
  {
    id: "f-2",
    author: "Lakmini Silva",
    authorAvatar: "LS",
    text: "Shared a short revision card for A/L Physics. I hope it helps before the mock exam.",
    timeLabel: "3h ago",
    subject: "Science",
    imageUrl:
      "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "f-3",
    author: "Harith Samarasinghe",
    authorAvatar: "HS",
    text: "Looking for a good English essay structure template for O/L writing practice. Any suggestions?",
    timeLabel: "Yesterday",
    subject: "English",
  },
  {
    id: "f-4",
    author: "Dilini Rajapakse",
    authorAvatar: "DR",
    text: "Study group meeting is at 5 PM today. Please bring your revision notes and a few past paper questions.",
    timeLabel: "2d ago",
    subject: "History",
  },
];

export async function getFeed(page = 1): Promise<FeedResponse> {
  await new Promise((resolve) => setTimeout(resolve, 350));

  const pageSize = 3;
  const start = (page - 1) * pageSize;
  const slice = feedData.slice(start, start + pageSize);

  return {
    posts: slice,
    totalCount: feedData.length,
    nextPage: start + pageSize < feedData.length ? page + 1 : null,
  };
}
