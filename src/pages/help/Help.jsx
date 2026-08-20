// [수정] 도움 화면 상태, 요청 중복 방지와 화면 이동 사용
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// [추가] 저장제품·상품 상세·니즈 분석 조회 API 사용
import {
  createConsultationRequest,
  getHelpNeedsAnalysis,
  getProductDetail,
  getSavedProducts,
} from "../../api/helpApi";

// [추가] API가 반환한 상대 상품 이미지 경로에 백엔드 Base URL을 연결합니다.
import { createApiAssetUrl } from "../../api/apiClient";

// [수정] 고객 세션 정보 조회와 상담 요청 ID 저장
import {
  getLifestyleTags,
  getSessionId,
  setConsultationRequestId,
} from "../../utils/storage";

// [추가] 기존 공통 컴포넌트 사용
import MainHeader from "../../components/MainHeader/MainHeader";
import BottomNav from "../../components/BottomNav/BottomNav";

// [추가] 저장목록 모달 사용
import SavedProductModal from "./SavedProductModal";

// [추가] 상담 요청 완료 화면 사용
import HelpComplete from "./HelpComplete";

import "./Help.css";

/**
 * [추가] API 명세에 맞춘 도움 유형 목록
 */
const HELP_TYPES = [
  {
    label: "제품 추천",
    value: "PRODUCT_RECOMMENDATION",
  },
  {
    label: "제품 비교",
    value: "PRODUCT_COMPARISON",
  },
  {
    label: "스타일링 추천",
    value: "STYLING_RECOMMENDATION",
  },
  {
    label: "제품 정보",
    value: "PRODUCT_INFO",
  },
];

/**
 * [추가] 라이프스타일 enum을 도움 화면의 한글 문구로 변환합니다.
 */
const LIFESTYLE_TAG_LABELS = {
  MINIMAL: "미니멀",
  CLASSIC: "클래식",
  CASUAL: "캐주얼",
  STREET: "스트리트",
  FORMAL: "포멀",
  TRENDY: "트렌디",
};

/**
 * [수정] 환경변수로 매장 운영시간을 강제 활성화할 수 있습니다.
 * VITE_FORCE_STORE_OPEN=true이면 배포 환경에서도 운영시간과 관계없이 활성화됩니다.
 */
const checkStoreOpen = () => {
  // [수정] DEV 조건을 제거해 Vercel에서도 테스트 가능하도록 변경
  const isForcedOpen = import.meta.env.VITE_FORCE_STORE_OPEN === "true";

  if (isForcedOpen) {
    return true;
  }

  const now = new Date();
  const hour = now.getHours();

  return hour >= 11 && hour < 22;
};

/**
 * [추가] API 오류에서 도움 화면에 표시할 메시지를 구성합니다.
 */
const getHelpErrorMessage = (error, fallbackMessage) => {
  return (
    error?.data?.message ??
    error?.data?.error?.message ??
    error?.message ??
    fallbackMessage
  );
};

/**
 * [수정] 어드바이저 도움 요청 화면
 */
function Help({ isLoggedIn, onLogout }) {
  // [추가] 다른 화면으로 이동
  const navigate = useNavigate();

  // [추가] 도움 화면 조회에 사용할 고객 세션 ID
  const sessionId = getSessionId();

  // [추가] 선택한 도움 유형 관리
  const [selectedHelpType, setSelectedHelpType] = useState("");

  // [추가] 저장목록 모달 표시 여부 관리
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // [수정] API 저장목록에서 선택한 상담 제품 관리
  const [selectedProducts, setSelectedProducts] = useState([]);

  // [추가] 라이프스타일 및 니즈 공유 여부 관리
  const [shareMyInfo, setShareMyInfo] = useState(false);

  // [추가] 상담 요청 완료 화면 표시 여부 관리
  const [isRequestComplete, setIsRequestComplete] = useState(false);

  // [추가] 상담 요청 진행 여부와 실패 안내 메시지 관리
  const [isRequestSubmitting, setIsRequestSubmitting] = useState(false);
  const [consultationRequestError, setConsultationRequestError] = useState("");

  // [추가] 상태 반영 전 빠른 연속 클릭도 즉시 차단합니다.
  const isRequestSubmittingRef = useRef(false);

  // [추가] API로 조회한 저장제품 목록 관리
  const [savedProducts, setSavedProducts] = useState([]);

  // [추가] 저장제품 조회 진행 및 오류 상태 관리
  const [isSavedProductsLoading, setIsSavedProductsLoading] = useState(
    Boolean(sessionId),
  );
  const [savedProductsError, setSavedProductsError] = useState(
    sessionId ? "" : "세션 정보를 확인할 수 없습니다.",
  );

  // [추가] API로 조회한 니즈 분석 결과와 오류 상태 관리
  const [needsAnalysis, setNeedsAnalysis] = useState(null);
  const [needsAnalysisError, setNeedsAnalysisError] = useState(
    sessionId ? "" : "세션 정보를 확인할 수 없습니다.",
  );

  // [추가] sessionStorage의 라이프스타일 enum을 한글로 변환합니다.
  const [lifestyleTags] = useState(() =>
    getLifestyleTags()
      .map((tag) => LIFESTYLE_TAG_LABELS[tag])
      .filter(Boolean),
  );

  // [추가] 현재 매장 운영시간 여부 확인
  const isStoreOpen = checkStoreOpen();

  // [수정] 운영시간 내이며 도움 유형을 선택하고 요청 중이 아닐 때 요청 가능
  const canRequestHelp =
    isStoreOpen && selectedHelpType !== "" && !isRequestSubmitting;

  // [추가] 선택 제품 수만큼 제외한 빈 제품 칸 개수
  const emptyProductSlotCount = 3 - selectedProducts.length;

  /**
   * [추가] 도움 화면 진입 시 저장제품과 니즈 분석을 각각 조회합니다.
   * 상품 상세 하나가 실패해도 조회된 저장제품은 계속 표시합니다.
   */
  useEffect(() => {
    if (!sessionId) {
      return undefined;
    }

    const loadSavedProducts = async () => {
      try {
        const response = await getSavedProducts(sessionId);
        const savedProductItems = Array.isArray(response?.products)
          ? response.products
          : [];
        const productsWithFallback = savedProductItems.map((product) => ({
          ...product,
          name: "상품 정보 없음",
          // [수정] 상세 조회 전에는 아직 상품 이미지 경로가 없으므로 빈 슬롯으로 둡니다.
          image: null,
        }));

        // [수정] 상품 상세 조회를 기다리지 않고 저장목록부터 즉시 표시합니다.
        setSavedProducts(productsWithFallback);
        setSavedProductsError("");
        setIsSavedProductsLoading(false);

        if (savedProductItems.length === 0) {
          return;
        }

        const detailResults = await Promise.allSettled(
          savedProductItems.map((product) =>
            getProductDetail(product.productId),
          ),
        );
        const hasDetailFailure = detailResults.some(
          (result) => result.status === "rejected",
        );
        const nextSavedProducts = savedProductItems.map((product, index) => {
          const detailResult = detailResults[index];
          const detail =
            detailResult?.status === "fulfilled" ? detailResult.value : null;

          return {
            ...product,
            ...detail,
            productId: product.productId,
            name: detail?.name ?? "상품 정보 없음",
            // [수정] 상품 상세 응답의 thumbnailUrl을 실제 백엔드 이미지 주소로 변환합니다.
            image: createApiAssetUrl(detail?.thumbnailUrl),
          };
        });

        setSavedProducts(nextSavedProducts);
        setSavedProductsError(
          hasDetailFailure ? "일부 상품의 상세정보를 불러오지 못했습니다." : "",
        );
      } catch (error) {
        setSavedProducts([]);
        setSavedProductsError(
          getHelpErrorMessage(
            error,
            "저장목록을 불러오지 못했습니다. 다시 시도해주세요.",
          ),
        );
      } finally {
        // [수정] 성공·실패 여부와 관계없이 저장목록 로딩을 종료합니다.
        setIsSavedProductsLoading(false);
      }
    };

    const loadNeedsAnalysis = async () => {
      try {
        const response = await getHelpNeedsAnalysis(sessionId);

        setNeedsAnalysis(response?.analysis ?? null);
        setNeedsAnalysisError("");
      } catch (error) {
        setNeedsAnalysis(null);
        setNeedsAnalysisError(
          getHelpErrorMessage(
            error,
            "니즈 정보를 불러오지 못했습니다. 다시 시도해주세요.",
          ),
        );
      }
    };

    loadSavedProducts();
    loadNeedsAnalysis();
  }, [sessionId]);

  /**
   * [추가] 모달에서 선택한 제품을 상담 제품으로 반영합니다.
   */
  const handleAddProducts = (products) => {
    setSelectedProducts(products);
    setIsProductModalOpen(false);
  };

  /**
   * [수정] 도움 요청하기 클릭 시 상담 요청 POST를 실행합니다.
   * 요청 성공 후에만 requestId를 저장하고 완료 화면으로 이동합니다.
   */
  const handleRequestHelp = async () => {
    if (!canRequestHelp || isRequestSubmittingRef.current) {
      return;
    }

    if (!sessionId) {
      setConsultationRequestError(
        "세션 정보를 확인할 수 없습니다. 다시 시도해주세요.",
      );
      return;
    }

    const requestData = {
      helpType: selectedHelpType,
      productIds: selectedProducts.map((product) => product.productId),
      includeNeedsAnalysis: shareMyInfo,
    };

    isRequestSubmittingRef.current = true;
    setIsRequestSubmitting(true);
    setConsultationRequestError("");

    try {
      const response = await createConsultationRequest(sessionId, requestData);

      if (!response?.requestId) {
        throw new Error(
          "상담 요청 결과를 확인할 수 없습니다. 다시 시도해주세요.",
        );
      }

      setConsultationRequestId(response.requestId);
      setIsRequestComplete(true);
    } catch (error) {
      if (error?.status === 409) {
        setConsultationRequestError("이미 진행 중인 상담 요청이 있습니다.");
      } else if (error?.status !== 410) {
        setConsultationRequestError(
          getHelpErrorMessage(
            error,
            "상담 요청에 실패했습니다. 다시 시도해주세요.",
          ),
        );
      }
    } finally {
      isRequestSubmittingRef.current = false;
      setIsRequestSubmitting(false);
    }
  };

  /**
   * [추가] 상담 완료 화면에서 홈으로 이동할 때
   * 기존 상담 신청 내용을 초기화하고 도움 화면으로 돌아갑니다.
   */
  const handleGoHome = () => {
    setSelectedHelpType("");
    setSelectedProducts([]);
    setShareMyInfo(false);
    setIsProductModalOpen(false);
    setIsRequestComplete(false);
  };

  // [추가] 상담 요청 완료 후 완료 화면 표시
  if (isRequestComplete) {
    return (
      <HelpComplete
        // [수정] 상담 신청 상태 초기화 후 도움 홈 화면으로 이동
        onGoHome={handleGoHome}
        // [추가] 알림 화면으로 이동
        onViewNotifications={() => navigate("/notification")}
      />
    );
  }

  return (
    <div className="help-page">
      {/* [추가] 공통 상단 헤더 */}
      <MainHeader
        onLogoClick={() => navigate("/explore")}
        onNotificationClick={() => navigate("/notification")}
        isLoggedIn={isLoggedIn}
        onLogout={onLogout}
      />

      {/* [추가] 도움 요청 본문 */}
      <main className="help-content">
        {/* [추가] 도움 화면 안내 */}
        <section className="help-intro">
          <h1>원하는 순간, 어드바이저와 연결하세요.</h1>

          <p>자유롭게 탐색한 후 도움이 필요할 때 직접 요청할 수 있어요.</p>
        </section>

        {/* [수정] 도움 유형 선택 영역 */}
        <section className="help-section">
          <h2>도움 유형 선택(필수)</h2>

          <div className="help-type-list">
            {HELP_TYPES.map((type) => {
              const isSelected = selectedHelpType === type.value;

              return (
                <button
                  key={type.value}
                  className="help-type-button"
                  type="button"
                  aria-pressed={isSelected}
                  // [수정] 선택된 유형을 다시 누르면 선택 취소
                  onClick={() =>
                    setSelectedHelpType(isSelected ? "" : type.value)
                  }
                >
                  {type.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* [수정] 선택한 상담 제품 표시 영역 */}
        <section className="help-section">
          <h2>제품 추가하기(선택)</h2>

          <div className="help-product-list">
            {/* [수정] 실제 productId 기준으로 선택한 상담 제품 표시 */}
            {selectedProducts.map((product) => (
              <button
                className="help-product-card"
                key={product.productId}
                type="button"
                aria-label={`${product.name} 선택 수정`}
                onClick={() => setIsProductModalOpen(true)}
              >
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <span>이미지 없음</span>
                )}
              </button>
            ))}

            {/* [수정] 남은 제품 칸을 추가 버튼으로 표시 */}
            {Array.from({ length: emptyProductSlotCount }).map((_, index) => (
              <button
                key={`empty-product-${index}`}
                className="help-add-card"
                type="button"
                aria-label={`상담 제품 ${
                  selectedProducts.length + index + 1
                } 추가`}
                onClick={() => setIsProductModalOpen(true)}
              >
                +
              </button>
            ))}
          </div>
        </section>

        {/* [수정] 어드바이저에게 공유할 실제 라이프스타일과 니즈 정보 */}
        <section className="help-section">
          <div className="help-share-title">
            <h2>어드바이저에게 공유할 나의 정보(선택)</h2>

            {/* [수정] 라이프스타일과 니즈를 하나의 체크박스로 관리 */}
            <input
              className="help-checkbox"
              type="checkbox"
              checked={shareMyInfo}
              aria-label="라이프스타일과 나의 니즈 공유"
              onChange={(event) => setShareMyInfo(event.target.checked)}
            />
          </div>

          {/* [수정] sessionStorage 라이프스타일과 API 니즈 분석 표시 */}
          <div className="help-info-card">
            <div className="help-lifestyle">
              <h3>라이프스타일</h3>

              <div className="help-tag-list">
                {lifestyleTags.length > 0 ? (
                  lifestyleTags.map((tag) => <span key={tag}>{tag}</span>)
                ) : (
                  <span>정보 없음</span>
                )}
              </div>
            </div>

            <div className="help-needs">
              <h3>니즈</h3>

              <div className="help-needs-list">
                <div>
                  <span>카테고리</span>
                  <p>{needsAnalysis?.productCategory || "-"}</p>
                </div>

                <div>
                  <span>소재</span>
                  <p>{needsAnalysis?.preferredMaterial || "-"}</p>
                </div>

                <div>
                  <span>사이즈</span>
                  <p>{needsAnalysis?.preferredSize || "-"}</p>
                </div>

                <div>
                  <span>컬러</span>
                  <p>{needsAnalysis?.preferredColor || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* [추가] 니즈 조회 실패 안내 */}
          {needsAnalysisError && (
            <p className="analysis-update-message" role="alert">
              {needsAnalysisError}
            </p>
          )}
        </section>

        {/* [수정] 매장 운영시간과 도움 유형에 따른 요청 버튼 */}
        <button
          className={`help-request-button ${canRequestHelp ? "is-active" : ""}`}
          type="button"
          disabled={!canRequestHelp}
          onClick={handleRequestHelp}
        >
          {isRequestSubmitting
            ? "요청 중..."
            : isStoreOpen
              ? "도움 요청하기"
              : "매장 오픈전입니다"}
        </button>

        {/* [추가] 상담 요청 실패 및 활성 요청 중복 안내 */}
        {consultationRequestError && (
          <p className="help-request-message" role="alert">
            {consultationRequestError}
          </p>
        )}
      </main>

      {/* [추가] 공통 하단 내비게이션 */}
      <BottomNav activeTab="help" />

      {/* [수정] API 저장목록과 조회 상태를 모달에 전달 */}
      {isProductModalOpen && (
        <SavedProductModal
          savedProducts={savedProducts}
          selectedProducts={selectedProducts}
          isLoading={isSavedProductsLoading}
          errorMessage={savedProductsError}
          onClose={() => setIsProductModalOpen(false)}
          onAddProducts={handleAddProducts}
        />
      )}
    </div>
  );
}

export default Help;
