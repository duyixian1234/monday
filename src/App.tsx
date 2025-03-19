import { createEffect, createSignal, onMount } from "solid-js";
import "./App.css";
import { Chat } from "./components/Chat";
import { Help } from "./components/Help";
import { SessionManager } from "./components/SessionManager";
import { ChatSession } from "./types";
import { Message } from "./Message";

function App() {
  const [sessions, setSessions] = createSignal<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = createSignal<string>("");

  // 初始化默认会话
  const initializeDefaultSession = () => {
    const defaultSession: ChatSession = {
      id: generateId(),
      name: "新会话",
      messages: [
        {
          role: "assistant",
          content: "你好，我是 Mondy 助手，有什么可以帮助你的吗？",
        },
      ],
      lastUpdated: Date.now(),
    };

    setSessions([defaultSession]);
    setActiveSessionId(defaultSession.id);
    return defaultSession;
  };

  // 生成唯一ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // 从localStorage加载会话
  const loadSessionsFromStorage = () => {
    try {
      const savedSessions = localStorage.getItem("chatSessions");
      const savedActiveId = localStorage.getItem("activeSessionId");

      if (savedSessions) {
        const parsedSessions = JSON.parse(savedSessions) as ChatSession[];
        if (parsedSessions.length > 0) {
          setSessions(parsedSessions);

          if (
            savedActiveId &&
            parsedSessions.some((s) => s.id === savedActiveId)
          ) {
            setActiveSessionId(savedActiveId);
          } else {
            setActiveSessionId(parsedSessions[0].id);
          }
          return;
        }
      }

      // 如果没有保存的会话，创建默认会话
      initializeDefaultSession();
    } catch (error) {
      console.error("Error loading sessions:", error);
      initializeDefaultSession();
    }
  };

  // 保存会话到localStorage
  const saveSessionsToStorage = () => {
    localStorage.setItem("chatSessions", JSON.stringify(sessions()));
    localStorage.setItem("activeSessionId", activeSessionId());
  };

  // 创建新会话
  const handleNewSession = () => {
    const newSession: ChatSession = {
      id: generateId(),
      name: `新会话 ${sessions().length + 1}`,
      messages: [
        {
          role: "assistant",
          content: "你好，我是 Mondy 助手，有什么可以帮助你的吗？",
        },
      ],
      lastUpdated: Date.now(),
    };

    setSessions([...sessions(), newSession]);
    setActiveSessionId(newSession.id);
  };

  // 删除会话
  const handleDeleteSession = (id: string) => {
    const currentSessions = sessions();
    if (currentSessions.length <= 1) {
      // 不允许删除最后一个会话
      return;
    }

    const newSessions = currentSessions.filter((session) => session.id !== id);
    setSessions(newSessions);

    // 如果删除的是当前活跃的会话，则切换到第一个会话
    if (id === activeSessionId()) {
      setActiveSessionId(newSessions[0].id);
    }
  };

  // 重命名会话
  const handleRenameSession = (id: string, newName: string) => {
    setSessions(
      sessions().map((session) =>
        session.id === id ? { ...session, name: newName } : session
      )
    );
  };

  // 更新会话消息
  const updateSessionMessages = (messages: Message[]) => {
    setSessions(
      sessions().map((session) =>
        session.id === activeSessionId()
          ? { ...session, messages, lastUpdated: Date.now() }
          : session
      )
    );
  };

  // 获取当前会话
  const getActiveSession = () => {
    return sessions().find((session) => session.id === activeSessionId());
  };

  // 组件挂载时加载会话
  onMount(() => {
    loadSessionsFromStorage();
  });

  // 当会话改变时保存到localStorage
  createEffect(() => {
    if (sessions().length > 0) {
      saveSessionsToStorage();
    }
  });

  return (
    <main class="chat-container">
      <header class="chat-header">
        <h1>Mondy 助手</h1>
      </header>
      <Help />
      <SessionManager
        sessions={sessions()}
        activeSessionId={activeSessionId()}
        onSessionChange={setActiveSessionId}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
      />
      <Chat
        session={getActiveSession()}
        onMessagesUpdate={updateSessionMessages}
      />
    </main>
  );
}

export default App;
