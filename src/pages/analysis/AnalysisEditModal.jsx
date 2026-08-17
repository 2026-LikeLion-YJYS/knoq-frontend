// [추가] 사이즈 선택용 가방 이미지
import sizeXMiniImage from "../../assets/images/analysis-size-x-mini.svg";
import sizeMiniImage from "../../assets/images/analysis-size-mini.svg";
import sizeSmallImage from "../../assets/images/analysis-size-small.svg";
import sizeMediumImage from "../../assets/images/analysis-size-medium.svg";
import sizeLargeImage from "../../assets/images/analysis-size-large.svg";
import sizeXLargeImage from "../../assets/images/analysis-size-x-large.svg";

// [추가] 컬러 선택용 패턴 이미지
import colorCognacImage from "../../assets/images/analysis-color-cognac.svg";
import colorBlackImage from "../../assets/images/analysis-color-black.svg";
import colorWhiteImage from "../../assets/images/analysis-color-white.svg";
import colorBeigeImage from "../../assets/images/analysis-color-beige.svg";
import colorBlueImage from "../../assets/images/analysis-color-blue.svg";
import colorPinkImage from "../../assets/images/analysis-color-pink.svg";

import { useState } from "react";

import "./AnalysisEditModal.css";

/**
 * [추가] 수정 모달 종류별 제목과 선택 항목
 * 하나의 모달에서 category·material·size·color 내용을 변경합니다.
 */
const editOptions = {
  category: {
    title: "제품 카테고리 수정",
    options: [
      { value: "백팩" },
      // [수정] 분석8 임시 카테고리 값과 동일한 이름 사용
      { value: "토트백 / 쇼퍼백" },
      { value: "미니백" },
      { value: "숄더백 / 크로스백" },
      { value: "탑 핸들백" },
      { value: "트래블" },
      { value: "보스턴백" },
      { value: "호보백" },
      { value: "클러치 / 파우치" },
    ],
  },
  material: {
    title: "선호 소재 수정",
    options: [
      { value: "Visetos" },
      { value: "Leather" },
      { value: "Canvas" },
      { value: "Nylon" },
    ],
  },
  size: {
    title: "선호 사이즈 수정",
    options: [
      { value: "X-Mini", image: sizeXMiniImage },
      { value: "Mini", image: sizeMiniImage },
      { value: "Small", image: sizeSmallImage },
      { value: "Medium", image: sizeMediumImage },
      { value: "Large", image: sizeLargeImage },
      { value: "X-Large", image: sizeXLargeImage },
    ],
  },
  color: {
    title: "선호 컬러 수정",
    options: [
      { value: "Cognac", image: colorCognacImage },
      { value: "Black", image: colorBlackImage },
      { value: "White", image: colorWhiteImage },
      { value: "Beige", image: colorBeigeImage },
      { value: "Blue", image: colorBlueImage },
      { value: "Pink", image: colorPinkImage },
    ],
  },
};

/**
 * [수정] 전달받은 값을 모달 종류별 선택 규칙에 맞는 배열로 변환
 * 기존 선택값만 유지하고, 값이 없거나 올바르지 않으면 첫 옵션을 선택합니다.
 */
const getInitialSelectedValues = (value, options, allowsMultipleSelection) => {
  // [추가] 현재 모달에서 실제로 선택할 수 있는 옵션값 목록
  const optionValues = options.map((option) => option.value);

  // [수정] 배열 또는 ` · ` 구분 문자열을 동일한 배열 형태로 변환
  const parsedValues = Array.isArray(value)
    ? value
    : value
      ? value.split(" · ").map((item) => item.trim())
      : [];

  // [추가] 중복값과 현재 옵션 목록에 없는 값을 제거
  const validValues = [...new Set(parsedValues)].filter((selectedValue) =>
    optionValues.includes(selectedValue),
  );

  // [추가] 사이즈·컬러는 최대 2개, 카테고리·소재는 1개만 유지
  const maximumSelectionCount = allowsMultipleSelection ? 2 : 1;

  if (validValues.length > 0) {
    return validValues.slice(0, maximumSelectionCount);
  }

  // [추가] 선택값이 없더라도 첫 옵션을 기본 선택하여 최소 1개 유지
  return optionValues.slice(0, 1);
};

/**
 * [추가] 니즈 항목 수정 모달
 * 선택값을 수정한 뒤 수정완료 버튼을 누르면 분석8 결과 카드에 반영합니다.
 */
function AnalysisEditModal({ type, value, onSave, onClose }) {
  // [추가] 현재 모달 종류에 맞는 설정
  const modalData = editOptions[type];

  // [추가] 사이즈·컬러만 최대 2개까지 복수 선택 허용
  const allowsMultipleSelection = type === "size" || type === "color";

  // [수정] 모달 종류별 선택 개수 제한을 적용하여 초기 상태 설정
  const [selectedValues, setSelectedValues] = useState(() =>
    getInitialSelectedValues(
      value,
      modalData?.options ?? [],
      allowsMultipleSelection,
    ),
  );

  /**
   * [수정] 모달 종류별 선택 처리
   * 사이즈·컬러에서 세 번째 옵션 선택 시 가장 먼저 선택한 옵션을 교체합니다.
   */
  const handleOptionClick = (optionValue) => {
    setSelectedValues((previousValues) => {
      // [유지] 카테고리·소재는 누른 옵션 하나로 선택값 교체
      if (!allowsMultipleSelection) {
        return [optionValue];
      }

      // [유지] 이미 선택된 옵션을 누르면 선택 해제하되 최소 1개 유지
      if (previousValues.includes(optionValue)) {
        if (previousValues.length === 1) {
          return previousValues;
        }

        return previousValues.filter(
          (selectedValue) => selectedValue !== optionValue,
        );
      }

      // [수정] 이미 2개라면 먼저 선택한 값을 제거하고 새 값을 추가
      if (previousValues.length >= 2) {
        return [previousValues[1], optionValue];
      }

      // [유지] 선택값이 1개라면 새 값을 추가
      return [...previousValues, optionValue];
    });
  };

  /**
   * [추가] 모달 배경을 눌렀을 때 저장하지 않고 닫기
   */
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  /**
   * [수정] 현재 선택된 값을 ` · `로 연결하여 기존 값을 교체
   * 분석8 카드에서 여러 선택값이 구분되어 표시되도록 문자열로 전달합니다.
   */
  const handleSave = () => {
    // [수정] 중복을 제거한 선택값을 ` · ` 구분 문자열로 변환
    const formattedValue = [...new Set(selectedValues)].join(" · ");

    onSave?.(formattedValue);
  };

  if (!modalData) {
    return null;
  }

  return (
    <div
      className="analysis-edit-modal"
      role="presentation"
      onClick={handleBackdropClick}
    >
      {/* [추가] 하단에서 열리는 수정 모달 본문 */}
      <section
        className="analysis-edit-modal__sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`analysis-edit-modal-title-${type}`}
        aria-describedby={
          allowsMultipleSelection
            ? `analysis-edit-modal-guide-${type}`
            : undefined
        }
      >
        {/* [추가] 모달 상단 드래그 표시 */}
        <div className="analysis-edit-modal__handle" aria-hidden="true" />

        {/* [추가] 현재 수정 항목 제목 */}
        <h2
          className={`analysis-edit-modal__title ${
            allowsMultipleSelection
              ? "analysis-edit-modal__title--with-guide"
              : ""
          }`}
          id={`analysis-edit-modal-title-${type}`}
        >
          {modalData.title}
        </h2>

        {/* [추가] 사이즈·컬러 모달에만 최대 선택 개수 안내 표시 */}
        {allowsMultipleSelection && (
          <p
            className="analysis-edit-modal__selection-guide"
            id={`analysis-edit-modal-guide-${type}`}
          >
            최대 2개까지 선택가능합니다.
          </p>
        )}

        {/* [수정] 모달 종류별 선택 개수 제한이 적용되는 선택 항목 */}
        <div
          className={`analysis-edit-modal__options analysis-edit-modal__options--${type}`}
        >
          {modalData.options.map((option) => {
            const isSelected = selectedValues.includes(option.value);

            return (
              <button
                className={`analysis-edit-modal__option analysis-edit-modal__option--${type} ${
                  isSelected ? "analysis-edit-modal__option--selected" : ""
                }`}
                type="button"
                aria-pressed={isSelected}
                key={option.value}
                onClick={() => handleOptionClick(option.value)}
              >
                {/* [추가] 사이즈·컬러 항목 이미지 */}
                {option.image && (
                  <img
                    className={`analysis-edit-modal__image analysis-edit-modal__image--${type}`}
                    src={option.image}
                    alt=""
                    aria-hidden="true"
                  />
                )}

                <span className="analysis-edit-modal__option-label">
                  {option.value}
                </span>
              </button>
            );
          })}
        </div>

        {/* [수정] 선택 여부와 관계없이 항상 활성화되는 수정 완료 버튼 */}
        <button
          className="analysis-edit-modal__save-button"
          type="button"
          onClick={handleSave}
        >
          수정완료
        </button>
      </section>
    </div>
  );
}

export default AnalysisEditModal;
