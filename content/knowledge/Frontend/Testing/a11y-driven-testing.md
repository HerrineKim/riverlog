---
title: "접근성 기반 UI 테스트 자동화"
concept: "A11y-driven Testing"
summary: "UI 테스트가 xpath·CSS 선택자 때문에 쉽게 깨지던 문제를 WAI-ARIA의 role과 접근 가능한 이름(accessible name)으로 요소를 찾는 방식으로 푸는 법. getByRole 쿼리, aria-label·aria-labelledby·aria-current·aria-expanded 활용, 헤드리스 컴포넌트, 인수·회귀 테스트로서의 효과, 접근성 트리를 LLM·AI 에이전트의 입력으로 쓰는 법을 정리한다."
tags: ["testing", "frontend", "accessibility", "html", "react"]
source: other
date: "2026-10-13"
sources: ["https://tech.wonderwall.kr/articles/a11ydriventestautomation/", "https://playwright.dev/docs/aria-snapshots", "https://chromedevtools.github.io/devtools-protocol/tot/Accessibility/"]
---

> 원더월 김태희의 글 「[접근성이 이끄는 웹 프론트엔드 테스트 자동화](https://tech.wonderwall.kr/articles/a11ydriventestautomation/)」(2023.06)를 요약·재구성한 노트다. 예시 코드는 Playwright 기준이다.
> 「접근성 트리를 AI의 눈으로 쓰기」는 X(트위터)에서 @hmmhmm_hm과 김태희(@stelo_kim)가 나눈 대화(2024.04)를 바탕으로, 도구는 Playwright·Chrome DevTools Protocol 공식 문서로 확인해 더했다.

## 프론트엔드는 UI를 테스트해야 한다

선언형 UI는 UI를 **상태의 함수**로 만들어 예측하고 테스트하기 쉽게 했고, 프론트엔드에 남은 복잡성은 대부분 접힘·disabled·서버 상호작용 같은 **UI 로직과 상태**다. 그래서 모델만 단위 테스트하던 방식으로는 부족하다. 남은 문제는 요소를 찾는 방법이었다.

## 요소를 찾는 방법 비교

| 방식 | 예 | 문제 |
| --- | --- | --- |
| 좌표 (캡처 & 리플레이) | `x=200, y=300` 클릭 | 버튼 위치만 바뀌어도 깨진다 |
| xpath | `//*[@id="main"]/div/section[1]/div[3]/label/div/div[1]/input` | DOM 트리가 조금만 바뀌어도 깨지고, 읽을 수 없어 주석이 필요하다 |
| CSS 클래스 | `section.customer-info-section input.phone-input` | 같은 입력이 여러 개면 겹친다. CSS Modules·styled-components는 `sc-781e12f9-2` 같은 무작위 이름을 만든다 |
| test id | `data-testid="..."` | 테스트만을 위한 인위적인 표시를 계속 달아야 한다 |
| **role + 접근 가능한 이름** | `getByRole('button', { name: '구매하기' })` | 사용자가 보는 의미로 찾으므로 구조·스타일이 바뀌어도 버틴다 |

앞의 네 방식은 **기술 기준**으로 찾는다. 기술이 바뀌면 테스트도 바뀌어야 한다. 사용자 인터페이스를 테스트하는데 사용자 관점이 빠져 있다.

## 접근성 정보로 요소 찾기

스크린 리더는 화면을 읽어 주려면 요소의 의미를 알아야 한다. 이 의미를 표준화한 것이 **ARIA(Accessible Rich Internet Applications)다**. `<button>구매하기</button>`는 스크린 리더가 "구매하기, 버튼"으로 읽는다.

**스크린 리더가 읽기 쉬운 코드는 테스트 도구도 찾기 쉽다.** Testing Library가 처음 이 방식을 만들었고 Playwright도 받아들였다.

```ts
await page.getByRole('button', { name: '구매하기' }).click();

await page
  .getByRole('region', { name: '주문자 정보' })
  .getByPlaceholder('*휴대전화')
  .fill('01011112222');
```

프레임워크, CSS, DOM 구조에 기대지 않는다. "주문자 정보" 영역 안에 "*휴대전화" 입력이 있는 한 테스트는 깨지지 않는다.

## 테스트하기 좋은 마크업 만들기

| 상황 | aria 속성·마크업 | 테스트 쿼리 예 |
| --- | --- | --- |
| 디자인 때문에 `div`로 만든 버튼 | `role="button"`, `tabIndex={0}`, `aria-disabled`, Enter·Space 키 처리까지 구현 | `getByRole('button', { name: '구매하기' })` |
| 텍스트 없는 아이콘 버튼 | `aria-label`. 이미지 대신 그 텍스트를 놓아도 말이 되게, 다국어면 i18n 값으로 | `getByRole('button', { name: '메뉴 열기' })` |
| 같은 이름의 버튼이 여러 영역에 | `<section aria-labelledby="제목 id">`로 이름 있는 region을 만든다 | `getByRole('region', { name: '이메일' }).getByRole('button', { name: '확인' })` |
| 여러 단계 중 현재 단계 | `aria-current="step"` | `toHaveAttribute('aria-current', 'step')` |
| 접고 펼치는 영역 (DOM에는 남아 있음) | 버튼에 `aria-expanded`·`aria-controls` | `toHaveAttribute('aria-expanded', 'true')` |
| Tab·Select·Datepicker 같은 복잡한 위젯 | 직접 만들지 말고 Radix UI·Ariakit·Ark UI 같은 헤드리스 라이브러리. ARIA·키보드·포커스를 갖췄다 | `getByRole('combobox', { name: '옵션' })`, `getByRole('option', { name: 'Night' })` |

role은 대부분 시맨틱 HTML에 대응한다(`button` → button, 이름 있는 `section` → region). `div`에 role을 달 때는 MDN의 role 문서에 나온 키보드 동작까지 구현해야 시맨틱 요소처럼 다뤄진다.

### 예: 같은 이름의 버튼을 영역으로 구분하기

```jsx
<section aria-labelledby="email-title" aria-current={isCurrent ? 'step' : undefined}>
  <h2 id="email-title">가입할 이메일 주소</h2>
  <Button>확인</Button>
</section>
```

```ts
await page.getByRole('region', { name: '가입할 이메일 주소' })
  .getByRole('button', { name: '확인' }).click();
```

### 예: 펼침 상태를 aria-expanded로 알리기

```jsx
<button aria-expanded={isOpen} aria-controls="delivery-info" onClick={() => setIsOpen((v) => !v)}>
  배송정보 <Arrow />
</button>
<div id="delivery-info" hidden={!isOpen}>…</div>
```

```ts
const toggle = page.getByRole('button', { name: '배송정보' });
await toggle.click();
await expect(toggle).toHaveAttribute('aria-expanded', 'true');
```

aria 속성은 DOM에 렌더되므로 **스타일도 여기에 건다.** `&[aria-expanded='true'] svg { transform: rotate(180deg); }`처럼 쓰면 테스트한 상태와 화면이 같은 값에 묶인다.

## 테스트가 주는 것

### 실행되는 기획서 (인수 테스트)

접근성 용어는 사람과 기계의 공용어라서 **기획서 문장을 거의 그대로 테스트로 옮길 수 있다.** "로그인하지 않으면 장바구니에 못 들어간다"는 정책은 이렇게 된다.

```ts
await page.getByRole('link', { name: '장바구니' }).click();
const dialog = page.getByRole('alertdialog', { name: '로그인' });
await dialog.getByRole('button', { name: '확인' }).click();
await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible();
```

- 코드보다 테스트를 먼저 짤 수 있고, 테스트 작성자와 개발자를 나눌 수도 있다.
- 기획자와 함께 보며 빠진 케이스를 찾는다.

### 강건한 회귀 테스트

회귀 테스트는 **안정적이어야** 한다. 코드 한 줄에 테스트 수백 줄을 고쳐야 한다면 유지보수 비용이 구현보다 커진다.

role과 이름으로 찾는 테스트는 **사용자 동작이 그대로인 한** 구현 교체를 견딘다.

| 바뀐 것 | 테스트 |
| --- | --- |
| 레이아웃(inline-block → grid), 렌더링 방식(CSR → SSG), `img` → 프레임워크 이미지 컴포넌트 | 통과. 사용자가 보는 역할·이름이 같다 |
| `useEffect` 의존성 배열에 매번 참조가 바뀌는 함수를 넣어 요청이 취소되는 버그 | 실패. 코드 리뷰에서 놓친 동작 결함을 잡는다 |

그래서 이 방식의 E2E가 깨지면 대부분 **진짜 버그이거나 잘못된 접근성을 바로잡은 경우**다.

## 접근성 트리를 AI의 눈으로 쓰기

테스트가 role과 이름으로 페이지를 읽듯, LLM에게도 HTML 대신 **접근성 트리**를 넘길 수 있다. 접근성 트리는 브라우저가 DOM에서 스타일·레이아웃용 요소와 속성을 걷어 내고 **역할·이름·상태**만 남긴 구조라([[aria-basics|ARIA와 접근 가능한 이름]]), 같은 페이지를 훨씬 적은 토큰으로 표현한다. 스크래핑에서 HTML 대신 접근성 트리를 보내 토큰을 10배 가까이 줄인 사례도 있다. 의미 있는 요소만 골라내야 하는 검색 결과 페이지 파싱 같은 일에 특히 잘 맞는다.

```text
HTML                                                  접근성 트리
<div class="nav-wrap"><ul class="gnb">                navigation "주 메뉴"
  <li class="item active"><a href="/" ...>홈</a>        link "홈" [current=page]
  <li class="item"><a href="/docs" ...>문서</a>         link "문서"
<button class="btn btn-primary" aria-expanded="false"> button "메뉴" [expanded=false]
```

| 방법 | 내용 |
| --- | --- |
| CDP | `Accessibility.getFullAXTree`로 브라우저가 계산한 트리를 그대로 받는다. Puppeteer의 `page.accessibility.snapshot()`도 이 계열이다 |
| Playwright ARIA 스냅샷 | `locator.ariaSnapshot()`이 영역의 접근성 트리를 YAML로 돌려준다. `toMatchAriaSnapshot()`으로 테스트 단언에도 쓴다 |
| 브라우저 없이 | Testing Library가 내부에서 쓰는 `dom-accessibility-api`(접근 가능한 이름 계산), `aria-query`(role 정의)로 DOM에서 직접 계산한다 |

AI 에이전트가 웹을 다루는 방식도 이쪽으로 왔다. Playwright MCP는 기본으로 스크린샷 대신 접근성 스냅샷을 모델에 넘기고, 모델은 스냅샷 속 요소 참조로 클릭·입력한다. 그래서 **AI에게 사이트를 돌아다니며 테스트하게 하는** 탐색형 테스트가 가능해진다.

같은 원리가 앞의 결론을 강화한다. 접근성이 나쁜 페이지는 스크린 리더와 테스트뿐 아니라 **AI 에이전트에게도 보이지 않는다.** `div`로 만든 버튼은 트리에 `generic`으로만 남고, 이름 없는 아이콘 버튼은 무엇을 하는지 알 수 없다.

## 정리

- 테스트가 실제 사용 방식과 닮을수록 더 믿을 수 있다(Kent C. Dodds).
- 요소는 좌표·xpath·클래스가 아니라 **role과 접근 가능한 이름**으로 찾는다. 구조와 스타일을 바꿔도 테스트가 살아남는다.
- 테스트가 요소를 못 찾으면 스크린 리더도 못 찾는다. 테스트를 쓰다 보면 접근성이 같이 고쳐진다.
- 직접 만든 컴포넌트에는 role·aria 속성과 그에 맞는 동작을 넣고, 복잡한 컴포넌트는 헤드리스 라이브러리를 쓴다.
- 접근성은 시각 장애인만이 아니라 테스트, 검색 엔진, 기획 소통까지 모두에게 이득이다.
- 접근성 트리는 HTML보다 훨씬 적은 토큰으로 페이지를 표현해 LLM 스크래핑과 AI 에이전트의 입력이 된다. 접근성이 나쁜 페이지는 AI에게도 보이지 않는다.

관련 노트: [[tdd|프론트엔드에서의 TDD]], [[frontend-test-types|프론트엔드 테스트의 종류와 도구]], [[html|HTML 기초와 HTML5]], [[design-system|디자인 시스템: 구성, 도입, 구축과 배포]], [[semantic-html|시맨틱 HTML과 문서 구조]], [[web-accessibility|웹 접근성: 표준 준수에서 실제 사용성까지]], [[aria-basics|ARIA와 접근 가능한 이름]], [[ai-delegation-toolkit|AI에게 일 맡기기: 권한·정보·도구]]
