// components/layout/Screen.jsx

export function Screen({ header, footer, children, bg }) {
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: bg || 'var(--bg)' }}>
      {header}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {children}
      </div>
      {footer}
    </div>
  );
}

export function Footer({ children }) {
  return (
    <div style={{ padding: '12px 20px 30px', background: 'linear-gradient(to top, var(--bg) 72%, rgba(242,244,246,0))' }}>
      {children}
    </div>
  );
}

export function ProgressHead({ onBack }) {
  return (
    <div style={{ paddingTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '4px 16px 8px' }}>
        <button
          onClick={onBack}
          aria-label="back"
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex', color: 'var(--ink-2)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 5-7 7 7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function MapCanvas({ children, style }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: 'linear-gradient(160deg, #EAF0EC 0%, #E6ECF1 100%)', ...style }}>
      <div style={{ position: 'absolute', left: '-10%', right: '-10%', top: '40%', height: '20%', transform: 'rotate(-7deg)', background: 'linear-gradient(180deg, #CFE3F2, #BCD8EE)', opacity: 0.95 }} />
      <div style={{ position: 'absolute', left: '8%', top: '10%', width: '34%', height: '20%', borderRadius: 14, background: '#DCE7DD' }} />
      <div style={{ position: 'absolute', right: '10%', top: '64%', width: '30%', height: '22%', borderRadius: 14, background: '#DCE7DD' }} />
      <div style={{ position: 'absolute', left: '54%', top: '12%', width: '26%', height: '16%', borderRadius: 12, background: '#E3E7EC' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: '28%', height: 6, background: '#F3F5F7' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: '74%', height: 5, background: '#F3F5F7' }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '36%', width: 6, background: '#F3F5F7' }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '68%', width: 5, background: '#F3F5F7' }} />
      {children}
    </div>
  );
}
