// [추가] 화면 상태 관리를 위한 useState
import { useState } from "react";

// [추가] react-router-dom을 이용한 페이지 전환
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Help from "./pages/help/Help";

import Onboarding1 from "./pages/onboarding/Onboarding1";
import Onboarding2 from "./pages/onboarding/Onboarding2";
import OnboardingSetup from "./pages/onboarding/OnboardingSetup";
import OnboardingComplete from "./pages/onboarding/OnboardingComplete";

import ExploreHome from "./pages/explore/ExploreHome";
import ScanCapture from "./pages/explore/ScanCapture";
import ScanRecognizing from "./pages/explore/ScanRecognizing";
import ScanConfirm from "./pages/explore/ScanConfirm";
import ScanComplete from "./pages/explore/ScanComplete";

import StaffIntro from "./pages/staff/StaffIntro";
import StaffLogin from "./pages/staff/StaffLogin";
import StaffRequests from "./pages/staff/StaffRequests";
import StaffRequestDetail from "./pages/staff/StaffRequestDetail";
import StaffConsultationEnd from "./pages/staff/StaffConsultationEnd";

import Analysis from "./pages/analysis/Analysis";
import AnalysisLoading from "./pages/analysis/AnalysisLoading";
import AnalysisEditComplete from "./pages/analysis/AnalysisEditComplete";

import NotificationPage from "./pages/notification/NotificationPage";

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
  savedCount: 2,

  hasAnalysis: false,
  analysisData: { ...INITIAL_ANALYSIS_DATA },
  editedAnalysis: { ...INITIAL_ANALYSIS_DATA },
  analysisStep: ANALYSIS_STEP.INITIAL,
  editModalType: null,
});

function App() {
  const navigate = useNavigate();

  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const [requestStatuses, setRequestStatuses] = useState({});

  const [analysisState, setAnalysisState] = useState(
    createInitialAnalysisState,
  );

  const [savedItems, setSavedItems] = useState(
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      isRecommended: i === 4 || i === 5,
    })),
  );

  const handleDeleteSavedItem = (id) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddScannedProduct = (product) => {
    setSavedItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        image: product.image,
        name: product.name,
        isRecommended: false,
      },
    ]);
  };

  // [추가] 로그인 상태 (내 정보 기억하고 이어서 탐색하기 → 카카오 로그인 완료 시 true)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // [추가] 카카오 로그인 성공 시 호출
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // [추가] 종료 모달에서 로그아웃 시 호출
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const isEditModalOpen = Boolean(analysisState.editModalType);

  const handleStartAnalysis = () => {
    if (analysisState.savedCount < 2) {
      return;
    }

    setAnalysisState((previousState) => ({
      ...previousState,
      analysisStep: ANALYSIS_STEP.LOADING,
    }));
  };

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

  const handleApproveAnalysis = () => {
    setAnalysisState((previousState) => ({
      ...previousState,
      hasAnalysis: true,
      analysisStep: ANALYSIS_STEP.RESULT,
    }));
  };

  const handleStartEditAnalysis = () => {
    setAnalysisState((previousState) => ({
      ...previousState,
      editedAnalysis: { ...previousState.analysisData },
      analysisStep: ANALYSIS_STEP.EDIT,
      editModalType: null,
    }));
  };

  const handleOpenEditModal = (modalType) => {
    setAnalysisState((previousState) => ({
      ...previousState,
      editModalType: modalType,
    }));
  };

  const handleCloseEditModal = () => {
    setAnalysisState((previousState) => ({
      ...previousState,
      editModalType: null,
    }));
  };

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

  const handleCompleteAnalysisEdit = () => {
    setAnalysisState((previousState) => ({
      ...previousState,
      hasAnalysis: true,
      analysisData: { ...previousState.editedAnalysis },
      editModalType: null,
      analysisStep: ANALYSIS_STEP.EDIT_COMPLETE,
    }));
  };

  const handleContinueAnalysis = () => {
    setAnalysisState((previousState) => ({
      ...previousState,
      analysisStep: ANALYSIS_STEP.RESULT,
    }));
  };

  const handleUpdateAnalysis = () => {
    if (!analysisState.hasAnalysis || analysisState.savedCount < 2) {
      return;
    }

    setAnalysisState((previousState) => ({
      ...previousState,
      analysisStep: ANALYSIS_STEP.UPDATE_LOADING,
    }));
  };

  const handleUpdateLoadingComplete = () => {
    const reanalyzedData = { ...INITIAL_ANALYSIS_DATA };

    setAnalysisState((previousState) => ({
      ...previousState,
      hasAnalysis: true,
      analysisData: reanalyzedData,
      editedAnalysis: { ...reanalyzedData },
      analysisStep: ANALYSIS_STEP.REVIEW,
    }));
  };

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
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />
    );
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/onboarding" replace />} />

      {/* [수정] 프라이빗 둘러보기는 동의 화면 없이 바로 쇼핑 셋업으로 이동 */}
      <Route
        path="/onboarding"
        element={
          <Onboarding1
            onSelectPrivate={() => navigate("/onboarding/setup")}
            onSelectAccount={() => navigate("/onboarding/consent")}
          />
        }
      />

      {/* [수정] 카카오 로그인 성공 시 App.jsx의 isLoggedIn을 true로 설정 */}
      <Route
        path="/onboarding/consent"
        element={
          <Onboarding2
            onBack={() => navigate(-1)}
            onLoginSuccess={handleLoginSuccess}
            onSubmit={(consents) => {
              console.log("제출된 동의값:", consents);
              navigate("/onboarding/setup");
            }}
          />
        }
      />

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

      <Route
        path="/onboarding/complete"
        element={
          <OnboardingComplete
            onBack={() => navigate(-1)}
            onStart={() => navigate("/explore")}
          />
        }
      />

      {/* [수정] 탐색 기본 화면 - 로그인 상태 전달 */}
      <Route
        path="/explore"
        element={
          <ExploreHome
            savedItems={savedItems}
            onDeleteSavedItem={handleDeleteSavedItem}
            isLoggedIn={isLoggedIn}
            onLogout={handleLogout}
          />
        }
      />

      <Route
        path="/explore/scan"
        element={
          <ScanCapture
            onClose={() => navigate("/explore")}
            onCapture={() => navigate("/explore/scan/recognizing")}
          />
        }
      />

      <Route
        path="/explore/scan/recognizing"
        element={
          <ScanRecognizing
            onComplete={() => navigate("/explore/scan/confirm", { replace: true })}
          />
        }
      />

      <Route
        path="/explore/scan/confirm"
        element={
          <ScanConfirm
            onRetake={() => navigate("/explore/scan", { replace: true })}
            onConfirm={(product) => {
              handleAddScannedProduct(product);
              navigate("/explore/scan/complete", { replace: true });
            }}
          />
        }
      />

      <Route
        path="/explore/scan/complete"
        element={
          <ScanComplete
            onBack={() => navigate("/explore")}
            onScanAgain={() => navigate("/explore/scan")}
            onViewAnalysis={() => navigate("/explore")}
          />
        }
      />

      <Route path="/analysis/*" element={renderAnalysisScreen()} />

      {/* [수정] 도움 화면 - 로그인 상태 전달 */}
      <Route
        path="/help"
        element={<Help isLoggedIn={isLoggedIn} onLogout={handleLogout} />}
      />

      <Route
        path="/staff"
        element={<StaffIntro onLogin={() => navigate("/staff/login")} />}
      />

      <Route
        path="/staff/login"
        element={
          <StaffLogin
            onBack={() => navigate("/staff")}
            onLogin={() => navigate("/staff/requests")}
          />
        }
      />

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

      <Route path="*" element={<Navigate to="/" replace />} />

      <Route path="/notification" element={<NotificationPage />} />
    </Routes>
  );
}

export default App;