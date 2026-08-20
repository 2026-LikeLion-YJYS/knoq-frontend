import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ExploreHome.css";
import cameraIcon from "../../assets/icons/camera.svg";
import leftArrowIcon from "../../assets/icons/left-arrow.svg";
import rightArrowIcon from "../../assets/icons/right-arrow.svg";
import closeIcon from "../../assets/icons/close.svg";
import bgLogo from "../../assets/images/background-logo.png";
import frontBag from "../../assets/images/front-bag.png";
import MainHeader from "../../components/MainHeader/MainHeader";
import BottomNav from "../../components/BottomNav/BottomNav";
import ProductDetailModal, { DEFAULT_PRODUCT } from "./ProductDetailModal";

// [윤서][추가] 선택한 제품 상세(FR-201)/적합분석(FR-203) 조회 API
import { getProductDetail } from "../../api/productsApi";
import { getFitAnalysis } from "../../api/sessionApi";
import { createApiAssetUrl } from "../../api/apiClient";
import { getSessionId } from "../../utils/storage";

// [윤서][수정] 각도 전환용 하드코딩 이미지 대신, 선택한 제품의 images(FR-201 응답)를 사용합니다.
// API에 이미지가 없는 경우를 대비한 기본 이미지로만 사용합니다.
const FALLBACK_HERO_IMAGE = frontBag;

/**
 * [윤서][추가] FR-201 응답의 images(Base64 배열)를 <img src>에 바로 쓸 수 있는 data URL로 변환합니다.
 * (명세서에 정확한 인코딩 포맷 명시가 없어서 image/png로 가정 - 실제로 안 뜨면 이 부분만 조정하면 됩니다)
 */
const toImageDataUrls = (images) => {
  if (!Array.isArray(images) || images.length === 0) return [];
  return images.map((base64) => `data:image/png;base64,${base64}`);
};

/**
 * [윤서][추가] 가격을 "₩1,690,000" 형태로 포맷합니다.
 */
const formatPrice = (price) => {
  if (typeof price !== "number") return "";
  return `₩${price.toLocaleString("ko-KR")}`;
};

/**
 * [윤서][추가] FR-201 응답을 ProductDetailModal이 쓰는 product 형태로 변환합니다.
 * features(스타일/구성/활용 3분류)는 아직 백엔드 응답이 문장 하나(string)로만 와서
 * 3분류로 나눠줄 방법이 없습니다 - 이 부분은 백엔드 확정 답변 오면 이어서 연동 예정입니다.
 * 그 전까지는 ProductDetailModal의 기본 features(더미)를 그대로 사용합니다.
 */
const buildModalProduct = (detail, defaultFeatures) => {
  if (!detail) return undefined;

  return {
    image: detail.thumbnailUrl
      ? createApiAssetUrl(detail.thumbnailUrl)
      : FALLBACK_HERO_IMAGE,
    category: "가방", // [윤서][추가] API에 카테고리 필드가 없어 임시 고정값 사용
    name: detail.name ?? "",
    material: detail.material ?? "정보 없음",
    price: formatPrice(detail.price),
    size: detail.size?.[0] ?? "",
    sizeDetail: detail.size?.[1] ? `(${detail.size[1]})` : "",
    color: Array.isArray(detail.color) ? detail.color.join(" · ") : "",
    // [윤서][추가] features 3분류는 아직 미확정이라 기본 더미를 그대로 유지합니다.
    features: defaultFeatures,
  };
};

// [수정] 저장목록은 이제 App.jsx에서 관리해서 props로 받습니다.
// (제품 스캔 화면에서 등록한 제품이 여기 반영되려면, 화면이 바뀌어도
// 상태가 유지되는 상위 컴포넌트(App.jsx)에서 관리해야 해요)
function ExploreHome({
  savedItems,
  onDeleteSavedItem,
  isLoggedIn,
  onLogout,
  title = "나에게 맞는 제품 분석",
  showDelete = true,
}) {
  const [angleIndex, setAngleIndex] = useState(0);
  // [윤서][수정] 임시 기본값(4) 대신 null로 시작 - 저장목록 로드되면 아래 useEffect가 첫 제품을 자동 선택합니다.
  const [selectedId, setSelectedId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const navigate = useNavigate();

  // [윤서][추가] 선택한 제품의 상세(FR-201)/적합분석(FR-203) 결과
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);
  const [fitAnalysis, setFitAnalysis] = useState(null);
  const [isSelectedDetailLoading, setIsSelectedDetailLoading] =
    useState(false);
  const [selectedDetailError, setSelectedDetailError] = useState("");

  /**
   * [윤서][추가] 저장목록이 로드되면 첫 번째 제품을 기본 선택합니다.
   * 이미 선택된 제품이 삭제 등으로 목록에서 사라지면 다시 첫 번째 제품으로 되돌립니다.
   */
  useEffect(() => {
    if (savedItems.length === 0) {
      setSelectedId(null);
      return;
    }

    const stillExists = savedItems.some((item) => item.id === selectedId);
    if (!stillExists) {
      setSelectedId(savedItems[0].id);
    }
  }, [savedItems, selectedId]);

  /**
   * [윤서][추가] 선택된 제품이 바뀔 때마다 상세(FR-201)와 적합분석(FR-203)을 함께 조회합니다.
   * 하나가 실패해도 다른 하나는 화면에 반영되도록 각각 따로 처리합니다.
   */
  useEffect(() => {
    if (!selectedId) {
      setSelectedProductDetail(null);
      setFitAnalysis(null);
      return;
    }

    const sessionId = getSessionId();
    if (!sessionId) return;

    let isActive = true;
    setIsSelectedDetailLoading(true);
    setSelectedDetailError("");
    setAngleIndex(0); // [윤서][추가] 제품 바뀌면 각도도 처음(정면)으로 초기화

    getProductDetail(selectedId)
      .then((detail) => {
        if (isActive) setSelectedProductDetail(detail);
      })
      .catch((error) => {
        console.error("선택 제품 상세 조회(FR-201) 실패:", error);
        if (isActive) {
          setSelectedProductDetail(null);
          setSelectedDetailError(
            "제품 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.",
          );
        }
      });

    getFitAnalysis(sessionId, selectedId)
      .then((analysis) => {
        if (isActive) setFitAnalysis(analysis);
      })
      .catch((error) => {
        console.error("적합 분석 조회(FR-203) 실패:", error);
        if (isActive) setFitAnalysis(null);
      })
      .finally(() => {
        if (isActive) setIsSelectedDetailLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [selectedId]);

  // [윤서][추가] 선택한 제품의 이미지들(정면/측면/윗면). 없으면 대표이미지 1장, 그마저 없으면 기본 이미지.
  const heroImages = (() => {
    const angleImages = toImageDataUrls(selectedProductDetail?.images);
    if (angleImages.length > 0) return angleImages;

    if (selectedProductDetail?.thumbnailUrl) {
      return [createApiAssetUrl(selectedProductDetail.thumbnailUrl)];
    }

    return [FALLBACK_HERO_IMAGE];
  })();

  const goPrev = () =>
    setAngleIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  const goNext = () =>
    setAngleIndex((prev) => (prev + 1) % heroImages.length);

  const handleNavigate = (tabId) => {
    if (tabId === "explore") navigate("/explore");
    if (tabId === "analysis") navigate("/analysis");
    if (tabId === "help") navigate("/help");
  };

  const handleSelect = (id) => {
    setSelectedId(id);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    onDeleteSavedItem?.(id);
    // [윤서][수정] 선택된 제품을 지운 경우, 다음 렌더링에서 위 useEffect가 자동으로
    // 남은 목록의 첫 번째 제품을 다시 선택해줍니다.
  };

  // [윤서][추가] 라이프스타일 적합 분석 문구 - fitAnalysis 응답의 reasons를 줄바꿈으로 이어붙입니다.
  const renderInsightBody = () => {
    if (!selectedId) {
      return "저장한 제품을 선택하면 분석 결과를 볼 수 있어요.";
    }

    if (isSelectedDetailLoading) {
      return "분석 중이에요...";
    }

    if (!fitAnalysis) {
      return "분석 정보를 불러오지 못했어요.";
    }

    const reasons = fitAnalysis.reasons ?? [];
    if (reasons.length === 0) {
      return fitAnalysis.summary ?? "";
    }

    return reasons.map((reason, index) => (
      <span key={index}>
        {reason}
        {index < reasons.length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="explore-home">
      <div className="explore-home__top-section">
        <div className="explore-home__glow" />

        <div className="explore-home__header-wrap">
        <MainHeader
            onNotificationClick={() => navigate("/notification")}
            isLoggedIn={isLoggedIn}
            onLogout={onLogout}
        />
    </div>

        <h1 className="explore-home__title">{title}</h1>

        <section className="explore-home__insight-card">
          <p className="explore-home__insight-label">라이프스타일 적합 분석</p>
          <p className="explore-home__insight-body">{renderInsightBody()}</p>
        </section>

        <section className="explore-home__hero-card">
          <div className="explore-home__hero-header">
            <p className="explore-home__hero-title">
              {selectedProductDetail?.name ?? "제품을 선택해주세요"}
            </p>
            <button
              type="button"
              className="explore-home__detail-badge"
              onClick={() => setIsDetailOpen(true)}
              disabled={!selectedProductDetail}
            >
              상세 보기
            </button>
          </div>

          <div className="explore-home__hero-image-wrap">
            {heroImages.length > 1 && (
              <button
                type="button"
                className="explore-home__arrow explore-home__arrow--left"
                onClick={goPrev}
                aria-label="이전 각도"
              >
                <img src={leftArrowIcon} alt="" />
              </button>
            )}

            <img
              src={heroImages[angleIndex]}
              alt={selectedProductDetail?.name ?? ""}
              className="explore-home__hero-image"
            />

            {heroImages.length > 1 && (
              <button
                type="button"
                className="explore-home__arrow explore-home__arrow--right"
                onClick={goNext}
                aria-label="다음 각도"
              >
                <img src={rightArrowIcon} alt="" />
              </button>
            )}
          </div>
        </section>
      </div>

      <section className="explore-home__saved">
        <p className="explore-home__saved-title">저장목록</p>
        <div className="explore-home__saved-grid">
          {savedItems.map((item) => (
            <div
              key={item.id}
              className={
                "explore-home__saved-card" +
                (selectedId === item.id ? " explore-home__saved-card--selected" : "")
              }
            >
              <button
                type="button"
                className="explore-home__saved-card-select"
                onClick={() => handleSelect(item.id)}
                aria-label="상품 선택"
              >
                {/* [추가] 스캔으로 등록된 제품은 썸네일 표시 */}
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name || ""}
                    className="explore-home__saved-card-image"
                  />
                )}
                {item.isRecommended && (
                  <span className="explore-home__recommend-badge">추천</span>
                )}
              </button>
              <button
                type="button"
                className="explore-home__saved-card-delete"
                onClick={(e) => handleDelete(item.id, e)}
                aria-label="삭제"
                style={{ display: showDelete ? undefined : "none" }}
              >
                <img src={closeIcon} alt="" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* [수정] onScan prop 대신 스캔 화면으로 직접 이동 */}
      <button
        type="button"
        className="explore-home__scan-fab"
        onClick={() => navigate("/explore/scan")}
      >
        <img src={cameraIcon} alt="" />
        <span>제품 스캔</span>
      </button>

      <BottomNav activeTab="explore" onNavigate={handleNavigate} />

      <ProductDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        product={buildModalProduct(selectedProductDetail, DEFAULT_PRODUCT.features)}
      />
    </div>
  );
}

export default ExploreHome;