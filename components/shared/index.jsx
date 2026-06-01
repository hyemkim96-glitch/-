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
  if (item.sido) return `${item.sido} ${item.gu} ${item.dong}`;
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
  {
    id: 'gangnam_yeoksam', gu: '강남구', dong: '역삼동',
    lawdCd: '11680',
    coords: { lat: 37.5007, lng: 127.0366 }, pin: { x: 62, y: 68 },
    options: [{ type: '전세', depositMan: 35000 }, { type: '월세', depositForRent: 2000, rentMan: 130 }],
    maintenanceFee: 10, avgJeonsaMan: 35000, avgRentMan: 130,
    defaultLife: { subway: 3, store: 12, mart: 2, hospital: 8 },
  },
  {
    id: 'seocho_bangbae', gu: '서초구', dong: '방배동',
    lawdCd: '11650',
    coords: { lat: 37.4815, lng: 126.9969 }, pin: { x: 56, y: 76 },
    options: [{ type: '전세', depositMan: 28000 }, { type: '월세', depositForRent: 2000, rentMan: 100 }],
    maintenanceFee: 8, avgJeonsaMan: 28000, avgRentMan: 100,
    defaultLife: { subway: 2, store: 8, mart: 2, hospital: 6 },
  },
  {
    id: 'songpa_munjeong', gu: '송파구', dong: '문정동',
    lawdCd: '11710',
    coords: { lat: 37.4836, lng: 127.1235 }, pin: { x: 76, y: 76 },
    options: [{ type: '전세', depositMan: 22000 }, { type: '월세', depositForRent: 1000, rentMan: 80 }],
    maintenanceFee: 7, avgJeonsaMan: 22000, avgRentMan: 80,
    defaultLife: { subway: 2, store: 9, mart: 2, hospital: 5 },
  },
  {
    id: 'gangdong_cheonho', gu: '강동구', dong: '천호동',
    lawdCd: '11740',
    coords: { lat: 37.5386, lng: 127.1239 }, pin: { x: 77, y: 44 },
    options: [{ type: '전세', depositMan: 16000 }, { type: '월세', depositForRent: 1000, rentMan: 58 }],
    maintenanceFee: 6, avgJeonsaMan: 16000, avgRentMan: 58,
    defaultLife: { subway: 2, store: 8, mart: 2, hospital: 5 },
  },
  {
    id: 'gwangjin_guui', gu: '광진구', dong: '구의동',
    lawdCd: '11215',
    coords: { lat: 37.5397, lng: 127.0946 }, pin: { x: 73, y: 43 },
    options: [{ type: '전세', depositMan: 18000 }, { type: '월세', depositForRent: 1000, rentMan: 65 }],
    maintenanceFee: 6, avgJeonsaMan: 18000, avgRentMan: 65,
    defaultLife: { subway: 2, store: 8, mart: 1, hospital: 4 },
  },
  {
    id: 'dongdaemun_dapsimni', gu: '동대문구', dong: '답십리동',
    lawdCd: '11230',
    coords: { lat: 37.5636, lng: 127.0573 }, pin: { x: 70, y: 32 },
    options: [{ type: '전세', depositMan: 14000 }, { type: '월세', depositForRent: 700, rentMan: 52 }],
    maintenanceFee: 5, avgJeonsaMan: 14000, avgRentMan: 52,
    defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 },
  },
  {
    id: 'seongbuk_gireum', gu: '성북구', dong: '길음동',
    lawdCd: '11290',
    coords: { lat: 37.6046, lng: 127.0247 }, pin: { x: 57, y: 18 },
    options: [{ type: '전세', depositMan: 13000 }, { type: '월세', depositForRent: 700, rentMan: 48 }],
    maintenanceFee: 5, avgJeonsaMan: 13000, avgRentMan: 48,
    defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 },
  },
  {
    id: 'gangbuk_suyu', gu: '강북구', dong: '수유동',
    lawdCd: '11305',
    coords: { lat: 37.6368, lng: 127.0253 }, pin: { x: 57, y: 10 },
    options: [{ type: '전세', depositMan: 10000 }, { type: '월세', depositForRent: 500, rentMan: 38 }],
    maintenanceFee: 5, avgJeonsaMan: 10000, avgRentMan: 38,
    defaultLife: { subway: 1, store: 6, mart: 1, hospital: 3 },
  },
  {
    id: 'gangseo_hwagok', gu: '강서구', dong: '화곡동',
    lawdCd: '11500',
    coords: { lat: 37.5479, lng: 126.8496 }, pin: { x: 8, y: 40 },
    options: [{ type: '전세', depositMan: 13000 }, { type: '월세', depositForRent: 700, rentMan: 50 }],
    maintenanceFee: 5, avgJeonsaMan: 13000, avgRentMan: 50,
    defaultLife: { subway: 2, store: 8, mart: 2, hospital: 4 },
  },
  {
    id: 'yangcheon_mokdong', gu: '양천구', dong: '목동',
    lawdCd: '11470',
    coords: { lat: 37.5259, lng: 126.8749 }, pin: { x: 14, y: 60 },
    options: [{ type: '전세', depositMan: 20000 }, { type: '월세', depositForRent: 1000, rentMan: 72 }],
    maintenanceFee: 6, avgJeonsaMan: 20000, avgRentMan: 72,
    defaultLife: { subway: 2, store: 8, mart: 2, hospital: 5 },
  },
  {
    id: 'guro_guro', gu: '구로구', dong: '구로동',
    lawdCd: '11530',
    coords: { lat: 37.4954, lng: 126.8874 }, pin: { x: 18, y: 70 },
    options: [{ type: '전세', depositMan: 12000 }, { type: '월세', depositForRent: 700, rentMan: 46 }],
    maintenanceFee: 5, avgJeonsaMan: 12000, avgRentMan: 46,
    defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 },
  },
  {
    id: 'geumcheon_siheung', gu: '금천구', dong: '시흥동',
    lawdCd: '11545',
    coords: { lat: 37.4567, lng: 126.8954 }, pin: { x: 20, y: 80 },
    options: [{ type: '전세', depositMan: 10500 }, { type: '월세', depositForRent: 500, rentMan: 40 }],
    maintenanceFee: 5, avgJeonsaMan: 10500, avgRentMan: 40,
    defaultLife: { subway: 1, store: 6, mart: 1, hospital: 3 },
  },
  {
    id: 'seodaemun_hongeun', gu: '서대문구', dong: '홍은동',
    lawdCd: '11410',
    coords: { lat: 37.5892, lng: 126.9337 }, pin: { x: 30, y: 22 },
    options: [{ type: '전세', depositMan: 14000 }, { type: '월세', depositForRent: 700, rentMan: 52 }],
    maintenanceFee: 5, avgJeonsaMan: 14000, avgRentMan: 52,
    defaultLife: { subway: 1, store: 6, mart: 1, hospital: 4 },
  },
  {
    id: 'jongno_changsin', gu: '종로구', dong: '창신동',
    lawdCd: '11110',
    coords: { lat: 37.5794, lng: 127.0153 }, pin: { x: 54, y: 25 },
    options: [{ type: '전세', depositMan: 15000 }, { type: '월세', depositForRent: 800, rentMan: 55 }],
    maintenanceFee: 5, avgJeonsaMan: 15000, avgRentMan: 55,
    defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 },
  },
  { id: 'jung_sindang', gu: '중구', dong: '신당동', lawdCd: '11140', coords: { lat: 37.5617, lng: 127.0165 }, pin: { x: 55, y: 34 }, options: [{ type: '전세', depositMan: 16000 }, { type: '월세', depositForRent: 800, rentMan: 58 }], maintenanceFee: 5, avgJeonsaMan: 16000, avgRentMan: 58, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 5 } },

  // ── 마포구 추가 동 ────────────────────────────────────────────────
  { id: 'mapo_mangwon', gu: '마포구', dong: '망원동', lawdCd: '11440', coords: { lat: 37.5558, lng: 126.9068 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 17000 }, { type: '월세', depositForRent: 2000, rentMan: 62 }], maintenanceFee: 5, avgJeonsaMan: 17000, avgRentMan: 62, defaultLife: { subway: 2, store: 10, mart: 1, hospital: 5 } },
  { id: 'mapo_seogyo', gu: '마포구', dong: '서교동', lawdCd: '11440', coords: { lat: 37.5535, lng: 126.9233 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 19000 }, { type: '월세', depositForRent: 3000, rentMan: 70 }], maintenanceFee: 5, avgJeonsaMan: 19000, avgRentMan: 70, defaultLife: { subway: 2, store: 12, mart: 1, hospital: 6 } },
  { id: 'mapo_donggyo', gu: '마포구', dong: '동교동', lawdCd: '11440', coords: { lat: 37.5554, lng: 126.9201 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 18000 }, { type: '월세', depositForRent: 2500, rentMan: 66 }], maintenanceFee: 5, avgJeonsaMan: 18000, avgRentMan: 66, defaultLife: { subway: 2, store: 11, mart: 1, hospital: 5 } },
  { id: 'mapo_yeonnam', gu: '마포구', dong: '연남동', lawdCd: '11440', coords: { lat: 37.5617, lng: 126.9243 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 18000 }, { type: '월세', depositForRent: 2500, rentMan: 67 }], maintenanceFee: 5, avgJeonsaMan: 18000, avgRentMan: 67, defaultLife: { subway: 2, store: 12, mart: 1, hospital: 5 } },
  { id: 'mapo_sangsu', gu: '마포구', dong: '상수동', lawdCd: '11440', coords: { lat: 37.5484, lng: 126.9218 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 17500 }, { type: '월세', depositForRent: 2500, rentMan: 65 }], maintenanceFee: 5, avgJeonsaMan: 17500, avgRentMan: 65, defaultLife: { subway: 2, store: 9, mart: 1, hospital: 5 } },
  { id: 'mapo_daeheung', gu: '마포구', dong: '대흥동', lawdCd: '11440', coords: { lat: 37.5481, lng: 126.9420 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 17000 }, { type: '월세', depositForRent: 2000, rentMan: 62 }], maintenanceFee: 5, avgJeonsaMan: 17000, avgRentMan: 62, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 5 } },
  { id: 'mapo_ahyeon', gu: '마포구', dong: '아현동', lawdCd: '11440', coords: { lat: 37.5506, lng: 126.9620 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 17500 }, { type: '월세', depositForRent: 2000, rentMan: 63 }], maintenanceFee: 5, avgJeonsaMan: 17500, avgRentMan: 63, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 5 } },
  { id: 'mapo_gongdeok', gu: '마포구', dong: '공덕동', lawdCd: '11440', coords: { lat: 37.5432, lng: 126.9524 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 19000 }, { type: '월세', depositForRent: 3000, rentMan: 72 }], maintenanceFee: 5, avgJeonsaMan: 19000, avgRentMan: 72, defaultLife: { subway: 3, store: 10, mart: 2, hospital: 6 } },
  { id: 'mapo_dohwa', gu: '마포구', dong: '도화동', lawdCd: '11440', coords: { lat: 37.5396, lng: 126.9560 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 17000 }, { type: '월세', depositForRent: 2000, rentMan: 62 }], maintenanceFee: 5, avgJeonsaMan: 17000, avgRentMan: 62, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 4 } },
  { id: 'mapo_yonggang', gu: '마포구', dong: '용강동', lawdCd: '11440', coords: { lat: 37.5389, lng: 126.9508 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 16500 }, { type: '월세', depositForRent: 2000, rentMan: 60 }], maintenanceFee: 5, avgJeonsaMan: 16500, avgRentMan: 60, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'mapo_sinsu', gu: '마포구', dong: '신수동', lawdCd: '11440', coords: { lat: 37.5427, lng: 126.9411 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 16000 }, { type: '월세', depositForRent: 2000, rentMan: 60 }], maintenanceFee: 5, avgJeonsaMan: 16000, avgRentMan: 60, defaultLife: { subway: 1, store: 7, mart: 1, hospital: 4 } },
  { id: 'mapo_seongsan', gu: '마포구', dong: '성산동', lawdCd: '11440', coords: { lat: 37.5719, lng: 126.9180 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 15000 }, { type: '월세', depositForRent: 1500, rentMan: 55 }], maintenanceFee: 5, avgJeonsaMan: 15000, avgRentMan: 55, defaultLife: { subway: 1, store: 7, mart: 1, hospital: 4 } },
  { id: 'mapo_sangam', gu: '마포구', dong: '상암동', lawdCd: '11440', coords: { lat: 37.5793, lng: 126.8898 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 14000 }, { type: '월세', depositForRent: 1500, rentMan: 52 }], maintenanceFee: 5, avgJeonsaMan: 14000, avgRentMan: 52, defaultLife: { subway: 2, store: 8, mart: 2, hospital: 4 } },

  // ── 영등포구 추가 동 ──────────────────────────────────────────────
  { id: 'ydp_yeongdeungpo', gu: '영등포구', dong: '영등포동', lawdCd: '11560', coords: { lat: 37.5169, lng: 126.9060 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 14000 }, { type: '월세', depositForRent: 1000, rentMan: 52 }], maintenanceFee: 5, avgJeonsaMan: 14000, avgRentMan: 52, defaultLife: { subway: 3, store: 10, mart: 2, hospital: 6 } },
  { id: 'ydp_singil', gu: '영등포구', dong: '신길동', lawdCd: '11560', coords: { lat: 37.5044, lng: 126.9104 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 13000 }, { type: '월세', depositForRent: 800, rentMan: 48 }], maintenanceFee: 5, avgJeonsaMan: 13000, avgRentMan: 48, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'ydp_daelim', gu: '영등포구', dong: '대림동', lawdCd: '11560', coords: { lat: 37.4915, lng: 126.9005 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 11000 }, { type: '월세', depositForRent: 700, rentMan: 42 }], maintenanceFee: 5, avgJeonsaMan: 11000, avgRentMan: 42, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 4 } },
  { id: 'ydp_mullae', gu: '영등포구', dong: '문래동', lawdCd: '11560', coords: { lat: 37.5186, lng: 126.8970 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 15000 }, { type: '월세', depositForRent: 1500, rentMan: 57 }], maintenanceFee: 5, avgJeonsaMan: 15000, avgRentMan: 57, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 4 } },
  { id: 'ydp_yangpyeong', gu: '영등포구', dong: '양평동', lawdCd: '11560', coords: { lat: 37.5270, lng: 126.8957 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 14000 }, { type: '월세', depositForRent: 1000, rentMan: 52 }], maintenanceFee: 5, avgJeonsaMan: 14000, avgRentMan: 52, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'ydp_sindorim', gu: '영등포구', dong: '신도림동', lawdCd: '11560', coords: { lat: 37.5082, lng: 126.8900 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 13500 }, { type: '월세', depositForRent: 900, rentMan: 50 }], maintenanceFee: 5, avgJeonsaMan: 13500, avgRentMan: 50, defaultLife: { subway: 3, store: 9, mart: 2, hospital: 5 } },

  // ── 동작구 추가 동 ────────────────────────────────────────────────
  { id: 'dj_sadang', gu: '동작구', dong: '사당동', lawdCd: '11590', coords: { lat: 37.4764, lng: 126.9760 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 14000 }, { type: '월세', depositForRent: 1000, rentMan: 53 }], maintenanceFee: 5, avgJeonsaMan: 14000, avgRentMan: 53, defaultLife: { subway: 3, store: 10, mart: 2, hospital: 6 } },
  { id: 'dj_daebang', gu: '동작구', dong: '대방동', lawdCd: '11590', coords: { lat: 37.5109, lng: 126.9329 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 12500 }, { type: '월세', depositForRent: 800, rentMan: 48 }], maintenanceFee: 5, avgJeonsaMan: 12500, avgRentMan: 48, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'dj_sindaebang', gu: '동작구', dong: '신대방동', lawdCd: '11590', coords: { lat: 37.4986, lng: 126.9261 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 12000 }, { type: '월세', depositForRent: 800, rentMan: 46 }], maintenanceFee: 5, avgJeonsaMan: 12000, avgRentMan: 46, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'dj_heukseok', gu: '동작구', dong: '흑석동', lawdCd: '11590', coords: { lat: 37.5085, lng: 126.9629 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 15000 }, { type: '월세', depositForRent: 1200, rentMan: 56 }], maintenanceFee: 5, avgJeonsaMan: 15000, avgRentMan: 56, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'dj_dongjak', gu: '동작구', dong: '동작동', lawdCd: '11590', coords: { lat: 37.5103, lng: 126.9745 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 13500 }, { type: '월세', depositForRent: 900, rentMan: 51 }], maintenanceFee: 5, avgJeonsaMan: 13500, avgRentMan: 51, defaultLife: { subway: 2, store: 6, mart: 1, hospital: 3 } },

  // ── 관악구 추가 동 ────────────────────────────────────────────────
  { id: 'ga_bongcheon', gu: '관악구', dong: '봉천동', lawdCd: '11620', coords: { lat: 37.4763, lng: 126.9538 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 12000 }, { type: '월세', depositForRent: 800, rentMan: 46 }], maintenanceFee: 5, avgJeonsaMan: 12000, avgRentMan: 46, defaultLife: { subway: 2, store: 9, mart: 1, hospital: 5 } },
  { id: 'ga_namhyeon', gu: '관악구', dong: '남현동', lawdCd: '11620', coords: { lat: 37.4680, lng: 126.9800 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 13000 }, { type: '월세', depositForRent: 900, rentMan: 49 }], maintenanceFee: 5, avgJeonsaMan: 13000, avgRentMan: 49, defaultLife: { subway: 1, store: 6, mart: 1, hospital: 3 } },

  // ── 용산구 추가 동 ────────────────────────────────────────────────
  { id: 'ys_itaewon', gu: '용산구', dong: '이태원동', lawdCd: '11170', coords: { lat: 37.5344, lng: 126.9944 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 22000 }, { type: '월세', depositForRent: 3500, rentMan: 82 }], maintenanceFee: 6, avgJeonsaMan: 22000, avgRentMan: 82, defaultLife: { subway: 2, store: 10, mart: 1, hospital: 5 } },
  { id: 'ys_hannam', gu: '용산구', dong: '한남동', lawdCd: '11170', coords: { lat: 37.5345, lng: 127.0038 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 28000 }, { type: '월세', depositForRent: 5000, rentMan: 110 }], maintenanceFee: 8, avgJeonsaMan: 28000, avgRentMan: 110, defaultLife: { subway: 2, store: 10, mart: 1, hospital: 6 } },
  { id: 'ys_bogwang', gu: '용산구', dong: '보광동', lawdCd: '11170', coords: { lat: 37.5377, lng: 127.0023 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 20000 }, { type: '월세', depositForRent: 3000, rentMan: 76 }], maintenanceFee: 6, avgJeonsaMan: 20000, avgRentMan: 76, defaultLife: { subway: 1, store: 7, mart: 1, hospital: 4 } },
  { id: 'ys_wonhyo', gu: '용산구', dong: '원효로동', lawdCd: '11170', coords: { lat: 37.5396, lng: 126.9680 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 19500 }, { type: '월세', depositForRent: 3000, rentMan: 73 }], maintenanceFee: 5, avgJeonsaMan: 19500, avgRentMan: 73, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 5 } },
  { id: 'ys_cheongpa', gu: '용산구', dong: '청파동', lawdCd: '11170', coords: { lat: 37.5449, lng: 126.9723 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 19000 }, { type: '월세', depositForRent: 2800, rentMan: 71 }], maintenanceFee: 5, avgJeonsaMan: 19000, avgRentMan: 71, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 5 } },
  { id: 'ys_huam', gu: '용산구', dong: '후암동', lawdCd: '11170', coords: { lat: 37.5509, lng: 126.9789 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 20000 }, { type: '월세', depositForRent: 3000, rentMan: 75 }], maintenanceFee: 5, avgJeonsaMan: 20000, avgRentMan: 75, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 5 } },

  // ── 성동구 추가 동 ────────────────────────────────────────────────
  { id: 'sd_wangsimni', gu: '성동구', dong: '왕십리동', lawdCd: '11200', coords: { lat: 37.5613, lng: 127.0366 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 19000 }, { type: '월세', depositForRent: 2500, rentMan: 72 }], maintenanceFee: 5, avgJeonsaMan: 19000, avgRentMan: 72, defaultLife: { subway: 3, store: 10, mart: 2, hospital: 6 } },
  { id: 'sd_majang', gu: '성동구', dong: '마장동', lawdCd: '11200', coords: { lat: 37.5638, lng: 127.0405 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 16000 }, { type: '월세', depositForRent: 1500, rentMan: 60 }], maintenanceFee: 5, avgJeonsaMan: 16000, avgRentMan: 60, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'sd_haengdang', gu: '성동구', dong: '행당동', lawdCd: '11200', coords: { lat: 37.5530, lng: 127.0340 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 17000 }, { type: '월세', depositForRent: 2000, rentMan: 64 }], maintenanceFee: 5, avgJeonsaMan: 17000, avgRentMan: 64, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 4 } },
  { id: 'sd_geumho', gu: '성동구', dong: '금호동', lawdCd: '11200', coords: { lat: 37.5487, lng: 127.0189 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 18000 }, { type: '월세', depositForRent: 2500, rentMan: 68 }], maintenanceFee: 5, avgJeonsaMan: 18000, avgRentMan: 68, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 5 } },
  { id: 'sd_oksu', gu: '성동구', dong: '옥수동', lawdCd: '11200', coords: { lat: 37.5404, lng: 127.0177 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 20000 }, { type: '월세', depositForRent: 3000, rentMan: 76 }], maintenanceFee: 5, avgJeonsaMan: 20000, avgRentMan: 76, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 5 } },
  { id: 'sd_eungbong', gu: '성동구', dong: '응봉동', lawdCd: '11200', coords: { lat: 37.5483, lng: 127.0304 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 17500 }, { type: '월세', depositForRent: 2000, rentMan: 65 }], maintenanceFee: 5, avgJeonsaMan: 17500, avgRentMan: 65, defaultLife: { subway: 1, store: 6, mart: 1, hospital: 3 } },

  // ── 은평구 추가 동 ────────────────────────────────────────────────
  { id: 'ep_bulgwang', gu: '은평구', dong: '불광동', lawdCd: '11380', coords: { lat: 37.6103, lng: 126.9289 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 11000 }, { type: '월세', depositForRent: 700, rentMan: 42 }], maintenanceFee: 5, avgJeonsaMan: 11000, avgRentMan: 42, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'ep_galhyeon', gu: '은평구', dong: '갈현동', lawdCd: '11380', coords: { lat: 37.6196, lng: 126.9233 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 9500 }, { type: '월세', depositForRent: 600, rentMan: 38 }], maintenanceFee: 5, avgJeonsaMan: 9500, avgRentMan: 38, defaultLife: { subway: 1, store: 6, mart: 1, hospital: 3 } },
  { id: 'ep_gusan', gu: '은평구', dong: '구산동', lawdCd: '11380', coords: { lat: 37.6179, lng: 126.9101 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 9000 }, { type: '월세', depositForRent: 500, rentMan: 36 }], maintenanceFee: 5, avgJeonsaMan: 9000, avgRentMan: 36, defaultLife: { subway: 1, store: 5, mart: 1, hospital: 3 } },
  { id: 'ep_eungam', gu: '은평구', dong: '응암동', lawdCd: '11380', coords: { lat: 37.5987, lng: 126.9165 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 10000 }, { type: '월세', depositForRent: 600, rentMan: 40 }], maintenanceFee: 5, avgJeonsaMan: 10000, avgRentMan: 40, defaultLife: { subway: 2, store: 6, mart: 1, hospital: 3 } },
  { id: 'ep_yeokchon', gu: '은평구', dong: '역촌동', lawdCd: '11380', coords: { lat: 37.6024, lng: 126.9193 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 10000 }, { type: '월세', depositForRent: 600, rentMan: 40 }], maintenanceFee: 5, avgJeonsaMan: 10000, avgRentMan: 40, defaultLife: { subway: 1, store: 6, mart: 1, hospital: 3 } },
  { id: 'ep_susaek', gu: '은평구', dong: '수색동', lawdCd: '11380', coords: { lat: 37.5935, lng: 126.8953 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 10500 }, { type: '월세', depositForRent: 700, rentMan: 41 }], maintenanceFee: 5, avgJeonsaMan: 10500, avgRentMan: 41, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 3 } },
  { id: 'ep_jeungsan', gu: '은평구', dong: '증산동', lawdCd: '11380', coords: { lat: 37.5857, lng: 126.9123 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 9500 }, { type: '월세', depositForRent: 600, rentMan: 38 }], maintenanceFee: 5, avgJeonsaMan: 9500, avgRentMan: 38, defaultLife: { subway: 1, store: 6, mart: 1, hospital: 3 } },
  { id: 'ep_jingwan', gu: '은평구', dong: '진관동', lawdCd: '11380', coords: { lat: 37.6427, lng: 126.9192 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 12000 }, { type: '월세', depositForRent: 800, rentMan: 46 }], maintenanceFee: 5, avgJeonsaMan: 12000, avgRentMan: 46, defaultLife: { subway: 1, store: 5, mart: 1, hospital: 3 } },

  // ── 노원구 추가 동 ────────────────────────────────────────────────
  { id: 'nw_wolgye', gu: '노원구', dong: '월계동', lawdCd: '11350', coords: { lat: 37.6344, lng: 127.0536 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 9000 }, { type: '월세', depositForRent: 500, rentMan: 36 }], maintenanceFee: 5, avgJeonsaMan: 9000, avgRentMan: 36, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'nw_gongneung', gu: '노원구', dong: '공릉동', lawdCd: '11350', coords: { lat: 37.6270, lng: 127.0831 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 8500 }, { type: '월세', depositForRent: 500, rentMan: 34 }], maintenanceFee: 5, avgJeonsaMan: 8500, avgRentMan: 34, defaultLife: { subway: 2, store: 6, mart: 1, hospital: 3 } },
  { id: 'nw_hagye', gu: '노원구', dong: '하계동', lawdCd: '11350', coords: { lat: 37.6547, lng: 127.0763 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 9500 }, { type: '월세', depositForRent: 500, rentMan: 38 }], maintenanceFee: 5, avgJeonsaMan: 9500, avgRentMan: 38, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 3 } },

  // ── 중랑구 추가 동 ────────────────────────────────────────────────
  { id: 'jr_sangbong', gu: '중랑구', dong: '상봉동', lawdCd: '11260', coords: { lat: 37.5963, lng: 127.0837 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 9000 }, { type: '월세', depositForRent: 500, rentMan: 36 }], maintenanceFee: 5, avgJeonsaMan: 9000, avgRentMan: 36, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 3 } },
  { id: 'jr_junghwa', gu: '중랑구', dong: '중화동', lawdCd: '11260', coords: { lat: 37.6014, lng: 127.0876 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 8500 }, { type: '월세', depositForRent: 500, rentMan: 34 }], maintenanceFee: 5, avgJeonsaMan: 8500, avgRentMan: 34, defaultLife: { subway: 1, store: 6, mart: 1, hospital: 3 } },
  { id: 'jr_muk', gu: '중랑구', dong: '묵동', lawdCd: '11260', coords: { lat: 37.6068, lng: 127.0792 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 8500 }, { type: '월세', depositForRent: 500, rentMan: 34 }], maintenanceFee: 5, avgJeonsaMan: 8500, avgRentMan: 34, defaultLife: { subway: 1, store: 6, mart: 1, hospital: 3 } },
  { id: 'jr_mangu', gu: '중랑구', dong: '망우동', lawdCd: '11260', coords: { lat: 37.5924, lng: 127.0937 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 8000 }, { type: '월세', depositForRent: 500, rentMan: 32 }], maintenanceFee: 5, avgJeonsaMan: 8000, avgRentMan: 32, defaultLife: { subway: 1, store: 5, mart: 1, hospital: 3 } },
  { id: 'jr_sinnae', gu: '중랑구', dong: '신내동', lawdCd: '11260', coords: { lat: 37.6078, lng: 127.1002 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 9000 }, { type: '월세', depositForRent: 500, rentMan: 36 }], maintenanceFee: 5, avgJeonsaMan: 9000, avgRentMan: 36, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 3 } },

  // ── 도봉구 추가 동 ────────────────────────────────────────────────
  { id: 'db_dobong', gu: '도봉구', dong: '도봉동', lawdCd: '11320', coords: { lat: 37.6845, lng: 127.0444 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 8500 }, { type: '월세', depositForRent: 500, rentMan: 34 }], maintenanceFee: 5, avgJeonsaMan: 8500, avgRentMan: 34, defaultLife: { subway: 1, store: 5, mart: 1, hospital: 3 } },
  { id: 'db_banghak', gu: '도봉구', dong: '방학동', lawdCd: '11320', coords: { lat: 37.6673, lng: 127.0388 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 9000 }, { type: '월세', depositForRent: 500, rentMan: 36 }], maintenanceFee: 5, avgJeonsaMan: 9000, avgRentMan: 36, defaultLife: { subway: 1, store: 6, mart: 1, hospital: 3 } },
  { id: 'db_chang', gu: '도봉구', dong: '창동', lawdCd: '11320', coords: { lat: 37.6497, lng: 127.0471 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 10000 }, { type: '월세', depositForRent: 600, rentMan: 39 }], maintenanceFee: 5, avgJeonsaMan: 10000, avgRentMan: 39, defaultLife: { subway: 3, store: 8, mart: 2, hospital: 5 } },

  // ── 강남구 추가 동 ────────────────────────────────────────────────
  { id: 'gn_samseong', gu: '강남구', dong: '삼성동', lawdCd: '11680', coords: { lat: 37.5121, lng: 127.0592 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 40000 }, { type: '월세', depositForRent: 3000, rentMan: 145 }], maintenanceFee: 12, avgJeonsaMan: 40000, avgRentMan: 145, defaultLife: { subway: 3, store: 12, mart: 3, hospital: 8 } },
  { id: 'gn_nonhyeon', gu: '강남구', dong: '논현동', lawdCd: '11680', coords: { lat: 37.5167, lng: 127.0307 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 32000 }, { type: '월세', depositForRent: 2000, rentMan: 118 }], maintenanceFee: 10, avgJeonsaMan: 32000, avgRentMan: 118, defaultLife: { subway: 2, store: 10, mart: 2, hospital: 7 } },
  { id: 'gn_apgujeong', gu: '강남구', dong: '압구정동', lawdCd: '11680', coords: { lat: 37.5261, lng: 127.0284 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 50000 }, { type: '월세', depositForRent: 5000, rentMan: 180 }], maintenanceFee: 15, avgJeonsaMan: 50000, avgRentMan: 180, defaultLife: { subway: 2, store: 10, mart: 2, hospital: 7 } },
  { id: 'gn_cheongdam', gu: '강남구', dong: '청담동', lawdCd: '11680', coords: { lat: 37.5234, lng: 127.0471 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 45000 }, { type: '월세', depositForRent: 5000, rentMan: 165 }], maintenanceFee: 13, avgJeonsaMan: 45000, avgRentMan: 165, defaultLife: { subway: 2, store: 10, mart: 2, hospital: 7 } },
  { id: 'gn_daechi', gu: '강남구', dong: '대치동', lawdCd: '11680', coords: { lat: 37.4948, lng: 127.0625 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 40000 }, { type: '월세', depositForRent: 3000, rentMan: 145 }], maintenanceFee: 12, avgJeonsaMan: 40000, avgRentMan: 145, defaultLife: { subway: 2, store: 10, mart: 2, hospital: 7 } },
  { id: 'gn_dogok', gu: '강남구', dong: '도곡동', lawdCd: '11680', coords: { lat: 37.4879, lng: 127.0425 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 38000 }, { type: '월세', depositForRent: 2500, rentMan: 138 }], maintenanceFee: 12, avgJeonsaMan: 38000, avgRentMan: 138, defaultLife: { subway: 2, store: 9, mart: 2, hospital: 6 } },
  { id: 'gn_gaepo', gu: '강남구', dong: '개포동', lawdCd: '11680', coords: { lat: 37.4819, lng: 127.0466 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 35000 }, { type: '월세', depositForRent: 2000, rentMan: 128 }], maintenanceFee: 11, avgJeonsaMan: 35000, avgRentMan: 128, defaultLife: { subway: 2, store: 8, mart: 2, hospital: 6 } },
  { id: 'gn_irwon', gu: '강남구', dong: '일원동', lawdCd: '11680', coords: { lat: 37.4882, lng: 127.0739 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 33000 }, { type: '월세', depositForRent: 2000, rentMan: 120 }], maintenanceFee: 10, avgJeonsaMan: 33000, avgRentMan: 120, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 6 } },
  { id: 'gn_suseo', gu: '강남구', dong: '수서동', lawdCd: '11680', coords: { lat: 37.4847, lng: 127.0981 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 28000 }, { type: '월세', depositForRent: 1500, rentMan: 100 }], maintenanceFee: 10, avgJeonsaMan: 28000, avgRentMan: 100, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 5 } },

  // ── 서초구 추가 동 ────────────────────────────────────────────────
  { id: 'sc_seocho', gu: '서초구', dong: '서초동', lawdCd: '11650', coords: { lat: 37.4922, lng: 127.0135 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 35000 }, { type: '월세', depositForRent: 3000, rentMan: 128 }], maintenanceFee: 10, avgJeonsaMan: 35000, avgRentMan: 128, defaultLife: { subway: 3, store: 10, mart: 2, hospital: 7 } },
  { id: 'sc_jamwon', gu: '서초구', dong: '잠원동', lawdCd: '11650', coords: { lat: 37.5139, lng: 127.0079 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 35000 }, { type: '월세', depositForRent: 3000, rentMan: 128 }], maintenanceFee: 10, avgJeonsaMan: 35000, avgRentMan: 128, defaultLife: { subway: 2, store: 8, mart: 2, hospital: 6 } },
  { id: 'sc_banpo', gu: '서초구', dong: '반포동', lawdCd: '11650', coords: { lat: 37.5040, lng: 126.9988 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 45000 }, { type: '월세', depositForRent: 5000, rentMan: 165 }], maintenanceFee: 14, avgJeonsaMan: 45000, avgRentMan: 165, defaultLife: { subway: 3, store: 10, mart: 2, hospital: 7 } },
  { id: 'sc_yangjae', gu: '서초구', dong: '양재동', lawdCd: '11650', coords: { lat: 37.4748, lng: 127.0346 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 26000 }, { type: '월세', depositForRent: 2000, rentMan: 94 }], maintenanceFee: 8, avgJeonsaMan: 26000, avgRentMan: 94, defaultLife: { subway: 2, store: 8, mart: 2, hospital: 5 } },
  { id: 'sc_umyeon', gu: '서초구', dong: '우면동', lawdCd: '11650', coords: { lat: 37.4667, lng: 127.0226 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 22000 }, { type: '월세', depositForRent: 1500, rentMan: 80 }], maintenanceFee: 7, avgJeonsaMan: 22000, avgRentMan: 80, defaultLife: { subway: 1, store: 5, mart: 1, hospital: 3 } },

  // ── 송파구 추가 동 ────────────────────────────────────────────────
  { id: 'sp_jamsil', gu: '송파구', dong: '잠실동', lawdCd: '11710', coords: { lat: 37.5131, lng: 127.1017 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 32000 }, { type: '월세', depositForRent: 2000, rentMan: 115 }], maintenanceFee: 10, avgJeonsaMan: 32000, avgRentMan: 115, defaultLife: { subway: 3, store: 12, mart: 3, hospital: 8 } },
  { id: 'sp_garak', gu: '송파구', dong: '가락동', lawdCd: '11710', coords: { lat: 37.4952, lng: 127.1168 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 22000 }, { type: '월세', depositForRent: 1000, rentMan: 80 }], maintenanceFee: 7, avgJeonsaMan: 22000, avgRentMan: 80, defaultLife: { subway: 2, store: 9, mart: 2, hospital: 6 } },
  { id: 'sp_georye', gu: '송파구', dong: '거여동', lawdCd: '11710', coords: { lat: 37.4892, lng: 127.1405 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 16000 }, { type: '월세', depositForRent: 700, rentMan: 58 }], maintenanceFee: 5, avgJeonsaMan: 16000, avgRentMan: 58, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'sp_macheon', gu: '송파구', dong: '마천동', lawdCd: '11710', coords: { lat: 37.4967, lng: 127.1528 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 15000 }, { type: '월세', depositForRent: 700, rentMan: 55 }], maintenanceFee: 5, avgJeonsaMan: 15000, avgRentMan: 55, defaultLife: { subway: 1, store: 6, mart: 1, hospital: 3 } },
  { id: 'sp_bangi', gu: '송파구', dong: '방이동', lawdCd: '11710', coords: { lat: 37.5098, lng: 127.1214 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 23000 }, { type: '월세', depositForRent: 1200, rentMan: 84 }], maintenanceFee: 7, avgJeonsaMan: 23000, avgRentMan: 84, defaultLife: { subway: 2, store: 8, mart: 2, hospital: 5 } },
  { id: 'sp_ogeum', gu: '송파구', dong: '오금동', lawdCd: '11710', coords: { lat: 37.5021, lng: 127.1322 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 19000 }, { type: '월세', depositForRent: 800, rentMan: 69 }], maintenanceFee: 6, avgJeonsaMan: 19000, avgRentMan: 69, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'sp_jangji', gu: '송파구', dong: '장지동', lawdCd: '11710', coords: { lat: 37.4778, lng: 127.1404 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 17000 }, { type: '월세', depositForRent: 700, rentMan: 62 }], maintenanceFee: 6, avgJeonsaMan: 17000, avgRentMan: 62, defaultLife: { subway: 2, store: 7, mart: 2, hospital: 4 } },
  { id: 'sp_pungnap', gu: '송파구', dong: '풍납동', lawdCd: '11710', coords: { lat: 37.5336, lng: 127.1178 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 20000 }, { type: '월세', depositForRent: 1000, rentMan: 73 }], maintenanceFee: 6, avgJeonsaMan: 20000, avgRentMan: 73, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 5 } },
  { id: 'sp_seokchon', gu: '송파구', dong: '석촌동', lawdCd: '11710', coords: { lat: 37.5051, lng: 127.1041 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 23000 }, { type: '월세', depositForRent: 1200, rentMan: 84 }], maintenanceFee: 7, avgJeonsaMan: 23000, avgRentMan: 84, defaultLife: { subway: 2, store: 9, mart: 2, hospital: 6 } },
  { id: 'sp_sincheon', gu: '송파구', dong: '신천동', lawdCd: '11710', coords: { lat: 37.5134, lng: 127.0992 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 28000 }, { type: '월세', depositForRent: 1800, rentMan: 100 }], maintenanceFee: 8, avgJeonsaMan: 28000, avgRentMan: 100, defaultLife: { subway: 3, store: 11, mart: 3, hospital: 7 } },

  // ── 강동구 추가 동 ────────────────────────────────────────────────
  { id: 'gd_seongnae', gu: '강동구', dong: '성내동', lawdCd: '11740', coords: { lat: 37.5365, lng: 127.1293 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 17000 }, { type: '월세', depositForRent: 1000, rentMan: 62 }], maintenanceFee: 6, avgJeonsaMan: 17000, avgRentMan: 62, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 5 } },
  { id: 'gd_gil', gu: '강동구', dong: '길동', lawdCd: '11740', coords: { lat: 37.5376, lng: 127.1494 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 16000 }, { type: '월세', depositForRent: 900, rentMan: 58 }], maintenanceFee: 5, avgJeonsaMan: 16000, avgRentMan: 58, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'gd_dunchon', gu: '강동구', dong: '둔촌동', lawdCd: '11740', coords: { lat: 37.5281, lng: 127.1372 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 18000 }, { type: '월세', depositForRent: 1000, rentMan: 66 }], maintenanceFee: 6, avgJeonsaMan: 18000, avgRentMan: 66, defaultLife: { subway: 2, store: 8, mart: 2, hospital: 5 } },
  { id: 'gd_amsa', gu: '강동구', dong: '암사동', lawdCd: '11740', coords: { lat: 37.5527, lng: 127.1325 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 16500 }, { type: '월세', depositForRent: 900, rentMan: 60 }], maintenanceFee: 5, avgJeonsaMan: 16500, avgRentMan: 60, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'gd_godeok', gu: '강동구', dong: '고덕동', lawdCd: '11740', coords: { lat: 37.5554, lng: 127.1623 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 18000 }, { type: '월세', depositForRent: 1000, rentMan: 66 }], maintenanceFee: 6, avgJeonsaMan: 18000, avgRentMan: 66, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'gd_myeongil', gu: '강동구', dong: '명일동', lawdCd: '11740', coords: { lat: 37.5466, lng: 127.1550 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 17000 }, { type: '월세', depositForRent: 1000, rentMan: 62 }], maintenanceFee: 5, avgJeonsaMan: 17000, avgRentMan: 62, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },

  // ── 광진구 추가 동 ────────────────────────────────────────────────
  { id: 'gj_gwangjang', gu: '광진구', dong: '광장동', lawdCd: '11215', coords: { lat: 37.5456, lng: 127.1006 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 20000 }, { type: '월세', depositForRent: 1500, rentMan: 74 }], maintenanceFee: 6, avgJeonsaMan: 20000, avgRentMan: 74, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 5 } },
  { id: 'gj_junggok', gu: '광진구', dong: '중곡동', lawdCd: '11215', coords: { lat: 37.5583, lng: 127.0851 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 16000 }, { type: '월세', depositForRent: 900, rentMan: 59 }], maintenanceFee: 5, avgJeonsaMan: 16000, avgRentMan: 59, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'gj_neung', gu: '광진구', dong: '능동', lawdCd: '11215', coords: { lat: 37.5521, lng: 127.0779 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 17000 }, { type: '월세', depositForRent: 1000, rentMan: 63 }], maintenanceFee: 5, avgJeonsaMan: 17000, avgRentMan: 63, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 5 } },
  { id: 'gj_hwayang', gu: '광진구', dong: '화양동', lawdCd: '11215', coords: { lat: 37.5449, lng: 127.0688 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 18000 }, { type: '월세', depositForRent: 1500, rentMan: 67 }], maintenanceFee: 5, avgJeonsaMan: 18000, avgRentMan: 67, defaultLife: { subway: 2, store: 9, mart: 1, hospital: 5 } },
  { id: 'gj_jayang', gu: '광진구', dong: '자양동', lawdCd: '11215', coords: { lat: 37.5356, lng: 127.0782 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 19000 }, { type: '월세', depositForRent: 1500, rentMan: 71 }], maintenanceFee: 6, avgJeonsaMan: 19000, avgRentMan: 71, defaultLife: { subway: 3, store: 10, mart: 2, hospital: 6 } },
  { id: 'gj_gunja', gu: '광진구', dong: '군자동', lawdCd: '11215', coords: { lat: 37.5596, lng: 127.0729 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 16500 }, { type: '월세', depositForRent: 900, rentMan: 61 }], maintenanceFee: 5, avgJeonsaMan: 16500, avgRentMan: 61, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },

  // ── 동대문구 추가 동 ──────────────────────────────────────────────
  { id: 'ddm_sinseol', gu: '동대문구', dong: '신설동', lawdCd: '11230', coords: { lat: 37.5720, lng: 127.0166 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 13000 }, { type: '월세', depositForRent: 700, rentMan: 49 }], maintenanceFee: 5, avgJeonsaMan: 13000, avgRentMan: 49, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'ddm_yongdu', gu: '동대문구', dong: '용두동', lawdCd: '11230', coords: { lat: 37.5722, lng: 127.0281 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 13000 }, { type: '월세', depositForRent: 700, rentMan: 49 }], maintenanceFee: 5, avgJeonsaMan: 13000, avgRentMan: 49, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'ddm_jegi', gu: '동대문구', dong: '제기동', lawdCd: '11230', coords: { lat: 37.5851, lng: 127.0516 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 12000 }, { type: '월세', depositForRent: 600, rentMan: 46 }], maintenanceFee: 5, avgJeonsaMan: 12000, avgRentMan: 46, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'ddm_jeonong', gu: '동대문구', dong: '전농동', lawdCd: '11230', coords: { lat: 37.5771, lng: 127.0471 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 13500 }, { type: '월세', depositForRent: 700, rentMan: 50 }], maintenanceFee: 5, avgJeonsaMan: 13500, avgRentMan: 50, defaultLife: { subway: 2, store: 8, mart: 2, hospital: 5 } },
  { id: 'ddm_imun', gu: '동대문구', dong: '이문동', lawdCd: '11230', coords: { lat: 37.5959, lng: 127.0671 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 12000 }, { type: '월세', depositForRent: 600, rentMan: 46 }], maintenanceFee: 5, avgJeonsaMan: 12000, avgRentMan: 46, defaultLife: { subway: 2, store: 6, mart: 1, hospital: 3 } },
  { id: 'ddm_hwigye', gu: '동대문구', dong: '휘경동', lawdCd: '11230', coords: { lat: 37.5884, lng: 127.0589 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 13000 }, { type: '월세', depositForRent: 700, rentMan: 49 }], maintenanceFee: 5, avgJeonsaMan: 13000, avgRentMan: 49, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'ddm_hoegi', gu: '동대문구', dong: '회기동', lawdCd: '11230', coords: { lat: 37.5942, lng: 127.0537 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 12500 }, { type: '월세', depositForRent: 700, rentMan: 47 }], maintenanceFee: 5, avgJeonsaMan: 12500, avgRentMan: 47, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'ddm_cheongnyangni', gu: '동대문구', dong: '청량리동', lawdCd: '11230', coords: { lat: 37.5805, lng: 127.0448 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 13000 }, { type: '월세', depositForRent: 700, rentMan: 49 }], maintenanceFee: 5, avgJeonsaMan: 13000, avgRentMan: 49, defaultLife: { subway: 3, store: 9, mart: 2, hospital: 6 } },
  { id: 'ddm_jangan', gu: '동대문구', dong: '장안동', lawdCd: '11230', coords: { lat: 37.5780, lng: 127.0704 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 13000 }, { type: '월세', depositForRent: 700, rentMan: 49 }], maintenanceFee: 5, avgJeonsaMan: 13000, avgRentMan: 49, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },

  // ── 성북구 추가 동 ────────────────────────────────────────────────
  { id: 'sb_seongbuk', gu: '성북구', dong: '성북동', lawdCd: '11290', coords: { lat: 37.5983, lng: 127.0049 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 18000 }, { type: '월세', depositForRent: 1500, rentMan: 68 }], maintenanceFee: 5, avgJeonsaMan: 18000, avgRentMan: 68, defaultLife: { subway: 1, store: 6, mart: 1, hospital: 4 } },
  { id: 'sb_samseong', gu: '성북구', dong: '삼선동', lawdCd: '11290', coords: { lat: 37.5868, lng: 127.0158 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 13000 }, { type: '월세', depositForRent: 700, rentMan: 49 }], maintenanceFee: 5, avgJeonsaMan: 13000, avgRentMan: 49, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'sb_anam', gu: '성북구', dong: '안암동', lawdCd: '11290', coords: { lat: 37.5843, lng: 127.0246 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 13000 }, { type: '월세', depositForRent: 700, rentMan: 49 }], maintenanceFee: 5, avgJeonsaMan: 13000, avgRentMan: 49, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 4 } },
  { id: 'sb_bomun', gu: '성북구', dong: '보문동', lawdCd: '11290', coords: { lat: 37.5871, lng: 127.0178 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 13000 }, { type: '월세', depositForRent: 700, rentMan: 49 }], maintenanceFee: 5, avgJeonsaMan: 13000, avgRentMan: 49, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'sb_jeongneung', gu: '성북구', dong: '정릉동', lawdCd: '11290', coords: { lat: 37.6164, lng: 127.0123 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 11000 }, { type: '월세', depositForRent: 600, rentMan: 43 }], maintenanceFee: 5, avgJeonsaMan: 11000, avgRentMan: 43, defaultLife: { subway: 1, store: 6, mart: 1, hospital: 3 } },
  { id: 'sb_wolgok', gu: '성북구', dong: '월곡동', lawdCd: '11290', coords: { lat: 37.6113, lng: 127.0366 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 12000 }, { type: '월세', depositForRent: 700, rentMan: 46 }], maintenanceFee: 5, avgJeonsaMan: 12000, avgRentMan: 46, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 3 } },
  { id: 'sb_jangwi', gu: '성북구', dong: '장위동', lawdCd: '11290', coords: { lat: 37.6222, lng: 127.0533 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 11000 }, { type: '월세', depositForRent: 600, rentMan: 43 }], maintenanceFee: 5, avgJeonsaMan: 11000, avgRentMan: 43, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 3 } },
  { id: 'sb_seokgwan', gu: '성북구', dong: '석관동', lawdCd: '11290', coords: { lat: 37.6113, lng: 127.0644 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 11500 }, { type: '월세', depositForRent: 600, rentMan: 44 }], maintenanceFee: 5, avgJeonsaMan: 11500, avgRentMan: 44, defaultLife: { subway: 2, store: 6, mart: 1, hospital: 3 } },
  { id: 'sb_jongam', gu: '성북구', dong: '종암동', lawdCd: '11290', coords: { lat: 37.6037, lng: 127.0340 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 12500 }, { type: '월세', depositForRent: 700, rentMan: 47 }], maintenanceFee: 5, avgJeonsaMan: 12500, avgRentMan: 47, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'sb_donam', gu: '성북구', dong: '돈암동', lawdCd: '11290', coords: { lat: 37.5905, lng: 127.0175 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 14000 }, { type: '월세', depositForRent: 800, rentMan: 52 }], maintenanceFee: 5, avgJeonsaMan: 14000, avgRentMan: 52, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 5 } },

  // ── 강북구 추가 동 ────────────────────────────────────────────────
  { id: 'gb_mia', gu: '강북구', dong: '미아동', lawdCd: '11305', coords: { lat: 37.6296, lng: 127.0304 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 9500 }, { type: '월세', depositForRent: 500, rentMan: 37 }], maintenanceFee: 5, avgJeonsaMan: 9500, avgRentMan: 37, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 3 } },
  { id: 'gb_beon', gu: '강북구', dong: '번동', lawdCd: '11305', coords: { lat: 37.6457, lng: 127.0376 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 9000 }, { type: '월세', depositForRent: 500, rentMan: 36 }], maintenanceFee: 5, avgJeonsaMan: 9000, avgRentMan: 36, defaultLife: { subway: 2, store: 6, mart: 1, hospital: 3 } },
  { id: 'gb_ui', gu: '강북구', dong: '우이동', lawdCd: '11305', coords: { lat: 37.6599, lng: 127.0209 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 8500 }, { type: '월세', depositForRent: 500, rentMan: 34 }], maintenanceFee: 5, avgJeonsaMan: 8500, avgRentMan: 34, defaultLife: { subway: 1, store: 5, mart: 1, hospital: 2 } },

  // ── 강서구 추가 동 ────────────────────────────────────────────────
  { id: 'gs_banghwa', gu: '강서구', dong: '방화동', lawdCd: '11500', coords: { lat: 37.5702, lng: 126.8069 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 11000 }, { type: '월세', depositForRent: 600, rentMan: 42 }], maintenanceFee: 5, avgJeonsaMan: 11000, avgRentMan: 42, defaultLife: { subway: 2, store: 6, mart: 1, hospital: 3 } },
  { id: 'gs_magok', gu: '강서구', dong: '마곡동', lawdCd: '11500', coords: { lat: 37.5580, lng: 126.8348 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 16000 }, { type: '월세', depositForRent: 1200, rentMan: 60 }], maintenanceFee: 6, avgJeonsaMan: 16000, avgRentMan: 60, defaultLife: { subway: 2, store: 8, mart: 2, hospital: 5 } },
  { id: 'gs_gayang', gu: '강서구', dong: '가양동', lawdCd: '11500', coords: { lat: 37.5617, lng: 126.8620 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 14000 }, { type: '월세', depositForRent: 900, rentMan: 53 }], maintenanceFee: 5, avgJeonsaMan: 14000, avgRentMan: 53, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 4 } },
  { id: 'gs_deungchon', gu: '강서구', dong: '등촌동', lawdCd: '11500', coords: { lat: 37.5565, lng: 126.8681 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 14500 }, { type: '월세', depositForRent: 900, rentMan: 55 }], maintenanceFee: 5, avgJeonsaMan: 14500, avgRentMan: 55, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 4 } },
  { id: 'gs_yeomchang', gu: '강서구', dong: '염창동', lawdCd: '11500', coords: { lat: 37.5461, lng: 126.8726 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 14000 }, { type: '월세', depositForRent: 900, rentMan: 53 }], maintenanceFee: 5, avgJeonsaMan: 14000, avgRentMan: 53, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'gs_balsan', gu: '강서구', dong: '발산동', lawdCd: '11500', coords: { lat: 37.5576, lng: 126.8450 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 14000 }, { type: '월세', depositForRent: 800, rentMan: 53 }], maintenanceFee: 5, avgJeonsaMan: 14000, avgRentMan: 53, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'gs_naebalsanbeol', gu: '강서구', dong: '내발산동', lawdCd: '11500', coords: { lat: 37.5590, lng: 126.8423 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 13000 }, { type: '월세', depositForRent: 700, rentMan: 50 }], maintenanceFee: 5, avgJeonsaMan: 13000, avgRentMan: 50, defaultLife: { subway: 1, store: 6, mart: 1, hospital: 3 } },

  // ── 양천구 추가 동 ────────────────────────────────────────────────
  { id: 'yc_sinjeong', gu: '양천구', dong: '신정동', lawdCd: '11470', coords: { lat: 37.5197, lng: 126.8679 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 16000 }, { type: '월세', depositForRent: 900, rentMan: 59 }], maintenanceFee: 5, avgJeonsaMan: 16000, avgRentMan: 59, defaultLife: { subway: 2, store: 8, mart: 2, hospital: 5 } },
  { id: 'yc_sinwol', gu: '양천구', dong: '신월동', lawdCd: '11470', coords: { lat: 37.5238, lng: 126.8559 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 13000 }, { type: '월세', depositForRent: 700, rentMan: 49 }], maintenanceFee: 5, avgJeonsaMan: 13000, avgRentMan: 49, defaultLife: { subway: 1, store: 7, mart: 1, hospital: 4 } },

  // ── 구로구 추가 동 ────────────────────────────────────────────────
  { id: 'kr_gocheok', gu: '구로구', dong: '고척동', lawdCd: '11530', coords: { lat: 37.4960, lng: 126.8590 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 11000 }, { type: '월세', depositForRent: 600, rentMan: 43 }], maintenanceFee: 5, avgJeonsaMan: 11000, avgRentMan: 43, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 3 } },
  { id: 'kr_gaebong', gu: '구로구', dong: '개봉동', lawdCd: '11530', coords: { lat: 37.4883, lng: 126.8638 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 10500 }, { type: '월세', depositForRent: 600, rentMan: 41 }], maintenanceFee: 5, avgJeonsaMan: 10500, avgRentMan: 41, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 3 } },
  { id: 'kr_oryu', gu: '구로구', dong: '오류동', lawdCd: '11530', coords: { lat: 37.4940, lng: 126.8476 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 10000 }, { type: '월세', depositForRent: 500, rentMan: 39 }], maintenanceFee: 5, avgJeonsaMan: 10000, avgRentMan: 39, defaultLife: { subway: 2, store: 6, mart: 1, hospital: 3 } },
  { id: 'kr_cheonwang', gu: '구로구', dong: '천왕동', lawdCd: '11530', coords: { lat: 37.4865, lng: 126.8461 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 11000 }, { type: '월세', depositForRent: 600, rentMan: 43 }], maintenanceFee: 5, avgJeonsaMan: 11000, avgRentMan: 43, defaultLife: { subway: 1, store: 6, mart: 1, hospital: 3 } },
  { id: 'kr_garibong', gu: '구로구', dong: '가리봉동', lawdCd: '11530', coords: { lat: 37.4825, lng: 126.8825 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 9500 }, { type: '월세', depositForRent: 500, rentMan: 37 }], maintenanceFee: 5, avgJeonsaMan: 9500, avgRentMan: 37, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 3 } },

  // ── 금천구 추가 동 ────────────────────────────────────────────────
  { id: 'gc_gasan', gu: '금천구', dong: '가산동', lawdCd: '11545', coords: { lat: 37.4793, lng: 126.8832 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 12000 }, { type: '월세', depositForRent: 700, rentMan: 46 }], maintenanceFee: 5, avgJeonsaMan: 12000, avgRentMan: 46, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 3 } },
  { id: 'gc_doksan', gu: '금천구', dong: '독산동', lawdCd: '11545', coords: { lat: 37.4680, lng: 126.9029 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 10000 }, { type: '월세', depositForRent: 500, rentMan: 39 }], maintenanceFee: 5, avgJeonsaMan: 10000, avgRentMan: 39, defaultLife: { subway: 2, store: 6, mart: 1, hospital: 3 } },

  // ── 서대문구 추가 동 ──────────────────────────────────────────────
  { id: 'sdm_hongjae', gu: '서대문구', dong: '홍제동', lawdCd: '11410', coords: { lat: 37.5818, lng: 126.9452 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 14000 }, { type: '월세', depositForRent: 800, rentMan: 52 }], maintenanceFee: 5, avgJeonsaMan: 14000, avgRentMan: 52, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'sdm_namgajwa', gu: '서대문구', dong: '남가좌동', lawdCd: '11410', coords: { lat: 37.5718, lng: 126.9285 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 14500 }, { type: '월세', depositForRent: 800, rentMan: 54 }], maintenanceFee: 5, avgJeonsaMan: 14500, avgRentMan: 54, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'sdm_bukgajwa', gu: '서대문구', dong: '북가좌동', lawdCd: '11410', coords: { lat: 37.5737, lng: 126.9219 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 14000 }, { type: '월세', depositForRent: 800, rentMan: 52 }], maintenanceFee: 5, avgJeonsaMan: 14000, avgRentMan: 52, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'sdm_yeonhui', gu: '서대문구', dong: '연희동', lawdCd: '11410', coords: { lat: 37.5664, lng: 126.9378 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 17000 }, { type: '월세', depositForRent: 1500, rentMan: 63 }], maintenanceFee: 5, avgJeonsaMan: 17000, avgRentMan: 63, defaultLife: { subway: 1, store: 7, mart: 1, hospital: 4 } },
  { id: 'sdm_sinchon', gu: '서대문구', dong: '신촌동', lawdCd: '11410', coords: { lat: 37.5556, lng: 126.9357 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 16000 }, { type: '월세', depositForRent: 1200, rentMan: 60 }], maintenanceFee: 5, avgJeonsaMan: 16000, avgRentMan: 60, defaultLife: { subway: 3, store: 12, mart: 2, hospital: 6 } },
  { id: 'sdm_changcheon', gu: '서대문구', dong: '창천동', lawdCd: '11410', coords: { lat: 37.5583, lng: 126.9329 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 16000 }, { type: '월세', depositForRent: 1200, rentMan: 60 }], maintenanceFee: 5, avgJeonsaMan: 16000, avgRentMan: 60, defaultLife: { subway: 2, store: 10, mart: 1, hospital: 5 } },
  { id: 'sdm_bukahhyeon', gu: '서대문구', dong: '북아현동', lawdCd: '11410', coords: { lat: 37.5540, lng: 126.9571 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 15000 }, { type: '월세', depositForRent: 1000, rentMan: 56 }], maintenanceFee: 5, avgJeonsaMan: 15000, avgRentMan: 56, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 5 } },

  // ── 종로구 추가 동 ────────────────────────────────────────────────
  { id: 'jr2_sajik', gu: '종로구', dong: '사직동', lawdCd: '11110', coords: { lat: 37.5755, lng: 126.9739 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 18000 }, { type: '월세', depositForRent: 1500, rentMan: 67 }], maintenanceFee: 5, avgJeonsaMan: 18000, avgRentMan: 67, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 5 } },
  { id: 'jr2_samcheong', gu: '종로구', dong: '삼청동', lawdCd: '11110', coords: { lat: 37.5863, lng: 126.9804 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 19000 }, { type: '월세', depositForRent: 2000, rentMan: 71 }], maintenanceFee: 5, avgJeonsaMan: 19000, avgRentMan: 71, defaultLife: { subway: 1, store: 7, mart: 1, hospital: 4 } },
  { id: 'jr2_buam', gu: '종로구', dong: '부암동', lawdCd: '11110', coords: { lat: 37.6002, lng: 126.9618 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 16000 }, { type: '월세', depositForRent: 1200, rentMan: 60 }], maintenanceFee: 5, avgJeonsaMan: 16000, avgRentMan: 60, defaultLife: { subway: 1, store: 5, mart: 1, hospital: 3 } },
  { id: 'jr2_pyeongchang', gu: '종로구', dong: '평창동', lawdCd: '11110', coords: { lat: 37.6111, lng: 126.9608 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 22000 }, { type: '월세', depositForRent: 2500, rentMan: 82 }], maintenanceFee: 7, avgJeonsaMan: 22000, avgRentMan: 82, defaultLife: { subway: 1, store: 5, mart: 1, hospital: 3 } },
  { id: 'jr2_muak', gu: '종로구', dong: '무악동', lawdCd: '11110', coords: { lat: 37.5724, lng: 126.9558 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 15000 }, { type: '월세', depositForRent: 1000, rentMan: 56 }], maintenanceFee: 5, avgJeonsaMan: 15000, avgRentMan: 56, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'jr2_gyonam', gu: '종로구', dong: '교남동', lawdCd: '11110', coords: { lat: 37.5775, lng: 126.9643 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 16000 }, { type: '월세', depositForRent: 1200, rentMan: 60 }], maintenanceFee: 5, avgJeonsaMan: 16000, avgRentMan: 60, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 5 } },
  { id: 'jr2_gahoe', gu: '종로구', dong: '가회동', lawdCd: '11110', coords: { lat: 37.5820, lng: 126.9845 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 18000 }, { type: '월세', depositForRent: 1500, rentMan: 68 }], maintenanceFee: 5, avgJeonsaMan: 18000, avgRentMan: 68, defaultLife: { subway: 1, store: 6, mart: 1, hospital: 4 } },
  { id: 'jr2_ihwa', gu: '종로구', dong: '이화동', lawdCd: '11110', coords: { lat: 37.5795, lng: 127.0006 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 14000 }, { type: '월세', depositForRent: 900, rentMan: 52 }], maintenanceFee: 5, avgJeonsaMan: 14000, avgRentMan: 52, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'jr2_hyehwa', gu: '종로구', dong: '혜화동', lawdCd: '11110', coords: { lat: 37.5831, lng: 127.0010 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 15000 }, { type: '월세', depositForRent: 1000, rentMan: 56 }], maintenanceFee: 5, avgJeonsaMan: 15000, avgRentMan: 56, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 5 } },
  { id: 'jr2_myeongnyun', gu: '종로구', dong: '명륜동', lawdCd: '11110', coords: { lat: 37.5802, lng: 127.0023 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 14500 }, { type: '월세', depositForRent: 900, rentMan: 54 }], maintenanceFee: 5, avgJeonsaMan: 14500, avgRentMan: 54, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 5 } },
  { id: 'jr2_sungin', gu: '종로구', dong: '숭인동', lawdCd: '11110', coords: { lat: 37.5764, lng: 127.0146 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 13500 }, { type: '월세', depositForRent: 800, rentMan: 51 }], maintenanceFee: 5, avgJeonsaMan: 13500, avgRentMan: 51, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },

  // ── 중구 추가 동 ──────────────────────────────────────────────────
  { id: 'jg_sogong', gu: '중구', dong: '소공동', lawdCd: '11140', coords: { lat: 37.5636, lng: 126.9820 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 20000 }, { type: '월세', depositForRent: 2000, rentMan: 75 }], maintenanceFee: 7, avgJeonsaMan: 20000, avgRentMan: 75, defaultLife: { subway: 3, store: 10, mart: 2, hospital: 6 } },
  { id: 'jg_hoehyeon', gu: '중구', dong: '회현동', lawdCd: '11140', coords: { lat: 37.5575, lng: 126.9804 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 18000 }, { type: '월세', depositForRent: 1500, rentMan: 67 }], maintenanceFee: 6, avgJeonsaMan: 18000, avgRentMan: 67, defaultLife: { subway: 2, store: 9, mart: 2, hospital: 6 } },
  { id: 'jg_myeongdong', gu: '중구', dong: '명동', lawdCd: '11140', coords: { lat: 37.5632, lng: 126.9849 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 22000 }, { type: '월세', depositForRent: 2500, rentMan: 82 }], maintenanceFee: 8, avgJeonsaMan: 22000, avgRentMan: 82, defaultLife: { subway: 3, store: 12, mart: 2, hospital: 7 } },
  { id: 'jg_pildong', gu: '중구', dong: '필동', lawdCd: '11140', coords: { lat: 37.5596, lng: 126.9997 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 16000 }, { type: '월세', depositForRent: 1000, rentMan: 59 }], maintenanceFee: 5, avgJeonsaMan: 16000, avgRentMan: 59, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 5 } },
  { id: 'jg_jangchung', gu: '중구', dong: '장충동', lawdCd: '11140', coords: { lat: 37.5612, lng: 127.0093 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 17000 }, { type: '월세', depositForRent: 1200, rentMan: 63 }], maintenanceFee: 5, avgJeonsaMan: 17000, avgRentMan: 63, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 5 } },
  { id: 'jg_gwanghui', gu: '중구', dong: '광희동', lawdCd: '11140', coords: { lat: 37.5654, lng: 127.0023 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 15000 }, { type: '월세', depositForRent: 900, rentMan: 56 }], maintenanceFee: 5, avgJeonsaMan: 15000, avgRentMan: 56, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 5 } },
  { id: 'jg_euljiro', gu: '중구', dong: '을지로동', lawdCd: '11140', coords: { lat: 37.5679, lng: 126.9930 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 17000 }, { type: '월세', depositForRent: 1200, rentMan: 63 }], maintenanceFee: 6, avgJeonsaMan: 17000, avgRentMan: 63, defaultLife: { subway: 3, store: 10, mart: 2, hospital: 6 } },

  // ── 용인시 처인구 (에버랜드 인근) ────────────────────────────────
  { id: 'yi_pogok', sido: '경기도', gu: '용인시 처인구', dong: '포곡읍', lawdCd: '41461', coords: { lat: 37.296, lng: 127.194 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 9000 }, { type: '월세', depositForRent: 500, rentMan: 35 }], maintenanceFee: 5, avgJeonsaMan: 9000, avgRentMan: 35, defaultLife: { subway: 0, store: 5, mart: 1, hospital: 2 } },
  { id: 'yi_gimryangjang', sido: '경기도', gu: '용인시 처인구', dong: '김량장동', lawdCd: '41461', coords: { lat: 37.237, lng: 127.200 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 8000 }, { type: '월세', depositForRent: 500, rentMan: 30 }], maintenanceFee: 5, avgJeonsaMan: 8000, avgRentMan: 30, defaultLife: { subway: 0, store: 6, mart: 1, hospital: 3 } },
  { id: 'yi_yeokbuk', sido: '경기도', gu: '용인시 처인구', dong: '역북동', lawdCd: '41461', coords: { lat: 37.243, lng: 127.201 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 8500 }, { type: '월세', depositForRent: 500, rentMan: 33 }], maintenanceFee: 5, avgJeonsaMan: 8500, avgRentMan: 33, defaultLife: { subway: 0, store: 6, mart: 1, hospital: 3 } },
  { id: 'yi_samga', sido: '경기도', gu: '용인시 처인구', dong: '삼가동', lawdCd: '41461', coords: { lat: 37.227, lng: 127.188 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 7500 }, { type: '월세', depositForRent: 500, rentMan: 28 }], maintenanceFee: 5, avgJeonsaMan: 7500, avgRentMan: 28, defaultLife: { subway: 0, store: 5, mart: 1, hospital: 2 } },
  { id: 'yi_yubang', sido: '경기도', gu: '용인시 처인구', dong: '유방동', lawdCd: '41461', coords: { lat: 37.251, lng: 127.203 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 8500 }, { type: '월세', depositForRent: 500, rentMan: 33 }], maintenanceFee: 5, avgJeonsaMan: 8500, avgRentMan: 33, defaultLife: { subway: 0, store: 6, mart: 1, hospital: 3 } },
  { id: 'yi_mabyeong', sido: '경기도', gu: '용인시 처인구', dong: '마평동', lawdCd: '41461', coords: { lat: 37.253, lng: 127.188 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 8000 }, { type: '월세', depositForRent: 500, rentMan: 30 }], maintenanceFee: 5, avgJeonsaMan: 8000, avgRentMan: 30, defaultLife: { subway: 0, store: 5, mart: 1, hospital: 2 } },

  // ── 용인시 기흥구 추가 ─────────────────────────────────────────────
  { id: 'yk_singal', sido: '경기도', gu: '용인시 기흥구', dong: '신갈동', lawdCd: '41463', coords: { lat: 37.279, lng: 127.105 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 11000 }, { type: '월세', depositForRent: 700, rentMan: 40 }], maintenanceFee: 5, avgJeonsaMan: 11000, avgRentMan: 40, defaultLife: { subway: 1, store: 7, mart: 1, hospital: 3 } },
  { id: 'yk_bora', sido: '경기도', gu: '용인시 기흥구', dong: '보라동', lawdCd: '41463', coords: { lat: 37.295, lng: 127.107 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 12000 }, { type: '월세', depositForRent: 800, rentMan: 43 }], maintenanceFee: 5, avgJeonsaMan: 12000, avgRentMan: 43, defaultLife: { subway: 1, store: 7, mart: 1, hospital: 3 } },
  { id: 'yk_sangkal', sido: '경기도', gu: '용인시 기흥구', dong: '상갈동', lawdCd: '41463', coords: { lat: 37.297, lng: 127.129 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 11500 }, { type: '월세', depositForRent: 700, rentMan: 42 }], maintenanceFee: 5, avgJeonsaMan: 11500, avgRentMan: 42, defaultLife: { subway: 1, store: 6, mart: 1, hospital: 3 } },
  { id: 'yk_dongbaek', sido: '경기도', gu: '용인시 기흥구', dong: '동백동', lawdCd: '41463', coords: { lat: 37.247, lng: 127.137 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 13000 }, { type: '월세', depositForRent: 900, rentMan: 48 }], maintenanceFee: 5, avgJeonsaMan: 13000, avgRentMan: 48, defaultLife: { subway: 1, store: 8, mart: 2, hospital: 4 } },
  { id: 'yk_mabuk', sido: '경기도', gu: '용인시 기흥구', dong: '마북동', lawdCd: '41463', coords: { lat: 37.325, lng: 127.108 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 12000 }, { type: '월세', depositForRent: 800, rentMan: 44 }], maintenanceFee: 5, avgJeonsaMan: 12000, avgRentMan: 44, defaultLife: { subway: 1, store: 6, mart: 1, hospital: 3 } },

  // ── 용인시 수지구 ──────────────────────────────────────────────────
  { id: 'ys_jukjeon', sido: '경기도', gu: '용인시 수지구', dong: '죽전동', lawdCd: '41465', coords: { lat: 37.333, lng: 127.109 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 18000 }, { type: '월세', depositForRent: 1500, rentMan: 62 }], maintenanceFee: 5, avgJeonsaMan: 18000, avgRentMan: 62, defaultLife: { subway: 2, store: 8, mart: 2, hospital: 4 } },
  { id: 'ys_pungdeokcheon', sido: '경기도', gu: '용인시 수지구', dong: '풍덕천동', lawdCd: '41465', coords: { lat: 37.345, lng: 127.093 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 17000 }, { type: '월세', depositForRent: 1300, rentMan: 58 }], maintenanceFee: 5, avgJeonsaMan: 17000, avgRentMan: 58, defaultLife: { subway: 2, store: 8, mart: 2, hospital: 4 } },
  { id: 'ys_dongcheon', sido: '경기도', gu: '용인시 수지구', dong: '동천동', lawdCd: '41465', coords: { lat: 37.363, lng: 127.097 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 20000 }, { type: '월세', depositForRent: 2000, rentMan: 70 }], maintenanceFee: 5, avgJeonsaMan: 20000, avgRentMan: 70, defaultLife: { subway: 2, store: 8, mart: 2, hospital: 4 } },
  { id: 'ys_sanghyeon', sido: '경기도', gu: '용인시 수지구', dong: '상현동', lawdCd: '41465', coords: { lat: 37.362, lng: 127.059 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 18000 }, { type: '월세', depositForRent: 1500, rentMan: 63 }], maintenanceFee: 5, avgJeonsaMan: 18000, avgRentMan: 63, defaultLife: { subway: 2, store: 8, mart: 2, hospital: 4 } },
  { id: 'ys_seongbok', sido: '경기도', gu: '용인시 수지구', dong: '성복동', lawdCd: '41465', coords: { lat: 37.357, lng: 127.069 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 19000 }, { type: '월세', depositForRent: 1800, rentMan: 66 }], maintenanceFee: 5, avgJeonsaMan: 19000, avgRentMan: 66, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },

  // ── 고양시 덕양구 ──────────────────────────────────────────────────
  { id: 'gy_hwajung', sido: '경기도', gu: '고양시 덕양구', dong: '화정동', lawdCd: '41281', coords: { lat: 37.631, lng: 126.832 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 16000 }, { type: '월세', depositForRent: 1000, rentMan: 55 }], maintenanceFee: 5, avgJeonsaMan: 16000, avgRentMan: 55, defaultLife: { subway: 2, store: 9, mart: 2, hospital: 5 } },
  { id: 'gy_haengsin', sido: '경기도', gu: '고양시 덕양구', dong: '행신동', lawdCd: '41281', coords: { lat: 37.614, lng: 126.834 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 15000 }, { type: '월세', depositForRent: 900, rentMan: 52 }], maintenanceFee: 5, avgJeonsaMan: 15000, avgRentMan: 52, defaultLife: { subway: 2, store: 8, mart: 2, hospital: 5 } },
  { id: 'gy_neunggok', sido: '경기도', gu: '고양시 덕양구', dong: '능곡동', lawdCd: '41281', coords: { lat: 37.637, lng: 126.830 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 13000 }, { type: '월세', depositForRent: 800, rentMan: 47 }], maintenanceFee: 5, avgJeonsaMan: 13000, avgRentMan: 47, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'gy_wondang', sido: '경기도', gu: '고양시 덕양구', dong: '원당동', lawdCd: '41281', coords: { lat: 37.661, lng: 126.843 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 13000 }, { type: '월세', depositForRent: 700, rentMan: 46 }], maintenanceFee: 5, avgJeonsaMan: 13000, avgRentMan: 46, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'gy_jukgyo', sido: '경기도', gu: '고양시 덕양구', dong: '주교동', lawdCd: '41281', coords: { lat: 37.655, lng: 126.869 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 14000 }, { type: '월세', depositForRent: 800, rentMan: 50 }], maintenanceFee: 5, avgJeonsaMan: 14000, avgRentMan: 50, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 4 } },

  // ── 고양시 일산동구 ────────────────────────────────────────────────
  { id: 'gid_madu', sido: '경기도', gu: '고양시 일산동구', dong: '마두동', lawdCd: '41285', coords: { lat: 37.660, lng: 126.765 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 17000 }, { type: '월세', depositForRent: 1200, rentMan: 58 }], maintenanceFee: 5, avgJeonsaMan: 17000, avgRentMan: 58, defaultLife: { subway: 2, store: 9, mart: 2, hospital: 5 } },
  { id: 'gid_jangheang', sido: '경기도', gu: '고양시 일산동구', dong: '장항동', lawdCd: '41285', coords: { lat: 37.669, lng: 126.778 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 16000 }, { type: '월세', depositForRent: 1000, rentMan: 55 }], maintenanceFee: 5, avgJeonsaMan: 16000, avgRentMan: 55, defaultLife: { subway: 2, store: 9, mart: 2, hospital: 5 } },
  { id: 'gid_jungsan', sido: '경기도', gu: '고양시 일산동구', dong: '중산동', lawdCd: '41285', coords: { lat: 37.694, lng: 126.793 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 15000 }, { type: '월세', depositForRent: 900, rentMan: 52 }], maintenanceFee: 5, avgJeonsaMan: 15000, avgRentMan: 52, defaultLife: { subway: 1, store: 7, mart: 2, hospital: 4 } },
  { id: 'gid_siksa', sido: '경기도', gu: '고양시 일산동구', dong: '식사동', lawdCd: '41285', coords: { lat: 37.681, lng: 126.795 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 14000 }, { type: '월세', depositForRent: 800, rentMan: 49 }], maintenanceFee: 5, avgJeonsaMan: 14000, avgRentMan: 49, defaultLife: { subway: 1, store: 7, mart: 1, hospital: 3 } },
  { id: 'gid_pungdong', sido: '경기도', gu: '고양시 일산동구', dong: '풍동', lawdCd: '41285', coords: { lat: 37.681, lng: 126.742 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 15000 }, { type: '월세', depositForRent: 900, rentMan: 52 }], maintenanceFee: 5, avgJeonsaMan: 15000, avgRentMan: 52, defaultLife: { subway: 1, store: 7, mart: 1, hospital: 3 } },

  // ── 고양시 일산서구 ────────────────────────────────────────────────
  { id: 'giw_ilsan', sido: '경기도', gu: '고양시 일산서구', dong: '일산동', lawdCd: '41287', coords: { lat: 37.675, lng: 126.757 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 16000 }, { type: '월세', depositForRent: 1000, rentMan: 55 }], maintenanceFee: 5, avgJeonsaMan: 16000, avgRentMan: 55, defaultLife: { subway: 2, store: 9, mart: 2, hospital: 5 } },
  { id: 'giw_juyeop', sido: '경기도', gu: '고양시 일산서구', dong: '주엽동', lawdCd: '41287', coords: { lat: 37.669, lng: 126.754 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 17000 }, { type: '월세', depositForRent: 1100, rentMan: 58 }], maintenanceFee: 5, avgJeonsaMan: 17000, avgRentMan: 58, defaultLife: { subway: 2, store: 9, mart: 2, hospital: 5 } },
  { id: 'giw_daehwa', sido: '경기도', gu: '고양시 일산서구', dong: '대화동', lawdCd: '41287', coords: { lat: 37.680, lng: 126.724 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 15000 }, { type: '월세', depositForRent: 900, rentMan: 52 }], maintenanceFee: 5, avgJeonsaMan: 15000, avgRentMan: 52, defaultLife: { subway: 2, store: 8, mart: 2, hospital: 4 } },
  { id: 'giw_tanhyeon', sido: '경기도', gu: '고양시 일산서구', dong: '탄현동', lawdCd: '41287', coords: { lat: 37.696, lng: 126.741 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 14000 }, { type: '월세', depositForRent: 800, rentMan: 49 }], maintenanceFee: 5, avgJeonsaMan: 14000, avgRentMan: 49, defaultLife: { subway: 1, store: 7, mart: 1, hospital: 3 } },

  // ── 부천시 ────────────────────────────────────────────────────────
  { id: 'bc_jungdong', sido: '경기도', gu: '부천시', dong: '중동', lawdCd: '41190', coords: { lat: 37.502, lng: 126.766 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 16000 }, { type: '월세', depositForRent: 1000, rentMan: 55 }], maintenanceFee: 5, avgJeonsaMan: 16000, avgRentMan: 55, defaultLife: { subway: 2, store: 9, mart: 2, hospital: 5 } },
  { id: 'bc_sangdong', sido: '경기도', gu: '부천시', dong: '상동', lawdCd: '41190', coords: { lat: 37.493, lng: 126.781 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 15000 }, { type: '월세', depositForRent: 900, rentMan: 52 }], maintenanceFee: 5, avgJeonsaMan: 15000, avgRentMan: 52, defaultLife: { subway: 2, store: 8, mart: 2, hospital: 5 } },
  { id: 'bc_wonmi', sido: '경기도', gu: '부천시', dong: '원미동', lawdCd: '41190', coords: { lat: 37.494, lng: 126.762 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 13000 }, { type: '월세', depositForRent: 700, rentMan: 48 }], maintenanceFee: 5, avgJeonsaMan: 13000, avgRentMan: 48, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 4 } },
  { id: 'bc_chunui', sido: '경기도', gu: '부천시', dong: '춘의동', lawdCd: '41190', coords: { lat: 37.492, lng: 126.749 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 13000 }, { type: '월세', depositForRent: 700, rentMan: 47 }], maintenanceFee: 5, avgJeonsaMan: 13000, avgRentMan: 47, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'bc_sosa', sido: '경기도', gu: '부천시', dong: '소사동', lawdCd: '41190', coords: { lat: 37.476, lng: 126.802 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 12000 }, { type: '월세', depositForRent: 600, rentMan: 44 }], maintenanceFee: 5, avgJeonsaMan: 12000, avgRentMan: 44, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 4 } },
  { id: 'bc_yeokgok', sido: '경기도', gu: '부천시', dong: '역곡동', lawdCd: '41190', coords: { lat: 37.483, lng: 126.787 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 12500 }, { type: '월세', depositForRent: 700, rentMan: 45 }], maintenanceFee: 5, avgJeonsaMan: 12500, avgRentMan: 45, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 4 } },

  // ── 화성시 동탄 ───────────────────────────────────────────────────
  { id: 'hs_dongtan', sido: '경기도', gu: '화성시', dong: '동탄동', lawdCd: '41590', coords: { lat: 37.200, lng: 127.073 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 16000 }, { type: '월세', depositForRent: 1200, rentMan: 55 }], maintenanceFee: 5, avgJeonsaMan: 16000, avgRentMan: 55, defaultLife: { subway: 1, store: 8, mart: 2, hospital: 4 } },
  { id: 'hs_bansong', sido: '경기도', gu: '화성시', dong: '반송동', lawdCd: '41590', coords: { lat: 37.211, lng: 127.054 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 15000 }, { type: '월세', depositForRent: 1000, rentMan: 52 }], maintenanceFee: 5, avgJeonsaMan: 15000, avgRentMan: 52, defaultLife: { subway: 1, store: 7, mart: 2, hospital: 3 } },
  { id: 'hs_banjeong', sido: '경기도', gu: '화성시', dong: '반정동', lawdCd: '41590', coords: { lat: 37.197, lng: 127.044 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 18000 }, { type: '월세', depositForRent: 1500, rentMan: 60 }], maintenanceFee: 5, avgJeonsaMan: 18000, avgRentMan: 60, defaultLife: { subway: 1, store: 8, mart: 2, hospital: 4 } },
  { id: 'hs_cheongye', sido: '경기도', gu: '화성시', dong: '청계동', lawdCd: '41590', coords: { lat: 37.204, lng: 127.059 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 15000 }, { type: '월세', depositForRent: 1000, rentMan: 52 }], maintenanceFee: 5, avgJeonsaMan: 15000, avgRentMan: 52, defaultLife: { subway: 1, store: 7, mart: 2, hospital: 3 } },

  // ── 광명시 ────────────────────────────────────────────────────────
  { id: 'gm_cheolsan', sido: '경기도', gu: '광명시', dong: '철산동', lawdCd: '41210', coords: { lat: 37.474, lng: 126.866 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 18000 }, { type: '월세', depositForRent: 1500, rentMan: 62 }], maintenanceFee: 5, avgJeonsaMan: 18000, avgRentMan: 62, defaultLife: { subway: 2, store: 9, mart: 2, hospital: 5 } },
  { id: 'gm_haan', sido: '경기도', gu: '광명시', dong: '하안동', lawdCd: '41210', coords: { lat: 37.453, lng: 126.875 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 15000 }, { type: '월세', depositForRent: 1000, rentMan: 53 }], maintenanceFee: 5, avgJeonsaMan: 15000, avgRentMan: 53, defaultLife: { subway: 2, store: 8, mart: 2, hospital: 4 } },
  { id: 'gm_soha', sido: '경기도', gu: '광명시', dong: '소하동', lawdCd: '41210', coords: { lat: 37.440, lng: 126.887 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 14000 }, { type: '월세', depositForRent: 900, rentMan: 50 }], maintenanceFee: 5, avgJeonsaMan: 14000, avgRentMan: 50, defaultLife: { subway: 1, store: 7, mart: 1, hospital: 3 } },
  { id: 'gm_gwangmyeong', sido: '경기도', gu: '광명시', dong: '광명동', lawdCd: '41210', coords: { lat: 37.479, lng: 126.869 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 16000 }, { type: '월세', depositForRent: 1100, rentMan: 56 }], maintenanceFee: 5, avgJeonsaMan: 16000, avgRentMan: 56, defaultLife: { subway: 2, store: 8, mart: 2, hospital: 4 } },

  // ── 안산시 단원구 ──────────────────────────────────────────────────
  { id: 'as_gojan', sido: '경기도', gu: '안산시 단원구', dong: '고잔동', lawdCd: '41273', coords: { lat: 37.322, lng: 126.832 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 12000 }, { type: '월세', depositForRent: 700, rentMan: 44 }], maintenanceFee: 5, avgJeonsaMan: 12000, avgRentMan: 44, defaultLife: { subway: 2, store: 8, mart: 2, hospital: 4 } },
  { id: 'as_il', sido: '경기도', gu: '안산시 단원구', dong: '일동', lawdCd: '41273', coords: { lat: 37.331, lng: 126.817 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 11000 }, { type: '월세', depositForRent: 600, rentMan: 40 }], maintenanceFee: 5, avgJeonsaMan: 11000, avgRentMan: 40, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'as_choji', sido: '경기도', gu: '안산시 단원구', dong: '초지동', lawdCd: '41273', coords: { lat: 37.307, lng: 126.821 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 11000 }, { type: '월세', depositForRent: 600, rentMan: 40 }], maintenanceFee: 5, avgJeonsaMan: 11000, avgRentMan: 40, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 3 } },

  // ── 안산시 상록구 ──────────────────────────────────────────────────
  { id: 'asr_seongpo', sido: '경기도', gu: '안산시 상록구', dong: '성포동', lawdCd: '41271', coords: { lat: 37.321, lng: 126.844 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 11500 }, { type: '월세', depositForRent: 600, rentMan: 42 }], maintenanceFee: 5, avgJeonsaMan: 11500, avgRentMan: 42, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'asr_sa', sido: '경기도', gu: '안산시 상록구', dong: '사동', lawdCd: '41271', coords: { lat: 37.339, lng: 126.836 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 12000 }, { type: '월세', depositForRent: 700, rentMan: 43 }], maintenanceFee: 5, avgJeonsaMan: 12000, avgRentMan: 43, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 3 } },

  // ── 의정부시 ──────────────────────────────────────────────────────
  { id: 'uj_uijeongbu', sido: '경기도', gu: '의정부시', dong: '의정부동', lawdCd: '41150', coords: { lat: 37.738, lng: 127.047 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 10000 }, { type: '월세', depositForRent: 600, rentMan: 38 }], maintenanceFee: 5, avgJeonsaMan: 10000, avgRentMan: 38, defaultLife: { subway: 2, store: 8, mart: 2, hospital: 5 } },
  { id: 'uj_ganeung', sido: '경기도', gu: '의정부시', dong: '가능동', lawdCd: '41150', coords: { lat: 37.743, lng: 127.064 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 10000 }, { type: '월세', depositForRent: 600, rentMan: 38 }], maintenanceFee: 5, avgJeonsaMan: 10000, avgRentMan: 38, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'uj_minrak', sido: '경기도', gu: '의정부시', dong: '민락동', lawdCd: '41150', coords: { lat: 37.752, lng: 127.063 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 12000 }, { type: '월세', depositForRent: 700, rentMan: 43 }], maintenanceFee: 5, avgJeonsaMan: 12000, avgRentMan: 43, defaultLife: { subway: 1, store: 7, mart: 1, hospital: 3 } },
  { id: 'uj_nongyang', sido: '경기도', gu: '의정부시', dong: '녹양동', lawdCd: '41150', coords: { lat: 37.773, lng: 127.044 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 10000 }, { type: '월세', depositForRent: 500, rentMan: 37 }], maintenanceFee: 5, avgJeonsaMan: 10000, avgRentMan: 37, defaultLife: { subway: 2, store: 6, mart: 1, hospital: 3 } },

  // ── 남양주시 ──────────────────────────────────────────────────────
  { id: 'ny_dasan', sido: '경기도', gu: '남양주시', dong: '다산동', lawdCd: '41360', coords: { lat: 37.604, lng: 127.176 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 15000 }, { type: '월세', depositForRent: 1000, rentMan: 52 }], maintenanceFee: 5, avgJeonsaMan: 15000, avgRentMan: 52, defaultLife: { subway: 2, store: 8, mart: 2, hospital: 4 } },
  { id: 'ny_byeolnae', sido: '경기도', gu: '남양주시', dong: '별내동', lawdCd: '41360', coords: { lat: 37.640, lng: 127.157 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 14000 }, { type: '월세', depositForRent: 900, rentMan: 49 }], maintenanceFee: 5, avgJeonsaMan: 14000, avgRentMan: 49, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 3 } },
  { id: 'ny_hopyeong', sido: '경기도', gu: '남양주시', dong: '호평동', lawdCd: '41360', coords: { lat: 37.645, lng: 127.226 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 13000 }, { type: '월세', depositForRent: 800, rentMan: 46 }], maintenanceFee: 5, avgJeonsaMan: 13000, avgRentMan: 46, defaultLife: { subway: 1, store: 7, mart: 1, hospital: 3 } },

  // ── 하남시 ────────────────────────────────────────────────────────
  { id: 'hn_deokpung', sido: '경기도', gu: '하남시', dong: '덕풍동', lawdCd: '41450', coords: { lat: 37.540, lng: 127.209 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 18000 }, { type: '월세', depositForRent: 1500, rentMan: 62 }], maintenanceFee: 5, avgJeonsaMan: 18000, avgRentMan: 62, defaultLife: { subway: 2, store: 8, mart: 2, hospital: 4 } },
  { id: 'hn_sinjang', sido: '경기도', gu: '하남시', dong: '신장동', lawdCd: '41450', coords: { lat: 37.546, lng: 127.215 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 18000 }, { type: '월세', depositForRent: 1500, rentMan: 62 }], maintenanceFee: 5, avgJeonsaMan: 18000, avgRentMan: 62, defaultLife: { subway: 2, store: 8, mart: 2, hospital: 4 } },
  { id: 'hn_misa', sido: '경기도', gu: '하남시', dong: '미사동', lawdCd: '41450', coords: { lat: 37.565, lng: 127.196 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 22000 }, { type: '월세', depositForRent: 2000, rentMan: 75 }], maintenanceFee: 6, avgJeonsaMan: 22000, avgRentMan: 75, defaultLife: { subway: 2, store: 9, mart: 2, hospital: 5 } },
  { id: 'hn_pungsan', sido: '경기도', gu: '하남시', dong: '풍산동', lawdCd: '41450', coords: { lat: 37.553, lng: 127.208 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 19000 }, { type: '월세', depositForRent: 1600, rentMan: 65 }], maintenanceFee: 5, avgJeonsaMan: 19000, avgRentMan: 65, defaultLife: { subway: 2, store: 8, mart: 2, hospital: 4 } },

  // ── 구리시 ────────────────────────────────────────────────────────
  { id: 'gr_inchang', sido: '경기도', gu: '구리시', dong: '인창동', lawdCd: '41310', coords: { lat: 37.592, lng: 127.143 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 18000 }, { type: '월세', depositForRent: 1500, rentMan: 62 }], maintenanceFee: 5, avgJeonsaMan: 18000, avgRentMan: 62, defaultLife: { subway: 2, store: 8, mart: 2, hospital: 4 } },
  { id: 'gr_gyomun', sido: '경기도', gu: '구리시', dong: '교문동', lawdCd: '41310', coords: { lat: 37.595, lng: 127.127 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 17000 }, { type: '월세', depositForRent: 1300, rentMan: 58 }], maintenanceFee: 5, avgJeonsaMan: 17000, avgRentMan: 58, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 4 } },
  { id: 'gr_sutaek', sido: '경기도', gu: '구리시', dong: '수택동', lawdCd: '41310', coords: { lat: 37.603, lng: 127.135 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 17000 }, { type: '월세', depositForRent: 1300, rentMan: 58 }], maintenanceFee: 5, avgJeonsaMan: 17000, avgRentMan: 58, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 4 } },

  // ── 수원시 장안구/권선구 추가 ──────────────────────────────────────
  { id: 'sw_yulgeon', sido: '경기도', gu: '수원시 장안구', dong: '율전동', lawdCd: '41111', coords: { lat: 37.300, lng: 127.009 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 9000 }, { type: '월세', depositForRent: 500, rentMan: 35 }], maintenanceFee: 5, avgJeonsaMan: 9000, avgRentMan: 35, defaultLife: { subway: 1, store: 7, mart: 1, hospital: 4 } },
  { id: 'sw_jeongja', sido: '경기도', gu: '수원시 장안구', dong: '정자동', lawdCd: '41111', coords: { lat: 37.313, lng: 127.018 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 9500 }, { type: '월세', depositForRent: 500, rentMan: 37 }], maintenanceFee: 5, avgJeonsaMan: 9500, avgRentMan: 37, defaultLife: { subway: 1, store: 7, mart: 1, hospital: 4 } },
  { id: 'sw_maetan', sido: '경기도', gu: '수원시 권선구', dong: '매탄동', lawdCd: '41113', coords: { lat: 37.265, lng: 127.039 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 10000 }, { type: '월세', depositForRent: 600, rentMan: 39 }], maintenanceFee: 5, avgJeonsaMan: 10000, avgRentMan: 39, defaultLife: { subway: 2, store: 8, mart: 2, hospital: 4 } },
  { id: 'sw_gwonseon', sido: '경기도', gu: '수원시 권선구', dong: '권선동', lawdCd: '41113', coords: { lat: 37.254, lng: 126.991 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 9000 }, { type: '월세', depositForRent: 500, rentMan: 35 }], maintenanceFee: 5, avgJeonsaMan: 9000, avgRentMan: 35, defaultLife: { subway: 1, store: 7, mart: 1, hospital: 3 } },

  // ── 안양시 만안구 추가 ─────────────────────────────────────────────
  { id: 'ay_anyang', sido: '경기도', gu: '안양시 만안구', dong: '안양동', lawdCd: '41171', coords: { lat: 37.392, lng: 126.924 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 10000 }, { type: '월세', depositForRent: 600, rentMan: 39 }], maintenanceFee: 5, avgJeonsaMan: 10000, avgRentMan: 39, defaultLife: { subway: 2, store: 8, mart: 2, hospital: 4 } },
  { id: 'ay_seoksu', sido: '경기도', gu: '안양시 만안구', dong: '석수동', lawdCd: '41171', coords: { lat: 37.378, lng: 126.932 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 9500 }, { type: '월세', depositForRent: 500, rentMan: 37 }], maintenanceFee: 5, avgJeonsaMan: 9500, avgRentMan: 37, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 3 } },

  // ── 성남시 수정구/중원구 추가 ──────────────────────────────────────
  { id: 'sn_sindae', sido: '경기도', gu: '성남시 수정구', dong: '신흥동', lawdCd: '41133', coords: { lat: 37.451, lng: 127.134 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 13000 }, { type: '월세', depositForRent: 800, rentMan: 47 }], maintenanceFee: 5, avgJeonsaMan: 13000, avgRentMan: 47, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'sn_dandan', sido: '경기도', gu: '성남시 수정구', dong: '단대동', lawdCd: '41133', coords: { lat: 37.449, lng: 127.142 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 13000 }, { type: '월세', depositForRent: 800, rentMan: 47 }], maintenanceFee: 5, avgJeonsaMan: 13000, avgRentMan: 47, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 3 } },
  { id: 'sn_geumgwang', sido: '경기도', gu: '성남시 중원구', dong: '금광동', lawdCd: '41131', coords: { lat: 37.437, lng: 127.133 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 12000 }, { type: '월세', depositForRent: 700, rentMan: 44 }], maintenanceFee: 5, avgJeonsaMan: 12000, avgRentMan: 44, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },
  { id: 'sn_sangdaewon', sido: '경기도', gu: '성남시 중원구', dong: '상대원동', lawdCd: '41131', coords: { lat: 37.444, lng: 127.149 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 12500 }, { type: '월세', depositForRent: 700, rentMan: 45 }], maintenanceFee: 5, avgJeonsaMan: 12500, avgRentMan: 45, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 4 } },

  // ── 시흥시 ────────────────────────────────────────────────────────
  { id: 'sh_sincheon', sido: '경기도', gu: '시흥시', dong: '신천동', lawdCd: '41390', coords: { lat: 37.437, lng: 126.811 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 12000 }, { type: '월세', depositForRent: 700, rentMan: 43 }], maintenanceFee: 5, avgJeonsaMan: 12000, avgRentMan: 43, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 3 } },
  { id: 'sh_eunhaeng', sido: '경기도', gu: '시흥시', dong: '은행동', lawdCd: '41390', coords: { lat: 37.446, lng: 126.812 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 12000 }, { type: '월세', depositForRent: 700, rentMan: 43 }], maintenanceFee: 5, avgJeonsaMan: 12000, avgRentMan: 43, defaultLife: { subway: 2, store: 7, mart: 1, hospital: 3 } },
  { id: 'sh_daeya', sido: '경기도', gu: '시흥시', dong: '대야동', lawdCd: '41390', coords: { lat: 37.460, lng: 126.810 }, pin: { x: 50, y: 50 }, options: [{ type: '전세', depositMan: 13000 }, { type: '월세', depositForRent: 700, rentMan: 46 }], maintenanceFee: 5, avgJeonsaMan: 13000, avgRentMan: 46, defaultLife: { subway: 2, store: 8, mart: 1, hospital: 4 } },
];
