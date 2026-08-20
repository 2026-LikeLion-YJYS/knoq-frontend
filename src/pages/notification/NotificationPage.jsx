// 알림 페이지
// [수정] 고객 상담 상태에 따라 서버에 쌓인 실제 알림을 보여줍니다.

// [수정] polling 중복 요청을 막기 위한 useRef를 함께 사용합니다.
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import backIcon from "../../assets/icons/backicon.svg";
import headsetIcon from "../../assets/icons/headset.svg";
// [추가] 고객 상담 알림 목록 조회 API를 사용합니다.
import { getNotifications } from "../../api/notificationApi";
import { formatRelativeTime } from "../../utils/formatRelativeTime";
// [추가] 세션 ID가 없을 때 잘못된 API 경로를 요청하지 않도록 확인합니다.
import { getSessionId } from "../../utils/storage";
import "./NotificationPage.css";

/**
 * [추가] 서버 상태 enum을 기존 알림 UI의 제목 문구로 변환합니다.
 */
const NOTIFICATION_TITLES = {
  REQUESTED: "상담 요청이 전달되었어요",
  ACCEPTED: "어드바이저가 확인했어요",
  IN_PROGRESS: "상담이 시작됐어요",
  COMPLETED: "상담이 종료됐어요",
  EXPIRED: "상담 요청이 만료됐어요",
};

/**
 * [추가] API 오류 응답에서 사용자가 다시 시도할 수 있는 안내 문구를 구성합니다.
 */
const getNotificationErrorMessage = (error) => {
  return (
    error?.data?.message ??
    error?.data?.error ??
    "알림을 불러오지 못했습니다. 다시 시도해주세요."
  );
};

function NotificationPage() {
  const navigate = useNavigate();

  // [추가] 서버에서 받은 실제 알림 목록과 조회 상태를 관리합니다.
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(() => Boolean(getSessionId()));
  const [errorMessage, setErrorMessage] = useState(() =>
    getSessionId() ? "" : "세션 정보를 확인할 수 없습니다. 다시 시작해주세요.",
  );
  const [retryCount, setRetryCount] = useState(0);

  // [추가] 이전 polling 요청이 완료되기 전에 같은 GET 요청이 중첩되지 않도록 Promise를 보관합니다.
  const notificationRequestRef = useRef(null);

  // [수정] 30초마다 상대시간 문구만 다시 계산합니다.
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => forceUpdate((v) => v + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  /**
   * [추가] 화면 진입 즉시 알림을 조회하고 이후 3초마다 polling합니다.
   * 화면 이탈 시 interval을 정리하고 완료된 요청이 state를 변경하지 않도록 막습니다.
   */
  useEffect(() => {
    let isActive = true;
    const sessionId = getSessionId();

    // [추가] 세션 ID가 없으면 잘못된 경로로 요청하거나 polling을 시작하지 않습니다.
    if (!sessionId) {
      return undefined;
    }

    const loadNotifications = async (showLoading = false) => {
      if (showLoading && isActive) {
        setIsLoading(true);
        setErrorMessage("");
      }

      try {
        // [추가] 진행 중인 요청이 있으면 새 요청을 만들지 않고 동일한 결과를 기다립니다.
        if (!notificationRequestRef.current) {
          notificationRequestRef.current = getNotifications(sessionId);
        }

        const response = await notificationRequestRef.current;

        if (isActive) {
          setNotifications(
            Array.isArray(response?.notifications)
              ? response.notifications
              : [],
          );
          setErrorMessage("");
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(getNotificationErrorMessage(error));
        }
      } finally {
        notificationRequestRef.current = null;

        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadNotifications(true);

    // [추가] 상담 상태 변화를 반영하기 위한 3초 polling입니다.
    const pollingTimer = window.setInterval(() => {
      loadNotifications();
    }, 3000);

    return () => {
      isActive = false;
      window.clearInterval(pollingTimer);
    };
  }, [retryCount]);

  /**
   * [추가] 조회 실패 후 사용자가 즉시 알림 목록을 다시 요청합니다.
   */
  const handleRetry = () => {
    setRetryCount((previousCount) => previousCount + 1);
  };

  return (
    <div className="notification-page">
      <header className="notification-page__header">
        <button
          type="button"
          className="notification-page__back-button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
        >
          <img src={backIcon} alt="" />
        </button>
        <h1 className="notification-page__title">알림</h1>
      </header>

      <ul className="notification-page__list">
        {/* [추가] 최초 조회 중에는 목록 위치에 간단한 로딩 안내를 표시합니다. */}
        {isLoading && notifications.length === 0 && (
          <li className="notification-page__state">알림을 불러오는 중...</li>
        )}

        {/* [추가] 조회 실패 시 현재 화면을 유지하고 다시 시도할 수 있습니다. */}
        {!isLoading && errorMessage && (
          <li className="notification-page__state">
            <p className="notification-page__state-message">{errorMessage}</p>
            <button
              type="button"
              className="notification-page__retry-button"
              onClick={handleRetry}
            >
              다시 시도
            </button>
          </li>
        )}

        {/* [추가] 알림이 없는 경우 빈 목록 안내를 표시합니다. */}
        {!isLoading && !errorMessage && notifications.length === 0 && (
          <li className="notification-page__state">아직 알림이 없습니다.</li>
        )}

        {notifications.map((item) => (
          <li key={item.notificationId} className="notification-item">
            <div className="notification-item__icon">
              <img src={headsetIcon} alt="" />
            </div>

            <div className="notification-item__content">
              <p className="notification-item__title">
                {NOTIFICATION_TITLES[item.status] ?? "상담 상태가 변경됐어요"}
              </p>
              <p className="notification-item__description">
                {item.message || "상담 상태를 확인해주세요."}
              </p>
            </div>

            <span className="notification-item__time">
              {formatRelativeTime(item.createdAt)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotificationPage;
