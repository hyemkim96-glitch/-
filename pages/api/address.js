// GET /api/address?q=keyword
// 키워드 검색 → 결과 없으면 주소 검색으로 fallback
export default async function handler(req, res) {
  const { q } = req.query;
  const key = process.env.KAKAO_REST_API_KEY;

  if (!key) return res.json({ documents: [], error: 'KAKAO_REST_API_KEY not set' });
  if (!q) return res.json({ documents: [] });

  const headers = { Authorization: `KakaoAK ${key}` };

  async function kakaoFetch(url) {
    const r = await fetch(url, { headers });
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch { data = {}; }
    return { ok: r.ok, status: r.status, data };
  }

  try {
    // 1차: 키워드 검색 (장소명, 회사명 등)
    const { ok, status, data } = await kakaoFetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(q)}&size=10`
    );

    if (!ok || data.errorType) {
      return res.json({ documents: [], error: data.message || `HTTP ${status}`, errorType: data.errorType, status });
    }

    if ((data.documents || []).length > 0) {
      return res.json({ documents: data.documents });
    }

    // 2차: 주소 검색 fallback (키워드 결과 없을 때)
    const { ok: ok2, data: data2 } = await kakaoFetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(q)}&size=10`
    );

    if (ok2 && (data2.documents || []).length > 0) {
      return res.json({ documents: data2.documents });
    }

    res.json({ documents: [] });
  } catch (e) {
    res.json({ documents: [], error: e.message });
  }
}
