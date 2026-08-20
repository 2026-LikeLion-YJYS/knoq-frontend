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
  // [윤서][추가] FR-103 온보딩 추천 생성
  getOnboardingRecommendations,
  // [윤서][추가] 탐색 아카이브(재방문 목록) 조회
  getVisitArchive,
} from "./api/sessionApi";

// [수정] 추천 제품 상세와 라이프스타일 제품 적합 분석 조회
import { getProductDetail, getProductFitAnalysis } from "./api/productsApi";

// [윤서][추가] 제품 스캔(FR-200) 인식/확인 API
import {
  recognizeProduct,
  confirmRecognition,
  // [추가] 카메라 사용이 어려울 때 제품 코드로 직접 조회합니다.
  lookupProductByCode,
} from "./api/scanApi";

// [윤서][추가] 탐색(FR-204) 저장목록 조회/삭제 API
import {
  getSavedProducts,
  addSavedProduct,
  deleteSavedProduct,
} from "./api/savedProductsApi";

// [윤서][추가] 백엔드가 내려주는 상대 이미지 경로를 완전한 URL로 변환
import { createApiAssetUrl } from "./api/apiClient";

// [수정] 고객 세션·토큰 조회/저장 및 직원 POS 종료 후 토큰 삭제
// [윤서][수정] setSessionId, setSessionToken 추가
import {
  getSessionId,
  getSessionToken,
  setSessionId,
  setSessionToken,
  // [추가] 온보딩에서 선택·복원한 라이프스타일 태그를 공통 storage에 저장
  setLifestyleTags,
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

// [추가] 고객·직원 화면의 고정 해상도 프레임 스타일
import "./App.css";

// [추가] 탐색 아카이브 카드 썸네일 이미지
// [윤서][수정] 실제 API 응답엔 카드 이미지가 없어서, 이 3개를 순서대로 돌려쓰는 고정 일러스트로 사용합니다.
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
  const candidate =
    error?.data?.message ?? error?.data?.error ?? error?.message;

  return typeof candidate === "string" && candidate.trim().length > 0
    ? candidate
    : fallbackMessage;
};

/**
 * [윤서][추가] 탐색 아카이브 카드에 순서대로 돌려쓸 고정 일러스트
 * (실제 API 응답엔 카드 이미지가 없어서, 방문 개수만큼 이 3개를 순환시켜 사용합니다)
 */
const VISIT_ARCHIVE_IMAGES = [reShirtImage, reShoesImage, reBagImage];

/**
 * [윤서][추가] ISO 날짜 문자열("2025-08-16T16:30:00")을 "2025.08.16" 형태로 변환합니다.
 */
const formatVisitDate = (isoString) => {
  if (!isoString) return "";
  const datePart = isoString.slice(0, 10); // "2025-08-16"
  return datePart.replaceAll("-", ".");
};

/**
 * [윤서][추가] 방문 순서(ordinal)를 Figma 원래 문구 형식("첫 MCM", "두번째 MCM"...)으로 변환합니다.
 * 4번째부터는 "n번째 MCM" 형식으로 자동 생성합니다.
 */
const ORDINAL_LABELS = ["", "첫", "두번째", "세번째"];
const formatOrdinalLabel = (ordinal) => {
  const prefix = ORDINAL_LABELS[ordinal] ?? `${ordinal}번째`;
  return `${prefix} MCM`;
};

/**
 * [윤서][추가] GET /sessions/{sessionId}/archive 응답을
 * ExploreArchive가 쓰는 카드 형태로 변환합니다.
 *
 * - id: 방문(세션) 식별자. 과거 방문 상세 화면 이동 시 사용.
 * - label: "첫 MCM" / "두번째 MCM" 형태 (Figma 원래 문구 형식). API가 최신순으로 내려주므로,
 *   전체 개수(count)에서 배열 순서(index)를 빼서 오래된 방문일수록 작은 번호가 붙게 계산합니다.
 * - date: "2025.08.16" 형태. label과 별도로 전달 - ExploreArchive가 카드 아래쪽 작은 글씨로 따로 렌더링합니다.
 * - isNew: 지금 이 세션인지 여부 (isCurrent 그대로 사용)
 * - image: 순서대로 돌려쓰는 고정 일러스트
 * - products: 그 방문에서 저장했던 제품 목록 (추후 과거 방문 상세 화면에서 활용 가능)
 */
const mapArchiveResponseToVisits = (response) => {
  const visits = response?.visits ?? [];
  const total = response?.count ?? visits.length;

  return visits.map((visit, index) => {
    const ordinal = total - index;

    return {
      id: visit.sessionId,
      label: formatOrdinalLabel(ordinal),
      date: formatVisitDate(visit.visitedAt),
      isNew: Boolean(visit.isCurrent),
      image: VISIT_ARCHIVE_IMAGES[index % VISIT_ARCHIVE_IMAGES.length],
      products: visit.products ?? [],
    };
  });
};

/**
 * [추가] 제품 적합 분석 응답을 탐색 카드에서 바로 출력할 문장 배열로 정리합니다.
 */
const mapFitAnalysisToLines = (analysis) => {
  const lines = [
    analysis?.summary,
    ...(analysis?.reasons ?? []),
    ...(analysis?.cautions ?? []),
  ].filter((line) => typeof line === "string" && line.trim());

  return [...new Set(lines)];
};

function App() {
  const navigate = useNavigate();

  // [추가] 분석 탭 진입 여부 확인에 사용하는 현재 경로
  const location = useLocation();

  // [추가] 직원 화면은 744×1133, 고객 화면은 393×852 프레임을 사용합니다.
  const isStaffRoute = location.pathname.startsWith("/staff");

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

  // [윤서][수정] 저장목록(FR-204) - 이제 더미/낙관적 로컬 상태가 아니라
  // getSavedProducts로 실제 조회한 값을 담습니다. 초기값은 빈 배열.
  const [savedItems, setSavedItems] = useState([]);

  // [윤서][추가] 저장목록 조회 진행 여부 (화면에 로딩 문구 표시하고 싶을 때 사용)
  const [isSavedItemsLoading, setIsSavedItemsLoading] = useState(false);

  // [윤서][추가] 저장목록 GET 중복 요청 즉시 차단용 ref
  const isSavedItemsFetchingRef = useRef(false);

  /**
   * [윤서][추가] FR-204 저장목록 조회
   * getSavedProducts는 productId/source/savedAt만 주기 때문에,
   * 이름·이미지가 필요한 화면 표시용으로 제품마다 FR-201(제품 상세)을 추가 조회해서 채웁니다.
   * (온보딩 완료 화면에서 추천 이미지 채울 때 썼던 것과 같은 패턴)
   *
   * 주의: /products/{productId} CORS가 아직 안 풀린 상태라, 상세 조회 하나가 실패해도
   * 저장목록 자체(개수, 선택/삭제 기능)는 깨지지 않도록 제품별로 따로 catch 합니다.
   * CORS가 풀리면 별도 코드 수정 없이 이미지/이름이 자동으로 채워집니다.
   *
   * [윤서][추가] material/price/size/color/images도 여기서 이미 조회한 detail에서 같이 저장해둡니다.
   * ExploreHome에서 카드 선택 시 같은 API를 또 호출하지 않고 이 값을 그대로 재사용하기 위함입니다
   * (중복 API 호출 방지 - CORS로 예민한 상황이라 특히 중요).
   */
  const loadSavedProducts = useCallback(async () => {
    if (isSavedItemsFetchingRef.current) return;

    const sessionId = getSessionId();
    if (!sessionId) return;

    isSavedItemsFetchingRef.current = true;
    setIsSavedItemsLoading(true);

    try {
      const response = await getSavedProducts(sessionId);
      const products = response?.products ?? [];

      const items = await Promise.all(
        products.map(async (product) => {
          // [수정] 상세·적합 분석 조회 실패 시에도 저장 카드 자체는 유지합니다.
          const base = {
            id: product.productId,
            savedProductId: product.savedProductId,
            image: null,
            name: "",
            isRecommended: product.source === "RECOMMEND",
            fitAnalysis: [],
            // [윤서][추가] 상세 조회 실패 시에도 필드 형태가 일정하도록 기본값을 둡니다.
            material: "",
            price: undefined,
            size: [],
            color: [],
            images: [],
            // [추가] 제품 상세 모달에서 실제 특징 정보를 표시합니다.
            features: null,
          };

          // [추가] 제품 상세와 세션별 적합 분석을 병렬 조회해 고정 문구를 제거합니다.
          const [detailResult, fitAnalysisResult] = await Promise.allSettled([
            getProductDetail(product.productId),
            getProductFitAnalysis(sessionId, product.productId),
          ]);

          const detail =
            detailResult.status === "fulfilled" ? detailResult.value : null;
          const fitAnalysis =
            fitAnalysisResult.status === "fulfilled"
              ? mapFitAnalysisToLines(fitAnalysisResult.value)
              : [];

          if (detailResult.status === "rejected") {
            console.error(
              `저장 제품 상세 조회 실패 (productId: ${product.productId}):`,
              detailResult.reason,
            );
          }

          if (fitAnalysisResult.status === "rejected") {
            console.error(
              `제품 적합 분석 조회 실패 (productId: ${product.productId}):`,
              fitAnalysisResult.reason,
            );
          }

          return {
            ...base,
            image: createApiAssetUrl(detail?.thumbnailUrl),
            name: detail?.name ?? "",
            // [윤서][추가] 탐색 화면 히어로 카드 각도 전환과 상세 모달에서
            // 재조회 없이 바로 쓸 수 있도록 이미 가져온 상세 정보를 그대로 저장해둡니다.
            material: detail?.material ?? "",
            price: detail?.price,
            size: detail?.size ?? [],
            color: detail?.color ?? [],
            // [수정] 백엔드가 반환하는 상대 이미지 URL을 화면에서 사용할 전체 URL로 변환합니다.
            images: (detail?.images ?? [])
              .map(createApiAssetUrl)
              .filter(Boolean),
            // [추가] 더미 대신 제품 상세 API의 특징 정보를 보관합니다.
            features: detail?.features
              ? {
                  style: detail.features.style ?? [],
                  styleImageUrl: createApiAssetUrl(
                    detail.features.styleImageUrl,
                  ),
                  composition: detail.features.composition ?? [],
                  compositionImageUrl: createApiAssetUrl(
                    detail.features.compositionImageUrl,
                  ),
                  usage: detail.features.usage ?? [],
                  // [추가] 제품 상세의 활용 이미지 상대 경로를 전체 URL로 변환합니다.
                  usageImageUrl: createApiAssetUrl(
                    detail.features.usageImageUrl,
                  ),
                }
              : null,
            // [수정] 적합 분석 실패 시 제품 상세의 AI 설명을 안전한 대체 문구로 사용합니다.
            fitAnalysis:
              fitAnalysis.length > 0
                ? fitAnalysis
                : detail?.aiGenerated
                  ? [detail.aiGenerated]
                  : [],
          };
        }),
      );

      setSavedItems(items);
    } catch (error) {
      console.error("저장목록 조회(FR-204) 실패:", error);
    } finally {
      isSavedItemsFetchingRef.current = false;
      setIsSavedItemsLoading(false);
    }
  }, []);

  /**
   * [윤서][추가] 저장목록 삭제 (FR-204)
   * 먼저 화면에서 즉시 제거(낙관적 업데이트)하고, API 실패 시에만 되돌립니다.
   */
  const handleDeleteSavedItem = async (productId) => {
    const sessionId = getSessionId();
    if (!sessionId) return;

    const previousItems = savedItems;
    setSavedItems((prev) => prev.filter((item) => item.id !== productId));

    try {
      await deleteSavedProduct(sessionId, productId);
    } catch (error) {
      console.error("저장목록 삭제(FR-204) 실패:", error);
      // [윤서][추가] 삭제 실패 시 화면을 원래 상태로 되돌립니다.
      setSavedItems(previousItems);
    }
  };

  // ===== [윤서] 여기부터 탐색 아카이브(재방문 목록) API 연동을 위해 추가한 부분 =====

  // [윤서][추가] 탐색 아카이브(재방문 목록) - 더미 VISIT_ARCHIVE 대신 실제 조회한 값을 담습니다.
  const [visitArchive, setVisitArchive] = useState([]);

  // [윤서][추가] 아카이브 조회 진행 여부
  const [isVisitArchiveLoading, setIsVisitArchiveLoading] = useState(false);

  // [윤서][추가] 아카이브 GET 중복 요청 즉시 차단용 ref
  const isVisitArchiveFetchingRef = useRef(false);

  /**
   * [윤서][추가] 탐색 아카이브 조회
   * ACCOUNT 로그인 상태(isLoggedIn === true)일 때만 의미가 있는 화면이라,
   * 로그인 상태가 true로 확정될 때 호출합니다.
   */
  const loadVisitArchive = useCallback(async () => {
    if (isVisitArchiveFetchingRef.current) return;

    const sessionId = getSessionId();
    if (!sessionId) return;

    isVisitArchiveFetchingRef.current = true;
    setIsVisitArchiveLoading(true);

    try {
      const response = await getVisitArchive(sessionId);
      setVisitArchive(mapArchiveResponseToVisits(response));
    } catch (error) {
      console.error("탐색 아카이브 조회 실패:", error);
      // [윤서][추가] 실패해도 빈 배열로 두어 화면이 깨지지 않게 합니다.
      setVisitArchive([]);
    } finally {
      isVisitArchiveFetchingRef.current = false;
      setIsVisitArchiveLoading(false);
    }
  }, []);

  // ===== [윤서] 여기까지 탐색 아카이브(재방문 목록) API 연동을 위해 추가한 부분 =====

  // ===== [윤서] 여기부터 제품 스캔(FR-200) API 연동을 위해 추가한 부분 =====

  // [윤서][추가] 인식 진행 중 상태 - recognitionId, 확인 대상 product를 같이 들고 있음
  const [scanResult, setScanResult] = useState({
    recognitionId: null,
    product: null,
  });

  // [윤서][추가] "맞아요"/"다시 촬영" 처리 중 로딩 상태
  const [isScanSubmitting, setIsScanSubmitting] = useState(false);

  // [윤서][추가] 스캔 관련 API 실패 안내 메시지
  const [scanError, setScanError] = useState("");

  // [추가] 인식 실패가 세 번 누적되면 제품 코드 직접 입력을 안내합니다.
  const [scanFailureCount, setScanFailureCount] = useState(0);

  /**
   * [윤서][추가] 촬영 완료 시 호출됨 (ScanCapture의 onCapture)
   * FR-200 카메라 인식 요청 → 첫 번째 후보의 상세정보(이름/이미지) 조회 순서로 진행합니다.
   * 후보가 여러 개(CANDIDATES) 와도, 별도 선택 화면 없이 첫 번째 후보만 사용하기로 함(팀 확인 완료).
   *
   * [윤서][추가] /products/{productId} CORS 이슈로 상세조회가 실패하면
   * 예전엔 조용히 촬영 화면으로 돌아가서 "셔터가 안 눌리는 것처럼" 보였습니다.
   * 지금은 인식 자체(recognizeProduct)와 상세조회(getProductDetail)를 구분해서
   * 에러 메시지를 다르게 보여줍니다.
   */
  const handleScanCapture = async (imageBlob) => {
    const sessionId = getSessionId();
    if (!sessionId) return;

    setScanError("");
    navigate("/explore/scan/recognizing");

    let recognition;
    try {
      recognition = await recognizeProduct(sessionId, imageBlob);
    } catch (error) {
      console.error("제품 인식(FR-200) 실패:", error);
      setScanError(
        getOnboardingErrorMessage(
          error,
          "제품을 인식하지 못했어요. 다시 촬영해주세요.",
        ),
      );
      setScanFailureCount((count) => count + 1);
      navigate("/explore/scan", { replace: true });
      return;
    }

    const firstCandidate = recognition?.candidates?.[0];

    if (!firstCandidate) {
      setScanError("인식된 제품이 없어요. 다시 촬영해주세요.");
      setScanFailureCount((count) => count + 1);
      navigate("/explore/scan", { replace: true });
      return;
    }

    try {
      const detail = await getProductDetail(firstCandidate.productId);

      setScanResult({
        recognitionId: recognition.recognitionId,
        product: {
          productId: firstCandidate.productId,
          name: detail.name,
          image: createApiAssetUrl(detail.thumbnailUrl),
        },
      });

      // [수정] 인식 성공 시 누적 실패 횟수를 초기화합니다.
      setScanFailureCount(0);

      navigate("/explore/scan/confirm", { replace: true });
    } catch (error) {
      // [윤서][추가] 여기서 실패하는 경우 대부분 CORS(/products) 이슈입니다.
      console.error("제품 상세 조회(FR-201) 실패:", error);
      setScanError(
        getOnboardingErrorMessage(
          error,
          "제품 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.",
        ),
      );
      setScanFailureCount((count) => count + 1);
      navigate("/explore/scan", { replace: true });
    }
  };

  /**
   * [추가] 카메라 권한 거부 또는 반복 인식 실패 시 제품 코드를 직접 조회합니다.
   * 직접 조회는 recognitionId가 없으므로 확인 완료 시 저장 API를 별도로 호출합니다.
   */
  const handleProductCodeLookup = async (productCode) => {
    const sessionId = getSessionId();
    if (!sessionId) return;

    setScanError("");

    try {
      const lookupResult = await lookupProductByCode(sessionId, productCode);
      const detail = await getProductDetail(lookupResult.productId);

      setScanResult({
        recognitionId: null,
        product: {
          productId: lookupResult.productId,
          name: detail?.name ?? lookupResult.name ?? "",
          image: createApiAssetUrl(detail?.thumbnailUrl),
        },
      });
      setScanFailureCount(0);
      navigate("/explore/scan/confirm", { replace: true });
    } catch (error) {
      const message = getOnboardingErrorMessage(
        error,
        "제품 번호를 확인하지 못했어요. 다시 입력해주세요.",
      );
      setScanError(message);
      throw error;
    }
  };

  /**
   * [윤서][수정] 확인 화면에서 "맞아요" 클릭
   * confirmed:true로 confirm 호출 → 같은 트랜잭션 안에서 저장목록에 자동 저장됨(별도 저장 API 불필요).
   * 로컬에 낙관적으로 항목을 추가하던 방식 대신, 저장목록을 실제 API로 재조회해서 반영합니다.
   */
  const handleScanConfirm = async () => {
    const sessionId = getSessionId();
    const { recognitionId, product } = scanResult;
    if (!sessionId || !product) return;

    setIsScanSubmitting(true);
    setScanError("");

    try {
      // [수정] 카메라 인식 결과는 confirm으로, 직접 조회 결과는 저장 API로 등록합니다.
      if (recognitionId) {
        await confirmRecognition(
          sessionId,
          recognitionId,
          product.productId,
          true,
        );
      } else {
        await addSavedProduct(sessionId, product.productId);
      }
      // [윤서][수정] 저장목록 실제 API로 재조회
      await loadSavedProducts();
      navigate("/explore/scan/complete", { replace: true });
    } catch (error) {
      console.error("인식 결과 확인 실패:", error);
      setScanError(
        getOnboardingErrorMessage(
          error,
          "저장에 실패했어요. 다시 시도해주세요.",
        ),
      );
    } finally {
      setIsScanSubmitting(false);
    }
  };

  /**
   * [윤서][추가] 확인 화면에서 "다시 촬영할게요" 클릭
   * confirmed:false로 confirm 호출 후 촬영 화면으로 돌아갑니다.
   */
  const handleScanRetake = async () => {
    const sessionId = getSessionId();
    const { recognitionId, product } = scanResult;

    if (sessionId && recognitionId && product) {
      try {
        await confirmRecognition(
          sessionId,
          recognitionId,
          product.productId,
          false,
        );
      } catch (error) {
        // [윤서][추가] 재촬영 자체는 막지 않고 콘솔에만 남김
        console.error("재촬영 처리(confirmed:false) 실패:", error);
      }
    }

    setScanResult({ recognitionId: null, product: null });
    navigate("/explore/scan", { replace: true });
  };

  // ===== [윤서] 여기까지 제품 스캔(FR-200) API 연동을 위해 추가한 부분 =====

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return getSessionId() && getSessionToken() ? null : false;
  });

  // [윤서][추가] 로그인 상태가 true로 확정되면(재방문 상태) 아카이브를 조회합니다.
  // (isLoggedIn을 참조하므로 반드시 위 state 선언 뒤에 있어야 합니다 - TDZ 에러 방지)
  useEffect(() => {
    if (isLoggedIn !== true) return;
    loadVisitArchive();
  }, [isLoggedIn, loadVisitArchive]);

  // [추가] 쇼핑 셋업에서 입력한 최신 닉네임 (탐색 아카이브 등 개인화 표시용)
  const [userName, setUserName] = useState("");

  // [추가] FR-000 매장 진입 응답 또는 세션 조회 응답의 매장명
  const [storeName, setStoreName] = useState("");

  // [추가] 고객 세션 생성 전 온보딩 버튼이 실행되지 않도록 준비 상태 관리
  const [isOnboardingSessionReady, setIsOnboardingSessionReady] = useState(() =>
    Boolean(getSessionId() && getSessionToken()),
  );

  // [추가] 온보딩 API 호출 공통 진행 상태와 빠른 중복 요청 차단 ref
  const [isOnboardingSubmitting, setIsOnboardingSubmitting] = useState(false);
  const isOnboardingSubmittingRef = useRef(false);

  // [추가] 온보딩 API 호출 실패 안내 메시지
  const [onboardingError, setOnboardingError] = useState("");

  // [추가] 쇼핑 셋업 완료 시 닉네임 저장
  const handleSetUserName = (name) => {
    setUserName(name);
  };

  // [윤서][추가] 세션이 준비되면(새로고침 복원 포함) 저장목록을 한 번 조회합니다.
  // 이후에는 스캔 확인/삭제 시점마다 필요한 곳에서 다시 조회합니다.
  useEffect(() => {
    if (!isOnboardingSessionReady) return;
    loadSavedProducts();
  }, [isOnboardingSessionReady, loadSavedProducts]);

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

        // [추가] 세션 조회 최신 응답의 온보딩 공통 정보를 복원합니다.
        setStoreName(response?.storeName ?? "");
        setUserName(response?.nickname ?? "");
        setLifestyleTags(response?.lifestyleTags ?? []);
        setIsOnboardingSessionReady(true);

        if (response?.storageScope === "ACCOUNT") {
          setIsLoggedIn(true);
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

  // ===== 온보딩 API 연동 =====

  // [추가] StrictMode에서도 FR-000 세션 생성 요청이 중복되지 않도록 Promise를 보관합니다.
  const createSessionRequestRef = useRef(null);

  /**
   * [추가] FR-000 매장 진입
   * 온보딩 경로에서 기존 세션이 없을 때만 QR의 storeCode로 세션을 생성합니다.
   */
  useEffect(() => {
    const isOnboardingRoute = location.pathname.startsWith("/onboarding");

    // [추가] 직원 화면 등 온보딩 외 경로에서는 고객 세션을 만들지 않습니다.
    if (!isOnboardingRoute) {
      return undefined;
    }

    if (getSessionId() && getSessionToken()) {
      return undefined;
    }

    let isActive = true;
    const params = new URLSearchParams(window.location.search);
    const storeCode = params.get("storeCode")?.trim();

    // [수정] 임시 TEST-001 대체값을 제거하고 QR에 매장 코드가 없으면 세션을 생성하지 않습니다.
    if (!storeCode) {
      // [추가] effect 본문에서 동기 setState를 피하고 현재 effect가 유효할 때만 안내합니다.
      Promise.resolve().then(() => {
        if (!isActive) return;

        setIsOnboardingSessionReady(false);
        setOnboardingError(
          "매장 정보를 확인할 수 없습니다. 매장 QR을 다시 스캔해주세요.",
        );
      });

      return () => {
        isActive = false;
      };
    }

    // [추가] 이전 매장 코드 오류는 API 요청 시작 시 비동기로 초기화합니다.
    Promise.resolve().then(() => {
      if (isActive) {
        setOnboardingError("");
      }
    });

    if (!createSessionRequestRef.current) {
      createSessionRequestRef.current = createSession(storeCode);
    }

    const sessionRequest = createSessionRequestRef.current;

    sessionRequest
      .then((response) => {
        if (!isActive) return;

        setSessionId(response.sessionId);
        setSessionToken(response.sessionToken);
        setStoreName(response.storeName ?? "");
        setIsOnboardingSessionReady(true);
      })
      .catch((error) => {
        if (!isActive) return;

        setIsOnboardingSessionReady(false);
        console.error("매장 진입(FR-000) 실패:", error);
        setOnboardingError(
          getOnboardingErrorMessage(
            error,
            "매장 진입에 실패했습니다. 다시 시도해주세요.",
          ),
        );
      })
      .finally(() => {
        if (createSessionRequestRef.current === sessionRequest) {
          createSessionRequestRef.current = null;
        }
      });

    return () => {
      isActive = false;
    };
  }, [location.pathname]);

  /**
   * [윤서][추가] "저장 없이 프라이빗하게 둘러보기" 클릭
   * FR-100(PRIVATE) → FR-002(필수 동의 자동 true) 순서로 호출합니다.
   */
  const handleSelectPrivate = async () => {
    if (isOnboardingSubmittingRef.current) return;

    const sessionId = getSessionId();
    if (!sessionId) return;

    isOnboardingSubmittingRef.current = true;
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
      isOnboardingSubmittingRef.current = false;
      setIsOnboardingSubmitting(false);
    }
  };

  /**
   * [윤서][추가] "내 정보 기억하고 이어서 탐색하기" 클릭
   * FR-100(ACCOUNT) 호출 후 약관 동의 화면으로 이동합니다.
   */
  const handleSelectAccount = async () => {
    if (isOnboardingSubmittingRef.current) return;

    const sessionId = getSessionId();
    if (!sessionId) return;

    isOnboardingSubmittingRef.current = true;
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
      isOnboardingSubmittingRef.current = false;
      setIsOnboardingSubmitting(false);
    }
  };

  /**
   * [윤서][추가] 약관 동의 화면에서 카카오 로그인 성공 후 호출
   * FR-002(동의값) → FR-100(카카오 로그인) 순서로 호출합니다.
   */
  const handleKakaoConsentSubmit = async (consents, kakaoAccessToken) => {
    if (isOnboardingSubmittingRef.current) return;

    const sessionId = getSessionId();
    if (!sessionId) return;

    isOnboardingSubmittingRef.current = true;
    setIsOnboardingSubmitting(true);
    setOnboardingError("");

    try {
      await updateConsents(sessionId, consents);
      const loginResponse = await loginWithKakao(sessionId, kakaoAccessToken);

      // [추가] 백엔드는 카카오 연결 실패도 200 + PRIVATE로 반환할 수 있습니다.
      if (loginResponse?.storageScope === "ACCOUNT") {
        handleLoginSuccess();

        // [수정] 이미 온보딩을 마친 재방문 계정이면 닉네임/라이프스타일 설정을
        // 다시 거치지 않고 바로 탐색 화면(아카이브)으로 보냅니다.
        if (loginResponse?.onboardingCompleted) {
          setUserName(loginResponse.nickname ?? "");
          setLifestyleTags(loginResponse.lifestyleTags ?? []);
          navigate("/explore");
          return;
        }
      } else {
        setIsLoggedIn(false);
      }

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
      isOnboardingSubmittingRef.current = false;
      setIsOnboardingSubmitting(false);
    }
  };

  /**
   * [추가] 카카오 팝업 실패·취소 시 저장 범위를 PRIVATE로 되돌리고
   * 로그인 없이 쇼핑 셋업을 계속합니다.
   */
  const handleKakaoLoginFailure = async (consents) => {
    if (isOnboardingSubmittingRef.current) return;

    const sessionId = getSessionId();
    if (!sessionId) return;

    isOnboardingSubmittingRef.current = true;
    setIsOnboardingSubmitting(true);
    setOnboardingError("");

    try {
      // [추가] 카카오 연결이 실패해도 사용자가 체크한 필수 약관 동의는 먼저 기록합니다.
      await updateConsents(sessionId, consents);
      await updateStorageScope(sessionId, "PRIVATE");
      setIsLoggedIn(false);
      navigate("/onboarding/setup");
    } catch (error) {
      console.error("카카오 로그인 실패 후 PRIVATE 전환 실패:", error);
      setOnboardingError(
        getOnboardingErrorMessage(
          error,
          "로그인 없이 계속하는 처리에 실패했습니다. 다시 시도해주세요.",
        ),
      );
    } finally {
      isOnboardingSubmittingRef.current = false;
      setIsOnboardingSubmitting(false);
    }
  };

  // [윤서][추가] 쇼핑 셋업 완료 화면에 표시할 추천 제품 (이미지 포함)
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  /**
   * [윤서][추가] 쇼핑 셋업(닉네임/라이프스타일) 완료
   * FR-101(닉네임) → FR-102(라이프스타일 태그) → FR-103(추천 생성) 순서로 호출합니다.
   * FR-103 응답에는 이미지가 없어서, 제품마다 FR-201(제품 상세)을 추가로 불러와 이미지를 채웁니다.
   */
  const handleOnboardingSetupSubmit = async (data) => {
    if (isOnboardingSubmittingRef.current) return;

    const sessionId = getSessionId();
    if (!sessionId) return;

    isOnboardingSubmittingRef.current = true;
    setIsOnboardingSubmitting(true);
    setOnboardingError("");

    try {
      await updateNickname(sessionId, data.nickname);
      await updateLifestyleTags(sessionId, data.lifestyleTags);
      handleSetUserName(data.nickname);
      // [추가] 도움 화면 등 다른 화면에서도 즉시 사용할 수 있도록 선택 태그를 저장합니다.
      setLifestyleTags(data.lifestyleTags);

      // [윤서][추가] 추천 생성 실패는 온보딩 자체를 막지 않고, 완료 화면에 빈 카드로 넘어가게 처리
      try {
        const recommendation = await getOnboardingRecommendations(sessionId);
        const products = recommendation?.products ?? [];

        const productDetails = await Promise.all(
          products.map((product) =>
            getProductDetail(product.productId)
              // [수정] 추천 응답의 제품별 reason을 버리지 않고 탐색 화면까지 전달합니다.
              .then((detail) => ({
                ...detail,
                productId: product.productId,
                recommendationReason: product.reason,
              }))
              .catch(() => null),
          ),
        );

        const validDetails = productDetails.filter(Boolean);

        setRecommendedProducts(
          validDetails.map((detail) => ({
            image: createApiAssetUrl(detail.thumbnailUrl),
            name: detail.name,
          })),
        );

        // [윤서][수정] FR-103 추천 생성 시 서버가 자동 저장하므로(source: RECOMMEND),
        // 여기서도 화면에 바로 반영되도록 같은 데이터로 savedItems를 채워둡니다.
        // (다음에 /explore 진입 시 loadSavedProducts가 실제 저장목록으로 다시 덮어씁니다)
        // [윤서][추가] material/price/size/color/images도 함께 저장해서 탐색 화면에서
        // 재조회 없이 바로 히어로 카드/상세 모달에 쓸 수 있게 합니다.
        setSavedItems(
          validDetails.map((detail) => ({
            id: detail.productId,
            image: createApiAssetUrl(detail.thumbnailUrl),
            name: detail.name,
            isRecommended: true,
            material: detail.material ?? "",
            price: detail.price,
            size: detail.size ?? [],
            color: detail.color ?? [],
            // [수정] 백엔드가 반환하는 상대 이미지 URL을 화면에서 사용할 전체 URL로 변환합니다.
            images: (detail.images ?? [])
              .map(createApiAssetUrl)
              .filter(Boolean),
            // [수정] 더미 대신 제품 상세 API의 특징 정보를 보관합니다.
            features: detail.features
              ? {
                  style: detail.features.style ?? [],
                  styleImageUrl: createApiAssetUrl(
                    detail.features.styleImageUrl,
                  ),
                  composition: detail.features.composition ?? [],
                  compositionImageUrl: createApiAssetUrl(
                    detail.features.compositionImageUrl,
                  ),
                  usage: detail.features.usage ?? [],
                  // [추가] 온보딩 추천 제품의 활용 이미지도 탐색 상세에 전달합니다.
                  usageImageUrl: createApiAssetUrl(
                    detail.features.usageImageUrl,
                  ),
                }
              : null,
            // [추가] 최초 탐색 진입 전에도 추천 근거가 즉시 표시되도록 저장합니다.
            fitAnalysis: detail.recommendationReason
              ? [detail.recommendationReason]
              : detail.aiGenerated
                ? [detail.aiGenerated]
                : [],
          })),
        );
      } catch (recommendationError) {
        console.error("추천 제품 조회 실패:", recommendationError);
        setRecommendedProducts([]);
      }

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
      isOnboardingSubmittingRef.current = false;
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

      // [추가] 최초 분석과 기존 분석 업데이트 요청을 구분합니다.
      const isUpdateRequest = loadingStep === ANALYSIS_STEP.UPDATE_LOADING;

      setAnalysisState((previousState) => {
        /**
         * [수정] 니즈 분석 업데이트에서는 사용자가 확정하거나 수정한
         * 카테고리·컬러·소재·사이즈를 유지하고 KNOQ'S 발견 문구만 교체합니다.
         * 최초 분석에서는 API가 생성한 전체 분석 결과를 그대로 반영합니다.
         */
        const nextAnalysisData = isUpdateRequest
          ? {
              ...previousState.analysisData,
              comment: response?.comment ?? previousState.analysisData.comment,
            }
          : {
              ...EMPTY_ANALYSIS_DATA,
              ...response,
            };

        return {
          ...previousState,
          hasAnalysis: true,
          analysisData: nextAnalysisData,
          editedAnalysis: { ...nextAnalysisData },
          analysisStep: ANALYSIS_STEP.REVIEW,
          editModalType: null,
        };
      });
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
    <div className={`app-frame${isStaffRoute ? " app-frame--staff" : ""}`}>
      <Routes>
        {/* [수정] 루트 QR로 진입해도 storeCode 쿼리 파라미터가 유지되도록 이동합니다. */}
        <Route
          path="/"
          element={<Navigate to={`/onboarding${location.search}`} replace />}
        />

        {/* [윤서][수정] 매장 진입(FR-000)에서 받아온 매장명 전달, 버튼은 API 호출 핸들러로 연결 */}
        <Route
          path="/onboarding"
          element={
            <Onboarding1
              storeName={storeName}
              onSelectPrivate={handleSelectPrivate}
              onSelectAccount={handleSelectAccount}
              isSessionReady={isOnboardingSessionReady}
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
              onKakaoFailure={handleKakaoLoginFailure}
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

        {/* [윤서][수정] FR-103 추천 제품(이미지 포함)을 완료 화면에 전달 */}
        <Route
          path="/onboarding/complete"
          element={
            <OnboardingComplete
              products={recommendedProducts}
              onBack={() => navigate(-1)}
              onStart={() => navigate("/explore")}
            />
          }
        />

        {/* [수정] 탐색 기본 화면 - 로그인 상태(isLoggedIn)에 따라 분기
          - true: 탐색 아카이브 (재방문) - 이제 실제 API(visitArchive)로 채워짐
          - false / null(확인 중): 기존 탐색 화면 그대로 */}
        <Route
          path="/explore"
          element={
            isLoggedIn === true ? (
              <ExploreArchive
                userName={userName}
                visits={visitArchive}
                isLoggedIn={isLoggedIn}
                onLogout={handleLogout}
                onScan={() => navigate("/explore/scan")}
                onSelectVisit={(visit) => {
                  if (visit.isNew) {
                    navigate("/explore/home");
                  } else {
                    // [윤서][추가] 과거 방문의 저장 제품 목록을 이미 아카이브 응답에서 받아왔으므로,
                    // 다시 API 호출하지 않고 state로 같이 넘겨줍니다.
                    navigate(`/explore/visit/${visit.id}`, {
                      state: { visit },
                    });
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
              visits={visitArchive}
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
            />
          }
        />

        {/* [윤서][수정] onCapture가 이제 실제 사진 Blob을 받아서 인식 API를 호출합니다.
          errorMessage도 전달해서, 인식/상세조회 실패로 이 화면에 되돌아왔을 때 이유가 보이게 함 */}
        <Route
          path="/explore/scan"
          element={
            <ScanCapture
              onClose={() => navigate("/explore")}
              onCapture={handleScanCapture}
              onLookupProduct={handleProductCodeLookup}
              recognitionFailureCount={scanFailureCount}
              errorMessage={scanError}
            />
          }
        />

        {/* [윤서][수정] 가짜 타이머 제거, App.jsx가 실제 API 응답 오면 알아서 다음 화면으로 이동시킴 */}
        <Route path="/explore/scan/recognizing" element={<ScanRecognizing />} />

        {/* [윤서][수정] 실제 인식된 제품 정보(scanResult.product) 전달 */}
        <Route
          path="/explore/scan/confirm"
          element={
            <ScanConfirm
              product={scanResult.product}
              onRetake={handleScanRetake}
              onConfirm={handleScanConfirm}
              isSubmitting={isScanSubmitting}
              errorMessage={scanError}
            />
          }
        />

        <Route
          path="/explore/scan/complete"
          element={
            <ScanComplete
              onBack={() => navigate("/explore")}
              onScanAgain={() => navigate("/explore/scan")}
              // [수정] 분석정보 보기 버튼을 분석 화면으로 연결합니다.
              onViewAnalysis={() => navigate("/analysis")}
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
    </div>
  );
}

export default App;
