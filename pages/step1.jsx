// pages/step1.jsx — 기본 정보 입력
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { getFormData, setFormData } from '../lib/storage';
import { formatKRW } from '../components/shared';
import { Button } from '../components/shared';
import { Screen, Footer, ProgressHead } from '../components/layout/Screen';
import { IconSearch, IconPin } from '../components/icons';

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

export default function Step1Page() {
  const router = useRouter();
  const [form, setFormLocal] = useState({ asset: '', income: '', work: '' });
  const [focus, setFocus] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const debounceRef = useRef(null);

  useEffect(() => {
    setFormLocal(getFormData());
  }, []);

  function updateForm(patch) {
    const next = { ...form, ...patch };
    setFormLocal(next);
    setFormData(next);
  }

  function handleWorkChange(val) {
    updateForm({ work: val });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length >= 2) {
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/address?q=${encodeURIComponent(val)}`);
          const data = await res.json();
          setSuggestions(
            (data.documents || []).map((d) => d.place_name || d.address_name)
          );
        } catch {
          setSuggestions([]);
        }
      }, 300);
    } else {
      setSuggestions([]);
    }
  }

  const fallbackSuggestions = ['강남구 테헤란로 152', '강남구 역삼동 강남파이낸스센터', '서초구 서초대로 396'];
  const displaySuggestions = suggestions.length > 0 ? suggestions : fallbackSuggestions;

  const filled = !!(form.asset && form.income && form.work && form.work.trim());

  const header = <ProgressHead step={1} onBack={() => router.push('/')} />;
  const footer = (
    <Footer>
      <Button onClick={() => router.push('/step2')} disabled={!filled}>다음 →</Button>
    </Footer>
  );

  return (
    <Screen header={header} footer={footer}>
      <div style={{ padding: '14px 20px 8px' }}>
        <h1 style={{ margin: '0 0 24px', fontSize: 23, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.3 }}>기본 정보를<br />입력해주세요</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
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
                onFocus={() => setFocus(true)}
                onBlur={() => setTimeout(() => setFocus(false), 150)}
                style={{ width: '100%', boxSizing: 'border-box', border: 'none', outline: 'none',
                  background: 'var(--surface)', borderRadius: 14, padding: '15px 16px 15px 46px',
                  fontSize: 16, fontWeight: 600, color: 'var(--ink)', fontFamily: 'inherit',
                  boxShadow: `inset 0 0 0 1.5px ${focus ? 'var(--accent)' : 'var(--line)'}` }}
              />
            </div>
            {focus && (
              <div style={{ marginTop: 8, background: 'var(--surface)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.1), 0 0 0 1px var(--line)' }}>
                {displaySuggestions.map((a, i) => (
                  <div key={a} onMouseDown={() => { updateForm({ work: a }); setFocus(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', cursor: 'pointer', borderTop: i ? '1px solid var(--bg)' : 'none' }}>
                    <span style={{ color: 'var(--ink-3)', display: 'flex' }}><IconPin size={18} /></span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{a}</span>
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
