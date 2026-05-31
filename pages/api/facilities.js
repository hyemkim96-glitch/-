// GET /api/facilities?lat=&lng=
// 카카오 로컬 카테고리 반경 검색 프록시
export default async function handler(req, res) {
  const { lat, lng } = req.query;
  const key = process.env.KAKAO_REST_API_KEY;

  if (!key) {
    return res.json({ subway: 0, store: 0, mart: 0, hospital: 0 });
  }

  const categories = [
    { code: 'SW8', field: 'subway' },  // 지하철역
    { code: 'CS2', field: 'store' },   // 편의점
    { code: 'MT1', field: 'mart' },    // 대형마트
    { code: 'HP8', field: 'hospital' },// 병원
  ];

  try {
    const results = await Promise.all(
      categories.map(async ({ code, field }) => {
        const url = `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=${code}&x=${lng}&y=${lat}&radius=1000&size=15`;
        const r = await fetch(url, { headers: { Authorization: `KakaoAK ${key}` } });
        const data = await r.json();
        return { field, count: data.documents?.length || 0 };
      })
    );
    const out = {};
    for (const { field, count } of results) out[field] = count;
    res.json(out);
  } catch {
    res.json({ subway: 0, store: 0, mart: 0, hospital: 0 });
  }
}
