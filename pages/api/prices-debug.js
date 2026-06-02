// GET /api/prices-debug?lawdCd=11440
// MOLIT API 응답 진단용 — 배포 후 삭제
export default async function handler(req, res) {
  const lawdCd = req.query.lawdCd || '11440';
  const key = process.env.MOLIT_API_KEY;

  if (!key) return res.json({ error: 'MOLIT_API_KEY not set' });

  const d = new Date();
  d.setMonth(d.getMonth() - 2);
  const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;

  const endpoints = [
    'RTMSDataSvcRHRent/getRTMSDataSvcRHRent',
    'RTMSDataSvcSHRent/getRTMSDataSvcSHRent',
    'RTMSDataSvcOffiRent/getRTMSDataSvcOffiRent',
  ];

  const results = {};
  for (const ep of endpoints) {
    const name = ep.split('/')[0];
    const url = `https://apis.data.go.kr/1613000/${ep}?serviceKey=${key.trim()}&pageNo=1&numOfRows=100&DEAL_YMD=${ym}&LAWD_CD=${lawdCd}`;
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
      const text = await r.text();
      const floors = [...text.matchAll(/<item>[\s\S]*?<\/item>/g)].map((m) => {
        const get = (tag) => m[0].match(new RegExp(`<${tag}>([^<]*)</${tag}>`))?.[1]?.trim() ?? '';
        return get('층');
      });
      const floorCounts = floors.reduce((acc, f) => { acc[f] = (acc[f] || 0) + 1; return acc; }, {});
      results[name] = {
        totalCount: text.match(/<totalCount>(\d+)<\/totalCount>/)?.[1],
        itemCount: floors.length,
        floorValues: floorCounts,
      };
    } catch (e) {
      results[name] = { error: e.message };
    }
  }

  res.json({ ym, lawdCd, results });
}
