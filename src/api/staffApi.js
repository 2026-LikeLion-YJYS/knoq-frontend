// [추가] 직원 로그인용 공통 요청과 직원 인증 요청 함수를 사용합니다.
import { apiRequest, staffApiRequest } from "./apiClient";

// [추가] 테스트용 매장 코드는 직원 로그인 요청에서만 사용합니다.
const STAFF_STORE_CODE = "TEST-001";

/**
 * [추가] 입력한 PIN으로 직원 매장 세션을 생성합니다.
 */
export const createStaffSession = (pin) => {
  return apiRequest("/staff/sessions", {
    method: "POST",
    body: {
      storeCode: STAFF_STORE_CODE,
      pin,
    },
  });
};

/**
 * [추가] 현재 직원 토큰을 사용해 POS 세션을 종료합니다.
 */
export const deleteStaffSession = () => {
  return staffApiRequest("/staff/sessions", {
    method: "DELETE",
  });
};

/**
 * [추가] 직원 매장에 접수된 상담 요청 목록을 조회합니다.
 */
export const getStaffRequests = () => {
  return staffApiRequest("/staff/requests");
};

/**
 * [추가] 선택한 상담 요청의 진행 상태를 변경합니다.
 */
export const updateStaffRequestStatus = (requestId, status) => {
  return staffApiRequest(
    `/staff/requests/${encodeURIComponent(requestId)}/status`,
    {
      method: "PUT",
      body: { status },
    },
  );
};
