// 탐색 화면 - 상품 상세 정보 모달

import { createPortal } from "react-dom";
import "./ProductDetailModal.css";
import closeCircleIcon from "../../assets/icons/close-circle.svg";
import orangeCheckIcon from "../../assets/icons/orange-check.svg";

function ProductDetailModal({ isOpen, onClose, product }) {
  // [수정] 실제 제품 정보가 없으면 더미 모달을 표시하지 않습니다.
  if (!isOpen || !product) return null;

  // [추가] 누락된 특징 항목도 화면 오류 없이 표시하기 위한 빈 구조입니다.
  const features = {
    style: product.features?.style ?? [],
    styleImageUrl: product.features?.styleImageUrl ?? null,
    composition: product.features?.composition ?? [],
    compositionImageUrl: product.features?.compositionImageUrl ?? null,
    usage: product.features?.usage ?? [],
  };

  return createPortal(
    <div className="product-detail-overlay" onClick={onClose}>
      <div
        className="product-detail-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="product-detail-modal__close"
          onClick={onClose}
          aria-label="닫기"
        >
          <img
            src={closeCircleIcon}
            alt=""
            className="product-detail-modal__close-icon"
          />
        </button>

        {/* 상품 대표 이미지 */}
        <div className="product-detail-modal__image-wrap">
          <img
            src={product.image}
            alt={product.name}
            className="product-detail-modal__image"
          />
        </div>

        {/* 카테고리 뱃지 + 상품명 */}
        <div className="product-detail-modal__heading">
          <span className="product-detail-modal__badge">
            {product.category}
          </span>
          <p className="product-detail-modal__name">{product.name}</p>
        </div>

        {/* 제품 정보 */}
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

        <section className="product-detail-modal__feature-section">
          <p className="product-detail-modal__section-title">특징</p>

          <div className="product-detail-modal__feature-grid">
            <div className="product-detail-modal__feature-card product-detail-modal__feature-card--style">
              <p className="product-detail-modal__feature-label">스타일</p>
              <ul className="product-detail-modal__feature-list">
                {features.style.map((item) => (
                  <li key={item}>
                    <img
                      src={orangeCheckIcon}
                      alt=""
                      className="product-detail-modal__check-icon"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {features.styleImageUrl && (
                <img
                  src={features.styleImageUrl}
                  alt=""
                  className="product-detail-modal__feature-image"
                />
              )}
            </div>

            <div className="product-detail-modal__feature-card product-detail-modal__feature-card--composition">
              <p className="product-detail-modal__feature-label">구성</p>
              <ul className="product-detail-modal__feature-list">
                {features.composition.map((item) => (
                  <li key={item}>
                    <img
                      src={orangeCheckIcon}
                      alt=""
                      className="product-detail-modal__check-icon"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {features.compositionImageUrl && (
                <img
                  src={features.compositionImageUrl}
                  alt=""
                  className="product-detail-modal__feature-image"
                />
              )}
            </div>

            <div className="product-detail-modal__feature-card product-detail-modal__feature-card--usage">
              <p className="product-detail-modal__feature-label">활용</p>
              <ul className="product-detail-modal__feature-list">
                {features.usage.map((item) => (
                  <li key={item}>
                    <img
                      src={orangeCheckIcon}
                      alt=""
                      className="product-detail-modal__check-icon"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>,
    document.body,
  );
}

export default ProductDetailModal;
