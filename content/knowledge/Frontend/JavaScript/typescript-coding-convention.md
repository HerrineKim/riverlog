---
title: "TypeScript 코딩 컨벤션"
concept: "TS Convention"
summary: "TypeScript 팀 컨벤션 문서의 규칙을 주제별로 묶었다. 이름 짓기, 타입, 선언, 클래스, 표현식, 제어문, 함수, 에러 처리, 내장 객체, 모듈 규칙을 필수·권장과 이유까지 함께 정리하고, 중괄호·줄 길이·빈 줄·중첩 줄이기·헬퍼 함수 위치 같은 코드 모양과 유지보수를 괴롭히는 패턴(닌자 코드) 목록을 더했다."
tags: ["typescript", "javascript", "frontend", "collaboration"]
source: other
date: "2026-10-17"
sources: ["https://ko.javascript.info/coding-style", "https://ko.javascript.info/ninja-code"]
---

> 한국어로 쓰인 어느 TypeScript 팀 코딩 컨벤션 문서를 바탕으로 재구성하고, 코드 모양과 읽기 어려운 코드 패턴은 javascript.info(모던 JavaScript 튜토리얼)의 「코딩 스타일」, 「닌자 코드」 글로 보강한 노트다.

## 코딩 컨벤션이란

코딩 컨벤션(coding convention)은 팀이 합의한 코드 작성 규칙이다. 컨벤션의 목적은 **읽는 사람이 의도를 오해하지 않게 하는 것**이다. 규칙마다 등급을 붙이면 리뷰에서 무엇을 막고 무엇을 넘길지 분명해진다.

| 등급 | 뜻 |
| --- | --- |
| 필수 | 어기면 버그나 혼란으로 이어진다. 리뷰에서 막는다 |
| 권장 | 대부분 지키되 합의된 예외를 둔다 |
| 참고 | 알고 있으면 좋은 성능·설계 지식이다 |

## 1. 이름 짓기

| 대상 | 규칙 |
| --- | --- |
| 클래스, 인터페이스, type, enum, 데코레이터 | PascalCase |
| 변수, 매개변수, 함수, 메서드, 속성 | camelCase |
| 글로벌 상수, 클래스 내부 불변값 | `UPPER_SNAKE_CASE` (`ONE_HOUR_IN_MS`) |
| 타입 매개변수 | 대문자 한 글자(`T`, `U`) 또는 PascalCase |
| 사용하지 않는 변수·매개변수 | 앞에 `_`를 붙인다. 그 외에는 앞뒤 `_`를 쓰지 않는다 |

- 식별자는 영문, 숫자, `_`만 쓰는 것이 원칙이다(권장). JS는 유니코드 식별자를 허용해서 `const 인사말 = '안녕'`도 동작한다. 다만 `미징수_보수_세금액`처럼 영어로 옮기면 오히려 읽기 어려운 도메인 용어라면 **한글 식별자도 팀 합의로 허용할 수 있다**.
- `$` 접두사(jQuery)와 `$` 접미사(Observable)는 팀이 합의하면 허용한다.
- 대문자 상수는 언어가 불변을 보장해서가 아니라 **"고치지 말라"는 신호**다. 객체 상수는 속성을 바꿀 수 있다.
- 이름에 의미를 담는다. `whId`, `nErr`, `pcCounter` 같은 사내·모호한 약어 대신 `warehouseId`, `errorCount`를 쓴다. `IP`처럼 누구나 아는 약어는 괜찮다. `n`, `i`는 10~15줄 정도의 좁은 범위에서만 허용한다.

## 2. 타입

### 원시 타입과 Object

- **래퍼 객체(`new String()`, `Number`, `Boolean`)를 쓰지 않는다**(필수). `typeof`가 `"object"`가 되고, `'hello' === new String('hello')`는 `false`다. `string` 매개변수에 `String`을 넘기면 컴파일 에러도 난다. 원시값도 메서드를 바로 호출할 수 있으니 래퍼가 필요 없다.
- **`Object` 타입과 `new Object()`를 쓰지 않는다**(필수). `Object`에는 문자열·숫자·함수까지 다 들어가서 사실상 `any`다. 객체만 받으려면 소문자 `object`를 쓰고, 빈 객체는 `{}`로 만든다.

### null과 undefined

| | `undefined` | `null` |
| --- | --- | --- |
| 의미 | 아직 값이 할당되지 않음 | 값이 없음을 명시 |
| 할당 주체 | JS 엔진 | 개발자 |
| `typeof` | `"undefined"` | `"object"` |

- 둘을 **구분해서 쓴다**(필수). 둘 다 falsy라 `if`로는 같아 보이지만, ORM 같은 라이브러리는 `undefined` 필드는 건너뛰고 `null` 필드는 컬럼을 `NULL`로 덮어쓴다.
- **타입 별칭에 `null`·`undefined`를 넣지 않는다**(필수). `type OS = 'Windows' | 'MacOS' | undefined`는 앱 전체에 "없을 수도 있음"을 퍼뜨린다. 필요한 곳에서 `name?: OS`처럼 국소적으로 붙인다.
- `| undefined` 대신 선택적 표시 `?`를 쓴다(필수).

## 3. 선언

- **`var` 대신 `const`·`let`**(필수, ESLint `no-var`). `var`는 함수 범위라 블록 안에서 같은 이름을 다시 선언해도 조용히 덮어쓴다.
- **한 줄에 변수 하나**만 선언한다. `let x: number = 1, name = 'triangle'`은 타입 표기가 첫 변수에만 붙는다. 변수마다 주석을 달기도 어렵고, IDE 툴팁도 첫 변수에만 뜬다.

## 4. 클래스

| 규칙 | 등급 | 이유 |
| --- | --- | --- |
| 생성자 밖에서 바꾸지 않는 멤버는 `readonly` | 필수 | 재할당을 컴파일 단계에서 막는다. 객체 내부까지 불변은 아니다 |
| `public` 표기는 프로젝트 안에서 일관되게 | 권장 | 기본값이 public이라 붙이거나 안 붙이거나 둘 중 하나로 통일한다 |
| `toString()`은 되도록 재정의하지 않는다 | 필수 | 항상 성공해야 하고 부수 효과가 없어야 한다. JSON 모양을 바꾸려면 `toJSON()`을 재정의한다 |
| 빈 생성자, `super`만 호출하는 생성자는 생략 | 권장 | ES2015 기본 생성자가 같은 일을 한다 |
| `#` private 필드는 꼭 필요할 때만 | 권장 | `Object.keys`·`JSON.stringify`에 안 보여 디버깅이 어렵다. 컴파일 대상이 ES2022 미만이면 WeakMap 코드로 변환돼 무겁다. 타입 수준 은닉이면 충분할 때는 `private` 키워드를 쓴다 |
| 생성자 매개변수 프로퍼티 활용 | 권장 | `constructor(private readonly svc: Svc) {}`로 선언과 초기화를 한 번에 한다. 생성자 로직이 복잡하거나 기본값이 필요하면 예외다 |

## 5. 표현식

- **삼항 연산자는 한 단계까지만** 쓴다(권장). 중첩되면 `if...else`로 푼다.
- **부동소수점을 `===`로 비교하지 않는다**(필수). `0.1 + 0.2 !== 0.3`이다. 차이가 허용 오차보다 작은지 비교한다. `Number.EPSILON`은 1 근처에서의 오차라서 큰 값을 비교할 때는 허용 오차도 그 크기에 맞춰 키운다.

```ts
const equal = (x: number, y: number, tolerance = Number.EPSILON) =>
  Math.abs(x - y) < tolerance;

equal(1000.1 + 1000.2, 2000.3, 2000 * Number.EPSILON); // true
```

- **단항 `+`로 숫자를 변환할 때 조심한다**(권장). `'123f'` 같은 입력은 조용히 `NaN`이 된다.
- 객체를 만들 때는 일관되게 `new`를 붙인다.
- **스프레드 피연산자는 순회 가능한 값**이어야 한다(필수). 배열 스프레드에 `false`·`null`·`undefined`가 오면 런타임 에러가 난다. 객체 스프레드는 이런 값을 그냥 무시한다. `?? []`로 기본값을 준다.
- **스프레드는 먼저 쓰고 덮어쓸 속성은 뒤에** 쓴다(필수). `{ a: 5, ...x }`는 `x.a`가 5를 덮어쓴다. `{ ...x, a: 5 }`가 의도에 맞다.
- **인스턴스를 만든 뒤 속성을 추가·삭제하지 않는다**(참고). V8은 같은 모양의 객체끼리 히든 클래스(Hidden Class)를 공유해 속성 위치를 빨리 찾는다. 나중에 속성을 붙이면 히든 클래스가 새로 생기고 JIT 최적화가 깨진다. 빈 객체를 해시맵처럼 쓰며 키를 계속 붙이는 경우가 대표적이다.

## 6. 제어문

### 블록과 switch

- 반복문과 조건문 본문에는 중괄호를 쓴다. 한 줄짜리 `if`만 경우에 따라 허용한다.
- **`switch`에는 `default`를 반드시 쓴다**(필수, ESLint `default-case`). 예상 못한 값을 잡는다. 할 일이 없어도 `default: // pass`를 써 두면 누락이 아니라 의도임이 드러난다.
- `case`가 두세 개뿐이면 `if...else`를 고려한다.
- `switch (true)` 패턴(참고)은 `case`에 조건식을 나열해 유효성 검사를 이어 쓰는 방식이다. 대부분 `if`로 충분하다. 다만 `||`로 묶인 긴 조건을 여러 `case`로 펼칠 때는 확실히 읽기 쉽다. 팀에서 정한다.

### 순회

| 상황 | 쓰지 말 것 | 쓸 것 |
| --- | --- | --- |
| 객체 키 순회 | 필터 없는 `for...in` (상속 속성까지 돈다) | `Object.hasOwn` 검사, 또는 `Object.keys`·`Object.entries` + `for...of` |
| 배열 순회 | `for...in` (키가 문자열이고 상속 속성까지 돈다) | `for...of`, `forEach` |
| 숫자 카운터 | 소수 증감 `i += 0.1` | 정수로 세고 필요할 때 나눈다 |

### 조건식

- 조건이 길면 `isYoungGiants(age, weight, height)`처럼 함수로 뽑는다.
- **부정 연산자와 부정형 이름을 줄인다**(권장). `!user.notAuthorized || !user.isNotAdmin`은 이중 부정이다. `user.authorized || user.isAdmin`이 바로 읽힌다.

## 7. 함수

- **매개변수가 3개 이상이면 객체 하나로 받는다**(권장). 인터페이스로 묶으면 순서 실수가 없고, 선택 인자와 확장도 쉽다. 위치 인자가 10개를 넘는 SDK 함수에서는 순서 실수가 그대로 버그가 된다. 2개 이하라면 타입 정의가 오히려 비용이다.

```ts
interface UserParams {
  id: number;
  name: string;
  age: number;
}

function createUser({ id, name, age }: Readonly<UserParams>) {
  return { id, name, age };
}
```

- **객체 매개변수는 `Readonly<T>`로 받는다**(권장). 함수 안에서 인자를 고치면 호출한 쪽 원본까지 바뀐다.
- 반환 타입을 명시한다. 의도가 드러나고, 구현이 바뀌어 반환 타입이 어긋나면 컴파일러가 바로 알려 준다. 복잡한 함수에서는 추론이 빗나가는 것도 막는다.

## 8. 에러 처리

- **`catch`를 비워 두지 않는다**(권장). 정말 무시해도 되면 왜 무시하는지 주석을 단다.
- **`throw`와 `reject`에는 `Error`(또는 하위 클래스)만** 넘긴다(필수). 문자열이나 숫자는 스택 추적이 없다.
- **`catch (err: unknown)`으로 받는다**(권장). JS는 아무 값이나 던질 수 있으니 `instanceof Error`로 좁힌 뒤 쓴다. `strict`이면 `useUnknownInCatchVariables`가 켜져 기본이 `unknown`이다.

```ts
try {
  callSomeFunc();
} catch (err: unknown) {
  if (err instanceof Error) console.error(err.message);
  else console.error('Unknown Error', err);
}
```

## 9. 표준 내장 객체

### 배열 메서드

| 규칙 | 등급 |
| --- | --- |
| `map` 콜백은 요소 변환만 한다. 바깥 변수 누적은 `reduce`로 따로 한다 | 필수 |
| `map`의 반환값을 버릴 거면 `forEach`나 `for...of`를 쓴다 | 필수 |
| `Array` 생성자를 쓰지 않는다. `new Array(2)`는 빈 칸 2개, `new Array(2, 3)`은 `[2, 3]`이다 | 필수 |
| `forEach` 콜백에서 값을 반환하지 않는다. 결과가 버려지고 반복을 멈추지도 않는다 | 필수 |
| `forEach`에 `async` 콜백을 넣지 않는다. Promise를 기다리지 않는다 | 필수 |
| 순회 메서드 콜백 안에서 대상 배열을 추가·삭제하지 않는다 | 필수 |
| `reverse`·`sort`·`splice` 대신 `toReversed`·`toSorted`·`toSpliced` | 권장 |

순회 메서드는 시작할 때 `length`를 읽어 두고 그 범위만 돈다. 그래서 콜백에서 `splice`로 요소를 넣으면 뒤쪽 요소를 건너뛰고, 빼면 일찍 끝난다. 결과를 예측하기 어렵다.

### 그 밖의 내장 객체

- 전역 `parseInt`·`parseFloat`·`isNaN`·`isFinite`·`Infinity` 대신 `Number.parseInt`, `Number.isNaN`, `Number.POSITIVE_INFINITY` 등 `Number`의 것을 쓴다(필수).
- `trimLeft`·`trimRight` 대신 `trimStart`·`trimEnd`를 쓴다(필수). 오른쪽에서 왼쪽으로 쓰는 언어에서도 뜻이 맞고 `padStart`·`padEnd`와 이름이 맞는다.
- 해시맵이 필요하면 객체 대신 `Record`나 `Map`을 쓴다(권장). 객체는 크기를 알려면 `Object.keys().length`가 필요하고, 키로 문자열과 Symbol만 쓸 수 있다.
- `with` 같은 폐기된 기능과 아직 표준이 아닌 제안 기능은 쓰지 않는다(필수).

## 10. 주석과 모듈

- JSDoc(TSDoc) 태그를 활용한다: `@param`, `@return`, `@remarks`, `@example`, `@deprecated`, `@throws`, `@see`.
- **JSDoc 본문은 마크다운으로 렌더링된다**(참고). 줄바꿈만 하면 툴팁에서 한 줄로 붙는다. 목록은 `-`로 쓴다.
- **`namespace`를 쓰지 않는다**(필수). ES 모듈 이전의 기능이다. IIFE로 남아 트리 셰이킹이 안 된다.
- **`export default`를 쓰지 않는다**(필수). named export는 잘못된 이름으로 import하면 에러가 나고, default export는 아무 이름으로 받아도 통과해서 이름이 제각각이 된다.
- tsconfig에서 `strict`를 켠다(필수). 소스 파일은 UTF-8로 저장한다. `euc-kr`은 쓰지 않는다.

## 11. 코드 모양

포매터(Prettier)가 대부분 자동으로 맞추지만, 무엇을 왜 맞추는지 알아 두면 설정을 고르고 리뷰할 때 기준이 된다.

| 항목 | 관례 | 이유 |
| --- | --- | --- |
| 여는 중괄호 | 키워드와 같은 줄, 앞에 공백 하나(`if (x) {`) | JS 커뮤니티 대부분의 스타일. `return` 뒤 줄바꿈 같은 ASI 함정도 피한다 |
| 한 줄 `if` | 블록 `{}`을 쓴다. `if (cond) return null`처럼 아주 짧으면 한 줄도 허용 | 중괄호 없이 **다음 줄에** 쓰면 줄을 추가할 때 첫 줄만 조건에 묶인다. 이 모양은 금지 |
| 줄 길이 | 80~120자 중 팀이 정한다 | 긴 조건은 연산자 단위로 줄을 나누고, 긴 문자열은 템플릿 리터럴로 |
| 들여쓰기 | 스페이스 2칸(또는 4칸) | 탭과 섞지 않는다 |
| 빈 줄 | 선언·반복·반환처럼 논리 단위 사이에 한 줄 | 빈 줄 없이 아홉 줄 넘게 이어 쓰지 않는다 |
| 세미콜론 | 쓰거나 안 쓰거나 일관되게 | 안 쓰는 스타일(StandardJS)은 `(`·`[`로 시작하는 줄 앞에 `;`([[statements-vs-expressions\|문과 식]]) |

### 중첩을 줄인다

```typescript
// 예외 상황을 먼저 처리하고 빠져나가면 본 흐름이 한 단계 얕아진다
function pow(x: number, n: number): number {
  if (n < 0) throw new RangeError('n은 음수가 될 수 없다')

  let result = 1
  for (let i = 0; i < n; i++) result *= x
  return result
}

for (const item of items) {
  if (!item.visible) continue // if 블록으로 감싸는 대신 건너뛴다
  render(item)
}
```

### 헬퍼 함수는 사용하는 코드 아래에

함수 선언은 호이스팅되므로 위치를 고를 수 있다. **사용하는 코드를 먼저, 헬퍼 함수를 그 아래에** 두는 배치가 흔하다. 읽는 사람은 "무엇을 하는지"를 먼저 알고 싶어 하고, 헬퍼 이름이 잘 지어졌다면 본문을 열어 보지 않아도 된다. 모듈이라면 헬퍼를 파일로 분리하는 편이 더 낫다.

### 스타일 가이드와 린터

처음부터 규칙을 만들기보다 [Airbnb](https://github.com/airbnb/javascript), [Google](https://google.github.io/styleguide/jsguide.html), [StandardJS](https://standardjs.com/) 같은 공개 가이드에서 출발해 팀에 맞게 고친다. 지키는 일은 사람이 아니라 ESLint(품질)와 Prettier(모양)에 맡긴다. 과거에는 JSLint·JSHint를 썼고 ESLint 설정도 `.eslintrc`였지만, 지금은 flat config(`eslint.config.js`)다([[eslint-prettier|ESLint와 Prettier 설정]]). 스타일 논쟁의 기준은 늘 두 질문이다. **"더 읽기 쉬운가?", "실수를 더 줄이는가?"**

## 12. 피할 코드: 닌자 코드 목록

똑똑해 보이지만 유지보수하는 사람을 괴롭히는 패턴들이다. 리뷰 체크리스트로 쓴다.

| 패턴 | 예 | 대신 |
| --- | --- | --- |
| 짧게 쓰기 경쟁 | `i = i ? i < 0 ? Math.max(0, len + i) : i : 0` | 중첩 삼항은 `if`로 푼다 |
| 한 글자·약어 이름 | `a`, `lst`, `brsr`, 반복문의 `i` 대신 `x` | 좁은 범위의 `i` 외에는 뜻이 보이는 이름(위 「1. 이름 짓기」) |
| 무엇이든 되는 이름 | `data`, `value`, `item`, `obj`, `str`, `data2` | 담긴 것의 의미를 이름에 |
| 철자가 비슷한 이름 | `date`와 `data` 섞어 쓰기 | 구분되는 단어 |
| 같은 동작에 다른 동사 | `displayMessage`, `showName`, `renderUser`, `paintList` | 동작마다 동사 하나로 통일한다. 반대로 다른 동작(`printPage`는 프린터, `printText`는 화면)에 같은 동사를 쓰지 않는다 |
| 변수 재사용 | 함수 중간에 `elem = clone(elem)` | 새 의미에는 새 변수 |
| 의미 없는 `_`·`__` 접두사 | `_name`, `__value`를 기분 따라 | 사용 안 하는 변수 표시(`_`) 같은 합의된 용도만 |
| 과장 형용사 | `superElement`, `megaFrame`, `niceItem` | 수식어를 빼거나 실제 차이를 이름에 |
| 바깥 변수 가리기 | 함수 안에서 바깥과 같은 이름 `user`를 다시 선언 | 다른 이름. ESLint `no-shadow` |
| 이름과 다른 부수 효과 | `isReady()`·`checkPermission()`·`findTags()`가 상태를 바꾸거나 불리언이 아닌 객체를 반환 | `is`·`check`·`find`는 확인만 하고 기대한 타입을 돌려준다 |
| 이름보다 많은 일 | `validateEmail()`이 검사하면서 에러 창까지 띄운다 | 함수 하나에 동작 하나. 그래야 재사용된다 |

함수 이름의 동사 관례(`get…` 값 반환, `calc…` 계산, `create…` 생성, `check…`·`is…` 확인 후 불리언)는 이 목록을 뒤집은 것이다. 동작 하나에 동사 하나를 팀 전체가 같은 뜻으로 쓴다. 이름을 고르는 원칙의 바탕은 [[clear-code-principles|명확한 코드의 네 가지 원칙]]에 있다.

## 정리

- 대부분의 규칙은 **"코드가 의도와 다르게 조용히 동작하는 경우"를 막는다.** 래퍼 객체 비교, 스프레드 덮어쓰기, `forEach` 안의 `await`가 그런 예다.
- 타입 규칙의 중심은 **느슨한 타입(`Object`, `any`성 `catch`, `null`이 섞인 별칭)을 줄이는 것**이다.
- `no-var`, `default-case`처럼 ESLint로 자동화할 수 있는 규칙은 사람이 리뷰할 것이 아니라 린터에 맡긴다. 린터와 포매터를 연결하는 방법은 [[eslint-prettier|ESLint와 Prettier 설정]]에 있다.
- 권장 규칙은 팀이 합의하면 예외를 둘 수 있다. 한글 식별자와 `switch (true)`가 그렇다.
- 코드 모양은 포매터에, 금지 패턴은 린터에 맡기고, 사람은 이름과 함수의 책임처럼 도구가 못 보는 것을 리뷰한다.
- 결국 컨벤션은 정답 목록이 아니라 **팀이 같은 코드를 같은 뜻으로 읽기 위한 합의**다.

관련 노트: [[variables-and-types|변수와 데이터 타입]], [[arrays-and-objects|배열·객체·문자열]], [[class|class 문법]], [[eslint-prettier|ESLint와 Prettier 설정]], [[review-patterns|코드 리뷰에서 자주 나온 지적]], [[typescript-learning|TypeScript 학습법]], [[typescript-advanced-types|TypeScript로 동적인 코드에 정적 타입 입히기]], [[clear-code-principles|명확한 코드의 네 가지 원칙]], [[js-comments|JavaScript 주석]], [[statements-vs-expressions|문(Statement)과 식(Expression)]]
