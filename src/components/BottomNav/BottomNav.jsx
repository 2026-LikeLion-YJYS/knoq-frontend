// 공통 하단 네비게이션 컴포넌트

// [추가] 하단 네비게이션 화면 이동을 위한 useNavigate
import { useNavigate } from "react-router-dom";

import "./BottomNav.css";

import exploreIcon from "../../assets/icons/nav-explore.svg";
import exploreActiveIcon from "../../assets/icons/nav-explore-active.svg";
import analysisIcon from "../../assets/icons/nav-analysis.svg";
import analysisActiveIcon from "../../assets/icons/nav-analysis-active.svg";
import helpIcon from "../../assets/icons/nav-help.svg";
import helpActiveIcon from "../../assets/icons/nav-help-active.svg";

/**
 * [수정] 탐색·분석·도움 화면으로 이동하는 공통 하단 네비게이션
 */
function BottomNav({ activeTab = "explore", onNavigate }) {
  // [추가] React Router 화면 이동 함수
  const navigate = useNavigate();

  // [수정] 각 메뉴에 이동할 주소 추가
  const navItems = [
    {
      id: "explore",
      path: "/explore",
      label: "탐색",
      icon: exploreIcon,
      activeIcon: exploreActiveIcon,
    },
    {
      id: "analysis",
      path: "/analysis",
      label: "분석",
      icon: analysisIcon,
      activeIcon: analysisActiveIcon,
    },
    {
      id: "help",
      path: "/help",
      label: "도움",
      icon: helpIcon,
      activeIcon: helpActiveIcon,
    },
  ];

  /**
   * [추가] 선택한 탭에 해당하는 화면으로 이동
   * 별도의 onNavigate가 전달되면 해당 함수를 우선 실행합니다.
   */
  const handleNavigate = (item) => {
    if (onNavigate) {
      onNavigate(item.id);
      return;
    }

    navigate(item.path);
  };

  return (
    <nav className="bottom-nav" aria-label="하단 메뉴">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            className="bottom-nav__item"
            onClick={() => handleNavigate(item)}
            aria-label={`${item.label} 화면으로 이동`}
            aria-current={isActive ? "page" : undefined}
          >
            <img src={isActive ? item.activeIcon : item.icon} alt="" />
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
