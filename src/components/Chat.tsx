import { createEffect, For } from "solid-js";
import { MessageItem, ReplyingMessage } from "../Message";
import { Message } from "../types.ts";
import { useChatStore } from "../store/chatStore.tsx";
import { ChatSession } from "../types";
import "./Chat.css";
import { useSessionStore } from "../store/sessionStore.tsx";
import { generateTitle } from "../lib.ts";

export function Chat(props: {
  session?: ChatSession;
  onMessagesUpdate: (messages: Message[]) => void;
}) {
  const chatStore = useChatStore();
  const sessionStore = useSessionStore();
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

  createEffect(async () => {
    const name = props.session?.name || "新会话";
    if (
      props.session &&
      name.startsWith("新会话") &&
      props.session.messages.slice(1).length > 1
    ) {
      sessionStore.handleRenameSession(
        props.session.id,
        await generateTitle(
          props.session.messages
            .slice(1)
            .map(({ role, content }) => ({ role, content }))
        )
      );
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
              <ReplyingMessage
                content={chatStore.assistantMsg()}
                reasoning={chatStore.reasoningContent()}
              />
            )}
          </>
        ) : (
          <div class="no-session-message">请创建或选择一个会话</div>
        )}
      </div>

      <div class="chat-options">
        <div class="option-group">
          <label>
            <input
              type="checkbox"
              checked={chatStore.isDeep()}
              onChange={(e) => chatStore.setIsDeep(e.target.checked)}
              disabled={chatStore.replying()}
            />
            深度思考
          </label>
          <label>
            <input
              type="checkbox"
              checked={chatStore.useSearch()}
              onChange={(e) => chatStore.setUseSearch(e.target.checked)}
              disabled={chatStore.replying()}
            />
            启用搜索
          </label>
        </div>
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
          on:keypress={(e) => {
            if (e.key === "Enter") {
              if (e.shiftKey) return;
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
