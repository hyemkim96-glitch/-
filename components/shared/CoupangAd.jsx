// components/shared/CoupangAd.jsx
// 쿠팡 파트너스 다이내믹 배너. g.js(PartnersCoupang.G)는 document.currentScript에
// 의존해서 React에선 안 먹으므로, g.js가 만들어주는 widgets.html iframe을 직접 삽입.
// 결과/홈 카드 목록에 섞여도 어색하지 않게 ResultCard와 같은 카드 스타일 사용.
//
// variant="card"  → 300×250 캐러셀 (id 1023798). 홈 첫 화면, 결과 목록 인피드.
// variant="strip" → 320×50 가로 띠 (id 1023808). 결과 목록 하단 등 좁은 자리.
const UNITS = {
  card:  { id: 1023798, w: 300, h: 250 },
  strip: { id: 1023808, w: 320, h: 50 },
};

export function CoupangAd({ variant = 'card', index = 0 }) {
  const u = UNITS[variant] || UNITS.card;
  const src = `https://ads-partners.coupang.com/widgets.html?id=${u.id}&template=carousel&trackingCode=AF5912368&subId=&width=${u.w}&height=${u.h}&tsource=`;
  const iframe = (
    <iframe
      src={src}
      width={u.w}
      height={u.h}
      frameBorder="0"
      scrolling="no"
      referrerPolicy="unsafe-url"
      title="쿠팡 파트너스 추천 상품"
      style={{ border: 'none', display: 'block', maxWidth: '100%', borderRadius: variant === 'strip' ? 6 : 8 }}
    />
  );
  const notice = '이 광고는 쿠팡 파트너스 활동의 일환으로, 이에 따라 일정액의 수수료를 제공받습니다.';

  if (variant === 'strip') {
    // 홈 소개 카드 / 결과 카드와 같은 흰 카드 스타일로 감싸서 목록에 섞여도 자연스럽게
    return (
      <div style={{
        background: 'var(--surface)', borderRadius: 16, padding: '12px 14px',
        boxShadow: 'var(--card-shadow)', animation: 'fadeUp 0.4s ease both',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      }}>
        {iframe}
        <p style={{ margin: 0, fontSize: 10, color: 'var(--ink-3)', fontWeight: 500, textAlign: 'center', lineHeight: 1.4 }}>
          AD · {notice}
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 16, padding: 14,
      boxShadow: 'var(--card-shadow)', animation: 'fadeUp 0.35s ease both',
      animationDelay: `${Math.min(index, 7) * 0.055}s`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
    }}>
      <div style={{ alignSelf: 'stretch', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.03em', color: 'var(--ink-3)', background: 'var(--bg)', padding: '3px 6px', borderRadius: 5 }}>AD</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)' }}>쿠팡 파트너스</span>
      </div>
      {iframe}
      <p style={{ margin: 0, fontSize: 10.5, color: 'var(--ink-3)', fontWeight: 500, textAlign: 'center', lineHeight: 1.5 }}>
        {notice}
      </p>
    </div>
  );
}
