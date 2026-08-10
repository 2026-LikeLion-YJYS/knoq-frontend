// 공통 메인 헤더 컴포넌트
// KNOQ 로고와 알림, 설정 버튼을 표시합니다.

import "./MainHeader.css";

import logoKnoq from "../../assets/icons/logo-knoq.svg";
import notificationIcon from "../../assets/icons/notification.svg";
import settingIcon from "../../assets/icons/setting.svg";

function MainHeader({
  onLogoClick,
  onNotificationClick,
  onSettingClick,
}) {
  return (
    <header className="main-header">
      {/* [추가] KNOQ 로고 */}
      <button
        type="button"
        className="main-header__logo-button"
        onClick={onLogoClick}
        aria-label="KNOQ 홈"
      >
        <img
          src={logoKnoq}
          alt="KNOQ"
          className="main-header__logo"
        />
      </button>

      {/* [추가] 알림 / 설정 아이콘 */}
      <div className="main-header__actions">
        <button
          type="button"
          className="main-header__icon-button"
          onClick={onNotificationClick}
          aria-label="알림"
        >
          <img
            src={notificationIcon}
            alt=""
            className="main-header__icon"
          />
        </button>

        <button
          type="button"
          className="main-header__icon-button"
          onClick={onSettingClick}
          aria-label="설정"
        >
          <img
            src={settingIcon}
            alt=""
            className="main-header__icon"
          />
        </button>
      </div>
    </header>
  );
}

export default MainHeader;