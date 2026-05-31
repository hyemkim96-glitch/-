// GET /api/address?q=keyword
export default async function handler(req, res) {
  const { q } = req.query;
  const key = process.env.KAKAO_REST_API_KEY;

  if (!key) return res.json({ documents: [], error: 'KAKAO_REST_API_KEY not set' });
  if (!q) return res.json({ documents: [] });

  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(q)}&size=5`,
      { headers: { Authorization: `KakaoAK ${key}` } }
    );
    const data = await response.json();

    // 카카오 API 에러 응답 그대로 전달 (디버깅용)
    if (!response.ok || data.errorType) {
      return res.json({ documents: [], error: data.message || `HTTP ${response.status}`, errorType: data.errorType });
    }

    res.json({ documents: data.documents || [] });
  } catch (e) {
    res.json({ documents: [], error: e.message });
  }
}
