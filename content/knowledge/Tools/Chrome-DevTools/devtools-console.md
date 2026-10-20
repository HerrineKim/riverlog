---
title: "DevTools Console 활용"
concept: "DevTools Console"
summary: "Chrome DevTools 콘솔로 메시지를 읽고 걸러 내는 법, console.table·group·time·assert·count·trace 같은 Console API와 %c 서식, 실시간 표현식, $0·$_·$()·$$()·copy()·monitorEvents·getEventListeners·queryObjects 같은 콘솔 전용 유틸리티, 페이지 위에서 JavaScript를 실행하는 법을 정리했다."
tags: ["devtools", "debugging", "frontend", "javascript", "browser", "tools"]
source: other
date: "2026-10-15"
sources: ["https://developer.chrome.com/docs/devtools/console?hl=ko", "https://developer.chrome.com/docs/devtools/console/reference?hl=ko", "https://developer.chrome.com/docs/devtools/console/log?hl=ko", "https://developer.chrome.com/docs/devtools/console/api?hl=ko", "https://developer.chrome.com/docs/devtools/console/format-style?hl=ko", "https://developer.chrome.com/docs/devtools/console/javascript?hl=ko", "https://developer.chrome.com/docs/devtools/console/live-expressions?hl=ko", "https://developer.chrome.com/docs/devtools/console/utilities?hl=ko", "https://yozm.wishket.com/magazine/detail/1585/", "https://80000coding.notion.site/cf68279ce9c846d5a0b408d8aaeced25"]
---

> Chrome for Developers의 「[Chrome DevTools 문서](https://developer.chrome.com/docs/devtools?hl=ko)」를 바탕으로 재구성한 노트다.
> 콘솔 메서드 활용 팁 일부는 요즘IT 「[웹 개발 시간을 줄여주는 팁 4가지](https://yozm.wishket.com/magazine/detail/1585/)」와 팔만코딩경의 「js에서 console.log보다 예쁘게 봐보자!」에서 가져왔다.

## 콘솔이란

콘솔은 **로그 메시지를 보는 곳**이자 **페이지 위에서 JavaScript를 실행하는 REPL**이다. 콘솔 코드는 페이지의 `window`에 그대로 접근하므로 DOM을 읽고 바꿀 수 있다. 페이지와 상관없는 코드를 시험하는 놀이터로도 쓴다.

| 여는 방법 | 동작 |
| --- | --- |
| `Ctrl+Shift+J` / `Cmd+Option+J`(Mac) | 콘솔 패널을 바로 연다 |
| 다른 패널에서 `Esc` | 아래쪽 서랍(Drawer)에 콘솔 탭을 연다. Elements를 보면서 로그를 확인할 때 쓴다 |
| 명령 메뉴(`Ctrl+Shift+P` / `Cmd+Shift+P`)에서 `Console` | 패널 또는 Drawer로 연다 |

## 메시지 읽기

- **사용자 메시지와 브라우저 메시지**: 페이지 코드가 `console.*`로 남긴 것이 사용자 메시지다. 404, 잡히지 않은 `TypeError`, `[Violation] 'click' handler took 3000ms` 같은 것은 브라우저가 남긴다.
- **출처 링크**: 메시지 오른쪽의 `파일.js:줄`을 누르면 Sources 패널에서 그 줄이 열린다.
- **스택 트레이스**: 오류·경고 앞의 펼치기 아이콘을 누르면 호출 기록이 보인다. 최신 프레임이 맨 위다.
  - 오류를 잡았다가 `cause`를 지정해 다시 던지면 `Caused by:`로 원인 체인을 따라 보여 준다.
  - 프레임워크가 `console.createTask()`를 쓰면 `setTimeout` 같은 비동기 경계를 넘어 **비동기 스택**까지 이어 보여 준다.
  - 소스 맵에 `ignoreList`가 있으면 번들러·프레임워크 프레임은 숨긴다. 전체를 보려면 하단의 「프레임 N개 더 보기」를 누른다. 원리는 [[devtools-debugging|DevTools로 JavaScript 디버깅하기]]의 무시 목록에 있다.
- **CORS 오류**: 오류 옆 버튼으로 해당 요청을 Network 패널에서 열거나 Issues 탭의 해결 방법을 볼 수 있다. CORS 자체는 [[cors|CORS]]에 있다.

### 필터와 설정

| 하고 싶은 일 | 방법 |
| --- | --- |
| 오류만 보기 | 로그 수준 드롭다운에서 Verbose·Info·Warning·Error를 골라 켠다. **이 선택은 새로고침·재시작 뒤에도 유지된다** |
| 임시로 걸러 보기 | 콘솔 사이드바에서 사용자 메시지·오류·경고·스크립트 URL을 누른다. 사이드바 필터는 저장되지 않는다 |
| 특정 문자열·패턴 | 필터 상자에 문자열, 또는 `/^[AH]/` 같은 정규식 (공백은 `\s`로) |
| 특정 파일·도메인만 / 빼고 | `url:https://example.com` / `-url:https://ads.example` |
| iframe 광고 로그 제외 | 설정의 「선택된 컨텍스트만」 |
| 새로고침해도 로그 유지 | 설정의 「로그 유지」 |
| 네트워크 404 등 숨기기 | 설정의 「네트워크 숨기기」 |
| 모든 XHR·fetch 요청 기록 | 설정의 「XMLHttpRequests 로깅」 |
| 로그 안에서 검색 | `Ctrl+F` / `Cmd+F`. 대소문자 구분·정규식 옵션이 있다 |

콘솔 지우기는 `Ctrl+L`, 지우기 버튼, `clear()`, 코드의 `console.clear()` 중 하나다. 「로그 유지」가 켜져 있으면 `console.clear()`는 무시된다. 빈 곳을 우클릭하면 메시지를 복사하거나 `.log` 파일로 저장할 수 있다.

## Console API: 코드에서 남기는 로그

| 메서드 | 수준 | 쓰는 때 |
| --- | --- | --- |
| `log` · `info` / `debug` | Info / Verbose | 기본 출력. `debug`는 Verbose를 켜야 보인다 |
| `warn` · `error` | Warning · Error | 노란·빨간 강조에 스택 트레이스가 붙는다. 수준 필터로 골라 볼 수 있다 |
| `table(arr, [cols])` | Info | 객체 배열을 표로. 두 번째 인수로 열을 고르고, 표를 우클릭하면 Markdown·CSV로 복사된다 |
| `dir(obj)` | Info | 펼칠 수 있는 속성 트리. DOM 요소도 HTML 대신 속성 목록으로 본다 |
| `dirxml(node)` | Info | 노드를 Elements 패널처럼 XML 트리로 |
| `group(label)` · `groupCollapsed` · `groupEnd` | - | 로그를 들여 쓴 묶음으로. 중첩된다 |
| `time(label)` · `timeEnd(label)` | Info | 구간 실행 시간 측정 |
| `count(label)` · `countReset` | Info | 같은 라벨로 몇 번 호출됐는지 |
| `assert(cond, obj)` | Error | 조건이 거짓일 때만 오류를 남긴다 |
| `trace()` | Info | 지금 위치까지의 호출 스택을 출력한다 |
| `createTask(name)` | - | `task.run(f)`로 실행해 비동기 스택을 이어 준다. 프레임워크가 이미 쓰면 직접 부를 일은 없다 |

```js
console.table(users, ["name", "email"]);
console.assert(x < y, { x, y, reason: "x는 y보다 작아야 한다" });

console.time("fetch");
await load();
console.timeEnd("fetch");          // fetch: 123.4 ms
```

자주 쓰면 짧은 별칭을 만든다. `bind`의 대상은 `console`이어야 한다. 다른 객체에 묶으면 일부 브라우저에서 `Illegal invocation` 오류가 난다.

```js
const c = console.log.bind(console);
```

### 서식 지정자와 스타일

| 지정자 | 출력 |
| --- | --- |
| `%s` · `%i`(`%d`) · `%f` | 문자열 · 정수 · 실수로 변환. `%i`에 `'two'`를 넣으면 `NaN` |
| `%o` · `%O` | 펼칠 수 있는 DOM 요소 · JavaScript 객체 |
| `%c` | 다음 인수의 CSS를 뒤 문자열에 적용 |

```js
console.log("%c배포 빌드", "color: white; background: crimson; padding: 2px 6px");
console.log("\x1B[41;93;4mHello\x1B[m"); // ANSI 이스케이프도 해석한다
```

`%c`의 `url()`은 보안상 `data:` URL만 받는다. Node.js 로그에서 흔히 쓰는 ANSI 이스케이프 시퀀스(SGR)도 지원해서, chalk 같은 라이브러리 없이 색·굵기·밑줄을 줄 수 있다.

## 콘솔에서 JavaScript 실행

- 입력하는 동안 **조기 평가(Eager Evaluation)** 가 반환값을 미리 보여 준다. 콘솔 설정에서 끌 수 있다.
- `Shift+Enter`는 실행 없이 줄을 바꾼다. `↑`로 이전 입력을 다시 부른다.
- 상단의 **JavaScript 컨텍스트 드롭다운**(기본 `top`)에서 iframe·확장 프로그램 컨텍스트를 고른 뒤 실행하면 그 문서에서 돈다.
- 중단점에서 멈춘 동안 입력한 코드는 **그 시점의 스코프**에서 평가된다. 지역 변수로 수정안을 바로 시험할 수 있다.
- 오래 걸리는 계산을 실행하면 끝날 때까지 콘솔이 막힌다.
- 문자열 출력은 우클릭으로 「JavaScript 리터럴」·「문자열 내용」·「JSON 리터럴」 중 골라 복사한다.

### 실시간 표현식

같은 식을 계속 다시 입력한다면 콘솔 상단의 「실시간 표현식 만들기」 버튼으로 고정한다. 값이 약 **250ms마다** 갱신된다. `document.activeElement`를 걸어 두면 키보드 포커스가 어디로 가는지 따라갈 수 있다.

### 객체 들여다보기

| 표시 | 뜻 |
| --- | --- |
| 굵은 글씨 / 일반 글씨 | 자체 속성 / 프로토타입에서 상속한 속성 |
| 흐린 색 | 열거 불가능한 속성 (`for...in`·`Object.keys()`에 안 나온다) |
| `(...)` | 아직 평가하지 않은 getter. 눌러야 실행된다 |
| `#name` | 클래스의 비공개 필드 |
| `[[PromiseState]]`, `[[Entries]]`, `[[Scopes]]` | 코드로는 못 만지는 엔진 내부 슬롯. Promise 상태, Map·Set 항목, 함수가 닫아 둔 스코프를 볼 수 있다 |

함수 이름을 입력하면 속성 대신 함수 자체가 보이므로 `console.dir(fn)`으로 `[[FunctionLocation]]`·`[[Scopes]]`를 연다.

## 콘솔 유틸리티 API

**DevTools 콘솔에서만 동작하는 함수**다. 페이지 스크립트에서 부르면 없다.

| 함수 | 하는 일 |
| --- | --- |
| `$0` ~ `$4` | Elements 패널에서 최근에 선택한 요소 5개 (`$0`이 가장 최근) |
| `$_` | 직전에 평가한 식의 값 |
| `$(sel, [start])` | `document.querySelector`의 별칭. jQuery가 있으면 jQuery의 `$`가 이긴다 |
| `$$(sel, [start])` | `Array.from(document.querySelectorAll(sel))`. 바로 `map`·`filter`를 쓸 수 있다 |
| `$x(xpath)` | XPath로 찾은 요소 배열 |
| `copy(obj)` | 값의 문자열 표현을 클립보드로. `copy($$('a').map(a => a.href))` |
| `inspect(obj)` | 요소는 Elements, 함수는 Sources에서 열어 준다 |
| `getEventListeners(obj)` | 그 객체에 걸린 리스너를 이벤트 종류별 배열로 |
| `monitorEvents(obj, [types])` · `unmonitorEvents` | 이벤트가 날 때마다 이벤트 객체를 로그. `"mouse"`·`"key"`·`"touch"`·`"control"` 묶음을 받는다 |
| `monitor(fn)` · `unmonitor` | 함수가 불릴 때마다 이름과 인수를 로그 |
| `debug(fn)` · `undebug` | 함수 첫 줄에 중단점 |
| `queryObjects(Ctor)` | 그 생성자로 만든 객체를 모두 찾는다. `queryObjects(Promise)`, 메모리 누수 추적에 쓴다 |
| `keys(obj)` · `values(obj)` | 키 · 값 배열 |
| `table(data)` · `dir(obj)` · `clear()` | `console.*` 단축형 |
| `profile(name)` · `profileEnd(name)` | CPU 프로파일을 기록하고 Performance 패널에 결과를 연다 |

```js
monitorEvents($0, "key");          // 선택한 input의 키 이벤트만 기록
getEventListeners(document);       // { click: [...], keydown: [...] }
```

이벤트 위임과 리스너 동작은 [[dom-manipulation|DOM 조작]]에 있다.

## 정리

- 콘솔은 **로그 뷰어 + 페이지에 붙은 REPL**이다. 로그가 넘치면 수준 드롭다운, `url:`·`-url:`, 정규식 필터로 줄인다.
- 출력은 데이터 모양에 맞춰 고른다. 배열은 `table`, 객체·DOM은 `dir`, 흐름은 `group`, 시간은 `time`, 조건 위반은 `assert`.
- 반복해서 확인하는 값은 실시간 표현식으로 고정한다.
- `$0`, `$$()`, `copy()`, `getEventListeners()`, `monitorEvents()`를 쓰면 코드를 고치지 않고 페이지를 조사할 수 있다.
- 값을 여러 개 동시에 봐야 하면 로그를 늘리지 말고 중단점으로 멈춰서 본다.

관련 노트: [[devtools-debugging|DevTools로 JavaScript 디버깅하기]], [[devtools-elements-css|DevTools로 DOM과 CSS 다루기]], [[devtools-network|DevTools Network 패널]], [[dom-manipulation|DOM 조작]], [[cors|CORS]]
