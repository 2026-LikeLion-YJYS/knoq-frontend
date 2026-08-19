/**
 * [추가] sessionStorage에서 사용하는 키를 한 곳에서 관리합니다.
 */
export const STORAGE_KEYS = {
  SESSION_ID: "sessionId",
  SESSION_TOKEN: "sessionToken",
  STAFF_TOKEN: "staffToken",
  CONSULTATION_REQUEST_ID: "consultationRequestId",
  LIFESTYLE_TAGS: "lifestyleTags",
};

/**
 * [추가] 브라우저 환경에서 sessionStorage를 안전하게 가져옵니다.
 */
const getSessionStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
};

/**
 * [추가] 지정한 key의 값을 sessionStorage에서 조회합니다.
 */
export const getStorageItem = (key) => {
  return getSessionStorage()?.getItem(key) ?? null;
};

/**
 * [추가] 지정한 key와 값을 sessionStorage에 저장합니다.
 */
export const setStorageItem = (key, value) => {
  getSessionStorage()?.setItem(key, value);
};

/**
 * [추가] 지정한 key를 sessionStorage에서 삭제합니다.
 */
export const removeStorageItem = (key) => {
  getSessionStorage()?.removeItem(key);
};

/**
 * [추가] 고객 세션 ID를 조회합니다.
 */
export const getSessionId = () => {
  return getStorageItem(STORAGE_KEYS.SESSION_ID);
};

/**
 * [추가] 고객 세션 ID를 저장합니다.
 */
export const setSessionId = (sessionId) => {
  setStorageItem(STORAGE_KEYS.SESSION_ID, sessionId);
};

/**
 * [추가] 고객 Bearer 토큰을 조회합니다.
 */
export const getSessionToken = () => {
  return getStorageItem(STORAGE_KEYS.SESSION_TOKEN);
};

/**
 * [추가] 고객 Bearer 토큰을 저장합니다.
 */
export const setSessionToken = (sessionToken) => {
  setStorageItem(STORAGE_KEYS.SESSION_TOKEN, sessionToken);
};

/**
 * [추가] 직원 Bearer 토큰을 조회합니다.
 */
export const getStaffToken = () => {
  return getStorageItem(STORAGE_KEYS.STAFF_TOKEN);
};

/**
 * [추가] 직원 Bearer 토큰을 저장합니다.
 */
export const setStaffToken = (staffToken) => {
  setStorageItem(STORAGE_KEYS.STAFF_TOKEN, staffToken);
};

/**
 * [추가] 저장된 직원 Bearer 토큰을 삭제합니다.
 */
export const removeStaffToken = () => {
  removeStorageItem(STORAGE_KEYS.STAFF_TOKEN);
};

/**
 * [추가] 상담 요청 ID를 조회합니다.
 */
export const getConsultationRequestId = () => {
  return getStorageItem(STORAGE_KEYS.CONSULTATION_REQUEST_ID);
};

/**
 * [추가] 상담 요청 ID를 저장합니다.
 */
export const setConsultationRequestId = (requestId) => {
  setStorageItem(STORAGE_KEYS.CONSULTATION_REQUEST_ID, requestId);
};

/**
 * [추가] 라이프스타일 태그 배열을 조회합니다.
 */
export const getLifestyleTags = () => {
  const storedTags = getStorageItem(STORAGE_KEYS.LIFESTYLE_TAGS);

  if (!storedTags) {
    return [];
  }

  try {
    const parsedTags = JSON.parse(storedTags);

    return Array.isArray(parsedTags) ? parsedTags : [];
  } catch {
    return [];
  }
};

/**
 * [추가] 라이프스타일 태그 배열을 JSON 문자열로 저장합니다.
 */
export const setLifestyleTags = (tags) => {
  setStorageItem(STORAGE_KEYS.LIFESTYLE_TAGS, JSON.stringify(tags));
};

/**
 * [추가] 고객 세션과 관련된 storage 값만 삭제합니다.
 */
export const clearCustomerStorage = () => {
  removeStorageItem(STORAGE_KEYS.SESSION_ID);
  removeStorageItem(STORAGE_KEYS.SESSION_TOKEN);
  removeStorageItem(STORAGE_KEYS.CONSULTATION_REQUEST_ID);
  removeStorageItem(STORAGE_KEYS.LIFESTYLE_TAGS);
};
