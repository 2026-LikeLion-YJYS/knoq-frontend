// [추가] 직원 상담 요청 상세 화면 스타일
import "./StaffRequestDetail.css";

// [추가] 상단 아이콘
import settingIcon from "../../assets/icons/setting.svg";
import logoKnoq from "../../assets/icons/logo-knoq.svg";

// [추가] 상담 제품 임시 이미지
import brownBagImage from "../../assets/images/help-product-brown.png";
import blackBagImage from "../../assets/images/help-product-black.png";

// [추가] 화면에 표시할 도움 유형 목록
const HELP_TYPES = [
  {
    id: "PRODUCT_RECOMMENDATION",
    label: "제품 추천",
  },
  {
    id: "PRODUCT_COMPARISON",
    label: "제품 비교",
  },
  {
    id: "STYLING_RECOMMENDATION",
    label: "스타일링 추천",
  },
  {
    id: "PRODUCT_INFO",
    label: "제품 정보",
  },
];

// [추가] 라이프스타일 enum을 화면 문구로 변환
const LIFESTYLE_TAG_LABELS = {
  MINIMAL: "미니멀",
  CLASSIC: "클래식",
  CASUAL: "캐주얼",
  STREET: "스트리트",
  FORMAL: "포멀",
  TRENDY: "트렌디",

  // [추가] 피그마 화면 확인용 임시 값
  MODERN: "모던",
};

// [추가] API 연동 전 요청 상세 화면 확인용 임시 데이터
const TEMP_REQUEST_DETAIL = {
  requestId: "req_27",
  nickname: "김다현",
  helpType: "PRODUCT_RECOMMENDATION",
  lifestyleTags: ["MODERN", "MINIMAL"],
  status: "IN_PROGRESS",

  products: [
    {
      productId: "prod_12",
      productName: "Aren 비세토스 토트백",
      styleNumber: "MWTCSBF02CO001",
      imageUrl: brownBagImage,
    },
    {
      productId: "prod_33",
      productName: "Aren 맥시 모노그램 토트백",
      styleNumber: "MWTCSBF03BK001",
      imageUrl: blackBagImage,
    },
  ],

  // [추가] 고객이 전달에 동의한 경우에만 내려오는 니즈 분석
  needsAnalysis: {
    productCategory: "토트백/쇼퍼백",
    preferredMaterial: "Leather",
    preferredSize: "Medium · Large",
    preferredColor: "Black · Cognac",
    comment: "실용적인 크기와 차분한 컬러를 선호합니다.",
  },

  // [추가] 제품 비교 요청일 때만 사용하는 비교 정보
  comparison: {
    summary: [
      "브라운 제품은 클래식한 비세토스 패턴이 특징입니다.",
      "블랙 제품은 모던하고 간결한 스타일이 특징입니다.",
    ],
  },
};

/**
 * 직원 상담 요청 상세 화면
 * 고객이 전달에 동의한 상담 정보만 읽기 전용으로 표시한다.
 */
function StaffRequestDetail({
  requestId,
  onEndConsultation,
  onSettings,
}) {
  // [추가] API 연결 전 선택된 요청 ID를 임시 상세 데이터에 반영
  const requestDetail = {
    ...TEMP_REQUEST_DETAIL,
    requestId: requestId ?? TEMP_REQUEST_DETAIL.requestId,
  };

  // [추가] 최대 3개의 제품 슬롯 구성
  const productSlots = Array.from(
    { length: 3 },
    (_, index) => requestDetail.products.slice(0, 3)[index] ?? null,
  );

  /**
   * 상담 종료 버튼 클릭 시 현재 requestId를 부모로 전달한다.
   */
  const handleEndConsultation = () => {
    onEndConsultation?.(requestDetail.requestId);
  };

  return (
    <main className="staff-request-detail">
      {/* [추가] 상세 화면 상단 헤더 */}
      <header className="staff-request-detail__header">
        <img
          className="staff-request-detail__logo"
          src={logoKnoq}
          alt="KNOQ"
        />

        <button
          className="staff-request-detail__setting-button"
          type="button"
          onClick={onSettings}
          aria-label="직원 설정 열기"
        >
          <img
            className="staff-request-detail__setting-icon"
            src={settingIcon}
            alt=""
            aria-hidden="true"
          />
        </button>
      </header>

      {/* [추가] 고객 닉네임 기반 상담 요청 제목 */}
      <h1 className="staff-request-detail__title">
        {requestDetail.nickname}님의 상담요청
      </h1>

      <div className="staff-request-detail__content">
        {/* [추가] 도움 유형 표시 영역 */}
        <section className="staff-request-detail__section">
          <h2 className="staff-request-detail__section-title">
            도움 유형
          </h2>

          <div
            className="staff-request-detail__help-types"
            aria-label="고객이 선택한 도움 유형"
          >
            {HELP_TYPES.map((helpType) => {
              const isSelected =
                helpType.id === requestDetail.helpType;

              return (
                <div
                  className={`staff-request-detail__help-type ${
                    isSelected
                      ? "staff-request-detail__help-type--selected"
                      : ""
                  }`}
                  key={helpType.id}
                >
                  {helpType.label}
                </div>
              );
            })}
          </div>
        </section>

        {/* [추가] 상담 제품 영역 */}
        <section className="staff-request-detail__section staff-request-detail__product-section">
          <h2 className="staff-request-detail__section-title">
            제품
          </h2>

          <div className="staff-request-detail__products">
            {productSlots.map((product, index) =>
              product ? (
                <div
                  className="staff-request-detail__product"
                  key={product.productId}
                >
                  <img
                    className="staff-request-detail__product-image"
                    src={product.imageUrl}
                    alt={product.productName}
                  />
                </div>
              ) : (
                <div
                  className="staff-request-detail__product staff-request-detail__product--empty"
                  key={`empty-product-${index}`}
                  aria-label="첨부된 제품 없음"
                >
                  <span
                    className="staff-request-detail__plus"
                    aria-hidden="true"
                  />
                </div>
              ),
            )}
          </div>
        </section>

        {/* [추가] 라이프스타일 및 니즈 분석 영역 */}
        <section className="staff-request-detail__analysis-section">
          <h2 className="staff-request-detail__analysis-title">
            {requestDetail.nickname}님의 라이프스타일 및 니즈
          </h2>

          <div className="staff-request-detail__analysis-card">
            {/* [추가] 라이프스타일 태그 */}
            <div className="staff-request-detail__lifestyle">
              <span className="staff-request-detail__analysis-label">
                라이프스타일
              </span>

              <div className="staff-request-detail__lifestyle-tags">
                {requestDetail.lifestyleTags.map((tag) => (
                  <span
                    className="staff-request-detail__lifestyle-tag"
                    key={tag}
                  >
                    {LIFESTYLE_TAG_LABELS[tag] ?? tag}
                  </span>
                ))}
              </div>
            </div>

            {/* [추가] 고객이 공유에 동의한 니즈 분석 */}
            {requestDetail.needsAnalysis ? (
              <div className="staff-request-detail__needs">
                <h3 className="staff-request-detail__needs-title">
                  니즈
                </h3>

                <div className="staff-request-detail__needs-grid">
                  <div className="staff-request-detail__needs-item">
                    <span className="staff-request-detail__needs-label">
                      카테고리
                    </span>
                    <span className="staff-request-detail__needs-value">
                      {requestDetail.needsAnalysis.productCategory}
                    </span>
                  </div>

                  <div className="staff-request-detail__needs-item">
                    <span className="staff-request-detail__needs-label">
                      소재
                    </span>
                    <span className="staff-request-detail__needs-value">
                      {requestDetail.needsAnalysis.preferredMaterial}
                    </span>
                  </div>

                  <div className="staff-request-detail__needs-item">
                    <span className="staff-request-detail__needs-label">
                      사이즈
                    </span>
                    <span className="staff-request-detail__needs-value">
                      {requestDetail.needsAnalysis.preferredSize}
                    </span>
                  </div>

                  <div className="staff-request-detail__needs-item">
                    <span className="staff-request-detail__needs-label">
                      컬러
                    </span>
                    <span className="staff-request-detail__needs-value">
                      {requestDetail.needsAnalysis.preferredColor}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="staff-request-detail__needs-empty">
                공유된 니즈 분석이 없습니다.
              </p>
            )}
          </div>
        </section>

        {/* [추가] 제품 비교 요청일 때만 비교 정보 표시 */}
        {requestDetail.helpType === "PRODUCT_COMPARISON" &&
          requestDetail.comparison && (
            <section className="staff-request-detail__comparison">
              <h2 className="staff-request-detail__comparison-title">
                제품 비교
              </h2>

              <ul className="staff-request-detail__comparison-list">
                {requestDetail.comparison.summary.map((summary) => (
                  <li key={summary}>{summary}</li>
                ))}
              </ul>
            </section>
          )}

        {/* [추가] 상담 종료 화면 이동 버튼 */}
        <button
          className="staff-request-detail__end-button"
          type="button"
          onClick={handleEndConsultation}
        >
          상담 종료하기
        </button>
      </div>
    </main>
  );
}

export default StaffRequestDetail;