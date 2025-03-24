import showdown from "showdown";
import { createSignal } from "solid-js";
import { Message } from "./types";

const converter = new showdown.Converter();
export function MessageItem(props: { message: Message }) {
  const [showReasoning, setShowReasoning] = createSignal(true);
  return (
    <div class={`message-item ${props.message.role}`}>
      <div class="message-header">
        <b>{props.message.role === "user" ? "用户" : "助手"}</b>
        {props.message.reasoning && (
          <div
            class="toggle-reasoning"
            onClick={() => setShowReasoning(!showReasoning())}
            title={showReasoning() ? "收起思考" : "展开思考"}
          >
            <span class={`triangle-icon ${showReasoning() ? "down" : "right"}`}>
              ▼
            </span>
          </div>
        )}
      </div>
      {props.message.reasoning && showReasoning() && (
        <div class="reasoning-content">
          <div class="reasoning-header">深度思考</div>
          <div
            class="reasoning-body"
            innerHTML={converter.makeHtml(props.message.reasoning)}
          />
        </div>
      )}
      <div
        class="message-content"
        innerHTML={converter.makeHtml(props.message.content)}
      />
    </div>
  );
}
export function ReplyingMessage(props: {
  content: string;
  reasoning?: string;
}) {
  const [showReasoning, setShowReasoning] = createSignal(true);

  return (
    <div class="message-item assistant replying">
      <div class="message-header">
        <b>助手</b>
        {props.reasoning && (
          <div
            class="toggle-reasoning"
            onClick={() => setShowReasoning(!showReasoning())}
            title={showReasoning() ? "收起思考" : "展开思考"}
          >
            <span class={`triangle-icon ${showReasoning() ? "down" : "right"}`}>
              ▼
            </span>
          </div>
        )}
      </div>
      {props.reasoning && showReasoning() && (
        <div class="reasoning-content">
          <div class="reasoning-header">深度思考</div>
          <div
            class="reasoning-body"
            innerHTML={converter.makeHtml(props.reasoning)}
          />
        </div>
      )}
      <div
        class="message-content"
        innerHTML={converter.makeHtml(props.content)}
      />
    </div>
  );
}
