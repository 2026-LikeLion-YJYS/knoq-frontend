import deleteIcon from "../../assets/icons/pin-delete.svg";

// [수정] 로그인 요청 상태와 중복 요청 방지를 위한 React 기능
import { useRef, useState } from "react";

// [추가] 직원 매장 로그인 API
import { createStaffSession } from "../../api/staffApi";

// [추가] 로그인 성공 시 직원 토큰 저장 함수
import { setStaffToken } from "../../utils/storage";

// [추가] 직원 PIN 로그인 화면 스타일
import "./StaffLogin.css";

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

  // [추가] 직원 로그인 API 요청 진행 여부
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);

  // [추가] 상태 갱신 전 빠른 연속 입력으로 발생하는 중복 요청을 차단합니다.
  const isLoginSubmittingRef = useRef(false);

  /**
   * [추가] 4자리 PIN으로 직원 로그인을 요청하고 성공 토큰을 저장합니다.
   */
  const requestStaffLogin = async (completedPin) => {
    if (isLoginSubmittingRef.current) {
      return;
    }

    isLoginSubmittingRef.current = true;
    setIsLoginSubmitting(true);
    setErrorMessage("");

    try {
      const response = await createStaffSession(completedPin);

      if (!response?.staffToken) {
        throw new Error("직원 로그인 토큰이 응답에 없습니다.");
      }

      setStaffToken(response.staffToken);
      onLogin?.();
    } catch {
      setErrorMessage("비밀번호를 다시 확인해주세요.");
      setPin("");
    } finally {
      isLoginSubmittingRef.current = false;
      setIsLoginSubmitting(false);
    }
  };

  /**
   * 숫자 버튼을 눌렀을 때 PIN을 한 자리 추가한다.
   */
  const handleNumberClick = (number) => {
    if (isLoginSubmittingRef.current || pin.length >= PIN_LENGTH) {
      return;
    }

    setErrorMessage("");
    const nextPin = `${pin}${number}`;

    setPin(nextPin);

    if (nextPin.length === PIN_LENGTH) {
      requestStaffLogin(nextPin);
    }
  };

  /**
   * 삭제 버튼을 눌렀을 때 마지막 숫자를 제거한다.
   */
  const handleDelete = () => {
    if (isLoginSubmittingRef.current) {
      return;
    }

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
              disabled={isLoginSubmitting}
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
            disabled={isLoginSubmitting}
            onClick={() => handleNumberClick("0")}
            aria-label="0 입력"
          >
            0
          </button>

          {/* [추가] 마지막 PIN 숫자 삭제 버튼 */}
          <button
            className="staff-login__delete-button"
            type="button"
            disabled={isLoginSubmitting}
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
