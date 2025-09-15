import { useSelector } from "react-redux";
import type { RootState } from "./app/store";
import { motion } from "framer-motion";
import Docent from "./components/docent/Docent";
import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";
import { CompilerDemo } from "./components/exhibits/CompilerDemo";
import { DataVizDemo } from "./components/exhibits/DataVizDemo";
import { UnityDemo } from "./components/exhibits/UnityDemo";

function ExhibitRouter() {
  const projectId = useSelector((s: RootState) => s.ui.currentProjectId);
  switch (projectId) {
    case "compiler-demo":
      return <CompilerDemo />;
    case "dataviz-demo":
      return <DataVizDemo />;
    case "unity-demo":
      return <UnityDemo />;
    default:
      return <CompilerDemo />;
  }
}

export default function App() {
  const sidebarOpen = useSelector((s: RootState) => s.ui.sidebarOpen);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        width: "100dvw",
        overflow: "hidden",
      }}
    >
      <Topbar />
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <motion.aside
          style={{ overflow: "hidden" }}
          animate={{ width: sidebarOpen ? 280 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
        >
          <Sidebar />
        </motion.aside>
        <main style={{ flex: 1, minWidth: 0, padding: "1rem" }}>
          <ExhibitRouter />
        </main>
        <aside
          style={{
            width: 340,
            minWidth: 280,
            maxWidth: 440,
            borderLeft: "1px solid #eee",
            padding: "0.5rem",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Docent />
        </aside>
      </div>
    </div>
  );
}
