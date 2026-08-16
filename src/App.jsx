// [추가] 화면 상태 관리를 위한 useState
import { useState } from "react";

import Help from "./pages/help/Help";
import Onboarding1 from "./pages/onboarding/Onboarding1";

// [추가] 직원 화면
import StaffIntro from "./pages/staff/StaffIntro";
import StaffLogin from "./pages/staff/StaffLogin";
import StaffRequests from "./pages/staff/StaffRequests";
import StaffRequestDetail from "./pages/staff/StaffRequestDetail";
import StaffConsultationEnd from "./pages/staff/StaffConsultationEnd";

function App() {
  // [수정] 화면 이동 상태
  const [currentPage, setCurrentPage] = useState("staffIntro");

  // [추가] 선택한 상담 요청 ID
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  // [추가] API 연동 전 요청별 상담 상태
  const [requestStatuses, setRequestStatuses] = useState({});

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
        requestStatuses={requestStatuses}
        onSettings={() => {
          // [추가] StaffExitModal 구현 전 임시 동작
          alert("POS 설정을 엽니다.");
        }}
        onSelectRequest={(requestId) => {
          // [추가] 선택한 요청 ID 저장
          setSelectedRequestId(requestId);

          // [추가] 상담 시작 상태로 변경
          setRequestStatuses((previousStatuses) => ({
            ...previousStatuses,
            [requestId]: "ACCEPTED",
          }));

          // [수정] 직원 상담 요청 상세 화면으로 이동
          setCurrentPage("staffRequestDetail");
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
          // [추가] StaffExitModal 구현 전 임시 동작
          alert("POS 설정을 엽니다.");
        }}
        onEndConsultation={() => {
          // [수정] 상담 종료 확인 화면으로 이동
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
          // 상담 종료를 취소하고 기존 상담 화면으로 돌아간다.
          setCurrentPage("staffRequestDetail");
        }}
        onConfirmEnd={(requestId) => {
          // API 연동 전 상담 완료 상태로 변경
          setRequestStatuses((previousStatuses) => ({
            ...previousStatuses,
            [requestId]: "COMPLETED",
          }));

          // 상담 완료 후 요청 목록으로 이동
          setCurrentPage("staffRequests");
        }}
      />
    );
  }

  return <Help />;
}

export default App;
