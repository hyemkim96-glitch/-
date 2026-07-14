// components/results/MiniMap.jsx — 상세 시트 안의 작은 지도(카카오맵 or 플레이스홀더)
import { useEffect, useRef } from 'react';
import { MapCanvas } from '../layout/Screen';

export function MiniMap({ item }) {
  const containerRef = useRef(null);
  const hasKey = !!process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

  useEffect(() => {
    if (!hasKey || !containerRef.current || !item.coords) return;
    function init() {
      const kakao = window.kakao;
      if (!kakao?.maps) return;
      kakao.maps.load(() => {
        const pos = new kakao.maps.LatLng(item.coords.lat, item.coords.lng);
        const map = new kakao.maps.Map(containerRef.current, { center: pos, level: 4 });
        // 핀 대신 반경 원으로 표시 (특정 주소가 아닌 동네 범위임을 명확히)
        new kakao.maps.Circle({
          map,
          center: pos,
          radius: 400,
          strokeWeight: 2,
          strokeColor: '#3182F6',
          strokeOpacity: 0.7,
          fillColor: '#3182F6',
          fillOpacity: 0.12,
        });
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
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 140, height: 140, borderRadius: 999,
          background: 'rgba(49,130,246,0.10)', boxShadow: 'inset 0 0 0 1.5px rgba(49,130,246,0.35)' }} />
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 8, height: 8, borderRadius: 999, background: '#3182F6', opacity: 0.5 }} />
      </MapCanvas>
    </div>
  );
}
