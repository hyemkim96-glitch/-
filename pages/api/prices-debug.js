// GET /api/prices-debug?lawdCd=11440
// MOLIT API 응답 진단용 — 배포 후 삭제
export default async function handler(req, res) {
  const lawdCd = req.query.lawdCd || '11440';
  const key = process.env.MOLITRANSACTION_API_KEY;

  if (!key) return res.json({ error: 'MOLITRANSACTION_API_KEY not set' });

  const d = new Date();
  d.setMonth(d.getMonth() - 2);
  const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;

  const url = `http://openapi.molit.go.kr:8081/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcSHRent?serviceKey=${encodeURIComponent(key.trim())}&pageNo=1&numOfRows=10&DEAL_YMD=${ym}&LAWD_CD=${lawdCd}&_type=xml`;

  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const text = await r.text();
    res.json({
      ym,
      lawdCd,
      httpStatus: r.status,
      resultCode: text.match(/<resultCode>([^<]+)<\/resultCode>/)?.[1],
      returnCode: text.match(/<returnReasonCode>([^<]+)<\/returnReasonCode>/)?.[1],
      totalCount: text.match(/<totalCount>(\d+)<\/totalCount>/)?.[1],
      itemCount: (text.match(/<item>/g) || []).length,
      raw: text.slice(0, 500),
    });
  } catch (e) {
    res.json({ error: e.message });
  }
}
