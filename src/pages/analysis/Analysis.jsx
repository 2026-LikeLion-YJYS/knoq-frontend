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
 * 선택한 모달 결과를 올바른 분석 항목에 반영합니다.
 */
const analysisFieldMap = {
  category: "productCategory",
  color: "preferredColor",
  material: "preferredMaterial",
  size: "preferredSize",
};

/**
 * [수정] 니즈 분석 화면
 * analysisStep과 저장 제품 개수에 따라 분석1·2·4·5·7·8 화면을 구분합니다.
 */
function Analysis({
  initialStep = "entry",
  initialSavedCount = 1,
  onStartAnalysis,
  onUpdateAnalysis,
  onCompleteEdit,
}) {
  // [추가] 분석 화면 진행 상태
  // entry: 분석1·2 / review: 분석4 / result: 분석5·7 / edit: 분석8
  const [analysisStep, setAnalysisStep] = useState(initialStep);

  // [수정] 화면별 저장 제품 개수를 전달받아 초기화
  // 분석1·7은 1, 분석2·4·5·8은 2 이상을 전달합니다.
  const [savedCount] = useState(initialSavedCount);

  // [추가] 수정 중인 니즈 분석 결과
  // 모달에서 저장한 값은 API 호출 없이 이 상태에 반영합니다.
  const [editedAnalysis, setEditedAnalysis] = useState(analysisData);

  // [수정] 현재 열려 있는 수정 모달 종류
  // category / color / material / size 중 하나를 저장합니다.
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

  // [수정] entry 상태에서만 분석1·2 진입 화면을 표시합니다.
  const showAnalysisEntry = analysisStep === "entry";

  // [수정] 분석4인 review 상태에서만 승인·수정 버튼을 표시합니다.
  const showReviewActions = analysisStep === "review";

  // [추가] 분석8인 edit 상태에서 수정 관련 버튼을 표시합니다.
  const showEditControls = analysisStep === "edit";

  // [추가] entry가 아니면 기존 니즈 분석 결과가 존재하는 상태입니다.
  const hasAnalysis = analysisStep !== "entry";

  // [추가] 저장 제품이 2개 이상이면 최초 니즈 분석을 시작할 수 있습니다.
  const canAnalyze = savedCount >= 2;

  // [추가] 분석 결과가 있고 저장 제품이 2개 이상이면 업데이트할 수 있습니다.
  const canUpdateAnalysis = hasAnalysis && savedCount >= 2;

  // [추가] 현재 수정 모달에 전달할 분석 결과 값
  const editingValue = editingField
    ? editedAnalysis[analysisFieldMap[editingField]]
    : "";

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
   * [수정] 분석 결과 수정
   * 분석4에서 분석8 수정 메인 화면으로 변경합니다.
   */
  const handleEditAnalysis = () => {
    setAnalysisStep("edit");
  };

  /**
   * [수정] 수정할 니즈 항목 선택
   * 선택한 종류에 맞는 분석9~12 모달을 엽니다.
   */
  const handleSelectEditField = (type) => {
    setEditingField(type);
  };

  /**
   * [추가] 니즈 항목 수정값 저장
   * 선택한 값을 수정 중인 분석 결과에 즉시 반영하고 모달을 닫습니다.
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
   * [추가] 수정 모달 닫기
   * 저장하지 않고 분석8 화면으로 돌아갑니다.
   */
  const handleCloseEditModal = () => {
    setEditingField(null);
  };

  /**
   * [추가] 전체 니즈 수정 완료
   * 다음 커밋 이후 분석13 수정 완료 화면으로 이동하도록 연결합니다.
   */
  const handleCompleteEdit = () => {
    onCompleteEdit?.(editedAnalysis);
  };

  /**
   * [수정] 니즈 분석 업데이트
   * 기존 결과에 값을 추가하지 않고 현재 저장 제품을 기준으로 재분석합니다.
   */
  const handleUpdateAnalysis = () => {
    if (!canUpdateAnalysis) {
      return;
    }

    onUpdateAnalysis?.();
  };

  return (
    // [수정] 현재 분석 단계와 선택한 수정 항목을 확인할 수 있도록 data 속성 추가
    <div
      className="analysis-page"
      data-analysis-step={analysisStep}
      data-editing-field={editingField ?? ""}
    >
      {/* [추가] 분석 화면 공통 헤더 */}
      <MainHeader />

      {/* [수정] 분석 결과와 최초 진입 상태를 함께 관리하는 콘텐츠 */}
      <main className="analysis-content">
        {/* [수정] 분석 화면 제목과 화면별 버튼 영역 */}
        <section className="analysis-intro">
          <div className="analysis-title-row">
            <h1 className="analysis-title">KNOQ가 발견한 나의 니즈</h1>

            {/* [수정] 분석4에서만 승인·수정 버튼 표시 */}
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

            {/* [추가] 분석8에서만 수정 완료하기 버튼 표시 */}
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

        {/* [수정] 분석1·2에서 블러 처리하고 분석8에서 수정 버튼을 표시할 영역 */}
        <div
          className={`analysis-result-area ${
            showAnalysisEntry ? "analysis-result-area--blurred" : ""
          }`}
          aria-hidden={showAnalysisEntry}
        >
          {/* [수정] 수정 상태가 반영되는 니즈 분석 결과 카드 */}
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

                {/* [추가] 분석8에서만 카드별 수정 버튼 표시 */}
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

          {/* [수정] 저장 제품에서 발견한 공통점 */}
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

          {/* [수정] 저장 제품 개수에 따라 활성화되는 업데이트 버튼 */}
          <button
            className="analysis-update-button"
            type="button"
            disabled={!canUpdateAnalysis}
            onClick={handleUpdateAnalysis}
          >
            니즈 분석 업데이트
          </button>

          {/* [추가] 분석7에서 업데이트 불가 안내 문구 표시 */}
          {hasAnalysis && !canUpdateAnalysis && (
            <p className="analysis-update-message">
              제품을 2개 이상 스캔해야 니즈분석이 가능해요.
            </p>
          )}
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

      {/* [추가] 선택한 항목에 따라 분석9~12 수정 모달 표시 */}
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
