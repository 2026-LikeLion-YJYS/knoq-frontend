// [추가] 화면 상태 관리를 위한 useState
import { useState } from "react";

import Help from "./pages/help/Help";
import Onboarding1 from "./pages/onboarding/Onboarding1";

// [추가] 직원 화면
import StaffIntro from "./pages/staff/StaffIntro";
import StaffLogin from "./pages/staff/StaffLogin";
import StaffRequests from "./pages/staff/StaffRequests";

function App() {
  // [수정] 화면 이동 상태
  const [currentPage, setCurrentPage] = useState("staffIntro");

  // [추가] 선택한 상담 요청 ID
  const [selectedRequestId, setSelectedRequestId] = useState(null);

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
    return <StaffIntro onLogin={() => setCurrentPage("staffLogin")} />;
  }

  // [추가] 직원 PIN 로그인 화면
  if (currentPage === "staffLogin") {
    return (
      <StaffLogin
        onBack={() => setCurrentPage("staffIntro")}
        onLogin={() => setCurrentPage("staffRequests")}
      />
    );
  }

  // [추가] 직원 상담 요청 목록 화면
  if (currentPage === "staffRequests") {
    return (
      <StaffRequests
        onSettings={() => {
          // [추가] StaffExitModal 구현 전 임시 동작
          alert("POS 설정을 엽니다.");
        }}
        onSelectRequest={(requestId) => {
          // [추가] 선택한 요청 ID 저장
          setSelectedRequestId(requestId);

          // [추가] StaffRequestDetail 구현 전 임시 확인
          alert(`${requestId} 상담 상세 화면으로 이동합니다.`);
        }}
      />
    );
  }

  return <Help />;
}

export default App;
