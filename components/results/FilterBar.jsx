// components/results/FilterBar.jsx — 추천 결과 상단 필터 바 (정렬/거래유형/층/대출 토글)
import { useState, useEffect, useRef } from 'react';
import { IconChevDown } from '../icons';

// ── DropdownPill: 클릭 시 드롭다운 펼치는 필터 칩 ─────────────────
function DropdownPill({ label, active, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target) &&
          btnRef.current && !btnRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  function handleOpen() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, left: rect.left });
    }
    setOpen((o) => !o);
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
          minWidth: 120,
        }}>
          {options.map((opt, i) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '12px 16px', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 14, fontWeight: 600, textAlign: 'left',
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

// ── 토글 칩 (대출 포함 ON/OFF) ─────────────────────────────────────
function TogglePill({ label, on, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
      padding: '9px 13px', borderRadius: 999, border: 'none', cursor: 'pointer',
      fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap',
      background: on ? 'var(--accent)' : 'var(--surface)',
      color: on ? '#fff' : 'var(--ink-2)',
      transition: 'all .14s ease', WebkitTapHighlightColor: 'transparent',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: 999, background: on ? '#fff' : 'var(--ink-3)' }} />
      {label}
    </button>
  );
}

export function FilterBar({ filters, setFilters }) {
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
      {/* 대출 포함 토글 */}
      <TogglePill label="대출 포함" on={filters.loan} onClick={() => setFilters({ ...filters, loan: !filters.loan })} />
    </div>
  );
}
