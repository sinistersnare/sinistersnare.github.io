import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../app/store";
import { submitQuery, clearConversation } from "../../features/docentSlice";
import FeedbackForm from "../FeedbackForm";
import LLMSettings from "./LLMSettings";
import Markdown from "../common/Markdown";

export default function Docent() {
  const dispatch = useDispatch<AppDispatch>();
  const { placeholderText, isInputDisabled, conversation, status } =
    useSelector((s: RootState) => s.docent);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const q = String(data.get("q") || "").trim();
    if (q) dispatch(submitQuery(q));
    form.reset();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Docent</div>
      <div
        style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: 4 }}
      >
        <div style={{ fontSize: 12 }}>
          {conversation.map((m, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              {m.kind === "widget" && m.widget === "feedback" ? (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    assistant
                  </div>
                  <div>Please share your thoughts:</div>
                  <div style={{ marginTop: 6 }}>
                    <FeedbackForm />
                  </div>
                </div>
              ) : m.kind === "widget" && m.widget === "settings" ? (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    assistant
                  </div>
                  <div>Adjust model provider and keys:</div>
                  <div style={{ marginTop: 6 }}>
                    <LLMSettings />
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    {m.role}
                  </div>
                  <Markdown text={m.content} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <form
        onSubmit={onSubmit}
        style={{ display: "flex", gap: 8, marginTop: 8 }}
      >
        <input
          name="q"
          placeholder={placeholderText}
          disabled={isInputDisabled}
          style={{ flex: 1 }}
        />
        <button
          type="submit"
          disabled={isInputDisabled || status === "thinking"}
        >
          Ask
        </button>
        <button type="button" onClick={() => dispatch(clearConversation())}>
          Clear
        </button>
      </form>
    </div>
  );
}
