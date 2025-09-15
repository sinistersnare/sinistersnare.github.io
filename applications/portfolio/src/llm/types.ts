export type ChatMessage = {
  role: "system" | "user" | "Docent";
  content: string;
};

export interface LLMProvider {
  id: string; // e.g., 'gemini', 'openai', 'lmstudio'
  name: string;
  isConfigured(): boolean;
  setApiKey?(key: string): void; // some providers require a key
  sendChat(
    messages: ChatMessage[],
    options?: Record<string, unknown>,
  ): Promise<string>;
}

export type ProviderId = "gemini" | "openai" | "lmstudio";
