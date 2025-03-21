import showdown from "showdown";

export interface Message {
  role: "user" | "assistant";
  content: string;
}
const converter = new showdown.Converter();
export function MessageItem(props: { message: Message }) {
  return (
    <div class={`message-item ${props.message.role}`}>
      <div class="message-header">
        <b>{props.message.role === "user" ? "用户" : "助手"}</b>
      </div>
      <div
        class="message-content"
        innerHTML={converter.makeHtml(props.message.content)}
      />
    </div>
  );
}
export function ReplyingMessage(props: { content: string }) {
  return (
    <div class="message-item assistant replying">
      <div class="message-header">
        <b>助手</b>
      </div>
      <div
        class="message-content"
        innerHTML={converter.makeHtml(props.content)}
      />
    </div>
  );
}
