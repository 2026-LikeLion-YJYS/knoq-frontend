// [추가] 기존 공통 컴포넌트 사용
import MainHeader from "../../components/MainHeader/MainHeader";
import BottomNav from "../../components/BottomNav/BottomNav";
import "./Help.css";

/**
 * [추가] 어드바이저 도움 요청 정적 화면
 * 피그마 도움_5 화면의 선택 완료 상태를 표시합니다.
 */
function Help() {
  return (
    <div className="help-page">
      {/* [추가] 공통 상단 헤더 */}
      <MainHeader />

      {/* [추가] 도움 요청 본문 */}
      <main className="help-content">
        {/* [추가] 도움 화면 안내 */}
        <section className="help-intro">
          <h1>원하는 순간, 어드바이저와 연결하세요.</h1>

          <p>
            자유롭게 탐색한 후 도움이 필요할 때 직접 요청할 수 있어요.
          </p>
        </section>

        {/* [추가] 도움 유형 선택 영역 */}
        <section className="help-section">
          <h2>도움 유형 선택(필수)</h2>

          <div className="help-type-list">
            {/* [추가] 선택된 도움 유형 */}
            <button
              className="help-type-button"
              type="button"
              aria-pressed="true"
            >
              제품 추천
            </button>

            <button
              className="help-type-button"
              type="button"
              aria-pressed="false"
            >
              제품 비교
            </button>

            <button
              className="help-type-button"
              type="button"
              aria-pressed="false"
            >
              스타일링 추천
            </button>

            <button
              className="help-type-button"
              type="button"
              aria-pressed="false"
            >
              제품 정보
            </button>
          </div>
        </section>

        {/* [추가] 상담 제품 선택 영역 */}
        <section className="help-section">
          <h2>제품 추가하기(선택)</h2>

          <div className="help-product-list">
            {/* [추가] 첫 번째 선택 제품 */}
            <div className="help-product-card">
              <img
                src="src/assets/images/help-product-brown.png"
                alt="선택한 브라운 가방"
              />
            </div>

            {/* [추가] 두 번째 선택 제품 */}
            <div className="help-product-card">
              <img
                src="src/assets/images/help-product-black.png"
                alt="선택한 블랙 가방"
              />
            </div>

            {/* [추가] 비어 있는 제품 추가 칸 */}
            <button
              className="help-add-card"
              type="button"
              aria-label="상담 제품 추가"
            >
              +
            </button>
          </div>
        </section>

        {/* [추가] 어드바이저에게 공유할 정보 */}
        <section className="help-section">
          <div className="help-share-title">
            <h2>어드바이저에게 공유할 나의 정보(선택)</h2>

            {/* [추가] 라이프스타일과 나의 니즈를 함께 선택하는 체크박스 */}
            <input
              className="help-checkbox"
              type="checkbox"
              checked
              readOnly
              aria-label="라이프스타일과 나의 니즈 공유"
            />
          </div>

          {/* [추가] 공유되는 라이프스타일과 나의 니즈 */}
          <div className="help-info-card">
            <div className="help-lifestyle">
              <h3>라이프스타일</h3>

              <div className="help-tag-list">
                <span>모던</span>
                <span>미니멀</span>
              </div>
            </div>

            <div className="help-needs">
              <h3>니즈</h3>

              <div className="help-needs-list">
                <div>
                  <span>카테고리</span>
                  <p>토트백 / 쇼퍼백</p>
                </div>

                <div>
                  <span>소재</span>
                  <p>Leather</p>
                </div>

                <div>
                  <span>사이즈</span>
                  <p>Medium · Large</p>
                </div>

                <div>
                  <span>컬러</span>
                  <p>Black · Cognac</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* [추가] 도움 유형 선택으로 활성화된 요청 버튼 */}
        <button className="help-request-button" type="button">
          도움 요청하기
        </button>
      </main>

      {/* [추가] 공통 하단 내비게이션 */}
      <BottomNav activeTab="help" />
    </div>
  );
}

export default Help;