// 공통 메인 헤더 컴포넌트
// KNOQ 로고와 알림, 설정 버튼을 표시합니다.
// [추가] 설정 버튼 클릭 시 종료 확인 모달(ExitModal)을 함께 엽니다.

// [수정] 종료 버튼의 빠른 연속 클릭을 막기 위해 useRef를 함께 사용합니다.
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MainHeader.css";

// [수정] 기존 KNOQ 로고를 신규 로고 에셋으로 교체합니다.
import logoKnoq from "../../assets/icons/knoq-newlogo.svg";
import notificationIcon from "../../assets/icons/notification.svg";
import settingIcon from "../../assets/icons/setting.svg";
import ExitModal from "../../pages/exit/ExitModal";
// [추가] 고객 저장 범위에 맞는 종료·로그아웃 API를 사용합니다.
import {
  finishCustomerSession,
  logoutCustomerSession,
} from "../../api/sessionApi";
// [추가] 종료 성공 후에만 고객 storage를 정리합니다.
import { clearCustomerStorage, getSessionId } from "../../utils/storage";

/**
 * [추가] 종료 API 오류에서 모달에 표시할 재시도 안내 문구를 구성합니다.
 */
const getSessionEndErrorMessage = (error, isLoggedIn) => {
  return (
    error?.data?.message ??
    error?.data?.error ??
    (isLoggedIn
      ? "로그아웃하지 못했습니다. 다시 시도해주세요."
      : "쇼핑을 종료하지 못했습니다. 다시 시도해주세요.")
  );
};

function MainHeader({
  onLogoClick,
  onNotificationClick,
  onSettingClick,
  isLoggedIn = false,
  onLogout, // [수정] 종료 성공 후 App.jsx의 고객 로그인 상태를 초기화하기 위해 필요
}) {
  const navigate = useNavigate();
  const [isExitOpen, setIsExitOpen] = useState(false);
  // [추가] 종료 요청 진행 상태와 실패 안내를 관리합니다.
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [sessionEndError, setSessionEndError] = useState("");

  // [추가] React state 반영 전 발생하는 빠른 연속 클릭도 즉시 차단합니다.
  const isEndingSessionRef = useRef(false);

  // [추가] 종료 시 이동할 첫 화면 경로 (App.jsx의 Onboarding1 라우트와 동일)
  const ENTRY_PATH = "/onboarding";

  const handleSettingClick = () => {
    // [추가] 저장 범위 복원이 끝나기 전에는 잘못된 종료 API를 선택하지 않습니다.
    if (isLoggedIn === null) {
      return;
    }

    onSettingClick?.(); // 기존 동작이 있었다면 유지
    setSessionEndError("");
    setIsExitOpen(true);
  };

  /**
   * [추가] 계속 쇼핑하기를 누르면 API 호출 없이 종료 모달만 닫습니다.
   */
  const handleContinueShopping = () => {
    if (isEndingSessionRef.current) {
      return;
    }

    setSessionEndError("");
    setIsExitOpen(false);
  };

  /**
   * [수정] 저장 범위에 맞는 종료 API가 성공한 뒤에만 storage를 정리하고 이동합니다.
   */
  const handleEndSession = async () => {
    if (isEndingSessionRef.current) {
      return;
    }

    const sessionId = getSessionId();

    if (!sessionId) {
      setSessionEndError("세션 정보를 확인할 수 없습니다. 다시 시작해주세요.");
      return;
    }

    isEndingSessionRef.current = true;
    setIsEndingSession(true);
    setSessionEndError("");

    try {
      if (isLoggedIn) {
        await logoutCustomerSession(sessionId);
      } else {
        await finishCustomerSession(sessionId);
      }

      // [추가] 서버 종료 성공 이후에만 고객 세션 관련 storage를 삭제합니다.
      clearCustomerStorage();
      onLogout?.();

      isEndingSessionRef.current = false;
      setIsEndingSession(false);
      setIsExitOpen(false);
      navigate(ENTRY_PATH);
    } catch (error) {
      setSessionEndError(getSessionEndErrorMessage(error, isLoggedIn));
    } finally {
      if (isEndingSessionRef.current) {
        isEndingSessionRef.current = false;
        setIsEndingSession(false);
      }
    }
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
          disabled={isLoggedIn === null}
        >
          <img src={settingIcon} alt="" className="main-header__icon" />
        </button>
      </div>

      {/* [추가] 쇼핑 종료 확인 모달 */}
      <ExitModal
        isOpen={isExitOpen}
        isLoggedIn={isLoggedIn}
        isSubmitting={isEndingSession}
        errorMessage={sessionEndError}
        onContinue={handleContinueShopping}
        onEndSession={handleEndSession}
      />
    </header>
  );
}

export default MainHeader;
