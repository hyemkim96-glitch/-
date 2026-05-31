// app.jsx — state, navigation, tweaks, phone-scaling stage

const ACCENTS = {
  blue:   { accent: '#3182F6', weak: '#EAF2FE', press: '#1B64DA' },
  green:  { accent: '#1FB97A', weak: '#E4F7EF', press: '#149A63' },
  indigo: { accent: '#5B5BD6', weak: '#ECECFB', press: '#4848B8' },
  coral:  { accent: '#FF6B3D', weak: '#FFEDE6', press: '#E8552A' },
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "blue",
  "scoreStyle": "graded"
}/*EDITMODE-END*/;

const SEED_HISTORY = [
  { id: 'h1', region: '마포구 합정동', count: 5, work: '강남구 테헤란로', asset: '5000', housing: '전월세', transport: '대중교통', ago: '2일 전' },
  { id: 'h2', region: '성북구 길음동', count: 4, work: '중구 을지로', asset: '3500', housing: '전월세', transport: '대중교통', ago: '5일 전' },
  { id: 'h3', region: '광진구 자양동', count: 6, work: '성동구 성수동', asset: '15000', housing: '전월세', transport: '자가용', ago: '2주 전' },
];

function useScale() {
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    const fit = () => {
      const w = window.innerWidth, h = window.innerHeight;
      if (!w || !h) return;
      const s = Math.min(w / 402, h / 874) * 0.97;
      if (s > 0.05) setScale(s);
    };
    fit();
    requestAnimationFrame(fit);
    window.addEventListener('resize', fit);
    let ro;
    try { ro = new ResizeObserver(fit); ro.observe(document.documentElement); } catch (e) {}
    return () => { window.removeEventListener('resize', fit); ro && ro.disconnect(); };
  }, []);
  return scale;
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = React.useState('history');
  const [history, setHistory] = React.useState(SEED_HISTORY);
  const [form, setForm] = React.useState({ asset: '', income: '', work: '' });
  const [prefs, setPrefs] = React.useState({ housing: '전월세', homeType: '무관', transport: '대중교통' });
  const [filters, setFilters] = React.useState({ type: '전체', home: '무관', loan: false });
  const [expanded, setExpanded] = React.useState(null);
  const scale = useScale();

  const ac = ACCENTS[t.accent] || ACCENTS.blue;
  window.__scoreStyle = t.scoreStyle;

  const go = (s) => { setScreen(s); };

  let body;
  if (screen === 'history') {
    body = <HistoryScreen history={history}
      onDelete={(id) => setHistory(history.filter((h) => h.id !== id))}
      onRerun={(h) => {
        setForm({ asset: String(h.asset).replace(/[^\d]/g, ''), income: '', work: h.work });
        setPrefs({ housing: h.housing === '매매' ? '전월세' : h.housing, homeType: '무관', transport: h.transport });
        go('results');
      }} onNew={() => { setForm({ asset: '', income: '', work: '' }); go('step1'); }} />;
  } else if (screen === 'step1') {
    body = <Step1Screen form={form} setForm={setForm} onBack={() => go('history')} onNext={() => go('step2')} />;
  } else if (screen === 'step2') {
    body = <Step2Screen prefs={prefs} setPrefs={setPrefs} onBack={() => go('step1')} onResult={() => go('results')} />;
  } else if (screen === 'results') {
    body = <ResultsScreen filters={filters} setFilters={setFilters} onBack={() => go('history')}
      onExpand={(it) => setExpanded(it)} onMap={() => go('map')} form={form} prefs={prefs} />;
  } else if (screen === 'map') {
    body = <MapScreen onList={() => go('results')} onExpand={(it) => setExpanded(it)} />;
  }

  return (
    <TweakCtx.Provider value={{ scoreStyle: t.scoreStyle }}>
      <div style={{
        '--accent': ac.accent, '--accent-weak': ac.weak, '--accent-press': ac.press,
        width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(120% 120% at 50% 0%, #EEF1F4 0%, #DFE3E8 100%)', overflow: 'hidden',
      }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
          <IOSDevice>
            <div key={screen} style={{ height: '100%', animation: 'screenIn .26s ease' }}>{body}</div>
            {expanded && <ExpandedSheet item={expanded} onClose={() => setExpanded(null)} />}
          </IOSDevice>
        </div>

        <TweaksPanel>
          <TweakSection label="테마" />
          <TweakColor label="강조 색상" value={ac.accent}
            options={[ACCENTS.blue.accent, ACCENTS.green.accent, ACCENTS.indigo.accent, ACCENTS.coral.accent]}
            onChange={(v) => setTweak('accent', Object.keys(ACCENTS).find((k) => ACCENTS[k].accent === v) || 'blue')} />
          <TweakSection label="추천 점수" />
          <TweakRadio label="점수 표시" value={t.scoreStyle} options={['graded', 'plain']}
            onChange={(v) => setTweak('scoreStyle', v)} />
        </TweaksPanel>
      </div>
    </TweakCtx.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
