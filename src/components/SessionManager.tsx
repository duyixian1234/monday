import { createSignal, For, Show } from "solid-js";
import { ChatSession } from "../types";
import "./SessionManager.css";

export function SessionManager(props: {
  sessions: ChatSession[];
  activeSessionId: string;
  onSessionChange: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, name: string) => void;
}) {
  const [isOpen, setIsOpen] = createSignal(false);
  const [editingId, setEditingId] = createSignal<string | null>(null);
  const [newName, setNewName] = createSignal("");

  const toggleSidebar = () => setIsOpen(!isOpen());

  const startRename = (id: string, currentName: string) => {
    setEditingId(id);
    setNewName(currentName);
  };

  const saveRename = (id: string) => {
    if (newName().trim()) {
      props.onRenameSession(id, newName().trim());
    }
    setEditingId(null);
  };

  return (
    <div class="session-manager">
      <button class="toggle-sessions-btn" onClick={toggleSidebar}>
        {isOpen() ? "隐藏会话" : "会话列表"}
      </button>

      <Show when={isOpen()}>
        <div class="sessions-sidebar">
          <div class="sessions-header">
            <h3>会话列表</h3>
            <button class="new-session-btn" onClick={props.onNewSession}>
              新会话
            </button>
          </div>

          <ul class="sessions-list">
            <For each={props.sessions}>
              {(session) => (
                <li
                  class={`session-item ${
                    session.id === props.activeSessionId ? "active" : ""
                  }`}
                  onClick={() => props.onSessionChange(session.id)}
                >
                  <Show
                    when={editingId() === session.id}
                    fallback={
                      <>
                        <span class="session-name">{session.name}</span>
                        <div class="session-actions">
                          <button
                            class="rename-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              startRename(session.id, session.name);
                            }}
                          >
                            重命名
                          </button>
                          <button
                            class="delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              props.onDeleteSession(session.id);
                            }}
                          >
                            删除
                          </button>
                        </div>
                      </>
                    }
                  >
                    <input
                      type="text"
                      value={newName()}
                      onInput={(e) => setNewName(e.currentTarget.value)}
                      onBlur={() => saveRename(session.id)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") saveRename(session.id);
                      }}
                      autofocus
                    />
                  </Show>
                </li>
              )}
            </For>
          </ul>
        </div>
      </Show>
    </div>
  );
}
