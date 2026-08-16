import Help from "./pages/help/Help";
import Onboarding1 from "./pages/onboarding/Onboarding1";

function App() {
  const CURRENT_PAGE = "help"; // "onboarding" 또는 "help"로 변경하여 페이지 전환

  if (CURRENT_PAGE === "onboarding") {
    return (
      <Onboarding1
        onSelectPrivate={() => alert("프라이빗 선택")}
        onSelectAccount={() => alert("계정 선택")}
      />
    );
  }

  return <Help />;
}

export default App;