import { createEffect, createSignal, For } from "solid-js";
import { chat, parseStream } from "../lib";
import { Message, MessageItem, ReplyingMessage } from "../Message";

export function Chat() {
  const [assistantMsg, setAssistantMessage] = createSignal("");
  const [userInput, setUserInput] = createSignal("");
  const [history, setHistory] = createSignal<Message[]>([
    {
      role: "assistant",
      content: "你好，我是 Mondy 助手，有什么可以帮助你的吗？",
    },
  ]);
  const [replying, setReplying] = createSignal(false);
  let messagesContainerRef: HTMLDivElement | undefined;

  async function doChat() {
    if (!userInput().trim()) return;

    const currentInput = userInput();
    setUserInput("");
    setHistory((prev) => [...prev, { role: "user", content: currentInput }]);
    setAssistantMessage("");

    const response = await chat({
      messages: [
        ...history(),
        {
          role: "user",
          content: currentInput,
        },
      ],
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

      setHistory((prev) => [
        ...prev,
        { role: "assistant", content: assistantMsg() || "" },
      ]);
      setReplying(false);
    } else {
      console.log(await response.text());
    }
  }

  function scrollToBottom() {
    if (messagesContainerRef) {
      setTimeout(() => {
        messagesContainerRef!.scrollTop = messagesContainerRef!.scrollHeight;
      }, 0);
    }
  }

  createEffect(() => {
    if (history().length) {
      scrollToBottom();
    }
  });

  return (
    <>
      <div class="messages-container" ref={messagesContainerRef}>
        <For each={history()}>{(msg) => <MessageItem message={msg} />}</For>
        {replying() && <ReplyingMessage content={assistantMsg()} />}
      </div>

      <form
        class="input-container"
        onSubmit={(e) => {
          e.preventDefault();
          doChat();
        }}
      >
        <textarea
          id="chat-input"
          value={userInput()}
          onChange={(e) => setUserInput(e.currentTarget.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              doChat();
            }
          }}
          placeholder="请输入你的问题..."
        />
        <button type="submit" disabled={replying()}>
          {replying() ? "回复中..." : "发送"}
        </button>
      </form>
    </>
  );
}
