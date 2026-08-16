import deleteIcon from "../../assets/icons/pin-delete.svg";

// [추가] PIN 입력 상태 관리를 위한 React 기능
import { useEffect, useState } from "react";

// [추가] 직원 PIN 로그인 화면 스타일
import "./StaffLogin.css";

// [추가] API 연동 전 화면 동작 확인용 임시 PIN
const TEMP_PIN = "1234";

// [추가] PIN 최대 입력 길이
const PIN_LENGTH = 4;

// [추가] 숫자 키패드 목록
const KEYPAD_NUMBERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * 직원용 매장 PIN 로그인 화면
 * 4자리 PIN을 확인하고 로그인 성공 또는 오류 상태를 처리한다.
 */
function StaffLogin({ onBack, onLogin }) {
  // [추가] 현재 입력한 PIN
  const [pin, setPin] = useState("");

  // [추가] 잘못된 PIN 입력 안내 상태
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * PIN이 4자리 입력되면 임시 PIN과 비교한다.
   * API 연결 시 POST /staff/sessions 요청으로 교체한다.
   */
  useEffect(() => {
    if (pin.length !== PIN_LENGTH) {
      return undefined;
    }

    // [추가] PIN 4자리 채움 상태를 보여주기 위한 짧은 대기
    const loginTimer = window.setTimeout(() => {
      if (pin === TEMP_PIN) {
        setErrorMessage("");
        onLogin?.();
        return;
      }

      setErrorMessage("비밀번호를 다시 확인해주세요.");
      setPin("");
    }, 300);

    // [추가] 화면 이동 또는 PIN 변경 시 예약된 검사 제거
    return () => window.clearTimeout(loginTimer);
  }, [pin, onLogin]);

  /**
   * 숫자 버튼을 눌렀을 때 PIN을 한 자리 추가한다.
   */
  const handleNumberClick = (number) => {
    setErrorMessage("");

    setPin((previousPin) => {
      if (previousPin.length >= PIN_LENGTH) {
        return previousPin;
      }

      return `${previousPin}${number}`;
    });
  };

  /**
   * 삭제 버튼을 눌렀을 때 마지막 숫자를 제거한다.
   */
  const handleDelete = () => {
    setErrorMessage("");
    setPin((previousPin) => previousPin.slice(0, -1));
  };

  return (
    <main className="staff-login">
      {/* [추가] 상단 로그인 헤더 */}
      <header className="staff-login__header">
        <button
          className="staff-login__back-button"
          type="button"
          onClick={onBack}
          aria-label="직원 로그인 진입 화면으로 돌아가기"
        >
          <span className="staff-login__back-icon" />
        </button>

        <h1 className="staff-login__title">로그인</h1>

        {/* [추가] 제목 중앙 정렬을 위한 빈 영역 */}
        <div className="staff-login__header-space" aria-hidden="true" />
      </header>

      {/* [추가] 잘못된 PIN 오류 메시지 */}
      {errorMessage && (
        <p className="staff-login__error" role="alert">
          {errorMessage}
        </p>
      )}

      <section className="staff-login__content">
        {/* [추가] POS 제목 */}
        <h2 className="staff-login__pos-title">MCM POS</h2>

        {/* [추가] PIN 입력 상태 표시 */}
        <div
          className="staff-login__pin"
          aria-label={`PIN ${pin.length}자리 입력됨`}
        >
          {Array.from({ length: PIN_LENGTH }, (_, index) => (
            <span
              key={index}
              className={`staff-login__pin-circle ${
                index < pin.length ? "staff-login__pin-circle--filled" : ""
              }`}
            />
          ))}
        </div>

        {/* [추가] PIN 숫자 키패드 */}
        <div className="staff-login__keypad">
          {KEYPAD_NUMBERS.map((number) => (
            <button
              key={number}
              className="staff-login__key-button"
              type="button"
              onClick={() => handleNumberClick(number)}
              aria-label={`${number} 입력`}
            >
              {number}
            </button>
          ))}

          {/* [추가] 피그마 하단 왼쪽 장식 */}
          <div className="staff-login__key-placeholder" aria-hidden="true">
            <span className="staff-login__key-line" />
          </div>

          <button
            className="staff-login__key-button"
            type="button"
            onClick={() => handleNumberClick("0")}
            aria-label="0 입력"
          >
            0
          </button>

          {/* [추가] 마지막 PIN 숫자 삭제 버튼 */}
          <button
            className="staff-login__delete-button"
            type="button"
            onClick={handleDelete}
            aria-label="마지막 숫자 삭제"
          >
            <img
              className="staff-login__delete-icon"
              src={deleteIcon}
              alt=""
              aria-hidden="true"
            />
          </button>
        </div>
      </section>
    </main>
  );
}

export default StaffLogin;
