// 탐색 - 제품 스캔 : 등록완료 화면

import "./ScanComplete.css";
import backIcon from "../../assets/icons/backicon.svg";
import checkIcon from "../../assets/icons/setup-complete-check.svg";

function ScanComplete({ onBack, onScanAgain, onViewAnalysis }) {
  return (
    <div className="scan-complete">
      <header className="scan-complete__header">
        <button
          type="button"
          className="scan-complete__back"
          onClick={onBack}
          aria-label="뒤로가기"
        >
          <img src={backIcon} alt="" />
        </button>
        <h1 className="scan-complete__title">쇼핑 셋업 완료</h1>
      </header>

      <div className="scan-complete__body">
        <img src={checkIcon} alt="" className="scan-complete__check" />

        <div className="scan-complete__text">
          <h2 className="scan-complete__headline">제품을 등록했어요.</h2>
          <p className="scan-complete__subtext">
            제품 정보를 확인했어요.
            <br />
            나에게 얼마나 잘 맞는지 분석해드릴게요.
          </p>
        </div>
      </div>

      <div className="scan-complete__actions">
        <button
          type="button"
          className="scan-complete__button scan-complete__button--secondary"
          onClick={onScanAgain}
        >
          이어서 스캔하기
        </button>
        <button
          type="button"
          className="scan-complete__button scan-complete__button--primary"
          onClick={onViewAnalysis}
        >
          분석정보 보기
        </button>
      </div>
    </div>
  );
}

export default ScanComplete;