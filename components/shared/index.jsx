// components/shared/index.jsx

export function formatKRW(raw) {
  const n = parseInt(String(raw == null ? '' : raw).replace(/\D/g, ''), 10);
  if (!n) return '0만원';
  const eok = Math.floor(n / 10000);
  const man = n % 10000;
  if (eok > 0) return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억`;
  return `${n.toLocaleString()}만원`;
}

const CITY = '서울특별시';
export function regionLabel(item) {
  return `${CITY} ${item.gu} ${item.dong}`;
}

export function gradeColors(score) {
  if (score >= 85) return { fg: 'var(--accent)', bg: 'var(--accent-weak)' };
  if (score >= 75) return { fg: 'var(--good)', bg: 'var(--good-weak)' };
  return { fg: 'var(--mid)', bg: 'var(--mid-weak)' };
}

export function scoreFg(score, style) {
  if (style === 'plain') return 'var(--accent)';
  return gradeColors(score).fg;
}

export function ScoreBadge({ score, size = 'md' }) {
  const fg = scoreFg(score, 'graded');
  const bg = gradeColors(score).bg;
  const big = size === 'lg';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'baseline', gap: 3,
      background: bg, color: fg, borderRadius: 999,
      padding: big ? '7px 13px' : '4px 10px', fontWeight: 700,
      fontSize: big ? 20 : 15, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
    }}>
      {score}<span style={{ fontSize: big ? 12 : 11, fontWeight: 600, opacity: 0.85 }}>점</span>
    </div>
  );
}

export function ScoreBar({ score }) {
  const fg = scoreFg(score, 'graded');
  return (
    <div style={{ height: 5, borderRadius: 999, background: 'var(--line)', overflow: 'hidden' }}>
      <div style={{ width: `${score}%`, height: '100%', borderRadius: 999, background: fg }} />
    </div>
  );
}

export function Button({ children, variant = 'primary', onClick, disabled, style }) {
  const base = {
    width: '100%', border: 'none', cursor: disabled ? 'default' : 'pointer',
    borderRadius: 14, fontFamily: 'inherit', fontWeight: 700, fontSize: 17,
    height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 6, transition: 'transform .06s ease, background .15s ease',
    WebkitTapHighlightColor: 'transparent',
  };
  const variants = {
    primary: { background: disabled ? 'var(--line)' : 'var(--accent)', color: disabled ? 'var(--ink-3)' : '#fff' },
    outline: { background: 'var(--surface)', color: 'var(--accent)', boxShadow: 'inset 0 0 0 1.5px var(--accent)' },
    ghost: { background: 'transparent', color: 'var(--ink-3)', height: 44, fontSize: 15, fontWeight: 600 },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = 'scale(0.985)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}

export function Chip({ label, selected, disabled, onClick, trailing }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '11px 16px', borderRadius: 12, fontFamily: 'inherit',
        fontSize: 15, fontWeight: 600, cursor: disabled ? 'default' : 'pointer',
        border: 'none', WebkitTapHighlightColor: 'transparent', transition: 'all .14s ease',
        background: selected ? 'var(--accent)' : 'var(--surface)',
        color: selected ? '#fff' : disabled ? 'var(--ink-3)' : 'var(--ink-2)',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {label}{trailing}
    </button>
  );
}

export function Stat({ icon, label, value, dense }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: dense ? 5 : 7, minWidth: 0 }}>
      <span style={{ color: 'var(--ink-3)', display: 'flex' }}>{icon}</span>
      <span style={{ display: 'flex', flexDirection: dense ? 'row' : 'column', gap: dense ? 4 : 1, minWidth: 0, alignItems: dense ? 'baseline' : 'flex-start' }}>
        {!dense && <span style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</span>}
        <span style={{ fontSize: dense ? 13 : 14, color: 'var(--ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>{value}</span>
      </span>
    </div>
  );
}

// 후보 지역 데이터 (실거래가 API 연동 전 기준 데이터)
// coords: 카카오맵/실거래가 API 호출에 사용되는 실제 위경도
// depositMan: 전세 보증금(만원), rentMan: 월세(만원), depositForRent: 월세 보증금(만원)
// avgJeonsaMan: 원룸 기준 전세 시세 평균 (만원), avgRentMan: 월세 평균
// defaultLife: 카카오 API 없을 때 사용할 기본 생활권 데이터 (반경 1km 기준 실측치)
export const CANDIDATE_REGIONS = [
  {
    id: 'hapjeong', gu: '마포구', dong: '합정동',
    coords: { lat: 37.5497, lng: 126.9135 }, pin: { x: 30, y: 36 },
    options: [
      { type: '전세', depositMan: 18000 },
      { type: '월세', depositForRent: 3000, rentMan: 65 },
    ],
    maintenanceFee: 5,
    avgJeonsaMan: 17500, avgRentMan: 63,
    defaultLife: { subway: 3, store: 12, mart: 2, hospital: 7 },
  },
  {
    id: 'dangsan', gu: '영등포구', dong: '당산동',
    coords: { lat: 37.5337, lng: 126.9012 }, pin: { x: 19, y: 57 },
    options: [
      { type: '전세', depositMan: 16500 },
      { type: '월세', depositForRent: 2000, rentMan: 55 },
    ],
    maintenanceFee: 5,
    avgJeonsaMan: 16000, avgRentMan: 54,
    defaultLife: { subway: 2, store: 8, mart: 1, hospital: 5 },
  },
  {
    id: 'sangdo', gu: '동작구', dong: '상도동',
    coords: { lat: 37.4969, lng: 126.9497 }, pin: { x: 47, y: 66 },
    options: [
      { type: '전세', depositMan: 13000 },
      { type: '월세', depositForRent: 1500, rentMan: 52 },
    ],
    maintenanceFee: 5,
    avgJeonsaMan: 13500, avgRentMan: 53,
    defaultLife: { subway: 1, store: 7, mart: 0, hospital: 4 },
  },
  {
    id: 'sillim', gu: '관악구', dong: '신림동',
    coords: { lat: 37.4838, lng: 126.9293 }, pin: { x: 38, y: 82 },
    options: [
      { type: '전세', depositMan: 11000 },
      { type: '월세', depositForRent: 1000, rentMan: 45 },
    ],
    maintenanceFee: 5,
    avgJeonsaMan: 11500, avgRentMan: 46,
    defaultLife: { subway: 1, store: 9, mart: 1, hospital: 4 },
  },
  {
    id: 'hyochang', gu: '용산구', dong: '효창동',
    coords: { lat: 37.5407, lng: 126.9607 }, pin: { x: 54, y: 44 },
    options: [
      { type: '전세', depositMan: 19500 },
      { type: '월세', depositForRent: 3500, rentMan: 72 },
    ],
    maintenanceFee: 5,
    avgJeonsaMan: 19000, avgRentMan: 70,
    defaultLife: { subway: 2, store: 8, mart: 1, hospital: 6 },
  },
  {
    id: 'noryangjin', gu: '동작구', dong: '노량진동',
    coords: { lat: 37.5135, lng: 126.9426 }, pin: { x: 42, y: 72 },
    options: [
      { type: '전세', depositMan: 12000 },
      { type: '월세', depositForRent: 1000, rentMan: 48 },
    ],
    maintenanceFee: 5,
    avgJeonsaMan: 12500, avgRentMan: 49,
    defaultLife: { subway: 2, store: 6, mart: 0, hospital: 3 },
  },
  {
    id: 'mapo', gu: '마포구', dong: '마포동',
    coords: { lat: 37.5443, lng: 126.9517 }, pin: { x: 36, y: 42 },
    options: [
      { type: '전세', depositMan: 17000 },
      { type: '월세', depositForRent: 2500, rentMan: 60 },
    ],
    maintenanceFee: 5,
    avgJeonsaMan: 16500, avgRentMan: 59,
    defaultLife: { subway: 2, store: 9, mart: 1, hospital: 6 },
  },
  {
    id: 'yeouido', gu: '영등포구', dong: '여의도동',
    coords: { lat: 37.5219, lng: 126.9244 }, pin: { x: 22, y: 62 },
    options: [
      { type: '전세', depositMan: 24000 },
      { type: '월세', depositForRent: 4000, rentMan: 88 },
    ],
    maintenanceFee: 10,
    avgJeonsaMan: 23000, avgRentMan: 85,
    defaultLife: { subway: 3, store: 10, mart: 2, hospital: 7 },
  },
  {
    id: 'seongsu', gu: '성동구', dong: '성수동',
    coords: { lat: 37.5445, lng: 127.0559 }, pin: { x: 72, y: 38 },
    options: [
      { type: '전세', depositMan: 20000 },
      { type: '월세', depositForRent: 3000, rentMan: 78 },
    ],
    maintenanceFee: 5,
    avgJeonsaMan: 19500, avgRentMan: 76,
    defaultLife: { subway: 1, store: 10, mart: 1, hospital: 5 },
  },
  {
    id: 'eunpyeong', gu: '은평구', dong: '녹번동',
    coords: { lat: 37.6021, lng: 126.9283 }, pin: { x: 28, y: 18 },
    options: [
      { type: '전세', depositMan: 10000 },
      { type: '월세', depositForRent: 1000, rentMan: 40 },
    ],
    maintenanceFee: 5,
    avgJeonsaMan: 10500, avgRentMan: 41,
    defaultLife: { subway: 1, store: 6, mart: 1, hospital: 4 },
  },
];
