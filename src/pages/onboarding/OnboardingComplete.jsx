// 온보딩 - 쇼핑 셋업 완료 (FR-103, FR-104 추천 결과)
// 카카오 경로(온보딩_6), 비회원 경로(온보딩_4) 공통 사용

import "./OnboardingComplete.css";
import checkIcon from "../../assets/icons/setup-complete-check.svg";

function OnboardingComplete({ products = [], onStart }) {
  return (
    <div className="onboarding-complete">
      <header className="onboarding-complete__header">
        <h1 className="onboarding-complete__title">쇼핑 셋업 완료</h1>
      </header>

      <div className="onboarding-complete__body">
        <img
          src={checkIcon}
          alt=""
          className="onboarding-complete__check"
        />
        <h2 className="onboarding-complete__headline">쇼핑을 시작해보세요</h2>
        <p className="onboarding-complete__subtext">
          고객님의 라이프스타일과 취향을 바탕으로
          <br />
          나에게 맞는 제품을 탐색해보세요.
        </p>
      </div>

      {/* [추가] FR-103 추천 결과 이미지 3개 - API 연동 전 임시로 products prop 없으면 빈 카드만 표시 */}
      <div className="onboarding-complete__products">
        {[0, 1, 2].map((i) => (
          <div key={i} className="onboarding-complete__product-card">
            {products[i]?.image && (
              <img src={products[i].image} alt={products[i].name || ""} />
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        className="onboarding-complete__cta"
        onClick={onStart}
      >
        쇼핑 시작하기
      </button>
    </div>
  );
}

export default OnboardingComplete;