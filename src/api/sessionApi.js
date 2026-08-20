// [추가] 고객 Bearer 인증이 적용된 공통 API 요청 함수를 사용합니다.
import { apiRequest, customerApiRequest } from "./apiClient";

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

// ===== [윤서] 여기부터 온보딩 API 연동을 위해 추가한 함수들 =====

/**
 * [윤서][추가] FR-000 매장 진입.
 * 아직 세션 토큰이 없는 시점이라 인증 없이 호출합니다(authType: "none").
 */
export const createSession = (storeCode) => {
  return apiRequest("/sessions", {
    method: "POST",
    body: { storeCode },
  });
};

/**
 * [윤서][추가] FR-002 약관 동의.
 * 필수 3개(termsOfService, privacyPolicy, over14)는 반드시 true여야 합니다.
 */
export const updateConsents = (sessionId, consents) => {
  return customerApiRequest(
    `/sessions/${encodeURIComponent(sessionId)}/consents`,
    {
      method: "PUT",
      body: consents,
    },
  );
};

/**
 * [윤서][추가] FR-100 저장 범위 선택.
 * storageScope: "ACCOUNT" | "PRIVATE"
 */
export const updateStorageScope = (sessionId, storageScope) => {
  return customerApiRequest(
    `/sessions/${encodeURIComponent(sessionId)}/storage-scope`,
    {
      method: "PUT",
      body: { storageScope },
    },
  );
};

/**
 * [윤서][추가] FR-100 카카오 로그인.
 * 카카오 SDK에서 받은 access token을 서버로 전달합니다.
 */
export const loginWithKakao = (sessionId, kakaoAccessToken) => {
  return customerApiRequest(
    `/sessions/${encodeURIComponent(sessionId)}/kakao-login`,
    {
      method: "POST",
      body: { kakaoAccessToken },
    },
  );
};

/**
 * [윤서][추가] FR-101 닉네임 설정.
 */
export const updateNickname = (sessionId, nickname) => {
  return customerApiRequest(
    `/sessions/${encodeURIComponent(sessionId)}/nickname`,
    {
      method: "PUT",
      body: { nickname },
    },
  );
};

/**
 * [윤서][추가] FR-102 라이프스타일 태그 설정.
 */
export const updateLifestyleTags = (sessionId, tags) => {
  return customerApiRequest(
    `/sessions/${encodeURIComponent(sessionId)}/lifestyle-tags`,
    {
      method: "PUT",
      body: { tags },
    },
  );
};