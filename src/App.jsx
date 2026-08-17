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
import AnalysisEditComplete from "./pages/analysis/AnalysisEditComplete";

/**
 * [추가] 분석 화면 진행 단계
 * 분석 관련 조건문에서 문자열을 직접 반복하지 않도록 관리합니다.
 */
const ANALYSIS_STEP = {
  INITIAL: "initial",
  LOADING: "loading",
  REVIEW: "review",
  RESULT: "result",
  UPDATE_LOADING: "update-loading",
  EDIT: "edit",
  EDIT_COMPLETE: "edit-complete",
};

/**
 * [추가] API 연결 전 니즈 분석 임시 데이터
 */
const INITIAL_ANALYSIS_DATA = {
  productCategory: "토트백 / 쇼퍼백",
  preferredColor: "Black · Cognac",
  preferredMaterial: "Leather",
  preferredSize: "Medium · Large",
  comment:
    "고객님은 컬러와 디자인보다 수납 가능한 사이즈를 더 일관되게 선택하고 있어요.",
};

/**
 * [추가] 수정 모달 종류와 분석 데이터 필드 연결
 */
const ANALYSIS_FIELD_MAP = {
  category: "productCategory",
  color: "preferredColor",
  material: "preferredMaterial",
  size: "preferredSize",
};

/**
 * [추가] 최초 분석 상태 생성
 * 분석 원본과 수정 중인 데이터가 같은 객체를 공유하지 않도록 복사합니다.
 */
const createInitialAnalysisState = () => ({
  // [테스트] 분석1은 1, 분석2부터 전체 플로우 테스트는 2로 변경합니다.
  savedCount: 2,

  hasAnalysis: false,
  analysisData: { ...INITIAL_ANALYSIS_DATA },
  editedAnalysis: { ...INITIAL_ANALYSIS_DATA },
  analysisStep: ANALYSIS_STEP.INITIAL,
  editModalType: null,
});

function App() {
  // 페이지 전환은 react-router-dom으로 이관
  const navigate = useNavigate();

  // [추가] 선택한 상담 요청 ID
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  // [추가] API 연동 전 요청별 상담 상태
  const [requestStatuses, setRequestStatuses] = useState({});

  // [수정] 분석 관련 상태를 하나의 객체에서 통합 관리
  const [analysisState, setAnalysisState] = useState(
    createInitialAnalysisState,
  );

  // [추가] 수정할 항목이 선택되면 모달을 표시합니다.
  const isEditModalOpen = Boolean(analysisState.editModalType);

  /**
   * [추가] 최초 니즈 분석 시작
   * 저장 제품이 2개 이상일 때 분석3으로 이동합니다.
   */
  const handleStartAnalysis = () => {
    if (analysisState.savedCount < 2) {
      return;
    }

    setAnalysisState((previousState) => ({
      ...previousState,
      analysisStep: ANALYSIS_STEP.LOADING,
    }));
  };

  /**
   * [추가] 최초 니즈 분석 로딩 완료
   * 새 분석 결과를 저장하고 분석4로 이동합니다.
   */
  const handleInitialLoadingComplete = () => {
    const newAnalysisData = { ...INITIAL_ANALYSIS_DATA };

    setAnalysisState((previousState) => ({
      ...previousState,
      hasAnalysis: true,
      analysisData: newAnalysisData,
      editedAnalysis: { ...newAnalysisData },
      analysisStep: ANALYSIS_STEP.REVIEW,
    }));
  };

  /**
   * [추가] 분석 결과 승인
   * 분석4에서 분석5로 이동합니다.
   */
  const handleApproveAnalysis = () => {
    setAnalysisState((previousState) => ({
      ...previousState,
      hasAnalysis: true,
      analysisStep: ANALYSIS_STEP.RESULT,
    }));
  };

  /**
   * [추가] 분석 결과 수정 시작
   * 현재 분석 결과를 복사한 뒤 분석8로 이동합니다.
   */
  const handleStartEditAnalysis = () => {
    setAnalysisState((previousState) => ({
      ...previousState,
      editedAnalysis: { ...previousState.analysisData },
      analysisStep: ANALYSIS_STEP.EDIT,
      editModalType: null,
    }));
  };

  /**
   * [추가] 니즈 항목 수정 모달 열기
   */
  const handleOpenEditModal = (modalType) => {
    setAnalysisState((previousState) => ({
      ...previousState,
      editModalType: modalType,
    }));
  };

  /**
   * [추가] 니즈 항목 수정 모달 닫기
   */
  const handleCloseEditModal = () => {
    setAnalysisState((previousState) => ({
      ...previousState,
      editModalType: null,
    }));
  };

  /**
   * [추가] 수정 모달에서 선택한 값을 임시 수정 결과에 반영
   */
  const handleSaveEditValue = (value) => {
    setAnalysisState((previousState) => {
      const analysisField = ANALYSIS_FIELD_MAP[previousState.editModalType];

      if (!analysisField) {
        return previousState;
      }

      return {
        ...previousState,
        editedAnalysis: {
          ...previousState.editedAnalysis,
          [analysisField]: value,
        },
        editModalType: null,
      };
    });
  };

  /**
   * [추가] 전체 니즈 수정 완료
   * 수정 결과를 확정한 뒤 분석13으로 이동합니다.
   */
  const handleCompleteAnalysisEdit = () => {
    setAnalysisState((previousState) => ({
      ...previousState,
      hasAnalysis: true,
      analysisData: { ...previousState.editedAnalysis },
      editModalType: null,
      analysisStep: ANALYSIS_STEP.EDIT_COMPLETE,
    }));
  };

  /**
   * [추가] 수정 완료 화면에서 분석5로 이동
   */
  const handleContinueAnalysis = () => {
    setAnalysisState((previousState) => ({
      ...previousState,
      analysisStep: ANALYSIS_STEP.RESULT,
    }));
  };

  /**
   * [추가] 니즈 분석 업데이트 시작
   * 기존 결과에 값을 추가하지 않고 재분석 로딩 화면으로 이동합니다.
   */
  const handleUpdateAnalysis = () => {
    if (!analysisState.hasAnalysis || analysisState.savedCount < 2) {
      return;
    }

    setAnalysisState((previousState) => ({
      ...previousState,
      analysisStep: ANALYSIS_STEP.UPDATE_LOADING,
    }));
  };

  /**
   * [추가] 니즈 분석 업데이트 완료
   * 현재 저장 제품 기준의 새 분석 결과로 기존 결과를 교체합니다.
   */
  const handleUpdateLoadingComplete = () => {
    // [추가] API 연결 전에는 동일한 임시 데이터로 재분석 결과를 구성합니다.
    const reanalyzedData = { ...INITIAL_ANALYSIS_DATA };

    setAnalysisState((previousState) => ({
      ...previousState,
      hasAnalysis: true,
      analysisData: reanalyzedData,
      editedAnalysis: { ...reanalyzedData },
      analysisStep: ANALYSIS_STEP.REVIEW,
    }));
  };

  /**
   * [추가] 현재 분석 단계에 맞는 화면 표시
   */
  const renderAnalysisScreen = () => {
    if (analysisState.analysisStep === ANALYSIS_STEP.LOADING) {
      return (
        <AnalysisLoading
          mode="initial"
          onComplete={handleInitialLoadingComplete}
        />
      );
    }

    if (analysisState.analysisStep === ANALYSIS_STEP.UPDATE_LOADING) {
      return (
        <AnalysisLoading
          mode="update"
          onComplete={handleUpdateLoadingComplete}
        />
      );
    }

    if (analysisState.analysisStep === ANALYSIS_STEP.EDIT_COMPLETE) {
      return <AnalysisEditComplete onContinue={handleContinueAnalysis} />;
    }

    return (
      <Analysis
        analysisStep={analysisState.analysisStep}
        savedCount={analysisState.savedCount}
        hasAnalysis={analysisState.hasAnalysis}
        analysisData={analysisState.analysisData}
        editedAnalysis={analysisState.editedAnalysis}
        editModalType={analysisState.editModalType}
        isEditModalOpen={isEditModalOpen}
        onStartAnalysis={handleStartAnalysis}
        onApproveAnalysis={handleApproveAnalysis}
        onStartEditAnalysis={handleStartEditAnalysis}
        onOpenEditModal={handleOpenEditModal}
        onCloseEditModal={handleCloseEditModal}
        onSaveEditValue={handleSaveEditValue}
        onCompleteEdit={handleCompleteAnalysisEdit}
        onUpdateAnalysis={handleUpdateAnalysis}
      />
    );
  };

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

      {/* [수정] 전체 분석 화면을 하나의 상태 흐름으로 관리 */}
      <Route path="/analysis/*" element={renderAnalysisScreen()} />

      <Route path="*" element={<Help />} />
    </Routes>
  );
}

export default App;
