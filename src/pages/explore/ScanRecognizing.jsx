// 탐색 - 제품 스캔 : 인식 화면
// [윤서][수정] 가짜 1.5초 타이머 제거. 실제 인식 API 응답이 올 때까지 App.jsx가 이 화면을 띄워두고,
// 응답이 오면 App.jsx가 알아서 다음 화면으로 이동시킵니다.

import "./ScanRecognizing.css";

function ScanRecognizing() {
  return (
    <main className="scan-recognizing-page" role="status" aria-live="polite">
      <div className="scan-recognizing-content">
        <div className="scan-recognizing-spinner" aria-hidden="true" />

        <h1 className="scan-recognizing-title">제품 인식 중</h1>
        <p className="scan-recognizing-description">잠시만 기다려주세요</p>
      </div>
    </main>
  );
}

export default ScanRecognizing;