// [추가] 공통 헤더와 하단 네비게이션 사용
import { useNavigate } from "react-router-dom";
import MainHeader from "../../components/MainHeader/MainHeader";
import BottomNav from "../../components/BottomNav/BottomNav";

// [추가] 니즈 항목 수정 모달 사용
import AnalysisEditModal from "./AnalysisEditModal";

import "./Analysis.css";

/**
 * [수정] 니즈 분석 화면
 * App.jsx에서 관리하는 상태를 전달받아 현재 단계의 UI를 표시합니다.
 */
function Analysis({
  analysisStep,
  savedCount,
  hasAnalysis,
  analysisData,
  editedAnalysis,
  editModalType,
  isEditModalOpen,
  onStartAnalysis,
  onApproveAnalysis,
  onStartEditAnalysis,
  onOpenEditModal,
  onCloseEditModal,
  onSaveEditValue,
  onCompleteEdit,
  onUpdateAnalysis,
}) {
  // [추가] 다른 화면으로 이동
  const navigate = useNavigate();

  // [추가] 분석1·2 진입 화면 표시 여부
  const showAnalysisEntry = analysisStep === "initial";

  // [추가] 분석4 승인·수정 버튼 표시 여부
  const showReviewActions = analysisStep === "review";

  // [추가] 분석8 수정 버튼 표시 여부
  const showEditControls = analysisStep === "edit";

  // [추가] 저장 제품이 2개 이상이면 최초 분석 가능
  const canAnalyze = savedCount >= 2;

  // [추가] 기존 분석 결과가 있고 저장 제품이 2개 이상이면 업데이트 가능
  const canUpdateAnalysis = hasAnalysis && savedCount >= 2;

  // [추가] 분석8에서는 수정 중인 결과를 표시하고 나머지는 확정 결과 표시
  const displayedAnalysis = showEditControls ? editedAnalysis : analysisData;

  // [추가] 현재 화면에 표시할 니즈 분석 카드
  const analysisItems = [
    {
      type: "category",
      label: "제품 카테고리",
      value: displayedAnalysis.productCategory,
    },
    {
      type: "color",
      label: "선호 컬러",
      value: displayedAnalysis.preferredColor,
    },
    {
      type: "material",
      label: "선호 소재",
      value: displayedAnalysis.preferredMaterial,
    },
    {
      type: "size",
      label: "선호 사이즈",
      value: displayedAnalysis.preferredSize,
    },
  ];

  // [추가] 수정 모달 종류와 데이터 필드 연결
  const analysisFieldMap = {
    category: "productCategory",
    color: "preferredColor",
    material: "preferredMaterial",
    size: "preferredSize",
  };

  // [추가] 현재 수정 모달에 전달할 값
  const editingValue = editModalType
    ? editedAnalysis[analysisFieldMap[editModalType]]
    : "";

  return (
    <div
      className="analysis-page"
      data-analysis-step={analysisStep}
      data-editing-field={editModalType ?? ""}
    >
      {/* [추가] 분석 화면 공통 헤더 */}
      <MainHeader
        onLogoClick={() => navigate("/explore")}
        onNotificationClick={() => navigate("/notification")}
        onSettingClick={() => navigate("/setting")}
      />

      {/* [추가] 분석 화면 콘텐츠 */}
      <main className="analysis-content">
        <section className="analysis-intro">
          <div className="analysis-title-row">
            <h1 className="analysis-title">KNOQ가 발견한 나의 니즈</h1>

            {/* [수정] 분석4 승인·수정 버튼 */}
            {showReviewActions && (
              <div className="analysis-review-actions">
                <button
                  className="analysis-review-button"
                  type="button"
                  onClick={onApproveAnalysis}
                >
                  승인
                </button>

                <button
                  className="analysis-review-button"
                  type="button"
                  onClick={onStartEditAnalysis}
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
                onClick={onCompleteEdit}
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

        {/* [수정] 분석1·2에서만 결과 영역 블러 처리 */}
        <div
          className={`analysis-result-area ${
            showAnalysisEntry ? "analysis-result-area--blurred" : ""
          }`}
          aria-hidden={showAnalysisEntry}
        >
          {/* [수정] 현재 분석 상태의 결과 카드 */}
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
                    onClick={() => onOpenEditModal?.(item.type)}
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
              <p>{displayedAnalysis.comment}</p>
            </div>
          </section>

          {/* [수정] 저장 제품 개수에 따라 활성화되는 업데이트 버튼 */}
          <button
            className="analysis-update-button"
            type="button"
            disabled={!canUpdateAnalysis}
            onClick={onUpdateAnalysis}
          >
            니즈 분석 업데이트
          </button>

          {/* [수정] 분석7 업데이트 불가 안내 */}
          {hasAnalysis && !canUpdateAnalysis && (
            <p className="analysis-update-message">
              제품을 2개 이상 스캔해야 니즈분석이 가능해요.
            </p>
          )}
        </div>

        {/* [수정] 분석 결과가 없을 때 분석1·2 오버레이 표시 */}
        {showAnalysisEntry && (
          <section
            className="analysis-entry-overlay"
            aria-label="니즈 분석 시작"
          >
            <button
              className="analysis-start-button"
              type="button"
              disabled={!canAnalyze}
              onClick={onStartAnalysis}
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

      {/* [수정] 선택한 항목에 맞는 분석9~12 모달 표시 */}
      {isEditModalOpen && editModalType && (
        <AnalysisEditModal
          type={editModalType}
          value={editingValue}
          onSave={onSaveEditValue}
          onClose={onCloseEditModal}
        />
      )}
    </div>
  );
}

export default Analysis;
