// GET /api/prices?lawdCd=11440
// 국토교통부 실거래가 API로 전월세 평균 시세 조회
// 원룸(연립다세대+단독다가구+오피스텔) 지원

const BASE = 'https://apis.data.go.kr/1613000';

const _cache = {};
const CACHE_TTL = 6 * 60 * 60 * 1000;


function parseItems(text, source) {
  return [...text.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => {
    const get = (tag) => {
      const match = m[1].match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
      return match ? match[1].trim() : '';
    };
    const depositRaw = get('deposit') || get('보증금액') || get('보증금');
    const rentRaw    = get('monthlyRent') || get('월세금액') || get('월세');
    const areaRaw    = get('excluUseAr') || get('totalFloorAr') || get('전용면적');
    return {
      deposit: parseInt(depositRaw.replace(/,/g, '') || '0', 10),
      rent:    parseInt(rentRaw.replace(/,/g, '') || '0', 10),
      area:    parseFloat(areaRaw || '0'),
      dong:    (get('umdNm') || get('법정동') || get('법정동명')).trim(),
      source,
    };
  });
}

async function fetchAll(url, source) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const text = await r.text();
    const resultCode = text.match(/<resultCode>([^<]+)<\/resultCode>/)?.[1];
    // 000: 정상, 022: 요청 제한 → 500ms 후 1회 재시도
    if (resultCode === '022') {
      await new Promise((res) => setTimeout(res, 500));
      const r2 = await fetch(url, { signal: AbortSignal.timeout(10000) });
      const text2 = await r2.text();
      const code2 = text2.match(/<resultCode>([^<]+)<\/resultCode>/)?.[1];
      if (code2 && code2 !== '000') return { error: code2, items: [] };
      return { error: null, items: parseItems(text2, source) };
    }
    if (resultCode && resultCode !== '000') return { error: resultCode, items: [] };
    return { error: null, items: parseItems(text, source) };
  } catch (e) {
    return { error: e?.name === 'TimeoutError' ? 'TIMEOUT' : 'FETCH_ERROR', items: [] };
  }
}

function recentMonths(n) {
  const months = [];
  const d = new Date();
  d.setMonth(d.getMonth() - 2);
  for (let i = 0; i < n; i++) {
    months.push(`${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`);
    d.setMonth(d.getMonth() - 1);
  }
  return months;
}

function avg(arr) {
  if (!arr.length) return null;
  return Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);
}

function isOneroom(area) { return area > 0 && area <= 33; }
function isTworoom(area) { return area > 33 && area <= 66; }

export default async function handler(req, res) {
  const { lawdCd } = req.query;
  const key = process.env.MOLIT_API_KEY;

  if (!key) return res.json({ error: 'MOLIT_API_KEY not set' });
  if (!lawdCd) return res.json({ error: 'lawdCd required' });

  const hit = _cache[lawdCd];
  if (hit && Date.now() - hit.ts < CACHE_TTL) {
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=43200');
    return res.json(hit.data);
  }

  // 공식 문서 기준 URL: /1613000/{ServiceName}/{operationName}
  const endpoints = [
    'RTMSDataSvcRHRent/getRTMSDataSvcRHRent',
    'RTMSDataSvcSHRent/getRTMSDataSvcSHRent',
    'RTMSDataSvcOffiRent/getRTMSDataSvcOffiRent',
  ];

  const months = recentMonths(3);
  const rawResults = await Promise.all(
    months.flatMap((ym) =>
      endpoints.map((ep) => {
        const source = ep.includes('Offi') ? '오피스텔' : ep.includes('RH') ? '연립다세대' : '단독다가구';
        return fetchAll(`${BASE}/${ep}?serviceKey=${key.trim()}&pageNo=1&numOfRows=1000&DEAL_YMD=${ym}&LAWD_CD=${lawdCd}`, source);
      })
    )
  );

  const errors = rawResults.map((r) => r.error).filter(Boolean);
  const allItems = rawResults.flatMap((r) => r.items);

  const oneroom = allItems.filter((i) => isOneroom(i.area));
  const tworoom = allItems.filter((i) => isTworoom(i.area));

  const jeonsaItems = (arr) => arr.filter((i) => i.rent === 0 && i.deposit > 0);
  const wolseItems  = (arr) => arr.filter((i) => i.rent > 0);

  const oneroomStats = (arr) => ({
    jeonsa:       avg(jeonsaItems(arr).map((i) => i.deposit)),
    wolseDeposit: avg(wolseItems(arr).map((i) => i.deposit)),
    wolseRent:    avg(wolseItems(arr).map((i) => i.rent)),
    count: arr.length,
  });

  const offiItems = allItems.filter((i) => i.source === '오피스텔' && isOneroom(i.area));

  function buildDongMap(arr) {
    const map = {};
    arr.forEach((item) => {
      if (!item.dong) return;
      const k = /[동가\d]$/.test(item.dong) ? item.dong : item.dong + '동';
      if (!map[k]) map[k] = [];
      map[k].push(item);
    });
    return map;
  }

  const data = {
    oneroom: oneroomStats(oneroom),
    tworoom: oneroomStats(tworoom),
    offi:    oneroomStats(offiItems),
    byDong: Object.fromEntries(
      Object.entries(buildDongMap(oneroom)).map(([dong, items]) => [dong, oneroomStats(items)])
    ),
    byDongTworoom: Object.fromEntries(
      Object.entries(buildDongMap(tworoom)).map(([dong, items]) => [dong, oneroomStats(items)])
    ),
    byDongOffi: Object.fromEntries(
      Object.entries(buildDongMap(offiItems)).map(([dong, items]) => [dong, oneroomStats(items)])
    ),
    months,
    total: allItems.length,
    _errors: errors.length ? errors : undefined,
  };

  if (data.oneroom?.jeonsa || data.oneroom?.wolseRent) {
    _cache[lawdCd] = { data, ts: Date.now() };
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=43200');
  } else {
    res.setHeader('Cache-Control', 'no-store');
  }

  res.json(data);
}
