// pages/map.jsx — 지도 뷰
import { useState } from 'react';
import { useRouter } from 'next/router';
import { DEMO_DATA, ScoreBadge, regionLabel, scoreFg } from '../components/shared';
import { MapCanvas } from '../components/layout/Screen';
import { IconList, IconWalk, IconChevRight, IconChevDown } from '../components/icons';

function FilterPill({ label, chevron, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
      padding: '9px 13px', borderRadius: 999, border: 'none', cursor: 'pointer',
      fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap',
      background: active ? 'var(--accent)' : 'var(--surface)',
      color: active ? '#fff' : 'var(--ink-2)',
      transition: 'all .14s ease',
    }}>
      {label}
      {chevron && <IconChevDown size={15} style={{ marginRight: -2, opacity: 0.8 }} />}
    </button>
  );
}

function MapPin({ item, selected, onClick }) {
  const fg = scoreFg(item.score, 'graded');
  return (
    <div onClick={(e) => { e.stopPropagation(); onClick(item); }}
      style={{ position: 'absolute', left: `${item.pin.x}%`, top: `${item.pin.y}%`,
        transform: `translate(-50%,-100%) scale(${selected ? 1.12 : 1})`,
        transformOrigin: 'bottom center', transition: 'transform .18s ease', cursor: 'pointer', zIndex: selected ? 6 : 3 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 999, whiteSpace: 'nowrap',
        background: selected ? 'var(--accent)' : 'var(--surface)', color: selected ? '#fff' : 'var(--ink)',
        fontWeight: 700, fontSize: 13, boxShadow: selected ? '0 8px 20px rgba(49,130,246,0.4)' : '0 3px 10px rgba(0,0,0,0.16)' }}>
        {item.dong}
        <span style={{ fontWeight: 800, color: selected ? '#fff' : fg }}>{item.score}</span>
      </div>
      <div style={{ width: 0, height: 0, margin: '0 auto', borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
        borderTop: `7px solid ${selected ? 'var(--accent)' : 'var(--surface)'}` }} />
    </div>
  );
}

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

export default function MapPage() {
  const router = useRouter();
  const [sel, setSel] = useState(DEMO_DATA[0].id);
  const selItem = DEMO_DATA.find((d) => d.id === sel);

  return (
    <div style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <MapCanvas style={{ position: 'absolute' }}>
        {DEMO_DATA.map((item) => (
          <MapPin key={item.id} item={item} selected={item.id === sel} onClick={(it) => setSel(it.id)} />
        ))}
      </MapCanvas>

      {/* top filter bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 52, zIndex: 10 }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '10px 16px 12px', scrollbarWidth: 'none',
          background: 'rgba(242,244,246,0.72)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}>
          <FilterPill label="전세만" chevron active />
          <FilterPill label="무관" chevron />
          <FilterPill label="60분 이하" chevron />
          <FilterPill label="추천순" chevron />
        </div>
      </div>

      {/* selected popup card */}
      {selItem && (
        <div style={{ position: 'absolute', left: 16, right: 16, bottom: 92, zIndex: 12, animation: 'popIn .2s ease' }}>
          <div onClick={() => router.push('/results')} style={{ background: 'var(--surface)', borderRadius: 16, padding: 16, cursor: 'pointer', boxShadow: '0 12px 30px rgba(0,0,0,0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 16, color: 'var(--ink)', fontWeight: 800, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{regionLabel(selItem)}</span>
              <ScoreBadge score={selItem.score} />
            </div>
            <div style={{ marginTop: 9, fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-2)', background: 'var(--bg)', padding: '2px 7px', borderRadius: 6, marginRight: 7 }}>{selItem.type}</span>
              {selItem.price}
            </div>
            <div style={{ marginTop: 11, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <MiniStat icon={<IconWalk size={16} />} label="출퇴근" value={selItem.commute} />
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 13.5, fontWeight: 700, color: 'var(--accent)' }}>
                자세히 보기 <IconChevRight size={15} />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* bottom list button */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px 30px', zIndex: 12 }}>
        <button onClick={() => router.push('/results')} style={{ width: '100%', height: 54, borderRadius: 16, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          background: 'var(--surface)', color: 'var(--ink)', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: '0 8px 22px rgba(0,0,0,0.16)' }}>
          <IconList size={20} /> 목록으로 보기
        </button>
      </div>
    </div>
  );
}
