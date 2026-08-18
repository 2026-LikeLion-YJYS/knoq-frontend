// 공통 메인 헤더 컴포넌트
// KNOQ 로고와 알림, 설정 버튼을 표시합니다.
// [추가] 설정 버튼 클릭 시 종료 확인 모달(ExitModal)을 함께 엽니다.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MainHeader.css";

import logoKnoq from "../../assets/icons/knoq-newlogo.svg";
import notificationIcon from "../../assets/icons/notification.svg";
import settingIcon from "../../assets/icons/setting.svg";
import ExitModal from "../../pages/exit/ExitModal";

function MainHeader({
  onLogoClick,
  onNotificationClick,
  onSettingClick,
  isLoggedIn = false, // TODO: 로그인 상태 관리 붙으면 그 값으로 교체
}) {
  const navigate = useNavigate();
  const [isExitOpen, setIsExitOpen] = useState(false);

  // [추가] 종료 시 이동할 첫 화면 경로 (App.jsx의 Onboarding1 라우트와 동일)
  const ENTRY_PATH = "/onboarding";

  const handleSettingClick = () => {
    onSettingClick?.(); // 기존 동작이 있었다면 유지
    setIsExitOpen(true);
  };

  const handleEndSession = () => {
    // TODO: 로그인 상태면 로그아웃 처리, 비로그인 상태면 탐색 기록 초기화 처리
    setIsExitOpen(false);
    navigate(ENTRY_PATH);
  };

  return (
    <header className="main-header">
      {/* [추가] KNOQ 로고 */}
      <button
        type="button"
        className="main-header__logo-button"
        onClick={onLogoClick}
        aria-label="KNOQ 홈"
      >
        <img src={logoKnoq} alt="KNOQ" className="main-header__logo" />
      </button>

      {/* [추가] 알림 / 설정 아이콘 */}
      <div className="main-header__actions">
        <button
          type="button"
          className="main-header__icon-button"
          onClick={onNotificationClick}
          aria-label="알림"
        >
          <img src={notificationIcon} alt="" className="main-header__icon" />
        </button>

        <button
          type="button"
          className="main-header__icon-button"
          onClick={handleSettingClick}
          aria-label="설정"
        >
          <img src={settingIcon} alt="" className="main-header__icon" />
        </button>
      </div>

      {/* [추가] 쇼핑 종료 확인 모달 */}
      <ExitModal
        isOpen={isExitOpen}
        isLoggedIn={isLoggedIn}
        onContinue={() => setIsExitOpen(false)}
        onEndSession={handleEndSession}
      />
    </header>
  );
}

export default MainHeader;