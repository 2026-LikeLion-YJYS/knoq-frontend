// [수정] 도움 화면 상태 관리와 화면 이동 사용
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  // [추가] 다른 화면으로 이동
  const navigate = useNavigate();

  // [추가] 선택한 도움 유형 관리
  const [selectedHelpType, setSelectedHelpType] = useState("");

  // [추가] 저장목록 모달 표시 여부 관리
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // [추가] 상담에 추가한 제품 관리
  const [selectedProducts, setSelectedProducts] = useState([]);

  // [추가] 라이프스타일 및 니즈 공유 여부 관리
  const [shareMyInfo, setShareMyInfo] = useState(false);

  // [추가] 상담 요청 완료 화면 표시 여부 관리
  const [isRequestComplete, setIsRequestComplete] = useState(false);

  // [추가] 현재 매장 운영시간 여부 확인
  const isStoreOpen = checkStoreOpen();

  // [추가] 운영시간 내이며 도움 유형을 선택했을 때 요청 가능
  const canRequestHelp = isStoreOpen && selectedHelpType !== "";

  // [추가] 선택 제품 수만큼 제외한 빈 제품 칸 개수
  const emptyProductSlotCount = 3 - selectedProducts.length;

  /**
   * [추가] 모달에서 선택한 제품을 상담 제품으로 반영합니다.
   */
  const handleAddProducts = (products) => {
    setSelectedProducts(products);
    setIsProductModalOpen(false);
  };

  /**
   * [수정] 도움 요청하기 클릭 시 요청 데이터를 구성하고
   * API 연동 전에는 바로 완료 화면으로 이동합니다.
   */
  const handleRequestHelp = () => {
    if (!canRequestHelp) return;

    // [수정] 추후 POST 상담 요청 API에서 사용할 데이터 구조
    const requestData = {
      helpType: selectedHelpType,
      productIds: selectedProducts.map((product) => product.id),
      includeNeedsAnalysis: shareMyInfo,
    };

    console.log("도움 요청 데이터:", requestData);

    // [추가] API 연동 전 임시로 완료 화면 표시
    setIsRequestComplete(true);

    /*
     * [추후 API 연동]
     * const response = await requestAdvisorHelp(requestData);
     *
     * if (response 성공) {
     *   setIsRequestComplete(true);
     * }
     */
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
        onViewNotifications={() => navigate("/alarm")}
      />
    );
  }

  return (
    <div className="help-page">
      {/* [추가] 공통 상단 헤더 */}
      <MainHeader />

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
            {/* [추가] 모달에서 추가한 상담 제품 표시 */}
            {selectedProducts.map((product) => (
              <button
                className="help-product-card"
                key={product.id}
                type="button"
                aria-label={`${product.name} 선택 수정`}
                onClick={() => setIsProductModalOpen(true)}
              >
                <img src={product.image} alt={product.name} />
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

        {/* [수정] 어드바이저에게 공유할 정보 */}
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
          onClick={handleRequestHelp}
        >
          {isStoreOpen ? "도움 요청하기" : "매장 오픈전입니다"}
        </button>
      </main>

      {/* [추가] 공통 하단 내비게이션 */}
      <BottomNav activeTab="help" />

      {/* [수정] 저장목록 모달에 기존 선택 제품과 추가 함수를 전달 */}
      {isProductModalOpen && (
        <SavedProductModal
          selectedProducts={selectedProducts}
          onClose={() => setIsProductModalOpen(false)}
          onAddProducts={handleAddProducts}
        />
      )}
    </div>
  );
}

export default Help;