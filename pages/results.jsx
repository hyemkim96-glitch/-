// pages/results.jsx — 추천 결과 (실제 사용자 입력 기반 필터링 + API 연동)
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getFormData, getPrefsData, addHistory } from '../lib/storage';
import { buildResults } from '../lib/buildResults';
import { formatKRW } from '../components/shared';
import { IconMap, IconClose, IconList } from '../components/icons';
import { FilterBar } from '../components/results/FilterBar';
import { ResultCard, SkeletonCard } from '../components/results/ResultCard';
import { ExpandedSheet } from '../components/results/ExpandedSheet';
import { ResultsKakaoMap } from '../components/results/ResultsKakaoMap';

// ── ResultsPage ────────────────────────────────────────────────────
export default function ResultsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({ type: '전체', home: '무관', loan: false, floor: '전체', sort: 'score' });
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [slowWarning, setSlowWarning] = useState(false);
  const [allResults, setAllResults] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [myAsset, setMyAsset] = useState(0);
  const [workCoords, setWorkCoords] = useState({ lat: null, lng: null });

  useEffect(() => {
    const f = getFormData();
    const p = getPrefsData();
    const assetVal = parseInt(f.asset || '0', 10);
    setMyAsset(assetVal);
    setWorkCoords({ lat: f.workLat || null, lng: f.workLng || null });
    setFilters((prev) => ({ ...prev, type: p.housing === '전세' ? '전세만' : p.housing === '월세' ? '월세만' : '전체', sort: prev.sort || 'score' }));

    const slowTimer = setTimeout(() => setSlowWarning(true), 3000);

    buildResults({
      asset: assetVal,
      income: parseInt(f.income || '0', 10),
      workLat: f.workLat || null,
      workLng: f.workLng || null,
      loan: true,
      loanRate: 3.5,
      transport: p.transport || '대중교통',
    }).then((results) => {
      clearTimeout(slowTimer);
      setSlowWarning(false);
      setAllResults(results);
      setLoading(false);

      // 실제 새 검색(step2 또는 히스토리 재조회)일 때만 히스토리 저장
      const isNewSearch = sessionStorage.getItem('zipter_new_search') === '1';
      sessionStorage.removeItem('zipter_new_search');
      if (isNewSearch && f.work && results.length > 0) {
        addHistory({
          id: `h_${Date.now()}`,
          createdAt: Date.now(),
          region: `${results[0].gu} ${results[0].dong}`,
          count: results.length,
          work: f.work,
          workLat: f.workLat || null,
          workLng: f.workLng || null,
          asset: f.asset || '0',
          income: f.income || '',
          depositMan: results[0].depositMan,
          monthlyMan: results[0].monthlyMan,
          housing: p.housing || '전월세',
          transport: p.transport || '대중교통',
        });
      }
    }).catch((err) => {
      clearTimeout(slowTimer);
      setSlowWarning(false);
      setLoadError(err.message || 'UNKNOWN');
      setLoading(false);
    });

    return () => clearTimeout(slowTimer);
  }, []);

  // 필터 + 정렬 적용
  const filtered = allResults
    .filter((item) => {
      if (filters.type === '전세만' && item.type !== '전세') return false;
      if (filters.type === '월세만' && item.type !== '월세') return false;
      return true;
    })
    .map((item) => {
      // 층 유형 필터: MOLIT 실 데이터 있을 때만 가격 재계산, 없으면 원본 유지
      if (filters.floor === '전체') return item;

      const floorStats = item.byFloor?.[filters.floor];
      if (!floorStats || floorStats.count === 0) return item;

      if (item.type === '전세') {
        const deposit = floorStats.jeonsa;
        if (!deposit) return item;
        const loanNeeded = Math.max(0, deposit - myAsset);
        const newMonthly = Math.round((loanNeeded * 0.035) / 12) + (item.maintenanceFee || 0);
        return {
          ...item,
          depositMan: deposit,
          capitalMan: deposit,
          monthlyMan: newMonthly,
          priceLabel: formatKRW(deposit),
          avgLabel: formatKRW(deposit),
          needsLoan: deposit > myAsset,
        };
      } else {
        const rent = floorStats.wolseRent;
        const depAmt = floorStats.wolseDeposit || 0;
        if (!rent) return item;
        const loanNeeded = Math.max(0, depAmt - myAsset);
        const newMonthly = Math.round((loanNeeded * 0.035) / 12) + rent + (item.maintenanceFee || 0);
        return {
          ...item,
          depositMan: depAmt,
          depositForRent: depAmt,
          monthlyMan: newMonthly,
          priceLabel: `보증금 ${formatKRW(depAmt)} · 월 ${rent}만원`,
          avgLabel: `보증금 ${formatKRW(depAmt)} / 월 ${rent}만원`,
          needsLoan: depAmt > myAsset,
        };
      }
    })
    .filter((item) => {
      if (!filters.loan && item.needsLoan) return false;
      // 추천순일 때만 낮은 점수 지역 제외
      if (filters.sort === 'score' && item.score < 40) return false;
      return true;
    })
    .sort((a, b) => {
      if (filters.sort === 'monthly') {
        if (a.monthlyMan !== b.monthlyMan) return a.monthlyMan - b.monthlyMan;
        return a.depositMan - b.depositMan; // 고정비 동일 시 보증금 낮은 순
      }
      if (filters.sort === 'commute') return a.sortMinute - b.sortMinute;
      if (b.score !== a.score) return b.score - a.score;
      return a.sortMinute - b.sortMinute; // 추천순 동점 시 가까운 순
    });

  const header = (
    <div style={{ paddingTop: 50, background: 'var(--bg)', boxShadow: '0 1px 0 rgba(0,0,0,0.03)' }}>
      <div style={{ padding: '6px 16px 0', display: 'flex', alignItems: 'center', gap: 4 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>추천 지역</h1>
        <span style={{ marginLeft: 'auto' }} />
        {/* 닫기(홈으로) 버튼 */}
        <button
          onClick={() => router.push('/')}
          aria-label="홈으로"
          style={{
            marginLeft: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: 999, border: 'none', cursor: 'pointer',
            background: 'var(--line)', color: 'var(--ink-2)',
            flexShrink: 0,
          }}
        >
          <IconClose size={18} />
        </button>
      </div>
      <FilterBar filters={filters} setFilters={setFilters} />
    </div>
  );

  // API 실패 에러 화면
  if (loadError) {
    const isKeyMissing = loadError === 'MOLIT_API_KEY not set';
    const molitCode = loadError.startsWith('PRICE_API_FAILED:')
      ? loadError.replace('PRICE_API_FAILED:', '') : null;
    const errorDetail = isKeyMissing
      ? 'MOLIT_API_KEY 환경변수가 설정되지 않았습니다.'
      : molitCode === '22' ? '국토부 API 요청 한도 초과 (코드 22). 잠시 후 다시 시도해주세요.'
      : molitCode === '30' ? '등록되지 않은 서비스키입니다 (코드 30). API 키를 확인해주세요.'
      : molitCode === '31' ? '만료된 서비스키입니다 (코드 31). API 키를 갱신해주세요.'
      : molitCode === '32' ? 'IP 미등록 오류입니다 (코드 32). 공공데이터포털에서 IP 제한을 해제해주세요.'
      : molitCode === 'NO_DATA' ? '해당 지역의 실거래 데이터가 없습니다.'
      : molitCode === 'TIMEOUT' ? '국토부 API 응답 시간 초과입니다. 잠시 후 다시 시도해주세요.'
      : `시세 데이터를 불러오지 못했습니다 (${molitCode || loadError}).`;
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 32px', textAlign: 'center', background: 'var(--bg)' }}>
        <div style={{ fontSize: 40 }}>⚠️</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>데이터 요청에 실패했습니다</div>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.7 }}>
          {errorDetail}
        </p>
        <button
          onClick={() => { setLoadError(null); setLoading(true); router.replace('/results'); }}
          style={{ marginTop: 8, padding: '12px 28px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, background: 'var(--accent)', color: '#fff' }}
        >
          다시 시도
        </button>
        <button
          onClick={() => router.push('/')}
          style={{ padding: '10px 20px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, background: 'var(--surface)', color: 'var(--ink-2)' }}
        >
          홈으로
        </button>
      </div>
    );
  }

  // 지도 뷰
  if (viewMode === 'map') {
    const hasKakaoKey = !!process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {header}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {hasKakaoKey
            ? <ResultsKakaoMap items={filtered} onExpand={setExpanded} workLat={workCoords.lat} workLng={workCoords.lng} />
            : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 32px', textAlign: 'center', background: 'var(--bg)' }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--card-shadow)' }}>
                  <IconMap size={30} style={{ color: 'var(--ink-3)' }} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>지도를 표시할 수 없습니다</div>
                <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.6 }}>
                  지도 기능은 카카오맵 API 키가 필요합니다.<br />
                  Vercel 환경변수에<br />
                  <code style={{ fontSize: 12, background: 'var(--line)', padding: '2px 6px', borderRadius: 4 }}>NEXT_PUBLIC_KAKAO_MAP_KEY</code><br />
                  를 설정해주세요.
                </p>
                <button
                  onClick={() => setViewMode('list')}
                  style={{ marginTop: 4, padding: '10px 24px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, background: 'var(--accent)', color: '#fff' }}
                >
                  목록으로 돌아가기
                </button>
              </div>
            )
          }
        </div>
        {expanded && <ExpandedSheet item={expanded} onClose={() => setExpanded(null)} myAsset={myAsset} />}
        {/* 하단 목록 토글 */}
        <div style={{ padding: '12px 20px 28px', background: 'var(--bg)' }}>
          <button
            onClick={() => setViewMode('list')}
            style={{ width: '100%', height: 50, borderRadius: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'var(--surface)', color: 'var(--ink-2)', boxShadow: 'var(--card-shadow)' }}
          >
            <IconList size={17} /> 목록으로 보기
          </button>
        </div>
      </div>
    );
  }

  // 목록 뷰
  return (
    <>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {header}
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {slowWarning && loading && (
            <div style={{ margin: '16px 20px 0', padding: '12px 16px', borderRadius: 12, background: 'var(--accent-weak)', fontSize: 13.5, fontWeight: 600, color: 'var(--accent)' }}>
              데이터를 불러오는 중입니다 (최대 15초)
            </div>
          )}
          <div style={{ margin: '12px 20px 0', padding: '10px 14px', borderRadius: 10, background: 'var(--line)', fontSize: 13, fontWeight: 600, color: 'var(--ink-3)' }}>
            표시된 가격은 최근 2개월 실거래 <b style={{ color: 'var(--ink-2)' }}>평균가</b>로, 실제 매물 가격과 다를 수 있습니다.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px 20px' }}>
            {loading
              ? [1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)
              : filtered.length === 0
                ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-3)' }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>조건 내 결과가 없습니다</div>
                    <p style={{ marginTop: 8, fontSize: 14 }}>
                      {filters.loan ? '다른 조건을 조정해보세요' : '보증금이 자산보다 높은 매물은 "대출 포함"을 켜야 보여요'}
                    </p>
                    {!filters.loan && (
                      <button
                        onClick={() => setFilters({ ...filters, loan: true })}
                        style={{ marginTop: 14, padding: '10px 22px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, background: 'var(--accent)', color: '#fff' }}
                      >
                        대출 포함 켜기
                      </button>
                    )}
                  </div>
                )
                : filtered.map((item, i) => <ResultCard key={item.id} item={item} onExpand={setExpanded} index={i} />)
            }
            {!loading && filtered.some((i) => i.transitLabel?.includes('*') || i.carLabel?.includes('*')) && (
              <p style={{ fontSize: 12, color: 'var(--ink-3)', textAlign: 'center', margin: '4px 0 8px' }}>
                * 출퇴근 시간은 직선거리 기반 추정값입니다
              </p>
            )}
            {!loading && filtered.length > 0 && <div style={{ height: 80 }} />}
          </div>
        </div>
        {/* 지도로 보기 FAB */}
        {!loading && filtered.length > 0 && (
          <button
            onClick={() => setViewMode('map')}
            aria-label="지도로 보기"
            style={{
              position: 'absolute', bottom: 24, right: 20,
              width: 52, height: 52, borderRadius: 999,
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--surface)', color: 'var(--ink-2)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.16)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <IconMap size={22} />
          </button>
        )}
      </div>
      {expanded && <ExpandedSheet item={expanded} onClose={() => setExpanded(null)} myAsset={myAsset} />}
    </>
  );
}
