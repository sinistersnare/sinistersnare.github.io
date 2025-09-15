import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../app/store";
import { toggleSidebar } from "../../features/uiSlice";

export function Topbar() {
  const dispatch = useDispatch<AppDispatch>();
  return (
    <header
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        padding: "0.5rem 1rem",
        borderBottom: "1px solid #eee",
      }}
    >
      <button onClick={() => dispatch(toggleSidebar())}>☰</button>
      <h2 style={{ margin: 0 }}>Portfolio (under construction)</h2>
    </header>
  );
}
