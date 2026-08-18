// 쇼핑 종료 확인 모달
// 설정아이콘 클릭 시 표시 로그인 여부에 따라 문구/버튼 크기가 달라짐

import { createPortal } from "react-dom";
import "./ExitModal.css";

function ExitModal({
  isOpen,
  isLoggedIn = false,
  onContinue,
  onEndSession,
}) {
  if (!isOpen) return null;

  const variantClass = isLoggedIn ? "exit-modal--logged-in" : "exit-modal--guest";

  return createPortal(
    <div className="exit-modal-overlay" onClick={onContinue}>
      <div
        className={`exit-modal ${variantClass}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* 안내 문구 영역 */}
        <div className="exit-modal__text-group">
          <p className="exit-modal__title">쇼핑을 종료하시겠어요?</p>

          {isLoggedIn ? (
            <p className="exit-modal__description">
              탐색 기록과 저장한 제품은 안전하게 저장됩니다.
              <br />
              다음 방문에도 이어서 확인할 수 있어요.
            </p>
          ) : (
            <p className="exit-modal__description">
              로그인하지 않은 상태에서는 탐색기록이 저장되지 않습니다.
              <br />
              종료하면 현재 탐색 기록이 모두 사라집니다.
            </p>
          )}
        </div>

        {/* 버튼 영역 */}
        <div className="exit-modal__actions">
          <div className="exit-modal__button-row">
            <button
              type="button"
              className="exit-modal__button exit-modal__button--secondary"
              onClick={onContinue}
            >
              계속 쇼핑하기
            </button>
            <button
              type="button"
              className="exit-modal__button exit-modal__button--primary"
              onClick={onEndSession}
            >
              {isLoggedIn ? "로그아웃" : "기록지우고 종료하기"}
            </button>
          </div>

          <p className="exit-modal__caption">
            {isLoggedIn
              ? "1시간 동안 활동이 없으면 자동으로 로그아웃됩니다."
              : "1시간 동안 활동이 없으면 자동으로 종료됩니다."}
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ExitModal;