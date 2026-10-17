---
title: "strict mode(엄격 모드)"
concept: "Strict Mode"
summary: "ES5가 하위 호환을 깨지 않고 언어의 오래된 함정을 막으려고 만든 선택적 규칙 집합. 파일·함수 맨 앞의 \"use strict\"로 켜고, ES 모듈과 class 본문은 자동으로 켜진다. 암묵적 전역, 조용한 실패, this의 전역 객체 대체, 블록 밖으로 새는 함수 선언 같은 동작이 에러나 더 엄격한 규칙으로 바뀐다."
tags: ["javascript", "frontend", "ecmascript"]
source: other
date: "2026-10-17"
sources: ["https://ko.javascript.info/strict-mode", "https://ko.javascript.info/eval", "https://web.dev/learn/javascript/appendix", "https://web.dev/learn/javascript/functions/this", "https://web.dev/learn/javascript/functions", "https://web.dev/learn/javascript/objects/property-descriptors", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode"]
---

> web.dev의 「[Learn JavaScript](https://web.dev/learn/javascript)」 강좌의 부록·함수·속성 설명자 모듈을 바탕으로, javascript.info(모던 JavaScript 튜토리얼)의 「엄격 모드」, 「Eval: 문자열 코드 실행하기」 글을 더하고 MDN으로 확인해 재구성한 노트다.

## strict mode란

**strict mode는 JavaScript의 오래된 실수 유발 동작을 끄는 선택적 규칙 집합이다.** 웹은 옛 코드를 깨뜨릴 수 없어서, 언어 초기의 잘못된 설계를 그냥 고칠 수 없다. 그래서 ES5(2009)가 "새 코드만 옵트인하는" 방식으로 도입했다.

strict mode가 하는 일은 세 가지로 묶인다.

| 방향 | 예 |
| --- | --- |
| 조용히 넘어가던 실수를 **에러로** 바꾼다 | 선언 안 한 변수 대입, 읽기 전용 속성 쓰기 |
| 엔진이 최적화하기 어려운 문법을 **금지**한다 | `with` 문, 함수 안의 `arguments`와 매개변수 연동 |
| 앞으로 들어올 문법과 **충돌할 이름을 예약**한다 | `implements`, `interface`, `private` 등을 식별자로 못 쓴다 |

## 켜는 방법

```javascript
'use strict' // 파일 전체

function legacy() {
  'use strict' // 이 함수 안만
}
```

- **스크립트나 함수 본문의 맨 처음**에 와야 한다. 앞에 실행 코드가 한 줄이라도 있으면 그냥 문자열 식으로 취급되어 무시된다(주석은 괜찮다).
- 평범한 문자열 리터럴이어야 한다. `` `use strict` ``처럼 템플릿 리터럴로 쓰면 켜지지 않는다.
- 블록 `{}` 단위로는 켤 수 없다. 파일 아니면 함수다.
- 기본값이 있는 매개변수, rest 매개변수, 구조 분해 매개변수를 쓰는 함수 안에서는 `'use strict'`를 쓸 수 없다(SyntaxError). 파일 단위로 켠다.

### 자동으로 켜지는 곳

**ES 모듈(`<script type="module">`, `import`/`export`가 있는 파일)과 `class` 본문은 항상 strict mode다.** 끌 방법도 없다. 번들러로 빌드하는 요즘 코드는 대부분 모듈이라 `'use strict'`를 따로 적을 일이 거의 없다. 옛 방식의 `<script>`, 콘솔, Node.js의 CommonJS 파일은 따로 켜야 한다.

### 브라우저 콘솔에서 시험할 때

DevTools 콘솔은 기본이 sloppy mode이고, 한 줄씩 실행해서 첫 줄에 `'use strict'`만 따로 쳐서는 다음 줄에 적용되지 않는다. `Shift+Enter`로 줄을 바꿔 **`'use strict'`와 코드를 한 번에 입력**하거나, 함수로 감싸 그 안에서 켠다.

```javascript
(function () {
  'use strict'
  // 시험할 코드
})()
```

**strict mode는 한 번 켜면 끌 수 없다.** 파일 중간에 sloppy로 되돌리는 지시어는 없다.

## 무엇이 달라지나

| 동작 | sloppy mode(기본) | strict mode |
| --- | --- | --- |
| 선언 안 한 변수에 대입 `x = 1` | 전역 변수가 생긴다(암묵적 전역) | `ReferenceError` |
| 일반 함수 호출 `fn()` 안의 `this` | 전역 객체(`window`) | `undefined` |
| `fn.call(null)`·`fn.call(undefined)`의 `this` | 전역 객체로 바뀐다 | 넘긴 그대로 `null`·`undefined` |
| `fn.call(10)`의 `this` | 래퍼 객체 `Number {10}`로 바뀐다 | 원시값 `10` 그대로 |
| 읽기 전용 속성(`writable: false`), `Object.freeze`한 객체에 쓰기 | 조용히 무시 | `TypeError` |
| getter만 있는 속성에 대입, 확장 불가 객체에 속성 추가 | 조용히 무시 | `TypeError` |
| 지울 수 없는 속성 `delete` | `false` 반환 | `TypeError` |
| 블록 안의 함수 선언 | 바깥 함수 스코프로 샌다(브라우저마다 다르던 동작) | `let`처럼 그 블록 스코프에 갇힌다 |
| `with` 문, `0644` 같은 옛 8진수 리터럴 | 허용 | SyntaxError |
| 같은 이름의 매개변수 `function f(a, a)` | 허용 | SyntaxError |
| `arguments[0] = 1`이 매개변수를 바꾸는가 | 바꾼다(연동) | 연동하지 않는다 |
| `eval`이 바깥에 변수를 만드는가 | 만든다 | 만들지 않는다 |

가장 자주 체감하는 것은 표의 첫 두 줄이다. 오타 하나가 전역 변수가 되는 일이 막히고, 메서드를 떼어 부르면 `this`가 `undefined`가 되어 곧장 에러가 난다. 둘 다 "조용히 틀린 값"을 "바로 보이는 에러"로 바꾼다. `this` 규칙의 전체는 [[functions|함수와 this]]에, 쓰기 실패를 만드는 속성 설정은 [[property-descriptors|속성 설명자]]에 있다.

```javascript
(function () {
  mySloppyGlobal = true      // sloppy: 전역에 mySloppyGlobal이 생긴다
})()

;(function () {
  'use strict'
  myStrictGlobal = true      // ReferenceError: myStrictGlobal is not defined
})()
```

## eval과 strict mode

`eval(code)`은 문자열을 코드로 실행하고 마지막 문의 값을 돌려준다. **호출한 자리의 렉시컬 환경에서 실행되어** 바깥 지역 변수를 읽고 바꿀 수 있다. strict mode는 이 위험을 일부만 줄인다.

| | sloppy mode | strict mode |
| --- | --- | --- |
| `eval` 안의 `var x`, `function f` | 바깥 스코프에 새어 나온다 | `eval`만의 스코프에 갇힌다(`typeof x`는 `'undefined'`) |
| 바깥 지역 변수 읽기·쓰기 | 된다 | **여전히 된다** |
| `eval`·`arguments`를 이름으로 쓰기 | 된다 | SyntaxError |

```javascript
let a = 1
function f() {
  let a = 2
  eval('a = 3')          // 직접 eval: f의 지역 a를 바꾼다
  ;(0, eval)('a')        // 간접 eval: 전역 스코프에서 실행 → 1
  return a               // 3
}
```

- **간접 eval**(`window.eval(code)`, `(0, eval)(code)`처럼 `eval`이라는 이름으로 직접 부르지 않는 호출)은 지역 변수를 보지 못하고 **전역 스코프**에서 돈다.
- 문자열에서 함수를 만들어야 하면 `new Function('a', 'b', 'return a + b')`가 낫다. 역시 전역 스코프에서 만들어지므로, 필요한 값을 **인자로 명시해** 넘기게 된다.
- `eval`이 있으면 압축 도구(minifier)는 그 함수의 지역 변수 이름을 줄이지 못한다. 문자열이 어떤 이름을 참조할지 모르기 때문이다. 엔진 최적화도 어려워진다.
- 사용자 입력을 `eval`에 넣는 것은 그대로 코드 주입이다. CSP(`script-src`에 `'unsafe-eval'`이 없으면)는 `eval`과 `new Function`을 모두 막는다. JSON은 `JSON.parse`([[json|JSON: stringify와 parse]]), 동적 로딩은 `import()`([[es-modules|모듈]])로 대신한다.

## 정리

- strict mode는 하위 호환 때문에 고칠 수 없던 동작을 새 코드에서만 끄는 장치다.
- 파일·함수 맨 앞의 `'use strict'`로 켜고, ES 모듈과 class 본문은 자동으로 켜진다.
- 암묵적 전역 → `ReferenceError`, 조용한 쓰기 실패 → `TypeError`, 일반 호출의 `this` → `undefined`.
- `eval`은 strict mode에서도 바깥 지역 변수를 바꿀 수 있다. 쓰지 않는 것이 기본이고, 꼭 필요하면 `new Function`에 인자를 명시한다.
- 모듈로 짜면 신경 쓸 일이 거의 없다. 콘솔이나 옛 스크립트에서 동작이 다르면 strict 여부부터 확인한다.

관련 노트: [[variables-and-types|변수와 데이터 타입]], [[functions|함수와 this]], [[scope-and-closures|스코프와 클로저]], [[es-modules|모듈: export와 import]], [[ecmascript-tc39|ECMAScript 표준과 TC39 프로세스]]
