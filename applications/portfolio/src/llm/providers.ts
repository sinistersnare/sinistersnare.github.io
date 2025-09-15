import type { ChatMessage, LLMProvider, ProviderId } from "./types";
import { GoogleGenerativeAI } from "@google/generative-ai";

const KEY_GEMINI = "docent:gemini:key";
const KEY_PROVIDER = "docent:llm:provider";

class GeminiProvider implements LLMProvider {
  id: ProviderId = "gemini";
  name = "Gemini";
  private key: string | null;
  constructor() {
    this.key = localStorage.getItem(KEY_GEMINI);
  }
  isConfigured() {
    return !!this.key;
  }
  setApiKey(key: string) {
    this.key = key;
    localStorage.setItem(KEY_GEMINI, key);
  }
  async sendChat(messages: ChatMessage[]) {
    if (!this.key) throw new Error("Gemini API key not set");
    const genAI = new GoogleGenerativeAI(this.key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const parts = messages.map((m) => ({
      role: m.role === "Docent" ? "model" : "user",
      parts: [{ text: m.content }] as any,
    }));
    const res = await model.generateContent({ contents: parts as any });
    const text = res.response.text();
    return text;
  }
}

// Placeholder shells for future providers
class OpenAIProvider implements LLMProvider {
  id: ProviderId = "openai";
  name = "OpenAI";
  isConfigured() {
    return false;
  }
  async sendChat(): Promise<string> {
    throw new Error("OpenAI provider not configured");
  }
}

class LMStudioProvider implements LLMProvider {
  id: ProviderId = "lmstudio";
  name = "LM Studio (local)";
  isConfigured() {
    return true; /* local endpoint default */
  }
  async sendChat(messages: ChatMessage[]) {
    // Minimal compat for OpenAI-like local server at http://localhost:1234/v1/chat/completions
    const body = { model: "local-model", messages };
    const res = await fetch("http://localhost:1234/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("LM Studio request failed");
    const json = await res.json();
    const content = json.choices?.[0]?.message?.content ?? "";
    return content;
  }
}

const providers: Record<ProviderId, LLMProvider> = {
  gemini: new GeminiProvider(),
  openai: new OpenAIProvider(),
  lmstudio: new LMStudioProvider(),
};

export function setCurrentProvider(id: ProviderId) {
  localStorage.setItem(KEY_PROVIDER, id);
}

export function getCurrentProviderId(): ProviderId {
  const id = (localStorage.getItem(KEY_PROVIDER) as ProviderId) || "gemini";
  return id;
}

export function getCurrentProvider(): LLMProvider {
  return providers[getCurrentProviderId()];
}

export function getProviders(): LLMProvider[] {
  return Object.values(providers);
}
