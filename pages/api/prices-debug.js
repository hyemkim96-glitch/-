// GET /api/prices-debug?lawdCd=11440
// MOLIT API 응답 진단용 — 배포 후 삭제
export default async function handler(req, res) {
  const lawdCd = req.query.lawdCd || '11440';
  const key = process.env.MOLIT_API_KEY;

  if (!key) return res.json({ error: 'MOLIT_API_KEY not set' });

  const encodedKey = key;
  const d = new Date();
  d.setMonth(d.getMonth() - 2);
  const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;

  const url = `http://apis.data.go.kr/1613000/RTMSOBJSvc/getRTMSDataSvcRHRent?serviceKey=${encodedKey}&pageNo=1&numOfRows=10&DEAL_YMD=${ym}&LAWD_CD=${lawdCd}&_type=xml`;

  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const text = await r.text();
    const totalCount = text.match(/<totalCount>(\d+)<\/totalCount>/)?.[1];
    const resultCode = text.match(/<resultCode>([^<]+)<\/resultCode>/)?.[1];
    const returnCode = text.match(/<returnReasonCode>([^<]+)<\/returnReasonCode>/)?.[1];
    const itemCount = (text.match(/<item>/g) || []).length;

    res.json({
      ym,
      lawdCd,
      httpStatus: r.status,
      totalCount,
      itemCount,
      resultCode,
      returnCode,
      raw: text.slice(0, 800),
    });
  } catch (e) {
    res.json({ error: e.message });
  }
}
