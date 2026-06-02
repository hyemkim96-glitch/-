// GET /api/prices?lawdCd=11440&umdNm=합정동
// 국토교통부 실거래가 API로 전월세 평균 시세 조회
// 원룸(연립다세대+단독다가구), 오피스텔, 아파트 세 유형 지원

const BASE = 'http://apis.data.go.kr/1613000';

async function fetchAll(url) {
  try {
    const r = await fetch(url);
    const text = await r.text();
    const items = [...text.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => {
      const get = (tag) => {
        const match = m[1].match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
        return match ? match[1].trim() : '';
      };
      return {
        deposit: parseInt(get('보증금액').replace(/,/g, '') || get('보증금').replace(/,/g, '') || '0', 10),
        rent: parseInt(get('월세금액').replace(/,/g, '') || get('월세').replace(/,/g, '') || '0', 10),
        area: parseFloat(get('전용면적') || '0'),
        type: get('건물유형') || '',
        dong: (get('법정동') || get('법정동명') || '').trim(),
      };
    });
    return items;
  } catch {
    return [];
  }
}

function recentMonths(n) {
  const months = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    months.push(`${y}${m}`);
    d.setMonth(d.getMonth() - 1);
  }
  return months;
}

function avg(arr) {
  if (!arr.length) return null;
  return Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);
}

// 원룸 기준: 전용면적 33㎡ 이하
function isOneroom(area) { return area > 0 && area <= 33; }
// 투룸 기준: 33~66㎡
function isTworoom(area) { return area > 33 && area <= 66; }

export default async function handler(req, res) {
  const { lawdCd, umdNm } = req.query;
  const key = process.env.MOLIT_API_KEY;

  if (!key) return res.json({ error: 'MOLIT_API_KEY not set' });
  if (!lawdCd || !umdNm) return res.json({ error: 'lawdCd, umdNm required' });

  const months = recentMonths(3);
  const encodedKey = encodeURIComponent(key);

  // 세 유형 × 3개월 병렬 호출
  const allItems = (await Promise.all(months.flatMap((ym) => [
    // 연립·다세대 (빌라, 원룸 포함)
    fetchAll(`${BASE}/RTMSOBJSvc/getRTMSDataSvcRHRent?serviceKey=${encodedKey}&pageNo=1&numOfRows=1000&DEAL_YMD=${ym}&LAWD_CD=${lawdCd}&_type=xml`),
    // 단독·다가구 (원룸, 고시원 등)
    fetchAll(`${BASE}/RTMSOBJSvc/getRTMSDataSvcSHRent?serviceKey=${encodedKey}&pageNo=1&numOfRows=1000&DEAL_YMD=${ym}&LAWD_CD=${lawdCd}&_type=xml`),
    // 오피스텔
    fetchAll(`${BASE}/RTMSOBJSvc/getRTMSDataSvcOffiRent?serviceKey=${encodedKey}&pageNo=1&numOfRows=1000&DEAL_YMD=${ym}&LAWD_CD=${lawdCd}&_type=xml`),
    // 아파트
    fetchAll(`${BASE}/RTMSOBJSvc/getRTMSDataSvcApartRent?serviceKey=${encodedKey}&pageNo=1&numOfRows=1000&DEAL_YMD=${ym}&LAWD_CD=${lawdCd}&_type=xml`),
  ]))).flat().filter((item) => {
    // 해당 동 필터 (umdNm이 포함된 경우만)
    return true; // lawdCd가 시군구 코드라 동 필터는 클라이언트에서
  });

  // 유형별 분류
  const oneroom = allItems.filter((i) => isOneroom(i.area));
  const tworoom = allItems.filter((i) => isTworoom(i.area));
  const apt = allItems; // 아파트는 면적 무관 (별도 구분 필요 시 추후 분리)

  const jeonsaItems = (arr) => arr.filter((i) => i.rent === 0 && i.deposit > 0);
  const wolseItems  = (arr) => arr.filter((i) => i.rent > 0);

  const oneroomStats = (arr) => ({
    jeonsa: avg(jeonsaItems(arr).map((i) => Math.round(i.deposit / 10000))),
    wolseDeposit: avg(wolseItems(arr).map((i) => Math.round(i.deposit / 10000))),
    wolseRent: avg(wolseItems(arr).map((i) => i.rent)),
    count: arr.length,
  });

  // 동별 원룸 시세 분류 (법정동명 기준)
  const dongMap = {};
  oneroom.forEach((item) => {
    if (!item.dong) return;
    // '합정' → '합정동', '성수동1가'/'당산2가' 등 가·숫자 결미는 그대로 유지
    const key = /[동가\d]$/.test(item.dong) ? item.dong : item.dong + '동';
    if (!dongMap[key]) dongMap[key] = [];
    dongMap[key].push(item);
  });
  const byDong = Object.fromEntries(
    Object.entries(dongMap).map(([dong, items]) => [dong, oneroomStats(items)])
  );

  res.json({
    oneroom: oneroomStats(oneroom),
    tworoom: {
      jeonsa: avg(jeonsaItems(tworoom).map((i) => Math.round(i.deposit / 10000))),
      wolseDeposit: avg(wolseItems(tworoom).map((i) => Math.round(i.deposit / 10000))),
      wolseRent: avg(wolseItems(tworoom).map((i) => i.rent)),
      count: tworoom.length,
    },
    byDong,
    months,
    total: allItems.length,
  });
}
