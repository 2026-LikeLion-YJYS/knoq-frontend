// [윤서] 탐색 API 연동
// [추가] 고객 Bearer 인증이 적용된 공통 API 요청 함수를 사용합니다.
import { customerApiRequest } from "./apiClient";

/**
 * [윤서][추가] FR-204 저장목록 조회.
 * 최근 저장순으로 반환됩니다. 상담 제품 선택 모달에도 재사용됩니다.
 */
export const getSavedProducts = (sessionId) => {
  return customerApiRequest(
    `/sessions/${encodeURIComponent(sessionId)}/saved-products`,
  );
};

/**
 * [윤서][추가] FR-204 제품 저장.
 * 촬영 확인 화면에서 "저장"을 선택했을 때 호출합니다.
 * (카메라 인식 confirm에서 confirmed:true로 자동 저장되는 경우엔 별도 호출 불필요)
 */
export const addSavedProduct = (sessionId, productId) => {
  return customerApiRequest(
    `/sessions/${encodeURIComponent(sessionId)}/saved-products`,
    {
      method: "POST",
      body: { productId },
    },
  );
};

/**
 * [윤서][추가] FR-204 저장목록 삭제.
 * 저장목록 카드의 X 버튼에서 호출합니다.
 */
export const deleteSavedProduct = (sessionId, productId) => {
  return customerApiRequest(
    `/sessions/${encodeURIComponent(sessionId)}/saved-products/${encodeURIComponent(productId)}`,
    {
      method: "DELETE",
    },
  );
};