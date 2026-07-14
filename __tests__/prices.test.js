// __tests__/prices.test.js
// 국토부 실거래가 API 응답 파싱(parseItems)과 층 분류(classifyFloor)는
// 커밋 로그에 반복적으로 등장하는 버그 수정 대상이라 회귀 방지용 테스트를 둔다.
//
// pages/ 바로 밑이 아니라 별도 __tests__/에 둔 이유: Next.js pages 라우터는
// pages/ 하위 모든 파일을 라우트로 취급해서, pages/api/ 밑에 테스트를 두면
// /api/__tests__/prices.test 같은 실제 API 엔드포인트가 배포되어 버린다.
import { describe, it, expect } from 'vitest';
import { classifyFloor, parseItems } from '../pages/api/prices';

describe('classifyFloor', () => {
  it('반지하로 분류', () => {
    expect(classifyFloor('반지하')).toBe('반지하');
    expect(classifyFloor('반지')).toBe('반지하');
    expect(classifyFloor('지하1')).toBe('반지하');
    expect(classifyFloor('B1')).toBe('반지하');
    expect(classifyFloor('-1')).toBe('반지하');
  });

  it('옥탑으로 분류', () => {
    expect(classifyFloor('옥탑')).toBe('옥탑');
    expect(classifyFloor('옥탑방')).toBe('옥탑');
  });

  it('그 외는 일반으로 분류', () => {
    expect(classifyFloor('3')).toBe('일반');
    expect(classifyFloor('1')).toBe('일반');
    expect(classifyFloor('')).toBe('일반');
    expect(classifyFloor(undefined)).toBe('일반');
    expect(classifyFloor(null)).toBe('일반');
  });
});

describe('parseItems', () => {
  it('신규 API(영문 필드명)를 파싱', () => {
    const xml = `
      <response><body><items>
        <item>
          <deposit>5,000</deposit>
          <monthlyRent>0</monthlyRent>
          <excluUseAr>23.5</excluUseAr>
          <umdNm>역삼동</umdNm>
          <층>3</층>
        </item>
      </items></body></response>
    `;
    const items = parseItems(xml);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      deposit: 5000,
      rent: 0,
      area: 23.5,
      dong: '역삼동',
      floor: '3',
    });
  });

  it('구 API(한글 필드명)를 파싱', () => {
    const xml = `
      <item>
        <보증금액>3,000</보증금액>
        <월세금액>50</월세금액>
        <전용면적>19.8</전용면적>
        <법정동>성수동1가</법정동>
        <층>반지하</층>
      </item>
    `;
    const items = parseItems(xml);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      deposit: 3000,
      rent: 50,
      area: 19.8,
      dong: '성수동1가',
      floor: '반지하',
    });
  });

  it('여러 item을 모두 파싱', () => {
    const xml = `
      <item><deposit>1,000</deposit><monthlyRent>30</monthlyRent><excluUseAr>15</excluUseAr><umdNm>망원동</umdNm></item>
      <item><deposit>2,000</deposit><monthlyRent>0</monthlyRent><excluUseAr>20</excluUseAr><umdNm>합정동</umdNm></item>
    `;
    expect(parseItems(xml)).toHaveLength(2);
  });

  it('필드가 없으면 안전한 기본값(0 / 빈 문자열)을 채움', () => {
    const xml = `<item></item>`;
    const items = parseItems(xml);
    expect(items[0]).toMatchObject({ deposit: 0, rent: 0, area: 0, dong: '', floor: '' });
  });

  it('item이 없으면 빈 배열', () => {
    expect(parseItems('<response><body></body></response>')).toEqual([]);
  });
});
