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

function ExploreHome({ savedItems, onDeleteSavedItem }) {
  const [angleIndex, setAngleIndex] = useState(0);
  const [selectedId, setSelectedId] = useState(4); // [임시] 기본 선택값
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const navigate = useNavigate();

  const goPrev = () =>
    setAngleIndex((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
  const goNext = () =>
    setAngleIndex((prev) => (prev + 1) % HERO_IMAGES.length);

  const handleNavigate = (tabId) => {
    if (tabId === "explore") navigate("/explore");
    if (tabId === "analysis") navigate("/analysis");
    if (tabId === "help") navigate("/help");
  };

  const handleSelect = (id) => {
    setSelectedId(id);
    // TODO: 선택한 상품에 맞는 분석 텍스트로 교체 (API 연동 시)
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    onDeleteSavedItem?.(id);
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <div className="explore-home">
      <div className="explore-home__top-section">
        <div className="explore-home__glow" />

        <div className="explore-home__header-wrap">
        <MainHeader
            onNotificationClick={() => alert("알림")}
        />
    </div>

        <h1 className="explore-home__title">나에게 맞는 제품 분석</h1>

        <section className="explore-home__insight-card">
          <p className="explore-home__insight-label">라이프스타일 적합 분석</p>
          <p className="explore-home__insight-body">
            평소 선호하는 미니멀 스타일과 잘 어울립니다.
            <br />
            노트북 수납이 가능한 사이즈입니다.
            <br />
            출퇴근용으로 적합합니다.
          </p>
        </section>

        <section className="explore-home__hero-card">
          <div className="explore-home__hero-header">
            <p className="explore-home__hero-title">L Tracy 비세토스 호보</p>
            <button
              type="button"
              className="explore-home__detail-badge"
              onClick={() => setIsDetailOpen(true)}
            >
              상세 보기
            </button>
          </div>

          <div className="explore-home__hero-image-wrap">
            <button
              type="button"
              className="explore-home__arrow explore-home__arrow--left"
              onClick={goPrev}
              aria-label="이전 각도"
            >
              <img src={leftArrowIcon} alt="" />
            </button>

            <img
              src={HERO_IMAGES[angleIndex]}
              alt="L Tracy 비세토스 호보"
              className="explore-home__hero-image"
            />

            <button
              type="button"
              className="explore-home__arrow explore-home__arrow--right"
              onClick={goNext}
              aria-label="다음 각도"
            >
              <img src={rightArrowIcon} alt="" />
            </button>
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
                {/* 스캔으로 등록된 제품은 썸네일 표시 */}
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
              >
                <img src={closeIcon} alt="" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* onScan prop 대신 스캔 화면으로 직접 이동 */}
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