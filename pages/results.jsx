// pages/results.jsx — 추천 결과 (실제 사용자 입력 기반 필터링 + API 연동)
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { getFormData, getPrefsData, addHistory } from '../lib/storage';
import { commuteScore, priceScore, lifeScore, totalScore, MAX_AFFORDABLE_RATIO } from '../lib/score';
import { CANDIDATE_REGIONS, ScoreBadge, regionLabel, scoreFg, gradeColors, formatKRW } from '../components/shared';
import { MapCanvas } from '../components/layout/Screen';
import {
  IconMap, IconHome, IconWalk, IconWallet, IconWon,
  IconSubway, IconStore, IconCart, IconHospital, IconChevDown, IconClose,
  IconExternal, IconPin, IconChevRight, IconList,
} from '../components/icons';

// ── DropdownPill: 클릭 시 드롭다운 펼치는 필터 칩 ─────────────────
function DropdownPill({ label, active, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target) &&
          btnRef.current && !btnRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  function handleOpen() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, left: rect.left });
    }
    setOpen((o) => !o);
  }

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        ref={btnRef}
        onClick={handleOpen}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '9px 13px', borderRadius: 999, border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap',
          background: active ? 'var(--accent)' : 'var(--surface)',
          color: active ? '#fff' : 'var(--ink-2)',
          transition: 'all .14s ease', WebkitTapHighlightColor: 'transparent',
        }}
      >
        {label}
        <IconChevDown size={15} style={{ marginRight: -2, opacity: 0.8, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
      </button>
      {open && (
        <div ref={ref} style={{
          position: 'fixed', top: pos.top, left: pos.left, zIndex: 200,
          background: 'var(--surface)', borderRadius: 14, overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.14), 0 0 0 1px var(--line)',
          minWidth: 120,
        }}>
          {options.map((opt, i) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '12px 16px', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 14, fontWeight: 600, textAlign: 'left',
                background: value === opt.value ? 'var(--accent-weak)' : 'transparent',
                color: value === opt.value ? 'var(--accent)' : 'var(--ink)',
                borderTop: i ? '1px solid var(--bg)' : 'none',
              }}
            >
              {opt.label}
              {value === opt.value && <span style={{ fontSize: 12, color: 'var(--accent)' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 토글 칩 (대출 포함 ON/OFF) ─────────────────────────────────────
function TogglePill({ label, on, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
      padding: '9px 13px', borderRadius: 999, border: 'none', cursor: 'pointer',
      fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap',
      background: on ? 'var(--accent)' : 'var(--surface)',
      color: on ? '#fff' : 'var(--ink-2)',
      transition: 'all .14s ease', WebkitTapHighlightColor: 'transparent',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: 999, background: on ? '#fff' : 'var(--ink-3)' }} />
      {label}
    </button>
  );
}

function FilterBar({ filters, setFilters }) {
  const ref = useRef(null);
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 });

  function onMouseDown(e) {
    // 드롭다운 버튼 클릭은 드래그 시작 안 함
    if (e.target.closest('[data-no-drag]')) return;
    drag.current = { active: true, startX: e.pageX - ref.current.offsetLeft, scrollLeft: ref.current.scrollLeft };
    ref.current.style.cursor = 'grabbing';
  }
  function onMouseMove(e) {
    if (!drag.current.active) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    ref.current.scrollLeft = drag.current.scrollLeft - (x - drag.current.startX);
  }
  function onMouseUp() {
    drag.current.active = false;
    if (ref.current) ref.current.style.cursor = 'grab';
  }

  return (
    <div
      ref={ref}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', gap: '4px', padding: '14px 20px', cursor: 'grab', userSelect: 'none' }}
    >
      {/* 추천순 — 가장 앞 */}
      <div data-no-drag>
        <DropdownPill
          label={filters.sort === 'monthly' ? '고정비순' : filters.sort === 'commute' ? '출퇴근순' : '추천순'}
          active
          value={filters.sort || 'score'}
          options={[
            { value: 'score',    label: '추천순' },
            { value: 'monthly',  label: '고정비순' },
            { value: 'commute',  label: '출퇴근순' },
          ]}
          onChange={(v) => setFilters({ ...filters, sort: v })}
        />
      </div>
      {/* 거래 유형 */}
      <div data-no-drag>
        <DropdownPill
          label={filters.type === '전세만' ? '전세' : filters.type === '월세만' ? '월세' : '전·월세'}
          active={filters.type !== '전체'}
          value={filters.type}
          options={[
            { value: '전체',   label: '전·월세' },
            { value: '전세만', label: '전세만' },
            { value: '월세만', label: '월세만' },
          ]}
          onChange={(v) => setFilters({ ...filters, type: v })}
        />
      </div>
      {/* 대출 포함 토글 */}
      <TogglePill label="대출 포함" on={filters.loan} onClick={() => setFilters({ ...filters, loan: !filters.loan })} />
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
          <span style={{ fontSize: 14.5, color: 'var(--ink-3)', fontWeight: 600, letterSpacing: '-0.01em', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
        <MiniStat label="월 고정비" value={`${item.monthlyMan}만원`} />
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

function DetailStat({ icon, label, value, note }) {
  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '4px 8px', textAlign: 'center' }}>
      <span style={{ color: 'var(--ink-3)', display: 'flex' }}>{icon}</span>
      <span style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 800, whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}>{value}</span>
      {note && <span style={{ fontSize: 10.5, color: 'var(--ink-3)', fontWeight: 500 }}>{note}</span>}
    </div>
  );
}

// ── ScoreFactor: 추천 근거 막대 ────────────────────────────────────
function ScoreFactor({ label, weight, score }) {
  const fg = score >= 75 ? 'var(--accent)' : score >= 50 ? 'var(--good)' : 'var(--mid)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-2)', width: 76, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', width: 30, flexShrink: 0 }}>{weight}</span>
      <div style={{ flex: 1, height: 7, borderRadius: 999, background: 'var(--line)', overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', borderRadius: 999, background: fg, transition: 'width .3s ease' }} />
      </div>
      <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--ink)', width: 26, textAlign: 'right', flexShrink: 0 }}>{score}</span>
    </div>
  );
}

// ── ExpandedSheet ─────────────────────────────────────────────────
function ExpandedSheet({ item, onClose, myAsset }) {
  // 다방은 좌표 기반 지도 URL이 가장 안정적으로 해당 동네 매물을 보여준다
  // (자유 텍스트 검색 URL은 동작이 불안정함). 거래유형은 지도 로드 후 필터로 선택.
  const lat = item.coords?.lat;
  const lng = item.coords?.lng;
  const dabangUrl = (lat && lng)
    ? `https://www.dabangapp.com/map/onetwo?m_lat=${lat}&m_lng=${lng}&m_zoom=15`
    : `https://www.dabangapp.com/search/${encodeURIComponent(item.dong)}`;



  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 40 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,20,28,0.45)', animation: 'fade .2s ease' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '90%', display: 'flex', flexDirection: 'column',
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
          <div style={{ marginTop: 18, display: 'flex', background: 'var(--bg)', borderRadius: 14, padding: '14px 0', overflow: 'hidden' }}>
            <DetailStat icon={<IconWon size={21} />} label="월 고정비" value={`${item.monthlyMan}만원`} note="관리비 포함" />
            <div style={{ width: 1, background: 'var(--line)', margin: '2px 0' }} />
            <DetailStat icon={<IconWalk size={21} />} label="출퇴근" value={item.commuteLabel} />
          </div>
          {item.breakdown && (
            <>
              <div style={{ marginTop: 22, fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>추천 근거</div>
              <div style={{ marginTop: 11, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <ScoreFactor label="직주근접" weight="50%" score={item.breakdown.commute} />
                <ScoreFactor label="가격 적정성" weight="35%" score={item.breakdown.price} />
                <ScoreFactor label="생활 편의" weight="15%" score={item.breakdown.life} />
              </div>
            </>
          )}
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
            <a href={dabangUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              <button style={{
                width: '100%', height: 54, borderRadius: 14, border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 16, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                background: '#FF4076', color: '#fff',
              }}>
다방에서 {item.dong} 매물 보기 <IconExternal size={18} />
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 카카오맵 기반 결과 지도 ────────────────────────────────────────
function ResultsKakaoMap({ items, onExpand, workLat, workLng }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    function init() {
      const kakao = window.kakao;
      if (!kakao?.maps) return;
      kakao.maps.load(() => {
        const center = new kakao.maps.LatLng(37.5326, 126.9903);
        const map = new kakao.maps.Map(containerRef.current, { center, level: 8 });

        // 추천 지역 핀 — 클릭 시 상세보기
        items.forEach((item) => {
          if (!item.coords) return;
          const pos = new kakao.maps.LatLng(item.coords.lat, item.coords.lng);
          const fg = gradeColors(item.score).fg.replace('var(--accent)', '#3182F6').replace('var(--good)', '#15B97E').replace('var(--mid)', '#F59000');
          const el = document.createElement('div');
          el.style.cssText = 'display:flex;align-items:center;gap:4px;padding:6px 10px;border-radius:999px;white-space:nowrap;background:#fff;font-weight:700;font-size:13px;box-shadow:0 3px 10px rgba(0,0,0,0.16);font-family:Pretendard,sans-serif;cursor:pointer;';
          el.innerHTML = `${item.dong}<span style="font-weight:800;color:${fg}">&nbsp;${item.score}점</span>`;
          el.addEventListener('click', () => onExpand && onExpand(item));
          const overlay = new kakao.maps.CustomOverlay({ position: pos, content: el, yAnchor: 1.3, clickable: true });
          overlay.setMap(map);
        });

        // 회사 위치 마커
        if (workLat && workLng) {
          const workPos = new kakao.maps.LatLng(workLat, workLng);
          const workContent = `<div style="display:flex;align-items:center;gap:5px;padding:6px 11px;border-radius:999px;white-space:nowrap;background:#1A1E27;color:#fff;font-weight:700;font-size:13px;box-shadow:0 3px 10px rgba(0,0,0,0.25);font-family:Pretendard,sans-serif;">🏢 직장</div>`;
          const workOverlay = new kakao.maps.CustomOverlay({ position: workPos, content: workContent, yAnchor: 1.3 });
          workOverlay.setMap(map);
        }
      });
    }
    if (window.kakao?.maps) init();
    else {
      const t = setInterval(() => { if (window.kakao?.maps) { clearInterval(t); init(); } }, 200);
      return () => clearInterval(t);
    }
  }, [items, workLat, workLng]);

  return <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />;
}

// ── 핵심: 후보 지역을 사용자 입력 기반으로 스코어링 ────────────────
// 두 좌표 간 직선거리(km) 계산
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 직선거리 기반 출퇴근 시간 추정 (서울 교통 현실 반영)
function estimateCommute(km, transport) {
  if (transport === '자가용') {
    // 서울 자가용: 평균 시속 18km (신호, 정체 반영) + 주차 이동 5분
    return Math.round(km / 18 * 60 + 5);
  }
  // 대중교통: 도보+대기 10분 + 평균 시속 28km
  return Math.round(km / 28 * 60 + 10);
}

async function buildResults({ asset, income, transport, workLat, workLng, loan, loanRate }) {
  const results = [];
  // 서울 시청 좌표: 직장 좌표 없을 때 fallback
  const wx = workLng || 126.9780;
  const wy = workLat || 37.5665;

  for (const region of CANDIDATE_REGIONS) {
    for (const opt of region.options) {
      const deposit = opt.type === '전세' ? opt.depositMan : (opt.depositForRent || 0);
      const rentMan = opt.type === '월세' ? opt.rentMan : 0;

      // 예산 필터: 대출 미포함 시 보증금 ≤ 보유 자산
      if (!loan && deposit > asset) continue;

      // 최소 자본금 = 보증금 (실제로 묶이는 돈)
      const capitalMan = deposit;

      // 월 고정비 = 대출이자 + 월세 + 관리비
      const loanNeeded = Math.max(0, deposit - asset);
      const usedRate = loanRate || 3.5;
      const monthlyInterest = Math.round((loanNeeded * (usedRate / 100)) / 12);
      const monthlyMan = monthlyInterest + rentMan + (region.maintenanceFee || 0);

      // 출퇴근 시간 — API 우선, 실패 시 직선거리로 직접 계산
      let commuteMin = null;
      let isEstimated = true;
      try {
        const r = await fetch(
          `/api/commute?ox=${wx}&oy=${wy}&dx=${region.coords.lng}&dy=${region.coords.lat}&transport=${encodeURIComponent(transport || '대중교통')}`
        );
        const d = await r.json();
        commuteMin = d.minutes;
        isEstimated = d.isEstimated;
      } catch {}

      if (commuteMin == null) {
        const km = haversineKm(wy, wx, region.coords.lat, region.coords.lng);
        commuteMin = estimateCommute(km, transport);
        isEstimated = true;
      }

      // 생활권 — API 우선, 실패/0 시 지역 기본값 사용
      let life = region.defaultLife;
      try {
        const r = await fetch(`/api/facilities?lat=${region.coords.lat}&lng=${region.coords.lng}`);
        const apiLife = await r.json();
        // API가 실제 데이터를 줬을 때만 사용 (합계 > 0)
        const total = Object.values(apiLife).reduce((s, v) => s + v, 0);
        if (total > 0) life = apiLife;
      } catch {}

      // 출퇴근 90분 초과 지역 제외 (직주근접 핵심 — 너무 먼 곳은 후보 아님)
      if (commuteMin > 90) continue;

      // 감당 불가 제외 — 월 고정비가 소득의 70% 초과면 후보에서 뺀다
      if (income > 0 && monthlyMan > income * MAX_AFFORDABLE_RATIO) continue;

      // 세부 점수 (각 0~1) → 가중치 적용
      const cs = commuteScore(commuteMin);
      const ps = priceScore(monthlyMan, income);
      const ls = lifeScore(life, CANDIDATE_REGIONS.map((r) => r.defaultLife));
      const score = totalScore(cs, ps, ls);

      // 점수 근거 (상세 화면 표시용)
      const breakdown = {
        commute: Math.round(cs * 100),
        price: Math.round(ps * 100),
        life: Math.round(ls * 100),
      };

      // 가격 레이블
      const priceLabel = opt.type === '전세'
        ? formatKRW(opt.depositMan)
        : `보증금 ${formatKRW(opt.depositForRent || 0)} · 월 ${opt.rentMan}만원`;
      const transportIcon = (transport === '자가용') ? '🚗' : '🚇';
      const commuteLabel = `${transportIcon} ${commuteMin}분${isEstimated ? '*' : ''}`;

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
        breakdown,
        noData: false,
        needsLoan: deposit > asset,
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
  const [myAsset, setMyAsset] = useState(0);
  const [workCoords, setWorkCoords] = useState({ lat: null, lng: null });

  useEffect(() => {
    const f = getFormData();
    const p = getPrefsData();
    const assetVal = parseInt(f.asset || '0', 10);
    setMyAsset(assetVal);
    setWorkCoords({ lat: f.workLat || null, lng: f.workLng || null });
    setFilters((prev) => ({ ...prev, type: p.housing === '전세' ? '전세만' : p.housing === '월세' ? '월세만' : '전체' }));

    const slowTimer = setTimeout(() => setSlowWarning(true), 3000);

    buildResults({
      asset: assetVal,
      income: parseInt(f.income || '0', 10),
      transport: p.transport || '대중교통',
      workLat: f.workLat || null,
      workLng: f.workLng || null,
      loan: true,  // 항상 전체 계산, 대출 필터는 프론트에서
      loanRate: 3.5,
    }).then((results) => {
      clearTimeout(slowTimer);
      setSlowWarning(false);
      setAllResults(results);
      setLoading(false);

      // 실제 새 검색(step2 또는 히스토리 재조회)일 때만 히스토리 저장
      const isNewSearch = sessionStorage.getItem('zipter_new_search') === '1';
      sessionStorage.removeItem('zipter_new_search');
      if (isNewSearch && f.work && results.length > 0) {
        addHistory({
          id: `h_${Date.now()}`,
          region: `${results[0].gu} ${results[0].dong}`,
          count: results.length,
          work: f.work,
          asset: f.asset || '0',
          depositMan: results[0].depositMan,
          monthlyMan: results[0].monthlyMan,
          housing: p.housing || '전월세',
          transport: p.transport || '대중교통',
          ago: '방금',
        });
      }
    });

    return () => clearTimeout(slowTimer);
  }, []);

  // 필터 + 정렬 적용
  const filtered = allResults
    .filter((item) => {
      if (!filters.loan && item.needsLoan) return false;
      if (filters.type === '전세만' && item.type !== '전세') return false;
      if (filters.type === '월세만' && item.type !== '월세') return false;
      return true;
    })
    .sort((a, b) => {
      if (filters.sort === 'monthly') return a.monthlyMan - b.monthlyMan;
      if (filters.sort === 'commute') return a.commuteMin - b.commuteMin;
      return b.score - a.score; // 기본: 추천순
    });

  const header = (
    <div style={{ paddingTop: 50, background: 'var(--bg)', boxShadow: '0 1px 0 rgba(0,0,0,0.03)' }}>
      <div style={{ padding: '6px 16px 0', display: 'flex', alignItems: 'center', gap: 4 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>추천 지역</h1>
        <span style={{ marginLeft: 'auto' }} />
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
            ? <ResultsKakaoMap items={filtered} onExpand={setExpanded} workLat={workCoords.lat} workLng={workCoords.lng} />
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
        {expanded && <ExpandedSheet item={expanded} onClose={() => setExpanded(null)} myAsset={myAsset} />}
        {/* 하단 목록 토글 */}
        <div style={{ padding: '12px 20px 28px', background: 'var(--bg)' }}>
          <button
            onClick={() => setViewMode('list')}
            style={{ width: '100%', height: 50, borderRadius: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'var(--surface)', color: 'var(--ink-2)', boxShadow: 'var(--card-shadow)' }}
          >
            <IconList size={17} /> 목록으로 보기
          </button>
        </div>
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
        {/* 하단 지도 토글 */}
        {!loading && filtered.length > 0 && (
          <div style={{ padding: '12px 20px 28px', background: 'var(--bg)' }}>
            <button
              onClick={() => setViewMode('map')}
              style={{ width: '100%', height: 50, borderRadius: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'var(--surface)', color: 'var(--ink-2)', boxShadow: 'var(--card-shadow)' }}
            >
              <IconMap size={17} /> 지도로 보기
            </button>
          </div>
        )}
      </div>
      {expanded && <ExpandedSheet item={expanded} onClose={() => setExpanded(null)} myAsset={myAsset} />}
    </>
  );
}
