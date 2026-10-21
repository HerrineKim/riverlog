---
title: "모듈: export와 import, export default"
concept: "ES Modules"
summary: "ES 모듈의 named·default export와 여러 import·다시 내보내기 형태, 모듈 스코프·한 번만 평가·라이브 바인딩·import.meta 같은 성질, 브라우저에서 모듈 스크립트로 쓰는 법(defer, async, CORS)과 동적 import(), import attributes로 JSON 가져오기, CommonJS와의 관계, default와 named 중 무엇을 쓸지에 대한 논쟁."
tags: ["javascript", "frontend", "typescript"]
source: mixed
date: "2026-10-20"
sources: ["https://riverkim.kr/174", "https://riverkim.kr/120", "https://wesbos.com/javascript/14-es-modules-and-structuring-larger-apps/78-modules", "https://wesbos.com/javascript/14-es-modules-and-structuring-larger-apps/79-currency-module-refactor", "https://nodejs.org/api/modules.html#loading-ecmascript-modules-using-require", "https://ko.javascript.info/modules-intro", "https://ko.javascript.info/import-export", "https://ko.javascript.info/modules-dynamic-imports", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta"]
---

> riverkim.kr에 쓴 글들을 다시 정리하고, Wes Bos의 「Beginner JavaScript」 강의 노트(wesbos.com/javascript)와 javascript.info(모던 JavaScript 튜토리얼)의 「모듈 소개」, 「모듈 내보내고 가져오기」, 「동적으로 모듈 가져오기」 글을 함께 참고해 재구성한 노트다.

## 모듈과 export

ES6부터 JavaScript 파일 하나는 하나의 **모듈**이다. 파일마다 자기 스코프를 가지며, 밖에서 쓰게 할 것만 `export`로 내보내고 다른 파일에서 `import`로 가져온다. 내보내지 않은 것은 자동으로 감춰진다.

### named export

선언 앞에 `export`를 붙이거나, 선언과 떨어진 곳에서 한꺼번에 내보낸다.

```javascript
// say.js
export function sayHi(user) {
  alert(`Hello, ${user}!`)
}

function sayBye(user) {
  alert(`Bye, ${user}!`)
}
export { sayBye }
```

```javascript
import { sayHi, sayBye } from './say.js'      // 이름이 정확히 맞아야 한다
import { sayHi as hi } from './say.js'        // 다른 이름이 필요하면 as
```

내보내는 쪽에서도 `export { sayHi as hi, sayBye as bye }`처럼 바깥에 보일 이름을 바꿀 수 있다.

함수·클래스 선언 앞에 `export`를 붙일 때는 끝에 세미콜론을 붙이지 않는 것이 일반적인 스타일이다.

### default export

모듈에서 **대표 하나**를 내보낸다. 모듈당 하나만 둘 수 있고, 가져올 때 중괄호 없이 원하는 이름으로 받는다.

```javascript
// User.js
export default class User {
  constructor(name) {
    this.name = name
  }
}
```

```javascript
import User from './User.js'
import Whatever from './User.js' // 이것도 동작한다
```

모듈당 default가 하나뿐이라 이름 없는 값도 내보낼 수 있다(`export default function () {}`, `export default [1, 2, 3]`). named export는 이름이 없으면 문법 오류다. 떨어진 곳에서 `export { sayHi as default }`로 써도 default export가 되고, 받는 쪽은 `import { default as User } from './user.js'`로도 받는다.

`export default`는 선언문 앞에 바로 붙이지 못하는 경우가 있다. `export default const x = …`는 문법 오류이므로 `const x = …` 뒤에 `export default x`로 내보낸다(함수·클래스 선언은 바로 붙여도 된다).

## export default를 쓰는 이유

- 모듈을 "여러 함수를 담은 묶음"으로 만들 수도 있지만, 개체 하나만 담는 쪽이 리팩터링과 유지보수에 유리하다는 관점이 있다. `export default`는 **이 모듈에는 개체가 하나뿐**이라는 사실을 드러낸다.
- import할 때 중괄호를 쓰지 않아도 되어 짧다. React 컴포넌트 파일(`export default function App()`)에서 흔히 보는 이유다.

## 반대 의견: named export를 쓰자

| 쟁점 | default export | named export |
| --- | --- | --- |
| 이름 | 가져오는 쪽에서 아무 이름이나 붙일 수 있어 이름이 제각각이 된다 | 이름이 틀리면 에러가 난다 |
| 리팩터링·검색 | 이름이 달라 일괄 변경과 검색이 어렵다 | 에디터 자동 import·이름 변경이 잘 된다 |
| 트리 셰이킹 | 객체로 묶어 default로 내보내면 일부만 쓰기 어렵다 | 쓰는 것만 번들에 남기기 쉽다 |

Airbnb 스타일 가이드의 `import/prefer-default-export` 규칙을 두고도 GitHub에서 오래 논쟁이 있었다. 팀 TypeScript 컨벤션 중에는 `export default`를 아예 금지하는 경우도 있다([[typescript-coding-convention|TypeScript 코딩 컨벤션]]). 정답이 있는 문제가 아니라 **팀 안에서 한 방식으로 통일하는 것**이 중요하다.

## 가져오는 여러 방법

| 형태 | 의미 |
| --- | --- |
| `import { a, b } from './m.js'` | named import |
| `import { a as alias } from './m.js'` | 이름을 바꿔 가져온다. 이름이 겹칠 때 쓴다 |
| `import def, { a } from './m.js'` | default와 named를 한 번에 |
| `import * as m from './m.js'` | 모든 export를 담은 **모듈 네임스페이스 객체**. default는 `m.default`로 접근한다 |
| `import './polyfill.js'` | 아무것도 받지 않고 모듈을 실행만 한다(부수 효과 import) |
| `const m = await import('./m.js')` | 동적 import. 필요한 시점에 불러온다 (아래) |

`import * as m`은 짧지만, 쓰는 것을 `{ a, b }`로 명시하는 편이 낫다. 어디서 무엇을 쓰는지 드러나고 `m.a` 대신 `a`로 짧게 부를 수 있다. 번들러는 네임스페이스 import도 정적으로 추적해 트리 셰이킹하지만, `m[key]`처럼 동적으로 접근하면 전부 남긴다.

### 다시 내보내기(re-export)

다른 모듈의 export를 가져오자마자 내보내는 문법이다. 패키지나 폴더의 대표 파일(`index.js`)에서 공개할 것만 한 입구로 모으고 내부 구조는 숨길 때 쓴다. `export ... from`은 현재 모듈 스코프에 이름을 만들지 않는다.

| 형태 | 의미 |
| --- | --- |
| `export { login, logout } from './helpers.js'` | named export를 그대로 |
| `export { login as signIn } from './helpers.js'` | 이름을 바꿔서 |
| `export { default as User } from './user.js'` | 다른 모듈의 default를 named로 |
| `export { default } from './user.js'` | default를 default로 |
| `export * from './user.js'` | 모든 named export. **default는 빠진다** |
| `export * as auth from './auth.js'` | 모든 export를 네임스페이스 하나로 (ES2020) |

`export User from './user.js'`는 문법 오류다. default를 다시 내보낼 때 이런 예외를 챙겨야 해서, 다시 내보내기가 많은 코드베이스는 named export를 선호한다.

## 모듈의 성질

- **모듈 스코프**: 모듈 최상위에 선언한 변수는 전역이 아니다. export하지 않으면 다른 파일에서도, 콘솔에서도 보이지 않지만 같은 파일 안의 함수는 자유롭게 쓴다. 스크립트 태그 순서에 기대 전역 변수를 공유하던 방식의 취약함이 사라진다.
- **자동 strict mode**: `'use strict'`를 쓰지 않아도 엄격 모드로 실행된다.
- **한 번만 평가된다**: 여러 곳에서 import해도 모듈 코드는 처음 한 번만 실행되고, 모두 같은 인스턴스를 공유한다. 모듈 최상위의 객체는 사실상 싱글턴이다.
- **import는 정적이다**: `import` 문은 모듈 최상위에서 문자열 경로로만 쓴다. 블록·조건문 안에 둘 수 없고, 경로에 변수나 함수 호출 결과를 쓸 수 없다. 조건부로 가져오려면 동적 `import()`를 쓴다. 이 정적 구조 덕분에 번들러가 의존 관계를 분석하고 쓰지 않는 export를 걷어 내는 트리 셰이킹이 가능하다.
- **import는 끌어올려진다**: `import` 문은 파일 어디에 써도 모듈 본문보다 먼저 처리된다. 맨 아래에 써도 동작하지만 관례상 맨 위에 둔다.
- **라이브 바인딩**: 가져온 이름은 값의 복사본이 아니라 내보낸 변수에 대한 **읽기 전용 연결**이다. 내보낸 모듈이 `export let count`를 바꾸면 가져온 쪽에서도 바뀐 값이 보인다. 가져온 쪽에서 `count = 1`처럼 다시 대입하면 `TypeError`다. 객체를 내보냈다면 속성은 바꿀 수 있고, 모듈이 한 번만 평가되므로 그 변경이 모든 import에 보인다. 진입점에서 설정 객체를 채워 두고 다른 모듈이 그 값을 읽는 패턴이 이 성질을 쓴다.
- **최상위 `this`는 `undefined`**: 일반 스크립트의 최상위 `this`는 전역 객체지만 모듈에서는 `undefined`다. 전역 변수가 꼭 필요하면 `window.x = …`처럼 명시적으로 단다.
- **`import.meta`**: 현재 모듈의 정보를 담은 객체다. 브라우저에서 `import.meta.url`은 모듈 파일의 URL(인라인 모듈이면 페이지 URL)이고, `import.meta.resolve('./a.js')`는 모듈 기준으로 경로를 풀어 URL을 돌려준다. `new URL('./img.png', import.meta.url)`로 모듈 옆의 파일 경로를 만든다. Node.js에는 `import.meta.dirname`·`filename`도 있다.
- **top-level await**: 모듈 최상위에서는 `async` 함수 없이 `await`를 쓸 수 있다. 그 모듈을 import하는 쪽은 기다림이 끝날 때까지 실행이 미뤄진다.

import만 해도 DOM을 찾고 이벤트를 거는 코드가 실행되면 테스트와 재사용이 어렵다. 초기화 코드는 `export function init()`으로 감싸고 진입점에서 한 번 호출하는 편이 낫다.

## 브라우저에서 모듈 쓰기

```html
<script type="module" src="./main.js"></script>
```

- 진입점 하나에만 `type="module"`을 달면 나머지는 `import`로 따라 들어온다. 모듈 스크립트는 인라인이어도 기본이 `defer`처럼 동작해 항상 완성된 DOM을 보고, `async`를 주면 import가 끝나는 대로 실행된다. 일반 스크립트·`async`·`defer`와의 실행 순서 비교는 [[script-loading|스크립트·스타일 로딩 순서]]에 있다.
- 같은 `src`의 모듈 스크립트는 여러 번 넣어도 한 번만 실행된다.
- 모듈은 CORS 규칙을 따른다. 다른 출처에서 모듈을 가져오려면 그 서버가 `Access-Control-Allow-Origin` 헤더를 줘야 하고, HTML을 `file://`로 열면 막힌다. 로컬 서버로 연다.
- 브라우저는 `'./utils.js'`처럼 **확장자까지 쓴 경로나 URL**만 해석한다. `import { format } from 'date-fns'` 같은 패키지 이름(bare specifier)은 번들러·Vite가 `node_modules`에서 찾아 주거나, `<script type="importmap">`으로 이름과 URL을 직접 짝지어 줘야 한다.
- 과거에는 모듈을 모르는 구형 브라우저를 위해 같은 기능의 번들을 `<script nomodule>`로 함께 넣었다. 모듈을 해석하는 브라우저는 `nomodule`을 건너뛴다.

실제 서비스에서는 대개 번들러가 진입점부터 의존 관계를 따라가 파일을 묶고, 트리 셰이킹·압축·문법 변환을 거친다. 이때 `import`/`export`는 번들러 코드로 바뀐다([[bundlers-and-vite|번들러의 역사와 Vite]]).

### import attributes: JSON 등 JS가 아닌 모듈

`with { type: 'json' }`을 붙이면 JSON 파일을 모듈로 가져온다(ES2025, Baseline 2025). 서버가 보낸 MIME 타입만 믿고 실행하지 않도록 **기대하는 형식을 명시**하는 문법이다.

```javascript
import config from './config.json' with { type: 'json' } // default export로 파싱된 객체
const { default: data } = await import('./data.json', { with: { type: 'json' } })
```

JSON 모듈은 default export 하나만 있다. CSS 모듈(`type: 'css'`)은 브라우저 지원이 아직 고르지 않다. 번들러는 이 문법 없이도 JSON import를 처리하지만, 브라우저·Node.js·Deno에서 네이티브로 쓰려면 붙인다. 이전의 `assert { type: 'json' }` 문법은 폐기됐다.

## 동적 import: 필요할 때 불러오기

`import()`는 함수처럼 생긴 표현식이고 **모듈 네임스페이스 객체로 이행하는 Promise**를 반환한다. 클릭 뒤에만 필요한 큰 데이터·기능을 미뤄 첫 로딩을 가볍게 한다.

```javascript
button.addEventListener('click', async () => {
  const { default: currencies, localCurrency } = await import('./currencies.js')
  render(currencies, localCurrency) // default는 예약어라 구조 분해할 때 이름을 바꾼다
})
```

- 경로 자리에 변수나 표현식을 쓸 수 있고, 모듈을 못 찾으면 Promise가 거부되므로 `catch`로 처리한다.
- `type="module"`이 아닌 일반 스크립트에서도 쓸 수 있다.
- 함수처럼 보이지만 함수가 아니라 `super()`처럼 괄호를 쓰는 특수 문법이다. 변수에 담거나 `call`·`apply`로 부를 수 없다.
- 처음 호출할 때만 네트워크 요청이 나가고, 이후 호출은 캐시된 모듈을 바로 돌려준다.
- 번들러는 동적 import 지점을 별도 청크로 쪼갠다(코드 스플리팅). React의 `lazy()`도 이 위에 있다. 무엇을 언제 쪼갤지는 [[code-splitting|자바스크립트 코드 분할]]에 있다.

## CommonJS와의 관계

Node.js가 먼저 쓰던 모듈 형식이 CommonJS(`const x = require('x')`, `module.exports = …`)다. 문서에서 `require`를 보면 `import x from 'x'`로 옮겨 쓰면 된다. 지금 Node.js는 ES 모듈을 기본 지원하고(`"type": "module"` 또는 `.mjs`), Node.js 20.19·22.12부터는 플래그 없이 CommonJS에서 (top-level await가 없는) ES 모듈을 `require()`로 불러올 수도 있다. 표준 모듈(2015) 이전에는 require.js의 AMD, Node.js의 CommonJS, 둘을 함께 지원하려는 UMD가 쓰였다. 형식이 생겨난 순서는 [[bundlers-and-vite|번들러의 역사와 Vite]]에 있다.

두 형식은 **순환 의존**에서 다르게 깨진다. CommonJS는 실행이 덜 끝난 모듈의 빈 `module.exports`를 넘겨 나중에 `is not a function`이 나고, ES 모듈은 바인딩이 살아 있어 나중에 채워진 값이 보이지만 최상위에서 바로 쓰면 초기화 전 접근 오류가 난다. 원인과 해결은 [[express-project-architecture|Express 프로젝트 구조]]의 「순환 의존을 피한다」에 있다.

## 모듈 이전: 모듈 패턴

ES 모듈 이전에는 즉시 실행 함수와 클로저로 private 변수를 숨기는 **모듈 패턴**을 썼다. 지금은 파일 자체가 스코프인 ES 모듈이 그 역할을 맡는다([[js-design-patterns|JavaScript 디자인 패턴]] 참고).

## 정리

- 파일 = 모듈 = 스코프. 내보낼 것만 `export`한다.
- named export는 `{ 이름 }`으로, default export는 중괄호 없이 아무 이름으로 가져온다.
- default는 짧고 "대표 하나"를 드러내지만, 이름 일관성과 도구 지원은 named가 낫다.
- 어느 쪽이든 프로젝트 안에서 통일한다.
- 모듈은 자기 스코프·strict mode·한 번만 평가·라이브 바인딩이라는 성질을 가진다. 브라우저에서는 `type="module"`과 서버가 필요하고, 모듈 스크립트는 defer처럼 실행된다.
- `export *`는 default를 다시 내보내지 않는다. default는 `export { default } from`으로 따로 내보낸다.
- 당장 필요 없는 코드는 동적 `import()`로 미룬다.

## 참고 자료

- [모듈 내보내고 가져오기 — javascript.info](https://ko.javascript.info/import-export)
- [default export를 피해야 하는 이유 — yceffort](https://yceffort.kr/2020/11/avoid-default-export)
- [What is the benefit of prefer-default-export? — airbnb/javascript #1365](https://github.com/airbnb/javascript/issues/1365)

관련 노트: [[in-browser-preview-runtime|브라우저 안 빌드·프리뷰 환경]], [[bundlers-and-vite|번들러의 역사와 Vite]], [[script-loading|스크립트·스타일 로딩 순서]], [[typescript-coding-convention|TypeScript 코딩 컨벤션]], [[js-design-patterns|JavaScript 디자인 패턴]], [[code-splitting|자바스크립트 코드 분할]]
