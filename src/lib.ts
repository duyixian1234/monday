import { fetch } from "@tauri-apps/plugin-http";
import { invoke } from "@tauri-apps/api/core";

const [apikey, baseUrl, modelId] = (await invoke("get_openai_settings")) as [
  string,
  string,
  string
];

export async function chat(payload: Record<string, any>) {
  const actual = { ...payload, model: modelId, stream: true };
  return fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apikey}`,
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
