// 온보딩 - 닉네임 입력 + 라이프스타일 선택
// 카카오 경로(온보딩_4/5), 비회원 경로(온보딩_2/3) 공통 사용 됨

import { useState } from "react";
import "./OnboardingSetup.css";
import backIcon from "../../assets/icons/backicon.svg";

const LIFESTYLE_TAGS = [
  { label: "미니멀", value: "MINIMAL" },
  { label: "클래식", value: "CLASSIC" },
  { label: "캐주얼", value: "CASUAL" },
  { label: "스트릿", value: "STREET" },
  { label: "포멀", value: "FORMAL" },
  { label: "트렌디", value: "TRENDY" },
];

const MAX_TAGS = 3;

function OnboardingSetup({ onBack, onSubmit }) {
  const [nickname, setNickname] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  const isValid = nickname.trim().length > 0 && selectedTags.length > 0;

  const toggleTag = (value) => {
    setSelectedTags((prev) => {
      if (prev.includes(value)) {
        return prev.filter((tag) => tag !== value);
      }
      if (prev.length >= MAX_TAGS) return prev;
      return [...prev, value];
    });
  };

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit?.({ nickname: nickname.trim(), lifestyleTags: selectedTags });
  };

  return (
    <div className="onboarding-setup">
      <header className="onboarding-setup__header">
        <button
          type="button"
          className="onboarding-setup__back"
          onClick={onBack}
          aria-label="뒤로가기"
        >
          <img src={backIcon} alt="" />
        </button>
        <h1 className="onboarding-setup__title">쇼핑셋업</h1>
      </header>

      <section className="onboarding-setup__section">
        <p className="onboarding-setup__label">
          서비스에서 사용할
          <br />
          닉네임을 입력해주세요.
        </p>
        <input
          type="text"
          className={
            "onboarding-setup__input" +
            (nickname ? " onboarding-setup__input--filled" : "")
          }
          placeholder="닉네임 입력"
          value={nickname}
          maxLength={10}
          onChange={(e) => setNickname(e.target.value)}
        />
      </section>

      <section className="onboarding-setup__section">
        <p className="onboarding-setup__label onboarding-setup__label--lifestyle">
          서비스 이용을 위해
          <br />
          라이프스타일 선택해주세요.
        </p>
        <p className="onboarding-setup__hint">최대 3개까지 선택</p>

        <div className="onboarding-setup__tags">
          {LIFESTYLE_TAGS.map((tag) => (
            <button
              key={tag.value}
              type="button"
              className={
                "onboarding-setup__tag" +
                (selectedTags.includes(tag.value)
                  ? " onboarding-setup__tag--selected"
                  : "")
              }
              onClick={() => toggleTag(tag.value)}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </section>

      <button
        type="button"
        className={
          "onboarding-setup__cta" +
          (isValid ? " onboarding-setup__cta--active" : "")
        }
        onClick={handleSubmit}
      >
        다음
      </button>
    </div>
  );
}

export default OnboardingSetup;