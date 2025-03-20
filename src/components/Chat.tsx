import { createEffect, For } from "solid-js";
import { Message, MessageItem, ReplyingMessage } from "../Message";
import { ChatSession } from "../types";
import { useChatStore } from "../store/chatStore.tsx";
import "./Chat.css";

export function Chat(props: {
  session?: ChatSession;
  onMessagesUpdate: (messages: Message[]) => void;
}) {
  const chatStore = useChatStore();
  let messagesContainerRef: HTMLDivElement | undefined;

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
            {chatStore.replying() && (
              <ReplyingMessage content={chatStore.assistantMsg()} />
            )}
          </>
        ) : (
          <div class="no-session-message">请创建或选择一个会话</div>
        )}
      </div>

      <form
        class="input-container"
        onSubmit={(e) => {
          e.preventDefault();
          chatStore.doChat(
            props.session,
            props.onMessagesUpdate,
            scrollToBottom
          );
        }}
      >
        <textarea
          id="chat-input"
          value={chatStore.userInput()}
          onChange={(e) => chatStore.setUserInput(e.currentTarget.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              chatStore.doChat(
                props.session,
                props.onMessagesUpdate,
                scrollToBottom
              );
            }
          }}
          placeholder="请输入你的问题..."
          disabled={!props.session || chatStore.replying()}
        />
        <button type="submit" disabled={!props.session || chatStore.replying()}>
          {chatStore.replying() ? "回复中..." : "发送"}
        </button>
      </form>
    </>
  );
}
