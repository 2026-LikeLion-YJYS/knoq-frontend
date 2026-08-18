// 탐색 - 제품 스캔 : 인식 화면

import { useEffect } from "react";
import "./ScanRecognizing.css";

function ScanRecognizing({ onComplete }) {
  /* API 연동 전 임시 인식 처리 */
  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      onComplete?.();
    }, 1500);

    return () => {
      clearTimeout(loadingTimer);
    };
  }, [onComplete]);

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