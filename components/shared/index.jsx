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
  if (item.gu && (item.gu.includes('수원') || item.gu.includes('안양') || item.gu.includes('성남') || item.gu.includes('과천') || item.gu.includes('용인'))) {
    return `경기도 ${item.gu} ${item.dong}`;
  }
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

export const CANDIDATE_REGIONS = [
  // ── 서울 ──────────────────────────────────────────────────────────
  {
    id: 'hapjeong', gu: '마포구', dong: '합정동',
    lawdCd: '11440',
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
    lawdCd: '11560',
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
    lawdCd: '11590',
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
    lawdCd: '11620',
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
    lawdCd: '11170',
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
    lawdCd: '11590',
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
    lawdCd: '11440',
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
    lawdCd: '11560',
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
    lawdCd: '11200',
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
    lawdCd: '11380',
    coords: { lat: 37.6021, lng: 126.9283 }, pin: { x: 28, y: 18 },
    options: [
      { type: '전세', depositMan: 10000 },
      { type: '월세', depositForRent: 1000, rentMan: 40 },
    ],
    maintenanceFee: 5,
    avgJeonsaMan: 10500, avgRentMan: 41,
    defaultLife: { subway: 1, store: 6, mart: 1, hospital: 4 },
  },

  // ── 경기 남부 ─────────────────────────────────────────────────────
  {
    id: 'suwon_ingye', gu: '수원시 팔달구', dong: '인계동',
    lawdCd: '41115',
    coords: { lat: 37.2636, lng: 127.0286 }, pin: { x: 55, y: 95 },
    options: [
      { type: '전세', depositMan: 8000 },
      { type: '월세', depositForRent: 500, rentMan: 35 },
    ],
    maintenanceFee: 5,
    avgJeonsaMan: 8000, avgRentMan: 35,
    defaultLife: { subway: 1, store: 8, mart: 2, hospital: 5 },
  },
  {
    id: 'suwon_youngtong', gu: '수원시 영통구', dong: '영통동',
    lawdCd: '41117',
    coords: { lat: 37.2512, lng: 127.0718 }, pin: { x: 62, y: 97 },
    options: [
      { type: '전세', depositMan: 10000 },
      { type: '월세', depositForRent: 1000, rentMan: 40 },
    ],
    maintenanceFee: 5,
    avgJeonsaMan: 10000, avgRentMan: 40,
    defaultLife: { subway: 2, store: 9, mart: 2, hospital: 5 },
  },
  {
    id: 'anyang_dongan', gu: '안양시 동안구', dong: '평촌동',
    lawdCd: '41173',
    coords: { lat: 37.3939, lng: 126.9528 }, pin: { x: 44, y: 88 },
    options: [
      { type: '전세', depositMan: 11000 },
      { type: '월세', depositForRent: 1000, rentMan: 42 },
    ],
    maintenanceFee: 5,
    avgJeonsaMan: 11000, avgRentMan: 42,
    defaultLife: { subway: 2, store: 7, mart: 2, hospital: 4 },
  },
  {
    id: 'seongnam_bundang', gu: '성남시 분당구', dong: '서현동',
    lawdCd: '41135',
    coords: { lat: 37.3836, lng: 127.1218 }, pin: { x: 74, y: 90 },
    options: [
      { type: '전세', depositMan: 15000 },
      { type: '월세', depositForRent: 2000, rentMan: 55 },
    ],
    maintenanceFee: 5,
    avgJeonsaMan: 15000, avgRentMan: 55,
    defaultLife: { subway: 2, store: 8, mart: 2, hospital: 5 },
  },
  {
    id: 'gwacheon', gu: '과천시', dong: '별양동',
    lawdCd: '41290',
    coords: { lat: 37.4290, lng: 126.9878 }, pin: { x: 50, y: 85 },
    options: [
      { type: '전세', depositMan: 13000 },
      { type: '월세', depositForRent: 1500, rentMan: 48 },
    ],
    maintenanceFee: 5,
    avgJeonsaMan: 13000, avgRentMan: 48,
    defaultLife: { subway: 1, store: 5, mart: 1, hospital: 3 },
  },

  // ── 경기 동부·북부 ────────────────────────────────────────────────
  {
    id: 'pangyo', gu: '성남시 분당구', dong: '판교동',
    lawdCd: '41135',
    coords: { lat: 37.3943, lng: 127.1111 }, pin: { x: 71, y: 88 },
    options: [
      { type: '전세', depositMan: 18000 },
      { type: '월세', depositForRent: 2500, rentMan: 65 },
    ],
    maintenanceFee: 5,
    avgJeonsaMan: 18000, avgRentMan: 65,
    defaultLife: { subway: 1, store: 7, mart: 1, hospital: 4 },
  },
  {
    id: 'yongin_giheung', gu: '용인시 기흥구', dong: '영덕동',
    lawdCd: '41463',
    coords: { lat: 37.2748, lng: 127.1151 }, pin: { x: 68, y: 93 },
    options: [
      { type: '전세', depositMan: 9000 },
      { type: '월세', depositForRent: 500, rentMan: 38 },
    ],
    maintenanceFee: 5,
    avgJeonsaMan: 9000, avgRentMan: 38,
    defaultLife: { subway: 1, store: 6, mart: 1, hospital: 3 },
  },
  {
    id: 'nowon_junggye', gu: '노원구', dong: '중계동',
    lawdCd: '11350',
    coords: { lat: 37.6363, lng: 127.0739 }, pin: { x: 70, y: 10 },
    options: [
      { type: '전세', depositMan: 10000 },
      { type: '월세', depositForRent: 500, rentMan: 40 },
    ],
    maintenanceFee: 5,
    avgJeonsaMan: 10000, avgRentMan: 40,
    defaultLife: { subway: 2, store: 8, mart: 2, hospital: 5 },
  },
  {
    id: 'nowon_sangye', gu: '노원구', dong: '상계동',
    lawdCd: '11350',
    coords: { lat: 37.6556, lng: 127.0636 }, pin: { x: 68, y: 6 },
    options: [
      { type: '전세', depositMan: 9000 },
      { type: '월세', depositForRent: 500, rentMan: 36 },
    ],
    maintenanceFee: 5,
    avgJeonsaMan: 9000, avgRentMan: 36,
    defaultLife: { subway: 2, store: 7, mart: 2, hospital: 4 },
  },
  {
    id: 'jungnang_myeongmok', gu: '중랑구', dong: '면목동',
    lawdCd: '11260',
    coords: { lat: 37.5844, lng: 127.0888 }, pin: { x: 74, y: 22 },
    options: [
      { type: '전세', depositMan: 8500 },
      { type: '월세', depositForRent: 500, rentMan: 34 },
    ],
    maintenanceFee: 5,
    avgJeonsaMan: 8500, avgRentMan: 34,
    defaultLife: { subway: 1, store: 6, mart: 1, hospital: 3 },
  },
  {
    id: 'dobong_ssangmun', gu: '도봉구', dong: '쌍문동',
    lawdCd: '11320',
    coords: { lat: 37.6486, lng: 127.0278 }, pin: { x: 58, y: 7 },
    options: [
      { type: '전세', depositMan: 9500 },
      { type: '월세', depositForRent: 500, rentMan: 37 },
    ],
    maintenanceFee: 5,
    avgJeonsaMan: 9500, avgRentMan: 37,
    defaultLife: { subway: 1, store: 6, mart: 1, hospital: 3 },
  },
];
