/**
 * 전세자금 대출 계산
 *
 * 상품: 버팀목 / 청년버팀목 / 일반 전세대출
 * - 정책상품(버팀목·청년버팀목)은 최대 한도가 있고, 세전 연소득 요건이 있다.
 * - 필요 대출액이 정책 한도를 넘거나 소득 요건을 못 맞추면, 초과분(또는 전액)은
 *   일반 전세대출 금리로 계산한다. (사용자 요청: "한도 초과분은 일반 타사 대출")
 * - 어떤 상품이든 전세가의 80%를 초과해 빌릴 수는 없다고 본다.
 */

// 정책상품 최대 대출 한도 (만원). 일반 전세대출은 별도 정책 한도 없음.
export const LOAN_MAX = {
  '버팀목': 12000,      // 1.2억
  '청년버팀목': 10000,  // 1억
  '일반': Infinity,
};

// 버팀목·청년버팀목 세전 연소득 요건 (만원). 초과 시 정책상품 자격 없음으로 본다.
// (실제로는 부부합산·신혼·다자녀 등에 따라 6천~7.5천 등으로 갈리지만 단순화)
export const INCOME_CEILING = 5000;

// 전세대출 통상 한도: 전세가(보증금)의 80%
export const MAX_LTV = 0.8;

// 일반 전세대출 금리 fallback (%)
export const GENERAL_RATE_FALLBACK = 4.5;

export const LOAN_LABELS = {
  '버팀목': '버팀목',
  '청년버팀목': '청년버팀목',
  '일반': '일반 전세대출',
};

/**
 * 필요 대출액에 대한 월 이자와 커버 가능 여부 계산
 * @param {object} p
 * @param {number} p.deposit       전세보증금(만원)
 * @param {number} p.asset         가용자산(만원)
 * @param {number} p.annualIncome  세전 연봉(만원) — 0이면 소득 요건 미적용
 * @param {'버팀목'|'청년버팀목'|'일반'} p.loanType
 * @param {number} p.policyRate    선택 상품 금리(%). '일반'이면 generalRate와 같은 값을 넘기면 됨
 * @param {number} p.generalRate   일반 전세대출 금리(%)
 * @returns {{ monthlyInterest:number, loanAmount:number, coverable:boolean, note:(string|null) }}
 */
export function calcLoanInterest({ deposit, asset, annualIncome, loanType, policyRate, generalRate }) {
  const need = Math.max(0, Math.round(deposit - asset));
  const ltvCap = Math.floor(deposit * MAX_LTV);
  const gRate = generalRate || GENERAL_RATE_FALLBACK;

  if (need === 0) return { monthlyInterest: 0, loanAmount: 0, coverable: true, note: null };
  // 전세가의 80%를 넘겨야 하면 대출로 커버 불가
  if (need > ltvCap) return { monthlyInterest: 0, loanAmount: need, coverable: false, note: null };

  const isPolicy = loanType === '버팀목' || loanType === '청년버팀목';
  const incomeOk = !isPolicy || annualIncome <= 0 || annualIncome <= INCOME_CEILING;

  // 소득 요건 미달이면 정책 한도 0 (전액 일반대출), 아니면 min(80% 한도, 상품 한도)
  const policyCap = (isPolicy && incomeOk)
    ? Math.min(ltvCap, LOAN_MAX[loanType])
    : (loanType === '일반' ? ltvCap : 0);

  const atPolicy = Math.min(need, policyCap);
  const atGeneral = need - atPolicy;
  const monthlyInterest = Math.round(
    (atPolicy * (policyRate / 100) + atGeneral * (gRate / 100)) / 12
  );

  let note = null;
  if (isPolicy && !incomeOk) note = '세전 연봉이 소득 요건(5,000만원)을 초과해 일반 전세대출 금리로 계산했어요';
  else if (isPolicy && atGeneral > 0) note = `${LOAN_LABELS[loanType]} 한도 초과분은 일반 전세대출 금리로 계산했어요`;

  return { monthlyInterest, loanAmount: need, coverable: true, note };
}
