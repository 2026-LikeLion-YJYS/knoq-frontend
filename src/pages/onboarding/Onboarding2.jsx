// 온보딩 2단계 - 약관 동의 확인

import { useState } from "react";
import "./Onboarding2.css";
import backIcon from "../../assets/icons/backicon.svg";
import checkIcon from "../../assets/icons/check.svg";
import kakaoIcon from "../../assets/icons/kakao.svg";
import kakaoDarkIcon from "../../assets/icons/kakao-dark.svg";

const REQUIRED_KEYS = ["termsOfService", "privacyPolicy", "over14"];

function Onboarding2({ onBack, onSubmit }) {
  const [consents, setConsents] = useState({
    termsOfService: false,
    privacyPolicy: false,
    over14: false,
    marketingOptIn: false,
  });

  const isAllRequiredChecked = REQUIRED_KEYS.every((key) => consents[key]);

  const toggleConsent = (key) => {
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  
  const handleSubmit = () => {
    if (!isAllRequiredChecked) return;

    if (!window.Kakao || !window.Kakao.isInitialized()) {
      console.warn("카카오 SDK가 초기화되지 않았어요. .env의 키를 확인해주세요.");
      onSubmit?.(consents);
      return;
    }

    window.Kakao.Auth.login({
      success: (authObj) => {
        // TODO: 백엔드 API 붙으면 authObj.access_token을 서버로 전달해서
        // 서버에서 카카오 사용자 정보 확인 + 우리 서비스 로그인 세션 발급받기
        console.log("카카오 로그인 성공:", authObj);
        onSubmit?.(consents);
      },
      fail: (error) => {
        console.error("카카오 로그인 실패:", error);
      },
    });
  };

   return (
    <div className="onboarding-consent">
      <header className="onboarding-consent__header">
        <button
          type="button"
          className="onboarding-consent__back"
          onClick={onBack}
          aria-label="뒤로가기"
        >
          <img src={backIcon} alt="" />
        </button>
        <h1 className="onboarding-consent__title">동의 확인 및 시작</h1>
      </header>

      <section className="onboarding-consent__section">
        <h2 className="onboarding-consent__section-title">필수 동의</h2>
        <p className="onboarding-consent__section-desc">
          ※ 수집된 상담 맥락(탐색 제품, 니즈 분석)은 다음 방문 시 맞춤형
          서비스 복원을 위해서만 사용됩니다.
        </p>

        {/* TODO: 두 번째 항목 라벨이 Figma상 "서비스 이용약관"과 중복됨.
            API 스펙 기준 termsOfService/privacyPolicy 2종이 맞아서
            일단 privacyPolicy로 연결해두고, 디자이너 확인 후 라벨만 교체 예정 */}
        <ConsentRow
          label="서비스 이용약관 (필수)"
          checked={consents.termsOfService}
          onToggle={() => toggleConsent("termsOfService")}
        />
        <ConsentRow
          label="개인정보 이용약관 (필수)"
          checked={consents.privacyPolicy}
          onToggle={() => toggleConsent("privacyPolicy")}
        />
        <ConsentRow
          label="만 14세 이상입니다 (필수)"
          checked={consents.over14}
          onToggle={() => toggleConsent("over14")}
        />
      </section>

     <section className="onboarding-consent__section onboarding-consent__section--select">
        <h2 className="onboarding-consent__section-title onboarding-consent__section-title--select">
          선택 동의
        </h2>
        <ConsentRow
          label="맞춤형 마켓팅 정보 수신 (선택)"
          checked={consents.marketingOptIn}
          onToggle={() => toggleConsent("marketingOptIn")}
        />
      </section>

      <button
        type="button"
        className={
          "onboarding-consent__cta" +
          (isAllRequiredChecked ? " onboarding-consent__cta--active" : "")
        }
        onClick={handleSubmit}
      >
        <img
          src={isAllRequiredChecked ? kakaoDarkIcon : kakaoIcon}
          alt=""
          className="onboarding-consent__cta-icon"
        />
        카카오로 시작하기
      </button>
    </div>
   );
}

// 동의 항목 행 (재사용)
function ConsentRow({ label, checked, onToggle }) {
  return (
    <button
      type="button"
      className="onboarding-consent__row"
      onClick={onToggle}
    >
      <span
        className={
          "onboarding-consent__checkbox" +
          (checked ? " onboarding-consent__checkbox--checked" : "")
        }
      >
        {checked && <img src={checkIcon} alt="" />}
      </span>
      <span className="onboarding-consent__row-label">{label}</span>
    </button>
  );
}

export default Onboarding2;