// 탐색 - 제품 스캔 : 촬영완료(확인) 화면
// [윤서][수정] 더미 기본값 제거. product는 이제 항상 App.jsx가 실제 인식 API 결과로 채워서 내려줍니다.

import "./ScanConfirm.css";
import backIcon from "../../assets/icons/backicon.svg";

function ScanConfirm({ onRetake, onConfirm, product, isSubmitting = false, errorMessage = "" }) {
  // [윤서][추가] 인식 결과가 아직 안 왔는데 이 화면에 들어온 경우(새로고침 등) 방어
  if (!product) {
    return null;
  }

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

      {/* [윤서][추가] API 실패 시 안내 문구 */}
      {errorMessage && (
        <p className="scan-confirm__error">{errorMessage}</p>
      )}

      <div className="scan-confirm__actions">
        <button
          type="button"
          className="scan-confirm__button scan-confirm__button--secondary"
          onClick={onRetake}
          disabled={isSubmitting}
        >
          다시 촬영할게요
        </button>
        <button
          type="button"
          className="scan-confirm__button scan-confirm__button--primary"
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? "저장 중..." : "맞아요"}
        </button>
      </div>
    </div>
  );
}

export default ScanConfirm;