// [추가] 로딩 완료 후 화면 이동을 위한 useEffect
import { useEffect } from "react";

import "./AnalysisLoading.css";

/**
 * [추가] 최초 니즈 분석 로딩 화면
 * 임시 로딩 시간이 지나면 분석 결과 검토 화면으로 이동합니다.
 */
function AnalysisLoading({ onComplete }) {
  /**
   * [추가] API 연동 전 임시 분석 처리
   * 추후 POST 니즈 분석 실행 API가 완료되면 이동하도록 변경합니다.
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
    <main
      className="analysis-loading-page"
      role="status"
      aria-live="polite"
    >
      {/* [추가] 로딩 그래픽과 안내 문구 */}
      <div className="analysis-loading-content">
        <div
          className="analysis-loading-spinner"
          aria-hidden="true"
        />

        <h1 className="analysis-loading-title">니즈 분석 중</h1>

        <p className="analysis-loading-description">
          잠시만 기다려주세요
        </p>
      </div>
    </main>
  );
}

export default AnalysisLoading;