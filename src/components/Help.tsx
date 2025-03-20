import { createSignal, Show } from "solid-js";
import "./Help.css";

export function Help() {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <div class="help-container">
      <button class="help-button" onClick={() => setIsOpen(!isOpen())}>
        {isOpen() ? "关闭帮助" : "帮助"}
      </button>

      <Show when={isOpen()}>
        <div class="help-content">
          <h2>环境变量设置说明</h2>
          <p>请确保设置以下环境变量以正常使用应用：</p>

          <div class="env-vars-list">
            <div class="env-var-item">
              <code>OPENAI_API_KEY</code>
              <span>- OpenAI API密钥，用于认证</span>
            </div>
            <div class="env-var-item">
              <code>OPENAI_BASE_URL</code>
              <span>- API基础URL，默认为 https://api.openai.com/v1</span>
            </div>
            <div class="env-var-item">
              <code>OPENAI_MODEL</code>
              <span>- 使用的模型ID，如 gpt-4-turbo 或 gpt-3.5-turbo</span>
            </div>
          </div>

          <h3>如何设置环境变量</h3>
          <div class="code-block">
            <pre>
              <code>
                # Linux/macOS
                <br />
                export OPENAI_API_KEY="sk-your-api-key"
                <br />
                export OPENAI_BASE_URL="https://api.openai.com/v1"
                <br />
                export OPENAI_MODEL="gpt-4-turbo"
                <br />
                <br />
                # Windows CMD
                <br />
                set OPENAI_API_KEY=sk-your-api-key
                <br />
                set OPENAI_BASE_URL=https://api.openai.com/v1
                <br />
                set OPENAI_MODEL=gpt-4-turbo
                <br />
                <br />
                # Windows PowerShell
                <br />
                $env:OPENAI_API_KEY="sk-your-api-key"
                <br />
                $env:OPENAI_BASE_URL="https://api.openai.com/v1"
                <br />
                $env:OPENAI_MODEL="gpt-4-turbo"
              </code>
            </pre>
          </div>
        </div>
      </Show>
    </div>
  );
}
