// [추가] URL 요청 ID와 상담 종료 요청 상태 관리를 위한 React 기능
import { useRef, useState } from "react";
import { useParams } from "react-router-dom";

// [추가] 직원 상담 요청 상태 변경 API
import { updateStaffRequestStatus } from "../../api/staffApi";

import "./StaffConsultationEnd.css";
import consultationEndIcon from "../../assets/icons/consultation-end-icon.svg";

/**
 * 직원 상담 종료 확인 화면
 * 상담 종료를 확정하면 URL의 요청 ID를 COMPLETED 상태로 변경한다.
 */
function StaffConsultationEnd({ onConfirmEnd, onContinue }) {
  // [추가] 새로고침 후에도 유지되는 URL의 직원 상담 요청 ID
  const { requestId } = useParams();

  // [추가] 상담 종료 상태 변경 요청 진행 여부
  const [isEndSubmitting, setIsEndSubmitting] = useState(false);

  // [추가] 상담 종료 실패 안내 메시지
  const [endError, setEndError] = useState("");

  // [추가] 빠른 연속 클릭으로 발생하는 COMPLETED 중복 요청을 차단합니다.
  const isEndSubmittingRef = useRef(false);

  /**
   * [수정] 상담 종료를 확정하고 실제 요청 상태를 COMPLETED로 변경합니다.
   */
  const handleConfirmEnd = async () => {
    if (isEndSubmittingRef.current || !requestId) {
      return;
    }

    isEndSubmittingRef.current = true;
    setIsEndSubmitting(true);
    setEndError("");

    try {
      await updateStaffRequestStatus(requestId, "COMPLETED");
      onConfirmEnd?.(requestId);
    } catch (error) {
      // [추가] 401은 공통 API 요청 함수가 직원 로그인 화면 이동까지 처리합니다.
      if (error?.status !== 401) {
        setEndError("상담 종료에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      isEndSubmittingRef.current = false;
      setIsEndSubmitting(false);
    }
  };

  /**
   * [수정] 상담을 계속하기 위해 같은 requestId의 상세 URL로 돌아갑니다.
   */
  const handleContinue = () => {
    if (isEndSubmittingRef.current || !requestId) {
      return;
    }

    onContinue?.(requestId);
  };

  return (
    <main className="staff-consultation-end">
      <div className="staff-consultation-end__content">
        <img
          className="staff-consultation-end__icon"
          src={consultationEndIcon}
          alt=""
          aria-hidden="true"
        />

        <h1 className="staff-consultation-end__title">
          상담을 종료하시겠습니까?
        </h1>

        {/* [추가] COMPLETED 상태 변경 실패 시 화면을 유지하고 안내합니다. */}
        {endError && <p role="alert">{endError}</p>}
      </div>

      <div className="staff-consultation-end__buttons">
        <button
          className="staff-consultation-end__button staff-consultation-end__button--continue"
          type="button"
          disabled={isEndSubmitting}
          onClick={handleContinue}
        >
          상담 계속하기
        </button>

        <button
          className="staff-consultation-end__button staff-consultation-end__button--end"
          type="button"
          disabled={isEndSubmitting}
          onClick={handleConfirmEnd}
        >
          {isEndSubmitting ? "종료 중..." : "상담 종료하기"}
        </button>
      </div>
    </main>
  );
}

export default StaffConsultationEnd;
