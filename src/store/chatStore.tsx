import { createSignal, createContext, useContext } from "solid-js";
import { chat, parseStream } from "../lib";
import { Message } from "../Message";
import { ChatSession } from "../types";

// 创建聊天状态管理上下文
interface ChatStoreContextValue {
  assistantMsg: () => string;
  userInput: () => string;
  replying: () => boolean;
  setUserInput: (input: string) => void;
  doChat: (
    session: ChatSession | undefined,
    onMessagesUpdate: (messages: Message[]) => void,
    scrollToBottom: () => void
  ) => Promise<void>;
}

const ChatStoreContext = createContext<ChatStoreContextValue>();

export function ChatStoreProvider(props: { children: any }) {
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

  const store: ChatStoreContextValue = {
    assistantMsg,
    userInput,
    replying,
    setUserInput,
    doChat,
  };

  return (
    <ChatStoreContext.Provider value={store}>
      {props.children}
    </ChatStoreContext.Provider>
  );
}

// 自定义钩子，用于在组件中访问聊天状态
export function useChatStore() {
  const context = useContext(ChatStoreContext);
  if (!context) {
    throw new Error("useChatStore must be used within a ChatStoreProvider");
  }
  return context;
}
