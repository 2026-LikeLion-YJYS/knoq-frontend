// [수정] 요청 목록 조회, 폴링 및 중복 요청 방지를 위한 React 기능
import { useEffect, useRef, useState } from "react";

// [수정] 직원 요청 목록·상태 변경 및 POS 종료 API
import {
  deleteStaffSession,
  getStaffRequests,
  updateStaffRequestStatus,
} from "../../api/staffApi";

// [추가] POS 종료 확인 모달
import StaffExitModal from "./StaffExitModal";

// [추가] 직원 상담 요청 목록 화면 스타일
import "./StaffRequests.css";

// [추가] 아이콘
import settingIcon from "../../assets/icons/setting.svg";
// [수정] 직원 화면에도 신규 KNOQ 로고 에셋을 사용합니다.
import logoKnoq from "../../assets/icons/knoq-newlogo.svg";
import requestLine from "../../assets/icons/request-line.svg";

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

// [추가] 요청 목록을 다시 조회할 주기입니다.
const REQUEST_POLLING_INTERVAL = 3000;

// [추가] 상담을 시작하거나 이어갈 수 없는 종료 상태입니다.
const DISABLED_REQUEST_STATUSES = ["COMPLETED", "EXPIRED"];

/**
 * [추가] 요청 상태와 처리 여부에 맞는 버튼 문구를 반환합니다.
 */
const getRequestButtonLabel = (status, isSubmitting) => {
  if (isSubmitting) {
    return "처리 중...";
  }

  if (status === "IN_PROGRESS") {
    return "상담 계속하기";
  }

  if (status === "COMPLETED") {
    return "상담 완료";
  }

  if (status === "EXPIRED") {
    return "요청 만료";
  }

  return "상담 시작하기";
};

/**
 * 직원 상담 요청 목록 화면
 * 접수된 상담 요청을 최신순으로 표시한다.
 */
function StaffRequests({ onSelectRequest, onExitPos }) {
  // [추가] 서버에서 조회한 직원 상담 요청 목록
  const [requests, setRequests] = useState([]);

  // [추가] 최초 요청 목록 조회 진행 여부
  const [isRequestsLoading, setIsRequestsLoading] = useState(true);

  // [추가] 요청 목록 조회 실패 안내 메시지
  const [requestsError, setRequestsError] = useState("");

  // [추가] 상담 시작 상태 변경 실패 안내 메시지
  const [requestActionError, setRequestActionError] = useState("");

  // [추가] 현재 상담 시작 상태를 변경 중인 요청 ID
  const [submittingRequestId, setSubmittingRequestId] = useState(null);

  // [추가] 빠른 연속 클릭으로 같은 요청의 상태 변경이 중복되는 것을 차단합니다.
  const submittingRequestIdRef = useRef(null);

  // [추가] POS 종료 확인 모달 상태
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  // [추가] POS 종료 API 요청 진행 여부
  const [isExitSubmitting, setIsExitSubmitting] = useState(false);

  // [추가] POS 종료 실패 안내 메시지
  const [exitError, setExitError] = useState("");

  // [추가] 빠른 연속 클릭으로 발생하는 POS 종료 중복 요청을 차단합니다.
  const isExitSubmittingRef = useRef(false);

  // [추가] 서버 요청 목록을 요청 접수 시간 기준 최신순으로 정렬합니다.
  const sortedRequests = [...requests].sort(
    (firstRequest, secondRequest) =>
      new Date(secondRequest.requestedAt) - new Date(firstRequest.requestedAt),
  );

  /**
   * [추가] 화면 진입 즉시 요청 목록을 조회하고 이후 3초마다 다시 조회합니다.
   */
  useEffect(() => {
    let isActive = true;
    let isFetching = false;

    /**
     * [추가] 직원 요청 목록을 조회하고 서버의 requests 배열을 반영합니다.
     */
    const loadStaffRequests = async () => {
      if (isFetching) {
        return;
      }

      isFetching = true;

      try {
        const response = await getStaffRequests();

        if (!isActive) {
          return;
        }

        setRequests(Array.isArray(response?.requests) ? response.requests : []);
        setRequestsError("");
      } catch (error) {
        if (isActive && error?.status !== 401) {
          setRequestsError(
            "요청 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
          );
        }
      } finally {
        isFetching = false;

        if (isActive) {
          setIsRequestsLoading(false);
        }
      }
    };

    loadStaffRequests();

    const pollingInterval = window.setInterval(
      loadStaffRequests,
      REQUEST_POLLING_INTERVAL,
    );

    // [추가] 요청 목록 화면을 벗어나면 3초 폴링을 정리합니다.
    return () => {
      isActive = false;
      window.clearInterval(pollingInterval);
    };
  }, []);

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
   * [수정] 현재 상태에 필요한 변경 요청을 순차 실행한 뒤 상세 화면으로 이동합니다.
   */
  const handleStartConsultation = async (request) => {
    const { requestId, status } = request;

    if (
      submittingRequestIdRef.current === requestId ||
      DISABLED_REQUEST_STATUSES.includes(status)
    ) {
      return;
    }

    submittingRequestIdRef.current = requestId;
    setSubmittingRequestId(requestId);
    setRequestActionError("");

    try {
      if (status === "REQUESTED") {
        // [추가] REQUESTED는 ACCEPTED 완료 후 IN_PROGRESS를 순차 요청합니다.
        await updateStaffRequestStatus(requestId, "ACCEPTED");
        await updateStaffRequestStatus(requestId, "IN_PROGRESS");
      } else if (status === "ACCEPTED") {
        await updateStaffRequestStatus(requestId, "IN_PROGRESS");
      } else if (status !== "IN_PROGRESS") {
        return;
      }

      onSelectRequest?.(requestId);
    } catch (error) {
      // [추가] 401은 공통 API 요청 함수가 직원 로그인 화면 이동까지 처리합니다.
      if (error?.status !== 401) {
        setRequestActionError("상담을 시작하지 못했습니다. 다시 시도해주세요.");
      }
    } finally {
      submittingRequestIdRef.current = null;
      setSubmittingRequestId(null);
    }
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
        {/* [추가] 목록 조회 또는 상담 시작 실패 안내 */}
        {(requestsError || requestActionError) && (
          <div className="staff-requests__empty" role="alert">
            {requestsError || requestActionError}
          </div>
        )}

        {isRequestsLoading ? (
          // [추가] 최초 요청 목록 조회 중 표시
          <div className="staff-requests__empty">
            요청 목록을 불러오는 중입니다.
          </div>
        ) : sortedRequests.length > 0 ? (
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
                    {(request.lifestyleTags ?? []).map((tag) => (
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
                disabled={
                  DISABLED_REQUEST_STATUSES.includes(request.status) ||
                  submittingRequestId === request.requestId
                }
                onClick={() => handleStartConsultation(request)}
              >
                {getRequestButtonLabel(
                  request.status,
                  submittingRequestId === request.requestId,
                )}
              </button>
            </article>
          ))
        ) : !requestsError ? (
          // [추가] 접수된 요청이 없을 때 표시
          <div className="staff-requests__empty">
            현재 접수된 요청이 없습니다.
          </div>
        ) : null}
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
