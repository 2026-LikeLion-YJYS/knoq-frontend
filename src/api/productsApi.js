// [윤서] 쇼핑 셋업 추천 제품 연동
// [추가] 고객 Bearer 인증이 적용된 공통 API 요청 함수를 사용합니다.
import { customerApiRequest } from "./apiClient";

/**
 * [윤서][추가] FR-201 제품 상세 조회.
 * 추천 제품의 이미지(thumbnailUrl)·이름 등을 가져올 때 사용합니다.
 */
export const getProductDetail = (productId) => {
  return customerApiRequest(`/products/${encodeURIComponent(productId)}`);
};