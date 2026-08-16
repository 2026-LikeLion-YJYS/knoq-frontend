// [추가] 도움 화면 상태 관리를 위한 useState
import { useState } from "react";

// [추가] 기존 공통 컴포넌트 사용
import MainHeader from "../../components/MainHeader/MainHeader";
import BottomNav from "../../components/BottomNav/BottomNav";

// [추가] 저장목록 모달 사용
import SavedProductModal from "./SavedProductModal";

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
 * [추가] 현재 시간이 매장 운영시간인지 확인합니다.
 * 매장 운영시간은 11:00 이상, 22:00 미만입니다.
 */
const checkStoreOpen = () => {
  const now = new Date();
  const hour = now.getHours();

  return hour >= 11 && hour < 22;
};

/**
 * [수정] 어드바이저 도움 요청 화면
 */
function Help() {
  // [추가] 선택한 도움 유형 관리
  const [selectedHelpType, setSelectedHelpType] = useState("");

  // [추가] 저장목록 모달 표시 여부 관리
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // [추가] 현재 매장 운영시간 여부 확인
  const isStoreOpen = checkStoreOpen();

  // [추가] 운영시간 내이며 도움 유형을 선택했을 때 요청 가능
  const canRequestHelp = isStoreOpen && selectedHelpType !== "";

  return (
    <div className="help-page">
      {/* [추가] 공통 상단 헤더 */}
      <MainHeader />

      {/* [추가] 도움 요청 본문 */}
      <main className="help-content">
        {/* [추가] 도움 화면 안내 */}
        <section className="help-intro">
          <h1>원하는 순간, 어드바이저와 연결하세요.</h1>

          <p>
            자유롭게 탐색한 후 도움이 필요할 때 직접 요청할 수 있어요.
          </p>
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

        {/* [수정] 제품이 추가되지 않은 기본 제품 영역 */}
        <section className="help-section">
          <h2>제품 추가하기(선택)</h2>

          <div className="help-product-list">
            {/* [수정] 모든 추가 칸을 누르면 저장목록 모달 표시 */}
            {[0, 1, 2].map((slot) => (
              <button
                key={slot}
                className="help-add-card"
                type="button"
                aria-label={`상담 제품 ${slot + 1} 추가`}
                onClick={() => setIsProductModalOpen(true)}
              >
                +
              </button>
            ))}
          </div>
        </section>

        {/* [추가] 어드바이저에게 공유할 정보 */}
        <section className="help-section">
          <div className="help-share-title">
            <h2>어드바이저에게 공유할 나의 정보(선택)</h2>

            {/* [추가] 정보공유 기능은 다음 단계에서 구현 */}
            <input
              className="help-checkbox"
              type="checkbox"
              readOnly
              aria-label="라이프스타일과 나의 니즈 공유"
            />
          </div>

          {/* [추가] 라이프스타일과 나의 니즈 */}
          <div className="help-info-card">
            <div className="help-lifestyle">
              <h3>라이프스타일</h3>

              <div className="help-tag-list">
                <span>모던</span>
                <span>미니멀</span>
              </div>
            </div>

            <div className="help-needs">
              <h3>니즈</h3>

              <div className="help-needs-list">
                <div>
                  <span>카테고리</span>
                  <p>토트백 / 쇼퍼백</p>
                </div>

                <div>
                  <span>소재</span>
                  <p>Leather</p>
                </div>

                <div>
                  <span>사이즈</span>
                  <p>Medium · Large</p>
                </div>

                <div>
                  <span>컬러</span>
                  <p>Black · Cognac</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* [수정] 매장 운영시간과 도움 유형에 따른 요청 버튼 */}
        <button
          className={`help-request-button ${
            canRequestHelp ? "is-active" : ""
          }`}
          type="button"
          disabled={!canRequestHelp}
        >
          {isStoreOpen ? "도움 요청하기" : "매장 오픈전입니다"}
        </button>
      </main>

      {/* [추가] 공통 하단 내비게이션 */}
      <BottomNav activeTab="help" />

      {/* [추가] 저장목록 모달 조건부 표시 */}
      {isProductModalOpen && (
        <SavedProductModal
          onClose={() => setIsProductModalOpen(false)}
        />
      )}
    </div>
  );
}

export default Help;