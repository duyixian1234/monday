import { createSignal, createEffect, For } from "solid-js";
import { chat, parseStream } from "../lib";
import { Message, MessageItem, ReplyingMessage } from "../Message";
import { ChatSession } from "../types";

export function Chat(props: {
  session?: ChatSession;
  onMessagesUpdate: (messages: Message[]) => void;
}) {
  const [assistantMsg, setAssistantMessage] = createSignal("");
  const [userInput, setUserInput] = createSignal("");
  const [replying, setReplying] = createSignal(false);
  let messagesContainerRef: HTMLDivElement | undefined;

  async function doChat() {
    if (!userInput().trim() || !props.session) return;

    const currentInput = userInput();
    setUserInput("");

    const updatedMessages: Message[] = [
      ...props.session.messages,
      { role: "user", content: currentInput },
    ];
    props.onMessagesUpdate(updatedMessages);
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
      props.onMessagesUpdate(finalMessages);
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
    if (props.session?.messages.length) {
      scrollToBottom();
    }
  });

  return (
    <>
      <div class="messages-container" ref={messagesContainerRef}>
        {props.session ? (
          <>
            <For each={props.session.messages}>
              {(msg) => <MessageItem message={msg} />}
            </For>
            {replying() && <ReplyingMessage content={assistantMsg()} />}
          </>
        ) : (
          <div class="no-session-message">请创建或选择一个会话</div>
        )}
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
          disabled={!props.session || replying()}
        />
        <button type="submit" disabled={!props.session || replying()}>
          {replying() ? "回复中..." : "发送"}
        </button>
      </form>
    </>
  );
}
