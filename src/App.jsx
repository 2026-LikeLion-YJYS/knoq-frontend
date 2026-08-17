// [추가] 화면 상태 관리를 위한 useState
import { useState } from "react";
// react-router-dom 페이지 전환용
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Help from "./pages/help/Help";

import Onboarding1 from "./pages/onboarding/Onboarding1";
import Onboarding2 from "./pages/onboarding/Onboarding2";
import OnboardingSetup from "./pages/onboarding/OnboardingSetup";
import OnboardingComplete from "./pages/onboarding/OnboardingComplete";

import StaffIntro from "./pages/staff/StaffIntro";
import StaffLogin from "./pages/staff/StaffLogin";
import StaffRequests from "./pages/staff/StaffRequests";
import StaffRequestDetail from "./pages/staff/StaffRequestDetail";
import StaffConsultationEnd from "./pages/staff/StaffConsultationEnd";

import Analysis from "./pages/analysis/Analysis";
import AnalysisLoading from "./pages/analysis/AnalysisLoading";

function App() {
  // 페이지 전환은 react-router-dom으로 이관
  const navigate = useNavigate();

  // [추가] 선택한 상담 요청 ID
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  // [추가] API 연동 전 요청별 상담 상태
  const [requestStatuses, setRequestStatuses] = useState({});

  return (
    <Routes>
      {/* [수정] 화면 이동 상태 - 지금은 온보딩 설정 화면 테스트용으로 임시 설정 */}
      <Route path="/" element={<Navigate to="/onboarding/setup" replace />} />

      {/* [테스트용] 온보딩1 - 매장진입/저장범위선택 */}
      <Route
        path="/onboarding"
        element={
          <Onboarding1
            onSelectPrivate={() => alert("프라이빗 선택")}
            onSelectAccount={() => alert("계정 선택")}
          />
        }
      />

      {/* [테스트용] 온보딩2 - 약관 동의 확인 */}
      <Route
        path="/onboarding/consent"
        element={
          <Onboarding2
            onBack={() => navigate(-1)}
            onSubmit={(consents) => console.log("제출된 동의값:", consents)}
          />
        }
      />

      {/* [테스트용] 닉네임+라이프스타일 선택 */}
      <Route
        path="/onboarding/setup"
        element={
          <OnboardingSetup
            onBack={() => navigate(-1)}
            onSubmit={(data) => {
              console.log("닉네임/라이프스타일:", data);
              navigate("/onboarding/complete");
            }}
          />
        }
      />

      {/* [테스트용] 쇼핑 셋업 완료 */}
      <Route
        path="/onboarding/complete"
        element={
          <OnboardingComplete
            onBack={() => navigate(-1)}
            onStart={() => alert("쇼핑 시작하기")}
          />
        }
      />

      {/* [추가] 직원 로그인 진입 화면 */}
      <Route
        path="/staff"
        element={<StaffIntro onLogin={() => navigate("/staff/login")} />}
      />

      {/* [추가] 직원 PIN 로그인 화면 */}
      <Route
        path="/staff/login"
        element={
          <StaffLogin
            onBack={() => navigate("/staff")}
            onLogin={() => navigate("/staff/requests")}
          />
        }
      />

      {/* [추가] 직원 상담 요청 목록 화면 */}
      <Route
        path="/staff/requests"
        element={
          <StaffRequests
            requestStatuses={requestStatuses}
            onSelectRequest={(requestId) => {
              setSelectedRequestId(requestId);
              setRequestStatuses((previousStatuses) => ({
                ...previousStatuses,
                [requestId]: "ACCEPTED",
              }));
              navigate("/staff/requests/detail");
            }}
            onExitPos={() => {
              setSelectedRequestId(null);
              setRequestStatuses({});
              navigate("/staff");
            }}
          />
        }
      />

      {/* [추가] 직원 상담 요청 상세 화면 */}
      <Route
        path="/staff/requests/detail"
        element={
          <StaffRequestDetail
            requestId={selectedRequestId}
            onSettings={() => {
              alert("상담을 종료한 후 POS를 종료해주세요.");
            }}
            onEndConsultation={() => navigate("/staff/requests/end")}
          />
        }
      />

      {/* [추가] 직원 상담 종료 확인 화면 */}
      <Route
        path="/staff/requests/end"
        element={
          <StaffConsultationEnd
            requestId={selectedRequestId}
            onContinue={() => navigate("/staff/requests/detail")}
            onConfirmEnd={(requestId) => {
              setRequestStatuses((previousStatuses) => ({
                ...previousStatuses,
                [requestId]: "COMPLETED",
              }));
              setSelectedRequestId(null);
              navigate("/staff/requests");
            }}
          />
        }
      />

      {/* [수정] 니즈 분석 기본 화면 */}
      <Route
        path="/analysis"
        element={
          <Analysis
            onStartAnalysis={() => navigate("/analysis/loading")}
          />
        }
      />

      {/* [추가] 최초 니즈 분석 로딩 화면 */}
      <Route
        path="/analysis/loading"
        element={
          <AnalysisLoading onComplete={() => navigate("/analysis/review")} />
        }
      />

      {/* [추가] 분석 결과 승인·수정 검토 화면 */}
      <Route
        path="/analysis/review"
        element={
          <Analysis
            initialStep="review"
            onUpdateAnalysis={() => {
              // [추가] 업데이트 로딩 화면은 이후 커밋에서 연결
              alert("니즈 분석 업데이트");
            }}
          />
        }
      />

      <Route path="*" element={<Help />} />
    </Routes>
  );
}

export default App;
