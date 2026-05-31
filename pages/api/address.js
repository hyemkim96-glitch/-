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
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = {}; }

    // 카카오 API 에러 응답 그대로 전달 (디버깅용)
    if (!response.ok || data.errorType) {
      return res.json({ documents: [], error: data.message || `HTTP ${response.status}`, errorType: data.errorType, status: response.status });
    }

    res.json({ documents: data.documents || [], _debug: { status: response.status, total: data.meta?.total_count } });
  } catch (e) {
    res.json({ documents: [], error: e.message });
  }
}
