// [추가] 상담 요청 완료 아이콘 사용
import helpCompleteIcon from "../../assets/icons/help-complete.svg";

import "./HelpComplete.css";

/**
 * [추가] 상담 요청 완료 화면
 * 상담 요청 성공 후 어드바이저 안내와 이동 버튼을 표시합니다.
 */
function HelpComplete({ onGoHome, onViewNotifications }) {
  return (
    <div className="help-complete-page">
      {/* [추가] 상담 요청 완료 안내 */}
      <main className="help-complete-content">
        <div className="help-complete-guide">
          {/* [추가] 상담 요청 완료 아이콘 */}
          <img
            className="help-complete-icon"
            src={helpCompleteIcon}
            alt=""
          />

          {/* [추가] 상담 요청 완료 문구 */}
          <div className="help-complete-text">
            <h1>상담 요청 완료</h1>

            <p>
              어드바이저가 제품 실물을 준비하여
              <br />
              고객님의 위치로 다가갑니다.
            </p>
          </div>
        </div>

        {/* [추가] 완료 화면 하단 이동 버튼 */}
        <div className="help-complete-actions">
          <button
            className="help-complete-home-button"
            type="button"
            onClick={onGoHome}
          >
            홈으로 가기
          </button>

          <button
            className="help-complete-notification-button"
            type="button"
            onClick={onViewNotifications}
          >
            알림보기
          </button>
        </div>
      </main>
    </div>
  );
}

export default HelpComplete;