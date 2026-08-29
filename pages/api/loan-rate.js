// GET /api/loan-rate?type=버팀목|청년버팀목|일반
// HF Open API 프록시, fallback 포함
const FALLBACK = {
  버팀목: { rate: 2.7, source: 'fallback' },
  청년버팀목: { rate: 2.1, source: 'fallback' },
  일반: { rate: 4.5, source: 'fallback' }, // 일반 전세대출은 HF 대상 아님 — 고정 fallback
};

export default async function handler(req, res) {
  const { type } = req.query;
  const key = process.env.HF_API_KEY;

  // 일반 전세대출은 HF 조회 대상이 아니라 고정값 사용
  if (type === '일반' || !key) {
    return res.json(FALLBACK[type] || FALLBACK['버팀목']);
  }

  try {
    // HF Open API (주택금융공사) 금리 조회
    const url = `https://www.hf.go.kr/openapi/openApiController.do?apiKey=${key}&serviceId=LOAN_RATE&type=${encodeURIComponent(type || '버팀목')}`;
    const r = await fetch(url);
    const data = await r.json();
    const rate = data?.result?.rate;
    if (rate != null) return res.json({ rate: parseFloat(rate), source: 'hf' });
    throw new Error('no rate');
  } catch {
    res.json(FALLBACK[type] || FALLBACK['버팀목']);
  }
}
