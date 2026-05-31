// pages/step1.jsx — 기본 정보 입력
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { getFormData, setFormData, getPrefsData, setPrefsData } from '../lib/storage';
import { formatKRW, Chip } from '../components/shared';
import { Button } from '../components/shared';
import { Screen, Footer, ProgressHead } from '../components/layout/Screen';
import { IconSearch, IconPin } from '../components/icons';

const addCommas = (s) => s.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// API 키 없을 때 보여줄 예시 장소
const FALLBACK_PLACES = [
  { name: '강남구 테헤란로 (역삼역)', lat: 37.5001, lng: 127.0365 },
  { name: '판교 카카오 아지트', lat: 37.3995, lng: 127.1077 },
  { name: '여의도 IFC 서울', lat: 37.5252, lng: 126.9244 },
  { name: '마포구 공덕역', lat: 37.5448, lng: 126.9517 },
  { name: '성동구 성수동', lat: 37.5445, lng: 127.0559 },
];

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

export default function Step1Page() {
  const router = useRouter();
  const [form, setFormLocal] = useState({ asset: '', income: '', work: '' });
  const [prefs, setPrefsLocal] = useState({ housing: '전월세', transport: '대중교통' });
  const [focus, setFocus] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isFallback, setIsFallback] = useState(false);
  const [apiError, setApiError] = useState(null);
  const debounceRef = useRef(null);
  // mousedown 중인지 추적 — blur보다 먼저 발생하므로 dropdown 닫힘 방지
  const selectingRef = useRef(false);

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

  async function fetchSuggestions(val) {
    try {
      const res = await fetch(`/api/address?q=${encodeURIComponent((val || '').trim() || '서울')}`);
      const data = await res.json();
      const docs = (data.documents || []).filter(Boolean);
      if (docs.length > 0) {
        setApiError(null);
        setSuggestions(docs.map((d) => ({
          name: d.place_name || d.address_name,
          address: d.place_name ? d.address_name : null,
          category: d.category_name ? d.category_name.split('>').pop().trim() : null,
          lat: parseFloat(d.y),
          lng: parseFloat(d.x),
        })));
        setIsFallback(false);
      } else {
        setApiError(data.error || data.errorType || null);
        const filtered = val && val.trim()
          ? FALLBACK_PLACES.filter((p) => p.name.includes(val.trim()))
          : FALLBACK_PLACES;
        setSuggestions(filtered.length > 0 ? filtered : FALLBACK_PLACES);
        setIsFallback(true);
      }
    } catch (e) {
      setApiError(e.message);
      setSuggestions(FALLBACK_PLACES);
      setIsFallback(true);
    }
  }

  function handleWorkChange(val) {
    updateForm({ work: val, workLat: null, workLng: null });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  }

  function handleWorkFocus() {
    setFocus(true);
    if (form.work && form.work.trim()) fetchSuggestions(form.work);
  }

  function handleWorkBlur() {
    // selectingRef가 true면 (드롭다운 항목 클릭/터치 중) blur 무시
    if (selectingRef.current) return;
    setTimeout(() => setFocus(false), 200);
  }

  function selectSuggestion(s) {
    selectingRef.current = false;
    updateForm({ work: s.name, workLat: s.lat, workLng: s.lng });
    setSuggestions([]);
    setFocus(false);
  }

  const filled = !!(form.asset && form.income && form.work && form.work.trim());

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
            <div style={{ marginTop: 9, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', display: 'flex' }}>
                <IconSearch size={20} />
              </span>
              <input
                value={form.work}
                placeholder="회사 이름 또는 주소 검색"
                onChange={(e) => handleWorkChange(e.target.value)}
                onFocus={handleWorkFocus}
                onBlur={handleWorkBlur}
                style={{ width: '100%', boxSizing: 'border-box', border: 'none', outline: 'none',
                  background: 'var(--surface)', borderRadius: 14, padding: '15px 16px 15px 46px',
                  fontSize: 16, fontWeight: 600, color: 'var(--ink)', fontFamily: 'inherit',
                  boxShadow: `inset 0 0 0 1.5px ${focus ? 'var(--accent)' : 'var(--line)'}` }}
              />
            </div>
            {focus && suggestions.length > 0 && (
              <div style={{ marginTop: 8, background: 'var(--surface)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.1), 0 0 0 1px var(--line)' }}>
                {isFallback && (
                  <div style={{ padding: '10px 16px 4px', fontSize: 12, fontWeight: 600, color: 'var(--ink-3)' }}>
                    {apiError ? `API 오류: ${apiError}` : '예시 장소 (API 키 설정 시 실검색 가능)'}
                  </div>
                )}
                {suggestions.map((s, i) => (
                  <div
                    key={s.name}
                    onMouseDown={(e) => { e.preventDefault(); selectingRef.current = true; }}
                    onMouseUp={(e) => { e.preventDefault(); selectSuggestion(s); }}
                    onTouchStart={() => { selectingRef.current = true; }}
                    onTouchEnd={(e) => { e.preventDefault(); selectSuggestion(s); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', cursor: 'pointer',
                      borderTop: i ? '1px solid var(--bg)' : 'none' }}
                  >
                    <span style={{ color: 'var(--ink-3)', display: 'flex', flexShrink: 0 }}><IconPin size={18} /></span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</span>
                        {s.category && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-weak)', padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap', flexShrink: 0 }}>{s.category}</span>}
                      </div>
                      {s.address && <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.address}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Screen>
  );
}
