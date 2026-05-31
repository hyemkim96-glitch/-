// screens-flow.jsx — Screen 1 (history), Step 1 (basic info), Step 2 (preferences)

function Screen({ header, footer, children, bg }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: bg || 'var(--bg)' }}>
      {header}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>{children}</div>
      {footer}
    </div>);

}

function Footer({ children }) {
  return (
    <div style={{ padding: '12px 20px 30px', background: 'linear-gradient(to top, var(--bg) 72%, rgba(242,244,246,0))' }}>
      {children}
    </div>);

}

function ProgressHead({ step, onBack }) {
  const pct = step === 1 ? 50 : 100;
  return (
    <div style={{ paddingTop: 50 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 16px 8px' }}>
        <button onClick={onBack} aria-label="back" style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex', color: 'var(--ink-2)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 5-7 7 7 7" /></svg>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 14 }}>
          <span style={{ color: 'var(--accent)' }}>{step}</span>
          <span style={{ color: 'var(--ink-3)' }}>/ 2</span>
        </div>
      </div>
      <div style={{ height: 4, background: 'var(--line)', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, background: 'var(--accent)', borderRadius: '0 4px 4px 0', transition: 'width .3s ease' }} />
      </div>
    </div>);

}

const addCommas = (s) => s.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// ── Screen 1: Search history ───────────────────────────────────────
function HistoryScreen({ history, onDelete, onRerun, onNew }) {
  const header =
  <div style={{ paddingTop: 60, padding: "60px 20px 14px" }}>
      <h1 style={{ margin: 0, fontWeight: 800, color: 'var(--ink)', letterSpacing: "-0.5px", lineHeight: "1.6", fontSize: "24px" }}>최근 검색</h1>
      <p style={{ fontSize: 14, color: 'var(--ink-3)', fontWeight: 500, lineHeight: "1.6", margin: "0px" }}>조건을 선택하면 최신 시세로 재조회합니다</p>
    </div>;

  const footer =
  <Footer>
      <Button variant="primary" onClick={onNew}><IconPlus size={20} /> 새로 검색하기</Button>
    </Footer>;

  return (
    <Screen header={header} footer={footer}>
      {history.length === 0 ?
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 40px', textAlign: 'center', transform: 'translateY(-24px)' }}>
        <div style={{ width: 96, height: 96, borderRadius: 28, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)',
          boxShadow: 'var(--card-shadow)' }}>
          <IconSearch size={42} />
        </div>
        <div style={{ marginTop: 24, fontSize: 18, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>아직 검색 내역이 없어요</div>
        <p style={{ marginTop: 9, fontSize: 14.5, fontWeight: 500, color: 'var(--ink-3)', lineHeight: 1.55 }}>검색하고 나에게 맞는<br />주거 정보를 받아보세요</p>
      </div> :

      <div style={{ padding: '4px 20px 8px', display: 'flex', flexDirection: 'column', gap: "8px" }}>
        {history.map((h) =>
        <div key={h.id} onClick={() => onRerun(h)}
        style={{ background: 'var(--surface)', cursor: 'pointer',
          boxShadow: 'var(--card-shadow)', borderRadius: "16px", padding: "16px" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--accent)', minWidth: 0 }}>
                <IconHome size={19} />
                <span style={{ fontSize: 16.5, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.region}</span>
                {h.count > 1 &&
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-3)', flexShrink: 0 }}>외 {h.count - 1}곳</span>
                }
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <span style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 500 }}>{h.ago}</span>
                <button onClick={(e) => {e.stopPropagation();onDelete(h.id);}}
              style={{ border: 'none', background: 'transparent', color: 'var(--ink-3)', cursor: 'pointer', padding: 4, display: 'flex', borderRadius: 8 }}>
                  <IconTrash size={18} />
                </button>
              </div>
            </div>
            <div style={{ marginTop: 13, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', background: 'var(--bg)', padding: '6px 11px 6px 9px', borderRadius: 999 }}>
                <span style={{ color: 'var(--ink-3)', display: 'flex' }}><IconBuilding size={14} /></span>{h.work.split(' ')[0]}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', background: 'var(--bg)', padding: '6px 11px 6px 9px', borderRadius: 999 }}>
                <span style={{ color: 'var(--ink-3)', display: 'flex' }}><IconWon size={14} /></span>{formatKRW(h.asset)}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', background: 'var(--bg)', padding: '6px 11px', borderRadius: 999 }}>{h.housing}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', background: 'var(--bg)', padding: '6px 11px', borderRadius: 999 }}>{h.transport}</span>
            </div>
          </div>
        )}
      </div>
      }
    </Screen>);

}

// ── Field with live formatted value ────────────────────────────────
function MoneyField({ label, placeholder, value, onChange }) {
  const formatted = addCommas(value);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <label style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-2)' }}>{label}</label>
        {value &&
        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-3)' }}>{formatKRW(value)}</span>
        }
      </div>
      <div style={{ marginTop: 9, position: 'relative' }}>
        <input inputMode="numeric" value={formatted} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
        style={{ width: '100%', boxSizing: 'border-box', border: 'none', outline: 'none',
          background: 'var(--surface)', borderRadius: 14, padding: '15px 50px 15px 16px',
          fontSize: 16, fontWeight: 600, color: 'var(--ink)', fontFamily: 'inherit',
          boxShadow: 'inset 0 0 0 1.5px var(--line)' }}
        onFocus={(e) => e.target.style.boxShadow = 'inset 0 0 0 1.5px var(--accent)'}
        onBlur={(e) => e.target.style.boxShadow = 'inset 0 0 0 1.5px var(--line)'} />
        <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 15, fontWeight: 600, color: 'var(--ink-3)' }}>만원</span>
      </div>
    </div>);

}

// ── Screen 2: Step 1 ───────────────────────────────────────────────
const ADDR_SUGGEST = ['강남구 테헤란로 152', '강남구 역삼동 강남파이낸스센터', '서초구 서초대로 396'];

function Step1Screen({ form, setForm, onNext, onBack }) {
  const [focus, setFocus] = React.useState(false);
  const filled = !!(form.asset && form.income && form.work && form.work.trim());
  const header = <ProgressHead step={1} onBack={onBack} />;
  const footer =
  <Footer><Button onClick={onNext} disabled={!filled}>다음 <IconArrowRight size={19} /></Button></Footer>;

  return (
    <Screen header={header} footer={footer}>
      <div style={{ padding: '14px 20px 8px' }}>
        <h1 style={{ margin: '0 0 24px', fontSize: 23, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.3 }}>기본 정보를<br />입력해주세요</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <MoneyField label="보유 자산" placeholder="예: 5,000" value={form.asset} onChange={(v) => setForm({ ...form, asset: v })} />
          <MoneyField label="월 소득 (세후)" placeholder="예: 320" value={form.income} onChange={(v) => setForm({ ...form, income: v })} />
          <div>
            <label style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-2)' }}>직장 주소</label>
            <div style={{ marginTop: 9, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', display: 'flex' }}><IconSearch size={20} /></span>
              <input value={form.work} placeholder="회사 이름 또는 주소 검색"
              onChange={(e) => setForm({ ...form, work: e.target.value })}
              onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 150)}
              style={{ width: '100%', boxSizing: 'border-box', border: 'none', outline: 'none',
                background: 'var(--surface)', borderRadius: 14, padding: '15px 16px 15px 46px',
                fontSize: 16, fontWeight: 600, color: 'var(--ink)', fontFamily: 'inherit',
                boxShadow: `inset 0 0 0 1.5px ${focus ? 'var(--accent)' : 'var(--line)'}` }} />
            </div>
            {focus &&
            <div style={{ marginTop: 8, background: 'var(--surface)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.1), 0 0 0 1px var(--line)' }}>
                {ADDR_SUGGEST.map((a, i) =>
              <div key={a} onMouseDown={() => {setForm({ ...form, work: a });setFocus(false);}}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', cursor: 'pointer',
                borderTop: i ? '1px solid var(--bg)' : 'none' }}>
                    <span style={{ color: 'var(--ink-3)', display: 'flex' }}><IconPin size={18} /></span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{a}</span>
                  </div>
              )}
              </div>
            }
          </div>
        </div>
      </div>
    </Screen>);

}

// ── Screen 3: Step 2 ───────────────────────────────────────────────
function OptionGroup({ title, children }) {
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 12 }}>{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: "4px" }}>{children}</div>
    </div>);

}

function Step2Screen({ prefs, setPrefs, onResult, onBack }) {
  const [tip, setTip] = React.useState(false);
  const header = <ProgressHead step={2} onBack={onBack} />;
  const footer =
  <Footer>
      <Button onClick={onResult}>결과 보기</Button>
    </Footer>;

  const set = (k, v) => setPrefs({ ...prefs, [k]: v });
  return (
    <Screen header={header} footer={footer}>
      <div style={{ padding: '14px 20px 8px' }}>
        <h1 style={{ margin: '0 0 26px', fontSize: 23, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.3 }}>조건을<br />설정해주세요</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <OptionGroup title="주거 형태">
            <Chip label="전월세" selected={prefs.housing === '전월세'} onClick={() => set('housing', '전월세')} />
            <div style={{ position: 'relative' }} data-comment-anchor="f9c4d7299d-div-185-13">
              <Chip label="매매" disabled trailing={
              <span onClick={(e) => {e.stopPropagation();setTip(!tip);}} style={{ display: 'flex', color: 'var(--ink-3)', marginLeft: 1 }}><IconInfo size={16} /></span>
              } />
              {tip &&
              <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap',
                background: 'var(--ink)', color: '#fff', fontSize: 12.5, fontWeight: 600, padding: '8px 12px', borderRadius: 10, zIndex: 5 }}>
                  2차 출시 예정
                  <span style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '6px solid var(--ink)' }} />
                </div>
              }
            </div>
          </OptionGroup>
          <OptionGroup title="선호 주거 유형">
            {['원룸', '투룸', '아파트', '무관'].map((o) =>
            <Chip key={o} label={o} selected={prefs.homeType === o} onClick={() => set('homeType', o)} />
            )}
          </OptionGroup>
          <OptionGroup title="이동 수단">
            <Chip label="대중교통" selected={prefs.transport === '대중교통'} onClick={() => set('transport', '대중교통')} />
            <Chip label="자가용" selected={prefs.transport === '자가용'} onClick={() => set('transport', '자가용')} />
          </OptionGroup>
        </div>
      </div>
    </Screen>);

}

Object.assign(window, { Screen, Footer, HistoryScreen, Step1Screen, Step2Screen, addCommas });
