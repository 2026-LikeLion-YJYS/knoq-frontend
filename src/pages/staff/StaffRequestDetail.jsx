// [추가] URL 요청 ID 조회와 상세 API 상태 관리를 위한 React 기능
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// [추가] 직원 상담 요청 상세 조회 API
import { getStaffRequestDetail } from "../../api/staffApi";

// [추가] API가 반환한 상대 상품 이미지 경로에 백엔드 Base URL을 연결합니다.
import { createApiAssetUrl } from "../../api/apiClient";

// [추가] 직원 상담 요청 상세 화면 스타일
import "./StaffRequestDetail.css";

// [추가] 상단 아이콘
import settingIcon from "../../assets/icons/setting.svg";
// [수정] 직원 상세 화면에도 신규 KNOQ 로고 에셋을 사용합니다.
import logoKnoq from "../../assets/icons/knoq-newlogo.svg";

// [추가] 화면에 표시할 도움 유형 목록
const HELP_TYPES = [
  { id: "PRODUCT_RECOMMENDATION", label: "제품 추천" },
  { id: "PRODUCT_COMPARISON", label: "제품 비교" },
  { id: "STYLING_RECOMMENDATION", label: "스타일링 추천" },
  { id: "PRODUCT_INFO", label: "제품 정보" },
];

// [추가] 라이프스타일 enum을 화면 문구로 변환합니다.
const LIFESTYLE_TAG_LABELS = {
  MINIMAL: "미니멀",
  CLASSIC: "클래식",
  CASUAL: "캐주얼",
  STREET: "스트리트",
  FORMAL: "포멀",
  TRENDY: "트렌디",
};

// [추가] 상담을 종료할 수 없는 상태입니다.
const END_DISABLED_STATUSES = ["COMPLETED", "EXPIRED"];

/**
 * 직원 상담 요청 상세 화면
 * URL의 requestId로 고객이 전달에 동의한 상담 정보를 조회해 표시한다.
 */
function StaffRequestDetail({ onEndConsultation, onSettings }) {
  // [추가] 새로고침 후에도 유지되는 URL의 직원 상담 요청 ID
  const { requestId } = useParams();

  // [추가] 서버에서 조회한 직원 상담 요청 상세
  const [requestDetail, setRequestDetail] = useState(null);

  // [추가] 직원 상담 요청 상세 조회 진행 여부
  const [isDetailLoading, setIsDetailLoading] = useState(true);

  // [추가] 직원 상담 요청 상세 조회 실패 안내 메시지
  const [detailError, setDetailError] = useState("");

  // [추가] 상세 조회 재시도 횟수
  const [detailRetryCount, setDetailRetryCount] = useState(0);

  /**
   * [추가] URL의 requestId가 바뀌거나 재시도할 때 상담 요청 상세를 조회합니다.
   */
  useEffect(() => {
    let isActive = true;

    /**
     * [추가] 직원 상담 요청 상세 API 응답을 화면 상태에 반영합니다.
     */
    const loadRequestDetail = async () => {
      try {
        const response = await getStaffRequestDetail(requestId);

        if (!isActive) {
          return;
        }

        setRequestDetail(response);
        setDetailError("");
      } catch (error) {
        if (isActive && error?.status !== 401) {
          setRequestDetail(null);
          setDetailError(
            "상담 요청 정보를 불러오지 못했습니다. 다시 시도해주세요.",
          );
        }
      } finally {
        if (isActive) {
          setIsDetailLoading(false);
        }
      }
    };

    loadRequestDetail();

    // [추가] 화면 이탈 후 완료된 요청이 상태를 변경하지 않도록 처리합니다.
    return () => {
      isActive = false;
    };
  }, [requestId, detailRetryCount]);

  /**
   * [추가] 상세 조회 실패 후 같은 requestId로 다시 요청합니다.
   */
  const handleRetryDetail = () => {
    setIsDetailLoading(true);
    setDetailError("");
    setDetailRetryCount((previousCount) => previousCount + 1);
  };

  /**
   * [수정] 상담 종료 버튼 클릭 시 URL의 requestId를 부모로 전달합니다.
   */
  const handleEndConsultation = () => {
    if (!requestId || END_DISABLED_STATUSES.includes(requestDetail?.status)) {
      return;
    }

    onEndConsultation?.(requestId);
  };

  /**
   * [추가] 상세 화면에서 공통으로 사용하는 상단 헤더를 표시합니다.
   */
  const renderHeader = () => (
    <header className="staff-request-detail__header">
      <img className="staff-request-detail__logo" src={logoKnoq} alt="KNOQ" />

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
  );

  if (isDetailLoading) {
    return (
      <main className="staff-request-detail">
        {renderHeader()}

        {/* [추가] 상담 요청 상세 최초 조회 중 표시 */}
        <div className="staff-request-detail__content">
          <p className="staff-request-detail__needs-empty">
            상담 요청 정보를 불러오는 중입니다.
          </p>
        </div>
      </main>
    );
  }

  if (detailError || !requestDetail) {
    return (
      <main className="staff-request-detail">
        {renderHeader()}

        {/* [추가] 상담 요청 상세 조회 실패 및 재시도 표시 */}
        <div className="staff-request-detail__content">
          <p className="staff-request-detail__needs-empty" role="alert">
            {detailError || "상담 요청 정보를 확인할 수 없습니다."}
          </p>

          <button
            className="staff-request-detail__end-button"
            type="button"
            onClick={handleRetryDetail}
          >
            다시 시도하기
          </button>
        </div>
      </main>
    );
  }

  // [수정] 실제 products 응답으로 최대 3개의 제품 슬롯을 구성합니다.
  const products = Array.isArray(requestDetail.products)
    ? requestDetail.products
    : [];
  const productSlots = Array.from(
    { length: 3 },
    (_, index) => products.slice(0, 3)[index] ?? null,
  );
  const lifestyleTags = Array.isArray(requestDetail.lifestyleTags)
    ? requestDetail.lifestyleTags
    : [];
  const isEndDisabled = END_DISABLED_STATUSES.includes(requestDetail.status);

  return (
    <main className="staff-request-detail">
      {renderHeader()}

      {/* [수정] 실제 응답의 고객 닉네임으로 상담 요청 제목을 표시합니다. */}
      <h1 className="staff-request-detail__title">
        {requestDetail.nickname || "고객"}님의 상담요청
      </h1>

      <div className="staff-request-detail__content">
        {/* [수정] 실제 응답의 도움 유형 표시 영역 */}
        <section className="staff-request-detail__section">
          <h2 className="staff-request-detail__section-title">도움 유형</h2>

          <div
            className="staff-request-detail__help-types"
            aria-label="고객이 선택한 도움 유형"
          >
            {HELP_TYPES.map((helpType) => {
              const isSelected = helpType.id === requestDetail.helpType;

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

        {/* [수정] 실제 응답의 상담 제품 영역 */}
        <section className="staff-request-detail__section staff-request-detail__product-section">
          <h2 className="staff-request-detail__section-title">제품</h2>

          <div className="staff-request-detail__products">
            {productSlots.map((product, index) => {
              // [수정] 직원 상담 상세 응답의 thumbnailUrl을 실제 백엔드 이미지 주소로 변환합니다.
              const productImage = product
                ? createApiAssetUrl(product.thumbnailUrl)
                : null;

              if (product && productImage) {
                return (
                  <div
                    className="staff-request-detail__product"
                    key={product.productId}
                  >
                    <img
                      className="staff-request-detail__product-image"
                      src={productImage}
                      alt={product.name || "상담 요청 상품"}
                    />
                  </div>
                );
              }

              if (product) {
                return (
                  <div
                    className="staff-request-detail__product staff-request-detail__product--empty"
                    key={product.productId}
                    aria-label={`${product.name || product.productId} 이미지 없음`}
                    title={product.name || product.productId}
                  />
                );
              }

              return (
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
              );
            })}
          </div>
        </section>

        {/* [수정] 실제 응답의 라이프스타일 및 니즈 분석 영역 */}
        <section className="staff-request-detail__analysis-section">
          <h2 className="staff-request-detail__analysis-title">
            {requestDetail.nickname || "고객"}님의 라이프스타일 및 니즈
          </h2>

          <div className="staff-request-detail__analysis-card">
            <div className="staff-request-detail__lifestyle">
              <span className="staff-request-detail__analysis-label">
                라이프스타일
              </span>

              <div className="staff-request-detail__lifestyle-tags">
                {lifestyleTags.map((tag) => (
                  <span
                    className="staff-request-detail__lifestyle-tag"
                    key={tag}
                  >
                    {LIFESTYLE_TAG_LABELS[tag] ?? tag}
                  </span>
                ))}
              </div>
            </div>

            {/* [수정] needsAnalysis가 null이면 기존 빈 상태 문구를 표시합니다. */}
            {requestDetail.needsAnalysis ? (
              <div className="staff-request-detail__needs">
                <h3 className="staff-request-detail__needs-title">니즈</h3>

                <div className="staff-request-detail__needs-grid">
                  <div className="staff-request-detail__needs-item">
                    <span className="staff-request-detail__needs-label">
                      카테고리
                    </span>
                    <span className="staff-request-detail__needs-value">
                      {requestDetail.needsAnalysis.productCategory || "-"}
                    </span>
                  </div>

                  <div className="staff-request-detail__needs-item">
                    <span className="staff-request-detail__needs-label">
                      소재
                    </span>
                    <span className="staff-request-detail__needs-value">
                      {requestDetail.needsAnalysis.preferredMaterial || "-"}
                    </span>
                  </div>

                  <div className="staff-request-detail__needs-item">
                    <span className="staff-request-detail__needs-label">
                      사이즈
                    </span>
                    <span className="staff-request-detail__needs-value">
                      {requestDetail.needsAnalysis.preferredSize || "-"}
                    </span>
                  </div>

                  <div className="staff-request-detail__needs-item">
                    <span className="staff-request-detail__needs-label">
                      컬러
                    </span>
                    <span className="staff-request-detail__needs-value">
                      {requestDetail.needsAnalysis.preferredColor || "-"}
                    </span>
                  </div>
                </div>

                {/* [추가] 서버가 전달한 니즈 분석 코멘트가 있으면 함께 표시합니다. */}
                {requestDetail.needsAnalysis.comment && (
                  <p className="staff-request-detail__needs-empty">
                    {requestDetail.needsAnalysis.comment}
                  </p>
                )}
              </div>
            ) : (
              <p className="staff-request-detail__needs-empty">
                공유된 니즈 분석이 없습니다.
              </p>
            )}
          </div>
        </section>

        {/* [수정] URL의 requestId로 상담 종료 화면에 이동합니다. */}
        <button
          className="staff-request-detail__end-button"
          type="button"
          disabled={isEndDisabled}
          onClick={handleEndConsultation}
        >
          {requestDetail.status === "COMPLETED"
            ? "상담 완료"
            : requestDetail.status === "EXPIRED"
              ? "요청 만료"
              : "상담 종료하기"}
        </button>
      </div>
    </main>
  );
}

export default StaffRequestDetail;
