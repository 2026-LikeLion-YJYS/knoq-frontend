// 카카오 SDK 초기화
// index.html에서 불러온 카카오 SDK(window.Kakao)를 앱 시작 시 초기화합니다.

export function initKakao() {
  const kakaoJsKey = import.meta.env.VITE_KAKAO_JS_KEY;

  if (!kakaoJsKey) {
    // [추가] 키가 아직 없을 때 콘솔에서 바로 알 수 있도록 안내
    console.warn(
      "카카오 JS 키가 설정되지 않았어요. .env 파일에 VITE_KAKAO_JS_KEY를 추가해주세요.",
    );
    return;
  }

  if (window.Kakao && !window.Kakao.isInitialized()) {
    window.Kakao.init(kakaoJsKey);
  }
}