// [추가] 헤더 확인용
import MainHeader from "./components/MainHeader/MainHeader";
// [추가] 네비바 동작 확인용
import { useState } from "react";
import BottomNav from "./components/BottomNav/BottomNav";

function App() {
  // [추가] 현재 선택된 메뉴 확인용
  const [activeTab, setActiveTab] = useState("analysis");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#24221E",
      }}
    >
      <MainHeader />
      <BottomNav
        activeTab={activeTab}
        onNavigate={setActiveTab}
      />
      
    </div>
  );
}

export default App;