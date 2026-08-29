import { describe, it, expect } from 'vitest';
import { calcLoanInterest } from '../lib/loan';

const RATES = { policyRate: 3.0, generalRate: 4.5 };

describe('calcLoanInterest', () => {
  it('자산이 보증금 이상이면 대출 0', () => {
    const r = calcLoanInterest({ deposit: 10000, asset: 12000, annualIncome: 3000, loanType: '버팀목', ...RATES });
    expect(r).toMatchObject({ monthlyInterest: 0, loanAmount: 0, coverable: true, note: null });
  });

  it('필요액이 정책 한도 이내면 정책 금리로만 계산', () => {
    // 필요액 5,000만 ≤ min(80%*15000=12000, 버팀목 12000) → 전액 정책금리 3%
    const r = calcLoanInterest({ deposit: 15000, asset: 10000, annualIncome: 3000, loanType: '버팀목', ...RATES });
    expect(r.monthlyInterest).toBe(Math.round((5000 * 0.03) / 12)); // 12.5 → 13
    expect(r.note).toBeNull();
  });

  it('버팀목 한도(1.2억) 초과분은 일반 금리 블렌딩', () => {
    // deposit 20000, asset 0 → 필요 20000. 80% 한도 16000. 정책 한도 12000.
    // coverable: 20000 > 16000 → 커버 불가!
    const r = calcLoanInterest({ deposit: 20000, asset: 0, annualIncome: 3000, loanType: '버팀목', ...RATES });
    expect(r.coverable).toBe(false);
  });

  it('80% 이내지만 정책 한도 초과 → 블렌딩 + note', () => {
    // deposit 20000, asset 5000 → 필요 15000. 80% 한도 16000 (OK). 정책 한도 12000.
    // 12000 @3% + 3000 @4.5%
    const r = calcLoanInterest({ deposit: 20000, asset: 5000, annualIncome: 3000, loanType: '버팀목', ...RATES });
    const expected = Math.round((12000 * 0.03 + 3000 * 0.045) / 12);
    expect(r.monthlyInterest).toBe(expected);
    expect(r.note).toContain('한도 초과분');
    expect(r.coverable).toBe(true);
  });

  it('세전 연봉 5천 초과 → 정책상품 자격 없음, 전액 일반 금리 + note', () => {
    const r = calcLoanInterest({ deposit: 15000, asset: 10000, annualIncome: 6000, loanType: '버팀목', ...RATES });
    expect(r.monthlyInterest).toBe(Math.round((5000 * 0.045) / 12));
    expect(r.note).toContain('소득 요건');
  });

  it('일반 전세대출은 소득 무관, 80%까지 일반 금리', () => {
    const r = calcLoanInterest({ deposit: 15000, asset: 3000, annualIncome: 9000, loanType: '일반', policyRate: 4.5, generalRate: 4.5 });
    // 필요 12000, 80% 한도 12000 → OK, 전액 4.5%
    expect(r.monthlyInterest).toBe(Math.round((12000 * 0.045) / 12));
    expect(r.coverable).toBe(true);
    expect(r.note).toBeNull();
  });

  it('청년버팀목 한도는 1억', () => {
    // deposit 15000, asset 0 → 필요 15000. 80% 한도 12000 → 커버 불가
    const over = calcLoanInterest({ deposit: 15000, asset: 0, annualIncome: 3000, loanType: '청년버팀목', ...RATES });
    expect(over.coverable).toBe(false);
    // deposit 15000, asset 4000 → 필요 11000. 80% 한도 12000 OK. 청년 한도 10000.
    // 10000 @3% + 1000 @4.5%
    const blend = calcLoanInterest({ deposit: 15000, asset: 4000, annualIncome: 3000, loanType: '청년버팀목', ...RATES });
    expect(blend.monthlyInterest).toBe(Math.round((10000 * 0.03 + 1000 * 0.045) / 12));
  });
});
