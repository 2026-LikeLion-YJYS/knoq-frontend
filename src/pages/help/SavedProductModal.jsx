// [추가] 모달 내부 제품 선택 상태 관리
import { useState } from "react";

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
 * [수정] 저장목록 제품 선택 모달
 * 최대 3개의 제품을 선택하고 Help 화면에 반영합니다.
 */
function SavedProductModal({
  selectedProducts,
  onClose,
  onAddProducts,
}) {
  // [추가] 모달 내부에서 임시로 선택한 제품 ID 관리
  const [selectedProductIds, setSelectedProductIds] = useState(
    selectedProducts.map((product) => product.id),
  );

  // [추가] 제품이 하나 이상 선택되었을 때 추가 가능
  const canAddProducts = selectedProductIds.length > 0;

  /**
   * [추가] 제품을 선택하거나 선택 취소합니다.
   * 선택되지 않은 제품은 최대 3개까지만 추가할 수 있습니다.
   */
  const handleToggleProduct = (productId) => {
    setSelectedProductIds((currentProductIds) => {
      const isSelected = currentProductIds.includes(productId);

      if (isSelected) {
        return currentProductIds.filter(
          (selectedId) => selectedId !== productId,
        );
      }

      if (currentProductIds.length >= 3) {
        return currentProductIds;
      }

      return [...currentProductIds, productId];
    });
  };

  /**
   * [추가] 선택한 제품 객체를 Help 화면으로 전달합니다.
   */
  const handleAddProducts = () => {
    if (!canAddProducts) return;

    const productsToAdd = selectedProductIds
      .map((productId) =>
        SAVED_PRODUCTS.find((product) => product.id === productId),
      )
      .filter(Boolean);

    onAddProducts(productsToAdd);
  };

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

        {/* [수정] 선택 가능한 저장 제품 카드 목록 */}
        <div className="saved-product-modal-grid">
          {SAVED_PRODUCTS.map((product) => {
            const isSelected = selectedProductIds.includes(product.id);
            const hasReachedLimit = selectedProductIds.length >= 3;
            const isSelectionBlocked = hasReachedLimit && !isSelected;

            return (
              <button
                key={product.id}
                className="saved-product-modal-card"
                type="button"
                aria-label={product.name}
                aria-pressed={isSelected}
                aria-disabled={isSelectionBlocked}
                onClick={() => handleToggleProduct(product.id)}
              >
                <img src={product.image} alt={product.name} />
              </button>
            );
          })}
        </div>

        {/* [수정] 제품 선택 여부에 따른 추가하기 버튼 */}
        <button
          className="saved-product-modal-add"
          type="button"
          disabled={!canAddProducts}
          onClick={handleAddProducts}
        >
          추가하기
        </button>
      </section>
    </div>
  );
}

export default SavedProductModal;