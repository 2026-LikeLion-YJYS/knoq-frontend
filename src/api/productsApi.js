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

/**
 * [추가] 세션의 라이프스타일 태그와 선택 제품을 비교한 적합 분석을 조회합니다.
 */
export const getProductFitAnalysis = (sessionId, productId) => {
  return customerApiRequest(
    `/sessions/${encodeURIComponent(sessionId)}/products/${encodeURIComponent(productId)}/fit-analysis`,
  );
};
