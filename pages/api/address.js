// GET /api/address?q=keyword
// 카카오 로컬 API 프록시 (API 키는 환경변수)
export default async function handler(req, res) {
  const { q } = req.query;
  if (!q) return res.json({ documents: [] });
  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(q)}&size=5`,
      { headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` } }
    );
    const data = await response.json();
    res.json({ documents: data.documents || [] });
  } catch {
    res.json({ documents: [] });
  }
}
