import { invoke } from "@tauri-apps/api/core";
import { fetch } from "@tauri-apps/plugin-http";
import { Message } from "./types";

let apiSettings: {
  apikey: string;
  baseUrl: string;
  modelId: string;
  deepModelId: string;
} | null = null;

export async function getApiSettings() {
  if (!apiSettings) {
    const [apikey, baseUrl, modelId, deepModelId] = (await invoke(
      "get_openai_settings"
    )) as [string, string, string, string];
    apiSettings = { apikey, baseUrl, modelId, deepModelId };
  }
  return apiSettings;
}

export async function checkApiSettings() {
  const settings = await getApiSettings();
  return (
    settings.apikey !== "No API Key found" &&
    settings.baseUrl !== "No Base URL found" &&
    settings.modelId !== "No Model found" &&
    settings.apikey.length > 0 &&
    settings.baseUrl.length > 0 &&
    settings.modelId.length > 0
  );
}

export async function generateTitle(messages: Message[]) {
  const settings = await getApiSettings();
  const actual = {
    messages: [
      ...messages,
      {
        role: "user",
        content: `${messages
          .map((msg) => `${msg.role}: ${msg.content}`)
          .join(
            "\n"
          )}\n请给以上内容生成一个简短的标题，直接返回标题内容，不要添加markdown标记。`,
      },
    ],
    model: settings.modelId,
    stream: false,
  };
  const resp = await fetch(`${settings.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.apikey}`,
    },
    body: JSON.stringify(actual),
  });
  const data = await resp.json();
  return data.choices?.[0].message.content;
}

export async function chat(
  payload: Record<string, any>,
  isDeep = false,
  search = false
) {
  const settings = await getApiSettings();
  const actual = {
    ...payload,
    model: isDeep ? settings.deepModelId : settings.modelId,
    stream: true,
    enable_enhancement: search,
    citation: search,
    search_info: search,
  };
  return fetch(`${settings.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.apikey}`,
    },
    body: JSON.stringify(actual),
  });
}

export async function* parseStream(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  async function* readChunk(): AsyncGenerator<string> {
    const { done, value } = await reader.read();
    if (done) return;
    buffer += decoder.decode(value);
    if (buffer.endsWith("\n\n")) {
      for (const line of buffer.split("\n\n")) {
        yield line;
      }
      buffer = "";
    }
    yield* readChunk();
  }
  yield* readChunk();
}
