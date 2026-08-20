// [추가] 직원 로그인 진입 화면 스타일
import "./StaffIntro.css";

// [추가] 직원 로그인 진입 화면 이미지
import staffIntroBackground from "../../assets/images/staff-intro-background.svg";
import mcmLogo from "../../assets/icons/mcm-logo-white.svg";

/**
 * 직원용 매장 로그인 진입 화면
 * 어드바이저 로그인 버튼을 누르면 직원 로그인 화면으로 이동한다.
 */
function StaffIntro({ onLogin }) {
  return (
    <main
      className="staff-intro"
      style={{
        backgroundImage: `linear-gradient(
          rgba(20, 13, 8, 0.24),
          rgba(20, 13, 8, 0.24)
        ), url(${staffIntroBackground})`,
      }}
    >
      {/* [추가] 매장 안내 문구 */}
      <header className="staff-intro__header">
        <p className="staff-intro__heritage">
          1976년부터 이어온 MCM 헤리티지
        </p>

        <h1 className="staff-intro__store">
          MCM 하우스 <span>[ 청담 ]</span>점
        </h1>
      </header>

      {/* [추가] 중앙 MCM 로고 */}
      <div className="staff-intro__logo-area">
        <img
          className="staff-intro__logo"
          src={mcmLogo}
          alt="MCM"
        />
      </div>

      {/* [추가] 직원 로그인 화면 이동 버튼 */}
      <div className="staff-intro__bottom">
        <button
          className="staff-intro__login-button"
          type="button"
          onClick={onLogin}
        >
          어드바이저 로그인
        </button>
      </div>
    </main>
  );
}

export default StaffIntro;