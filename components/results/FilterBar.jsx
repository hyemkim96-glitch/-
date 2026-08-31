// components/results/FilterBar.jsx — 추천 결과 상단 필터 바 (정렬/거래유형/층/대출 토글)
import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { IconChevDown } from '../icons';

// 대출 드롭다운에 노출되는 상품명
const LOAN_FILTER_LABELS = {
  '버팀목': '버팀목 대출',
  '청년버팀목': '청년 버팀목 대출',
  '일반': '일반 전세 대출',
};

// 드롭다운이 화면 가장자리에 붙지 않도록 두는 여백(px)
const EDGE_GAP = 10;

// ── DropdownPill: 클릭 시 드롭다운 펼치는 필터 칩 ─────────────────
// scrollRef: 칩들이 담긴 가로 스크롤 컨테이너. 칩을 누르면 그 칩을 왼쪽으로 당겨서
//            드롭다운이 놓일 자리를 확보하고, 스크롤되는 동안 드롭다운도 칩을 따라간다.
function DropdownPill({ label, active, options, value, onChange, scrollRef }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const ref = useRef(null);

  // 칩의 현재 위치에 맞춰 드롭다운을 다시 배치 (화면 밖으로 나가면 안쪽으로 당김)
  const updatePos = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const width = ref.current ? ref.current.offsetWidth : 0;
    const maxLeft = window.innerWidth - width - EDGE_GAP;
    setPos({
      top: rect.bottom + 6,
      left: width ? Math.max(EDGE_GAP, Math.min(rect.left, maxLeft)) : rect.left,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target) &&
          btnRef.current && !btnRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    // capture로 받아야 필터 줄의 가로 스크롤까지 잡힌다 (스크롤 애니메이션 중에도 따라감)
    window.addEventListener('scroll', updatePos, true);
    window.addEventListener('resize', updatePos);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      window.removeEventListener('scroll', updatePos, true);
      window.removeEventListener('resize', updatePos);
    };
  }, [open, updatePos]);

  // 메뉴가 그려진 뒤 실제 너비로 다시 보정 (첫 페인트 전에 반영)
  useLayoutEffect(() => {
    if (open) updatePos();
  }, [open, updatePos]);

  function handleOpen() {
    if (open) { setOpen(false); return; }
    const row = scrollRef && scrollRef.current;
    if (row && btnRef.current) {
      // 누른 칩을 줄의 왼쪽 끝으로 당긴다 → 칩들이 전체적으로 왼쪽으로 이동
      const next = row.scrollLeft
        + btnRef.current.getBoundingClientRect().left
        - row.getBoundingClientRect().left
        - EDGE_GAP;
      row.scrollTo({ left: Math.max(0, next), behavior: 'smooth' });
    }
    updatePos();
    setOpen(true);
  }

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        ref={btnRef}
        onClick={handleOpen}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '9px 13px', borderRadius: 999, border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap',
          background: active ? 'var(--accent)' : 'var(--surface)',
          color: active ? '#fff' : 'var(--ink-2)',
          transition: 'all .14s ease', WebkitTapHighlightColor: 'transparent',
        }}
      >
        {label}
        <IconChevDown size={15} style={{ marginRight: -2, opacity: 0.8, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
      </button>
      {open && (
        <div ref={ref} style={{
          position: 'fixed', top: pos.top, left: pos.left, zIndex: 200,
          background: 'var(--surface)', borderRadius: 14, overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.14), 0 0 0 1px var(--line)',
          minWidth: 120, maxWidth: `calc(100vw - ${EDGE_GAP * 2}px)`,
        }}>
          {options.map((opt, i) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                width: '100%', padding: '12px 16px', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 14, fontWeight: 600, textAlign: 'left',
                whiteSpace: 'nowrap',
                background: value === opt.value ? 'var(--accent-weak)' : 'transparent',
                color: value === opt.value ? 'var(--accent)' : 'var(--ink)',
                borderTop: i ? '1px solid var(--bg)' : 'none',
              }}
            >
              {opt.label}
              {value === opt.value && <span style={{ fontSize: 12, color: 'var(--accent)' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function FilterBar({ filters, setFilters, loanType, onLoanTypeChange }) {
  const ref = useRef(null);
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 });

  function onMouseDown(e) {
    // 드롭다운 버튼 클릭은 드래그 시작 안 함
    if (e.target.closest('[data-no-drag]')) return;
    drag.current = { active: true, startX: e.pageX - ref.current.offsetLeft, scrollLeft: ref.current.scrollLeft };
    ref.current.style.cursor = 'grabbing';
  }
  function onMouseMove(e) {
    if (!drag.current.active) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    ref.current.scrollLeft = drag.current.scrollLeft - (x - drag.current.startX);
  }
  function onMouseUp() {
    drag.current.active = false;
    if (ref.current) ref.current.style.cursor = 'grab';
  }

  return (
    <div
      ref={ref}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', gap: '4px', padding: '14px 20px', cursor: 'grab', userSelect: 'none' }}
    >
      {/* 추천순 — 가장 앞 */}
      <div data-no-drag>
        <DropdownPill
          scrollRef={ref}
          label={filters.sort === 'monthly' ? '고정비순' : filters.sort === 'commute' ? '출퇴근순' : '추천순'}
          active
          value={filters.sort || 'score'}
          options={[
            { value: 'score',    label: '추천순' },
            { value: 'monthly',  label: '고정비순' },
            { value: 'commute',  label: '출퇴근순' },
          ]}
          onChange={(v) => setFilters({ ...filters, sort: v })}
        />
      </div>
      {/* 거래 유형 */}
      <div data-no-drag>
        <DropdownPill
          scrollRef={ref}
          label={filters.type === '전세만' ? '전세' : filters.type === '월세만' ? '월세' : '전·월세'}
          active={filters.type !== '전체'}
          value={filters.type}
          options={[
            { value: '전체',   label: '전·월세' },
            { value: '전세만', label: '전세만' },
            { value: '월세만', label: '월세만' },
          ]}
          onChange={(v) => setFilters({ ...filters, type: v })}
        />
      </div>
      {/* 층 유형 필터 */}
      <div data-no-drag>
        <DropdownPill
          scrollRef={ref}
          label={filters.floor === '전체' ? '모든 층' : filters.floor}
          active={filters.floor !== '전체'}
          value={filters.floor}
          options={[
            { value: '전체',   label: '모든 층' },
            { value: '일반',   label: '일반' },
            { value: '반지하', label: '반지하' },
            { value: '옥탑',   label: '옥탑' },
          ]}
          onChange={(v) => setFilters({ ...filters, floor: v })}
        />
      </div>
      {/* 대출 포함 여부 + 상품 선택 (하나의 드롭다운으로 통합) */}
      <div data-no-drag>
        <DropdownPill
          scrollRef={ref}
          label={!filters.loan ? '대출 미포함' : (LOAN_FILTER_LABELS[loanType] || loanType)}
          active={filters.loan}
          value={!filters.loan ? 'none' : loanType}
          options={[
            { value: 'none',      label: '대출 미포함' },
            { value: '버팀목',    label: LOAN_FILTER_LABELS['버팀목'] },
            { value: '청년버팀목', label: LOAN_FILTER_LABELS['청년버팀목'] },
            { value: '일반',      label: LOAN_FILTER_LABELS['일반'] },
          ]}
          onChange={(v) => {
            if (v === 'none') {
              setFilters({ ...filters, loan: false });
            } else {
              setFilters({ ...filters, loan: true });
              onLoanTypeChange(v);
            }
          }}
        />
      </div>
    </div>
  );
}
