// pages/step2.jsx — 조건 설정
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getPrefsData, setPrefsData } from '../lib/storage';
import { Button, Chip } from '../components/shared';
import { Screen, Footer, ProgressHead } from '../components/layout/Screen';
import { IconInfo } from '../components/icons';

function OptionGroup({ title, children }) {
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 12 }}>{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>{children}</div>
    </div>
  );
}

export default function Step2Page() {
  const router = useRouter();
  const [prefs, setPrefsLocal] = useState({ housing: '전월세', homeType: '무관', transport: '대중교통' });
  const [tip, setTip] = useState(false);

  useEffect(() => {
    setPrefsLocal(getPrefsData());
  }, []);

  function set(k, v) {
    const next = { ...prefs, [k]: v };
    setPrefsLocal(next);
    setPrefsData(next);
  }

  function goToResults() {
    // 실제 검색 시작 표시 — results에서 이 플래그가 있을 때만 히스토리 저장
    sessionStorage.setItem('zipter_new_search', '1');
    router.push('/results');
  }

  const header = <ProgressHead step={2} onBack={() => router.push('/step1')} />;
  const footer = (
    <Footer>
      <Button onClick={goToResults}>결과 보기</Button>
      <div style={{ marginTop: 8, textAlign: 'center' }}>
        <button onClick={goToResults}
          style={{ background: 'none', border: 'none', fontSize: 14, fontWeight: 600, color: 'var(--ink-3)', cursor: 'pointer', padding: '8px 16px' }}>
          바로 결과 보기 (기본 조건으로)
        </button>
      </div>
    </Footer>
  );

  return (
    <Screen header={header} footer={footer}>
      <div style={{ padding: '22px 20px 8px' }}>
        <h1 style={{ margin: '0 0 26px', fontSize: 23, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.3 }}>조건을 설정해주세요</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <OptionGroup title="주거 형태">
            <Chip label="전월세" selected={prefs.housing === '전월세'} onClick={() => set('housing', '전월세')} />
            <div style={{ position: 'relative' }}>
              <Chip label="매매" disabled trailing={
                <span onClick={(e) => { e.stopPropagation(); setTip(!tip); }} style={{ display: 'flex', color: 'var(--ink-3)', marginLeft: 1 }}>
                  <IconInfo size={16} />
                </span>
              } />
              {tip && (
                <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap',
                  background: 'var(--ink)', color: '#fff', fontSize: 12.5, fontWeight: 600, padding: '8px 12px', borderRadius: 10, zIndex: 5 }}>
                  2차 출시 예정
                  <span style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0,
                    borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '6px solid var(--ink)' }} />
                </div>
              )}
            </div>
          </OptionGroup>
          <OptionGroup title="선호 주거 유형">
            {['원룸', '투룸', '아파트', '무관'].map((o) => (
              <Chip key={o} label={o} selected={prefs.homeType === o} onClick={() => set('homeType', o)} />
            ))}
          </OptionGroup>
          <OptionGroup title="이동 수단">
            <Chip label="대중교통" selected={prefs.transport === '대중교통'} onClick={() => set('transport', '대중교통')} />
            <Chip label="자가용" selected={prefs.transport === '자가용'} onClick={() => set('transport', '자가용')} />
          </OptionGroup>
        </div>
      </div>
    </Screen>
  );
}
