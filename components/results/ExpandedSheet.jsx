// components/results/ExpandedSheet.jsx — 결과 카드를 눌렀을 때 뜨는 상세 바텀시트
import { ScoreBadge, regionLabel } from '../shared';
import {
  IconWon, IconSubway, IconStore, IconCart, IconHospital,
  IconClose, IconExternal, IconCar,
} from '../icons';
import { MiniMap } from './MiniMap';

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

function DetailStat({ icon, label, value, note }) {
  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '4px 8px', textAlign: 'center' }}>
      <span style={{ color: 'var(--ink-3)', display: 'flex' }}>{icon}</span>
      <span style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 800, whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}>{value}</span>
      {note && <span style={{ fontSize: 10.5, color: 'var(--ink-3)', fontWeight: 500 }}>{note}</span>}
    </div>
  );
}

// ── ScoreFactor: 추천 근거 막대 ────────────────────────────────────
function ScoreFactor({ label, weight, score }) {
  const fg = score >= 75 ? 'var(--accent)' : score >= 50 ? 'var(--good)' : 'var(--mid)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-2)', width: 76, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', width: 30, flexShrink: 0 }}>{weight}</span>
      <div style={{ flex: 1, height: 7, borderRadius: 999, background: 'var(--line)', overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', borderRadius: 999, background: fg, transition: 'width .3s ease' }} />
      </div>
      <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--ink)', width: 26, textAlign: 'right', flexShrink: 0 }}>{score}</span>
    </div>
  );
}

export function ExpandedSheet({ item, onClose, myAsset }) {
  // 다방은 좌표 기반 지도 URL이 가장 안정적으로 해당 동네 매물을 보여준다
  // (자유 텍스트 검색 URL은 동작이 불안정함). 거래유형은 지도 로드 후 필터로 선택.
  const lat = item.coords?.lat;
  const lng = item.coords?.lng;
  // 좌표 기반 지도 URL: 해당 동네 매물 표시 (웹/앱 공통)
  const dabangUrl = (lat && lng)
    ? `https://www.dabangapp.com/map/onetwo?m_lat=${lat}&m_lng=${lng}&m_zoom=14&q=${encodeURIComponent(item.dong)}`
    : `https://www.dabangapp.com/search/${encodeURIComponent(item.dong)}`;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 40 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,20,28,0.45)', animation: 'fade .2s ease' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', maxWidth: 480, margin: '0 auto', maxHeight: '90%', display: 'flex', flexDirection: 'column',
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-2)', background: 'var(--bg)', padding: '3px 9px', borderRadius: 6 }}>{item.type}</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>{item.priceLabel}</span>
          </div>
          <div style={{ marginTop: 8, fontSize: 13.5, color: 'var(--ink-2)', fontWeight: 500 }}>
            최근 2개월 실거래 평균 <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{item.avgLabel}</span>
          </div>
          <div style={{ marginTop: 18, display: 'flex', background: 'var(--bg)', borderRadius: 14, padding: '14px 0', overflow: 'hidden' }}>
            <DetailStat icon={<IconWon size={21} />} label="월 고정비" value={`${item.monthlyMan}만원`} note="관리비 포함" />
            <div style={{ width: 1, background: 'var(--line)', margin: '2px 0' }} />
            <DetailStat icon={<IconSubway size={21} />} label="대중교통" value={item.transitLabel} />
            <div style={{ width: 1, background: 'var(--line)', margin: '2px 0' }} />
            <DetailStat icon={<IconCar size={21} />} label="자가용" value={item.carLabel} />
          </div>
          {item.breakdown && (
            <>
              <div style={{ marginTop: 22, fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>추천 근거</div>
              <div style={{ marginTop: 11, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <ScoreFactor label="직주근접" weight="50%" score={item.breakdown.commute} />
                <ScoreFactor label="가격 적정성" weight="35%" score={item.breakdown.price} />
                <ScoreFactor label="생활 편의" weight="15%" score={item.breakdown.life} />
              </div>
            </>
          )}
          {item.life && (
            <>
              <div style={{ marginTop: 22, fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>생활권 요약</div>
              <div style={{ marginTop: 11, display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
                <FacilityChip icon={<IconSubway size={18} />} label="지하철" count={item.life.subway} />
                <FacilityChip icon={<IconStore size={18} />} label="편의점" count={item.life.store} />
                <FacilityChip icon={<IconCart size={18} />} label="대형마트" count={item.life.mart} />
                <FacilityChip icon={<IconHospital size={18} />} label="병원" count={item.life.hospital} />
              </div>
            </>
          )}
          <MiniMap item={item} />
        </div>
        <div style={{ padding: '12px 20px 24px', background: 'var(--surface)', borderTop: '1px solid var(--line)' }}>
          <a href={dabangUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%', height: 54, borderRadius: 14, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 16, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              background: 'var(--accent)', color: '#fff',
            }}>
              다방에서 바로보기 <IconExternal size={18} />
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}
