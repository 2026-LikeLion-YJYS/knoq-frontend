// [추가] 고객 인증 요청과 비인증 상품 상세 요청 함수를 사용합니다.
import { apiRequest, customerApiRequest } from "./apiClient";

// [추가] 도움 화면 조회가 무한 로딩으로 남지 않도록 제한할 시간
const HELP_REQUEST_TIMEOUT = 10000;

/**
 * [추가] API가 지정된 시간 안에 완료되지 않으면 조회 실패로 처리합니다.
 */
const withRequestTimeout = (request) => {
  let timeoutId;

  const timeoutRequest = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error("API 응답 시간이 초과되었습니다. 다시 시도해주세요."));
    }, HELP_REQUEST_TIMEOUT);
  });

  return Promise.race([request, timeoutRequest]).finally(() => {
    window.clearTimeout(timeoutId);
  });
};

/**
 * [추가] 현재 세션에 저장된 제품 목록을 조회합니다.
 */
export const getSavedProducts = (sessionId) => {
  return withRequestTimeout(
    customerApiRequest(`/sessions/${sessionId}/saved-products`),
  );
};

/**
 * [추가] 도움 화면에 공유할 현재 세션의 니즈 분석 결과를 조회합니다.
 */
export const getHelpNeedsAnalysis = (sessionId) => {
  return withRequestTimeout(
    customerApiRequest(`/sessions/${sessionId}/needs-analysis`),
  );
};

/**
 * [추가] 저장목록 응답에 없는 상품 이름과 상세정보를 조회합니다.
 */
export const getProductDetail = (productId) => {
  return withRequestTimeout(apiRequest(`/products/${productId}`));
};

/**
 * [추가] 선택한 도움 유형과 제품·니즈 공유 여부로 상담 요청을 생성합니다.
 */
export const createConsultationRequest = (sessionId, requestData) => {
  return withRequestTimeout(
    customerApiRequest(`/sessions/${sessionId}/consultation-requests`, {
      method: "POST",
      body: requestData,
    }),
  );
};
