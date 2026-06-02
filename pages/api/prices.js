// GET /api/prices?lawdCd=11440
// 국토교통부 실거래가 API로 전월세 평균 시세 조회
// 원룸(연립다세대+단독다가구+오피스텔) 지원

const BASE = 'http://apis.data.go.kr/1613000';

// 서버 사이드 캐시 — 같은 lawdCd는 6시간 동안 MOLIT 재호출 없음
// (실거래 데이터는 하루에 몇 번만 갱신되므로 per-request 호출은 낭비)
const _cache = {};
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6시간

function classifyFloor(s) {
  const t = String(s || '').trim();
  if (/반지하|반지/.test(t)) return '반지하';
  if (/옥탑/.test(t)) return '옥탑';
  if (/지하|^[Bb]\d*$/.test(t) || (/^-?\d+$/.test(t) && parseInt(t) < 0)) return '반지하';
  return '일반';
}

async function fetchAll(url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const text = await r.text();
    const errCode = text.match(/<returnReasonCode>(\d+)<\/returnReasonCode>/)?.[1];
    // 22: 서비스 요청 제한 — 500ms 후 1회 재시도
    if (errCode === '22') {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const r2 = await fetch(url, { signal: AbortSignal.timeout(10000) });
      const text2 = await r2.text();
      const code2 = text2.match(/<returnReasonCode>(\d+)<\/returnReasonCode>/)?.[1];
      if (code2) return { error: code2, items: [] };
      const items2 = [...text2.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => {
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
          floor: get('층') || '',
        };
      });
      return { error: null, items: items2 };
    }
    if (errCode) return { error: errCode, items: [] };
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
        floor: get('층') || '',
      };
    });
    return { error: null, items };
  } catch (e) {
    return { error: e?.name === 'TimeoutError' ? 'TIMEOUT' : 'FETCH_ERROR', items: [] };
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
  const { lawdCd } = req.query;
  const key = process.env.MOLIT_API_KEY;

  if (!key) return res.json({ error: 'MOLIT_API_KEY not set' });
  if (!lawdCd) return res.json({ error: 'lawdCd required' });

  // 캐시 히트: 6시간 내 동일 lawdCd 요청은 MOLIT 재호출 없이 즉시 반환
  const hit = _cache[lawdCd];
  if (hit && Date.now() - hit.ts < CACHE_TTL) {
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=43200');
    return res.json(hit.data);
  }

  const months = recentMonths(2);
  const encodedKey = encodeURIComponent(key);

  // 모든 MOLIT 호출을 순차 처리 (rate limit 방지: 동시 호출 1개)
  const endpoints = [
    'getRTMSDataSvcRHRent',
    'getRTMSDataSvcSHRent',
    'getRTMSDataSvcOffiRent',
  ];
  const rawResults = [];
  for (const ym of months) {
    for (const ep of endpoints) {
      rawResults.push(
        await fetchAll(`${BASE}/RTMSOBJSvc/${ep}?serviceKey=${encodedKey}&pageNo=1&numOfRows=1000&DEAL_YMD=${ym}&LAWD_CD=${lawdCd}&_type=xml`)
      );
    }
  }

  const errors = rawResults.map((r) => r.error).filter(Boolean);
  const allItems = rawResults.flatMap((r) => r.items);

  const oneroom = allItems.filter((i) => isOneroom(i.area));
  const tworoom = allItems.filter((i) => isTworoom(i.area));

  const jeonsaItems = (arr) => arr.filter((i) => i.rent === 0 && i.deposit > 0);
  const wolseItems  = (arr) => arr.filter((i) => i.rent > 0);

  const oneroomStats = (arr) => ({
    jeonsa: avg(jeonsaItems(arr).map((i) => Math.round(i.deposit / 10000))),
    wolseDeposit: avg(wolseItems(arr).map((i) => Math.round(i.deposit / 10000))),
    wolseRent: avg(wolseItems(arr).map((i) => i.rent)),
    count: arr.length,
  });

  const dongMap = {};
  oneroom.forEach((item) => {
    if (!item.dong) return;
    const k = /[동가\d]$/.test(item.dong) ? item.dong : item.dong + '동';
    if (!dongMap[k]) dongMap[k] = [];
    dongMap[k].push(item);
  });
  const byDong = Object.fromEntries(
    Object.entries(dongMap).map(([dong, items]) => [dong, oneroomStats(items)])
  );

  const floorGroups = { '일반': [], '반지하': [], '옥탑': [] };
  oneroom.forEach((item) => {
    const fc = classifyFloor(item.floor);
    if (floorGroups[fc]) floorGroups[fc].push(item);
    else floorGroups['일반'].push(item);
  });

  const data = {
    oneroom: oneroomStats(oneroom),
    tworoom: {
      jeonsa: avg(jeonsaItems(tworoom).map((i) => Math.round(i.deposit / 10000))),
      wolseDeposit: avg(wolseItems(tworoom).map((i) => Math.round(i.deposit / 10000))),
      wolseRent: avg(wolseItems(tworoom).map((i) => i.rent)),
      count: tworoom.length,
    },
    byDong,
    byFloor: Object.fromEntries(
      Object.entries(floorGroups).map(([k, v]) => [k, oneroomStats(v)])
    ),
    months,
    total: allItems.length,
    _errors: errors.length ? errors : undefined,
  };

  // 실제 데이터가 있을 때만 캐시 저장 (에러 응답은 캐시 안 함)
  if (data.oneroom?.jeonsa || data.oneroom?.wolseRent) {
    _cache[lawdCd] = { data, ts: Date.now() };
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=43200');
  } else {
    res.setHeader('Cache-Control', 'no-store');
  }

  res.json(data);
}
