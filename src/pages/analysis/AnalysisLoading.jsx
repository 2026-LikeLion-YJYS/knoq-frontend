import "./AnalysisLoading.css";

/**
 * [수정] 최초 분석과 업데이트 POST 요청 중 함께 사용하는 로딩 화면
 * mode에 따라 로딩 안내 문구를 구분합니다.
 */
function AnalysisLoading({ mode = "initial" }) {
  // [추가] 업데이트 재분석 여부
  const isUpdate = mode === "update";

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
