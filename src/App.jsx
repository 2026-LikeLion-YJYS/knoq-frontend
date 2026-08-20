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

// [추가] 새로고침·재진입 시 고객 저장 범위를 복원하는 세션 조회 API
// [윤서][수정] 온보딩 연동에 필요한 세션 관련 API 함수 추가
import {
  getCustomerSession,
  createSession,
  updateConsents,
  updateStorageScope,
  loginWithKakao,
  updateNickname,
  updateLifestyleTags,
} from "./api/sessionApi";

// [수정] 고객 세션·토큰 조회/저장 및 직원 POS 종료 후 토큰 삭제
// [윤서][수정] setSessionId, setSessionToken 추가
import {
  getSessionId,
  getSessionToken,
  setSessionId,
  setSessionToken,
  removeStaffToken,
} from "./utils/storage";

import Help from "./pages/help/Help";

import Onboarding1 from "./pages/onboarding/Onboarding1";
import Onboarding2 from "./pages/onboarding/Onboarding2";
import OnboardingSetup from "./pages/onboarding/OnboardingSetup";
import OnboardingComplete from "./pages/onboarding/OnboardingComplete";

import ExploreHome from "./pages/explore/ExploreHome";
// [추가] 로그인 재방문 시 탐색 아카이브 / 과거 방문 스냅샷 (병합 과정에서 빠졌던 부분 복구)
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
 * [윤서][추가] 온보딩 API 오류에서 화면에 표시할 "문자열"만 안전하게 뽑아냅니다.
 * 백엔드가 message 자리에 문자열이 아닌 객체(필드별 에러 등)를 내려주는 경우,
 * 그 객체를 그대로 화면에 넣으면 "[object Object]"로 보이는 문제를 막기 위한 함수입니다.
 */
const getOnboardingErrorMessage = (error, fallbackMessage) => {
  const candidate = error?.data?.message ?? error?.data?.error ?? error?.message;

  return typeof candidate === "string" && candidate.trim().length > 0
    ? candidate
    : fallbackMessage;
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

  // [수정] 저장된 고객 세션이 있으면 storageScope 복원 전까지 null로 두어 종료 API 오호출을 막습니다.
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return getSessionId() && getSessionToken() ? null : false;
  });

  // [추가] 쇼핑 셋업에서 입력한 최신 닉네임 (탐색 아카이브 등 개인화 표시용)
  const [userName, setUserName] = useState("");

  // [추가] 쇼핑 셋업 완료 시 닉네임 저장
  const handleSetUserName = (name) => {
    setUserName(name);
  };

  // [추가] StrictMode에서도 동일한 세션 복원 GET 요청이 중복되지 않도록 Promise를 보관합니다.
  const customerSessionRequestRef = useRef(null);

  /**
   * [추가] 새로고침·재진입 시 서버의 storageScope로 ACCOUNT 로그인 상태를 복원합니다.
   * 이 조회 API는 서버의 세션 만료 시각을 연장하지 않습니다.
   */
  useEffect(() => {
    const sessionId = getSessionId();
    const sessionToken = getSessionToken();

    if (!sessionId || !sessionToken) {
      return undefined;
    }

    let isActive = true;

    if (!customerSessionRequestRef.current) {
      customerSessionRequestRef.current = getCustomerSession(sessionId);
    }

    const sessionRequest = customerSessionRequestRef.current;

    sessionRequest
      .then((response) => {
        if (!isActive) {
          return;
        }

        if (response?.storageScope === "ACCOUNT") {
          setIsLoggedIn(true);
          // [윤서][추가] 백엔드 응답에 nickname이 새로 추가됨.
          // 새로고침 시 "OO님의 저장목록" 문구가 사라지지 않도록 여기서도 복원합니다.
          if (response?.nickname) {
            setUserName(response.nickname);
          }
          return;
        }

        if (response?.storageScope === "PRIVATE") {
          setIsLoggedIn(false);
          return;
        }

        // [추가] 필드가 아직 배포되지 않았거나 예상하지 못한 상태이면 종료 API를 선택하지 않습니다.
        setIsLoggedIn(null);
      })
      .catch(() => {
        if (isActive) {
          // [추가] 조회 실패를 PRIVATE로 오판하지 않고 새로고침 후 다시 복원할 수 있게 유지합니다.
          setIsLoggedIn(null);
        }
      })
      .finally(() => {
        if (customerSessionRequestRef.current === sessionRequest) {
          customerSessionRequestRef.current = null;
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  // [추가] 카카오 로그인 성공 시 호출
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // [추가] 종료 모달에서 로그아웃 시 호출
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // ===== [윤서] 여기부터 온보딩 API 연동을 위해 추가한 부분 =====

  // [윤서][추가] FR-000 매장 진입에서 받아온 매장명 (Onboarding1 화면 표시용)
  const [storeName, setStoreName] = useState("");

  // [윤서][추가] 온보딩 API 호출(저장 범위/동의/카카오/닉네임 등) 공통 진행 상태
  const [isOnboardingSubmitting, setIsOnboardingSubmitting] = useState(false);

  // [윤서][추가] 온보딩 API 호출 실패 안내 메시지
  const [onboardingError, setOnboardingError] = useState("");

  /**
   * [윤서][추가] FR-000 매장 진입
   * 이미 세션이 있으면(새로고침·재방문) 새로 만들지 않고, 없을 때만 QR 진입으로 간주해 세션을 생성합니다.
   * TODO: 실제 QR 배포 전 쿼리 파라미터 이름(storeCode) 최종 확인 필요
   */
  useEffect(() => {
    if (getSessionId() && getSessionToken()) {
      return undefined;
    }

    let isActive = true;
    const params = new URLSearchParams(window.location.search);
    const storeCode = params.get("storeCode") || "TEST-001";

    createSession(storeCode)
      .then((response) => {
        if (!isActive) return;

        setSessionId(response.sessionId);
        setSessionToken(response.sessionToken);
        setStoreName(response.storeName ?? "");
      })
      .catch((error) => {
        if (!isActive) return;

        console.error("매장 진입(FR-000) 실패:", error);
        setOnboardingError(
          getOnboardingErrorMessage(
            error,
            "매장 진입에 실패했습니다. 다시 시도해주세요.",
          ),
        );
      });

    return () => {
      isActive = false;
    };
  }, []);

  /**
   * [윤서][추가] "저장 없이 프라이빗하게 둘러보기" 클릭
   * FR-100(PRIVATE) → FR-002(필수 동의 자동 true) 순서로 호출합니다.
   */
  const handleSelectPrivate = async () => {
    const sessionId = getSessionId();
    if (!sessionId) return;

    setIsOnboardingSubmitting(true);
    setOnboardingError("");

    try {
      await updateStorageScope(sessionId, "PRIVATE");
      await updateConsents(sessionId, {
        termsOfService: true,
        privacyPolicy: true,
        over14: true,
        marketingOptIn: false,
      });
      navigate("/onboarding/setup");
    } catch (error) {
      console.error("저장 범위 선택(PRIVATE) 실패:", error);
      setOnboardingError(
        getOnboardingErrorMessage(
          error,
          "처리에 실패했습니다. 다시 시도해주세요.",
        ),
      );
    } finally {
      setIsOnboardingSubmitting(false);
    }
  };

  /**
   * [윤서][추가] "내 정보 기억하고 이어서 탐색하기" 클릭
   * FR-100(ACCOUNT) 호출 후 약관 동의 화면으로 이동합니다.
   */
  const handleSelectAccount = async () => {
    const sessionId = getSessionId();
    if (!sessionId) return;

    setIsOnboardingSubmitting(true);
    setOnboardingError("");

    try {
      await updateStorageScope(sessionId, "ACCOUNT");
      navigate("/onboarding/consent");
    } catch (error) {
      console.error("저장 범위 선택(ACCOUNT) 실패:", error);
      setOnboardingError(
        getOnboardingErrorMessage(
          error,
          "처리에 실패했습니다. 다시 시도해주세요.",
        ),
      );
    } finally {
      setIsOnboardingSubmitting(false);
    }
  };

  /**
   * [윤서][추가] 약관 동의 화면에서 카카오 로그인 성공 후 호출
   * FR-002(동의값) → FR-100(카카오 로그인) 순서로 호출합니다.
   */
  const handleKakaoConsentSubmit = async (consents, kakaoAccessToken) => {
    const sessionId = getSessionId();
    if (!sessionId) return;

    setIsOnboardingSubmitting(true);
    setOnboardingError("");

    try {
      await updateConsents(sessionId, consents);
      await loginWithKakao(sessionId, kakaoAccessToken);
      handleLoginSuccess();
      navigate("/onboarding/setup");
    } catch (error) {
      console.error("카카오 로그인/약관 동의 실패:", error);
      setOnboardingError(
        getOnboardingErrorMessage(
          error,
          "로그인 처리에 실패했습니다. 다시 시도해주세요.",
        ),
      );
    } finally {
      setIsOnboardingSubmitting(false);
    }
  };

  /**
   * [윤서][추가] 쇼핑 셋업(닉네임/라이프스타일) 완료
   * FR-101(닉네임) → FR-102(라이프스타일 태그) 순서로 호출합니다.
   */
  const handleOnboardingSetupSubmit = async (data) => {
    const sessionId = getSessionId();
    if (!sessionId) return;

    setIsOnboardingSubmitting(true);
    setOnboardingError("");

    try {
      await updateNickname(sessionId, data.nickname);
      await updateLifestyleTags(sessionId, data.lifestyleTags);
      handleSetUserName(data.nickname);
      navigate("/onboarding/complete");
    } catch (error) {
      console.error("쇼핑 셋업 저장 실패:", error);
      setOnboardingError(
        getOnboardingErrorMessage(
          error,
          "저장에 실패했습니다. 다시 시도해주세요.",
        ),
      );
    } finally {
      setIsOnboardingSubmitting(false);
    }
  };

  // ===== [윤서] 여기까지 온보딩 API 연동을 위해 추가한 부분 =====

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

      {/* [윤서][수정] 매장 진입(FR-000)에서 받아온 매장명 전달, 버튼은 API 호출 핸들러로 연결 */}
      <Route
        path="/onboarding"
        element={
          <Onboarding1
            storeName={storeName}
            onSelectPrivate={handleSelectPrivate}
            onSelectAccount={handleSelectAccount}
            isSubmitting={isOnboardingSubmitting}
            errorMessage={onboardingError}
          />
        }
      />

      {/* [윤서][수정] 카카오 로그인 성공 시 App.jsx가 동의값·토큰을 서버로 전송 */}
      <Route
        path="/onboarding/consent"
        element={
          <Onboarding2
            onBack={() => navigate(-1)}
            onKakaoSubmit={handleKakaoConsentSubmit}
            isSubmitting={isOnboardingSubmitting}
            errorMessage={onboardingError}
          />
        }
      />

      {/* [윤서][수정] 닉네임/라이프스타일 저장 API 호출 후 완료 화면으로 이동 */}
      <Route
        path="/onboarding/setup"
        element={
          <OnboardingSetup
            onBack={() => navigate(-1)}
            onSubmit={handleOnboardingSetupSubmit}
            isSubmitting={isOnboardingSubmitting}
            errorMessage={onboardingError}
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

      {/* [수정] 탐색 기본 화면 - 로그인 상태(isLoggedIn)에 따라 분기
          - true: 탐색 아카이브 (재방문)
          - false / null(확인 중): 기존 탐색 화면 그대로 */}
      <Route
        path="/explore"
        element={
          isLoggedIn === true ? (
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

      {/* [추가] 탐색 아카이브에서 "New" 방문 클릭 시 이동하는 실시간 탐색 화면 */}
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