// pages/results.jsx — 추천 결과
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getFormData, getPrefsData, addHistory } from '../lib/storage';
import { DEMO_DATA, ScoreBadge, regionLabel, scoreFg, gradeColors } from '../components/shared';
import { Screen, Footer, MapCanvas } from '../components/layout/Screen';
import {
  IconMap, IconHome, IconWalk, IconWallet, IconWon,
  IconSubway, IconStore, IconCart, IconHospital, IconChevDown, IconClose,
  IconExternal, IconPin, IconChevRight,
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

// ── FilterBar ──────────────────────────────────────────────────────
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
        <span style={{ fontSize: 17.5, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{item.price}</span>
      </div>
      <div style={{ marginTop: 15, display: 'flex', gap: 14, flexWrap: 'wrap', rowGap: 8 }}>
        <MiniStat label="자본금" value={item.capital} />
        <MiniStat label="월" value={item.monthly} />
        <MiniStat label="출퇴근" value={item.commute} />
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
  const tone = item.statusTone === 'good' ? 'var(--good)' : item.statusTone === 'mid' ? 'var(--mid)' : 'var(--good)';
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
            <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>{item.price}</span>
          </div>
          <div style={{ marginTop: 8, fontSize: 13.5, color: 'var(--ink-2)', fontWeight: 500 }}>
            최근 3개월 평균 시세 <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{item.avg}</span>
            <span style={{ marginLeft: 6, color: tone, fontWeight: 700 }}>({item.status})</span>
          </div>
          <div style={{ marginTop: 18, display: 'flex', background: 'var(--bg)', borderRadius: 14, padding: '14px 6px' }}>
            <DetailStat icon={<IconWallet size={21} />} label="최소 자본금" value={item.capital} />
            <div style={{ width: 1, background: 'var(--line)', margin: '2px 0' }} />
            <DetailStat icon={<IconWon size={21} />} label="월 고정비" value={item.monthly} />
            <div style={{ width: 1, background: 'var(--line)', margin: '2px 0' }} />
            <DetailStat icon={<IconWalk size={21} />} label="출퇴근" value={item.commute} />
          </div>
          <div style={{ marginTop: 22, fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>생활권 요약</div>
          <div style={{ marginTop: 11, display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
            <FacilityChip icon={<IconSubway size={18} />} label="지하철" count={item.life.subway} />
            <FacilityChip icon={<IconStore size={18} />} label="편의점" count={item.life.store} />
            <FacilityChip icon={<IconCart size={18} />} label="대형마트" count={item.life.mart} />
            <FacilityChip icon={<IconHospital size={18} />} label="병원" count={item.life.hospital} />
          </div>
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
          <div style={{ marginTop: 20 }}>
            <button style={{ width: '100%', height: 56, borderRadius: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              background: 'var(--accent)', color: '#fff', fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              직방에서 매물 보기 <IconExternal size={19} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ResultsPage ────────────────────────────────────────────────────
export default function ResultsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({ type: '전체', home: '무관', loan: false });
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({});
  const [prefs, setPrefs] = useState({});

  useEffect(() => {
    const f = getFormData();
    const p = getPrefsData();
    setForm(f);
    setPrefs(p);

    // 히스토리 저장
    if (f.work) {
      addHistory({
        id: `h_${Date.now()}`,
        region: '서울 추천 지역',
        count: DEMO_DATA.length,
        work: f.work || '강남구',
        asset: f.asset || '0',
        housing: p.housing || '전월세',
        transport: p.transport || '대중교통',
        ago: '방금',
      });
    }

    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  // 필터 적용
  const filtered = DEMO_DATA.filter((item) => {
    if (filters.type === '전세만' && item.type !== '전세') return false;
    if (filters.type === '월세만' && item.type !== '월세') return false;
    return true;
  });

  const header = (
    <div style={{ paddingTop: 50, background: 'var(--bg)', boxShadow: '0 1px 0 rgba(0,0,0,0.03)' }}>
      <div style={{ padding: '6px 16px 0', display: 'flex', alignItems: 'center', gap: 4 }}>
        <button onClick={() => router.push('/')} aria-label="back" style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex', color: 'var(--ink-2)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 5-7 7 7 7" /></svg>
        </button>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>추천 지역</h1>
        <span style={{ marginLeft: 'auto', fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600 }}>{filtered.length}곳 추천</span>
      </div>
      <FilterBar filters={filters} setFilters={setFilters} />
    </div>
  );

  const footer = (
    <div style={{ padding: '10px 20px 30px', background: 'linear-gradient(to top, var(--bg) 70%, rgba(242,244,246,0))' }}>
      <button onClick={() => router.push('/map')} style={{ width: '100%', height: 54, borderRadius: 16, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        background: 'var(--ink)', color: '#fff', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        boxShadow: '0 8px 22px rgba(25,31,40,0.28)' }}>
        <IconMap size={20} /> 지도로 보기
      </button>
    </div>
  );

  return (
    <>
      <Screen header={header} footer={footer}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px 20px' }}>
          {loading
            ? [1, 2, 3].map((i) => <SkeletonCard key={i} />)
            : filtered.map((item) => <ResultCard key={item.id} item={item} onExpand={setExpanded} />)
          }
        </div>
      </Screen>
      {expanded && <ExpandedSheet item={expanded} onClose={() => setExpanded(null)} />}
    </>
  );
}
