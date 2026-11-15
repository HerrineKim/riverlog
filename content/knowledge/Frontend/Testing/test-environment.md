---
title: "테스트 실행 환경: Node, DOM 에뮬레이션, 실제 브라우저"
concept: "Testing Environment"
summary: "테스트가 도는 런타임(Node·Deno·Bun 또는 브라우저)과 그 안에서 쓸 수 있는 API가 테스트 환경이다. 순수 로직은 어디서든, 작은 컴포넌트는 jsdom·happy-dom 같은 DOM 에뮬레이션에서, 레이아웃·제스처·사용자 흐름은 실제 브라우저(CI에서는 헤드리스, 필요하면 Xvfb)에서 테스트한다. 환경에 기대지 않는 로직을 떼어 낼수록 테스트가 쉬워진다."
tags: ["testing", "frontend", "javascript", "vitest"]
source: other
date: "2026-10-21"
sources: ["https://web.dev/learn/testing/get-started/testing-environment", "https://vitest.dev/config/environment", "https://vitest.dev/guide/browser/", "https://developers.google.com/web/updates/2017/04/headless-chrome", "https://en.wikipedia.org/wiki/Xvfb", "http://manpages.ubuntu.com/manpages/trusty/man1/xvfb-run.1.html", "https://ropig.com/blog/end-end-tests-dont-suck-puppeteer/", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Cypress%EB%9E%80.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Cypress%281%29.md", "https://docs.cypress.io/app/core-concepts/introduction-to-cypress"]
---

> web.dev의 「[Learn Testing](https://web.dev/learn/testing)」 강좌의 「The testing environment」 모듈을 바탕으로, Vitest 설정은 공식 문서로 확인해 재구성한 노트다. 헤드리스 브라우저는 Chrome for Developers의 「[Headless Chrome](https://developers.google.com/web/updates/2017/04/headless-chrome)」, 「[Xvfb](https://en.wikipedia.org/wiki/Xvfb)」, 「[End-to-end Tests that Don't Suck with Puppeteer](https://ropig.com/blog/end-end-tests-dont-suck-puppeteer/)」을 바탕으로 보강했다.
>
> 「Cypress로 쓰는 E2E」는 「[Frontend_TIL: Cypress란](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Cypress%EB%9E%80.md)」, 「[Cypress(1)](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Cypress%281%29.md)」를 바탕으로 Cypress 공식 문서로 확인해 보강했다.

## 테스트 환경이란

JavaScript 테스트는 「`Error`를 던지지 않고 끝나는 코드」다. 그런데 같은 테스트 코드라도 **어디서 도느냐**에 따라 쓸 수 있는 것이 다르다. 테스트 환경은 두 가지로 이뤄진다.

| 구성 | 뜻 | 예 |
| --- | --- | --- |
| 런타임 | 코드를 실행하는 엔진과 호스트 | Node, Deno, Bun, Chromium·Firefox·WebKit |
| API | 그 런타임이 주는 전역 객체와 모듈 | `document`·`window`·CSS 레이아웃(브라우저), `node:fs`(Node) |

## 런타임마다 없는 것

| 런타임 | 없는 것 | 결과 |
| --- | --- | --- |
| Node·Deno·Bun (범용 런타임) | DOM, `document`, `window`, 렌더링, CSS 레이아웃 | React 컴포넌트를 그대로 렌더링하면 실패한다 |
| 브라우저 | `node:fs` 같은 Node 내장 모듈 | 테스트 중에 파일을 읽을 수 없다 |

범용 런타임은 웹 API를 꾸준히 받아들였다. `fetch`, `EventTarget`, `URL`, `AbortController`는 지금 Node에 전역으로 있고, `WebSocket`도 Node 22부터 기본으로 켜져 있다. 그래도 DOM과 렌더링은 없다.

## 환경을 고르는 기준

| 테스트 대상 | 환경 | 이유 |
| --- | --- | --- |
| 순수 로직 (계산, 파싱, 상태 전이) | 아무 런타임. 보통 Node | 환경 API를 쓰지 않으니 어디서 돌아도 같다 |
| 작은 컴포넌트 (React·Web Component가 DOM을 만들고 이벤트를 받는다) | DOM 에뮬레이션 (jsdom, happy-dom) | 브라우저를 띄우는 비용 없이 명령줄에서 빠르게 돈다 |
| 레이아웃, 스크린숏, 제스처, 실제 포커스·스크롤 | 실제 브라우저 | 에뮬레이터에는 그리는 엔진이 없다 |
| 로그인부터 핵심 동작까지 이어지는 사용자 흐름 (E2E) | 실제 브라우저 | 사용자 경험과 가장 가깝다 |

실제 코드베이스는 이 셋을 섞는다. 테스트 종류마다 알맞은 환경을 고른다.

## 1. 로직을 환경에서 떼어 낸다

Node나 브라우저 API를 부르지 않는 코드는 **어떤 환경에서도** 테스트된다. 그래서 렌더링·입출력 코드와 비즈니스 로직을 나누는 것이 가장 싼 해법이다.

```ts
// 전: fs에 묶여 있어 Node에서만, 그것도 실제 파일로 테스트된다
export function bumpVersion(path: string) {
  const pkg = JSON.parse(fs.readFileSync(path, 'utf8'))
  pkg.version = next(pkg.version)
  fs.writeFileSync(path, JSON.stringify(pkg))
}

// 후: 읽기·쓰기를 인자로 받는다. 테스트는 메모리 함수를 넘긴다
export function bumpVersion(read: () => string, write: (s: string) => void) {
  const pkg = JSON.parse(read())
  pkg.version = next(pkg.version)
  write(JSON.stringify(pkg))
}
```

테스트할 것은 **내 코드의 고유하고 위험한 로직**이다. `fs.writeFileSync`가 잘 동작하는지는 테스트하지 않는다. 이 분리를 설계 원칙으로 일반화한 것이 [[humble-object-pattern|험블 객체 패턴]]이다.

## 2. DOM을 에뮬레이션한다

jsdom과 happy-dom은 Node 안에서 DOM, 요소, 이벤트, 쿠키, `localStorage`를 흉내 낸다. Vitest의 기본 환경은 `node`라서 **직접 골라야 한다.**

```ts
// vitest.config.ts: 프로젝트 전체
export default defineConfig({ test: { environment: 'jsdom' } })
```

```ts
// 파일 하나만 바꿀 때: 파일 맨 위 주석
// @vitest-environment happy-dom
```

| 할 수 있다 | 할 수 없다 |
| --- | --- |
| 요소 생성·쿼리, 이벤트 발송, 폼 상태, 쿠키 | 화면에 그리기, 스크린숏 |
| 타이머, `requestAnimationFrame`(jsdom은 `pretendToBeVisual` 옵션) | 요소의 픽셀 위치·크기, 계산된 레이아웃 (`getBoundingClientRect`는 0을 돌려준다) |
| | 스와이프 같은 제스처, 실제 스크롤·포커스 이동 |

에뮬레이션은 실제 브라우저와 **예측하기 어려운 곳에서** 다르게 동작할 수 있다. 그래서 에뮬레이션 환경의 테스트는 짧게 유지하고, 레이아웃에 기대는 단언은 하지 않는다.

## 3. 실제 브라우저를 조종한다

Node에서 실행한 테스트 러너가 실제 브라우저를 띄우고 URL을 열거나, 직접 만든 HTML·JS를 넣고, 마우스를 움직이고, 입력란에 타이핑한다. 작성 중에는 창을 띄워 디버깅하고, 자동화한 뒤에는 화면 없이(headless) 돌린다.

| 도구 | 쓰임 |
| --- | --- |
| Playwright | E2E의 기본 선택. Chromium·Firefox·WebKit을 한 API로 조종하고 자동 대기와 병렬 실행을 준다 |
| Cypress | 테스트 코드가 **브라우저 안에서** 앱과 함께 돈다. 실행 화면·명령 로그·시간 여행 스냅숏을 보며 디버깅하는 대화형 UI가 강점. 기본 Chromium 계열·Firefox, WebKit은 실험적 |
| WebdriverIO | WebDriver 프로토콜 기반. 실제 기기·클라우드 브라우저 그리드와 잘 맞는다 |
| Vitest 브라우저 모드 | 단위·컴포넌트 테스트를 실제 브라우저에서 돌린다. 공급자는 `playwright`(병렬 실행 지원, 권장)나 `webdriverio` |
| Web Test Runner | 브라우저에서 테스트를 돌리는 Modern Web 프로젝트의 러너 |

Vitest 브라우저 모드에서는 `vi.mock`이 동작하지만, **ES 모듈 네임스페이스가 봉인돼 있어** 가져온 모듈에 `vi.spyOn`을 걸 수 없다. 대신 `vi.mock('./module.js', { spy: true })`로 모든 export에 스파이를 건다. `alert`·`confirm`처럼 스레드를 멈추는 대화상자는 목으로 바꿔 둔다.

브라우저는 로컬, CI, 외부 클라우드 브라우저 서비스(BrowserStack, Sauce Labs 같은 실제 기기·브라우저 그리드) 어디서든 띄울 수 있다. 다만 느리고 불안정해질 여지가 커서 **꼭 실제 브라우저가 필요한 테스트**만 이 환경에 둔다.

### Cypress로 쓰는 E2E

Cypress는 Mocha 문법(`describe`·`it`)에 Chai 단언을 얹고, 모든 브라우저 조작을 `cy` 명령 사슬로 쓴다. 명령은 바로 실행되지 않고 **큐에 쌓였다가 차례로** 실행되며, `get`·`should`는 조건이 맞을 때까지 기본 4초간 **자동으로 재시도**한다. 그래서 `cy.wait(5000)` 같은 고정 대기는 쓰지 않는다.

```js
// cypress/e2e/todo.cy.js
describe('할 일 목록', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/todos', { fixture: 'todos.json' })   // 응답 고정
    cy.visit('/')                                                  // baseUrl 기준
  })

  it('입력하고 Enter를 누르면 목록 끝에 추가된다', () => {
    cy.get('[data-cy=input]').type('Cypress 공부{enter}')          // {enter}·{backspace} 같은 특수 키
    cy.get('[data-cy=list]').children().last().should('have.text', 'Cypress 공부')
  })
})
```

| 항목 | 지금 | 과거(Cypress 9까지) |
| --- | --- | --- |
| 설정 | `cypress.config.js`의 `e2e.baseUrl` 등 | `cypress.json` |
| 테스트 위치 | `cypress/e2e/*.cy.js` | `cypress/integration/*.js` |
| 네트워크 가로채기 | `cy.intercept()` | `cy.route()` + `cy.server()` |

- `npx cypress open`은 대화형 러너, `npx cypress run`은 CI용 헤드리스 실행이다. `cypress/fixtures`에 고정 응답 데이터를, `cypress/support`에 모든 테스트에 앞서 실행할 명령 확장을 둔다.
- 요소는 스타일용 클래스가 아니라 역할·텍스트나 **테스트 전용 속성**(`data-cy`, `data-testid`)으로 찾는다. `@testing-library/cypress`를 support 파일에서 불러오면 `cy.findByRole('button', { name: /저장/ })` 같은 Testing Library 쿼리를 쓴다.
- 테스트 전용 속성을 배포 결과에서 지우고 싶으면 Babel 플러그인(`babel-plugin-react-remove-properties`)으로 production 빌드에서만 뺀다. 대부분은 크기 영향이 작아 그냥 둔다.

### 헤드리스 브라우저

**헤드리스(headless) 브라우저는 창(UI 셸) 없이 도는 실제 브라우저다.** 렌더링 엔진과 웹 플랫폼 기능은 그대로라서 화면 없는 CI 서버에서 E2E 테스트, 스크린숏, PDF 생성, 크롤링을 한다. 명령줄만으로도 쓸 수 있다.

```bash
chrome --headless --dump-dom https://example.com                 # 렌더링 후 DOM을 stdout으로
chrome --headless --screenshot --window-size=412,732 https://example.com   # screenshot.png
chrome --headless --print-to-pdf https://example.com
chrome --headless --remote-debugging-port=9222                   # DevTools 프로토콜로 원격 조종
```

| 구분 | 내용 |
| --- | --- |
| 새 헤드리스 | 지금 Chrome의 `--headless`는 **일반 Chrome과 같은 코드**를 창만 없이 돌린다. 헤드리스에서만 다르게 동작하는 문제가 줄었다 |
| `chrome-headless-shell` | Chrome 59에서 처음 나온 옛 헤드리스 구현. 따로 배포되는 가벼운 실행 파일로 남았고, 자동화·스크린숏처럼 빠른 실행이 중요한 곳에 쓴다(Puppeteer `headless: 'shell'`) |
| 창 있는 브라우저가 필요할 때 | 리눅스 CI에서 확장 프로그램 테스트처럼 headed 모드가 필요하면 **Xvfb**(X virtual framebuffer)를 쓴다. 화면 출력 없이 메모리에서 그리는 X 디스플레이 서버다. `xvfb-run npx playwright test --headed`처럼 감싸면 빈 디스플레이 번호를 찾아 준다 |

### 깨지지 않는 브라우저 테스트

E2E 테스트가 느리고 깨지기 쉽다는 문제는 도구보다 **작성 방식**에서 많이 온다.

- 요소는 CSS 구조가 아니라 역할·레이블이나 `data-testid`로 찾는다. 스타일을 고쳐도 테스트가 살아남는다.
- 고정 시간 `sleep` 대신 **조건을 기다린다**(`waitForSelector`, Playwright의 자동 대기·`expect(locator).toBeVisible()`).
- 디버깅할 때만 창을 띄우고 느리게 돌린다. Playwright `--headed`·`--debug`와 `launch({ slowMo: 100 })`, Puppeteer `launch({ headless: false, slowMo: 100 })`.
- 가입 테스트처럼 고유 값이 필요한 데이터는 실행마다 새로 만든다(faker 등).

과거에는 헤드리스 테스트에 WebKit 기반의 **PhantomJS**를 썼다. 실제 브라우저와 렌더링·JS 지원이 달라 ES6를 못 돌렸고, 2017년 헤드리스 Chrome이 나오자 개발이 멈췄다. 이어서 Chrome을 조종하는 Puppeteer가 Selenium WebDriver의 느리고 불안정한 E2E를 대신했고, 지금은 여러 브라우저 엔진을 한 API로 다루는 Playwright가 기본 선택이다.

## 정리

- 테스트 환경 = 런타임 + 그 런타임의 API. Node에는 DOM이, 브라우저에는 Node 내장 모듈이 없다.
- **환경에 기대지 않는 로직을 떼어 내면** 어디서든 빠르게 테스트된다.
- 작은 컴포넌트는 jsdom·happy-dom. Vitest는 기본이 `node`라 환경을 지정한다.
- 에뮬레이터에는 레이아웃 엔진이 없다. 레이아웃·시각·제스처·사용자 흐름은 실제 브라우저(Playwright, Vitest 브라우저 모드)에서 본다.
- CI에서는 헤드리스로 돌리고, 창이 꼭 필요하면 Xvfb로 가상 디스플레이를 준다. 요소는 역할·`data-testid`로 찾고 고정 `sleep` 대신 조건을 기다린다.

관련 노트: [[frontend-test-types|프론트엔드 테스트의 종류와 도구]], [[humble-object-pattern|험블 객체 패턴]], [[component-test-dependencies|의존성이 있는 컴포넌트 테스트하기]], [[test-run-stages|테스트를 돌리는 시점]]
