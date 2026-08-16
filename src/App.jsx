// [추가] 화면 상태 관리를 위한 useState
import { useState } from "react";

import Help from "./pages/help/Help";
import Onboarding1 from "./pages/onboarding/Onboarding1";

// [추가] 직원 화면
import StaffIntro from "./pages/staff/StaffIntro";
import StaffLogin from "./pages/staff/StaffLogin";

function App() {
  // [수정] 임시 화면 이동 상태
  const [currentPage, setCurrentPage] = useState("staffIntro");

  if (currentPage === "onboarding") {
    return (
      <Onboarding1
        onSelectPrivate={() => alert("프라이빗 선택")}
        onSelectAccount={() => alert("계정 선택")}
      />
    );
  }

  // [추가] 직원 로그인 진입 화면
  if (currentPage === "staffIntro") {
    return (
      <StaffIntro
        onLogin={() => setCurrentPage("staffLogin")}
      />
    );
  }

  // [추가] 직원 PIN 로그인 화면
  if (currentPage === "staffLogin") {
    return (
      <StaffLogin
        onBack={() => setCurrentPage("staffIntro")}
        onLogin={() => {
          // [추가] StaffRequests 구현 전 임시 로그인 성공 동작
          alert("로그인되었습니다. 요청 목록으로 이동합니다.");
        }}
      />
    );
  }

  return <Help />;
}

export default App;