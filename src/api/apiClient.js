// [추가] 고객·직원 인증에 필요한 storage 함수를 사용합니다.
import {
  clearCustomerStorage,
  getSessionToken,
  getStaffToken,
  removeStaffToken,
} from "../utils/storage";

// [추가] 환경변수에서 백엔드 Base URL을 가져옵니다.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * [추가] API 오류의 HTTP status와 응답 데이터를 전달합니다.
 */
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * [추가] Base URL과 API 경로 사이의 슬래시를 정리합니다.
 */
const createApiUrl = (path) => {
  const baseUrl = API_BASE_URL?.replace(/\/$/, "") ?? "";
  const apiPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${apiPath}`;
};

/**
 * [추가] 204 또는 본문이 없는 응답을 제외하고 JSON 응답을 변환합니다.
 */
const parseResponse = async (response) => {
  if (response.status === 204) {
    return null;
  }

  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
};

/**
 * [추가] 인증 종류에 맞는 Bearer 토큰을 반환합니다.
 */
const getAuthorizationToken = (authType) => {
  if (authType === "customer") {
    return getSessionToken();
  }

  if (authType === "staff") {
    return getStaffToken();
  }

  return null;
};

/**
 * [추가] 인증 API 호출 전에 필요한 토큰이 없으면 storage를 정리하고
 * 각 인증 시작 화면으로 이동합니다.
 */
const handleMissingAuthentication = (authType) => {
  if (authType === "customer") {
    clearCustomerStorage();

    if (typeof window !== "undefined") {
      window.location.replace("/onboarding");
    }
  }

  if (authType === "staff") {
    removeStaffToken();

    if (typeof window !== "undefined") {
      window.location.replace("/staff/login");
    }
  }
};

/**
 * [추가] 고객 세션 만료와 직원 인증 만료를 공통 처리합니다.
 */
const handleAuthenticationError = (authType, status) => {
  if (authType === "customer" && status === 410) {
    clearCustomerStorage();

    if (typeof window !== "undefined") {
      window.location.replace("/onboarding");
    }
  }

  if (authType === "staff" && status === 401) {
    removeStaffToken();

    if (typeof window !== "undefined") {
      window.location.replace("/staff/login");
    }
  }
};

/**
 * [추가] Base URL, JSON, 인증과 오류 처리를 포함한 공통 fetch 요청입니다.
 */
export const apiRequest = async (
  path,
  { method = "GET", body, headers = {}, authType = "none" } = {},
) => {
  const token = getAuthorizationToken(authType);

  // [추가] 인증 토큰 누락 시 잘못된 API 요청을 보내지 않고 공통 만료 흐름을 실행합니다.
  if (authType !== "none" && !token) {
    handleMissingAuthentication(authType);

    throw new ApiError("인증 정보를 확인할 수 없습니다.", 401, null);
  }

  const requestHeaders = {
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(createApiUrl(path), {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const responseData = await parseResponse(response);

  if (!response.ok) {
    handleAuthenticationError(authType, response.status);

    const errorMessage =
      responseData?.message ??
      responseData?.error ??
      `API 요청에 실패했습니다. (${response.status})`;

    throw new ApiError(errorMessage, response.status, responseData);
  }

  return responseData;
};

/**
 * [추가] sessionToken을 사용하는 고객 API 요청 함수입니다.
 */
export const customerApiRequest = (path, options = {}) => {
  return apiRequest(path, {
    ...options,
    authType: "customer",
  });
};

/**
 * [추가] staffToken을 사용하는 직원 API 요청 함수입니다.
 */
export const staffApiRequest = (path, options = {}) => {
  return apiRequest(path, {
    ...options,
    authType: "staff",
  });
};
