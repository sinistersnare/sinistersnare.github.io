import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UIState = {
  currentProjectId: string;
  activeTabId: string;
  sidebarOpen: boolean;
};

const initialState: UIState = {
  currentProjectId: "compiler-demo",
  activeTabId: "live-demo",
  sidebarOpen: true,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setCurrentProject(state: UIState, action: PayloadAction<string>) {
      state.currentProjectId = action.payload;
    },
    setActiveTab(state: UIState, action: PayloadAction<string>) {
      state.activeTabId = action.payload;
    },
    toggleSidebar(state: UIState) {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const { setCurrentProject, setActiveTab, toggleSidebar } =
  uiSlice.actions;
export default uiSlice.reducer;
