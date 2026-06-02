// GET /api/prices-debug?lawdCd=11440
// MOLIT API 응답 진단용 — 배포 후 삭제
export default async function handler(req, res) {
  const lawdCd = req.query.lawdCd || '11440';
  const key = process.env.MOLIT_API_KEY;

  if (!key) return res.json({ error: 'MOLIT_API_KEY not set' });

  const d = new Date();
  d.setMonth(d.getMonth() - 2);
  const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;

  const BASE = 'https://apis.data.go.kr/1613000/RTMSOBJSvc/getRTMSDataSvcRHRent';
  const PARAMS = `&pageNo=1&numOfRows=10&DEAL_YMD=${ym}&LAWD_CD=${lawdCd}&_type=xml`;

  // 세 가지 인코딩 방식을 동시에 테스트
  const keyTrimmed = key.trim();
  let keyNormalized;
  try { keyNormalized = encodeURIComponent(decodeURIComponent(keyTrimmed)); }
  catch { keyNormalized = encodeURIComponent(keyTrimmed); }

  const strategies = [
    { label: 'as-is',       encodedKey: keyTrimmed },
    { label: 'encode-only', encodedKey: encodeURIComponent(keyTrimmed) },
    { label: 'normalize',   encodedKey: keyNormalized },
  ];

  const results = await Promise.all(strategies.map(async ({ label, encodedKey }) => {
    const url = `${BASE}?serviceKey=${encodedKey}${PARAMS}`;
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
      const text = await r.text();
      return {
        label,
        httpStatus: r.status,
        resultCode: text.match(/<resultCode>([^<]+)<\/resultCode>/)?.[1],
        returnCode: text.match(/<returnReasonCode>([^<]+)<\/returnReasonCode>/)?.[1],
        itemCount: (text.match(/<item>/g) || []).length,
        raw: text.slice(0, 200),
      };
    } catch (e) {
      return { label, error: e.message };
    }
  }));

  res.json({
    ym,
    lawdCd,
    keyLength: key.length,
    keyTrimmedLength: keyTrimmed.length,
    keyPreview: `${keyTrimmed.slice(0, 6)}...${keyTrimmed.slice(-4)}`,
    results,
  });
}
