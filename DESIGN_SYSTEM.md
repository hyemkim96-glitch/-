# 직주근접 Design System

모바일 퍼스트 Next.js 앱 기준으로 정리한 디자인 토큰 및 컴포넌트 패턴.
다른 프로젝트 시작 시 `globals.css` 변수와 이 문서를 복사해 사용.

---

## Color Tokens

```css
:root {
  /* Background */
  --bg:           #F2F4F6;   /* 페이지 배경, 구분선 역할 배경 */
  --surface:      #FFFFFF;   /* 카드, 인풋, 모달 배경 */
  --line:         #E5E8EB;   /* 구분선, 비활성 인풋 테두리, 스켈레톤 */

  /* Text */
  --ink:          #2A313B;   /* 본문, 주요 텍스트 */
  --ink-2:        #4E5968;   /* 서브 텍스트, 라벨 */
  --ink-3:        #8B95A1;   /* 힌트, 플레이스홀더, 비활성 아이콘 */

  /* Primary */
  --accent:       #3182F6;   /* 주요 CTA, 링크, 포커스 테두리 */
  --accent-weak:  #EAF2FE;   /* 액센트 배경 (뱃지, 선택 상태) */
  --accent-press: #1B64DA;   /* 버튼 눌림 상태 */

  /* Semantic: Success */
  --good:         #15B97E;
  --good-weak:    #E3F7EF;

  /* Semantic: Warning */
  --mid:          #F59000;
  --mid-weak:     #FFF1DD;

  /* Shadow */
  --card-shadow:
    0 1px 2px rgba(23,31,40,0.045),
    0 4px 10px -2px rgba(23,31,40,0.05),
    0 16px 32px -12px rgba(23,31,40,0.09);
}
```

### 점수 색상 규칙

| 점수 | 색상 | 배경 |
|------|------|------|
| 85점 이상 | `--accent` | `--accent-weak` |
| 75~84점 | `--good` | `--good-weak` |
| 74점 이하 | `--mid` | `--mid-weak` |

---

## Typography

```
Font: Pretendard → -apple-system → Apple SD Gothic Neo → system-ui
Rendering: antialiased + optimizeLegibility
```

| 용도 | size | weight |
|------|------|--------|
| 페이지 타이틀 (h1) | 24px | 800 |
| 섹션 타이틀 | 20px | 800 |
| 카드 금액 | 17.5px | 800 |
| 본문 / 인풋 값 | 16px | 600 |
| 서브 라벨 | 14px | 700 |
| 보조 텍스트 | 13~13.5px | 600 |
| 캡션 / 뱃지 | 11~12px | 600~700 |

- `letter-spacing: -0.02em` — 타이틀에 적용
- `font-variant-numeric: tabular-nums` — 점수/숫자 표시

---

## Border Radius

| 값 | 용도 |
|----|------|
| `999px` | 칩, 토글, 원형 버튼, 점수 뱃지, 프로그레스 바 |
| `16px` | 결과 카드 |
| `14px` | 인풋, 드롭다운, 지도 컨테이너, 스탯 박스 |
| `12px` | 칩 (Chip 컴포넌트) |
| `10px` | 시설 칩 (FacilityChip) |
| `8px` | 타입 태그 (전세/월세), 스켈레톤 |
| `6px` | 작은 인라인 배지 |
| `20px 20px 0 0` | 바텀 시트 상단 |

---

## Spacing

| 용도 | 값 |
|------|----|
| 페이지 좌우 패딩 | `20px` |
| 페이지 상단 패딩 | `22px` |
| 카드 패딩 | `18px` |
| 인풋 패딩 | `15px 16px` (아이콘 있으면 좌 `46px`) |
| 섹션 간격 | `22~28px` |
| 카드 목록 gap | `8px` |
| 칩 gap | `4px` |

---

## Elevation & Shadow

```
카드:   var(--card-shadow)  — 3단 레이어 소프트 쉐도우
인풋:   inset 0 0 0 1.5px var(--line)         — 기본
        inset 0 0 0 1.5px var(--accent)        — 포커스 / 선택됨
드롭다운: 0 8px 24px rgba(0,0,0,0.14), 0 0 0 1px var(--line)
모달:   0 8px 24px rgba(0,0,0,0.1), 0 0 0 1px var(--line)
지도:   inset 0 0 0 1px var(--line)
```

---

## Animation

```css
/* 페이지 진입 */
@keyframes screenIn {
  from { transform: translateX(12px); opacity: 0.7; }
  to   { transform: translateX(0);    opacity: 1;   }
}

/* 오버레이 페이드 */
@keyframes fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* 바텀 시트 슬라이드업 */
@keyframes slideUp {
  from { transform: translateY(100%); }
  to   { transform: translateY(0);    }
}

/* 팝업 등장 */
@keyframes popIn {
  from { transform: translateY(8px); opacity: 0; }
  to   { transform: translateY(0);   opacity: 1; }
}

/* 스켈레톤 펄스 */
@keyframes skeletonPulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
```

| 용도 | duration | easing |
|------|----------|--------|
| 바텀 시트 | 280ms | `cubic-bezier(.2,.8,.2,1)` |
| 오버레이 페이드 | 200ms | `ease` |
| 버튼 hover/press | 60ms | `ease` |
| 칩 상태 변화 | 140ms | `ease` |
| 프로그레스 바 | 300ms | `ease` |

---

## Components

### Button

```
Primary   — bg: --accent, color: #fff, height: 54px, radius: 14, font: 17/700
Outline   — bg: --surface, color: --accent, border: inset 1.5px --accent
Ghost     — bg: transparent, color: --ink-3, height: 44px, font: 15/600
Disabled  — bg: --line, color: --ink-3
```

### Chip (선택 토글)

```
선택됨:   bg: --accent, color: #fff
미선택:   bg: --surface, color: --ink-2
비활성:   color: --ink-3, cursor: default
패딩: 11px 16px, radius: 12, font: 15/600
```

### DropdownPill (필터 칩)

```
항상 활성: bg: --accent (추천순 등 기본 선택)
비활성:   bg: --surface, color: --ink-2
패딩: 9px 13px, radius: 999, font: 13.5/600
드롭다운: position: fixed (뷰포트 기준 배치 — overflow 클리핑 방지)
```

### Input

```
border: none + outline: none
bg: --surface
shadow: inset 0 0 0 1.5px --line (기본) / --accent (포커스)
radius: 14, padding: 15px 16px, font: 16/600
아이콘 있을 때 padding-left: 46px
```

### Card

```
bg: --surface, radius: 16, padding: 18px
shadow: --card-shadow
cursor: pointer
```

### Bottom Sheet (ExpandedSheet)

```
position: fixed, inset: 0, z-index: 40
오버레이: rgba(15,20,28,0.45)
시트: left:0 right:0 bottom:0 (데스크탑: max-width 480px, margin: auto)
radius: 20px 20px 0 0
animation: slideUp 280ms
max-height: 90%
```

### Fullscreen Modal (검색)

```
position: fixed, inset: 0, z-index: 200
bg: --bg
타이틀: 20px/800 + 닫기버튼 오른쪽 끝
인풋: 상단 고정, 결과 목록 스크롤
```

### ScoreBadge

```
85+: --accent / --accent-weak
75~84: --good / --good-weak
~74: --mid / --mid-weak
padding: 4px 10px (small) / 7px 13px (big)
radius: 999, font: 15/700 (small) / 20/700 (big)
```

### Skeleton

```
bg: --line
animation: skeletonPulse 1.4s ease infinite
radius: 8
```

### Notice Banner

```
bg: --line, radius: 10
padding: 10px 14px, font: 13/600, color: --ink-3
강조 텍스트: --ink-2, fontWeight: 700
```

---

## Layout

### Screen 구조

```
height: 100vh, display: flex, flex-direction: column
├── Header (fixed, paddingTop: 50px for status bar)
├── Content (flex: 1, overflow-y: auto, -webkit-overflow-scrolling: touch)
└── Footer (fixed bottom, padding: 12px 20px 28px)
```

### 스크롤 처리

```
scrollbarWidth: none (Firefox)
::-webkit-scrollbar { display: none } (Chrome/Safari)
overscroll-behavior: none (body)
```

### 드롭다운 / 팝업 위치 계산

오버플로우 클리핑을 피하려면 `position: fixed` + `getBoundingClientRect()` 사용:

```js
const rect = btnRef.current.getBoundingClientRect();
setPos({ top: rect.bottom + 6, left: rect.left, width: rect.width });
```

---

## 모바일 UX 패턴

### 터치 vs 마우스 드롭다운 선택

blur 이벤트가 mousedown보다 먼저 발생해 드롭다운이 닫히는 문제 방지:

```js
const selectingRef = useRef(false);

onMouseDown={(e) => { e.preventDefault(); selectingRef.current = true; }}
onMouseUp={(e)   => { e.preventDefault(); selectSuggestion(s); }}
onTouchStart={() => { selectingRef.current = true; }}
onTouchEnd={(e)  => { e.preventDefault(); selectSuggestion(s); }}

function handleBlur() {
  if (selectingRef.current) return;
  setTimeout(() => setFocus(false), 200);
}
```

### 검색 인풋 → 전체화면 모달

드롭다운이 CTA 버튼에 가리는 경우, 인풋 클릭 시 전체화면 검색 모달로 전환:

```
trigger: 인풋처럼 생긴 버튼 (readOnly)
modal: position fixed, inset 0, z-index 200
자동 포커스: setTimeout(() => inputRef.current?.focus(), 80)
```

### 숫자 인풋

```
inputMode="numeric" — 모바일 숫자 키패드 호출
콤마 포맷: value.replace(/\D/g,'').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
저장값은 raw 숫자 문자열, 표시만 포맷팅
```

---

## 지도 패턴

### 동네 범위 표시

특정 주소 오해 방지 — 핀 대신 반경 원 사용:

```js
new kakao.maps.Circle({
  map,
  center: pos,
  radius: 400,            // 동 크기에 맞게 조절
  strokeWeight: 2,
  strokeColor: '#3182F6',
  strokeOpacity: 0.7,
  fillColor: '#3182F6',
  fillOpacity: 0.12,
});
// level: 4 (약 500m 반경 뷰)
```

### 결과 지도 핀

점수 색상 커스텀 오버레이:

```js
el.style.cssText = 'display:flex;align-items:center;gap:4px;padding:6px 10px;border-radius:999px;white-space:nowrap;background:#fff;font-weight:700;font-size:13px;box-shadow:0 3px 10px rgba(0,0,0,0.16);font-family:Pretendard,sans-serif;cursor:pointer;';
el.innerHTML = `${item.dong}<span style="color:${fg}">&nbsp;${item.score}점</span>`;
```

---

## 데이터 표시 규칙

| 상황 | 처리 |
|------|------|
| 실거래가 기반 시세 | "최근 3개월 실거래 **평균가**로, 실제 매물 가격과 다를 수 있습니다." 공지 |
| 출퇴근 추정값 | 숫자 뒤 `*` 표시 + 하단 캡션 |
| 시세 데이터 부족 | `--mid-weak` 배경 뱃지 "시세 데이터 부족" |
| 금액 포맷 | `억` 단위 분리: 16,500만원 → `1억 6,500만원` |
