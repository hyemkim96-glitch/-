/**
 * 대출 상품 정의 (PRD 기준)
 */
export const LOAN_PRODUCTS = [
  {
    id: 'youth',
    name: '청년버팀목전세자금',
    rate: 2.1,
    maxLoan: 10000, // 만원 단위 (1억)
    condition: '만 19~34세, 연소득 5000만원 이하',
  },
  {
    id: 'basic',
    name: '버팀목전세자금',
    rate: 2.7,
    maxLoan: 12000, // 1.2억
    condition: '연소득 5000만원 이하',
  },
  {
    id: 'general',
    name: '일반 전세자금대출',
    rate: 4.5,
    maxLoan: 50000, // 5억
    condition: '소득 제한 없음',
  },
];

/**
 * 대출 한도 계산
 * @param {'youth'|'basic'|'general'} type 대출 상품 ID
 * @param {number} depositAmount 전세/보증금 (만원)
 * @param {number} income 연소득 (만원)
 * @param {number} age 나이
 * @returns {{ limit: number, product: object, eligible: boolean }}
 */
export function getLoanLimit(type, depositAmount, income, age) {
  const product = LOAN_PRODUCTS.find((p) => p.id === type) || LOAN_PRODUCTS[2];

  let eligible = true;
  if (type === 'youth' && (age > 34 || income > 5000)) eligible = false;
  if (type === 'basic' && income > 5000) eligible = false;

  // 전세가의 최대 80% 또는 상품 한도 중 낮은 값
  const byDeposit = Math.floor(depositAmount * 0.8);
  const limit = eligible ? Math.min(byDeposit, product.maxLoan) : 0;

  return { limit, product, eligible };
}

/**
 * 월 고정비 계산
 * @param {number} depositAmount 전세/보증금 (만원)
 * @param {number} asset 보유 자산 (만원)
 * @param {number} loanRate 대출 금리 (%, 연)
 * @param {number} monthlyRent 월세 (만원, 전세면 0)
 * @param {number} maintenanceFee 관리비 (만원)
 * @returns {{ loanAmount: number, monthlyInterest: number, totalMonthly: number, capitalNeeded: number }}
 */
export function calcMonthly(depositAmount, asset, loanRate, monthlyRent, maintenanceFee) {
  const capitalNeeded = Math.max(0, depositAmount - asset);
  const loanAmount = capitalNeeded; // 단순화: 부족분 전액 대출
  const monthlyInterest = Math.round((loanAmount * (loanRate / 100)) / 12);
  const totalMonthly = monthlyInterest + (monthlyRent || 0) + (maintenanceFee || 0);
  return { loanAmount, monthlyInterest, totalMonthly, capitalNeeded };
}
