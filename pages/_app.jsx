import '../styles/globals.css';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
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
      {/* 웹에서 볼 때 모바일 사이즈(430px)로 센터 정렬 */}
      <div style={{
        minHeight: '100vh',
        background: '#DFE3E8',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 430,
          minHeight: '100vh',
          background: 'var(--bg)',
          position: 'relative',
          boxShadow: '0 0 60px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        }}>
          <Component {...pageProps} />
        </div>
      </div>
    </>
  );
}
