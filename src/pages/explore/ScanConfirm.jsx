// 탐색 - 제품 스캔 : 촬영완료(확인) 화면
// 인식된 제품이 맞는지 확인 (API 연동 전이라 더미 제품 데이터 사용)

import "./ScanConfirm.css";
import backIcon from "../../assets/icons/backicon.svg";
import dummyBagImage from "../../assets/images/front-bag.png";

// 백엔드 연동 전 임시 더미 데이터
const DUMMY_SCANNED_PRODUCT = {
  image: dummyBagImage,
  name: "L Tracy 비세토스 호보",
};

function ScanConfirm({ onRetake, onConfirm, product = DUMMY_SCANNED_PRODUCT }) {
  return (
    <div className="scan-confirm">
      <header className="scan-confirm__header">
        <button
          type="button"
          className="scan-confirm__back"
          onClick={onRetake}
          aria-label="뒤로가기"
        >
          <img src={backIcon} alt="" />
        </button>
        <h1 className="scan-confirm__title">제품스캔</h1>
      </header>

      <div className="scan-confirm__card">
        <div className="scan-confirm__text-group">
          <h2 className="scan-confirm__headline">이 제품이 맞나요?</h2>
          <p className="scan-confirm__description">
            저장하면 제품 정보와 나의 라이프스타일을
            <br />
            바탕으로 AI가 분석해드려요.
          </p>
        </div>

        <img
          src={product.image}
          alt={product.name}
          className="scan-confirm__image"
        />

        <p className="scan-confirm__product-name">{product.name}</p>
      </div>

      <div className="scan-confirm__actions">
        <button
          type="button"
          className="scan-confirm__button scan-confirm__button--secondary"
          onClick={onRetake}
        >
          다시 촬영할게요
        </button>
        <button
          type="button"
          className="scan-confirm__button scan-confirm__button--primary"
          onClick={() => onConfirm?.(product)}
        >
          맞아요
        </button>
      </div>
    </div>
  );
}

export default ScanConfirm;