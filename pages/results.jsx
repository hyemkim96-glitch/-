// pages/results.jsx — 추천 결과 (실제 사용자 입력 기반 필터링 + API 연동)
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { getFormData, getPrefsData, addHistory } from '../lib/storage';
import { commuteScore, priceScore, lifeScore, totalScore } from '../lib/score';
import { CANDIDATE_REGIONS, ScoreBadge, regionLabel, scoreFg, gradeColors, formatKRW } from '../components/shared';
import { MapCanvas } from '../components/layout/Screen';
import {
  IconMap, IconHome, IconWalk, IconWallet, IconWon,
  IconSubway, IconStore, IconCart, IconHospital, IconChevDown, IconClose,
  IconExternal, IconPin, IconChevRight, IconList,
} from '../components/icons';

// ── Filter Pill ────────────────────────────────────────────────────
function FilterPill({ label, chevron, active, toggle, on, onClick }) {
  const isActive = active || (toggle && on);
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
      padding: '9px 13px', borderRadius: 999, border: 'none', cursor: 'pointer',
      fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap',
      background: isActive ? 'var(--accent)' : 'var(--surface)',
      color: isActive ? '#fff' : 'var(--ink-2)',
      transition: 'all .14s ease', WebkitTapHighlightColor: 'transparent',
    }}>
      {toggle && <span style={{ width: 7, height: 7, borderRadius: 999, background: on ? '#fff' : 'var(--ink-3)' }} />}
      {label}
      {chevron && <IconChevDown size={15} style={{ marginRight: -2, opacity: 0.8 }} />}
    </button>
  );
}

function FilterBar({ filters, setFilters }) {
  return (
    <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', gap: '4px', padding: '14px 20px' }}>
      <FilterPill label={filters.type} chevron active={filters.type !== '전체'} onClick={() => {
        const order = ['전체', '전세만', '월세만'];
        setFilters({ ...filters, type: order[(order.indexOf(filters.type) + 1) % 3] });
      }} />
      <FilterPill label={filters.home} chevron active={filters.home !== '무관'} onClick={() => {
        const order = ['무관', '원룸', '투룸', '아파트'];
        setFilters({ ...filters, home: order[(order.indexOf(filters.home) + 1) % 4] });
      }} />
      <FilterPill label="60분 이하" chevron />
      <FilterPill label="대출 포함" toggle on={filters.loan} onClick={() => setFilters({ ...filters, loan: !filters.loan })} />
      <FilterPill label="추천순" chevron active />
    </div>
  );
}

// ── MiniStat ──────────────────────────────────────────────────────
function MiniStat({ icon, label, value }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
      {icon && <span style={{ color: 'var(--ink-3)', display: 'flex' }}>{icon}</span>}
      <span style={{ fontSize: 12.5, whiteSpace: 'nowrap' }}>
        <span style={{ color: 'var(--ink-3)', fontWeight: 500 }}>{label} </span>
        <span style={{ color: 'var(--ink-2)', fontWeight: 700 }}>{value}</span>
      </span>
    </span>
  );
}

// ── ResultCard ────────────────────────────────────────────────────
function ResultCard({ item, onExpand }) {
  return (
    <div onClick={() => onExpand(item)} style={{ background: 'var(--surface)', borderRadius: 16, padding: 18, cursor: 'pointer', boxShadow: 'var(--card-shadow)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <span style={{ color: 'var(--ink-3)', display: 'flex', flexShrink: 0 }}><IconHome size={17} /></span>
          <span style={{ fontSize: 14.5, color: 'var(--ink)', fontWeight: 700, letterSpacing: '-0.01em', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {regionLabel(item)}
          </span>
        </div>
        <ScoreBadge score={item.score} />
      </div>
      <div style={{ marginTop: 11, display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-2)', background: 'var(--bg)', padding: '3px 8px', borderRadius: 6 }}>{item.type}</span>
        <span style={{ fontSize: 17.5, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{item.priceLabel}</span>
      </div>
      <div style={{ marginTop: 15, display: 'flex', gap: 14, flexWrap: 'wrap', rowGap: 8 }}>
        <MiniStat label="자본금" value={formatKRW(item.capitalMan)} />
        <MiniStat label="월" value={`${item.monthlyMan}만원`} />
        <MiniStat label="출퇴근" value={item.commuteLabel} />
      </div>
    </div>
  );
}

// ── Skeleton Card ─────────────────────────────────────────────────
function SkeletonCard() {
  const bar = (w, h = 14) => (
    <div style={{ width: w, height: h, borderRadius: 8, background: 'var(--line)', animation: 'skeletonPulse 1.4s ease infinite' }} />
  );
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 18, boxShadow: 'var(--card-shadow)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>{bar('60%', 16)}{bar(50, 24)}</div>
      <div style={{ marginTop: 14 }}>{bar('40%', 20)}</div>
      <div style={{ marginTop: 16, display: 'flex', gap: 14 }}>{bar(60)}{bar(60)}{bar(70)}</div>
    </div>
  );
}

// ── MiniMap ───────────────────────────────────────────────────────
function MiniMap({ item }) {
  const containerRef = useRef(null);
  const hasKey = !!process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

  useEffect(() => {
    if (!hasKey || !containerRef.current || !item.coords) return;
    function init() {
      const kakao = window.kakao;
      if (!kakao?.maps) return;
      kakao.maps.load(() => {
        const pos = new kakao.maps.LatLng(item.coords.lat, item.coords.lng);
        const map = new kakao.maps.Map(containerRef.current, { center: pos, level: 5 });
        new kakao.maps.Marker({ map, position: pos });
      });
    }
    if (window.kakao?.maps) init();
    else {
      const t = setInterval(() => { if (window.kakao?.maps) { clearInterval(t); init(); } }, 200);
      return () => clearInterval(t);
    }
  }, [item]);

  if (hasKey && item.coords) {
    return (
      <div style={{ marginTop: 22, position: 'relative', height: 170, borderRadius: 14, overflow: 'hidden', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      </div>
    );
  }

  return (
    <div style={{ marginTop: 22, position: 'relative', height: 170, borderRadius: 14, overflow: 'hidden', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
      <MapCanvas>
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 130, height: 130, borderRadius: 999,
          background: 'rgba(49,130,246,0.10)', boxShadow: 'inset 0 0 0 1.5px rgba(49,130,246,0.35)' }} />
        {[[34, 38], [66, 34], [60, 64], [40, 66], [72, 52]].map(([x, y], i) => (
          <div key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)', width: 9, height: 9, borderRadius: 999, background: '#fff', boxShadow: '0 0 0 2px var(--ink-3)' }} />
        ))}
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-100%)', color: 'var(--accent)' }}>
          <div style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.25))' }}><IconPin size={32} style={{ color: 'var(--accent)' }} /></div>
        </div>
      </MapCanvas>
    </div>
  );
}

// ── FacilityChip & DetailStat ──────────────────────────────────────
function FacilityChip({ icon, label, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--bg)', borderRadius: 10, padding: '10px 13px', flexShrink: 0 }}>
      <span style={{ color: 'var(--accent)', display: 'flex' }}>{icon}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-2)' }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)' }}>{count}</span>
    </div>
  );
}

function DetailStat({ icon, label, value }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '4px 0' }}>
      <span style={{ color: 'var(--ink-3)', display: 'flex' }}>{icon}</span>
      <span style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 14.5, color: 'var(--ink)', fontWeight: 800, whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  );
}

// ── ExpandedSheet ─────────────────────────────────────────────────
function ExpandedSheet({ item, onClose }) {
  // 직방 딥링크: 좌표 기반 지도 이동 + 필터 적용
  // salesType: jeonse(전세) | monthly(월세)
  const salesType = item.type === '전세' ? 'jeonse' : 'monthly';
  const depositMax = item.type === '전세' ? item.depositMan : (item.depositForRent || 3000);
  const lat = item.coords?.lat;
  const lng = item.coords?.lng;
  const zigbangUrl = lat && lng
    ? `https://www.zigbang.com/home/oneroom?lat=${lat}&lng=${lng}&zoom=14&salesType=${salesType}&depositMin=0&depositMax=${depositMax}`
    : `https://www.zigbang.com/home/search?q=${encodeURIComponent(`${item.gu} ${item.dong}`)}&salesType=${salesType}`;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 40 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,20,28,0.45)', animation: 'fade .2s ease' }} />
      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, right: 'auto', bottom: 0, maxHeight: '90%', display: 'flex', flexDirection: 'column',
        background: 'var(--surface)', borderRadius: '20px 20px 0 0', animation: 'slideUp .28s cubic-bezier(.2,.8,.2,1)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
            <span style={{ fontSize: 18, color: 'var(--ink)', fontWeight: 800, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{regionLabel(item)}</span>
            <ScoreBadge score={item.score} />
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'var(--bg)', borderRadius: 999, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--ink-2)' }}>
            <IconClose size={20} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-2)', background: 'var(--bg)', padding: '3px 9px', borderRadius: 6 }}>{item.type}</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>{item.priceLabel}</span>
          </div>
          {item.noData ? (
            <div style={{ marginTop: 8, fontSize: 13, color: 'var(--ink-3)', fontWeight: 500 }}>
              <span style={{ background: 'var(--mid-weak)', color: 'var(--mid)', fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>시세 데이터 부족</span>
            </div>
          ) : (
            <div style={{ marginTop: 8, fontSize: 13.5, color: 'var(--ink-2)', fontWeight: 500 }}>
              최근 3개월 평균 시세 <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{item.avgLabel || '—'}</span>
            </div>
          )}
          <div style={{ marginTop: 18, display: 'flex', background: 'var(--bg)', borderRadius: 14, padding: '14px 6px' }}>
            <DetailStat icon={<IconWallet size={21} />} label="최소 자본금" value={formatKRW(item.capitalMan)} />
            <div style={{ width: 1, background: 'var(--line)', margin: '2px 0' }} />
            <DetailStat icon={<IconWon size={21} />} label="월 고정비" value={`${item.monthlyMan}만원`} />
            <div style={{ width: 1, background: 'var(--line)', margin: '2px 0' }} />
            <DetailStat icon={<IconWalk size={21} />} label="출퇴근" value={item.commuteLabel} />
          </div>
          {item.life && (
            <>
              <div style={{ marginTop: 22, fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>생활권 요약</div>
              <div style={{ marginTop: 11, display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
                <FacilityChip icon={<IconSubway size={18} />} label="지하철" count={item.life.subway} />
                <FacilityChip icon={<IconStore size={18} />} label="편의점" count={item.life.store} />
                <FacilityChip icon={<IconCart size={18} />} label="대형마트" count={item.life.mart} />
                <FacilityChip icon={<IconHospital size={18} />} label="병원" count={item.life.hospital} />
              </div>
            </>
          )}
          <MiniMap item={item} />
          <div style={{ marginTop: 20 }}>
            <a href={zigbangUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', height: 56, borderRadius: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                background: 'var(--accent)', color: '#fff', fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                직방에서 매물 보기 <IconExternal size={19} />
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 카카오맵 기반 결과 지도 ────────────────────────────────────────
function ResultsKakaoMap({ items, onExpand }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    function init() {
      const kakao = window.kakao;
      if (!kakao?.maps) return;
      kakao.maps.load(() => {
        const center = new kakao.maps.LatLng(37.5326, 126.9903);
        const map = new kakao.maps.Map(containerRef.current, { center, level: 8 });
        items.forEach((item) => {
          if (!item.coords) return;
          const pos = new kakao.maps.LatLng(item.coords.lat, item.coords.lng);
          const fg = gradeColors(item.score).fg.replace('var(--accent)', '#3182F6').replace('var(--good)', '#15B97E').replace('var(--mid)', '#F59000');
          const content = `<div onclick="void(0)" style="display:flex;align-items:center;gap:4px;padding:6px 10px;border-radius:999px;white-space:nowrap;background:#fff;font-weight:700;font-size:13px;box-shadow:0 3px 10px rgba(0,0,0,0.16);font-family:Pretendard,sans-serif;cursor:pointer;">${item.dong}<span style="font-weight:800;color:${fg}">${item.score}</span></div>`;
          const overlay = new kakao.maps.CustomOverlay({ position: pos, content, yAnchor: 1.3 });
          overlay.setMap(map);
        });
      });
    }
    if (window.kakao?.maps) init();
    else {
      const t = setInterval(() => { if (window.kakao?.maps) { clearInterval(t); init(); } }, 200);
      return () => clearInterval(t);
    }
  }, [items]);

  return <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />;
}

// ── 핵심: 후보 지역을 사용자 입력 기반으로 스코어링 ────────────────
async function buildResults({ asset, income, transport, workLat, workLng, loan, loanRate }) {
  const results = [];

  for (const region of CANDIDATE_REGIONS) {
    for (const opt of region.options) {
      const deposit = opt.type === '전세' ? opt.depositMan : (opt.depositForRent || 0);
      const rentMan = opt.type === '월세' ? opt.rentMan : 0;

      // 예산 필터: 대출 미포함 시 자본금 ≤ 보유 자산
      const capitalMan = Math.max(0, deposit - asset);
      if (!loan && capitalMan > asset) continue;

      // 월 고정비 계산
      const usedRate = loanRate || 3.5;
      const monthlyInterest = Math.round((capitalMan * (usedRate / 100)) / 12);
      const monthlyMan = monthlyInterest + rentMan + (region.maintenanceFee || 0);

      // 출퇴근 시간 (API 호출, 실패 시 직선거리 추정)
      let commuteMin = null;
      let isEstimated = true;
      if (workLat && workLng && region.coords) {
        try {
          const r = await fetch(
            `/api/commute?ox=${workLng}&oy=${workLat}&dx=${region.coords.lng}&dy=${region.coords.lat}&transport=${encodeURIComponent(transport || '대중교통')}`
          );
          const d = await r.json();
          commuteMin = d.minutes;
          isEstimated = d.isEstimated;
        } catch {
          // 직선거리 fallback은 API에서 처리됨
        }
      }
      if (commuteMin == null) {
        // 좌표 없을 경우 기본 추정
        commuteMin = 30 + Math.floor(Math.random() * 30);
        isEstimated = true;
      }

      // 생활권 점수 (API 호출)
      let life = { subway: 0, store: 0, mart: 0, hospital: 0 };
      if (region.coords) {
        try {
          const r = await fetch(`/api/facilities?lat=${region.coords.lat}&lng=${region.coords.lng}`);
          life = await r.json();
        } catch {}
      }

      // 스코어 계산
      const cs = commuteScore(commuteMin);
      const ps = priceScore(deposit, deposit * 1.05); // TODO: 실거래가 API 연동 시 avgPrice 교체
      const ls = lifeScore(life, null);
      const score = totalScore(cs, ps, ls);

      // 가격 레이블
      const priceLabel = opt.type === '전세'
        ? formatKRW(opt.depositMan)
        : `보증금 ${formatKRW(opt.depositForRent || 0)} · 월 ${opt.rentMan}만원`;
      const commuteLabel = `${commuteMin}분${isEstimated ? '*' : ''}`;

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
        capitalMan,
        monthlyMan,
        commuteMin,
        commuteLabel,
        life,
        score,
        noData: false,
      });
    }
  }

  // 추천순 정렬
  results.sort((a, b) => b.score - a.score);
  return results;
}

// ── ResultsPage ────────────────────────────────────────────────────
export default function ResultsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({ type: '전체', home: '무관', loan: false });
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slowWarning, setSlowWarning] = useState(false);
  const [allResults, setAllResults] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'

  useEffect(() => {
    const f = getFormData();
    const p = getPrefsData();
    setFilters((prev) => ({ ...prev, type: p.housing === '전세' ? '전세만' : p.housing === '월세' ? '월세만' : '전체' }));

    const slowTimer = setTimeout(() => setSlowWarning(true), 3000);

    buildResults({
      asset: parseInt(f.asset || '0', 10),
      income: parseInt(f.income || '0', 10),
      transport: p.transport || '대중교통',
      workLat: f.workLat || null,
      workLng: f.workLng || null,
      loan: false,
      loanRate: 3.5,
    }).then((results) => {
      clearTimeout(slowTimer);
      setSlowWarning(false);
      setAllResults(results);
      setLoading(false);

      // 히스토리 저장
      if (f.work && results.length > 0) {
        addHistory({
          id: `h_${Date.now()}`,
          region: `${results[0].gu} ${results[0].dong}`,
          count: results.length,
          work: f.work,
          asset: f.asset || '0',
          housing: p.housing || '전월세',
          transport: p.transport || '대중교통',
          ago: '방금',
        });
      }
    });

    return () => clearTimeout(slowTimer);
  }, []);

  // 필터 적용
  const filtered = allResults.filter((item) => {
    if (filters.type === '전세만' && item.type !== '전세') return false;
    if (filters.type === '월세만' && item.type !== '월세') return false;
    return true;
  });

  const header = (
    <div style={{ paddingTop: 50, background: 'var(--bg)', boxShadow: '0 1px 0 rgba(0,0,0,0.03)' }}>
      <div style={{ padding: '6px 16px 0', display: 'flex', alignItems: 'center', gap: 4 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>추천 지역</h1>
        {/* 지도/목록 토글 — 결과 있을 때만 표시 */}
        {!loading && filtered.length > 0 && (
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            style={{
              marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
              background: 'var(--surface)', color: 'var(--ink-2)',
              boxShadow: 'var(--card-shadow)',
              transition: 'all .14s ease',
            }}
          >
            {viewMode === 'list' ? <><IconMap size={15} /> 지도</> : <><IconList size={15} /> 목록</>}
          </button>
        )}
        {/* 로딩 중에는 토글 자리 확보 */}
        {(loading || filtered.length === 0) && <span style={{ marginLeft: 'auto' }} />}
        {/* 닫기(홈으로) 버튼 */}
        <button
          onClick={() => router.push('/')}
          aria-label="홈으로"
          style={{
            marginLeft: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: 999, border: 'none', cursor: 'pointer',
            background: 'var(--line)', color: 'var(--ink-2)',
            flexShrink: 0,
          }}
        >
          <IconClose size={18} />
        </button>
      </div>
      <FilterBar filters={filters} setFilters={setFilters} />
    </div>
  );

  // 지도 뷰
  if (viewMode === 'map') {
    const hasKakaoKey = !!process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {header}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {hasKakaoKey
            ? <ResultsKakaoMap items={filtered} onExpand={setExpanded} />
            : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 32px', textAlign: 'center', background: 'var(--bg)' }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--card-shadow)' }}>
                  <IconMap size={30} style={{ color: 'var(--ink-3)' }} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>지도를 표시할 수 없습니다</div>
                <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.6 }}>
                  지도 기능은 카카오맵 API 키가 필요합니다.<br />
                  Vercel 환경변수에<br />
                  <code style={{ fontSize: 12, background: 'var(--line)', padding: '2px 6px', borderRadius: 4 }}>NEXT_PUBLIC_KAKAO_MAP_KEY</code><br />
                  를 설정해주세요.
                </p>
                <button
                  onClick={() => setViewMode('list')}
                  style={{ marginTop: 4, padding: '10px 24px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, background: 'var(--accent)', color: '#fff' }}
                >
                  목록으로 돌아가기
                </button>
              </div>
            )
          }
        </div>
        {expanded && <ExpandedSheet item={expanded} onClose={() => setExpanded(null)} />}
      </div>
    );
  }

  // 목록 뷰
  return (
    <>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {header}
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {slowWarning && loading && (
            <div style={{ margin: '16px 20px 0', padding: '12px 16px', borderRadius: 12, background: 'var(--accent-weak)', fontSize: 13.5, fontWeight: 600, color: 'var(--accent)' }}>
              데이터를 불러오는 중입니다 (최대 15초)
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px 20px' }}>
            {loading
              ? [1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)
              : filtered.length === 0
                ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-3)' }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>조건 내 결과가 없습니다</div>
                    <p style={{ marginTop: 8, fontSize: 14 }}>대출 포함 시 더 많은 결과를 볼 수 있습니다</p>
                  </div>
                )
                : filtered.map((item) => <ResultCard key={item.id} item={item} onExpand={setExpanded} />)
            }
            {!loading && filtered.some((i) => i.commuteLabel.includes('*')) && (
              <p style={{ fontSize: 12, color: 'var(--ink-3)', textAlign: 'center', margin: '4px 0 8px' }}>
                * 출퇴근 시간은 직선거리 기반 추정값입니다
              </p>
            )}
          </div>
        </div>
      </div>
      {expanded && <ExpandedSheet item={expanded} onClose={() => setExpanded(null)} />}
    </>
  );
}
