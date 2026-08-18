// 탐색 - 제품 스캔 : 촬영 화면
// 카메라를 켜서 제품을 촬영합니다. (실제 인식 로직은 API 연동 전이라 더미데이터로 )

import { useEffect, useRef, useState } from "react";
import "./ScanCapture.css";
import backIcon from "../../assets/icons/backicon.svg";
import grayCloseIcon from "../../assets/icons/gray-close.svg";
import grayRefreshIcon from "../../assets/icons/gray-refresh.svg";
import cameraIcon from "../../assets/icons/camera.svg";

function ScanCapture({ onClose, onCapture }) {
  const videoRef = useRef(null);
  // 후면/전면 카메라 전환
  const [facingMode, setFacingMode] = useState("environment");
  // 카메라 권한/미지원 안내
  const [cameraError, setCameraError] = useState(null);

  useEffect(() => {
    let stream;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraError(null);
      } catch (error) {
        // 카메라 권한이 없거나 기기가 지원하지 않는 경우
        console.error("카메라를 열 수 없습니다:", error);
        setCameraError("카메라를 사용할 수 없어요. 권한을 확인해주세요.");
      }
    };

    startCamera();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [facingMode]);

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  return (
    <div className="scan-capture">
      <header className="scan-capture__header">
        <button
          type="button"
          className="scan-capture__back"
          onClick={onClose}
          aria-label="뒤로가기"
        >
          <img src={backIcon} alt="" />
        </button>
        <h1 className="scan-capture__title">제품스캔</h1>
      </header>

      <div className="scan-capture__viewfinder">
        {!cameraError && (
          <video
            ref={videoRef}
            className="scan-capture__video"
            autoPlay
            playsInline
            muted
          />
        )}

        {cameraError && (
          <p className="scan-capture__camera-error">{cameraError}</p>
        )}

        <div className="scan-capture__hint">
          <span>탐색할 제품을 촬영해주세요</span>
          <span className="scan-capture__hint-icon" aria-hidden="true">
            ?
          </span>
        </div>

        <div className="scan-capture__frame" aria-hidden="true">
          <span className="scan-capture__corner scan-capture__corner--tl" />
          <span className="scan-capture__corner scan-capture__corner--tr" />
          <span className="scan-capture__corner scan-capture__corner--bl" />
          <span className="scan-capture__corner scan-capture__corner--br" />
        </div>
      </div>

      <div className="scan-capture__controls">
        <button
          type="button"
          className="scan-capture__control-button"
          onClick={onClose}
          aria-label="닫기"
        >
          <img src={grayCloseIcon} alt="" />
        </button>

        <button
          type="button"
          className="scan-capture__shutter"
          onClick={onCapture}
          aria-label="촬영"
        >
          <img src={cameraIcon} alt="" />
        </button>

        <button
          type="button"
          className="scan-capture__control-button"
          onClick={handleFlipCamera}
          aria-label="카메라 전환"
        >
          <img src={grayRefreshIcon} alt="" />
        </button>
      </div>
    </div>
  );
}

export default ScanCapture;