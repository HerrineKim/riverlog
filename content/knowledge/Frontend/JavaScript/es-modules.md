---
title: "모듈: export와 import, export default"
concept: "ES Modules"
summary: "ES 모듈의 named·default export와 여러 import 형태, 모듈 스코프·한 번만 평가 같은 성질, 브라우저에서 모듈 스크립트로 쓰는 법과 동적 import(), CommonJS와의 관계, default와 named 중 무엇을 쓸지에 대한 논쟁."
tags: ["javascript", "frontend", "typescript"]
source: mixed
date: "2026-10-12"
sources: ["https://riverkim.kr/174", "https://riverkim.kr/120", "https://wesbos.com/javascript/14-es-modules-and-structuring-larger-apps/78-modules", "https://wesbos.com/javascript/14-es-modules-and-structuring-larger-apps/79-currency-module-refactor", "https://nodejs.org/api/modules.html#loading-ecmascript-modules-using-require"]
---

> riverkim.kr에 쓴 글들을 다시 정리하고, Wes Bos의 「Beginner JavaScript」 강의 노트(wesbos.com/javascript)를 함께 참고했다.

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

다른 모듈의 export를 그대로 다시 내보내는 `export { a } from './a.js'`, `export * from './b.js'`는 폴더의 대표 파일(`index.js`)에서 여러 모듈을 한 입구로 모을 때 쓴다.

## 모듈의 성질

- **모듈 스코프**: 모듈 최상위에 선언한 변수는 전역이 아니다. export하지 않으면 다른 파일에서도, 콘솔에서도 보이지 않지만 같은 파일 안의 함수는 자유롭게 쓴다. 스크립트 태그 순서에 기대 전역 변수를 공유하던 방식의 취약함이 사라진다.
- **자동 strict mode**: `'use strict'`를 쓰지 않아도 엄격 모드로 실행된다.
- **한 번만 평가된다**: 여러 곳에서 import해도 모듈 코드는 처음 한 번만 실행되고, 모두 같은 인스턴스를 공유한다. 모듈 최상위의 객체는 사실상 싱글턴이다.
- **import는 정적이다**: `import` 문은 파일 최상단에서 문자열 경로로만 쓴다. 조건문 안에서 가져오려면 동적 `import()`를 쓴다. 이 정적 구조 덕분에 번들러가 쓰지 않는 export를 걷어 내는 트리 셰이킹이 가능하다.
- **top-level await**: 모듈 최상위에서는 `async` 함수 없이 `await`를 쓸 수 있다. 그 모듈을 import하는 쪽은 기다림이 끝날 때까지 실행이 미뤄진다.

import만 해도 DOM을 찾고 이벤트를 거는 코드가 실행되면 테스트와 재사용이 어렵다. 초기화 코드는 `export function init()`으로 감싸고 진입점에서 한 번 호출하는 편이 낫다.

## 브라우저에서 모듈 쓰기

```html
<script type="module" src="./main.js"></script>
```

- 진입점 하나에만 `type="module"`을 달면 나머지는 `import`로 따라 들어온다. 모듈 스크립트는 기본이 `defer`처럼 동작한다([[script-loading|스크립트·스타일 로딩 순서]]).
- 모듈은 CORS 규칙을 따르므로 HTML을 `file://`로 열면 막힌다. 로컬 서버로 연다.
- 브라우저는 `'./utils.js'`처럼 **확장자까지 쓴 경로나 URL**만 해석한다. `import { format } from 'date-fns'` 같은 패키지 이름(bare specifier)은 번들러·Vite가 `node_modules`에서 찾아 주거나, `<script type="importmap">`으로 이름과 URL을 직접 짝지어 줘야 한다.

## 동적 import: 필요할 때 불러오기

`import()`는 함수처럼 생긴 표현식이고 **모듈 네임스페이스 객체로 이행하는 Promise**를 반환한다. 클릭 뒤에만 필요한 큰 데이터·기능을 미뤄 첫 로딩을 가볍게 한다.

```javascript
button.addEventListener('click', async () => {
  const { default: currencies, localCurrency } = await import('./currencies.js')
  render(currencies, localCurrency) // default는 예약어라 구조 분해할 때 이름을 바꾼다
})
```

- 처음 호출할 때만 네트워크 요청이 나가고, 이후 호출은 캐시된 모듈을 바로 돌려준다.
- 번들러는 동적 import 지점을 별도 청크로 쪼갠다(코드 스플리팅). React의 `lazy()`도 이 위에 있다.

## CommonJS와의 관계

Node.js가 먼저 쓰던 모듈 형식이 CommonJS(`const x = require('x')`, `module.exports = …`)다. 문서에서 `require`를 보면 `import x from 'x'`로 옮겨 쓰면 된다. 지금 Node.js는 ES 모듈을 기본 지원하고(`"type": "module"` 또는 `.mjs`), Node.js 20.19·22.12부터는 플래그 없이 CommonJS에서 (top-level await가 없는) ES 모듈을 `require()`로 불러올 수도 있다. 형식이 생겨난 순서는 [[bundlers-and-vite|번들러의 역사와 Vite]]에 있다.

## 모듈 이전: 모듈 패턴

ES 모듈 이전에는 즉시 실행 함수와 클로저로 private 변수를 숨기는 **모듈 패턴**을 썼다. 지금은 파일 자체가 스코프인 ES 모듈이 그 역할을 맡는다([[js-design-patterns|JavaScript 디자인 패턴]] 참고).

## 정리

- 파일 = 모듈 = 스코프. 내보낼 것만 `export`한다.
- named export는 `{ 이름 }`으로, default export는 중괄호 없이 아무 이름으로 가져온다.
- default는 짧고 "대표 하나"를 드러내지만, 이름 일관성과 도구 지원은 named가 낫다.
- 어느 쪽이든 프로젝트 안에서 통일한다.
- 모듈은 자기 스코프·strict mode·한 번만 평가라는 성질을 가진다. 브라우저에서는 `type="module"`과 서버가 필요하다.
- 당장 필요 없는 코드는 동적 `import()`로 미룬다.

## 참고 자료

- [모듈 내보내고 가져오기 — javascript.info](https://ko.javascript.info/import-export)
- [default export를 피해야 하는 이유 — yceffort](https://yceffort.kr/2020/11/avoid-default-export)
- [What is the benefit of prefer-default-export? — airbnb/javascript #1365](https://github.com/airbnb/javascript/issues/1365)

관련 노트: [[bundlers-and-vite|번들러의 역사와 Vite]], [[script-loading|스크립트·스타일 로딩 순서]], [[typescript-coding-convention|TypeScript 코딩 컨벤션]], [[js-design-patterns|JavaScript 디자인 패턴]]
