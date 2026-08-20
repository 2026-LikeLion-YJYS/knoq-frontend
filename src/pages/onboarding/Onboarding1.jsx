// 온보딩 1단계 - 매장 진입 + 저장 범위 선택

import "./Onboarding1.css";
import heroImage from "../../assets/images/onboarding-hero.png";

function Onboarding1({
  storeName,
  onSelectPrivate,
  onSelectAccount,
  // [윤서][추가] API 연동 - 로딩/에러 상태
  isSubmitting = false,
  errorMessage = "",
}) {
  return (
    <div className="onboarding-start">
      <img
        className="onboarding-start__bg"
        src={heroImage}
        alt=""
      />

      <div className="onboarding-start__content">
        <h1 className="onboarding-start__title">
          50년의 탁월함을 넘어 당신에게로,
        </h1>
        <p className="onboarding-start__subtitle">
          현재 접속하신 매장은
          <br />
          {/* [윤서][수정] FR-000 매장 진입 응답의 storeName을 표시. 아직 안 받아왔으면 로딩 문구 */}
          MCM 하우스 [ {storeName || "확인 중..."} ]점 입니다.
        </p>
      </div>

      {/* [윤서][추가] 온보딩 API 실패 시 안내 문구 */}
      {errorMessage && (
        <p className="onboarding-start__error">{errorMessage}</p>
      )}

      <div className="onboarding-start__actions">
        <button
          type="button"
          className="onboarding-start__btn onboarding-start__btn--white"
          onClick={onSelectPrivate}
          disabled={isSubmitting}
        >
          <span className="onboarding-start__btn-label">
            저장 없이 프라이빗하게 둘러보기
          </span>
          <span className="onboarding-start__btn-caption">
            필수 서비스 이용약관 및 만 14세 이상 이용에 동의한 것으로 간주됩니다.
          </span>
        </button>

        <button
          type="button"
          className="onboarding-start__btn onboarding-start__btn--primary"
          onClick={onSelectAccount}
          disabled={isSubmitting}
        >
          <span className="onboarding-start__btn-label">
            내 정보 기억하고 이어서 탐색하기
          </span>
          <span className="onboarding-start__btn-caption">
            카카오 계정으로 간편하게 시작합니다
          </span>
        </button>
      </div>
    </div>
  );
}

export default Onboarding1;