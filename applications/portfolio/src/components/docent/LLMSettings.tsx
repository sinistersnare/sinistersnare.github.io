import { useEffect, useMemo, useState } from "react";
import {
  getCurrentProviderId,
  getProviders,
  setCurrentProvider,
} from "../../llm/providers";

export default function LLMSettings() {
  const providers = useMemo(() => getProviders(), []);
  const [providerId, setProviderId] = useState(getCurrentProviderId());
  const provider = providers.find((p) => p.id === providerId)!;
  const [geminiKey, setGeminiKey] = useState<string>("");

  useEffect(() => {
    // read stored key if Gemini
    if (provider.id === "gemini") {
      const key = localStorage.getItem("docent:gemini:key") || "";
      setGeminiKey(key);
    }
  }, [provider.id]);

  function onChangeProvider(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value as any;
    setProviderId(id);
    setCurrentProvider(id);
  }

  function saveKey() {
    if (provider.id === "gemini" && provider.setApiKey) {
      provider.setApiKey(geminiKey.trim());
    }
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <label>
        Provider
        <select
          value={providerId}
          onChange={onChangeProvider}
          style={{ marginLeft: 6 }}
        >
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      {provider.id === "gemini" && (
        <>
          <input
            type="password"
            placeholder="Gemini API key (local only)"
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            style={{ minWidth: 280 }}
          />
          <button onClick={saveKey}>Save Key</button>
        </>
      )}
      {!provider.isConfigured() && (
        <span style={{ color: "#a00" }}>Provider not configured</span>
      )}
    </div>
  );
}
