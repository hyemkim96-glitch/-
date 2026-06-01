import '../styles/globals.css';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <title>집터 — 주거 추천</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css" />
        {process.env.NEXT_PUBLIC_KAKAO_MAP_KEY && (
          <script
            defer
            src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
          />
        )}
      </Head>
      {/*
        웹에서 볼 때: 모바일 비율(390×844) 고정 프레임을 뷰포트 중앙에 배치.
        실제 모바일 기기에서는 100vw×100dvh로 꽉 채움.
      */}
      <div style={{
        width: '100vw',
        height: '100dvh',
        background: '#DFE3E8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div className="phone-frame" style={{
          width: 'min(100vw, 390px)',
          height: 'min(100dvh, 844px)',
          background: 'var(--bg)',
          position: 'relative',
          boxShadow: '0 0 60px rgba(0,0,0,0.22)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* 자식(페이지)이 컨테이너 전체 높이를 채우도록 */}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <Component {...pageProps} />
          </div>
        </div>
      </div>
    </>
  );
}
