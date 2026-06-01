// pages/step1.jsx — 기본 정보 입력
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { getFormData, setFormData, getPrefsData, setPrefsData } from '../lib/storage';
import { formatKRW, Chip } from '../components/shared';
import { Button } from '../components/shared';
import { Screen, Footer, ProgressHead } from '../components/layout/Screen';
import { IconSearch, IconPin, IconClose, IconChevRight } from '../components/icons';

const addCommas = (s) => s.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');

function MoneyField({ label, placeholder, value, onChange }) {
  const formatted = addCommas(value);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <label style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-2)' }}>{label}</label>
        {value && <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-3)' }}>{formatKRW(value)}</span>}
      </div>
      <div style={{ marginTop: 9, position: 'relative' }}>
        <input inputMode="numeric" value={formatted} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
          style={{ width: '100%', boxSizing: 'border-box', border: 'none', outline: 'none',
            background: 'var(--surface)', borderRadius: 14, padding: '15px 50px 15px 16px',
            fontSize: 16, fontWeight: 600, color: 'var(--ink)', fontFamily: 'inherit',
            boxShadow: 'inset 0 0 0 1.5px var(--line)' }}
          onFocus={(e) => (e.target.style.boxShadow = 'inset 0 0 0 1.5px var(--accent)')}
          onBlur={(e) => (e.target.style.boxShadow = 'inset 0 0 0 1.5px var(--line)')}
        />
        <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 15, fontWeight: 600, color: 'var(--ink-3)' }}>만원</span>
      </div>
    </div>
  );
}

function OptionGroup({ title, children }) {
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 12 }}>{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>{children}</div>
    </div>
  );
}

// ── 직장 검색 전체화면 모달 ──────────────────────────────────────────
function WorkSearchModal({ onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  async function fetchSuggestions(val) {
    if (!val || !val.trim()) { setSuggestions([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/address?q=${encodeURIComponent(val.trim())}`);
      const data = await res.json();
      const docs = (data.documents || []).filter(Boolean);
      setSuggestions(docs.length > 0
        ? docs.map((d) => ({
            name: d.place_name || d.address_name,
            address: d.place_name ? d.address_name : null,
            category: d.category_name ? d.category_name.split('>').pop().trim() : null,
            lat: parseFloat(d.y),
            lng: parseFloat(d.x),
          }))
        : [{ noResult: true }]
      );
    } catch {
      setSuggestions([{ noResult: true }]);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(val) {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* 헤더 */}
      <div style={{ paddingTop: 50, padding: '50px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>직장 주소 검색</span>
          <button onClick={onClose} style={{ background: 'var(--line)', border: 'none', cursor: 'pointer', borderRadius: 999, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)' }}>
            <IconClose size={18} />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', display: 'flex' }}>
              <IconSearch size={20} />
            </span>
            <input
              ref={inputRef}
              value={query}
              placeholder="회사 이름 또는 주소 검색"
              onChange={(e) => handleChange(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', border: 'none', outline: 'none',
                background: 'var(--surface)', borderRadius: 14, padding: '15px 16px 15px 44px',
                fontSize: 16, fontWeight: 600, color: 'var(--ink)', fontFamily: 'inherit',
                boxShadow: 'inset 0 0 0 1.5px var(--accent)' }}
            />
            {query.length > 0 && (
              <button onClick={() => { setQuery(''); setSuggestions([]); inputRef.current?.focus(); }}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--ink-3)', display: 'flex' }}>
                <IconClose size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 결과 목록 */}
      <div style={{ flex: 1, overflowY: 'auto', marginTop: 12 }}>
        {loading && (
          <div style={{ padding: '20px', textAlign: 'center', fontSize: 14, color: 'var(--ink-3)' }}>검색 중...</div>
        )}
        {!loading && suggestions[0]?.noResult && (
          <div style={{ padding: '40px 20px', textAlign: 'center', fontSize: 15, fontWeight: 600, color: 'var(--ink-3)' }}>
            검색 결과가 없습니다.
          </div>
        )}
        {!loading && !suggestions[0]?.noResult && suggestions.map((s, i) => (
          <div
            key={s.name + i}
            onClick={() => onSelect(s)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', cursor: 'pointer',
              borderBottom: '1px solid var(--line)', background: 'var(--bg)' }}
          >
            <span style={{ color: 'var(--accent)', display: 'flex', flexShrink: 0 }}><IconPin size={20} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                {s.category && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-weak)', padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap', flexShrink: 0 }}>{s.category}</span>}
              </div>
              {s.address && <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.address}</div>}
            </div>
            <span style={{ color: 'var(--ink-3)', display: 'flex', flexShrink: 0 }}><IconChevRight size={16} /></span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Step1Page() {
  const router = useRouter();
  const [form, setFormLocal] = useState({ asset: '', income: '', work: '' });
  const [prefs, setPrefsLocal] = useState({ housing: '전월세', transport: '대중교통' });
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setFormLocal(getFormData());
    setPrefsLocal(getPrefsData());
  }, []);

  function updateForm(patch) {
    const next = { ...form, ...patch };
    setFormLocal(next);
    setFormData(next);
  }

  function updatePrefs(patch) {
    const next = { ...prefs, ...patch };
    setPrefsLocal(next);
    setPrefsData(next);
  }

  function handleSelect(s) {
    updateForm({ work: s.name, workLat: s.lat, workLng: s.lng });
    setSearchOpen(false);
  }

  const filled = !!(form.asset && form.income && form.work && form.work.trim() && form.workLat && form.workLng);

  function goToResults() {
    sessionStorage.setItem('zipter_new_search', '1');
    router.push('/results');
  }

  const header = <ProgressHead step={1} onBack={() => router.push('/')} />;
  const footer = (
    <Footer>
      <Button onClick={goToResults} disabled={!filled}>결과 보기</Button>
    </Footer>
  );

  return (
    <>
      <Screen header={header} footer={footer}>
        <div style={{ padding: '22px 20px 8px' }}>
          <h1 style={{ margin: '0 0 24px', fontSize: 24, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.3 }}>기본 정보를 입력해주세요</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <OptionGroup title="주거 형태">
              <Chip label="전월세" selected={prefs.housing === '전월세'} onClick={() => updatePrefs({ housing: '전월세' })} />
              <Chip label="전세만" selected={prefs.housing === '전세'} onClick={() => updatePrefs({ housing: '전세' })} />
              <Chip label="월세만" selected={prefs.housing === '월세'} onClick={() => updatePrefs({ housing: '월세' })} />
            </OptionGroup>
            <MoneyField label="보유 자산" placeholder="예: 5,000" value={form.asset} onChange={(v) => updateForm({ asset: v })} />
            <MoneyField label="월 소득 (세후)" placeholder="예: 320" value={form.income} onChange={(v) => updateForm({ income: v })} />
            <div>
              <label style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-2)' }}>직장 주소</label>
              <div style={{ marginTop: 9 }}
                onClick={() => setSearchOpen(true)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', borderRadius: 14,
                  padding: '15px 16px', cursor: 'pointer', boxShadow: 'inset 0 0 0 1.5px var(--line)' }}>
                  <span style={{ color: 'var(--ink-3)', display: 'flex', flexShrink: 0 }}><IconSearch size={20} /></span>
                  {form.work
                    ? <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', flex: 1 }}>{form.work}</span>
                    : <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink-3)', flex: 1 }}>회사 이름 또는 주소 검색</span>
                  }
                  {form.work && (
                    <button onClick={(e) => { e.stopPropagation(); updateForm({ work: '', workLat: null, workLng: null }); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--ink-3)', display: 'flex' }}>
                      <IconClose size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Screen>
      {searchOpen && (
        <WorkSearchModal
          onSelect={handleSelect}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </>
  );
}
