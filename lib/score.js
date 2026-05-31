/**
 * 출퇴근 점수 (40점 만점)
 * 30분 이하 → 40점, 40분 → 32점, 60분 → 20점, 90분+ → 0점
 */
export function commuteScore(minutes) {
  if (minutes <= 30) return 40;
  if (minutes <= 40) return Math.round(40 - ((minutes - 30) / 10) * 8);
  if (minutes <= 60) return Math.round(32 - ((minutes - 40) / 20) * 12);
  if (minutes <= 90) return Math.round(20 - ((minutes - 60) / 30) * 20);
  return 0;
}

/**
 * 가격 점수 (40점 만점)
 * itemPrice / baseline 비율 기반 — 낮을수록 높은 점수
 * baseline = 소득의 40% (월 고정비 기준) 또는 지역 평균 시세
 */
export function priceScore(itemPrice, baseline) {
  if (!baseline || !itemPrice) return 20;
  const ratio = itemPrice / baseline;
  if (ratio <= 0.6)  return 40;
  if (ratio <= 0.8)  return Math.round(40 - ((ratio - 0.6) / 0.2) * 10);
  if (ratio <= 1.0)  return Math.round(30 - ((ratio - 0.8) / 0.2) * 10);
  if (ratio <= 1.3)  return Math.round(20 - ((ratio - 1.0) / 0.3) * 10);
  return 10;
}

/**
 * 생활 편의 점수 (20점 만점)
 * 지하철, 편의점, 마트, 병원 수 기반, allFacilities 중 정규화
 */
export function lifeScore(facilities, allFacilities) {
  const sum = (f) =>
    (f.subway || 0) * 3 + (f.store || 0) * 1 + (f.mart || 0) * 2 + (f.hospital || 0) * 1.5;

  const myScore = sum(facilities);
  if (!allFacilities || allFacilities.length === 0) {
    // 단독 계산: 합계 10 이상이면 만점
    return Math.min(20, Math.round((myScore / 10) * 20));
  }
  const max = Math.max(...allFacilities.map(sum));
  if (max === 0) return 10;
  return Math.round((myScore / max) * 20);
}

/**
 * 종합 점수
 */
export function totalScore(commute, price, life) {
  return Math.min(100, Math.max(0, commute + price + life));
}
