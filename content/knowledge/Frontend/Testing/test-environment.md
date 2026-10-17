---
title: "테스트 실행 환경: Node, DOM 에뮬레이션, 실제 브라우저"
concept: "Testing Environment"
summary: "테스트가 도는 런타임(Node·Deno·Bun 또는 브라우저)과 그 안에서 쓸 수 있는 API가 테스트 환경이다. 순수 로직은 어디서든, 작은 컴포넌트는 jsdom·happy-dom 같은 DOM 에뮬레이션에서, 레이아웃·제스처·사용자 흐름은 실제 브라우저에서 테스트한다. 환경에 기대지 않는 로직을 떼어 낼수록 테스트가 쉬워진다."
tags: ["testing", "frontend", "javascript", "vitest"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/testing/get-started/testing-environment", "https://vitest.dev/config/environment", "https://vitest.dev/guide/browser/"]
---

> web.dev의 「[Learn Testing](https://web.dev/learn/testing)」 강좌의 「The testing environment」 모듈을 바탕으로, Vitest 설정은 공식 문서로 확인해 재구성한 노트다.

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
// vitest.config.ts — 프로젝트 전체
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
| WebdriverIO | WebDriver 프로토콜 기반. 실제 기기·클라우드 브라우저 그리드와 잘 맞는다 |
| Vitest 브라우저 모드 | 단위·컴포넌트 테스트를 실제 브라우저에서 돌린다. 공급자는 `playwright`(병렬 실행 지원, 권장)나 `webdriverio` |
| Web Test Runner | 브라우저에서 테스트를 돌리는 Modern Web 프로젝트의 러너 |

Vitest 브라우저 모드에서는 `vi.mock`이 동작하지만, **ES 모듈 네임스페이스가 봉인돼 있어** 가져온 모듈에 `vi.spyOn`을 걸 수 없다. 대신 `vi.mock('./module.js', { spy: true })`로 모든 export에 스파이를 건다. `alert`·`confirm`처럼 스레드를 멈추는 대화상자는 목으로 바꿔 둔다.

브라우저는 로컬, CI, 외부 클라우드 브라우저 서비스 어디서든 띄울 수 있다. 다만 느리고 불안정해질 여지가 커서 **꼭 실제 브라우저가 필요한 테스트**만 이 환경에 둔다.

## 정리

- 테스트 환경 = 런타임 + 그 런타임의 API. Node에는 DOM이, 브라우저에는 Node 내장 모듈이 없다.
- **환경에 기대지 않는 로직을 떼어 내면** 어디서든 빠르게 테스트된다.
- 작은 컴포넌트는 jsdom·happy-dom. Vitest는 기본이 `node`라 환경을 지정한다.
- 에뮬레이터에는 레이아웃 엔진이 없다. 레이아웃·시각·제스처·사용자 흐름은 실제 브라우저(Playwright, Vitest 브라우저 모드)에서 본다.

관련 노트: [[frontend-test-types|프론트엔드 테스트의 종류와 도구]], [[humble-object-pattern|험블 객체 패턴]], [[component-test-dependencies|의존성이 있는 컴포넌트 테스트하기]], [[test-run-stages|테스트를 돌리는 시점]]
