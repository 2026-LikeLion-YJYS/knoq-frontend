import { useState } from "react";
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

// [윤서][수정] 히어로 이미지가 없을 때만 쓰는 기본 이미지 (하드코딩 각도 이미지는 제거)
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
 * [윤서][추가] savedItems에 이미 저장된 상세 정보를 ProductDetailModal이 쓰는 product 형태로 변환합니다.
 * App.jsx의 loadSavedProducts가 material/price/size/color/images를 이미 조회해서 넣어주기 때문에,
 * 여기서는 별도 API 호출 없이 그 값을 그대로 사용합니다.
 *
 * features(스타일/구성/활용 3분류)는 아직 백엔드 응답이 문장 하나(string)로만 와서
 * 3분류로 나눠줄 방법이 없습니다 - 백엔드 확정 답변 오면 이어서 연동 예정이라
 * 그 전까지는 ProductDetailModal의 기본 features(더미)를 그대로 사용합니다.
 */
const buildModalProduct = (item, defaultFeatures) => {
  if (!item) return undefined;

  return {
    image: item.image || FALLBACK_HERO_IMAGE,
    category: "가방", // [윤서][추가] API에 카테고리 필드가 없어 임시 고정값 사용
    name: item.name || "",
    material: item.material || "정보 없음",
    price: formatPrice(item.price),
    size: item.size?.[0] ?? "",
    sizeDetail: item.size?.[1] ? `(${item.size[1]})` : "",
    color: Array.isArray(item.color) ? item.color.join(" · ") : "",
    // [윤서][추가] features 3분류는 아직 미확정이라 기본 더미를 그대로 유지합니다.
    features: defaultFeatures,
  };
};

// [수정] 저장목록은 이제 App.jsx에서 관리해서 props로 받습니다.
// (제품 스캔 화면에서 등록한 제품이 여기 반영되려면, 화면이 바뀌어도
// 상태가 유지되는 상위 컴포넌트(App.jsx)에서 관리해야 해요)
// [윤서][수정] App.jsx의 loadSavedProducts가 이미 상세(material/price/size/color/images)와
// 적합분석(fitAnalysis)까지 다 조회해서 savedItems에 넣어주기 때문에,
// 이 컴포넌트는 별도 API 호출 없이 props로 받은 값만 사용합니다 (중복 호출 방지).
function ExploreHome({
  savedItems,
  onDeleteSavedItem,
  isLoggedIn,
  onLogout,
  title = "나에게 맞는 제품 분석",
  showDelete = true,
}) {
  const [angleIndex, setAngleIndex] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const navigate = useNavigate();

  // [윤서][추가] 선택된 제품이 삭제 등으로 목록에서 사라지면, 별도 useEffect 없이
  // 렌더링 시점에 자동으로 저장목록 첫 번째 제품으로 대체합니다.
  const effectiveSelectedId = savedItems.some((item) => item.id === selectedId)
    ? selectedId
    : (savedItems[0]?.id ?? null);

  const selectedItem = savedItems.find(
    (item) => item.id === effectiveSelectedId,
  );

  // [윤서][추가] 선택한 제품의 이미지들(정면/측면/윗면). 없으면 대표이미지 1장, 그마저 없으면 기본 이미지.
  const heroImages = (() => {
    const angleImages = toImageDataUrls(selectedItem?.images);
    if (angleImages.length > 0) return angleImages;
    if (selectedItem?.image) return [selectedItem.image];
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
    setAngleIndex(0); // [윤서][추가] 제품 바뀌면 각도도 처음(정면)으로 초기화
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    onDeleteSavedItem?.(id);
    if (effectiveSelectedId === id) setSelectedId(null);
  };

  // [윤서][추가] 라이프스타일 적합 분석 문구 - App.jsx가 이미 조회해둔 fitAnalysis 배열을 줄바꿈으로 표시합니다.
  const insightLines =
    selectedItem?.fitAnalysis?.length > 0
      ? selectedItem.fitAnalysis
      : ["저장한 제품을 선택하면 분석 결과를 볼 수 있어요."];

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
          <p className="explore-home__insight-body">
            {insightLines.map((line, index) => (
              <span key={index}>
                {line}
                {index < insightLines.length - 1 && <br />}
              </span>
            ))}
          </p>
        </section>

        <section className="explore-home__hero-card">
          <div className="explore-home__hero-header">
            <p className="explore-home__hero-title">
              {selectedItem?.name || "제품을 선택해주세요"}
            </p>
            <button
              type="button"
              className="explore-home__detail-badge"
              onClick={() => setIsDetailOpen(true)}
              disabled={!selectedItem}
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
              alt={selectedItem?.name ?? ""}
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
                (effectiveSelectedId === item.id
                  ? " explore-home__saved-card--selected"
                  : "")
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
        product={buildModalProduct(selectedItem, DEFAULT_PRODUCT.features)}
      />
    </div>
  );
}

export default ExploreHome;