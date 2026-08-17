// [추가] 로딩 완료 후 화면 이동을 위한 useEffect
import { useEffect } from "react";

import "./AnalysisLoading.css";

/**
 * [수정] 최초 분석과 업데이트 분석에서 함께 사용하는 로딩 화면
 * mode에 따라 로딩 안내 문구를 구분합니다.
 */
function AnalysisLoading({ mode = "initial", onComplete }) {
  // [추가] 업데이트 재분석 여부
  const isUpdate = mode === "update";

  /**
   * [수정] API 연동 전 임시 분석 처리
   * 추후 POST 니즈 분석 실행·재분석 API가 완료되면 이동하도록 변경합니다.
   */
  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      onComplete?.();
    }, 1500);

    return () => {
      clearTimeout(loadingTimer);
    };
  }, [onComplete]);

  return (
    <main className="analysis-loading-page" role="status" aria-live="polite">
      {/* [추가] 로딩 그래픽과 안내 문구 */}
      <div className="analysis-loading-content">
        <div className="analysis-loading-spinner" aria-hidden="true" />

        {/* [수정] 최초 분석과 업데이트 분석 문구 구분 */}
        <h1 className="analysis-loading-title">
          {isUpdate ? "니즈 분석 업데이트 중" : "니즈 분석 중"}
        </h1>

        <p className="analysis-loading-description">잠시만 기다려주세요</p>
      </div>
    </main>
  );
}

export default AnalysisLoading;
