import "./App.css";
import { Chat } from "./components/Chat";

function App() {
  return (
    <main class="chat-container">
      <header class="chat-header">
        <h1>Mondy 助手</h1>
      </header>
      <Chat />
    </main>
  );
}

export default App;
