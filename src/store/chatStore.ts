import { createSignal } from "solid-js";
import { chat, parseStream } from "../lib";
import { Message } from "../Message";
import { ChatSession } from "../types";

export function createChatStore() {
  const [assistantMsg, setAssistantMessage] = createSignal("");
  const [userInput, setUserInput] = createSignal("");
  const [replying, setReplying] = createSignal(false);

  async function doChat(
    session: ChatSession | undefined,
    onMessagesUpdate: (messages: Message[]) => void,
    scrollToBottom: () => void
  ) {
    if (!userInput().trim() || !session) return;

    const currentInput = userInput();
    setUserInput("");

    const updatedMessages: Message[] = [
      ...session.messages,
      { role: "user", content: currentInput },
    ];
    onMessagesUpdate(updatedMessages);
    setAssistantMessage("");

    const response = await chat({
      messages: updatedMessages,
    });

    if (response.ok) {
      setReplying(true);
      scrollToBottom();

      for await (const chunk of parseStream(response.body!)) {
        if (chunk.startsWith("data:")) {
          const content = chunk.slice(5);
          if (content === " [DONE]") break;
          const part = JSON.parse(content);
          const delta = part.choices?.[0]?.delta?.content;
          setAssistantMessage((prev) => prev + (delta || ""));
          scrollToBottom();
        }
      }

      const finalMessages: Message[] = [
        ...updatedMessages,
        { role: "assistant", content: assistantMsg() || "" },
      ];
      onMessagesUpdate(finalMessages);
      setReplying(false);
    } else {
      console.log(await response.text());
    }
  }

  return {
    assistantMsg,
    userInput,
    replying,
    setUserInput,
    doChat,
  };
}

// 创建并导出一个全局聊天store实例
export const chatStore = createChatStore();
