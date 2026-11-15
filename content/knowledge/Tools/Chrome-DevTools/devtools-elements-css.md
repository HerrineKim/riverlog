---
title: "DevTools로 DOM과 CSS 다루기"
concept: "DevTools Elements & Styles"
summary: "Elements 패널에서 DOM을 고르고 고치는 법, 스타일 창의 취소선·흐림·경고 표시로 CSS가 안 먹는 이유를 읽는 법, 상태 강제(:hov)·색상 선택기·Flex/Grid/컨테이너 오버레이·애니메이션 패널로 레이아웃과 움직임을 디버깅하는 법, CSS 개요·자동 완성 패널, 접근성 트리·대비·포커스 검사까지 정리한다."
tags: ["devtools", "tools", "css", "debugging", "accessibility", "frontend"]
source: other
date: "2026-10-15"
sources: ["https://developer.chrome.com/docs/devtools/elements", "https://developer.chrome.com/docs/devtools/elements/badges", "https://developer.chrome.com/docs/devtools/dom", "https://developer.chrome.com/docs/devtools/dom/properties", "https://developer.chrome.com/docs/devtools/css", "https://developer.chrome.com/docs/devtools/css/reference", "https://developer.chrome.com/docs/devtools/css/issues", "https://developer.chrome.com/docs/devtools/css/color", "https://developer.chrome.com/docs/devtools/css/flexbox", "https://developer.chrome.com/docs/devtools/css/grid", "https://developer.chrome.com/docs/devtools/css/container-queries", "https://developer.chrome.com/docs/devtools/css/animations", "https://developer.chrome.com/docs/devtools/css-overview", "https://developer.chrome.com/docs/devtools/changes", "https://developer.chrome.com/docs/devtools/autofill", "https://developer.chrome.com/docs/devtools/accessibility/reference", "https://developer.chrome.com/docs/devtools/accessibility/contrast", "https://developer.chrome.com/docs/devtools/accessibility/focus", "https://developer.chrome.com/docs/devtools/accessibility/navigation"]
---

> Chrome for Developers의 「[Chrome DevTools 문서](https://developer.chrome.com/docs/devtools?hl=ko)」를 바탕으로 재구성한 노트다.

## Elements 패널 한눈에 보기

Elements 패널은 **지금 살아 있는 DOM**을 보여 준다. HTML 소스가 아니라 JavaScript가 바꾼 뒤의 상태다(차이는 [[dom|DOM과 BOM]]). 왼쪽 DOM 트리에서 노드를 고르면 오른쪽 탭들이 그 노드 하나에 대해 답한다.

| 탭 | 답하는 질문 |
| --- | --- |
| 스타일(Styles) | 어떤 규칙이 어디서 왔고, 어느 것이 이기고 졌나 |
| 계산됨(Computed) | 결국 렌더링에 쓰인 최종 값은 무엇인가 |
| 레이아웃(Layout) | 페이지의 Grid·Flexbox 오버레이를 어떻게 켜고 칠할까 |
| 이벤트 리스너 | 어떤 리스너가 붙어 있고 소스는 어디인가 |
| DOM 중단점 | 이 노드가 바뀔 때 멈추는 중단점 목록 |
| 속성(Properties) | DOM 객체의 자체·상속 속성 |
| 접근성 | 접근성 트리, ARIA 속성, 계산된 접근성 속성 |

## 요소 고르기와 DOM 고치기

**고르기**: 페이지에서 우클릭 → 검사, 요소 선택 버튼(`Cmd+Shift+C` / `Ctrl+Shift+C`) 뒤 클릭, 콘솔 결과를 우클릭 → 요소 패널에서 표시. DOM 트리는 화살표 키로 이동한다(←·→ 접기·펼치기, ↑·↓ 형제·부모 이동). `Cmd+F` / `Ctrl+F`는 문자열·CSS 선택자·XPath로 트리를 검색한다.

| 하려는 일 | 방법 |
| --- | --- |
| 텍스트·속성·태그 수정 | 해당 부분 더블클릭. 키보드로는 `Enter` 후 `Tab`으로 이동 |
| 마크업 통째로 수정 | 우클릭 → HTML로 수정, `Cmd/Ctrl+Enter`로 적용 |
| 복제 · 순서 바꾸기 | 우클릭 → 요소 복제(`Shift+Option/Alt+↓`) · 노드를 드래그 |
| 숨기기 · 삭제 | `H`(다시 누르면 복원) · `Delete`, 실행 취소는 `Cmd/Ctrl+Z` |
| 화면 밖 노드로 이동 | 우클릭 → Scroll into view |
| 노드만 캡처 | 우클릭 → Capture node screenshot |
| 크기 재기 | 명령 메뉴 → Show rulers on hover |
| 테스트용 선택자 얻기 | 우클릭 → Copy → Copy JS Path (`document.querySelector(...)` 식) |

선택한 노드 옆의 `== $0`은 콘솔에서 `$0`으로 그 노드를 참조할 수 있다는 뜻이다. 여러 번 쓸 노드는 우클릭 → 전역 변수로 저장(`temp1`). 콘솔 쪽 활용은 [[devtools-console|DevTools Console 활용]], DOM이 바뀌는 순간 멈추는 중단점은 [[devtools-debugging|DevTools로 JavaScript 디버깅하기]]에 있다.

**속성 탭**은 굵은 글씨가 자체 속성, 일반 글씨가 프로토타입 체인에서 상속된 속성이다. `[[Prototype]]`을 따라 펼치면 상속 속성의 출처가 나온다. `null`·`undefined` 값까지 보려면 모두 표시를 켠다.

## 스타일 창 읽기: 이 CSS는 왜 안 먹나

새 CSS가 적용되지 않으면 먼저 요소를 검사해 **스타일 창에 규칙이 보이는지, 어떻게 표시되는지** 본다. 우선순위·캐스케이드 개념은 [[selectors|CSS 선택자와 우선순위]]와 [[how-css-works|CSS가 동작하는 방식]]의 몫이다.

| 표시 | 뜻 | 할 일 |
| --- | --- | --- |
| 선택자가 흐림 | 이 요소에 맞지 않는 선택자 | 선택자 오타·구조 확인 |
| 취소선 + 경고 아이콘 | 속성 이름이 틀림(선언 전체) 또는 값이 틀림(값만) | 철자·값 문법 수정 |
| 취소선만 | 캐스케이드에서 다른 선언에 짐 | 이긴 선언을 찾는다(계산됨 탭) |
| 흐림 + 정보 아이콘 | 유효하지만 다른 속성 때문에 효과 없음(비활성) | 아이콘에 마우스를 올려 힌트를 본다. 예: `display: block`이면 `justify-content`가 무효 |
| `Inherited from …` 안의 흐린 속성 | 원래 상속되지 않는 속성 | 비활성과 달리 아이콘이 없다 |
| 기울임꼴 | 수정 불가(user agent 스타일시트, `height=` 같은 HTML 속성) | HTML 속성은 DOM 트리에서 고친다 |
| 약식 속성 옆 펼침 | 약식에 포함된 개별 속성 목록 | 어느 개별 속성이 덮였는지 확인 |

- **계산됨 탭**은 실제 적용된 값만 알파벳순으로 보여 준다. 펼치면 출처가 나오고 **캐스케이드 승자가 맨 위**다. 흐린 값은 런타임에 계산된 값(예: 부모 기준 `width`)이다. 모두 표시를 켜면 상속되지 않는 속성의 초깃값과 `--변수`까지 나오고, 그룹화로 범주별로 접는다.
- **필터 상자**(스타일·계산됨 공통)에 속성 이름을 치면 같은 속성의 중복 선언을 한 번에 본다.
- **마우스를 올리면** 속성 설명(MDN 링크), 선택자의 특정성 값, `--변수`의 현재 값이 도움말로 뜬다.
- **링크**: 규칙 옆 파일명은 Sources 패널로, `var()`는 변수 선언으로, `animation`은 `@keyframes`로 이동한다.
- `@property`, `@supports`, `@scope`, `@font-palette-values`, `@position-try`는 스타일 창에 전용 섹션으로 나오고, 더블클릭으로 고친다. 캐스케이드 레이어는 레이어 이름이나 레이어 보기 버튼으로 순서를 확인한다.

## 스타일 바꿔 보기

| 하려는 일 | 방법 |
| --- | --- |
| 이 요소에만 선언 추가 | `element.style` 중괄호 안 클릭 → 속성 → 값. 인라인이라 특정성이 높아 대부분 바로 적용된다 |
| 기존 규칙에 추가 | 그 규칙의 중괄호 안 클릭 |
| 새 규칙 | 새 스타일 규칙(+) 버튼. 길게 누르면 넣을 스타일시트를 고른다 |
| 클래스 붙였다 떼기 | `.cls` → 클래스 입력, 체크박스로 켜고 끔 |
| 선언 하나 끄기 | 선언 옆 체크박스 |
| 숫자 값 조절 | 값 편집 중 `↑`·`↓` 1씩(−1~1 사이면 0.1), `Option/Alt` 0.1, `Shift` 10, `Shift+Cmd` / `Ctrl+Shift+PageUp` 100 |
| 박스 모델 조절 | 사이드바 표시 버튼 → 다이어그램의 값 더블클릭 |

**상태 강제**: `:hov`를 눌러 `:hover`, `:active`, `:focus`, `:focus-within`, `:focus-visible`, `:target`을 켠다. DOM 트리에서 우클릭 → Force state도 같다. 드롭다운·날짜 선택기처럼 페이지가 포커스를 잃으면 사라지는 요소는 같은 메뉴의 **포커스된 페이지 에뮬레이션**으로 붙잡는다. 같은 줄의 렌더링 에뮬레이션 버튼은 `prefers-color-scheme: light/dark`와 자동 어두운 모드를 바로 켠다(다른 미디어 기능은 [[devtools-device-emulation|DevTools로 기기·환경 에뮬레이션하기]]).

**시각 편집기**는 값 옆 아이콘을 눌러 연다.

| 편집기 | 대상 | 쓰임 |
| --- | --- | --- |
| 색상 선택기 | `color`, `*-color` | 아래 절 참고 |
| 각도 시계 | `transform`·`background`의 `<angle>` | 원을 클릭하거나 스크롤로 1씩 |
| 그림자 편집기 | `box-shadow`, `text-shadow` | inset/outset, 오프셋, 흐림, 확산 |
| 이징 편집기 | `transition`·`animation-timing-function` | 키워드·`cubic-bezier`·`linear()` 프리셋, 제어점 드래그 |
| Flexbox·Grid 편집기 | `display: flex` / `grid` | `justify-*`·`align-*`를 버튼으로 |

**바꾼 것 가져가기**: 선언을 우클릭하면 선언·규칙·값을 복사하거나 **JS 문법(camelCase)으로 복사**할 수 있다(CSS-in-JS용). 모든 CSS 변경사항 복사도 있다. 명령 메뉴의 Show Changes(변경사항 패널)는 이번 세션의 수정을 파일별 diff로 보여 주고, 복사·되돌리기를 한다. 새로고침하면 사라지므로 남기려면 로컬 재정의나 작업공간(Workspaces)을 쓴다.

## 색상 선택기

색 미리보기 사각형을 누르면 열린다. `Shift`+클릭은 색 공간 목록을 바로 연다.

- **색 공간 변환**: hex·`rgb`·`hsl`·`hwb`와 `lch`·`oklch`·`lab`·`oklab`·`color()` 사이를 바꾸면 값을 자동 변환한다. HD 색을 좁은 공간으로 바꾸면 잘린(clipped) 값에 경고가 붙고, 마우스를 올리면 원래 값이 보인다. 색역 경계선이 HD와 비HD를 가른다.
- **스포이트**: 버튼이나 `C`로 켜고 화면 어디서든 색을 집는다. sRGB만 집는다.
- **팔레트**: Material, 사용자 지정, 페이지의 CSS 변수, 페이지에서 쓰인 색을 오간다. 변수 설계는 [[css-color-variables|CSS 커스텀 속성으로 색상 체계 짜기]].
- **대비율**: `color` 값에만 있다(배경색 대비로 계산). 아래 접근성 절에서 쓴다.

## 레이아웃 오버레이와 배지

DOM 트리의 요소 옆 **배지**가 그 요소의 성격을 알려 주고, 누르면 오버레이를 켠다. 어떤 배지를 볼지는 우클릭 → 배지 설정에서 고른다.

| 배지 | 붙는 조건 | 누르면 |
| --- | --- | --- |
| `grid` / `subgrid` | `display: grid`, 트랙이 `subgrid` | 선·번호·간격 오버레이 |
| `flex` | `display: flex` | 항목 위치 오버레이 |
| `container` | `container-type` 있음 | 컨테이너와 자식 오버레이 |
| `scroll` / `scroll-snap` | 스크롤 컨테이너 / 스냅 설정 | 스냅 지점 오버레이 |
| `top-layer (N)` / `popover` | `showModal()`한 `<dialog>`, `popover` | `</html>` 뒤 `#top-layer`로 이동(`reveal`로 복귀) |
| `starting-style` | `@starting-style` 있음 | 시작 스타일을 켜서 등장 애니메이션 확인 |
| `slot`, `custom-element`, `ad`, `media` | 슬롯 콘텐츠, 사용자 정의 요소, 광고 프레임, 미디어 요소 | 해당 슬롯·코드·패널로 이동 |

- **Flexbox**: 편집기 아이콘은 `flex-direction`에 맞춰 회전한다. 레이아웃 탭의 Flexbox 섹션에서 페이지의 모든 flex 컨테이너 오버레이를 켜고 색을 바꾼다. 개념은 [[flexbox|Float와 Flexbox 레이아웃]].
- **Grid**: 레이아웃 탭에서 줄 번호·줄 이름 표시, **트랙 크기**(`작성 크기 - 계산 크기`, 예 `1fr - 96.66px`), 영역 이름, 그리드 선 확장을 켠다. 여러 그리드를 색을 달리해 동시에 볼 수 있다. 개념은 [[css-grid|CSS 그리드 레이아웃]].
- **컨테이너 쿼리**: 조건을 만족할 때만 자식 요소의 스타일 창에 `@container` 규칙이 나온다. 규칙 위 컨테이너 이름에 마우스를 올리면 질의된 속성의 현재 값이 보이고, 클릭하면 컨테이너로 이동한다. 조건 값을 직접 고쳐 경계를 시험한다. 개념은 [[responsive-design|반응형 디자인과 다국어 타이포그래피]].

## 애니메이션 검사

명령 메뉴의 Show Animations로 서랍에 **애니메이션 패널**을 연다. 열려 있는 동안 일어난 CSS 애니메이션·트랜지션, Web Animations, View Transitions를 시작 시각 기준으로 묶어 캡처한다. `requestAnimationFrame` 애니메이션은 잡지 않는다. 로드 시 애니메이션은 패널을 연 채 새로고침한다.

- **재생**: 썸네일에 마우스를 올려 미리 보고, 빨간 재생 헤드를 끌어 한 프레임씩 넘기고, 속도를 낮춰 본다.
- **수정**: 양 끝 원을 끌어 길이, 안쪽 흰 원을 끌어 키프레임 시점, 막대를 끌어 지연을 바꾼다. 결과는 인라인 스타일로 들어간다.
- **`@keyframes` 실시간 수정**: 스타일 창에서 키프레임 비율을 고치면 패널의 캡처에 바로 반영된다.
- **View Transition**: 일시중지를 켜고 전환을 일으키면 `::view-transition` 의사 요소 트리가 DOM에 남아 스타일을 고칠 수 있다.

transition·keyframes 자체는 [[css-animation|CSS 애니메이션: transition과 @keyframes]]에서 다룬다. 프레임 드롭 같은 성능 문제는 [[devtools-performance|DevTools로 성능·메모리 분석하기]]로 본다.

## 페이지 전체의 CSS 점검

| 도구 | 여는 곳 | 보여 주는 것 |
| --- | --- | --- |
| CSS 개요(CSS Overview) | 도구 더보기 → CSS 개요 → 개요 캡처 | 요약, 유형별 색상과 **저대비 텍스트**, 글꼴·크기·두께별 사용 횟수, 효과 없는 선언(이유별), 미디어 쿼리 사용 횟수. 항목을 누르면 해당 요소 목록 → Elements로 이동 |
| 커버리지(Coverage) | 명령 메뉴 → Show Coverage → 새로고침 | 파일별 사용·미사용 CSS·JS 비율, 줄 단위 초록(사용)·빨강(미사용) |

CSS 개요는 디자인 토큰 밖의 색이나 제각각인 글꼴 크기를 찾을 때 유용하다.

## 자동 완성(Autofill) 디버깅

Chrome이 저장된 **주소**로 폼을 채울 때 무엇을 어디에 넣는지 본다. 자동 완성을 실행하면 패널이 저절로 열리고, 명령 메뉴의 Show Autofill로도 연다. 표는 페이지에서 감지된 필드, Chrome이 휴리스틱으로 **예측한 필드 종류**, 실제로 넣은 값을 나란히 보여 준다. 저장된 주소가 없으면 패널 위의 테스트 주소 데이터 표시를 켠다. `autocomplete` 속성 오류는 Issues 패널이 알려 준다. 폼 설계는 [[form-usability|더 나은 폼을 만드는 팁]].

## 접근성 검사

DevTools는 **마크업이 보조 기술에 어떻게 노출되나**를 잘 잡는다. 반면 키보드·스크린 리더로 실제로 쓸 수 있는지는 직접 써 봐야 안다. 원칙과 수동 점검은 [[Accessibility|웹 접근성]].

| 확인할 것 | 방법 |
| --- | --- |
| 보조 기술이 보는 구조 | 접근성 탭 → 접근성 트리 표시: DOM 트리가 전체 페이지 접근성 트리로 바뀐다. 다시 돌려도 선택 노드는 유지된다 |
| 이름·역할·ARIA | 접근성 탭의 ARIA 속성과 계산된 속성(브라우저가 계산한 이름·역할) |
| 읽는 순서 | 접근성 탭 → 소스 순서 표시: 화면 위에 소스 순서 번호가 붙는다 |
| 대비 한 곳 | 검사 모드에서 요소에 마우스 → 툴팁의 대비율 경고. 색상 선택기의 대비율 섹션에서 AA·AAA 선과 추천 색 적용 |
| 대비 전체 | CSS 개요의 색상 → 대비 문제, Lighthouse 접근성 카테고리 |
| 포커스 추적 | 콘솔 실시간 표현식에 `document.activeElement`. 포커스 링이 사라져도 지금 포커스된 요소를 보여 준다 |
| 사용자 환경 | Rendering 탭: 시각 결핍 시뮬레이션, `forced-colors`, `prefers-contrast`, `prefers-reduced-motion`, `prefers-reduced-transparency` |
| 리플로우 | 기기 툴바로 뷰포트를 줄여 정보가 잘리지 않는지 본다 |

- 대비 제안 기준은 설정 → 환경설정 → 요소의 APCA 체크박스로 APCA와 AA·AAA 사이를 바꾼다. 대비 기준 자체는 [[color-motion-accessibility|색과 움직임의 접근성]].
- Lighthouse 접근성 감사는 axe 엔진을 쓴다. 자동 감사와 테스트 자동화는 [[web-vitals|웹 성능 지표와 Lighthouse]], [[a11y-driven-testing|접근성 기반 UI 테스트 자동화]].
- DevTools 자체도 키보드로 쓸 수 있다. `Cmd/Ctrl+]`·`[`로 패널을 옮기고, DOM 트리와 이벤트 리스너는 ARIA tree라 화살표 키로 탐색한다.

## 정리

- Elements의 오른쪽 탭은 **선택한 노드 하나**에 대해 답한다. 먼저 정확한 노드를 고른다.
- CSS가 안 먹으면 스타일 창의 표시(흐림·취소선·경고·정보 아이콘)로 원인 종류를 가르고, 계산됨 탭에서 승자를 확인한다.
- 상태 강제와 배지 오버레이로 "그때만 보이는" 스타일과 레이아웃을 붙잡아 둔다.
- DevTools 수정은 새로고침하면 사라진다. 변경사항 패널에서 복사해 코드로 옮긴다.
- DevTools는 지금 렌더링된 결과를 보여 줄 뿐이고, 고칠 곳은 소스에 있다.

관련 노트: [[Chrome-DevTools|Chrome DevTools]], [[devtools-console|DevTools Console 활용]], [[devtools-debugging|DevTools로 JavaScript 디버깅하기]], [[devtools-device-emulation|DevTools로 기기·환경 에뮬레이션하기]], [[how-css-works|CSS가 동작하는 방식]], [[Accessibility|웹 접근성]]
