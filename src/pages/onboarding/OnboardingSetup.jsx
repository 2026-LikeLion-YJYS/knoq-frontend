// 온보딩 - 닉네임 입력 + 라이프스타일 선택
// 카카오 경로(온보딩_4/5), 비회원 경로(온보딩_2/3) 공통 사용 됨

import { useEffect, useState } from "react";
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

function OnboardingSetup({
  onBack,
  onSubmit,
  initialNickname = "",
  // [윤서][추가] API 연동 - 로딩/에러 상태
  isSubmitting = false,
  errorMessage = "",
}) {
  const [nickname, setNickname] = useState(initialNickname);
  const [selectedTags, setSelectedTags] = useState([]);

  // 카카오 로그인 응답에서 불러온 이전 닉네임이 도착하면 입력창에 미리 채운다.
  // 라이프스타일은 오늘 첫 로그인마다 새로 선택해야 하므로 복원하지 않는다.
  useEffect(() => {
    setNickname(initialNickname);
  }, [initialNickname]);

  // [윤서][수정] API 스펙(FR-101)상 닉네임은 2~10자. 1글자면 어차피 400 나므로 프론트에서 미리 막음
  const isValid =
    nickname.trim().length >= 2 &&
    nickname.trim().length <= 10 &&
    selectedTags.length > 0;

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
    if (!isValid || isSubmitting) return;
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
        {/* [윤서][추가] 2~10자 안내 문구 */}
        <p className="onboarding-setup__input-hint">2~10자로 입력해주세요</p>
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

      {/* [윤서][추가] API 실패 시 안내 문구 */}
      {errorMessage && (
        <p className="onboarding-setup__error">{errorMessage}</p>
      )}

      <button
        type="button"
        className={
          "onboarding-setup__cta" +
          (isValid ? " onboarding-setup__cta--active" : "")
        }
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "저장 중..." : "다음"}
      </button>
    </div>
  );
}

export default OnboardingSetup;
