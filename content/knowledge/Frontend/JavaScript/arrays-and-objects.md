---
title: "배열·객체 다루기"
concept: "Array Methods"
summary: "배열의 주요 메서드, length가 가장 큰 인덱스 + 1인 이유와 shift가 느린 이유, 배열 리터럴과 new Array(n)의 빈 슬롯(희소 배열), Array.from 같은 정적 메서드, 원본을 바꾸는 메서드와 바꾸지 않는 메서드(slice·toSorted·with), sort 비교 함수, 콜백을 받는 헬퍼 메서드와 콜백을 만드는 함수, reduce로 세기·묶기, 객체 리터럴과 키가 문자열로 바뀌는 규칙, 속성 접근과 Object.keys·entries, in·Object.hasOwn으로 속성 확인, spread의 얕은 복사가 빠뜨리는 것, rest, 형식화 배열. 문자열·구조 분해·JSON은 각자의 노트로 나눴다."
tags: ["javascript", "data-structure", "frontend"]
source: mixed
date: "2026-10-21"
sources: ["https://riverkim.kr/74", "https://riverkim.kr/164", "https://riverkim.kr/177", "https://riverkim.kr/183", "https://riverkim.kr/176", "https://riverkim.kr/104", "https://yozm.wishket.com/magazine/detail/1585/", "https://wesbos.com/javascript/08-data-types/objects", "https://wesbos.com/javascript/08-data-types/arrays", "https://wesbos.com/javascript/08-data-types/46-array-cardio-static-methods", "https://wesbos.com/javascript/08-data-types/47-array-cardio-instance-methods", "https://wesbos.com/javascript/08-data-types/48-array-cardio-callback-methods-and-function-generation", "https://wesbos.com/javascript/09-gettin-loopy/49-looping-and-iterating-array-foreach", "https://wesbos.com/javascript/09-gettin-loopy/50-looping-and-iterating-mapping", "https://wesbos.com/javascript/09-gettin-loopy/51-looping-and-iterating-filter-find-and-higher-order-functions", "https://wesbos.com/javascript/09-gettin-loopy/52-looping-and-iterating-reduce", "https://wesbos.com/javascript/09-gettin-loopy/53-looping-and-iterating-reduce-exercise", "https://web.dev/learn/javascript/data-types/string", "https://web.dev/learn/javascript/objects", "https://web.dev/learn/javascript/objects/property-accessors", "https://web.dev/learn/javascript/collections/indexed", "https://ko.javascript.info/object", "https://ko.javascript.info/array", "https://ko.javascript.info/array-methods", "https://ko.javascript.info/keys-values-entries", "https://ui.toast.com/weekly-pick/ko_20190515/", "https://dmitripavlutin.com/power-up-the-array-creation-in-javascript/"]
---

> 개인 TIL과 요즘IT 글을 바탕으로, Wes Bos의 「Beginner JavaScript」 강의 노트(wesbos.com/javascript)와 web.dev의 「[Learn JavaScript](https://web.dev/learn/javascript)」 강좌(문자열·객체·인덱스 컬렉션 모듈), javascript.info(모던 JavaScript 튜토리얼)의 「객체」, 「배열」, 「배열과 메서드」, 「Object.keys, values, entries」 글을 함께 참고해 보강했다. lodash 대체표는 「[Lodash의 대체재로서의 순수 자바스크립트 함수](https://ui.toast.com/weekly-pick/ko_20190515/)」를 바탕으로 최신 메서드를 더해 정리했다. 배열 생성 방법은 「[Power up the array creation in JavaScript](https://dmitripavlutin.com/power-up-the-array-creation-in-javascript/)」을 바탕으로 보강했다.

데이터를 가공하는 코드의 대부분은 배열과 객체를 다루는 코드다. 특히 `map`, `filter`, `reduce` 같은 **배열 헬퍼 메서드**와 ES6 객체 문법은 React 코드에서 매일 쓰인다.

## 문자열

문자열 리터럴과 이스케이프, `slice`·`includes` 같은 문자열 메서드, 유니코드 순 비교와 `localeCompare`, 이모지가 깨지는 서로게이트 쌍과 정규화는 [[js-strings|문자열 다루기]]에 따로 정리했다. 문자열을 배열로 나누는 `split`은 그쪽에, 배열을 문자열로 잇는 `join`은 아래 표에 있다. 정규식을 받는 `replace`·`split`·`match`는 [[regular-expressions|정규 표현식: 문법·플래그·메서드]]에 있다.

## 배열

배열은 순서를 보장하는 특수한 객체로, 0부터 시작하는 인덱스를 키로 가지며(zero-indexing) `length` 속성을 가진다. 어떤 타입의 값이든 섞어 담을 수 있고, 배열 안에 배열이나 객체도 넣는다. 인덱스는 내부적으로 문자열 키라서 `arr['2']`도 `arr[2]`와 같지만, 임의의 문자열을 인덱스로 쓰는 연관 배열은 아니다(그런 용도는 객체나 Map). 마지막 원소는 `arr[arr.length - 1]` 또는 `arr.at(-1)`이고, `arr[arr.length]`는 `undefined`다. `typeof []`는 `'object'`라서 배열 판별은 `Array.isArray(x)`로 한다. 객체이므로 대입·전달하면 참조가 복사된다.

`length`는 요소 개수가 아니라 **가장 큰 인덱스 + 1**이다. `arr[123] = 'x'`를 하면 `length`가 124가 된다. 쓰기도 된다. 줄이면 뒤쪽이 **잘려 나가 되돌릴 수 없고**, `arr.length = 0`은 배열을 비우는 가장 짧은 방법이다(같은 배열을 참조하는 다른 변수에서도 비워진다).

엔진은 배열을 연속된 메모리에 두는 등 "순서 있는 목록"으로 최적화한다. `arr.name = 'x'`처럼 숫자가 아닌 키를 붙이거나, `arr[0]`과 `arr[1000]`만 채우거나, 뒤에서부터 채우면 일반 객체처럼 취급되어 그 최적화가 사라진다. 임의의 키가 필요하면 객체나 Map을 쓴다. 배열의 `toString()`은 `join(',')`이라 `[] + 1`은 `'1'`, `[1, 2] + 1`은 `'1,21'`이 된다([[object-to-primitive|객체의 원시형 변환]]).

### 배열 만들기: 리터럴과 빈 슬롯

배열은 리터럴 `[1, 2, 3]`로 만든다. `new Array(1, 2, 3)`도 같은 결과지만 **인자가 숫자 하나일 때만 동작이 다르다.** `new Array(3)`은 `[3]`이 아니라 길이 3의 **빈 슬롯(empty slot)** 배열이다. 헷갈리므로 늘 리터럴을 쓴다.

```javascript
const empty = new Array(3) // [ <3 empty items> ], 길이만 3
const holes = [1, , 3]     // [1, <1 empty item>, 3], 쉼표 사이를 비워도 생긴다
holes.length               // 3
holes.map((x) => x * 2)    // [2, <1 empty item>, 6], map·forEach는 빈 슬롯을 건너뛴다
for (const x of holes) {}  // 1, undefined, 3, for...of는 undefined로 읽는다
```

빈 슬롯이 있는 배열을 **희소 배열(sparse array)** 이라 한다. 빈 슬롯은 `undefined`를 넣은 칸과 다르고, 메서드마다 건너뛰거나 `undefined`로 읽는 등 다르게 취급해서 버그를 만든다. 언어 초기 설계의 흔적이라 의도적으로 만들지 않는다. 미리 길이를 정해야 하면 `Array(n).fill(값)`이나 `Array.from({ length: n }, …)`으로 칸을 채운다.

### 정적 메서드: 배열 만들기

개별 배열이 아니라 `Array` 자체에 달린 메서드를 정적 메서드라 한다. `Array.from`의 두 번째 인자는 각 칸을 채울 map 함수라서, `{ length: n }`을 넘기면 범위(range)를 한 줄로 만든다.

```javascript
Array.from({ length: 5 }, (_, i) => i + 1) // [1, 2, 3, 4, 5]
Array.from(document.querySelectorAll('p'))  // 유사 배열·iterable → 진짜 배열
Array(3).fill('x')                          // ['x', 'x', 'x']
```

`fill`은 **같은 값 하나를 모든 칸에 넣는다.** 객체·배열을 넘기면 모든 칸이 같은 객체를 가리킨다. `Array(3).fill([])`로 2차원 배열을 만든 뒤 `grid[0].push(1)`하면 세 행이 모두 바뀐다. 칸마다 새 객체가 필요하면 `Array.from({ length: 3 }, () => [])`처럼 map 함수로 만든다.

### 원본을 바꾸는 메서드와 바꾸지 않는 메서드

`numbers = [1, 2, 3]`에서 시작한다고 할 때:

| 메서드 | 설명 | 원본 변경 | 예 |
| --- | --- | --- | --- |
| `push` / `pop` | 맨 뒤에 추가 / 맨 뒤 제거. `push`는 새 길이, `pop`은 뺀 값을 반환 | O | `push(9)` → `[1, 2, 3, 9]` |
| `unshift` / `shift` | 맨 앞에 추가 / 맨 앞 제거. **나머지 요소를 모두 한 칸씩 옮기므로 길이에 비례해 느리다** | O | `unshift(0)` → `[0, 1, 2, 3]` |
| `splice(start, count, ...items)` | start부터 **count개**를 잘라 내고 끼우기. 잘라 낸 요소의 배열을 반환. `count`가 `0`이면 끼우기만, `start`가 음수면 뒤에서 센다 | O | `splice(1, 1)` → 원본이 `[1, 3]` |
| `sort` / `reverse` | 정렬 / 뒤집기 | O | `reverse()` → `[3, 2, 1]` |
| `slice(start, end)` | start부터 **end 앞까지** 잘라 낸 새 배열. 인자가 없으면 복사 | X | `slice(0, 2)` → `[1, 2]` |
| `toSorted` / `toReversed` / `toSpliced` / `with(i, v)` | 정렬·뒤집기·자르기와 인덱스 대입의 **복사본 버전**(ES2023) | X | `with(0, 9)` → `[9, 2, 3]` |
| `concat` / `flat()` / `flatMap(fn)` | 이어 붙인 새 배열 / 한 단계 펼친 새 배열 / `map` 뒤 한 단계 펼치기 | X | `[[1], [2]].flat()` → `[1, 2]` |
| `includes(v)` / `indexOf(v)` / `lastIndexOf(v)` | 포함 여부 / 처음·마지막 인덱스(없으면 `-1`). `===`로 비교하되 **`includes`만 `NaN`을 찾는다** | X | `[NaN].indexOf(NaN)` → `-1`, `[NaN].includes(NaN)` → `true` |
| `fill(v, start, end)` / `copyWithin` | 구간을 값으로 채우기 / 구간을 복사해 덮어쓰기 | O | `Array(3).fill(0)` → `[0, 0, 0]` |
| `join(sep)` | 구분자로 이어 붙인 문자열(기본 `,`) | X | `join(' or ')` → `'1 or 2 or 3'` |

`slice`와 `splice`는 이름이 비슷해 늘 헷갈린다. **`slice`는 복사, `splice`는 수술**이다. React state처럼 원본을 바꾸면 안 되는 곳에서는 복사본 버전을 쓴다.

```javascript
const added   = [...names, 'lux']                       // push 대신
const removed = comments.filter((c) => c.id !== id)     // id로 하나 빼기
const inserted = bikes.toSpliced(2, 0, 'benotto')       // 2번 자리에 끼우기
const sorted  = items.toSorted(byPrice)                 // [...items].sort(byPrice)와 같다
const unique  = [...new Set([...arr1, ...arr2])]        // 합치고 중복 제거
;[a, b] = [b, a]                                        // 임시 변수 없이 두 값 교환
```

spread(`[...arr]`)는 **얕은 복사**다. 깊은 복사와 참조 공유는 [[variables-and-types|변수와 데이터 타입]]의 「값과 참조」에, `Set`은 [[map-and-set|Map과 Set]]에 있다.

- `push`·`pop`은 끝만 건드려 빠르고, `shift`·`unshift`는 모든 인덱스를 다시 매겨 느리다. 큐를 크게 쓰면 인덱스 포인터를 두거나 별도 자료구조를 쓴다([[data-structures|기초 자료구조]]).
- `concat`은 인자로 받은 배열은 펼치지만, `length`와 숫자 키가 있는 **유사 배열 객체는 통째로 한 요소로** 넣는다. 그 객체에 `[Symbol.isConcatSpreadable]: true`를 두면 펼친다.
- **`delete arr[i]`로 요소를 지우지 않는다.** 그 칸이 빈 슬롯이 될 뿐 `length`도 그대로다. 빼려면 `splice`나 `filter`·`toSpliced`를 쓴다.

`includes`·`indexOf`는 `===`로 비교하므로 **내용이 같은 다른 객체는 찾지 못한다**(`[{ a: 1 }].includes({ a: 1 })`은 `false`). 객체 배열에서는 콜백으로 찾는 `find`·`findIndex`·`some`을 쓴다.

### sort와 비교 함수

`sort()`는 기본적으로 **요소를 문자열로 바꿔** 사전 순으로 정렬한다. 그래서 숫자 배열은 `[1, 100, 2]`처럼 정렬된다. 숫자나 객체는 비교 함수 `(a, b) => …`를 넘긴다. 반환값이 음수면 a가 앞, 양수면 b가 앞, 0이면 그대로다.

```javascript
nums.sort((a, b) => a - b)                           // [1, 2, 100] 오름차순 (b - a면 내림차순)
names.sort((a, b) => a.localeCompare(b, 'ko'))       // 문자열은 로케일 기준 비교
Object.entries(prices).sort(([, a], [, b]) => b - a) // 객체를 값 기준으로 정렬한 [키, 값] 배열
```

비교 함수는 크기만 맞으면 아무 숫자나 돌려줘도 된다(그래서 `a - b`가 된다). 정렬은 **안정 정렬(stable)** 이라 비교 결과가 0인 요소는 원래 순서를 지킨다(ES2019). 그래서 "이름순으로 정렬한 뒤 학년순으로 다시 정렬"하면 같은 학년 안에서 이름순이 유지된다. 엔진이 어떤 알고리즘을 쓰는지(V8은 TimSort)는 결과에 영향이 없다. 문자열 비교 규칙은 [[js-strings|문자열 다루기]]에 있다.

### 헬퍼 메서드 (콜백을 받는 메서드)

배열을 순회하며 인자로 받은 **콜백 함수**를 각 요소에 실행한다. 콜백은 `(element, index, array)`를 받는다. 원본은 바꾸지 않는다.

| 메서드 | 반환 | 용도 | `[1, 2, 3, 4, 5]`에서 |
| --- | --- | --- | --- |
| `forEach` | 없음(`undefined`) | 부수 효과(DOM 갱신, 로그, 이벤트 연결) | `forEach((n, i) => console.log(n, i))` |
| `map` | 콜백 반환값으로 만든 **같은 길이의 새 배열** | 모든 요소를 변환 | `map(n => n * 2)` → `[2, 4, 6, 8, 10]` |
| `filter` | 콜백이 참인 요소만 모은 **새 배열**(없으면 `[]`) | 걸러내기 | `filter(n => n % 2)` → `[1, 3, 5]` |
| `reduce` | 누적된 **하나의 값** | 합계, 세기, 묶기 | `reduce((acc, n) => acc + n, 0)` → `15` |
| `find` / `findIndex` | 콜백이 참인 **첫 요소** / 그 인덱스(없으면 `undefined` / `-1`) | 하나 찾기 | `find(n => n > 3)` → `4` |
| `findLast` / `findLastIndex` | 뒤에서부터 찾은 첫 요소 / 그 인덱스(ES2023) | 마지막 일치 | `findLast(n => n % 2)` → `5` |
| `some` | 하나라도 참이면 `true` (빈 배열은 `false`) | 존재 검사 | `some(n => n > 4)` → `true` |
| `every` | 모두 참이면 `true` (빈 배열은 `true`) | 전체 검사 | `every(n => n > 0)` → `true` |

- 콜백은 **호출하지 않고 함수 자체를 넘긴다**. `arr.map(capitalize)`이지 `arr.map(capitalize())`가 아니다.
- `map`·`filter`는 새 배열을 돌려주므로 한 줄에 하나씩 이어 쓸 수 있다: `text.split('').filter(isValidChar).map(toLower)`.
- 콜백을 받는 메서드 대부분(`sort` 제외)은 마지막 인자 `thisArg`를 받아 콜백의 `this`로 쓴다. `users.filter(army.canJoin, army)`처럼 메서드를 넘길 때 `this`를 잃지 않게 한다. 요즘은 `users.filter((u) => army.canJoin(u))`처럼 화살표 함수로 감싸는 편이 흔하다([[functions|함수와 this]]).
- `map` 안에서 DOM을 바꾸는 등 바깥을 건드리지 않는다. 그런 일은 `forEach`나 `for...of`가 맡는다. 반환값이 필요 없는데 `map`을 쓰면 버려지는 배열이 생긴다.

### 콜백을 만드는 함수

같은 모양의 콜백을 값만 바꿔 여러 번 쓴다면, **콜백을 반환하는 함수**(고차 함수)를 만든다. 반환된 함수는 바깥 함수의 인자를 클로저로 기억한다([[scope-and-closures|스코프와 클로저]]).

```javascript
const findByProp = (prop, value) => (item) => item[prop] === value

students.find(findByProp('id', '565a'))
students.filter(findByProp('grade', 3))
```

여기서 `findByProp(...)`는 지금 호출하는 것이 맞다. 호출 결과가 `find`에 넘길 콜백이기 때문이다. 속성 이름이 변수로 들어오므로 점 표기 대신 대괄호 `item[prop]`를 쓴다. 고차 함수의 일반 개념은 [[functional-programming|함수형 프로그래밍]]에 있다.

### reduce와 리듀서 함수

`arr.reduce(callback[, initialValue])`에 넘기는 콜백을 **리듀서(reducer)** 라고 한다. 콜백은 `(acc, cur, idx, src)`를 받는다. **리듀서가 반환한 값이 다음 호출의 `acc`가 된다.** 반환을 잊으면 다음 회차의 `acc`는 `undefined`다.

`initialValue`는 첫 호출 때 `acc`에 들어가는 값이다. 생략하면 첫 요소가 쓰이고, **빈 배열에 initialValue 없이 호출하면 에러**가 난다. 결과 타입이 드러나도록 늘 넘기는 편이 안전하다.

```javascript
const total = inventory.reduce((sum, item) => sum + item.price, 0)

// 종류별로 세기: 빈 객체에서 시작해 키가 없으면 0으로 보고 더한다
const counts = inventory.reduce((acc, item) => {
  acc[item.type] = (acc[item.type] ?? 0) + 1
  return acc
}, {})

// 종류별로 묶기는 ES2024 표준 메서드로 대신한다
const byType = Object.groupBy(inventory, (item) => item.type) // { shirt: [...], pants: [...] }
```

`reduceRight`는 같은 일을 오른쪽 끝부터 한다.

요소마다 결과가 하나씩 필요하면 `map`, 여러 조각을 **하나로 합쳐야** 하면 `reduce`를 쓴다. 바깥 변수를 두고 `forEach`로 더하는 방식은 함수 밖 상태를 바꾸는 부수 효과라 `reduce`보다 추적하기 어렵다.

### lodash 대신 네이티브로

lodash의 상당수 함수는 언어에 들어왔다. 네이티브로 되면 의존성과 번들이 줄고, 읽는 사람이 라이브러리 어휘를 몰라도 된다.

| lodash | 네이티브 |
| --- | --- |
| `_.find`, `_.filter`, `_.some`, `_.every`, `_.includes` | 같은 이름의 배열 메서드 |
| `_.uniq(arr)` | `[...new Set(arr)]` |
| `_.compact(arr)` | `arr.filter(Boolean)` |
| `_.head`, `_.tail`, `_.last` | `const [first, ...rest] = arr`, `arr.at(-1)` |
| `_.flatten`, `_.flatMap` | `arr.flat()`, `arr.flatMap(fn)` |
| `_.groupBy` | `Object.groupBy(arr, fn)`, 키가 객체면 `Map.groupBy` |
| `_.sortBy` | `arr.toSorted((a, b) => a.price - b.price)` |
| `_.range(n)` | `Array.from({ length: n }, (_, i) => i)` |
| `_.get(obj, 'a.b.c')` | `obj?.a?.b?.c` |
| `_.pick(obj, keys)` | `Object.fromEntries(keys.map((k) => [k, obj[k]]))` |
| `_.cloneDeep` | `structuredClone(obj)` ([[variables-and-types\|변수와 타입]]) |
| `_.debounce`, `_.throttle` | 짧게 직접 구현하거나 라이브러리를 유지한다([[debounce-throttle\|Debounce와 Throttle]]) |

**네이티브가 늘 더 빠르지는 않다.** 엔진과 데이터 크기에 따라 lodash 구현이 이기기도 한다. 기준은 속도보다 단순함이다. 깊은 병합(`_.merge`)처럼 네이티브에 없는 기능이 필요하면 lodash를 쓰되 `lodash-es`나 개별 함수 import로 쓰는 것만 번들에 넣는다.

## 객체

원시값과 달리 객체는 **변경 가능(mutable)** 하다. 중괄호 안에 `key: value` 쌍으로 속성을 나열한다. key는 문자열(또는 [[js-symbol|Symbol]])이고, value는 함수를 포함해 어떤 타입이든 된다. 함수인 속성을 메서드라 하며, 화살표 함수로 만든 메서드는 자기 `this`가 없다([[functions|함수와 this]]). 마지막 속성 뒤에도 쉼표(trailing comma)를 두면 다음 속성을 추가할 때 diff가 한 줄로 끝난다.

### 객체 리터럴의 키

속성 이름에는 변수와 달리 **예약어도 쓸 수 있다**(`{ for: 1, let: 2, return: 3 }`). 예외는 `__proto__` 하나다. 일반 객체에 `obj.__proto__ = 5`처럼 원시값을 넣으면 무시된다. `__proto__`는 프로토타입을 가리키는 옛 접근자라서다([[prototype-and-inheritance|프로토타입과 상속]]). 사용자 입력을 키로 받는 사전은 `Object.create(null)`이나 Map으로 만든다.

| 키 모양 | 예 | 비고 |
| --- | --- | --- |
| 식별자 | `{ color: 'red' }` | 가장 흔하다. 따옴표는 필요 없다 |
| 따옴표 문자열 | `{ 'cool-dude': true }` | 식별자 규칙에 안 맞는 키 |
| 숫자 | `{ 1: 'a' }` | 문자열 `'1'`로 저장된다 |
| 계산된 키 | `` { [`id_${n}`]: 1 } `` | 대괄호 안의 식을 평가한다. 템플릿 리터럴은 이 자리에서만 키가 된다(`` { `k`: 1 } ``은 SyntaxError) |

**문자열이 아닌 키는 문자열로 바뀐다.** `obj[10]`과 `obj['10']`, `obj[false]`와 `obj['false']`는 같은 속성이다. 객체를 키로 넣으면 `'[object Object]'`가 되어 모두 한 칸에 겹친다. 진짜로 객체·숫자를 키로 쓰려면 [[map-and-set|Map]]이다.

문을 시작하는 자리의 `{`는 블록으로 읽힌다. 그래서 콘솔에 `{ a: 1 }`만 치거나 화살표 함수에서 객체를 바로 반환할 때는 `({ a: 1 })`처럼 괄호로 감싼다([[statements-vs-expressions|문과 식]]). 변수에 대입할 때는 필요 없다. `new Object()`도 빈 객체를 만들지만 리터럴과 차이가 없고 리터럴은 만들면서 채울 수 있어 리터럴을 쓴다.

### 속성 접근

| 표기 | 언제 | 예 |
| --- | --- | --- |
| `obj.key` | 기본 | `person.age` |
| `obj['key']` | key에 공백·하이픈이 있거나 숫자로 시작 | `person['cool-dude']` |
| `obj[변수]` | key가 변수에 담겨 있을 때. `obj.변수`는 이름 그대로 `'변수'` 속성을 찾는다 | `person[propertyToCheck]` |

- 점 표기는 키가 **유효한 식별자**일 때만 된다. `obj.1`이나 `obj.key with spaces`는 SyntaxError다. 대괄호는 안의 식을 평가해 문자열(또는 Symbol)로 바꾼 키를 찾으므로 `colors['color' + n]`처럼 키를 실행 중에 조립할 수 있다. 두 표기 모두 대입하면 속성을 만들거나 바꾼다.
- 없는 속성은 `undefined`이고, **`undefined`의 속성을 읽으면 `TypeError`** 가 난다. 중첩 접근은 `obj.jobs?.side`로 쓴다(ES2020 옵셔널 체이닝).
- 속성 삭제는 `delete obj.key`다. `obj.key = undefined`는 속성을 남긴 채 값만 비운다.
- **속성이 있는지**는 `'key' in obj`나 `Object.hasOwn(obj, 'key')`로 본다. `obj.key === undefined`는 값이 `undefined`로 들어 있는 속성과 없는 속성을 구분하지 못한다. `in`은 프로토타입에서 물려받은 속성도 `true`, `Object.hasOwn`은 자기 속성만 `true`다.
- 속성 순서는 정해져 있다. **정수처럼 생긴 키는 오름차순으로 먼저, 나머지 문자열 키는 넣은 순서**대로다. "정수처럼 생긴 키"는 정수로 바꿨다 다시 문자열로 바꿔도 그대로인 키다. `'49'`는 해당하지만 `'+49'`, `'1.2'`, `'007'`은 아니다. 국가 번호를 넣은 순서로 보여 주려고 `'+49'`처럼 키를 바꾸는 우회도 있지만, 순서가 중요하면 배열로 담는 편이 낫다. 순서 자체가 데이터라면 배열이나 [[map-and-set|Map]]을 쓴다.

### Object.keys · values · entries

객체를 배열로 바꿔 배열 메서드를 쓰게 해 준다. 상속한 속성과 **Symbol 키 속성**은 빼고 자기 문자열 키 속성만 담는다(Symbol 키까지는 `Reflect.ownKeys`). Map·Set·배열의 `.keys()`가 이터레이터를 주는 것과 달리 **진짜 배열**을 돌려주고, `obj.keys()`가 아니라 `Object.keys(obj)`로 부른다. 객체가 자기 `keys` 메서드를 가져도 부딪치지 않게 하려는 설계다.

```javascript
const meats = { beyond: 10, beef: 5, pork: 7 }
Object.keys(meats)    // ['beyond', 'beef', 'pork']
Object.values(meats).some((qty) => qty >= 5) // true
Object.entries(meats).forEach(([meat, qty]) => console.log(meat, qty)) // 매개변수에서 바로 구조 분해
Object.fromEntries(Object.entries(meats).filter(([, qty]) => qty > 6)) // { beyond: 10, pork: 7 }
```

`entries`로 바꿔 `map`·`filter`·`sort`한 뒤 `Object.fromEntries`로 다시 객체로 돌리는 것이 객체를 변환하는 기본 패턴이다.

### ES6 객체 문법과 구조 분해

```javascript
const obj = {
  name,                        // 속성명 축약: name: name
  greeting() {},               // 메서드 축약: function 키워드 생략 (화살표 함수가 아니다)
  [key]: ['서울', '대전'],      // 계산된 속성명: key 값이 속성 이름이 됨
}
const merged = { ...meat, ...veggie, oyster: 10 } // 키가 겹치면 뒤에 쓴 값이 이긴다

const [first, , third] = ['a', 'b', 'c']                      // 배열은 순서로
const { title, author = '작자 미상', ...others } = book       // 객체는 이름으로, 기본값과 나머지
;({ x, y } = point)                                           // 이미 선언한 변수에 할당할 때는 괄호
function Btn({ buttonName }) {}                               // 매개변수에서 바로 (React props)
```

구조 분해는 배열 패턴은 **순서로**, 객체 패턴은 **이름으로** 짝을 맞춘다. 기본값이 `undefined`일 때만 쓰이는 규칙, 이름 바꾸기, 중첩 패턴, 변수 교환, 매개변수 객체를 분해하는 「똑똑한 함수 매개변수」는 [[destructuring|구조 분해 할당]]에 있다.

### spread와 rest

`...`은 자리에 따라 반대로 동작한다. **펼치는** spread는 함수 호출의 인자 자리, 배열 리터럴, 객체 리터럴 안에서만 쓸 수 있다. `const x = ...arr`처럼 단독으로는 못 쓴다. **모으는** rest는 구조 분해와 매개변수 자리에서 쓴다(rest 매개변수는 [[functions|함수와 this]]에 있다).

```javascript
Math.max(...[3, 1, 2])           // 3, 배열을 인자로 펼치기
const copy = [...arr]            // 배열 복사
const merged = { ...a, ...b }    // 객체 병합(ES2018)
const chars = [...'héllo']       // 문자열도 이터러블이라 펼쳐진다
```

- 배열·문자열·Map·Set은 [[iterators-and-generators|이터러블]]이라 배열 자리에 펼친다. 일반 객체는 이터러블이 아니어서 `[...obj]`는 `TypeError`다. 반대로 `{ ...arr }`는 `{ 0: …, 1: … }`처럼 인덱스 키를 가진 객체가 될 뿐이니 섞어 쓰지 않는다.
- 객체 spread는 **자기 속성 중 열거 가능한 것만** 복사한다. 원본의 프로토타입, `enumerable: false`인 속성, getter의 정의(값만 복사된다)는 따라오지 않는다([[property-descriptors|속성 설명자]]). 그래서 클래스 인스턴스를 spread하면 메서드가 없는 평범한 객체가 된다.

## 형식화 배열(TypedArray)

`Uint8Array`, `Float32Array` 같은 **형식화 배열**은 이진 데이터를 정해진 숫자 형식으로 담는 배열이다. 파일 업로드, 이미지 픽셀(`ImageData.data`는 `Uint8ClampedArray`), WebGL, 오디오, 네트워크 버퍼처럼 바이트를 직접 다룰 때 쓴다. 모두 `%TypedArray%`라는 공통 부모를 상속하지만 그 부모는 직접 호출하거나 `new`할 수 없고, 구체 생성자(`new Uint8Array(16)`)만 쓴다. 길이가 고정되고 요소 타입이 하나라는 점이 일반 배열과 다르다. 버퍼(ArrayBuffer)와 뷰, DataView, Blob과의 관계는 [[binary-data-and-files|바이너리 데이터와 파일]]에 있다.

## JSON

JSON은 객체처럼 생긴 **언어 독립적인 문자열 형식**이다. `JSON.stringify`로 문자열로, `JSON.parse`로 값으로 바꾼다. 빠지거나 바뀌는 값(`undefined`·함수·Date·Map·BigInt), replacer·reviver·`toJSON`은 [[json|JSON: stringify와 parse]]에 있다.

## 핵심 정리

- 변환은 `map`, 걸러내기는 `filter`, 누적·세기는 `reduce`, 하나 찾기는 `find`, 부수 효과는 `forEach`.
- `push`·`pop`·`splice`·`sort`·`reverse`는 원본을 바꾼다. 원본을 지켜야 하면 `slice`·`toSorted`·`toSpliced`·`with`.
- `sort()`는 문자열 기준이다. 숫자는 `(a, b) => a - b`.
- 반복되는 콜백은 콜백을 만드는 함수로 뽑는다. 변수 키는 대괄호로 접근한다.
- 객체는 `Object.entries` → 배열 메서드 → `Object.fromEntries`로 변환한다. JSON은 문자열이다.
- 배열·객체는 리터럴로 만든다. `new Array(n)`과 `[1, , 3]`은 빈 슬롯을 만든다. 객체 키는 문자열로 바뀐다.
- spread는 열거 가능한 자기 속성만 얕게 복사한다. 구조 분해는 [[destructuring|구조 분해 할당]], 문자열은 [[js-strings|문자열 다루기]], JSON은 [[json|JSON]].

관련 노트: [[js-strings|문자열 다루기]], [[destructuring|구조 분해 할당]], [[json|JSON: stringify와 parse]], [[functions|함수와 this]], [[iterators-and-generators|이터레이터와 제너레이터]], [[property-descriptors|속성 설명자]], [[operators-and-control-flow|연산자와 제어문]], [[variables-and-types|변수와 데이터 타입]], [[map-and-set|Map과 Set]], [[state|State와 불변 업데이트]], [[lists-and-keys|리스트와 Key(map으로 렌더링)]]
