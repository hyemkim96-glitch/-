// GET /api/geocode?q=주소
// 카카오 로컬 API로 주소 → 위경도 변환
export default async function handler(req, res) {
  const { q } = req.query;
  const key = process.env.KAKAO_REST_API_KEY;

  if (!key || !q) return res.json({ lat: null, lng: null });

  try {
    const r = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(q)}&size=1`,
      { headers: { Authorization: `KakaoAK ${key}` } }
    );
    const data = await r.json();
    const doc = data.documents?.[0];
    if (!doc) return res.json({ lat: null, lng: null });
    res.json({ lat: parseFloat(doc.y), lng: parseFloat(doc.x), name: doc.place_name });
  } catch {
    res.json({ lat: null, lng: null });
  }
}
