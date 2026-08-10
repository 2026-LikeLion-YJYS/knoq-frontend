// 공통 하단 네비게이션 컴포넌트

import "./BottomNav.css";

import exploreIcon from "../../assets/icons/nav-explore.svg";
import exploreActiveIcon from "../../assets/icons/nav-explore-active.svg";
import analysisIcon from "../../assets/icons/nav-analysis.svg";
import analysisActiveIcon from "../../assets/icons/nav-analysis-active.svg";
import helpIcon from "../../assets/icons/nav-help.svg";
import helpActiveIcon from "../../assets/icons/nav-help-active.svg";

function BottomNav({ activeTab = "explore", onNavigate }) {
  // [수정] 네비게이션 메뉴
  const navItems = [
    {
      id: "explore",
      icon: exploreIcon,
      activeIcon: exploreActiveIcon,
    },
    {
      id: "analysis",
      icon: analysisIcon,
      activeIcon: analysisActiveIcon,
    },
    {
      id: "help",
      icon: helpIcon,
      activeIcon: helpActiveIcon,
    },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            className="bottom-nav__item"
            onClick={() => onNavigate?.(item.id)}
          >
            <img
              src={isActive ? item.activeIcon : item.icon}
              alt={item.id}
            />
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;