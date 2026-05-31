// pages/index.jsx — 히스토리 화면
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getHistory, deleteHistory, setFormData, setPrefsData } from '../lib/storage';
import { formatKRW } from '../components/shared';
import { Button } from '../components/shared';
import { Screen, Footer } from '../components/layout/Screen';
import {
  IconHome, IconSearch, IconTrash, IconPlus, IconBuilding, IconWon,
} from '../components/icons';

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  function handleDelete(id) {
    const next = deleteHistory(id);
    setHistory((prev) => prev.filter((h) => h.id !== id));
  }

  function handleRerun(h) {
    setToast(true);
    setTimeout(() => setToast(false), 2500);
    setFormData({ asset: String(h.asset).replace(/[^\d]/g, ''), income: '', work: h.work });
    setPrefsData({ housing: h.housing === '매매' ? '전월세' : h.housing, homeType: '무관', transport: h.transport });
    sessionStorage.setItem('zipter_new_search', '1');
    router.push('/results');
  }

  function handleNew() {
    setFormData({ asset: '', income: '', work: '' });
    router.push('/step1');
  }

  const header = (
    <div style={{ paddingTop: 60, padding: '60px 20px 14px' }}>
      <h1 style={{ margin: 0, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.5px', lineHeight: '1.6', fontSize: '24px' }}>직주근접</h1>
      <p style={{ fontSize: 14, color: 'var(--ink-3)', fontWeight: 500, lineHeight: '1.6', margin: '0px' }}>조건을 선택하면 최신 시세로 재조회합니다</p>
    </div>
  );

  const footer = (
    <Footer>
      <Button variant="primary" onClick={handleNew}><IconPlus size={20} /> 새로 검색하기</Button>
    </Footer>
  );

  return (
    <>
      <Screen header={header} footer={footer}>
        {history.length === 0 ? (
          <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 40px', textAlign: 'center' }}>
            <div style={{ width: 96, height: 96, borderRadius: 28, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', boxShadow: 'var(--card-shadow)' }}>
              <IconSearch size={42} />
            </div>
            <div style={{ marginTop: 24, fontSize: 18, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>아직 검색 내역이 없어요</div>
            <p style={{ marginTop: 9, fontSize: 14.5, fontWeight: 500, color: 'var(--ink-3)', lineHeight: 1.55 }}>검색하고 나에게 맞는<br />주거 정보를 받아보세요</p>
          </div>
        ) : (
          <div style={{ padding: '4px 20px 8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.map((h) => (
              <div key={h.id} onClick={() => handleRerun(h)}
                style={{ background: 'var(--surface)', cursor: 'pointer', boxShadow: 'var(--card-shadow)', borderRadius: '16px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--accent)', minWidth: 0 }}>
                    <IconHome size={19} />
                    <span style={{ fontSize: 16.5, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.region}</span>
                    {h.count > 1 && <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-3)', flexShrink: 0 }}>외 {h.count - 1}곳</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 500 }}>{h.ago}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(h.id); }}
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
                    <span style={{ color: 'var(--ink-3)', display: 'flex' }}><IconWon size={14} /></span>
                    {h.depositMan
                      ? `${h.depositMan.toLocaleString()} / ${h.monthlyMan}만원`
                      : formatKRW(h.asset)}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', background: 'var(--bg)', padding: '6px 11px', borderRadius: 999 }}>{h.housing}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', background: 'var(--bg)', padding: '6px 11px', borderRadius: 999 }}>{h.transport}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Screen>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--ink)', color: '#fff', fontSize: 14, fontWeight: 600,
          padding: '12px 20px', borderRadius: 12, zIndex: 100, whiteSpace: 'nowrap',
          animation: 'popIn .2s ease',
        }}>
          최신 시세로 재조회합니다
        </div>
      )}
    </>
  );
}
