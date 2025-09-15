import Editor from "@monaco-editor/react";
import { useState } from "react";

export function CompilerDemo() {
  const [code, setCode] = useState<string>(
    `// Tiny arithmetic interpreter\n1 + 2 * 3`,
  );
  const [output, setOutput] = useState<string>("");

  function run() {
    try {
      // Extremely naive: evaluate arithmetic only
      // eslint-disable-next-line no-new-func
      const result = Function(`return (${code})`)();
      setOutput(String(result));
    } catch (e: any) {
      setOutput("Error: " + e.message);
    }
  }

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <div style={{ minWidth: 300, flex: "1 1 400px" }}>
        <Editor
          height="320px"
          defaultLanguage="javascript"
          value={code}
          onChange={(v) => setCode(v ?? "")}
          options={{ fontSize: 14, minimap: { enabled: false } }}
        />
        <div style={{ marginTop: 8 }}>
          <button onClick={run}>Run</button>
        </div>
      </div>
      <div style={{ minWidth: 300, flex: "1 1 300px" }}>
        <h3>Output</h3>
        <pre
          style={{
            padding: 8,
            border: "1px solid #eee",
            maxHeight: 320,
            overflow: "auto",
          }}
        >
          {output}
        </pre>
      </div>
    </div>
  );
}
