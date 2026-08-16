import "./StaffConsultationEnd.css";
import consultationEndIcon from "../../assets/icons/consultation-end-icon.svg";

/**
 * 직원 상담 종료 확인 화면
 * 상담 종료를 확정하면 현재 요청 ID를 부모 컴포넌트로 전달한다.
 */
function StaffConsultationEnd({ requestId, onConfirmEnd, onContinue }) {
  /**
   * 상담 종료를 확정하고 요청 상태를 COMPLETED로 변경한다.
   */
  const handleConfirmEnd = () => {
    setTimeout(() => {
      onConfirmEnd?.(requestId);
    }, 120);
  };

  /**
   * 상담을 계속하기 위해 이전 화면으로 돌아간다.
   */
  const handleContinue = () => {
    onContinue?.();
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
      </div>

      <div className="staff-consultation-end__buttons">
        <button
          className="staff-consultation-end__button staff-consultation-end__button--continue"
          type="button"
          onClick={handleContinue}
        >
          상담 계속하기
        </button>

        <button
          className="staff-consultation-end__button staff-consultation-end__button--end"
          type="button"
          onClick={handleConfirmEnd}
        >
          상담 종료하기
        </button>
      </div>
    </main>
  );
}

export default StaffConsultationEnd;
