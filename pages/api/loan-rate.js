// GET /api/loan-rate?type=버팀목|청년버팀목
// HF Open API 프록시, fallback 포함
const FALLBACK = {
  버팀목: { rate: 2.7, source: 'fallback' },
  청년버팀목: { rate: 2.1, source: 'fallback' },
};

export default async function handler(req, res) {
  const { type } = req.query;
  const key = process.env.HF_API_KEY;

  if (!key) {
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
