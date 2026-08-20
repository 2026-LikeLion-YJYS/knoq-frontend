// 탐색 - 제품 스캔 : 촬영 화면
// 카메라를 켜서 제품을 촬영합니다.

import { useEffect, useRef, useState } from "react";
import "./ScanCapture.css";
import backIcon from "../../assets/icons/backicon.svg";
import grayCloseIcon from "../../assets/icons/gray-close.svg";
import grayRefreshIcon from "../../assets/icons/gray-refresh.svg";
import cameraIcon from "../../assets/icons/camera.svg";

function ScanCapture({
  onClose,
  onCapture,
  onLookupProduct,
  recognitionFailureCount = 0,
  errorMessage = "",
}) {
  const videoRef = useRef(null);
  // [윤서][추가] 캡처용 캔버스 (화면에는 안 보이고, 촬영 순간 사진을 그려서 파일로 뽑아내는 용도)
  const canvasRef = useRef(null);
  // 후면/전면 카메라 전환
  const [facingMode, setFacingMode] = useState("environment");
  // 카메라 권한/미지원 안내
  const [cameraError, setCameraError] = useState(null);
  // [윤서][추가] 촬영 버튼 중복 클릭 방지
  const [isCapturing, setIsCapturing] = useState(false);
  // [추가] 카메라 사용이 어려울 때 직접 입력할 제품 코드와 조회 상태입니다.
  const [productCode, setProductCode] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState("");

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

  /**
   * [윤서][추가] 현재 비디오 프레임을 캔버스에 그린 뒤 JPG 파일(Blob)로 변환해서
   * 부모(App.jsx)로 넘깁니다. 실제 인식 API 호출은 App.jsx가 담당합니다.
   */
  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || isCapturing) return;

    setIsCapturing(true);

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        setIsCapturing(false);

        if (!blob) {
          console.error("촬영한 이미지를 만들지 못했습니다.");
          return;
        }

        onCapture?.(blob);
      },
      "image/jpeg",
      0.9,
    );
  };

  /**
   * [추가] 입력한 제품 코드로 제품을 조회합니다.
   */
  const handleLookupSubmit = async (event) => {
    event.preventDefault();
    const trimmedCode = productCode.trim();

    if (!trimmedCode || isLookingUp) return;

    setIsLookingUp(true);
    setLookupError("");

    try {
      await onLookupProduct?.(trimmedCode);
    } catch {
      setLookupError("제품 번호를 다시 확인해주세요.");
    } finally {
      setIsLookingUp(false);
    }
  };

  // [추가] 권한 거부 또는 세 번 이상 인식 실패 시 직접 입력 영역을 표시합니다.
  const showProductLookup =
    Boolean(cameraError) || recognitionFailureCount >= 3;

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

      {/* [윤서][추가] 인식 API 실패 시 안내 문구 */}
      {errorMessage && <p className="scan-capture__error">{errorMessage}</p>}

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
          <div className="scan-capture__camera-error">
            <p>{cameraError}</p>
          </div>
        )}

        {showProductLookup && (
          <form className="scan-capture__lookup" onSubmit={handleLookupSubmit}>
            <label htmlFor="scan-product-code">제품 번호로 찾기</label>
            <div className="scan-capture__lookup-row">
              <input
                id="scan-product-code"
                type="text"
                value={productCode}
                placeholder="제품 번호 입력"
                onChange={(event) => setProductCode(event.target.value)}
              />
              <button
                type="submit"
                disabled={!productCode.trim() || isLookingUp}
              >
                {isLookingUp ? "조회 중" : "조회"}
              </button>
            </div>
            {lookupError && <p role="alert">{lookupError}</p>}
          </form>
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

        {/* [윤서][추가] 화면에 안 보이는 캡처용 캔버스 */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
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
          onClick={handleCapture}
          disabled={isCapturing || Boolean(cameraError)}
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
