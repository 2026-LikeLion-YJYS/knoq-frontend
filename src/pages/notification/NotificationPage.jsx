// 알림 페이지
// 도움 요청 후 ~ 상담 진행 중 상태의 알림을 보여줍니다.
// (상담 종료 알림은 이후 이슈에서 상태 5개로 확장 예정)

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import backIcon from "../../assets/icons/backicon.svg";
import headsetIcon from "../../assets/icons/headset.svg";
import { formatRelativeTime } from "../../utils/formatRelativeTime";
import "./NotificationPage.css";

// TODO: 실제로는 상담 요청 시점에 서버/상태에서 내려오는 데이터로 교체
const NOTIFICATIONS = [
  {
    id: 1,
    title: "어드바이저가 오고 있어요",
    description: ["잠시만 기다려주세요."],
    createdAt: new Date(Date.now() - 10 * 1000),
  },
  {
    id: 2,
    title: "어드바이저가 확인했어요",
    description: ["고객님이 살펴본 제품과 요청내용을", "확인하고 있습니다."],
    createdAt: new Date(Date.now() - 45 * 1000),
  },
  {
    id: 3,
    title: "상담 요청이 전달되었어요",
    description: ["탐색하신 제품과 요청 내용을", "어드바이저에게 전달했습니다."],
    createdAt: new Date(Date.now() - 65 * 1000),
  },
];

function NotificationPage() {
  const navigate = useNavigate();

  // 30초마다 리렌더링해서 "방금 전 → N분 전" 표시가 시간 지나면 자동 갱신되게 함
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => forceUpdate((v) => v + 1), 30000);
    return () => clearInterval(timer);
  }, []);

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
        {NOTIFICATIONS.map((item) => (
          <li key={item.id} className="notification-item">
            <div className="notification-item__icon">
              <img src={headsetIcon} alt="" />
            </div>

            <div className="notification-item__content">
              <p className="notification-item__title">{item.title}</p>
              <p className="notification-item__description">
                {item.description.map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < item.description.length - 1 && <br />}
                  </span>
                ))}
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