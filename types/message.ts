export type Message = {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
};

export type Conversation = {
  id: string;
  name: string;
  avatar?: string;
  preview: string;
  time: string;
  unread: number;
  messages: Message[];
};
