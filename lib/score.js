// 추천 점수 알고리즘
// 핵심 철학: "직주근접"이 최우선, 그 위에서 "가격이 적정한" 집을 고른다.
// 각 세부 점수는 0~1로 정규화하고, 가중치를 곱해 종합 점수(0~100)를 만든다.

export const WEIGHTS = {
  commute: 0.50, // 직주근접 — 이 서비스의 핵심
  price: 0.35,   // 가격 적정성 — 소득 대비 월 고정비 부담
  life: 0.15,    // 생활 편의 — 보조 지표
};

// 월 고정비가 소득에서 이 비율을 넘으면 "감당 불가"로 보고 후보에서 제외
export const MAX_AFFORDABLE_RATIO = 0.70;

/**
 * 출퇴근 근접도 (0~1)
 * 가까울수록 1에 수렴. 직주근접이 핵심이므로 가중치가 가장 크다.
 *   5분 이하  → 1.0
 *  10분      → 0.97
 *  20분      → 0.90
 *  30분      → 0.80
 *  45분      → 0.55
 *  60분      → 0.25
 *  90분      → 0.0
 */
export function commuteScore(minutes) {
  if (minutes <= 5)  return 1;
  if (minutes <= 10) return 1    - ((minutes - 5)  / 5)  * 0.03; // 1.00 → 0.97
  if (minutes <= 20) return 0.97 - ((minutes - 10) / 10) * 0.07; // 0.97 → 0.90
  if (minutes <= 30) return 0.90 - ((minutes - 20) / 10) * 0.10; // 0.90 → 0.80
  if (minutes <= 45) return 0.80 - ((minutes - 30) / 15) * 0.25; // 0.80 → 0.55
  if (minutes <= 60) return 0.55 - ((minutes - 45) / 15) * 0.30; // 0.55 → 0.25
  if (minutes <= 90) return 0.25 - ((minutes - 60) / 30) * 0.25; // 0.25 → 0.00
  return 0;
}

/**
 * 가격 적정성 (0~1)
 * 월 고정비(대출이자 + 월세 + 관리비)가 월 소득에서 차지하는 비율(r) 기준.
 * 연속 감소 함수라 "출퇴근이 같으면 싼 집이 항상 높은 점수"를 보장한다.
 *  r ≤ 20% → ~1.0 (매우 여유)
 *  r = 30% → ~0.70
 *  r = 50% → ~0.25
 *  r ≥ 70% → 0 (부담 과다, 사실상 제외 대상)
 * 소득 정보가 없으면 월 고정비 절대값 기준으로 평가한다.
 */
export function priceScore(monthlyCost, income) {
  if (!income || income <= 0) return priceScoreAbsolute(monthlyCost);
  const r = monthlyCost / income;
  if (r <= 0.20) return 1 - (r / 0.20) * 0.10;            // 1.00 → 0.90
  if (r <= 0.35) return 0.90 - ((r - 0.20) / 0.15) * 0.30; // 0.90 → 0.60
  if (r <= 0.50) return 0.60 - ((r - 0.35) / 0.15) * 0.35; // 0.60 → 0.25
  if (r <= 0.70) return 0.25 - ((r - 0.50) / 0.20) * 0.25; // 0.25 → 0.00
  return 0;
}

// 소득 미입력 시: 월 고정비 절대값 기준 (만원)
function priceScoreAbsolute(monthlyCost) {
  if (monthlyCost <= 40) return 1;
  if (monthlyCost <= 70) return 1 - ((monthlyCost - 40) / 30) * 0.30;    // 1.00 → 0.70
  if (monthlyCost <= 100) return 0.70 - ((monthlyCost - 70) / 30) * 0.35; // 0.70 → 0.35
  if (monthlyCost <= 150) return 0.35 - ((monthlyCost - 100) / 50) * 0.35; // 0.35 → 0.00
  return 0;
}

/**
 * 생활 편의 (0~1)
 * 지하철·편의점·마트·병원 수를 가중 합산한 뒤 후보 지역 중 최댓값으로 정규화.
 */
export function lifeScore(facilities, allFacilities) {
  const sum = (f) =>
    (f.subway || 0) * 3 + (f.store || 0) * 1 + (f.mart || 0) * 2 + (f.hospital || 0) * 1.5;

  const my = sum(facilities);
  if (!allFacilities || allFacilities.length === 0) {
    return Math.min(1, my / 25);
  }
  const max = Math.max(...allFacilities.map(sum));
  if (max <= 0) return 0;
  return Math.min(1, my / max);
}

/**
 * 종합 점수 (0~100)
 * 세부 점수(0~1)에 가중치를 곱해 합산.
 */
export function totalScore(commute, price, life) {
  const raw =
    commute * WEIGHTS.commute +
    price * WEIGHTS.price +
    life * WEIGHTS.life;
  return Math.round(Math.min(1, Math.max(0, raw)) * 100);
}
