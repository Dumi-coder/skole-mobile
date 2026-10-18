import type { Conversation } from "@/types/message";

const conversations: Conversation[] = [
  {
    id: "c-1",
    name: "Study Pod",
    avatar: "SP",
    preview: "Your group is ready for the 5 PM review.",
    time: "Now",
    unread: 2,
    messages: [
      {
        id: "m-1",
        sender: "them",
        text: "The notes are updated. Please review them before 5 PM.",
        time: "4:30 PM",
      },
      {
        id: "m-2",
        sender: "me",
        text: "Thanks, I will join the session.",
        time: "4:32 PM",
      },
    ],
  },
  {
    id: "c-2",
    name: "Dr. Cole",
    avatar: "DC",
    preview: "Great work on your draft—let’s tighten the conclusion.",
    time: "12m",
    unread: 0,
    messages: [
      {
        id: "m-3",
        sender: "them",
        text: "I liked your draft structure. We can refine the conclusion next.",
        time: "11:13 AM",
      },
      {
        id: "m-4",
        sender: "me",
        text: "Perfect. I will make the edits tonight.",
        time: "11:17 AM",
      },
    ],
  },
  {
    id: "c-3",
    name: "Mentor Circle",
    avatar: "MC",
    preview: "Three new questions were posted in the community room.",
    time: "1h",
    unread: 1,
    messages: [
      {
        id: "m-5",
        sender: "them",
        text: "New questions were added to the pool.",
        time: "Yesterday",
      },
      {
        id: "m-6",
        sender: "me",
        text: "I will take a look after lunch.",
        time: "Yesterday",
      },
    ],
  },
];

export async function getConversations(): Promise<Conversation[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return conversations;
}

export async function getConversationById(
  id: string,
): Promise<Conversation | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 180));
  return conversations.find((conversation) => conversation.id === id);
}
