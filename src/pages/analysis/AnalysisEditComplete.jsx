// [추가] 수정 완료 체크 아이콘
import analysisEditCompleteIcon from "../../assets/icons/analysis-edit-complete.svg";

import "./AnalysisEditComplete.css";

/**
 * [추가] 니즈 분석 수정 완료 화면
 * 이어서 분석하기 버튼을 누르면 수정된 결과가 표시되는 분석5로 이동합니다.
 */
function AnalysisEditComplete({ onContinue }) {
  /**
   * [추가] 수정된 니즈 분석 결과 화면으로 이동
   */
  const handleContinue = () => {
    onContinue?.();
  };

  return (
    <main className="analysis-edit-complete-page">
      {/* [추가] 뒤로가기 버튼 없이 제목만 표시하는 상단 영역 */}
      <header className="analysis-edit-complete-header">
        <h1>수정 완료</h1>
      </header>

      {/* [추가] 수정 완료 안내 콘텐츠 */}
      <section className="analysis-edit-complete-content">
        <img
          className="analysis-edit-complete-icon"
          src={analysisEditCompleteIcon}
          alt=""
          aria-hidden="true"
        />

        <h2 className="analysis-edit-complete-title">수정 완료</h2>

        <p className="analysis-edit-complete-description">
          고객님의 라이프스타일과 취향을 바탕으로
          <br />
          나에게 맞는 제품을 탐색해보세요.
        </p>
      </section>

      {/* [추가] 수정된 분석 결과 화면으로 이동하는 버튼 */}
      <button
        className="analysis-edit-result-button"
        type="button"
        onClick={handleContinue}
      >
        이어서 분석하기
      </button>
    </main>
  );
}

export default AnalysisEditComplete;
