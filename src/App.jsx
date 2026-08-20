// [수정] 화면 상태와 분석 API 진입 처리를 위한 React 기능
import { useCallback, useEffect, useRef, useState } from "react";

// [수정] react-router-dom을 이용한 페이지 전환 및 현재 경로 확인
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

// [추가] 니즈 분석 조회·생성·재분석 API
import {
  createNeedsAnalysis,
  getNeedsAnalysis,
  // [추가] 수정한 니즈 분석 결과 저장 API
  updateNeedsAnalysis,
} from "./api/analysisApi";

// [수정] 고객 세션 ID 조회 및 직원 POS 종료 후 토큰 삭제
import { getSessionId, removeStaffToken } from "./utils/storage";

import Help from "./pages/help/Help";

import Onboarding1 from "./pages/onboarding/Onboarding1";
import Onboarding2 from "./pages/onboarding/Onboarding2";
import OnboardingSetup from "./pages/onboarding/OnboardingSetup";
import OnboardingComplete from "./pages/onboarding/OnboardingComplete";

import ExploreHome from "./pages/explore/ExploreHome";
// [추가] 로그인 재방문 시 탐색 아카이브 / 과거 방문 스냅샷
import ExploreArchive from "./pages/explore/ExploreArchive";
import ExplorePastVisit from "./pages/explore/ExplorePastVisit";
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

// [추가] 탐색 아카이브 카드 썸네일 이미지
import reShoesImage from "./assets/images/re-shoes.svg";
import reBagImage from "./assets/images/re-bag.svg";
import reShirtImage from "./assets/images/re-shirt.svg";

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
 * [수정] API 조회 전 분석 데이터의 빈 구조
 * 임시 분석값 대신 응답을 안전하게 표시하기 위한 기본 필드만 유지합니다.
 */
const EMPTY_ANALYSIS_DATA = {
  productCategory: "",
  preferredColor: "",
  preferredMaterial: "",
  preferredSize: "",
  comment: "",
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
 * [수정] 실제 API 응답을 받기 전 최초 분석 상태를 생성합니다.
 */
const createInitialAnalysisState = () => ({
  canAnalyze: false,
  savedCount: 0,
  hasAnalysis: false,
  analysisData: { ...EMPTY_ANALYSIS_DATA },
  editedAnalysis: { ...EMPTY_ANALYSIS_DATA },
  analysisStep: ANALYSIS_STEP.INITIAL,
  editModalType: null,
});

/**
 * [추가] API 오류에서 화면에 표시할 메시지를 구성합니다.
 */
const getAnalysisErrorMessage = (error, fallbackMessage) => {
  return (
    error?.data?.message ??
    error?.data?.error ??
    (error?.status ? error.message : fallbackMessage)
  );
};

/**
 * [추가] 탐색 아카이브 더미 데이터 (API 연동 전)
 * isNew: true인 항목만 "지금 이 로그인 세션의 실시간 탐색 화면"으로 연결됩니다.
 * TODO: 방문 기록 API 나오면 이 더미 대신 실제 데이터로 교체
 */
const VISIT_ARCHIVE = [
  // TODO: Figma에 3번째 카드 라벨/날짜가 아직 확정 안 돼서(디자이너가 "첫 MCM" 그대로 복제해둠)
  // 일단 이미지만 먼저 넣어둡니다. 확정되면 label/date 교체 필요.
  { id: "visit-3", label: "세번째 MCM", date: "2025.08.16", isNew: true, image: reShirtImage },
  { id: "visit-2", label: "두번째 MCM", date: "2025.08.16", isNew: false, image: reShoesImage },
  { id: "visit-1", label: "첫 MCM", date: "2025.08.16", isNew: false, image: reBagImage },
];

function App() {
  const navigate = useNavigate();

  // [추가] 분석 탭 진입 여부 확인에 사용하는 현재 경로
  const location = useLocation();

  /**
   * [수정] POS 종료 성공 후 직원 토큰을 삭제하고 시작 화면으로 이동합니다.
   */
  const handleStaffExitSuccess = () => {
    removeStaffToken();
    navigate("/staff");
  };

  const [analysisState, setAnalysisState] = useState(
    createInitialAnalysisState,
  );

  // [추가] 분석 GET 요청 완료 여부
  const [isAnalysisInitialized, setIsAnalysisInitialized] = useState(false);

  // [추가] 분석 GET 요청 진행 여부
  const [isAnalysisFetching, setIsAnalysisFetching] = useState(false);

  // [추가] 상태 갱신 전 발생할 수 있는 분석 GET 중복 요청을 즉시 차단합니다.
  const isAnalysisFetchingRef = useRef(false);

  // [추가] 분석 GET·POST 실패 안내 메시지
  const [analysisError, setAnalysisError] = useState("");

  // [추가] 니즈 분석 수정 저장 요청 진행 여부
  const [isAnalysisSaving, setIsAnalysisSaving] = useState(false);

  // [추가] 연속 클릭 사이에도 PUT 중복 요청을 즉시 차단합니다.
  const isAnalysisSavingRef = useRef(false);

  // [추가] 최초 분석·재분석 POST 요청의 빠른 중복 실행을 즉시 차단합니다.
  const isAnalysisRequestingRef = useRef(false);

  // [추가] 분석 경로의 이전 진입 상태를 저장해 중복 GET 요청을 방지합니다.
  const wasAnalysisRouteRef = useRef(false);

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

  // [추가] 쇼핑 셋업에서 입력한 최신 닉네임 (탐색 아카이브 등 개인화 표시용)
  const [userName, setUserName] = useState("");

  // [추가] 쇼핑 셋업 완료 시 닉네임 저장
  const handleSetUserName = (name) => {
    setUserName(name);
  };

  const isEditModalOpen = Boolean(analysisState.editModalType);

  // [추가] 현재 경로가 분석 화면인지 확인합니다.
  const isAnalysisRoute = location.pathname.startsWith("/analysis");

  /**
   * [추가] 분석 탭 진입 시 실제 분석 가능 여부와 기존 결과를 조회합니다.
   */
  const loadNeedsAnalysis = useCallback(async () => {
    if (isAnalysisFetchingRef.current) {
      return;
    }

    const sessionId = getSessionId();

    isAnalysisFetchingRef.current = true;
    setIsAnalysisFetching(true);
    setAnalysisError("");

    if (!sessionId) {
      isAnalysisFetchingRef.current = false;
      setIsAnalysisInitialized(false);
      setIsAnalysisFetching(false);
      setAnalysisError("세션 정보를 확인할 수 없습니다. 다시 시도해주세요.");
      return;
    }

    try {
      const response = await getNeedsAnalysis(sessionId);
      const hasAnalysis = Boolean(response.analysis);
      const nextAnalysisData = hasAnalysis
        ? { ...EMPTY_ANALYSIS_DATA, ...response.analysis }
        : { ...EMPTY_ANALYSIS_DATA };

      setAnalysisState((previousState) => ({
        ...previousState,
        canAnalyze: Boolean(response.canAnalyze),
        savedCount: response.savedCount ?? 0,
        hasAnalysis,
        analysisData: nextAnalysisData,
        editedAnalysis: { ...nextAnalysisData },
        analysisStep: hasAnalysis
          ? ANALYSIS_STEP.RESULT
          : ANALYSIS_STEP.INITIAL,
        editModalType: null,
      }));
      setIsAnalysisInitialized(true);
    } catch (error) {
      setIsAnalysisInitialized(false);
      setAnalysisError(
        getAnalysisErrorMessage(
          error,
          "니즈 분석 정보를 불러오지 못했습니다. 다시 시도해주세요.",
        ),
      );
    } finally {
      isAnalysisFetchingRef.current = false;
      setIsAnalysisFetching(false);
    }
  }, []);

  // [추가] 분석 경로에 새로 진입했을 때만 GET 요청을 실행합니다.
  useEffect(() => {
    if (isAnalysisRoute && !wasAnalysisRouteRef.current) {
      loadNeedsAnalysis();
    }

    wasAnalysisRouteRef.current = isAnalysisRoute;
  }, [isAnalysisRoute, loadNeedsAnalysis]);

  /**
   * [추가] 최초 분석과 업데이트에서 공통 POST 요청을 실행합니다.
   */
  const requestNeedsAnalysis = async (loadingStep, failureStep) => {
    if (isAnalysisRequestingRef.current) {
      return;
    }

    const sessionId = getSessionId();

    if (!sessionId) {
      setAnalysisError("세션 정보를 확인할 수 없습니다. 다시 시도해주세요.");
      return;
    }

    isAnalysisRequestingRef.current = true;
    setAnalysisError("");
    setAnalysisState((previousState) => ({
      ...previousState,
      analysisStep: loadingStep,
    }));

    try {
      const response = await createNeedsAnalysis(sessionId);
      const nextAnalysisData = {
        ...EMPTY_ANALYSIS_DATA,
        ...response,
      };

      setAnalysisState((previousState) => ({
        ...previousState,
        hasAnalysis: true,
        analysisData: nextAnalysisData,
        editedAnalysis: { ...nextAnalysisData },
        analysisStep: ANALYSIS_STEP.REVIEW,
        editModalType: null,
      }));
    } catch (error) {
      setAnalysisState((previousState) => ({
        ...previousState,
        analysisStep: failureStep,
      }));
      setAnalysisError(
        getAnalysisErrorMessage(
          error,
          "니즈 분석에 실패했습니다. 다시 시도해주세요.",
        ),
      );
    } finally {
      isAnalysisRequestingRef.current = false;
    }
  };

  /**
   * [수정] 최초 니즈 분석 POST 요청을 시작합니다.
   */
  const handleStartAnalysis = async () => {
    if (!analysisState.canAnalyze) {
      return;
    }

    await requestNeedsAnalysis(ANALYSIS_STEP.LOADING, ANALYSIS_STEP.INITIAL);
  };

  const handleApproveAnalysis = () => {
    // [수정] 승인은 별도 API 호출 없이 결과 화면으로 이동합니다.
    setAnalysisState((previousState) => ({
      ...previousState,
      hasAnalysis: true,
      analysisStep: ANALYSIS_STEP.RESULT,
    }));
  };

  const handleStartEditAnalysis = () => {
    // [추가] 수정 화면에 진입할 때 이전 API 오류 안내를 초기화합니다.
    setAnalysisError("");
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

  /**
   * [수정] 수정 완료 시 PUT 요청을 보내고 서버가 반환한 결과를 반영합니다.
   */
  const handleCompleteAnalysisEdit = async () => {
    if (isAnalysisSavingRef.current) {
      return;
    }

    const sessionId = getSessionId();

    if (!sessionId) {
      setAnalysisError("세션 정보를 확인할 수 없습니다. 다시 시도해주세요.");
      return;
    }

    isAnalysisSavingRef.current = true;
    setIsAnalysisSaving(true);
    setAnalysisError("");

    try {
      const response = await updateNeedsAnalysis(
        sessionId,
        analysisState.editedAnalysis,
      );
      const nextAnalysisData = {
        ...EMPTY_ANALYSIS_DATA,
        ...analysisState.editedAnalysis,
        ...response,
      };

      setAnalysisState((previousState) => ({
        ...previousState,
        hasAnalysis: true,
        analysisData: nextAnalysisData,
        editedAnalysis: { ...nextAnalysisData },
        editModalType: null,
        analysisStep: ANALYSIS_STEP.EDIT_COMPLETE,
      }));
    } catch (error) {
      setAnalysisError(
        getAnalysisErrorMessage(
          error,
          "니즈 분석 수정 저장에 실패했습니다. 다시 시도해주세요.",
        ),
      );
    } finally {
      isAnalysisSavingRef.current = false;
      setIsAnalysisSaving(false);
    }
  };

  const handleContinueAnalysis = () => {
    setAnalysisState((previousState) => ({
      ...previousState,
      analysisStep: ANALYSIS_STEP.RESULT,
    }));
  };

  /**
   * [수정] 기존 결과 업데이트 시 동일한 니즈 분석 POST 요청을 실행합니다.
   */
  const handleUpdateAnalysis = async () => {
    if (!analysisState.hasAnalysis || !analysisState.canAnalyze) {
      return;
    }

    await requestNeedsAnalysis(
      ANALYSIS_STEP.UPDATE_LOADING,
      ANALYSIS_STEP.RESULT,
    );
  };

  const renderAnalysisScreen = () => {
    if (analysisState.analysisStep === ANALYSIS_STEP.LOADING) {
      return <AnalysisLoading mode="initial" />;
    }

    if (analysisState.analysisStep === ANALYSIS_STEP.UPDATE_LOADING) {
      return <AnalysisLoading mode="update" />;
    }

    if (analysisState.analysisStep === ANALYSIS_STEP.EDIT_COMPLETE) {
      return <AnalysisEditComplete onContinue={handleContinueAnalysis} />;
    }

    return (
      <Analysis
        analysisStep={analysisState.analysisStep}
        canAnalyze={analysisState.canAnalyze}
        savedCount={analysisState.savedCount}
        hasAnalysis={analysisState.hasAnalysis}
        analysisData={analysisState.analysisData}
        editedAnalysis={analysisState.editedAnalysis}
        editModalType={analysisState.editModalType}
        isEditModalOpen={isEditModalOpen}
        isAnalysisFetching={isAnalysisFetching}
        isAnalysisSaving={isAnalysisSaving}
        isAnalysisInitialized={isAnalysisInitialized}
        analysisError={analysisError}
        onRetryAnalysisLoad={loadNeedsAnalysis}
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

      {/* [수정] 쇼핑 셋업 완료 시 닉네임을 App.jsx에 저장 */}
      <Route
        path="/onboarding/setup"
        element={
          <OnboardingSetup
            onBack={() => navigate(-1)}
            onSubmit={(data) => {
              console.log("닉네임/라이프스타일:", data);
              handleSetUserName(data.nickname);
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

      {/* [수정] 탐색 기본 화면 - 로그인 상태면 탐색 아카이브, 아니면 기존 화면 */}
      <Route
        path="/explore"
        element={
          isLoggedIn ? (
            <ExploreArchive
              userName={userName}
              visits={VISIT_ARCHIVE}
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
              onScan={() => navigate("/explore/scan")}
              onSelectVisit={(visit) => {
                if (visit.isNew) {
                  navigate("/explore/home");
                } else {
                  navigate(`/explore/visit/${visit.id}`);
                }
              }}
            />
          ) : (
            <ExploreHome
              savedItems={savedItems}
              onDeleteSavedItem={handleDeleteSavedItem}
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
            />
          )
        }
      />

      {/* [수정] 탐색 아카이브에서 "New" 방문 클릭 시 이동하는 실시간 탐색 화면
          - 사용자 확인: 개인화 없이 기존 탐색 화면 그대로(X 버튼, 기본 제목) */}
      <Route
        path="/explore/home"
        element={
          <ExploreHome
            savedItems={savedItems}
            onDeleteSavedItem={handleDeleteSavedItem}
            isLoggedIn={isLoggedIn}
            onLogout={handleLogout}
          />
        }
      />

      {/* [추가] 탐색 아카이브에서 과거 방문 클릭 시 이동하는 읽기 전용 스냅샷 */}
      <Route
        path="/explore/visit/:visitId"
        element={
          <ExplorePastVisit
            userName={userName}
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
            onComplete={() =>
              navigate("/explore/scan/confirm", { replace: true })
            }
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
            onSelectRequest={(requestId) => {
              navigate(`/staff/requests/${encodeURIComponent(requestId)}`);
            }}
            onExitPos={handleStaffExitSuccess}
          />
        }
      />

      <Route
        path="/staff/requests/:requestId"
        element={
          <StaffRequestDetail
            onSettings={() => {
              alert("상담을 종료한 후 POS를 종료해주세요.");
            }}
            onEndConsultation={(requestId) =>
              navigate(`/staff/requests/${encodeURIComponent(requestId)}/end`)
            }
          />
        }
      />

      <Route
        path="/staff/requests/:requestId/end"
        element={
          <StaffConsultationEnd
            onContinue={(requestId) =>
              navigate(`/staff/requests/${encodeURIComponent(requestId)}`)
            }
            onConfirmEnd={() => {
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