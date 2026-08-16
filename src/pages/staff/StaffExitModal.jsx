import "./StaffExitModal.css";

/**
 * 직원 POS 종료 확인 모달
 * 상담 유지 또는 POS 종료 작업을 선택한다.
 */
function StaffExitModal({ isOpen, onContinue, onExit }) {
  if (!isOpen) {
    return null;
  }

  /**
   * POS 종료를 확정한다.
   */
  const handleExit = () => {
    onExit?.();
  };

  return (
    <div className="staff-exit-modal__overlay">
      <section
        className="staff-exit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-exit-modal-title"
      >
        <h2
          className="staff-exit-modal__title"
          id="staff-exit-modal-title"
        >
          업무를 어떻게 이어갈까요?
        </h2>

        <p className="staff-exit-modal__description">
          현재 상담을 계속하거나
          <br />
          POS에서 로그아웃할 수 있습니다.
        </p>

        <div className="staff-exit-modal__buttons">
          <button
            className="staff-exit-modal__button staff-exit-modal__button--continue"
            type="button"
            onClick={onContinue}
          >
            계속 상담하기
          </button>

          <button
            className="staff-exit-modal__button staff-exit-modal__button--exit"
            type="button"
            onClick={handleExit}
          >
            POS 종료하기
          </button>
        </div>
      </section>
    </div>
  );
}

export default StaffExitModal;