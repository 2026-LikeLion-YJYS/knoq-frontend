// [추가] 고객 Bearer 인증이 적용된 공통 API 요청 함수를 사용합니다.
import { customerApiRequest } from "./apiClient";

/**
 * [추가] 새로고침·재진입 시 현재 고객 세션과 저장 범위를 조회합니다.
 */
export const getCustomerSession = (sessionId) => {
  return customerApiRequest(`/sessions/${encodeURIComponent(sessionId)}`);
};

/**
 * [추가] PRIVATE 고객의 현재 쇼핑 기록을 삭제하고 세션을 종료합니다.
 */
export const finishCustomerSession = (sessionId) => {
  return customerApiRequest(
    `/sessions/${encodeURIComponent(sessionId)}/finish`,
    {
      method: "POST",
    },
  );
};

/**
 * [추가] ACCOUNT 고객의 계정 연결을 해제하고 현재 세션을 정리합니다.
 */
export const logoutCustomerSession = (sessionId) => {
  return customerApiRequest(
    `/sessions/${encodeURIComponent(sessionId)}/logout`,
    {
      method: "POST",
    },
  );
};
