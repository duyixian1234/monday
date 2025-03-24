export interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  lastUpdated: number;
}
export interface Message {
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
}
