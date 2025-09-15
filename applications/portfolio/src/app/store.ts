import { configureStore, combineReducers } from "@reduxjs/toolkit";
import uiReducer from "../features/uiSlice";
import docentReducer from "../features/docentSlice";
import {
  loadUIState,
  saveUIState,
  throttle,
  loadDocentState,
  saveDocentState,
} from "../utils/persist";

const preloadedUI = loadUIState();
const preloadedDocent = loadDocentState();

const rootReducer = combineReducers({
  ui: uiReducer,
  docent: docentReducer,
});

type Root = ReturnType<typeof rootReducer>;

// Build a partial preloaded state by merging docent defaults with persisted subset
const defaults: Root = rootReducer(undefined as any, { type: "@@INIT" } as any);
const preloadedState: Partial<Root> = {
  ...(preloadedUI ? { ui: preloadedUI } : {}),
  ...(preloadedDocent
    ? { docent: { ...defaults.docent, ...preloadedDocent } }
    : {}),
};

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: Object.keys(preloadedState).length
    ? (preloadedState as any)
    : undefined,
});

// Persist UI slice on changes (throttled)
const persist = throttle(() => {
  const state = store.getState();
  saveUIState(state.ui);
  saveDocentState({
    conversation: state.docent.conversation,
    llmService: state.docent.llmService,
    placeholderText: state.docent.placeholderText,
  });
}, 500);

store.subscribe(persist);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
