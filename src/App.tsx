import "./App.css";
import { Chat } from "./components/Chat";
import { Help } from "./components/Help";
import { SessionManager } from "./components/SessionManager";
import { SessionStoreProvider, useSessionStore } from "./store/sessionStore";

function AppContent() {
  const store = useSessionStore();

  return (
    <main class="chat-container">
      <header class="chat-header">
        <button class="sidebar-toggle" onClick={store.toggleSidebar}>
          {store.isSidebarOpen() ? "«" : "»"}
        </button>
        <h1>Mondy 助手</h1>
      </header>
      <Help />
      <div class="app-content">
        <div class={`sidebar ${store.isSidebarOpen() ? "open" : "closed"}`}>
          <SessionManager
            sessions={store.sessions()}
            activeSessionId={store.activeSessionId()}
            onSessionChange={store.setActiveSessionId}
            onNewSession={store.handleNewSession}
            onDeleteSession={store.handleDeleteSession}
            onRenameSession={store.handleRenameSession}
          />
        </div>
        <div class="chat-main">
          <Chat
            session={store.getActiveSession()}
            onMessagesUpdate={store.updateSessionMessages}
          />
        </div>
      </div>
    </main>
  );
}

function App() {
  return (
    <SessionStoreProvider>
      <AppContent />
    </SessionStoreProvider>
  );
}

export default App;
