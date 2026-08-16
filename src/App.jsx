import { useState } from "react";
// [추가] 도움 요청 화면 확인용
import Help from "./pages/help/Help";

function App() {
  // [추가] 현재 선택된 메뉴 확인용
  const [activeTab, setActiveTab] = useState("analysis");

  return (
    
      <Help />
      
  );
}

export default App;