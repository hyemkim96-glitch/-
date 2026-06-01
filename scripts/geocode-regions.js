#!/usr/bin/env node
/**
 * scripts/geocode-regions.js
 *
 * 법정동코드 CSV → data/regions.json 생성 (1회 실행용)
 *
 * 사용법:
 *   KAKAO_REST_API_KEY=<your_key> node scripts/geocode-regions.js
 *
 * 출력: data/regions.json
 * 소요시간: 약 5~10분 (3,200건 × 100ms 딜레이)
 */

const fs   = require('fs');
const path = require('path');

const KEY     = process.env.KAKAO_REST_API_KEY;
const CSV     = path.join(__dirname, '../data/법정동코드_전체.csv');
const OUT     = path.join(__dirname, '../data/regions.json');
const DELAY   = 110; // ms between calls (카카오 무료티어 초당 10건 이하)

if (!KEY) {
  console.error('KAKAO_REST_API_KEY 환경변수를 설정해주세요.');
  process.exit(1);
}

// ── CSV 파싱 ────────────────────────────────────────────────────────
function parseCsv(filePath) {
  const lines  = fs.readFileSync(filePath, 'utf-8').split('\n');
  const header = lines[0].split(',');
  return lines.slice(1)
    .filter(Boolean)
    .map((line) => {
      const cols = line.split(',');
      return Object.fromEntries(header.map((h, i) => [h.trim(), (cols[i] || '').trim()]));
    });
}

// ── 대상 필터 ────────────────────────────────────────────────────────
// 삭제 안 된 것 + 동/읍/면 (리 제외) + 면적이 좁은 도시지역 동 중심
function isTarget(row) {
  if (row['삭제일자']) return false;
  const emd = row['읍면동명'];
  if (!emd || row['리명']) return false;
  // 동(洞) + 읍(邑) 만 포함 (면은 농촌이라 MOLIT 데이터 희소)
  return emd.endsWith('동') || emd.endsWith('읍');
}

// ── Kakao 주소→좌표 API ─────────────────────────────────────────────
async function geocode(sido, sigungu, dong) {
  const query = encodeURIComponent(`${sido} ${sigungu} ${dong}`.trim());
  const url   = `https://dapi.kakao.com/v2/local/search/address.json?query=${query}&analyze_type=similar`;
  const res   = await fetch(url, { headers: { Authorization: `KakaoAK ${KEY}` } });
  if (!res.ok) return null;
  const data  = await res.json();
  const doc   = data.documents?.[0];
  if (!doc) return null;
  return { lat: parseFloat(doc.y), lng: parseFloat(doc.x) };
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// ── 진행상황 저장/복원 (중단 후 재시작 지원) ──────────────────────
const CACHE_FILE = path.join(__dirname, '../data/regions_cache.json');
let cache = {};
if (fs.existsSync(CACHE_FILE)) {
  cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
  console.log(`캐시 ${Object.keys(cache).length}건 복원`);
}

function saveCache() { fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2)); }

// ── lawdCd: 법정동코드 앞 5자리 (시군구 코드) ─────────────────────
function toLawdCd(code) { return code.slice(0, 5); }

// ── 메인 ────────────────────────────────────────────────────────────
(async () => {
  const rows    = parseCsv(CSV);
  const targets = rows.filter(isTarget);
  console.log(`대상 읍면동: ${targets.length}건`);

  const results = [];
  let done = 0;

  for (const row of targets) {
    const code    = row['법정동코드'];
    const sido    = row['시도명'];
    const sigungu = row['시군구명'];
    const dong    = row['읍면동명'];
    const cacheKey = code;

    let coords;
    if (cache[cacheKey]) {
      coords = cache[cacheKey];
    } else {
      coords = await geocode(sido, sigungu, dong);
      if (coords) {
        cache[cacheKey] = coords;
        if (done % 50 === 0) saveCache(); // 50건마다 중간저장
      }
      await sleep(DELAY);
    }

    if (!coords) {
      console.warn(`  좌표 없음: ${sido} ${sigungu} ${dong}`);
      continue;
    }

    results.push({
      code,
      sido,
      sigungu,
      dong,
      lawdCd: toLawdCd(code),
      lat: coords.lat,
      lng: coords.lng,
    });

    done++;
    if (done % 100 === 0) {
      process.stdout.write(`\r  ${done}/${targets.length} (${Math.round(done/targets.length*100)}%)`);
    }
  }

  saveCache();
  fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
  console.log(`\n완료: ${results.length}건 → ${OUT}`);
})();
