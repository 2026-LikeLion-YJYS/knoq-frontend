// 탐색 - 과거 방문 기록 스냅샷 (읽기 전용)
// 탐색 아카이브에서 지난 방문 카드를 클릭했을 때 실제 저장 제품을 보여줍니다.

import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { createApiAssetUrl } from "../../api/apiClient";
import { getProductDetail } from "../../api/productsApi";
import "./ExplorePastVisit.css";
import cameraIcon from "../../assets/icons/camera.svg";
import leftArrowIcon from "../../assets/icons/left-arrow.svg";
import rightArrowIcon from "../../assets/icons/right-arrow.svg";
import MainHeader from "../../components/MainHeader/MainHeader";
import BottomNav from "../../components/BottomNav/BottomNav";
import ProductDetailModal from "./ProductDetailModal";

/**
 * [추가] 가격을 제품 상세 모달 표시 형식으로 변환합니다.
 */
const formatPrice = (price) => {
  if (typeof price !== "number") return "정보 없음";
  return `₩${price.toLocaleString("ko-KR")}`;
};

/**
 * [추가] 제품 상세 API 응답을 상세 모달 데이터로 변환합니다.
 */
const buildModalProduct = (detail) => {
  if (!detail) return undefined;

  return {
    image: createApiAssetUrl(detail.thumbnailUrl),
    // [유지] 현재 제품 상세 API에 카테고리가 없어 공통 분류로 표시합니다.
    category: "가방",
    name: detail.name ?? "정보 없음",
    material: detail.material ?? "정보 없음",
    price: formatPrice(detail.price),
    size: detail.size?.[0] ?? "정보 없음",
    sizeDetail: detail.size?.[1] ? `(${detail.size[1]})` : "",
    color: detail.color?.join(" · ") || "정보 없음",
    features: detail.features
      ? {
          style: detail.features.style ?? [],
          styleImageUrl: createApiAssetUrl(detail.features.styleImageUrl),
          composition: detail.features.composition ?? [],
          compositionImageUrl: createApiAssetUrl(
            detail.features.compositionImageUrl,
          ),
          usage: detail.features.usage ?? [],
        }
      : null,
  };
};

function ExplorePastVisit({ userName, visits = [], isLoggedIn, onLogout }) {
  const { visitId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // [수정] 화면 이동 state를 우선 사용하고 새로고침 시 아카이브 목록에서 다시 찾습니다.
  const visitFromState = location.state?.visit;
  const visit =
    visitFromState?.id === visitId
      ? visitFromState
      : visits.find((item) => item.id === visitId);
  const products = visit?.products ?? [];

  const [selectedId, setSelectedId] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [angleIndex, setAngleIndex] = useState(0);
  const [detailError, setDetailError] = useState("");

  // [추가] 선택 제품이 없거나 목록에서 사라지면 첫 번째 제품을 사용합니다.
  const effectiveSelectedId = products.some(
    (product) => product.productId === selectedId,
  )
    ? selectedId
    : (products[0]?.productId ?? null);
  const selectedProduct = products.find(
    (product) => product.productId === effectiveSelectedId,
  );

  /**
   * [추가] 선택한 과거 저장 제품의 상세 정보와 각도별 이미지를 조회합니다.
   */
  useEffect(() => {
    if (!effectiveSelectedId) {
      return;
    }

    let isCancelled = false;

    getProductDetail(effectiveSelectedId)
      .then((detail) => {
        if (!isCancelled) {
          setSelectedDetail(detail);
          setDetailError("");
        }
      })
      .catch((error) => {
        console.error("과거 저장 제품 상세 조회 실패:", error);
        if (!isCancelled) {
          setSelectedDetail(null);
          setDetailError("제품 상세 정보를 불러오지 못했어요.");
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [effectiveSelectedId]);

  // [수정] Base64 변환 없이 백엔드가 반환한 URL을 전체 URL로 변환합니다.
  const detailImages = (selectedDetail?.images ?? [])
    .map(createApiAssetUrl)
    .filter(Boolean);
  const fallbackImage = createApiAssetUrl(
    selectedDetail?.thumbnailUrl ?? selectedProduct?.thumbnailUrl,
  );
  const heroImages =
    detailImages.length > 0
      ? detailImages
      : fallbackImage
        ? [fallbackImage]
        : [];

  const goPrev = () => {
    if (heroImages.length < 2) return;
    setAngleIndex(
      (previousIndex) =>
        (previousIndex - 1 + heroImages.length) % heroImages.length,
    );
  };

  const goNext = () => {
    if (heroImages.length < 2) return;
    setAngleIndex((previousIndex) => (previousIndex + 1) % heroImages.length);
  };

  const handleSelectProduct = (productId) => {
    setSelectedId(productId);
    setSelectedDetail(null);
    setDetailError("");
    setAngleIndex(0);
    setIsDetailOpen(false);
  };

  const handleNavigate = (tabId) => {
    if (tabId === "explore") navigate("/explore");
    if (tabId === "analysis") navigate("/analysis");
    if (tabId === "help") navigate("/help");
  };

  return (
    <div className="explore-past-visit">
      <div className="explore-past-visit__top-section">
        <div className="explore-past-visit__glow" />

        <div className="explore-past-visit__header-wrap">
          <MainHeader
            onNotificationClick={() => navigate("/notification")}
            isLoggedIn={isLoggedIn}
            onLogout={onLogout}
          />
        </div>

        <h1 className="explore-past-visit__title">
          {userName ? `${userName}님의 저장목록` : "저장목록"}
        </h1>

        {/* [수정] 고정 적합 분석 문구를 제거하고 실제 저장 제품만 표시합니다. */}
        <section className="explore-past-visit__hero-card">
          <div className="explore-past-visit__hero-header">
            <p className="explore-past-visit__hero-title">
              {selectedDetail?.name ??
                selectedProduct?.name ??
                "저장한 제품이 없습니다"}
            </p>
            <button
              type="button"
              className="explore-past-visit__detail-badge"
              onClick={() => setIsDetailOpen(true)}
              disabled={!selectedDetail}
            >
              상세 보기
            </button>
          </div>

          <div className="explore-past-visit__hero-image-wrap">
            {heroImages.length > 1 && (
              <button
                type="button"
                className="explore-past-visit__arrow explore-past-visit__arrow--left"
                onClick={goPrev}
                aria-label="이전 각도"
              >
                <img src={leftArrowIcon} alt="" />
              </button>
            )}

            {heroImages[angleIndex] && (
              <img
                src={heroImages[angleIndex]}
                alt={selectedDetail?.name ?? selectedProduct?.name ?? ""}
                className="explore-past-visit__hero-image"
              />
            )}

            {heroImages.length > 1 && (
              <button
                type="button"
                className="explore-past-visit__arrow explore-past-visit__arrow--right"
                onClick={goNext}
                aria-label="다음 각도"
              >
                <img src={rightArrowIcon} alt="" />
              </button>
            )}
          </div>

          {detailError && (
            <p className="explore-past-visit__detail-error" role="alert">
              {detailError}
            </p>
          )}
        </section>
      </div>

      <section className="explore-past-visit__saved">
        <p className="explore-past-visit__saved-title">저장한 제품</p>
        <div className="explore-past-visit__saved-grid">
          {products.map((product) => (
            <button
              key={product.productId}
              type="button"
              className={
                "explore-past-visit__saved-card" +
                (effectiveSelectedId === product.productId
                  ? " explore-past-visit__saved-card--selected"
                  : "")
              }
              onClick={() => handleSelectProduct(product.productId)}
              aria-label={`${product.name ?? "저장 제품"} 선택`}
            >
              {product.thumbnailUrl && (
                <img
                  src={createApiAssetUrl(product.thumbnailUrl)}
                  alt={product.name ?? ""}
                  className="explore-past-visit__saved-card-image"
                />
              )}
              {product.source === "RECOMMEND" && (
                <span className="explore-past-visit__recommend-badge">
                  추천
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      <button
        type="button"
        className="explore-past-visit__scan-fab"
        onClick={() => navigate("/explore/scan")}
      >
        <img src={cameraIcon} alt="" />
        <span>제품 스캔</span>
      </button>

      <BottomNav activeTab="explore" onNavigate={handleNavigate} />

      <ProductDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        product={buildModalProduct(selectedDetail)}
      />
    </div>
  );
}

export default ExplorePastVisit;
