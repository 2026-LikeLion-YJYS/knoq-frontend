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
 * [추가] 니즈 분석 결과 기본 화면
 * 저장한 제품을 바탕으로 분석된 선호 정보와 코멘트를 표시합니다.
 */
function Analysis({ onUpdateAnalysis }) {
  /**
   * [추가] 니즈 분석 업데이트 버튼 동작
   * 현재는 부모 컴포넌트의 화면 이동 함수만 실행하며,
   * 추후 API 연동 시 재분석 요청 성공 후 로딩 화면으로 이동합니다.
   */
  const handleUpdateAnalysis = () => {
    onUpdateAnalysis?.();
  };

  return (
    <div className="analysis-page">
      {/* [추가] 분석 화면 공통 헤더 */}
      <MainHeader />

      {/* [추가] 니즈 분석 결과 전체 콘텐츠 */}
      <main className="analysis-content">
        {/* [추가] 분석 화면 제목과 설명 */}
        <section className="analysis-intro">
          <h1 className="analysis-title">KNOQ가 발견한 나의 니즈</h1>

          <p className="analysis-description">
            스캔한 제품을 바탕으로 나의 제품 선호를 분석했어요.
            <br />
            제품을 추가하거나 삭제했다면 ‘니즈 다시 분석하기’를 눌러주세요.
          </p>
        </section>

        {/* [추가] 카테고리·컬러·소재·사이즈 분석 결과 */}
        <section
          className="analysis-result-grid"
          aria-label="니즈 분석 결과"
        >
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
      </main>

      {/* [추가] 분석 탭이 활성화된 공통 하단 네비게이션 */}
      <BottomNav activeTab="analysis" />
    </div>
  );
}

export default Analysis;