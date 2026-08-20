// [추가] 고객 Bearer 인증이 적용된 공통 API 요청 함수를 사용합니다.
import { customerApiRequest } from "./apiClient";

/**
 * [추가] 현재 고객 세션에 쌓인 상담 알림 목록을 최신순으로 조회합니다.
 */
export const getNotifications = (sessionId) => {
  return customerApiRequest(
    `/sessions/${encodeURIComponent(sessionId)}/notifications`,
  );
};
