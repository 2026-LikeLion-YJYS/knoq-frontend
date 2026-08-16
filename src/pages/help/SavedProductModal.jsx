import "./SavedProductModal.css";
import closeIcon from "../../assets/icons/close-circle.svg";

/**
 * [추가] API 연동 전 저장 제품 임시 데이터
 * 실제 API 연동 시 GET saved-products 응답 데이터로 교체합니다.
 */
const SAVED_PRODUCTS = [
  {
    id: "saved-product-1",
    image: "src/assets/images/help-product-brown.png",
    name: "브라운 가방",
  },
  {
    id: "saved-product-2",
    image: "src/assets/images/help-product-black.png",
    name: "블랙 가방",
  },
  {
    id: "saved-product-3",
    image: "src/assets/images/help-product-brown.png",
    name: "브라운 숄더백",
  },
  {
    id: "saved-product-4",
    image: "src/assets/images/help-product-brown.png",
    name: "브라운 토트백",
  },
  {
    id: "saved-product-5",
    image: "src/assets/images/help-product-black.png",
    name: "블랙 숄더백",
  },
  {
    id: "saved-product-6",
    image: "src/assets/images/help-product-brown.png",
    name: "브라운 미니백",
  },
  {
    id: "saved-product-7",
    image: "src/assets/images/help-product-black.png",
    name: "블랙 토트백",
  },
  {
    id: "saved-product-8",
    image: "src/assets/images/help-product-brown.png",
    name: "브라운 크로스백",
  },
  {
    id: "saved-product-9",
    image: "src/assets/images/help-product-black.png",
    name: "블랙 백팩",
  },
];

/**
 * [추가] 저장목록 정적 모달
 */
function SavedProductModal({ onClose }) {
  return (
    <div className="saved-product-modal-overlay">
      <section
        className="saved-product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="saved-product-modal-title"
      >
        {/* [추가] 저장목록 모달 제목 */}
        <div className="saved-product-modal-header">
          <div className="saved-product-modal-title">
            <h2 id="saved-product-modal-title">저장목록</h2>
            <p>최대 3개까지 선택이 가능합니다.</p>
          </div>

          {/* [추가] 모달 닫기 버튼 */}
          <button
            className="saved-product-modal-close"
            type="button"
            aria-label="저장목록 닫기"
            onClick={onClose}
          >
            <img src={closeIcon} alt="" />
          </button>
        </div>

        {/* [추가] 저장 제품 카드 목록 */}
        <div className="saved-product-modal-grid">
          {SAVED_PRODUCTS.map((product) => (
            <button
              key={product.id}
              className="saved-product-modal-card"
              type="button"
              aria-label={product.name}
            >
              <img src={product.image} alt={product.name} />
            </button>
          ))}
        </div>

        {/* [추가] 제품 미선택 상태의 비활성 추가 버튼 */}
        <button className="saved-product-modal-add" type="button" disabled>
          추가하기
        </button>
      </section>
    </div>
  );
}

export default SavedProductModal;
