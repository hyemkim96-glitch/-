// pages/index.jsx — 히스토리 화면
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getHistory, deleteHistory, setFormData, setPrefsData } from '../lib/storage';
import { formatKRW } from '../components/shared';
import { Button } from '../components/shared';
import { Screen, Footer } from '../components/layout/Screen';
import {
  IconHome, IconSearch, IconTrash, IconPlus, IconBuilding, IconWon,
  IconSubway, IconWallet,
} from '../components/icons';

function timeAgo(ts) {
  if (!ts) return '방금';
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  return `${Math.floor(hr / 24)}일 전`;
}

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
    setFormData({
      asset: String(h.asset).replace(/[^\d]/g, ''),
      income: h.income || '',
      work: h.work,
      workLat: h.workLat || null,
      workLng: h.workLng || null,
    });
    setPrefsData({ housing: h.housing === '매매' ? '전월세' : h.housing, homeType: '무관', transport: h.transport });
    router.push('/results');
  }

  function handleNew() {
    setFormData({ asset: '', income: '', work: '' });
    router.push('/step1');
  }

  const header = (
    <div style={{ paddingTop: 60, padding: '60px 20px 14px' }}>
      <h1 style={{ margin: 0, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.5px', lineHeight: '1.6', fontSize: '24px' }}>어디살까?</h1>
      {history.length > 0 && (
        <p style={{ fontSize: 14, color: 'var(--ink-3)', fontWeight: 500, lineHeight: '1.6', margin: '0px' }}>조건을 선택하면 최신 시세로 재조회합니다</p>
      )}
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
          <div style={{ padding: '4px 20px 32px' }}>
            <div style={{ fontSize: 30, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1.2 }}>
              퇴근하면<br />집이 가까운<br />동네
            </div>
            <p style={{ marginTop: 14, fontSize: 14.5, fontWeight: 500, color: 'var(--ink-3)', lineHeight: 1.65, margin: '14px 0 0' }}>
              직장·예산·교통수단 입력 한 번으로<br />딱 맞는 동네를 찾아드려요
            </p>
            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: <IconSubway size={18} />, label: '출퇴근 시간 최우선', desc: '직장에서 가까운 동네를 먼저 보여드려요' },
                { icon: <IconWon size={18} />,    label: '국토부 실거래가 기준', desc: '최근 3개월 실거래 평균가로 계산해요' },
                { icon: <IconWallet size={18} />, label: '예산 맞춤 추천', desc: '자산과 월급에 맞는 집만 골라드려요' },
              ].map((f) => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--surface)', borderRadius: 14, padding: '14px 16px', boxShadow: 'var(--card-shadow)' }}>
                  <div style={{ color: 'var(--accent)', display: 'flex', flexShrink: 0 }}>{f.icon}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{f.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-3)', marginTop: 2 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
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
                    <span style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 500 }}>{timeAgo(h.createdAt)}</span>
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
