import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../app/store";
import { setCurrentProject } from "../../features/uiSlice";

export function Sidebar() {
  const dispatch = useDispatch<AppDispatch>();
  const current = useSelector((s: RootState) => s.ui.currentProjectId);
  const items = [
    { id: "compiler-demo", label: "Compiler Demo" },
    { id: "dataviz-demo", label: "Data Visualization" },
    { id: "unity-demo", label: "Unity WebGL" },
  ];
  return (
    <nav
      className="sidebar-nav"
      style={{ borderRight: "1px solid #eee", padding: 12 }}
    >
      <h3>Projects</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((it) => (
          <li key={it.id} style={{ margin: "4px 0" }}>
            <button
              onClick={() => dispatch(setCurrentProject(it.id))}
              className={`sidebar-btn${current === it.id ? " active" : ""}`}
            >
              {it.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
