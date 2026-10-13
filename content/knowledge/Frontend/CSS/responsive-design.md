---
title: "반응형 디자인과 다국어 타이포그래피"
concept: "Responsive Design"
summary: "뷰포트 메타 태그, 미디어 쿼리와 브레이크포인트, 모바일 퍼스트, 해상도와 기기 픽셀 비율, 상대 단위로 화면 크기에 맞추는 법. rem과 :lang()으로 언어마다 글자 크기를 바꾸는 다국어 반응형 타이포그래피까지 다룬다."
tags: ["css", "frontend", "mobile", "typography"]
source: mixed
date: "2026-10-13"
sources: ["https://spoqa.github.io/2016/06/03/localize-type-setting.html"]
---

반응형 디자인(Responsive Design)은 한 벌의 HTML·CSS가 휴대폰부터 큰 모니터까지 **어떤 화면에서도 읽기 좋게** 보이도록 만드는 방식이다. 「61가지 프론트엔드 용어」([[web-glossary|용어집]])의 Responsive Design·Breakpoint·Mobile-first·Resolution·Fold 항목을 보충했다.

## 출발점: 뷰포트 메타 태그

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

이 줄이 없으면 모바일 브라우저는 페이지를 약 980px 너비로 그린 뒤 축소한다. 미디어 쿼리도 기대대로 동작하지 않는다.

## 브레이크포인트와 미디어 쿼리

브레이크포인트(breakpoint)는 레이아웃이 바뀌는 화면 너비다. 미디어 쿼리로 구현한다.

```css
.cards { display: grid; grid-template-columns: 1fr; }          /* 기본: 모바일 */
@media (min-width: 768px)  { .cards { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .cards { grid-template-columns: repeat(3, 1fr); } }
```

- 기기 목록이 아니라 **콘텐츠가 깨지는 지점**에 브레이크포인트를 둔다. 기기는 계속 새로 나온다.
- 많이 쓰는 기준값은 Tailwind CSS 기본값(640·768·1024·1280·1536px)처럼 3~5개 정도다.
- 화면 전체가 아니라 **부모 너비**에 반응해야 하는 카드 같은 컴포넌트는 컨테이너 쿼리(`@container`)가 낫다.

## 모바일 퍼스트

모바일 퍼스트(Mobile-first)는 작은 화면용 스타일을 기본으로 쓰고, `min-width` 미디어 쿼리로 큰 화면 스타일을 **덧붙이는** 방식이다.

| | 모바일 퍼스트 (`min-width`) | 데스크톱 퍼스트 (`max-width`) |
| --- | --- | --- |
| 기본 스타일 | 한 열, 단순한 배치 | 여러 열, 복잡한 배치 |
| 모바일 기기의 부담 | 필요한 규칙만 적용한다 | 큰 화면 규칙을 받은 뒤 덮어쓴다 |
| 설계 효과 | 핵심 콘텐츠부터 우선순위를 정하게 된다 | 나중에 모바일에서 덜어 낼 것을 고르게 된다 |

## 해상도와 기기 픽셀 비율

- 해상도(resolution)는 화면이나 이미지의 픽셀 수다. CSS의 `px`는 물리 픽셀이 아니라 **CSS 픽셀**이다.
- 기기 픽셀 비율(DPR, `window.devicePixelRatio`)이 2인 화면은 CSS 1px을 물리 픽셀 2×2로 그린다. 그래서 같은 크기의 이미지가 흐려 보인다.
- `srcset`과 `sizes`로 화면에 맞는 이미지를 브라우저가 고르게 한다. 아이콘은 크기와 상관없이 선명한 SVG가 낫다.

```html
<img src="hero-800.jpg" srcset="hero-800.jpg 800w, hero-1600.jpg 1600w"
     sizes="(min-width: 1024px) 50vw, 100vw" alt="…" width="800" height="450" />
```

## 폴드(Fold)

폴드는 스크롤하지 않고 처음 보이는 영역의 경계다. 신문 1면의 접힌 선에서 온 말이다. 기기마다 높이가 달라 고정된 픽셀 값은 없다. 핵심 메시지와 행동 유도(CTA) 버튼을 첫 화면에 두되, 「첫 화면에 다 넣어야 한다」는 강박은 버린다. 사람들은 스크롤한다. 첫 화면의 큰 이미지는 [[web-vitals|LCP]]에 직접 영향을 준다.

## 상대 단위로 유연하게

| 단위·함수 | 쓰임 |
| --- | --- |
| `%`, `fr` | 부모나 그리드 안에서 비율로 나누기 |
| `rem` | 루트 글자 크기 기준. 사용자 글꼴 설정을 따른다 |
| `vw`, `vh`, `dvh` | 화면 크기 기준. 모바일 주소창 때문에 높이는 `dvh`가 안전하다 |
| `clamp(최소, 선호, 최대)` | 미디어 쿼리 없이 크기를 부드럽게. 예: `font-size: clamp(1rem, 2.5vw, 1.5rem)` |
| `max-width` + `width: 100%` | 큰 화면에서는 멈추고 작은 화면에서는 줄어드는 상자 |

## 다국어 반응형 타이포그래피

> 스포카 강영화의 「다국어 환경에 맞게 타이포그래피 세팅하기」(2016.06)를 요약·재구성했습니다.

반응형은 화면 크기만의 문제가 아니다. 같은 컴포넌트라도 **언어**에 따라 글자 너비가 다르다. 일본어 가나는 한글보다 넓은 경우가 많다. 그래서 너비가 좁은 태블릿 앱의 버튼과 카드에서 일본어 문구가 어색하게 줄바꿈됐다.

스포카의 해결은 **언어가 일본어일 때만 루트 글자 크기를 90%로 낮추는 것**이다. 모든 글자 크기를 `rem`으로 써 두면 루트 하나만 바꿔도 전체가 함께 줄어든다.

```scss
$base-font-size: 100%;

html { font-size: $base-font-size; }
html:lang(ja) { font-size: $base-font-size * 0.9; }   // 1rem = 14.4px

// px로 쓰던 값을 rem으로 바꾸는 믹스인
@mixin font-size($size) { font-size: ($size / 16) + rem; }
.title { @include font-size(16); }   // 한국어 16px, 일본어 14.4px
```

1. `<html lang="ja">`처럼 문서에 언어를 표시해야 `:lang()` 선택자가 동작한다.
2. 픽셀로 쓴 글자 크기를 믹스인으로 한 번에 `rem`으로 바꾼다. 하나씩 고치다 빠뜨리는 일을 막는다.
3. 한국어 본문에는 `body { word-break: keep-all; }`을 기본으로 둔다. 기본값 `normal`은 한글 단어 중간에서도 줄을 바꾼다.

**보충**: 요즘 Sass에서는 `/` 나눗셈이 폐기 예정이라 `math.div($size, 16)`을 쓴다. 독일어처럼 단어가 긴 언어는 줄바꿈보다 넘침이 문제다. `overflow-wrap: anywhere`나 `hyphens: auto`를 함께 검토한다.

## 정리

- 뷰포트 메타 태그, 모바일 퍼스트 `min-width` 쿼리, 상대 단위가 반응형의 세 기둥이다.
- 브레이크포인트는 기기가 아니라 콘텐츠가 깨지는 곳에 둔다.
- 글자 크기를 `rem`으로 통일해 두면 화면이나 언어에 따라 루트 하나로 조절할 수 있다.

관련 노트: [[css-basics|CSS 기초]], [[flexbox|Float와 Flexbox 레이아웃]], [[box-model|박스 모델과 display]], [[web-vitals|웹 성능 지표와 Lighthouse]], [[web-typography|웹 타이포그래피: 가독성, 글줄 길이, 웹폰트]], [[css-grid|CSS 그리드 레이아웃]]
