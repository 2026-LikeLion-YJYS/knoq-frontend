// [추가] 모달 내부 제품 선택 상태 관리
import { useState } from "react";

import "./SavedProductModal.css";
import closeIcon from "../../assets/icons/close-circle.svg";

/**
 * [수정] API 저장목록 제품 선택 모달
 * productId를 기준으로 최대 3개의 제품을 선택하고 Help 화면에 반영합니다.
 */
function SavedProductModal({
  savedProducts,
  selectedProducts,
  isLoading,
  errorMessage,
  onClose,
  onAddProducts,
}) {
  // [수정] 모달 내부에서 임시로 선택한 실제 productId 관리
  const [selectedProductIds, setSelectedProductIds] = useState(
    selectedProducts.map((product) => product.productId),
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
   * [수정] 선택한 productId에 해당하는 API 제품 객체를 Help 화면으로 전달합니다.
   */
  const handleAddProducts = () => {
    if (!canAddProducts) return;

    const productsToAdd = selectedProductIds
      .map((productId) =>
        savedProducts.find((product) => product.productId === productId),
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

        {/* [수정] 저장목록 조회·빈 목록·실패 상태 표시 */}
        {isLoading ? (
          <p className="saved-product-modal-message" role="status">
            저장목록을 불러오는 중입니다.
          </p>
        ) : savedProducts.length === 0 ? (
          <p
            className="saved-product-modal-message"
            role={errorMessage ? "alert" : "status"}
          >
            {errorMessage || "저장된 제품이 없습니다."}
          </p>
        ) : (
          <>
            {/* [수정] 실제 API 저장제품 카드 목록 */}
            <div className="saved-product-modal-grid">
              {savedProducts.map((product) => {
                const isSelected = selectedProductIds.includes(
                  product.productId,
                );
                const hasReachedLimit = selectedProductIds.length >= 3;
                const isSelectionBlocked = hasReachedLimit && !isSelected;

                return (
                  <button
                    key={product.productId}
                    className="saved-product-modal-card"
                    type="button"
                    aria-label={product.name}
                    aria-pressed={isSelected}
                    aria-disabled={isSelectionBlocked}
                    onClick={() => handleToggleProduct(product.productId)}
                  >
                    {product.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <span>이미지 없음</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* [추가] 일부 상품 상세 조회 실패 안내 */}
            {errorMessage && (
              <p className="saved-product-modal-message" role="alert">
                {errorMessage}
              </p>
            )}
          </>
        )}

        {/* [수정] 제품 선택 여부와 조회 상태에 따른 추가하기 버튼 */}
        <button
          className="saved-product-modal-add"
          type="button"
          disabled={!canAddProducts || isLoading}
          onClick={handleAddProducts}
        >
          추가하기
        </button>
      </section>
    </div>
  );
}

export default SavedProductModal;
