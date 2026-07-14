import '../styles/globals.css';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <title>집터 — 주거 추천</title>
        <meta name="description" content="직장 위치와 예산만 입력하면 국토부 실거래가 데이터 기반으로 출퇴근하기 좋고 예산에 맞는 동네를 추천해드려요." />
        {/* 카카오톡·슬랙 등에 링크 공유 시 미리보기 카드로 쓰임 */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="집터 — 주거 추천" />
        <meta property="og:description" content="직장 위치와 예산만 입력하면 출퇴근하기 좋은 우리 동네를 찾아드려요." />
        <meta property="og:image" content="https://housingnearcompany.vercel.app/og-image.png" />
        <meta property="og:url" content="https://housingnearcompany.vercel.app" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="집터 — 주거 추천" />
        <meta name="twitter:description" content="직장 위치와 예산만 입력하면 출퇴근하기 좋은 우리 동네를 찾아드려요." />
        <meta name="twitter:image" content="https://housingnearcompany.vercel.app/og-image.png" />
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
