// [추가] 온보딩2 화면 확인용
import Onboarding2 from "./pages/onboarding/Onboarding2";

// [테스트용, 나중에 라우터로 대체] 온보딩1 확인용
// import Onboarding1 from "./pages/onboarding/Onboarding1";

// [테스트용, 나중에 라우터로 대체] 헤더/네비바 확인용
// import MainHeader from "./components/MainHeader/MainHeader";
// import { useState } from "react";
// import BottomNav from "./components/BottomNav/BottomNav";

function App() {
  // [테스트용, 나중에 라우터로 대체] 현재 선택된 메뉴 확인용
  // const [activeTab, setActiveTab] = useState("analysis");

  return (
    <Onboarding2
      onBack={() => alert("뒤로가기")}
      onSubmit={(consents) => console.log("제출된 동의값:", consents)}
    />
  );

  // [테스트용, 나중에 라우터로 대체] 온보딩1 화면
  // return (
  //   <Onboarding1
  //     onSelectPrivate={() => alert("프라이빗 선택")}
  //     onSelectAccount={() => alert("계정 선택")}
  //   />
  // );

  // [테스트용, 나중에 라우터로 대체] 헤더/네비바 화면
  // return (
  //   <div
  //     style={{
  //       minHeight: "100vh",
  //       background: "#24221E",
  //     }}
  //   >
  //     <MainHeader />
  //     <BottomNav
  //       activeTab={activeTab}
  //       onNavigate={setActiveTab}
  //     />
  //   </div>
  // );
}

export default App;