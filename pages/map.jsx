// pages/map.jsx — 지도 뷰 (카카오맵 실제 연동, fallback: 가상 캔버스)
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { CANDIDATE_REGIONS, ScoreBadge, regionLabel, scoreFg } from '../components/shared';
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

// 가상 지도 캔버스 위 핀 (카카오맵 미사용 시 fallback)
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

// 카카오맵 실제 연동 컴포넌트
function KakaoMap({ items, selectedId, onSelect }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current) return;

    function initMap() {
      const kakao = window.kakao;
      if (!kakao?.maps) return;

      kakao.maps.load(() => {
        const center = new kakao.maps.LatLng(37.5326, 126.9903); // 서울 중심
        const map = new kakao.maps.Map(containerRef.current, {
          center,
          level: 8,
        });
        mapRef.current = map;

        // 마커 생성
        items.forEach((item) => {
          if (!item.coords) return;
          const pos = new kakao.maps.LatLng(item.coords.lat, item.coords.lng);
          const content = `
            <div style="
              display:flex;align-items:center;gap:5px;padding:6px 10px;
              border-radius:999px;white-space:nowrap;
              background:${item.id === selectedId ? 'var(--accent,#3182F6)' : '#fff'};
              color:${item.id === selectedId ? '#fff' : '#2A313B'};
              font-weight:700;font-size:13px;
              box-shadow:${item.id === selectedId ? '0 8px 20px rgba(49,130,246,0.4)' : '0 3px 10px rgba(0,0,0,0.16)'};
              font-family:Pretendard,sans-serif;cursor:pointer;
            ">${item.dong} <span style="font-weight:800">${item.score}</span></div>
          `;
          const overlay = new kakao.maps.CustomOverlay({ position: pos, content, yAnchor: 1.3 });
          overlay.setMap(map);
          markersRef.current.push({ overlay, item });

          kakao.maps.event.addListener(overlay, 'click', () => onSelect(item));
        });
      });
    }

    if (window.kakao?.maps) {
      initMap();
    } else {
      // SDK 로드 대기
      const interval = setInterval(() => {
        if (window.kakao?.maps) { clearInterval(interval); initMap(); }
      }, 200);
      return () => clearInterval(interval);
    }
  }, []);

  return <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />;
}

// CANDIDATE_REGIONS를 지도용 평면 목록으로 변환 (첫 번째 option 기준)
const MAP_ITEMS = CANDIDATE_REGIONS.map((r) => ({
  id: r.id,
  gu: r.gu,
  dong: r.dong,
  coords: r.coords,
  pin: r.pin,
  score: 75, // 실제 점수는 results 페이지에서 계산, 지도는 placeholder
}));

export default function MapPage() {
  const router = useRouter();
  const [sel, setSel] = useState(MAP_ITEMS[0]?.id ?? null);
  const selItem = MAP_ITEMS.find((d) => d.id === sel) ?? null;
  const hasKakaoKey = !!process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

  return (
    <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
      {/* 지도 영역 */}
      {hasKakaoKey ? (
        <KakaoMap
          items={MAP_ITEMS}
          selectedId={sel}
          onSelect={(item) => setSel(item.id)}
        />
      ) : (
        <MapCanvas style={{ position: 'absolute' }}>
          {MAP_ITEMS.map((item) => (
            <MapPin key={item.id} item={item} selected={item.id === sel} onClick={(it) => setSel(it.id)} />
          ))}
        </MapCanvas>
      )}

      {/* 상단 필터바 */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 52, zIndex: 10 }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '10px 16px 12px', scrollbarWidth: 'none',
          background: 'rgba(242,244,246,0.72)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}>
          <FilterPill label="전세만" chevron active />
          <FilterPill label="무관" chevron />
          <FilterPill label="60분 이하" chevron />
          <FilterPill label="추천순" chevron />
        </div>
      </div>

      {/* 선택된 지역 카드 */}
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

      {/* 하단 목록 버튼 */}
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
