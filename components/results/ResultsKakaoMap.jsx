// components/results/ResultsKakaoMap.jsx — 추천 결과 전체를 보여주는 카카오맵 뷰
import { useEffect, useRef } from 'react';
import { gradeColors } from '../shared';

export function ResultsKakaoMap({ items, onExpand, workLat, workLng }) {
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
