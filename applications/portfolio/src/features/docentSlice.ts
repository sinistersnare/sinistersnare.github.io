import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../app/store";
import { setCurrentProject, toggleSidebar } from "./uiSlice";
import { embedAndSearch } from "../utils/vectorSearch";
import type { WorkerStatus } from "../utils/embeddingsWorkerClient";
import type { ChatMessage } from "../llm/types";
import { getCurrentProvider } from "../llm/providers";

export type DocentMessage = {
  role: "user" | "Docent" | "system";
  content: string;
  kind?: "text" | "widget";
  widget?: "feedback" | "settings";
};

export type DocentState = {
  status: "idle" | "thinking" | "responding" | "error";
  placeholderText: string;
  isInputDisabled: boolean;
  conversation: DocentMessage[];
  llmService: "none" | "openai" | "anthropic" | "ollama";
  lastError?: string;
};

const initialState: DocentState = {
  status: "idle",
  placeholderText: "Ask the Docent anything about this portfolio…",
  isInputDisabled: false,
  conversation: [],
  llmService: "none",
};

type SubmitReturn = {
  reply: string;
  uiAction?:
    | { type: "setProject"; projectId: string }
    | { type: "showFeedback" }
    | { type: "toggleSidebar" }
    | { type: "openSettings" }
    | { type: "clearChat" };
};
type ThunkApi = { state: RootState; dispatch: any };
export const submitQuery = createAsyncThunk<SubmitReturn, string, ThunkApi>(
  "docent/submitQuery",
  async (query: string, { dispatch }: { dispatch: any }) => {
    // Tiny rule-based command detection to keep demo self-contained
    const commandMatch = query.match(/^go to (.+)$/i);
    if (commandMatch) {
      const projectId = commandMatch[1].trim().replace(/\s+/g, "-");
      dispatch(setCurrentProject(projectId));
      return {
        reply: `Navigated to ${projectId}.`,
        uiAction: { type: "setProject", projectId },
      };
    }

    if (/^(toggle sidebar|show sidebar|hide sidebar)$/i.test(query)) {
      dispatch(toggleSidebar());
      return {
        reply: "Toggled the sidebar.",
        uiAction: { type: "toggleSidebar" },
      };
    }

    if (/^(open settings|settings|llm settings)$/i.test(query)) {
      return {
        reply: "Opening LLM settings below.",
        uiAction: { type: "openSettings" },
      };
    }

    if (/^(clear|reset) (chat|conversation)$/i.test(query)) {
      return {
        reply: "Conversation cleared.",
        uiAction: { type: "clearChat" },
      };
    }

    // Feedback trigger: let the Docent deploy the feedback form widget
    if (
      /^(feedback|report|bug|feature)/i.test(query) ||
      /feedback|report a bug|feature request/i.test(query)
    ) {
      return {
        reply: "Sure — here's the feedback form.",
        uiAction: { type: "showFeedback" },
      };
    }

    // Simple client-side RAG over the knowledge base
    const { topK } = await embedAndSearch(query, 3, (s: WorkerStatus) => {
      if (s === "loading-model") {
        dispatch(docentSlice.actions.setPlaceholder("Loading AI model…"));
        dispatch(docentSlice.actions.setStatus("thinking"));
      } else if (s === "embedding" || s === "searching") {
        dispatch(docentSlice.actions.setPlaceholder("Thinking…"));
      } else if (s === "ready") {
        dispatch(
          docentSlice.actions.setPlaceholder(
            "Ask the Docent anything about this portfolio…",
          ),
        );
      }
    });
    const context = topK.map((k: any) => `- ${k.text}`).join("\n");
    // Call selected LLM provider with the conversation + latest user message and RAG context
    const provider = getCurrentProvider();
    const convo: ChatMessage[] = [];
    if (context)
      convo.push({ role: "system", content: `Relevant context:\n${context}` });
    convo.push({ role: "user", content: query });
    let llmText = "";
    try {
      llmText = await provider.sendChat(convo);
    } catch (e: any) {
      llmText = `(LLM error: ${e?.message ?? String(e)})`;
    }
    const reply = `Here's what I found:\n${context}\n\n${llmText}`;

    return { reply };
  },
);

const docentSlice = createSlice({
  name: "docent",
  initialState,
  reducers: {
    setStatus(
      state: DocentState,
      action: PayloadAction<DocentState["status"]>,
    ) {
      state.status = action.payload;
    },
    setPlaceholder(state: DocentState, action: PayloadAction<string>) {
      state.placeholderText = action.payload;
    },
    setInputDisabled(state: DocentState, action: PayloadAction<boolean>) {
      state.isInputDisabled = action.payload;
    },
    addMessageToConversation(
      state: DocentState,
      action: PayloadAction<DocentMessage>,
    ) {
      state.conversation.push(action.payload);
    },
    setLLMService(
      state: DocentState,
      action: PayloadAction<DocentState["llmService"]>,
    ) {
      state.llmService = action.payload;
    },
    clearConversation(state: DocentState) {
      state.conversation = [];
    },
  },
  extraReducers: (builder: any) => {
    builder
      .addCase(submitQuery.pending, (state: DocentState, action: any) => {
        state.status = "thinking";
        state.isInputDisabled = true;
        state.conversation.push({ role: "user", content: action.meta.arg });
      })
      .addCase(
        submitQuery.fulfilled,
        (state: DocentState, action: { payload: SubmitReturn }) => {
          state.status = "responding";
          state.conversation.push({
            role: "Docent",
            content: action.payload.reply,
            kind: "text",
          });
          // If the Docent needs to render a widget (e.g., feedback form), append it as a special message
          const a = action.payload.uiAction;
          if (a && a.type === "showFeedback") {
            state.conversation.push({
              role: "Docent",
              content: "",
              kind: "widget",
              widget: "feedback",
            });
          }
          if (a && a.type === "openSettings") {
            state.conversation.push({
              role: "Docent",
              content: "",
              kind: "widget",
              widget: "settings",
            });
          }
          if (a && a.type === "clearChat") {
            state.conversation = [];
          }
          state.isInputDisabled = false;
          state.status = "idle";
        },
      )
      .addCase(submitQuery.rejected, (state: DocentState, action: any) => {
        state.status = "error";
        state.isInputDisabled = false;
        state.lastError = action.error.message;
      });
  },
});

export const {
  setStatus,
  setPlaceholder,
  setInputDisabled,
  addMessageToConversation,
  setLLMService,
  clearConversation,
} = docentSlice.actions;
export default docentSlice.reducer;
