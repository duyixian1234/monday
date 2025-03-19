import { Message } from "./Message";

export interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  lastUpdated: number;
}
