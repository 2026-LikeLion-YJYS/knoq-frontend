import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ExploreHome.css";
import cameraIcon from "../../assets/icons/camera.svg";
import leftArrowIcon from "../../assets/icons/left-arrow.svg";
import rightArrowIcon from "../../assets/icons/right-arrow.svg";
import closeIcon from "../../assets/icons/close.svg";
import bgLogo from "../../assets/images/background-logo.png";
import frontBag from "../../assets/images/front-bag.png";
import sideBag from "../../assets/images/side-bag.png";
import topBag from "../../assets/images/top-bag.png";
import MainHeader from "../../components/MainHeader/MainHeader";
import BottomNav from "../../components/BottomNav/BottomNav";
import ProductDetailModal from "./ProductDetailModal";

const HERO_IMAGES = [frontBag, sideBag, topBag];

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
  // [수정] 서버 저장목록의 첫 제품을 기본 선택하므로 임시 id 고정값을 제거합니다.
  const [selectedId, setSelectedId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const navigate = useNavigate();

  // [추가] 비동기 목록 갱신·삭제 시 별도 렌더링 없이 첫 제품을 기본 선택합니다.
  const effectiveSelectedId = savedItems.some((item) => item.id === selectedId)
    ? selectedId
    : (savedItems[0]?.id ?? null);

  // [추가] 실제 선택 제품에 연결된 서버 적합 분석과 화면 표시값을 계산합니다.
  const selectedItem = savedItems.find(
    (item) => item.id === effectiveSelectedId,
  );
  const selectedAnalysis =
    selectedItem?.fitAnalysis?.length > 0
      ? selectedItem.fitAnalysis
      : ["선택한 제품의 라이프스타일 적합 분석을 준비하고 있어요."];
  const heroName = selectedItem?.name || "제품 정보를 불러오는 중입니다.";
  const heroImage = selectedItem?.image || HERO_IMAGES[angleIndex];
  const hasSelectedImage = Boolean(selectedItem?.image);

  const goPrev = () =>
    setAngleIndex(
      (prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length,
    );
  const goNext = () => setAngleIndex((prev) => (prev + 1) % HERO_IMAGES.length);

  const handleNavigate = (tabId) => {
    if (tabId === "explore") navigate("/explore");
    if (tabId === "analysis") navigate("/analysis");
    if (tabId === "help") navigate("/help");
  };

  const handleSelect = (id) => {
    setSelectedId(id);
    // [수정] 선택 제품이 바뀌면 대체 이미지 각도를 첫 화면으로 초기화합니다.
    setAngleIndex(0);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    onDeleteSavedItem?.(id);
    if (effectiveSelectedId === id) setSelectedId(null);
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
          <p className="explore-home__insight-body">
            {/* [수정] 선택 제품의 fit-analysis API 결과를 문장별로 표시합니다. */}
            {selectedAnalysis.map((line) => (
              <span key={line} className="explore-home__insight-line">
                {line}
              </span>
            ))}
          </p>
        </section>

        <section className="explore-home__hero-card">
          <div className="explore-home__hero-header">
            {/* [수정] 고정 제품명이 아니라 선택한 저장 제품명을 표시합니다. */}
            <p className="explore-home__hero-title">{heroName}</p>
            <button
              type="button"
              className="explore-home__detail-badge"
              onClick={() => setIsDetailOpen(true)}
            >
              상세 보기
            </button>
          </div>

          <div className="explore-home__hero-image-wrap">
            {/* [수정] 서버 썸네일만 있는 제품에서는 임시 각도 전환 버튼을 숨깁니다. */}
            {!hasSelectedImage && (
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
              src={heroImage}
              alt={heroName}
              className="explore-home__hero-image"
            />

            {!hasSelectedImage && (
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
      />
    </div>
  );
}

export default ExploreHome;
