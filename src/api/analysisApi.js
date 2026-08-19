// [추가] 고객 Bearer 인증이 적용된 공통 API 요청 함수를 사용합니다.
import { customerApiRequest } from "./apiClient";

/**
 * [추가] 현재 세션의 니즈 분석 가능 여부와 기존 분석 결과를 조회합니다.
 */
export const getNeedsAnalysis = (sessionId) => {
  return customerApiRequest(`/sessions/${sessionId}/needs-analysis`);
};

/**
 * [추가] 현재 저장 제품을 기준으로 니즈 분석을 생성하거나 재분석합니다.
 */
export const createNeedsAnalysis = (sessionId) => {
  return customerApiRequest(`/sessions/${sessionId}/needs-analysis`, {
    method: "POST",
  });
};