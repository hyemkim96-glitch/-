// GET /api/commute?ox=&oy=&dx=&dy=&transport=
// ODsay / 카카오모빌리티 프록시, 실패 시 직선거리 추정
export default async function handler(req, res) {
  const { ox, oy, dx, dy, transport } = req.query;

  // 직선거리 추정 (fallback 공통 함수)
  function estimateMinutes() {
    const R = 6371;
    const dLat = ((parseFloat(dy) - parseFloat(oy)) * Math.PI) / 180;
    const dLng = ((parseFloat(dx) - parseFloat(ox)) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((parseFloat(oy) * Math.PI) / 180) *
        Math.cos((parseFloat(dy) * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const minPerKm = transport === '자가용' ? 1.5 : 3;
    return Math.round(km * minPerKm + 5);
  }

  try {
    if (transport === '대중교통' && process.env.ODSAY_API_KEY) {
      const url = `https://api.odsay.com/v1/api/searchPubTransPathT?SX=${ox}&SY=${oy}&EX=${dx}&EY=${dy}&apiKey=${encodeURIComponent(process.env.ODSAY_API_KEY)}`;
      const r = await fetch(url);
      const data = await r.json();
      const minutes = data?.result?.path?.[0]?.info?.totalTime;
      if (minutes != null) return res.json({ minutes, isEstimated: false });
    }

    if (transport === '자가용' && process.env.KAKAO_MOBILITY_API_KEY) {
      const url = `https://apis-navi.kakaomobility.com/v1/directions?origin=${ox},${oy}&destination=${dx},${dy}`;
      const r = await fetch(url, { headers: { Authorization: `KakaoAK ${process.env.KAKAO_MOBILITY_API_KEY}` } });
      const data = await r.json();
      const seconds = data?.routes?.[0]?.summary?.duration;
      if (seconds != null) return res.json({ minutes: Math.round(seconds / 60), isEstimated: false });
    }

    throw new Error('no api key or unsupported');
  } catch {
    res.json({ minutes: estimateMinutes(), isEstimated: true });
  }
}
