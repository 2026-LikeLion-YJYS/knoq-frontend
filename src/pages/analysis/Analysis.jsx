// [추가] 분석 화면 임시 상태 관리를 위한 useState
import { useState } from "react";

// [추가] 공통 헤더와 하단 네비게이션 사용
import MainHeader from "../../components/MainHeader/MainHeader";
import BottomNav from "../../components/BottomNav/BottomNav";

import "./Analysis.css";

/**
 * [추가] API 연동 전 니즈 분석 임시 데이터
 * 추후 GET 니즈 분석 상태 조회 응답의 analysis 데이터로 교체합니다.
 */
const analysisData = {
  productCategory: "토트백 / 쇼퍼백",
  preferredColor: "Black · Cognac",
  preferredMaterial: "Leather",
  preferredSize: "Medium · Large",
  comment:
    "고객님은 컬러와 디자인보다 수납 가능한 사이즈를 더 일관되게 선택하고 있어요.",
};

/**
 * [추가] 니즈 분석 결과 카드 목록
 * 동일한 카드 UI를 반복해서 렌더링하기 위한 데이터입니다.
 */
const analysisItems = [
  {
    label: "제품 카테고리",
    value: analysisData.productCategory,
  },
  {
    label: "선호 컬러",
    value: analysisData.preferredColor,
  },
  {
    label: "선호 소재",
    value: analysisData.preferredMaterial,
  },
  {
    label: "선호 사이즈",
    value: analysisData.preferredSize,
  },
];

/**
 * [수정] 니즈 분석 화면
 * analysisStep 상태에 따라 진입·검토·확정·수정 화면을 구분합니다.
 */
function Analysis({
  initialStep = "entry",
  onStartAnalysis,
  onUpdateAnalysis,
}) {
  // [추가] 분석 화면 진행 상태
  // entry: 분석1·2 / review: 분석4 / result: 분석5 / edit: 분석8
  const [analysisStep, setAnalysisStep] = useState(initialStep);

  // [추가] API 연동 전 저장 제품 개수
  // 분석1 확인 시 1, 분석2 확인 시 2 이상으로 변경합니다.
  const [savedCount] = useState(2);

  // [수정] entry 상태에서만 분석1·2 진입 화면을 표시합니다.
  const showAnalysisEntry = analysisStep === "entry";

  // [추가] 분석4에서만 승인·수정 버튼을 표시합니다.
  const showReviewActions = analysisStep === "review";

  // [추가] 저장 제품이 2개 이상이면 니즈 분석을 시작할 수 있습니다.
  const canAnalyze = savedCount >= 2;

  /**
   * [수정] 최초 니즈 분석 시작
   * 저장 제품이 2개 이상이면 분석3 로딩 화면으로 이동합니다.
   */
  const handleStartAnalysis = () => {
    if (!canAnalyze) {
      return;
    }

    onStartAnalysis?.();
  };

  /**
   * [추가] 분석 결과 승인
   * 분석4에서 분석5 확정 결과 상태로 변경합니다.
   */
  const handleApproveAnalysis = () => {
    setAnalysisStep("result");
  };

  /**
   * [추가] 분석 결과 수정
   * 다음 커밋에서 edit 상태에 분석8 UI를 연결합니다.
   */
  const handleEditAnalysis = () => {
    setAnalysisStep("edit");
  };

  /**
   * [추가] 니즈 분석 업데이트 버튼 동작
   * 추후 API 연동 시 재분석 요청 성공 후 로딩 화면으로 이동합니다.
   */
  const handleUpdateAnalysis = () => {
    onUpdateAnalysis?.();
  };

  return (
    // [수정] 현재 분석 단계 확인을 위한 data 속성 추가
    <div className="analysis-page" data-analysis-step={analysisStep}>
      {/* [추가] 분석 화면 공통 헤더 */}
      <MainHeader />

      {/* [수정] 분석 결과와 최초 진입 상태를 함께 관리하는 콘텐츠 */}
      <main className="analysis-content">
        {/* [수정] 분석 화면 제목과 검토 버튼 영역 */}
        <section className="analysis-intro">
          <div className="analysis-title-row">
            <h1 className="analysis-title">KNOQ가 발견한 나의 니즈</h1>

            {/* [추가] 분석4에서만 표시되는 승인·수정 버튼 */}
            {showReviewActions && (
              <div className="analysis-review-actions">
                <button
                  className="analysis-review-button"
                  type="button"
                  onClick={handleApproveAnalysis}
                >
                  승인
                </button>

                <button
                  className="analysis-review-button"
                  type="button"
                  onClick={handleEditAnalysis}
                >
                  수정
                </button>
              </div>
            )}
          </div>

          <p className="analysis-description">
            스캔한 제품을 바탕으로 나의 제품 선호를 분석했어요.
            <br />
            제품을 추가하거나 삭제했다면 ‘니즈 다시 분석하기’를 눌러주세요.
          </p>
        </section>

        {/* [추가] 분석1·2에서 블러 처리할 분석5 결과 영역 */}
        <div
          className={`analysis-result-area ${
            showAnalysisEntry ? "analysis-result-area--blurred" : ""
          }`}
          aria-hidden={showAnalysisEntry}
        >
          {/* [추가] 카테고리·컬러·소재·사이즈 분석 결과 */}
          <section className="analysis-result-grid" aria-label="니즈 분석 결과">
            {analysisItems.map((item) => (
              <article className="analysis-result-card" key={item.label}>
                <p className="analysis-result-label">{item.label}</p>
                <p className="analysis-result-value">{item.value}</p>
              </article>
            ))}
          </section>

          {/* [추가] 저장 제품에서 발견한 공통점 */}
          <section className="analysis-discovery">
            <h2 className="analysis-discovery-title">KNOQ'S 발견</h2>

            <p className="analysis-discovery-description">
              스캔한 제품들의 공통점을 찾아, 내가 가장 중요하게 생각하는 기준을
              알려드려요.
            </p>

            <div className="analysis-comment">
              <p>{analysisData.comment}</p>
            </div>
          </section>

          {/* [추가] 니즈 분석 업데이트 버튼 */}
          <button
            className="analysis-update-button"
            type="button"
            onClick={handleUpdateAnalysis}
          >
            니즈 분석 업데이트
          </button>
        </div>

        {/* [추가] 분석 결과가 없을 때 표시하는 분석1·2 오버레이 */}
        {showAnalysisEntry && (
          <section
            className="analysis-entry-overlay"
            aria-label="니즈 분석 시작"
          >
            <button
              className="analysis-start-button"
              type="button"
              disabled={!canAnalyze}
              onClick={handleStartAnalysis}
            >
              니즈 분석하기
            </button>

            <p className="analysis-entry-message">
              {canAnalyze
                ? "나의 니즈를 찾아서 탐색을 이어가보세요"
                : "제품을 2개 이상 스캔해야 니즈분석이 가능해요."}
            </p>
          </section>
        )}
      </main>

      {/* [추가] 분석 탭이 활성화된 공통 하단 네비게이션 */}
      <BottomNav activeTab="analysis" />
    </div>
  );
}

export default Analysis;
