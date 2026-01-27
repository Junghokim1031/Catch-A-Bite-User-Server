// src/layouts/RiderLayout.jsx
import { Outlet } from "react-router-dom";

export default function RiderLayout() {
  return (
    <div style={{ minHeight: "100vh", background: "#f6f7f9" }}>
      {/* 공통 헤더 */}
      <header
        style={{
          padding: "12px 16px",
          background: "#111",
          color: "#fff",
          fontWeight: 900,
        }}
      >
        Rider
      </header>

      {/* 실제 페이지가 렌더링되는 자리 */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}