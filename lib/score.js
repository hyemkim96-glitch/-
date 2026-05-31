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
 * 시세 점수 (40점 만점)
 * avgPrice 대비 itemPrice가 낮을수록 높은 점수
 */
export function priceScore(itemPrice, avgPrice) {
  if (!avgPrice || !itemPrice) return 20; // 기본 중간값
  const ratio = itemPrice / avgPrice;
  if (ratio <= 0.85) return 40;
  if (ratio <= 0.95) return Math.round(40 - ((ratio - 0.85) / 0.10) * 8);
  if (ratio <= 1.05) return Math.round(32 - ((ratio - 0.95) / 0.10) * 8);
  if (ratio <= 1.20) return Math.round(24 - ((ratio - 1.05) / 0.15) * 14);
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
