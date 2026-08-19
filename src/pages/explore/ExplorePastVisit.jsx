// 탐색 - 과거 방문 기록 스냅샷 (읽기 전용)
// 탐색 아카이브에서 지난 방문 카드를 클릭했을 때 보여주는 화면입니다.
// API 연동 전이라 방문별 실제 데이터 대신 더미 데이터를 표시합니다.

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ExplorePastVisit.css";
import frontBag from "../../assets/images/front-bag.png";
import sideBag from "../../assets/images/side-bag.png";
import topBag from "../../assets/images/top-bag.png";
import cameraIcon from "../../assets/icons/camera.svg";
import leftArrowIcon from "../../assets/icons/left-arrow.svg";
import rightArrowIcon from "../../assets/icons/right-arrow.svg";
import MainHeader from "../../components/MainHeader/MainHeader";
import BottomNav from "../../components/BottomNav/BottomNav";
import ProductDetailModal from "./ProductDetailModal";

// [수정] 각도 전환용 이미지 (화살표로만 바뀝니다, 제품 선택과는 무관)
const HERO_IMAGES = [frontBag, sideBag, topBag];

// TODO: 방문별 실제 데이터 API 연동 시 visitId로 조회하도록 교체
// [수정] 아직 제품별 실데이터 연동 전이라, 저장 제품 선택은 하이라이트(주황 테두리)만
// 담당하고 위 카드의 이미지/이름은 바꾸지 않습니다.
const PAST_VISIT_DUMMY = {
  productName: "L Tracy 비세토스 호보",
  insight: [
    "평소 선호하는 미니멀 스타일과 잘 어울립니다.",
    "노트북 수납이 가능한 사이즈입니다.",
    "출퇴근용으로 적합합니다",
  ],
  savedItems: Array.from({ length: 3 }, (_, i) => ({ id: i, isRecommended: true })),
};

function ExplorePastVisit({ userName, isLoggedIn, onLogout }) {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const [angleIndex, setAngleIndex] = useState(0);
  // [추가] 저장 제품 선택 상태 (주황 테두리 하이라이트 전용)
  const [selectedId, setSelectedId] = useState(PAST_VISIT_DUMMY.savedItems[0].id);
  // [추가] 상세 보기 모달 표시 여부
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const goPrev = () =>
    setAngleIndex((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
  const goNext = () =>
    setAngleIndex((prev) => (prev + 1) % HERO_IMAGES.length);

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

        <section className="explore-past-visit__insight-card">
          <p className="explore-past-visit__insight-label">라이프스타일 적합 분석</p>
          <p className="explore-past-visit__insight-body">
            {PAST_VISIT_DUMMY.insight.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </p>
        </section>

        <section className="explore-past-visit__hero-card">
          <div className="explore-past-visit__hero-header">
            <p className="explore-past-visit__hero-title">
              {PAST_VISIT_DUMMY.productName}
            </p>
            {/* [수정] 클릭 가능한 버튼으로 변경, 상세 모달 연결 */}
            <button
              type="button"
              className="explore-past-visit__detail-badge"
              onClick={() => setIsDetailOpen(true)}
            >
              상세 보기
            </button>
          </div>

          {/* [추가] Figma에 있던 캐러셀 화살표 - 각도 전환 전용 */}
          <div className="explore-past-visit__hero-image-wrap">
            <button
              type="button"
              className="explore-past-visit__arrow explore-past-visit__arrow--left"
              onClick={goPrev}
              aria-label="이전 각도"
            >
              <img src={leftArrowIcon} alt="" />
            </button>

            <img
              src={HERO_IMAGES[angleIndex]}
              alt={PAST_VISIT_DUMMY.productName}
              className="explore-past-visit__hero-image"
            />

            <button
              type="button"
              className="explore-past-visit__arrow explore-past-visit__arrow--right"
              onClick={goNext}
              aria-label="다음 각도"
            >
              <img src={rightArrowIcon} alt="" />
            </button>
          </div>
        </section>
      </div>

      <section className="explore-past-visit__saved">
        <p className="explore-past-visit__saved-title">저장한 제품</p>
        <div className="explore-past-visit__saved-grid">
          {PAST_VISIT_DUMMY.savedItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={
                "explore-past-visit__saved-card" +
                (selectedId === item.id
                  ? " explore-past-visit__saved-card--selected"
                  : "")
              }
              onClick={() => setSelectedId(item.id)}
              aria-label="저장 제품 선택"
            >
              {item.isRecommended && (
                <span className="explore-past-visit__recommend-badge">추천</span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* [추가] Figma에 있던 스캔 FAB */}
      <button
        type="button"
        className="explore-past-visit__scan-fab"
        onClick={() => navigate("/explore/scan")}
      >
        <img src={cameraIcon} alt="" />
        <span>제품 스캔</span>
      </button>

      <BottomNav activeTab="explore" onNavigate={handleNavigate} />

      {/* [추가] 상세 보기 모달 */}
      <ProductDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
}

export default ExplorePastVisit;