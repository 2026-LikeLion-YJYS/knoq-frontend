// [수정] POS 종료 요청 상태와 중복 요청 방지를 위한 React 기능
import { useRef, useState } from "react";

// [추가] 직원 POS 종료 API
import { deleteStaffSession } from "../../api/staffApi";

// [추가] POS 종료 확인 모달
import StaffExitModal from "./StaffExitModal";

// [추가] 직원 상담 요청 목록 화면 스타일
import "./StaffRequests.css";

// [추가] 아이콘
import settingIcon from "../../assets/icons/setting.svg";
import logoKnoq from "../../assets/icons/logo-knoq.svg";
import requestLine from "../../assets/icons/request-line.svg";

// [추가] API 연동 전 직원 요청 목록 확인용 임시 데이터
const TEMP_REQUESTS = [
  {
    requestId: "req_29",
    nickname: "김다현",
    helpType: "STYLING_RECOMMENDATION",
    lifestyleTags: ["MINIMAL", "FORMAL"],
    productCount: 3,
    status: "REQUESTED",
    requestedAt: "2026-08-16T20:30:00",
  },
  {
    requestId: "req_28",
    nickname: "김다현",
    helpType: "PRODUCT_RECOMMENDATION",
    lifestyleTags: ["MINIMAL", "FORMAL"],
    productCount: 1,
    status: "REQUESTED",
    requestedAt: "2026-08-16T20:20:00",
  },
  {
    requestId: "req_27",
    nickname: "김다현",
    helpType: "PRODUCT_COMPARISON",
    lifestyleTags: ["MINIMAL", "FORMAL"],
    productCount: 2,
    status: "REQUESTED",
    requestedAt: "2026-08-16T20:10:00",
  },
];

// [추가] API 도움 유형 enum을 화면 문구로 변환
const HELP_TYPE_LABELS = {
  PRODUCT_RECOMMENDATION: "제품 추천",
  PRODUCT_COMPARISON: "제품 비교",
  STYLING_RECOMMENDATION: "스타일링 추천",
  PRODUCT_INFO: "제품 정보",
};

// [추가] API 라이프스타일 enum을 화면 문구로 변환
const LIFESTYLE_TAG_LABELS = {
  MINIMAL: "미니멀",
  CLASSIC: "클래식",
  CASUAL: "캐주얼",
  STREET: "스트리트",
  FORMAL: "포멀",
  TRENDY: "트렌디",
};

/**
 * 직원 상담 요청 목록 화면
 * 접수된 상담 요청을 최신순으로 표시한다.
 */
function StaffRequests({ onSelectRequest, onExitPos, requestStatuses = {} }) {
  // [추가] POS 종료 확인 모달 상태
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  // [추가] POS 종료 API 요청 진행 여부
  const [isExitSubmitting, setIsExitSubmitting] = useState(false);

  // [추가] POS 종료 실패 안내 메시지
  const [exitError, setExitError] = useState("");

  // [추가] 빠른 연속 클릭으로 발생하는 POS 종료 중복 요청을 차단합니다.
  const isExitSubmittingRef = useRef(false);

  // [수정] 임시 상태를 반영하고 요청 접수 시간을 기준으로 최신순 정렬
  const sortedRequests = TEMP_REQUESTS.map((request) => ({
    ...request,
    status: requestStatuses[request.requestId] ?? request.status,
  })).sort(
    (firstRequest, secondRequest) =>
      new Date(secondRequest.requestedAt) - new Date(firstRequest.requestedAt),
  );

  /**
   * 설정 아이콘을 누르면 POS 종료 확인 모달을 연다.
   */
  const handleOpenExitModal = () => {
    setExitError("");
    setIsExitModalOpen(true);
  };

  /**
   * 계속 상담하기를 누르면 모달만 닫는다.
   */
  const handleContinueConsultation = () => {
    if (isExitSubmittingRef.current) {
      return;
    }

    setExitError("");
    setIsExitModalOpen(false);
  };

  /**
   * [수정] POS 종료 API 성공 후 부모 컴포넌트에 상태 정리와 이동을 요청합니다.
   */
  const handleExitPos = async () => {
    if (isExitSubmittingRef.current) {
      return;
    }

    isExitSubmittingRef.current = true;
    setIsExitSubmitting(true);
    setExitError("");

    try {
      await deleteStaffSession();
      setIsExitModalOpen(false);
      onExitPos?.();
    } catch (error) {
      // [추가] 401은 공통 API 요청 함수가 직원 로그인 화면 이동까지 처리합니다.
      if (error?.status !== 401) {
        setExitError("POS 종료에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      isExitSubmittingRef.current = false;
      setIsExitSubmitting(false);
    }
  };

  /**
   * 상담 시작 버튼을 누르면 선택한 requestId를 부모로 전달한다.
   */
  const handleStartConsultation = (requestId) => {
    onSelectRequest?.(requestId);
  };

  return (
    <main className="staff-requests">
      {/* [추가] 직원 요청 목록 상단 헤더 */}
      <header className="staff-requests__header">
        <img className="staff-requests__logo" src={logoKnoq} alt="KNOQ" />

        <button
          className="staff-requests__setting-button"
          type="button"
          onClick={handleOpenExitModal}
          aria-label="직원 설정 열기"
        >
          <img
            className="staff-requests__setting-icon"
            src={settingIcon}
            alt=""
            aria-hidden="true"
          />
        </button>
      </header>

      {/* [추가] 요청 목록 제목 */}
      <h1 className="staff-requests__title">현재 접수된 요청 내역</h1>

      {/* [추가] 접수된 요청 카드 목록 */}
      <section className="staff-requests__list" aria-label="접수된 상담 요청">
        {sortedRequests.length > 0 ? (
          sortedRequests.map((request) => (
            <article className="staff-request-card" key={request.requestId}>
              <div className="staff-request-card__information">
                {/* [추가] 도움 유형 */}
                <div className="staff-request-card__heading">
                  <h2 className="staff-request-card__type">
                    {HELP_TYPE_LABELS[request.helpType] ?? request.helpType}
                  </h2>
                </div>

                {/* [추가] 고객 닉네임 */}
                <div className="staff-request-card__row">
                  <span className="staff-request-card__label">고객</span>

                  <img
                    className="staff-request-card__line"
                    src={requestLine}
                    alt=""
                    aria-hidden="true"
                  />

                  <p className="staff-request-card__nickname">
                    {request.nickname}
                    <span className="staff-request-card__nickname-suffix">
                      {" "}
                      님
                    </span>
                  </p>
                </div>

                {/* [추가] 고객 라이프스타일 태그 */}
                <div className="staff-request-card__row">
                  <span className="staff-request-card__label">
                    라이프스타일
                  </span>

                  <img
                    className="staff-request-card__line"
                    src={requestLine}
                    alt=""
                    aria-hidden="true"
                  />

                  <div className="staff-request-card__tags">
                    {request.lifestyleTags.map((tag) => (
                      <span className="staff-request-card__tag" key={tag}>
                        {LIFESTYLE_TAG_LABELS[tag] ?? tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* [수정] 요청 상태에 따른 상담 버튼 */}
              <button
                className="staff-request-card__start-button"
                type="button"
                disabled={request.status === "COMPLETED"}
                onClick={() => handleStartConsultation(request.requestId)}
              >
                {request.status === "COMPLETED" ? "상담 완료" : "상담 시작하기"}
              </button>
            </article>
          ))
        ) : (
          // [추가] 접수된 요청이 없을 때 표시
          <div className="staff-requests__empty">
            현재 접수된 요청이 없습니다.
          </div>
        )}
      </section>

      {/* [추가] POS 종료 확인 모달 */}
      <StaffExitModal
        isOpen={isExitModalOpen}
        onContinue={handleContinueConsultation}
        onExit={handleExitPos}
        isSubmitting={isExitSubmitting}
        errorMessage={exitError}
      />
    </main>
  );
}

export default StaffRequests;
