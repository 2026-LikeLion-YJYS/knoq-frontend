// 알림 생성 시각을 기준으로 상대 시간 문자열을 반환합니다.
// 방금 전 (1분 미만) → N분 전 (1시간 미만) → N시간 전 (24시간 미만) → N일 전

export function formatRelativeTime(createdAt) {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "방금 전";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;

  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}일 전`;
}