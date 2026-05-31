// shared.jsx — design tokens consumers, shared UI atoms, demo data, tweak context.

const TweakCtx = React.createContext({ scoreStyle: 'graded' });

// ── score color grading ────────────────────────────────────────────
function gradeColors(score) {
  if (score >= 85) return { fg: 'var(--accent)', bg: 'var(--accent-weak)' };
  if (score >= 75) return { fg: 'var(--good)', bg: 'var(--good-weak)' };
  return { fg: 'var(--mid)', bg: 'var(--mid-weak)' };
}
function scoreFg(score, style) {
  if (style === 'plain') return 'var(--accent)';
  return gradeColors(score).fg;
}

// ── Score badge (pill with number) ─────────────────────────────────
function ScoreBadge({ score, size = 'md' }) {
  const { scoreStyle } = React.useContext(TweakCtx);
  const fg = scoreFg(score, scoreStyle);
  const bg = scoreStyle === 'plain' ? 'var(--accent-weak)' : gradeColors(score).bg;
  const big = size === 'lg';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'baseline', gap: 3,
      background: bg, color: fg, borderRadius: 999,
      padding: big ? '7px 13px' : '4px 10px', fontWeight: 700,
      fontSize: big ? 20 : 15, lineHeight: 1, fontVariantNumeric: 'tabular-nums'
    }}>
      {score}<span style={{ fontSize: big ? 12 : 11, fontWeight: 600, opacity: 0.85 }}>점</span>
    </div>);

}

// ── thin score bar ─────────────────────────────────────────────────
function ScoreBar({ score }) {
  const { scoreStyle } = React.useContext(TweakCtx);
  const fg = scoreFg(score, scoreStyle);
  return (
    <div style={{ height: 5, borderRadius: 999, background: 'var(--line)', overflow: 'hidden' }}>
      <div style={{ width: `${score}%`, height: '100%', borderRadius: 999, background: fg }} />
    </div>);

}

// ── Button ─────────────────────────────────────────────────────────
function Button({ children, variant = 'primary', onClick, disabled, style }) {
  const base = {
    width: '100%', border: 'none', cursor: disabled ? 'default' : 'pointer',
    borderRadius: 14, fontFamily: 'inherit', fontWeight: 700, fontSize: 17,
    height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 6, transition: 'transform .06s ease, background .15s ease', WebkitTapHighlightColor: 'transparent'
  };
  const variants = {
    primary: { background: disabled ? 'var(--line)' : 'var(--accent)', color: disabled ? 'var(--ink-3)' : '#fff' },
    outline: { background: 'var(--surface)', color: 'var(--accent)', boxShadow: 'inset 0 0 0 1.5px var(--accent)' },
    ghost: { background: 'transparent', color: 'var(--ink-3)', height: 44, fontSize: 15, fontWeight: 600 }
  };
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled}
    onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = 'scale(0.985)')}
    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    style={{ ...base, ...variants[variant], ...style }} data-comment-anchor="bc72f9d8e4-button-59-5">
      {children}
    </button>);

}

// ── Chip (toggle) ──────────────────────────────────────────────────
function Chip({ label, selected, disabled, onClick, trailing }) {
  return (
    <button onClick={disabled ? undefined : onClick}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '11px 16px', borderRadius: 12, fontFamily: 'inherit',
      fontSize: 15, fontWeight: 600, cursor: disabled ? 'default' : 'pointer',
      border: 'none', WebkitTapHighlightColor: 'transparent', transition: 'all .14s ease',
      background: selected ? 'var(--accent)' : 'var(--surface)',
      color: selected ? '#fff' : disabled ? 'var(--ink-3)' : 'var(--ink-2)',
      boxShadow: 'none',
      opacity: disabled ? 0.6 : 1
    }}>
      {label}{trailing}
    </button>);

}

// ── Stat (icon + label/value inline) ──────────────────────────────
function Stat({ icon, label, value, dense }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: dense ? 5 : 7, minWidth: 0 }}>
      <span style={{ color: 'var(--ink-3)', display: 'flex' }}>{icon}</span>
      <span style={{ display: 'flex', flexDirection: dense ? 'row' : 'column', gap: dense ? 4 : 1, minWidth: 0, alignItems: dense ? 'baseline' : 'flex-start' }}>
        {!dense && <span style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</span>}
        <span style={{ fontSize: dense ? 13 : 14, color: 'var(--ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>{value}</span>
      </span>
    </div>);

}

// ── demo data ──────────────────────────────────────────────────────
const DATA = [
{ id: 'hapjeong', gu: '마포구', dong: '합정동', score: 87, type: '전세', price: '1억 8,000만원',
  capital: '3,000만원', monthly: '42만원', commute: '28분',
  avg: '1억 7,500만원', status: '적정',
  life: { subway: 2, store: 8, mart: 1, hospital: 3 }, pin: { x: 30, y: 36 } },
{ id: 'dangsan', gu: '영등포구', dong: '당산동', score: 81, type: '전세', price: '1억 6,500만원',
  capital: '2,800만원', monthly: '38만원', commute: '35분',
  avg: '1억 6,800만원', status: '저렴', statusTone: 'good',
  life: { subway: 2, store: 6, mart: 1, hospital: 2 }, pin: { x: 19, y: 57 } },
{ id: 'sangdo', gu: '동작구', dong: '상도동', score: 74, type: '월세', price: '보증금 5,000 · 월 55만원',
  capital: '2,000만원', monthly: '61만원', commute: '41분',
  avg: '월 52만원', status: '다소 높음', statusTone: 'mid',
  life: { subway: 1, store: 5, mart: 0, hospital: 2 }, pin: { x: 47, y: 66 } },
{ id: 'sillim', gu: '관악구', dong: '신림동', score: 69, type: '월세', price: '보증금 3,000 · 월 48만원',
  capital: '1,500만원', monthly: '54만원', commute: '46분',
  avg: '월 49만원', status: '적정',
  life: { subway: 1, store: 7, mart: 1, hospital: 2 }, pin: { x: 38, y: 82 } },
{ id: 'hyochang', gu: '용산구', dong: '효창동', score: 78, type: '전세', price: '1억 9,500만원',
  capital: '3,400만원', monthly: '45만원', commute: '22분',
  avg: '1억 9,000만원', status: '적정',
  life: { subway: 3, store: 9, mart: 2, hospital: 4 }, pin: { x: 54, y: 44 } }];


Object.assign(window, { TweakCtx, gradeColors, scoreFg, ScoreBadge, ScoreBar, Button, Chip, Stat, DATA, formatKRW, regionLabel });

// 만원 단위 금액 → 억/만원 표기 (1억 이상이면 자동 변환)
function formatKRW(raw) {
  const n = parseInt(String(raw == null ? '' : raw).replace(/\D/g, ''), 10);
  if (!n) return '0만원';
  const eok = Math.floor(n / 10000);
  const man = n % 10000;
  if (eok > 0) return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억`;
  return `${n.toLocaleString()}만원`;
}

// 시·도 포함 전체 지역명 (현재 데이터는 모두 서울)
const CITY = '서울특별시';
function regionLabel(item) {return `${CITY} ${item.gu} ${item.dong}`;}
