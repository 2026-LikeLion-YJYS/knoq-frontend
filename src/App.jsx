// [추가] 화면 상태 관리를 위한 useState
import { useState } from "react";

import Help from "./pages/help/Help";
import Onboarding1 from "./pages/onboarding/Onboarding1";
import Onboarding2 from "./pages/onboarding/Onboarding2";

// [추가] 직원 화면
import StaffIntro from "./pages/staff/StaffIntro";
import StaffLogin from "./pages/staff/StaffLogin";
import StaffRequests from "./pages/staff/StaffRequests";
import StaffRequestDetail from "./pages/staff/StaffRequestDetail";
import StaffConsultationEnd from "./pages/staff/StaffConsultationEnd";

function App() {
  // [수정] 화면 이동 상태 - 지금은 온보딩2 테스트용으로 임시 설정
  const [currentPage, setCurrentPage] = useState("onboardingConsent");

  // [추가] 선택한 상담 요청 ID
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  // [추가] API 연동 전 요청별 상담 상태
  const [requestStatuses, setRequestStatuses] = useState({});

  // [테스트용] 온보딩1 - 매장진입/저장범위선택
  if (currentPage === "onboarding") {
    return (
      <Onboarding1
        onSelectPrivate={() => alert("프라이빗 선택")}
        onSelectAccount={() => alert("계정 선택")}
      />
    );
  }

  // [테스트용] 온보딩2 - 약관 동의 확인
  if (currentPage === "onboardingConsent") {
    return (
      <Onboarding2
        onBack={() => alert("뒤로가기")}
        onSubmit={(consents) => console.log("제출된 동의값:", consents)}
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
        requestStatuses={requestStatuses}
        onSelectRequest={(requestId) => {
          setSelectedRequestId(requestId);
          setRequestStatuses((previousStatuses) => ({
            ...previousStatuses,
            [requestId]: "ACCEPTED",
          }));
          setCurrentPage("staffRequestDetail");
        }}
        onExitPos={() => {
          setSelectedRequestId(null);
          setRequestStatuses({});
          setCurrentPage("staffIntro");
        }}
      />
    );
  }

  // [추가] 직원 상담 요청 상세 화면
  if (currentPage === "staffRequestDetail") {
    return (
      <StaffRequestDetail
        requestId={selectedRequestId}
        onSettings={() => {
          alert("상담을 종료한 후 POS를 종료해주세요.");
        }}
        onEndConsultation={() => {
          setCurrentPage("staffConsultationEnd");
        }}
      />
    );
  }

  // [추가] 직원 상담 종료 확인 화면
  if (currentPage === "staffConsultationEnd") {
    return (
      <StaffConsultationEnd
        requestId={selectedRequestId}
        onContinue={() => {
          setCurrentPage("staffRequestDetail");
        }}
        onConfirmEnd={(requestId) => {
          setRequestStatuses((previousStatuses) => ({
            ...previousStatuses,
            [requestId]: "COMPLETED",
          }));
          setSelectedRequestId(null);
          setCurrentPage("staffRequests");
        }}
      />
    );
  }

  return <Help />;
}

export default App;