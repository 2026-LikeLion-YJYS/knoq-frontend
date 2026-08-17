// [추가] 분석 화면 임시 상태 관리를 위한 useState
import { useState } from "react";

// [추가] 공통 헤더와 하단 네비게이션 사용
import MainHeader from "../../components/MainHeader/MainHeader";
import BottomNav from "../../components/BottomNav/BottomNav";

// [추가] 니즈 항목 수정 모달 사용
import AnalysisEditModal from "./AnalysisEditModal";

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
 * [추가] 수정 모달 종류와 분석 데이터 필드 연결
 */
const analysisFieldMap = {
  category: "productCategory",
  color: "preferredColor",
  material: "preferredMaterial",
  size: "preferredSize",
};

/**
 * [수정] 니즈 분석 화면
 * 수정된 분석 결과를 initialAnalysis로 전달받아 화면에 표시합니다.
 */
function Analysis({
  initialStep = "entry",
  initialSavedCount = 1,
  initialAnalysis = analysisData,
  onStartAnalysis,
  onUpdateAnalysis,
  onCompleteEdit,
}) {
  // [추가] 분석 화면 진행 상태
  // entry: 분석1·2 / review: 분석4 / result: 분석5·7 / edit: 분석8
  const [analysisStep, setAnalysisStep] = useState(initialStep);

  // [추가] 화면별 저장 제품 개수
  const [savedCount] = useState(initialSavedCount);

  // [수정] 전달받은 분석 결과를 수정 상태의 초기값으로 사용
  const [editedAnalysis, setEditedAnalysis] = useState(() => initialAnalysis);

  // [추가] 현재 열려 있는 수정 모달 종류
  const [editingField, setEditingField] = useState(null);

  // [수정] 현재 상태의 분석 결과 카드 목록
  const analysisItems = [
    {
      type: "category",
      label: "제품 카테고리",
      value: editedAnalysis.productCategory,
    },
    {
      type: "color",
      label: "선호 컬러",
      value: editedAnalysis.preferredColor,
    },
    {
      type: "material",
      label: "선호 소재",
      value: editedAnalysis.preferredMaterial,
    },
    {
      type: "size",
      label: "선호 사이즈",
      value: editedAnalysis.preferredSize,
    },
  ];

  // [추가] 분석1·2 진입 화면 표시 여부
  const showAnalysisEntry = analysisStep === "entry";

  // [추가] 분석4 승인·수정 버튼 표시 여부
  const showReviewActions = analysisStep === "review";

  // [추가] 분석8 수정 버튼 표시 여부
  const showEditControls = analysisStep === "edit";

  // [추가] 기존 분석 결과 존재 여부
  const hasAnalysis = analysisStep !== "entry";

  // [추가] 최초 분석 가능 여부
  const canAnalyze = savedCount >= 2;

  // [추가] 니즈 분석 업데이트 가능 여부
  const canUpdateAnalysis = hasAnalysis && savedCount >= 2;

  // [추가] 현재 수정 모달에 전달할 값
  const editingValue = editingField
    ? editedAnalysis[analysisFieldMap[editingField]]
    : "";

  /**
   * [추가] 최초 니즈 분석 시작
   */
  const handleStartAnalysis = () => {
    if (!canAnalyze) {
      return;
    }

    onStartAnalysis?.();
  };

  /**
   * [추가] 분석 결과 승인
   */
  const handleApproveAnalysis = () => {
    setAnalysisStep("result");
  };

  /**
   * [추가] 분석4에서 분석8로 전환
   */
  const handleEditAnalysis = () => {
    setAnalysisStep("edit");
  };

  /**
   * [추가] 선택한 니즈 항목 수정 모달 열기
   */
  const handleSelectEditField = (type) => {
    setEditingField(type);
  };

  /**
   * [추가] 모달 수정값을 분석8 카드에 반영
   */
  const handleSaveEdit = (value) => {
    const analysisField = analysisFieldMap[editingField];

    if (!analysisField) {
      return;
    }

    setEditedAnalysis((previousAnalysis) => ({
      ...previousAnalysis,
      [analysisField]: value,
    }));

    setEditingField(null);
  };

  /**
   * [추가] 수정값을 저장하지 않고 모달 닫기
   */
  const handleCloseEditModal = () => {
    setEditingField(null);
  };

  /**
   * [수정] 전체 수정 결과를 App.jsx로 전달
   * App.jsx에서 결과를 저장한 뒤 분석13으로 이동합니다.
   */
  const handleCompleteEdit = () => {
    onCompleteEdit?.(editedAnalysis);
  };

  /**
   * [추가] 니즈 분석 업데이트
   */
  const handleUpdateAnalysis = () => {
    if (!canUpdateAnalysis) {
      return;
    }

    onUpdateAnalysis?.();
  };

  return (
    <div
      className="analysis-page"
      data-analysis-step={analysisStep}
      data-editing-field={editingField ?? ""}
    >
      {/* [추가] 분석 화면 공통 헤더 */}
      <MainHeader />

      {/* [추가] 분석 화면 콘텐츠 */}
      <main className="analysis-content">
        <section className="analysis-intro">
          <div className="analysis-title-row">
            <h1 className="analysis-title">KNOQ가 발견한 나의 니즈</h1>

            {/* [추가] 분석4 승인·수정 버튼 */}
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

            {/* [수정] 분석8 전체 수정 완료 버튼 */}
            {showEditControls && (
              <button
                className="analysis-edit-complete-button"
                type="button"
                onClick={handleCompleteEdit}
              >
                수정 완료하기
              </button>
            )}
          </div>

          <p className="analysis-description">
            스캔한 제품을 바탕으로 나의 제품 선호를 분석했어요.
            <br />
            제품을 추가하거나 삭제했다면 ‘니즈 분석 업데이트’를 눌러주세요.
          </p>
        </section>

        {/* [추가] 니즈 분석 결과 영역 */}
        <div
          className={`analysis-result-area ${
            showAnalysisEntry ? "analysis-result-area--blurred" : ""
          }`}
          aria-hidden={showAnalysisEntry}
        >
          <section className="analysis-result-grid" aria-label="니즈 분석 결과">
            {analysisItems.map((item) => (
              <article
                className={`analysis-result-card ${
                  showEditControls ? "analysis-result-card--editable" : ""
                }`}
                key={item.type}
              >
                <p className="analysis-result-label">{item.label}</p>

                <p className="analysis-result-value">{item.value}</p>

                {/* [추가] 분석8 카드별 수정 버튼 */}
                {showEditControls && (
                  <button
                    className="analysis-card-edit-button"
                    type="button"
                    aria-label={`${item.label} 수정`}
                    onClick={() => handleSelectEditField(item.type)}
                  >
                    수정
                  </button>
                )}
              </article>
            ))}
          </section>

          {/* [추가] KNOQ'S 발견 영역 */}
          <section className="analysis-discovery">
            <h2 className="analysis-discovery-title">KNOQ'S 발견</h2>

            <p className="analysis-discovery-description">
              {showEditControls
                ? "제품에서 가장 많이 나타난 공통 요소를 기준으로 우선순위를 분석했어요."
                : "스캔한 제품들의 공통점을 찾아, 내가 가장 중요하게 생각하는 기준을 알려드려요."}
            </p>

            <div className="analysis-comment">
              <p>{editedAnalysis.comment}</p>
            </div>
          </section>

          {/* [추가] 니즈 분석 업데이트 버튼 */}
          <button
            className="analysis-update-button"
            type="button"
            disabled={!canUpdateAnalysis}
            onClick={handleUpdateAnalysis}
          >
            니즈 분석 업데이트
          </button>

          {/* [추가] 분석7 업데이트 불가 안내 */}
          {hasAnalysis && !canUpdateAnalysis && (
            <p className="analysis-update-message">
              제품을 2개 이상 스캔해야 니즈분석이 가능해요.
            </p>
          )}
        </div>

        {/* [추가] 분석1·2 진입 오버레이 */}
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

      {/* [추가] 분석 하단 네비게이션 */}
      <BottomNav activeTab="analysis" />

      {/* [추가] 분석9~12 수정 모달 */}
      {editingField && (
        <AnalysisEditModal
          type={editingField}
          value={editingValue}
          onSave={handleSaveEdit}
          onClose={handleCloseEditModal}
        />
      )}
    </div>
  );
}

export default Analysis;
