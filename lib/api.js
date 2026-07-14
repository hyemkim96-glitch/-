// Client-side API helpers — all calls go through Next.js API routes for CORS/key safety.
// Every function handles errors and returns a safe fallback.

/**
 * 주소 자동완성 (카카오 로컬 API 프록시)
 * @param {string} keyword
 * @returns {Promise<Array<{title: string, address: string, lat: number, lng: number}>>}
 */
export async function searchAddress(keyword) {
  if (!keyword || keyword.trim().length < 2) return [];
  try {
    const res = await fetch(`/api/address?q=${encodeURIComponent(keyword)}`);
    const data = await res.json();
    return (data.documents || []).map((d) => ({
      title: d.place_name || d.address_name,
      address: d.address_name,
      lat: parseFloat(d.y),
      lng: parseFloat(d.x),
    }));
  } catch {
    return [];
  }
}

/**
 * 출퇴근 시간 (ODsay/카카오모빌리티 프록시)
 * @param {{lat:number,lng:number}} origin
 * @param {{lat:number,lng:number}} dest
 * @param {'대중교통'|'자가용'} transport
 * @returns {Promise<{minutes: number, isEstimated: boolean}>}
 */
export async function getCommuteTime(origin, dest, transport) {
  try {
    const params = new URLSearchParams({
      ox: origin.lng, oy: origin.lat,
      dx: dest.lng, dy: dest.lat,
      transport,
    });
    const res = await fetch(`/api/commute?${params}`);
    const data = await res.json();
    if (data.minutes != null) return data;
    throw new Error('no data');
  } catch {
    // Straight-line distance estimate: 1km ≈ 3min transit / 1.5min car
    const R = 6371;
    const dLat = ((dest.lat - origin.lat) * Math.PI) / 180;
    const dLng = ((dest.lng - origin.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((origin.lat * Math.PI) / 180) *
        Math.cos((dest.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const minPerKm = transport === '자가용' ? 1.5 : 3;
    return { minutes: Math.round(km * minPerKm + 5), isEstimated: true };
  }
}

/**
 * 주변 시설 검색 (카카오 로컬 카테고리 프록시)
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<{subway:number, store:number, mart:number, hospital:number}>}
 */
export async function getFacilities(lat, lng) {
  try {
    const res = await fetch(`/api/facilities?lat=${lat}&lng=${lng}`);
    const data = await res.json();
    return data;
  } catch {
    return { subway: 0, store: 0, mart: 0, hospital: 0 };
  }
}

/**
 * 대출 금리 조회 (HF Open API 프록시)
 * @param {'버팀목'|'청년버팀목'} type
 * @returns {Promise<{rate: number, source: string}>}
 */
export async function getLoanRate(type) {
  try {
    const res = await fetch(`/api/loan-rate?type=${encodeURIComponent(type)}`);
    const data = await res.json();
    return data;
  } catch {
    // PRD fallback rates
    return {
      rate: type === '청년버팀목' ? 2.1 : 2.7,
      source: 'fallback',
    };
  }
}
