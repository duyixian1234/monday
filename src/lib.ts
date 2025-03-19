import { fetch } from "@tauri-apps/plugin-http";
import { invoke } from "@tauri-apps/api/core";

let apiSettings: { apikey: string; baseUrl: string; modelId: string } | null =
  null;

export async function getApiSettings() {
  if (!apiSettings) {
    const [apikey, baseUrl, modelId] = (await invoke(
      "get_openai_settings"
    )) as [string, string, string];
    apiSettings = { apikey, baseUrl, modelId };
  }
  return apiSettings;
}

export async function checkApiSettings() {
  const settings = await getApiSettings();
  return {
    isValid:
      settings.apikey !== "No API Key found" &&
      settings.baseUrl !== "No Base URL found" &&
      settings.modelId !== "No Model found" &&
      settings.apikey.length > 0 &&
      settings.baseUrl.length > 0 &&
      settings.modelId.length > 0,
  };
}

export async function chat(payload: Record<string, any>) {
  const settings = await getApiSettings();
  const actual = { ...payload, model: settings.modelId, stream: true };
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
