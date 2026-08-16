import Help from "./pages/help/Help";
import Onboarding1 from "./pages/onboarding/Onboarding1";

// [추가] 직원 로그인 진입 화면
import StaffIntro from "./pages/staff/StaffIntro";

function App() {
  // [수정] "onboarding", "help", "staffIntro"로 변경하여 화면 확인
  const CURRENT_PAGE = "staffIntro";

  // 온보딩 화면
  if (CURRENT_PAGE === "onboarding") {
    return (
      <Onboarding1
        onSelectPrivate={() => alert("프라이빗 선택")}
        onSelectAccount={() => alert("계정 선택")}
      />
    );
  }

  // [추가] 직원 로그인 진입 화면
  if (CURRENT_PAGE === "staffIntro") {
    return (
      <StaffIntro
        onLogin={() => {
          // [추가] StaffLogin 구현 전 임시 버튼 동작
          alert("직원 로그인 화면으로 이동합니다.");
        }}
      />
    );
  }

  // 도움 화면
  return <Help />;
}

export default App;
