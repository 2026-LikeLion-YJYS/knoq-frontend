// 탐색 화면 - 상품 상세 정보 모달
// "상세 보기" 버튼 클릭 시 표시됩니다.
// [추가] createPortal로 document.body에 직접 렌더링 (ExitModal과 동일한 이유:
// 부모 요소의 stacking context에 갇혀 다른 콘텐츠에 가려지는 걸 방지)

import { createPortal } from "react-dom";
import "./ProductDetailModal.css";
import defaultBagImage from "../../assets/images/front-bag.png";
import closeCircleIcon from "../../assets/icons/close-circle.svg";
import orangeCheckIcon from "../../assets/icons/orange-check.svg";
import bagStyleImage from "../../assets/images/bag-style.svg";
import bagCompositionImage from "../../assets/images/bag-composition.svg";

// [추가] 백엔드 연동 전 임시 더미 데이터 (Figma 값 그대로)
const DEFAULT_PRODUCT = {
  image: defaultBagImage,
  category: "숄더백",
  name: "Tracy 비세토스 호보",
  material: "캔버스",
  price: "₩1,490,000",
  size: "Large",
  sizeDetail: "(약 11 x 33 x 31)",
  color: "Congnac", // ⚠️ Figma 원본 표기 그대로 씀 (오타로 보이면 알려주세요, "Cognac"으로 바꿀게요)
  features: {
    style: {
      image: bagStyleImage,
      items: ["클래식", "럭셔리", "세련된"],
    },
    composition: {
      image: bagCompositionImage,
      items: ["내부 포켓", "가죽 패치 포켓"],
    },
    usage: [
      "탈부착 가능한 가죽 스트랩",
      "길이 조절 가능한 스트랩",
      "토트백/숄더백 2way 활용",
      "지퍼 클로저",
    ],
  },
};

function ProductDetailModal({ isOpen, onClose, product = DEFAULT_PRODUCT }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="product-detail-overlay" onClick={onClose}>
      <div
        className="product-detail-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* [수정] X 텍스트 대신 close-circle 아이콘 사용 */}
        <button
          type="button"
          className="product-detail-modal__close"
          onClick={onClose}
          aria-label="닫기"
        >
          <img src={closeCircleIcon} alt="" className="product-detail-modal__close-icon" />
        </button>

        {/* [추가] 상품 대표 이미지 */}
        <div className="product-detail-modal__image-wrap">
          <img
            src={product.image}
            alt={product.name}
            className="product-detail-modal__image"
          />
        </div>

        {/* [추가] 카테고리 뱃지 + 상품명 */}
        <div className="product-detail-modal__heading">
          <span className="product-detail-modal__badge">
            {product.category}
          </span>
          <p className="product-detail-modal__name">{product.name}</p>
        </div>

        {/* [추가] 제품 정보 */}
        <section className="product-detail-modal__info-section">
          <p className="product-detail-modal__section-title">제품 정보</p>

          <div className="product-detail-modal__info-box">
            <div className="product-detail-modal__info-row">
              <span className="product-detail-modal__info-label">재질</span>
              <span className="product-detail-modal__info-value">
                {product.material}
              </span>
            </div>

            <div className="product-detail-modal__info-row">
              <span className="product-detail-modal__info-label">가격</span>
              <span className="product-detail-modal__info-value">
                {product.price}
              </span>
            </div>

            <div className="product-detail-modal__info-row">
              <span className="product-detail-modal__info-label">사이즈</span>
              <span className="product-detail-modal__info-value product-detail-modal__info-value--stacked">
                <span>{product.size}</span>
                <span className="product-detail-modal__info-sub">
                  {product.sizeDetail}
                </span>
              </span>
            </div>

            <div className="product-detail-modal__info-row">
              <span className="product-detail-modal__info-label">색상</span>
              <span className="product-detail-modal__info-value">
                {product.color}
              </span>
            </div>
          </div>
        </section>

        {/* [추가] 특징 (스타일 / 구성 / 활용) - 이미지 없이 텍스트만 */}
        <section className="product-detail-modal__feature-section">
          <p className="product-detail-modal__section-title">특징</p>

          <div className="product-detail-modal__feature-grid">
            <div className="product-detail-modal__feature-card product-detail-modal__feature-card--style">
              <p className="product-detail-modal__feature-label">스타일</p>
              <ul className="product-detail-modal__feature-list">
                {product.features.style.items.map((item) => (
                  <li key={item}>
                    <img src={orangeCheckIcon} alt="" className="product-detail-modal__check-icon" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {/* [추가] 카드 하단에 가장자리까지 꽉 채우는 이미지 (Figma 반영) */}
              <img
                src={product.features.style.image}
                alt=""
                className="product-detail-modal__feature-image"
              />
            </div>

            <div className="product-detail-modal__feature-card product-detail-modal__feature-card--composition">
              <p className="product-detail-modal__feature-label">구성</p>
              <ul className="product-detail-modal__feature-list">
                {product.features.composition.items.map((item) => (
                  <li key={item}>
                    <img src={orangeCheckIcon} alt="" className="product-detail-modal__check-icon" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {/* [추가] 카드 하단에 가장자리까지 꽉 채우는 이미지 (Figma 반영) */}
              <img
                src={product.features.composition.image}
                alt=""
                className="product-detail-modal__feature-image"
              />
            </div>

            <div className="product-detail-modal__feature-card product-detail-modal__feature-card--usage">
              <p className="product-detail-modal__feature-label">활용</p>
              <ul className="product-detail-modal__feature-list">
                {product.features.usage.map((item) => (
                  <li key={item}>
                    <img src={orangeCheckIcon} alt="" className="product-detail-modal__check-icon" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>,
    document.body
  );
}

export default ProductDetailModal;