// 탐색 - 로그인 후 재방문 시 뜨는 아카이브 화면
// 저장한 제품이 없는 시점의 로그인 진입 화면으로, 과거 방문 기록을 보여줍니다.

import "./ExploreArchive.css";
import mainBagImage from "../../assets/images/main-bag.svg";
import MainHeader from "../../components/MainHeader/MainHeader";
import BottomNav from "../../components/BottomNav/BottomNav";
import { useNavigate } from "react-router-dom";

function ExploreArchive({ userName, visits, isLoggedIn, onLogout, onScan, onSelectVisit }) {
  const navigate = useNavigate();

  const handleNavigate = (tabId) => {
    if (tabId === "explore") navigate("/explore");
    if (tabId === "analysis") navigate("/analysis");
    if (tabId === "help") navigate("/help");
  };

  return (
    <div className="explore-archive">
      <div className="explore-archive__top-section">
        <div className="explore-archive__glow" />

        <div className="explore-archive__header-wrap">
          <MainHeader
            onNotificationClick={() => navigate("/notification")}
            isLoggedIn={isLoggedIn}
            onLogout={onLogout}
          />
        </div>

        <div className="explore-archive__intro">
          <h1 className="explore-archive__title">
            궁금한 제품을
            <br />
            직접 스캔해보세요.
          </h1>
          <p className="explore-archive__description">
            매장에서 제품을 스캔하면
            <br />
            나에게 맞는 이유와
            <br />
            나의 니즈를 발견할 수 있어요.
          </p>

          <button
            type="button"
            className="explore-archive__scan-button"
            onClick={onScan}
          >
            제품 스캔하기
          </button>
        </div>

        <img
          src={mainBagImage}
          alt=""
          className="explore-archive__hero-image"
        />
      </div>

      <section className="explore-archive__list-section">
        <p className="explore-archive__list-title">탐색 아카이브</p>

        <div className="explore-archive__list-grid">
          {visits.map((visit) => (
            <button
              key={visit.id}
              type="button"
              className="explore-archive__card"
              onClick={() => onSelectVisit?.(visit)}
            >
              <div className="explore-archive__card-inner">
                <img
                  src={visit.image}
                  alt=""
                  className="explore-archive__card-image"
                />
                <div className="explore-archive__card-overlay">
                  <p className="explore-archive__card-label">{visit.label}</p>
                  <p className="explore-archive__card-date">{visit.date}</p>
                </div>
              </div>

              {visit.isNew && (
                <span className="explore-archive__badge">New</span>
              )}
            </button>
          ))}
        </div>
      </section>

      <BottomNav activeTab="explore" onNavigate={handleNavigate} />
    </div>
  );
}

export default ExploreArchive;