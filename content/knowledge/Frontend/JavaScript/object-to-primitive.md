---
title: "객체의 원시형 변환"
concept: "ToPrimitive"
summary: "객체가 연산자나 문자열 자리에 오면 엔진은 먼저 원시값으로 바꾼 뒤 계산한다. 불리언 변환은 늘 true이고, 숫자·문자열 변환은 hint(string·number·default)에 따라 Symbol.toPrimitive → toString/valueOf 순서로 메서드를 찾는다. 연산자별 hint, 기본 객체·배열·Date의 동작, [] + {}와 [] == false 같은 결과의 이유, 직접 구현할 때의 규칙을 정리한다."
tags: ["javascript", "frontend", "ecmascript"]
source: other
date: "2026-10-17"
sources: ["https://ko.javascript.info/object-toprimitive", "https://ko.javascript.info/type-conversions", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toPrimitive", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#type_coercion"]
---

> javascript.info(모던 JavaScript 튜토리얼)의 「객체를 원시형으로 변환하기」, 「형 변환」 글을 바탕으로, MDN으로 확인해 재구성한 노트다.

## 왜 필요한가

연산자와 많은 내장 함수는 원시값을 기대한다. 객체가 그 자리에 오면 엔진은 **먼저 객체를 원시값으로 바꾸고(ToPrimitive), 그 원시값으로 원래 연산을 한다.** `date2 - date1`이 밀리초 차이가 되고, `alert(obj)`가 `[object Object]`를 띄우는 것이 이 과정이다. 원시값끼리의 형변환 규칙(문자열·숫자·불리언)은 [[operators-and-control-flow|연산자와 제어문]]에 있다.

**불리언 변환은 이 과정을 거치지 않는다.** 객체는 내용과 상관없이 언제나 truthy다(`[]`, `{}`, `new Boolean(false)` 모두). 그래서 실제로 다루는 것은 숫자와 문자열 두 방향뿐이다.

## hint: 어떤 원시값을 원하나

엔진은 변환을 부를 때 원하는 타입을 **hint**로 알려 준다.

| hint | 언제 | 예 |
| --- | --- | --- |
| `"string"` | 문자열이 필요할 때 | `String(obj)`, `` `${obj}` ``, `alert(obj)`, `anotherObj[obj] = 1`(속성 키) |
| `"number"` | 수학 연산·비교 | `Number(obj)`, `+obj`, `obj1 - obj2`, `obj * 2`, `obj1 > obj2` |
| `"default"` | 어느 쪽인지 정할 수 없을 때 | 이항 `obj + x`, `obj == x` |

- `<`·`>`는 문자열도 비교하지만 하위 호환 때문에 hint를 `"number"`로 고정한다.
- `"boolean"` hint는 없다.
- `Date`를 뺀 내장 객체는 `"default"`를 `"number"`와 똑같이 처리한다. 직접 구현할 때도 그렇게 맞추면 된다.

## 엔진이 메서드를 찾는 순서

```text
1. obj[Symbol.toPrimitive](hint)가 있으면 그것을 부른다. 원시값이 아니면 TypeError
2. 없으면 hint가 "string"일 때:          toString() → valueOf()
   hint가 "number"·"default"일 때:       valueOf()  → toString()
   앞 메서드가 객체를 돌려주면 무시하고 다음 메서드를 쓴다. 둘 다 객체면 TypeError
3. 얻은 원시값이 연산에 맞지 않으면 원시값 규칙으로 한 번 더 바꾼다
```

일반 객체의 기본 메서드는 `toString()`이 `'[object Object]'`, `valueOf()`가 **객체 자신**이다. `valueOf`가 객체를 돌려주니 무시되고, 결국 거의 모든 변환이 `toString`으로 떨어진다. `valueOf`가 이렇게 쓸모없는 것은 역사적 이유다.

3단계 때문에 반환 타입은 hint를 보장하지 않는다. `toString()`이 `"2"`를 돌려주면 `obj * 2`는 `"2" * 2`가 되어 `4`, `obj + 2`는 문자열 연결이 되어 `"22"`다.

## 내장 객체는 어떻게 바뀌나

| 값 | 문자열로 | 숫자로 | 이유 |
| --- | --- | --- | --- |
| `{}` | `'[object Object]'` | `NaN` | 기본 `toString` |
| `[]` | `''` | `0` | 배열의 `toString`은 `join(',')`이다 |
| `[1]`, `[1, 2]` | `'1'`, `'1,2'` | `1`, `NaN` | 같다 |
| `new Date(0)` | 날짜 문자열 | `0`(타임스탬프) | `Date`만 `"default"`를 `"string"`으로 처리한다 |
| `function f() {}` | 함수 소스 | `NaN` | `Function.prototype.toString` |

그래서 이상해 보이는 결과들이 규칙대로 나온다.

| 식 | 결과 | 과정 |
| --- | --- | --- |
| `[] + []` | `''` | 둘 다 `''`이 되어 연결 |
| `[] + {}` | `'[object Object]'` | `''` + `'[object Object]'` |
| `[1] + 1` | `'11'` | `[1]` → `'1'`, 문자열이 섞였으니 연결 |
| `[] == false` | `true` | `[]` → `''` → `0`, `false` → `0` |
| `date2 - date1` | 밀리초 차이 | `"number"` hint라 `getTime()`과 같은 값 |
| `date + 1` | `'Thu Jan 01 1970 …1'` | Date는 `"default"`를 문자열로 본다 |

`{} + []`를 콘솔 맨 앞에 치면 `0`이 나오는데, 맨 앞의 `{}`가 빈 블록으로 읽혀 `+[]`만 계산되기 때문이다([[statements-vs-expressions|문과 식]]).

## 직접 구현하기

### Symbol.toPrimitive 하나로

```javascript
const user = {
  name: 'John',
  money: 1000,
  [Symbol.toPrimitive](hint) {
    return hint === 'string' ? `{name: "${this.name}"}` : this.money
  },
}
String(user)  // '{name: "John"}'
+user         // 1000
user + 500    // 1500: "default"를 숫자로 처리했다
```

[[js-symbol|Symbol]]의 well-known symbol 중 하나로, 세 hint를 한곳에서 처리한다. 반드시 원시값을 돌려줘야 하고, 아니면 `TypeError`다.

### toString / valueOf로

Symbol 이전부터 쓰던 방식이다. `toString`은 문자열 hint, `valueOf`는 나머지를 맡는다. 반환값이 객체면 에러 없이 **무시된다**(에러 개념이 약하던 시절의 흔적이다).

```javascript
const user = {
  name: 'John',
  toString() { return this.name },
}
String(user)   // 'John'
user + 500     // 'John500': valueOf가 객체 자신이라 toString까지 내려온다
```

### 실무 규칙

- 대부분은 **`toString()`만** 사람이 읽을 문자열로 구현하면 충분하다. 로그와 디버깅에도 쓰인다.
- 돈·벡터처럼 숫자처럼 계산되는 값 객체라면 `Symbol.toPrimitive`로 숫자 hint를 명시한다.
- 객체를 `+`로 문자열과 섞거나 `==`로 비교하는 코드는 이 규칙을 외워야 읽힌다. 명시적으로 `String(x)`·`Number(x)`·`x.getTime()`을 쓴다.
- JSON 모양은 이 과정과 무관하다. `JSON.stringify`는 `toJSON`을 본다([[json|JSON: stringify와 parse]]).

## 정리

- 객체는 불리언으로는 늘 `true`, 숫자·문자열로는 ToPrimitive를 거친다.
- hint는 `"string"`·`"number"`·`"default"`. 이항 `+`와 `==`만 `"default"`이고, Date만 이것을 문자열로 처리한다.
- 순서는 `Symbol.toPrimitive` → (문자열이면) `toString`·`valueOf` / (그 외) `valueOf`·`toString`.
- 일반 객체의 `valueOf`는 자기 자신이라 무시된다. 그래서 `[]`는 `''`, `{}`는 `'[object Object]'`가 된다.
- 직접 만들 때는 `toString`이면 대개 충분하고, 숫자처럼 쓰려면 `Symbol.toPrimitive`.

관련 노트: [[operators-and-control-flow|연산자와 제어문]], [[js-symbol|Symbol]], [[variables-and-types|변수와 데이터 타입]], [[json|JSON: stringify와 parse]], [[date-libraries|날짜 라이브러리]]
