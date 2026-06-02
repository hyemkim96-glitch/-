// GET /api/transactions?gu=&dong=
// 국토부 실거래가 API 프록시
export default async function handler(req, res) {
  const { gu, dong } = req.query;
  const key = process.env.MOLIT_API_KEY;

  if (!key) {
    return res.json({ items: null });
  }

  try {
    // 국토부 아파트 전월세 실거래가 API (통합 엔드포인트)
    const now = new Date();
    const yyyyMM = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const url = `https://apis.data.go.kr/1613000/RTMSOBJSvc/getRTMSDataSvcApartRent?serviceKey=${encodeURIComponent(key)}&pageNo=1&numOfRows=20&DEAL_YMD=${yyyyMM}&LAWD_CD=${encodeURIComponent(gu)}&_type=json`;
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await r.json();
    const items = data?.response?.body?.items?.item || null;
    res.json({ items });
  } catch {
    res.json({ items: null });
  }
}
