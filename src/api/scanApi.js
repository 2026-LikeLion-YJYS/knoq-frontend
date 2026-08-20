// [윤서] 탐색 - 제품 스캔 API 연동
import { customerApiRequest } from "./apiClient";

/**
 * [윤서][추가] FR-200 카메라 인식 요청.
 * 촬영한 이미지를 multipart/form-data로 전송합니다. 필드명은 "image".
 * 확신도 80%↑면 matchType: SINGLE(후보 1개), 미만이면 CANDIDATES(최대 3개) — 둘 다 candidates 배열 구조는 동일.
 */
export const recognizeProduct = (sessionId, imageBlob) => {
  const formData = new FormData();
  formData.append("image", imageBlob, "capture.jpg");

  return customerApiRequest(
    `/sessions/${encodeURIComponent(sessionId)}/recognitions`,
    {
      method: "POST",
      body: formData,
    },
  );
};

/**
 * [윤서][추가] FR-200 인식 결과 확인.
 * confirmed:true면 같은 트랜잭션 안에서 저장목록에 자동 저장됩니다(별도 저장 API 호출 불필요).
 * confirmed:false면 "다시 촬영할게요" 처리 - 클라이언트가 인식 API를 재호출합니다.
 */
export const confirmRecognition = (
  sessionId,
  recognitionId,
  productId,
  confirmed,
) => {
  return customerApiRequest(
    `/sessions/${encodeURIComponent(sessionId)}/recognitions/${encodeURIComponent(recognitionId)}/confirm`,
    {
      method: "POST",
      body: { productId, confirmed },
    },
  );
};

/**
 * [추가] 카메라 권한 거부 또는 반복 인식 실패 시 제품 코드로 직접 조회합니다.
 */
export const lookupProductByCode = (sessionId, productCode) => {
  return customerApiRequest(
    `/sessions/${encodeURIComponent(sessionId)}/products/lookup`,
    {
      method: "POST",
      body: { productCode },
    },
  );
};
