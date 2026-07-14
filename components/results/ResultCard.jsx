// components/results/ResultCard.jsx — 결과 목록의 카드(+로딩 스켈레톤)
import { ScoreBadge, regionLabel } from '../shared';
import { IconHome, IconSubway, IconCar } from '../icons';

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

export function ResultCard({ item, onExpand, index = 0 }) {
  return (
    <div onClick={() => onExpand(item)} style={{ background: 'var(--surface)', borderRadius: 16, padding: 18, cursor: 'pointer', boxShadow: 'var(--card-shadow)', animation: 'fadeUp 0.35s ease both', animationDelay: `${Math.min(index, 7) * 0.055}s` }}>
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
        <MiniStat icon={<IconSubway size={14} />} value={item.transitLabel} />
        <MiniStat icon={<IconCar size={14} />} value={item.carLabel} />
      </div>
    </div>
  );
}

// ── Skeleton Card ─────────────────────────────────────────────────
export function SkeletonCard() {
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
