// lib/buildResults.js — 추천 결과 목록을 만드는 핵심 로직 (지역 후보 조회 → 가격/출퇴근/생활권 스코어링)
import { commuteScore, priceScore, lifeScore, totalScore, MAX_AFFORDABLE_RATIO } from './score';
import { CANDIDATE_REGIONS, formatKRW } from '../components/shared';

// 두 좌표 간 직선거리(km) 계산
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 직선거리 기반 출퇴근 시간 추정 (api/commute.js fallback과 동일 공식)
function estimateCommute(km, transport) {
  const minPerKm = transport === '자가용' ? 1.5 : 3;
  return Math.round(km * minPerKm + 5);
}

// JSON 지역 → 앱 포맷 변환
function normalizeRegion(r) {
  return {
    id: r.code || r.id,
    gu: r.sigungu || r.gu,
    dong: r.dong,
    sido: r.sido || (r.lawdCd?.startsWith('11') ? '서울특별시' : r.lawdCd?.startsWith('41') ? '경기도' : ''),
    lawdCd: r.lawdCd,
    coords: r.coords || { lat: r.lat, lng: r.lng },
    pin: r.pin || { x: 50, y: 50 },
    maintenanceFee: r.maintenanceFee || 10,
    avgJeonsaMan: r.avgJeonsaMan || null,
    avgRentMan: r.avgRentMan || null,
    defaultLife: r.defaultLife || { subway: 1, store: 3, mart: 1, hospital: 2 },
  };
}

// MOLIT API rate limit 방지: items를 batchSize씩 나눠 순차 실행
async function fetchInBatches(items, fn, batchSize, delayMs = 0) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
    if (delayMs > 0 && i + batchSize < items.length) {
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  return results;
}

// lawdCd 가격 데이터 sessionStorage 캐시 (월 단위 TTL)
const PRICE_CACHE_KEY = `zipter_prices_${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`;
function getPriceCache() {
  try { return JSON.parse(sessionStorage.getItem(PRICE_CACHE_KEY) || '{}'); } catch { return {}; }
}
function setPriceCache(lawdCd, data) {
  try {
    const cache = getPriceCache();
    cache[lawdCd] = data;
    sessionStorage.setItem(PRICE_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

export async function buildResults({ asset, income, workLat, workLng, loan, loanRate, transport }) {
  const wx = workLng || 126.9780;
  const wy = workLat || 37.5665;

  // 전국 데이터가 있으면 사용, 없으면 CANDIDATE_REGIONS fallback
  let candidatePool;
  try {
    const regRes = await fetch('/api/regions');
    const regData = await regRes.json();
    if (regData.nationwide && regData.regions.length > 0) {
      // 구별로 가장 가까운 동 최대 2개 유지, 최대 15개 구(= 최대 30개 동)
      // 단순 slice는 가까운 구의 동들만 채워 외곽 구가 누락됨
      const guCount = {};
      const sorted = regData.regions
        .map(normalizeRegion)
        .filter((r) => haversineKm(wy, wx, r.coords.lat, r.coords.lng) <= 45)
        .sort((a, b) =>
          haversineKm(wy, wx, a.coords.lat, a.coords.lng) -
          haversineKm(wy, wx, b.coords.lat, b.coords.lng)
        );
      candidatePool = sorted
        .filter((r) => {
          const key = r.lawdCd || r.id;
          guCount[key] = (guCount[key] || 0) + 1;
          return guCount[key] <= 2;
        })
        .slice(0, 30);
    } else {
      candidatePool = CANDIDATE_REGIONS.map(normalizeRegion);
    }
  } catch {
    candidatePool = CANDIDATE_REGIONS.map(normalizeRegion);
  }

  const uniqueLawdCds = [...new Set(candidatePool.map((r) => r.lawdCd).filter(Boolean))];

  const fetchCommute = (region, t) =>
    fetch(`/api/commute?ox=${wx}&oy=${wy}&dx=${region.coords.lng}&dy=${region.coords.lat}&transport=${encodeURIComponent(t)}`)
      .then((r) => r.json())
      .catch(() => null);

  // 가격 요청은 3개씩 배치 처리 (MOLIT API rate limit 방지)
  // 동시에 commute·facility 요청도 병렬 시작
  const priceCache = getPriceCache();
  const uncachedLawdCds = uniqueLawdCds.filter((cd) => !(cd in priceCache));

  const priceResultsPromise = fetchInBatches(
    uncachedLawdCds,
    async (lawdCd) => {
      try {
        const r = await fetch(`/api/prices?lawdCd=${lawdCd}`);
        if (r.ok) {
          const data = await r.json();
          // 유효한 시세가 있을 때만 캐시 (rate limit 등 실패 응답이 세션 내내 남는 것 방지)
          if (!data.error && (data.oneroom?.jeonsa || data.oneroom?.wolseRent)) {
            setPriceCache(lawdCd, data);
          }
          return [lawdCd, data];
        }
      } catch {}
      return [lawdCd, null];
    },
    3,   // 한 번에 3개 lawdCd
    100  // 배치 간 100ms 대기
  );

  const [commuteTransit, commuteCar, facilityResults] = await Promise.all([
    Promise.all(candidatePool.map((region) => fetchCommute(region, '대중교통'))),
    Promise.all(candidatePool.map((region) => fetchCommute(region, '자가용'))),
    Promise.all(candidatePool.map(async (region) => {
      try {
        const r = await fetch(`/api/facilities?lat=${region.coords.lat}&lng=${region.coords.lng}`);
        const apiLife = await r.json();
        const total = Object.values(apiLife).reduce((s, v) => s + v, 0);
        return total > 0 ? apiLife : null;
      } catch {
        return null;
      }
    })),
  ]);

  const freshPriceResults = await priceResultsPromise;
  // 캐시 hit 결과 + 새로 받아온 결과 합치기
  const cachedEntries = uniqueLawdCds
    .filter((cd) => cd in priceCache)
    .map((cd) => [cd, priceCache[cd]]);
  const allPriceResults = [...cachedEntries, ...freshPriceResults];
  const priceCacheMap = Object.fromEntries(allPriceResults);

  // 가격 API 성공률 확인 — 실제 jeonsa/wolseRent 값이 하나도 없으면 에러
  const priceSuccessCount = allPriceResults.filter(([, v]) =>
    v && !v.error && (v.oneroom?.jeonsa || v.oneroom?.wolseRent)
  ).length;
  if (allPriceResults.length > 0 && priceSuccessCount === 0) {
    // 최상위 에러(API 키 미설정) 체크
    const topErr = allPriceResults.find(([, v]) => v?.error)?.[1]?.error;
    if (topErr) throw new Error(topErr);
    // MOLIT 레벨 에러 코드 수집
    const molitCode = allPriceResults
      .flatMap(([, v]) => v?._errors || [])
      .find(Boolean) || 'NO_DATA';
    throw new Error(`PRICE_API_FAILED:${molitCode}`);
  }

  // byDong 조회: 정확 매칭 → 접두사 매칭(가/숫자 결미 동명 대응) → null
  function findDongStats(byDong, dongName) {
    if (!byDong) return null;
    if (byDong[dongName]) return byDong[dongName];
    // '성수동' → '성수동1가', '성수동2가' 등 prefix 매칭
    const base = dongName.endsWith('동') ? dongName.slice(0, -1) : dongName;
    const keys = Object.keys(byDong).filter((k) => k.startsWith(base));
    if (!keys.length) return null;
    if (keys.length === 1) return byDong[keys[0]];
    // 여러 동이 매칭되면 가중평균
    const all = keys.map((k) => byDong[k]);
    const avgOf = (vals) => { const v = vals.filter((x) => x != null); return v.length ? Math.round(v.reduce((s, x) => s + x, 0) / v.length) : null; };
    return {
      jeonsa: avgOf(all.map((s) => s.jeonsa)),
      wolseDeposit: avgOf(all.map((s) => s.wolseDeposit)),
      wolseRent: avgOf(all.map((s) => s.wolseRent)),
      count: all.reduce((s, m) => s + (m.count || 0), 0),
    };
  }

  const results = [];
  candidatePool.forEach((region, idx) => {
    // MOLIT 실거래가: 동 단위 우선, 없으면 구 평균. 둘 다 없으면 이 지역 건너뜀
    const live = region.lawdCd ? priceCacheMap[region.lawdCd] : null;
    const dongStats = findDongStats(live?.byDong, region.dong);
    const priceBase = dongStats || live?.oneroom || null;
    // 실 데이터 없거나 jeonsa·rent 둘 다 null이면 건너뜀
    if (!priceBase || (!priceBase.jeonsa && !priceBase.wolseRent)) return;

    const liveJeonsa  = priceBase.jeonsa;
    const liveRent    = priceBase.wolseRent;
    const liveRentDep = priceBase.wolseDeposit;

    // 출퇴근 (대중교통 + 자가용)
    const km = haversineKm(wy, wx, region.coords.lat, region.coords.lng);

    const transitData = commuteTransit[idx];
    const transitMin = transitData?.minutes ?? estimateCommute(km, '대중교통');
    const transitEstimated = transitData?.isEstimated !== false;

    const carData = commuteCar[idx];
    const carMin = carData?.minutes ?? estimateCommute(km, '자가용');
    const carEstimated = carData?.isEstimated !== false;

    // 사용자가 선택한 교통수단 기준으로 60분 초과 지역 제외
    const cutoffMin = transport === '자가용' ? carMin : transitMin;
    if (cutoffMin > 60) return;

    // 생활권
    const life = facilityResults[idx] || region.defaultLife;

    // 전세/월세 중 데이터 있는 유형만 생성
    const dynamicOptions = [
      liveJeonsa ? { type: '전세', depositMan: liveJeonsa } : null,
      liveRent   ? { type: '월세', depositForRent: liveRentDep || 0, rentMan: liveRent } : null,
    ].filter(Boolean);

    for (const opt of dynamicOptions) {
      const deposit = opt.type === '전세' ? opt.depositMan : (opt.depositForRent || 0);
      const rentMan = opt.type === '월세' ? opt.rentMan : 0;

      if (!loan && deposit > asset) continue;

      const capitalMan = deposit;
      const loanNeeded = Math.max(0, deposit - asset);
      const usedRate = loanRate || 3.5;
      const monthlyInterest = Math.round((loanNeeded * (usedRate / 100)) / 12);
      const monthlyMan = monthlyInterest + rentMan + (region.maintenanceFee || 0);

      if (income > 0 && monthlyMan > income * MAX_AFFORDABLE_RATIO) continue;

      const commuteMin = transport === '자가용' ? carMin : transitMin;
      const cs = commuteScore(commuteMin);
      const ps = priceScore(monthlyMan, income);
      const ls = lifeScore(life, CANDIDATE_REGIONS.map((r) => r.defaultLife));
      const score = totalScore(cs, ps, ls);

      const breakdown = {
        commute: Math.round(cs * 100),
        price: Math.round(ps * 100),
        life: Math.round(ls * 100),
      };

      const priceLabel = opt.type === '전세'
        ? formatKRW(deposit)
        : `보증금 ${formatKRW(opt.depositForRent || 0)} · 월 ${rentMan}만원`;
      const avgLabel = opt.type === '전세'
        ? formatKRW(liveJeonsa)
        : `보증금 ${formatKRW(liveRentDep || 0)} / 월 ${liveRent}만원`;
      const transitLabel = `${transitMin}분${transitEstimated ? '*' : ''}`;
      const carLabel = `${carMin}분${carEstimated ? '*' : ''}`;

      results.push({
        id: `${region.id}_${opt.type}`,
        gu: region.gu,
        dong: region.dong,
        coords: region.coords,
        pin: region.pin,
        type: opt.type,
        depositMan: deposit,
        depositForRent: opt.depositForRent,
        priceLabel,
        avgLabel,
        capitalMan,
        monthlyMan,
        commuteMin: transitMin,
        sortMinute: commuteMin,
        transitLabel,
        carLabel,
        life,
        score,
        breakdown,
        needsLoan: deposit > asset,
        maintenanceFee: region.maintenanceFee || 0,
        byFloor: live?.byFloor || null,
        _baseJeonsa: liveJeonsa,
        _baseRent: liveRent,
        _baseRentDep: liveRentDep || 0,
      });
    }
  });

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.sortMinute - b.sortMinute; // 점수 동일 시 가까운 순
  });
  return results;
}
