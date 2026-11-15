---
title: "TypeScript 실용 패턴"
concept: "TS Patterns"
summary: "구조적 타입 위에서 자주 쓰는 TypeScript 패턴을 모았다. 브랜드 타입으로 명목 타이핑 흉내 내기, enum 대신 as const 객체, 예외 대신 Result 유니언 반환, 클래스를 합성하는 믹스인, 이벤트 맵으로 만드는 타입 안전 이벤트 이미터, 인스턴스화 표현식으로 제네릭 특수화, 배열 만들기·커링·정적 초기화 블록 같은 작은 관용구까지 코드와 함께 정리한다."
tags: ["typescript", "type-system", "design-pattern", "frontend", "javascript"]
source: other
date: "2026-10-30"
sources: ["https://basarat.gitbook.io/typescript/main-1", "https://basarat.gitbook.io/typescript/main-1/nominaltyping", "https://basarat.gitbook.io/typescript/main-1/typed-event", "https://basarat.gitbook.io/typescript/type-system/mixins", "https://basarat.gitbook.io/typescript/type-system/exceptions", "https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html", "https://www.typescriptlang.org/docs/handbook/mixins.html"]
---

> basarat의 「[TypeScript Deep Dive](https://basarat.gitbook.io/typescript)」의 TIPs 장(Nominal Typing, Typesafe Event Emitter, String Based Enums 등)과 Mixins, Exception Handling 절을 바탕으로, 코드는 TypeScript 7.0.2 `--strict`로 검사해 재구성한 노트다.

## 이 노트의 패턴

TypeScript의 타입은 구조로 비교되고, 실행할 때는 지워진다. 그래서 다른 언어에는 문법으로 있는 기능(명목 타입, 다중 상속, 검사되는 예외)을 **타입 표기와 JavaScript 관용구의 조합**으로 만든다.

| 하고 싶은 것 | 패턴 |
| --- | --- |
| 같은 `string`이지만 섞이면 안 되는 값(`UserId`와 `OrderId`) | 브랜드 타입 |
| 이름 붙은 상수 집합 | `as const` 객체 + `keyof typeof` |
| 실패를 타입에 드러내기 | Result 유니언 반환 |
| 여러 클래스의 기능 합치기 | 믹스인 |
| 이벤트 이름마다 다른 데이터 | 이벤트 맵 제네릭 이미터 |
| 제네릭 함수·클래스를 특정 타입으로 고정 | 인스턴스화 표현식 |

## 브랜드 타입: 명목 타이핑 흉내

구조적 타이핑에서는 `type UserId = string`과 `type OrderId = string`이 완전히 같은 타입이다. 주문 번호를 사용자 번호 자리에 넣어도 통과한다. **브랜드(brand)** 는 실행 중에는 없는 가짜 속성을 타입에만 붙여 둘을 갈라놓는다.

```ts
type Brand<T, B extends string> = T & { readonly __brand: B };
type UserId = Brand<string, 'UserId'>;
type OrderId = Brand<string, 'OrderId'>;

const toUserId = (raw: string): UserId => raw as UserId; // 만드는 곳은 한 군데로 모은다
declare function getUser(id: UserId): void;

const uid = toUserId('u_1');
getUser(uid);                    // OK
const str: string = uid;         // OK: 원래 타입으로는 그대로 쓴다
// getUser('u_1');               // 오류: 그냥 string에는 브랜드가 없다
// getUser('o_1' as OrderId);    // 오류: 브랜드가 다르다
```

- 단언(`as UserId`)은 검증 함수 하나에만 두고, 그 함수에서 형식 검사(정규식, 범위)를 함께 하면 「브랜드가 붙은 값은 검증된 값」이 된다. Zod 같은 스키마 라이브러리의 `.brand()`가 이 일을 한다.
- 브랜드 키가 문자열 속성이라 우연히 겹칠 수 있다. 더 확실히 막으려면 `declare const userIdBrand: unique symbol`을 키로 쓴다.
- 과거에는 빈 `enum`과의 인터섹션이나 `interface FooId extends String { _fooIdBrand: string }`로 같은 일을 했다. 지금은 위의 인터섹션 형태가 표준 관용구다.
- 브랜드 대신 `{ type: 'user', value: string }`처럼 판별 속성을 가진 객체로 감싸는 방법도 있다. 단언이 필요 없지만, 직렬화할 때 모양이 달라진다.

## enum 대신 as const 객체

```ts
const Direction = {
  North: 'North',
  South: 'South',
  East: 'East',
  West: 'West',
} as const;
type Direction = (typeof Direction)[keyof typeof Direction]; // 'North' | 'South' | 'East' | 'West'

function move(d: Direction) {}
move(Direction.North); // 이름으로
move('South');         // 리터럴로도
// move('Up');         // 오류
```

값과 타입에 같은 이름을 붙여도 된다(값 공간과 타입 공간이 따로다, [[typescript-project-config#선언 공간: 타입과 값|선언 공간]]). `enum`과 비교하면 이렇다.

| | `enum` | `as const` 객체 |
| --- | --- | --- |
| 런타임 코드 | 생긴다. 숫자 enum은 역방향 매핑(`Color[0] === 'Red'`)까지 만든다 | 일반 객체 하나 |
| 타입 제거 실행(Node.js, `erasableSyntaxOnly`) | 안 된다 | 된다 |
| 리터럴로 넘기기 | 문자열 enum은 `'North'`를 직접 못 넘긴다 | 넘길 수 있다 |
| 숫자 enum의 안전성 | 아무 숫자나 대입된다 | 리터럴 유니언이라 정확하다 |

과거에는 문자열 enum이 없어서 배열에서 `{ K: K }` 객체를 만들어 주는 `strEnum` 같은 헬퍼를 썼다.

## 예외 대신 Result 반환

`throw`는 함수 타입에 나타나지 않는다. `validate(value: number): void`가 던질 수 있다는 사실은 본문을 읽어야 안다. 호출하는 쪽은 `try`로 감쌀지 모르고, 여러 호출을 한 `try`로 묶으면 어디서 던졌는지 알 수 없다. **예상할 수 있는 실패(입력 검증, 찾지 못함)는 반환값으로 돌려준다.**

```ts
type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };

function parseAge(input: string): Result<number> {
  const n = Number(input);
  if (!Number.isInteger(n) || n < 0) return { ok: false, error: `잘못된 나이: ${input}` };
  return { ok: true, value: n };
}

const r = parseAge('42');
if (r.ok) r.value.toFixed(); // ok로 좁혀야 value에 접근할 수 있다
else console.error(r.error);
```

- `ok`가 구분자인 구분된 유니언이라, 실패를 확인하지 않고 `value`를 꺼내면 컴파일 오류다.
- 예외는 **정말 예외적인 일**(버그, 복구할 수 없는 상태, 경계에서 한꺼번에 처리할 오류)에 쓴다. 그때도 문자열이 아니라 `Error`를 던진다. 스택이 남기 때문이다(→ [[js-error-handling|에러 처리]]).

## 믹스인: 클래스를 함수로 합성

클래스는 하나만 상속한다(`class User extends Tagged, Timestamped`는 안 된다). **믹스인(mixin)** 은 「클래스를 받아, 그것을 상속하고 기능을 더한 새 클래스를 돌려주는 함수」다.

```ts
type Constructor<T = {}> = new (...args: any[]) => T;

function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    timestamp = Date.now();
  };
}

function Activatable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    isActive = false;
    activate() { this.isActive = true; }
  };
}

class User { name = ''; }
const SmartUser = Timestamped(Activatable(User));

const u = new SmartUser();
u.activate();          // Activatable에서
u.timestamp.toFixed(); // Timestamped에서
u.name.toUpperCase();  // User에서
```

`Constructor<T>`의 `T`에 제약을 주면(`Constructor<{ name: string }>`) 「`name`이 있는 클래스에만 붙는 믹스인」이 된다. 상속 사슬이 깊어지면 디버깅이 어려우므로, 상태가 없는 기능이라면 합성(객체를 속성으로 들고 있기)이 먼저다.

## 타입 안전 이벤트 이미터

Node.js식 `emitter.emit('foo', data)`는 이벤트 이름이 문자열이고 데이터가 `any`라 오타와 잘못된 데이터를 잡지 못한다. **이벤트 이름 → 데이터 타입** 맵을 제네릭으로 받으면 둘 다 검사된다.

```ts
type Listener<T> = (payload: T) => void;

class Emitter<Events extends Record<string, unknown>> {
  private listeners: { [K in keyof Events]?: Set<Listener<Events[K]>> } = {};

  on<K extends keyof Events>(type: K, fn: Listener<Events[K]>): () => void {
    (this.listeners[type] ??= new Set()).add(fn);
    return () => this.listeners[type]?.delete(fn); // 구독 해제 함수를 돌려준다
  }

  emit<K extends keyof Events>(type: K, payload: Events[K]): void {
    this.listeners[type]?.forEach((fn) => fn(payload));
  }
}

const bus = new Emitter<{ login: { userId: string }; logout: undefined }>();
const off = bus.on('login', ({ userId }) => console.log(userId)); // userId: string
bus.emit('login', { userId: 'u_1' });
// bus.emit('login', { id: 1 });  // 오류: 데이터 모양이 다르다
// bus.emit('logon', ...);        // 오류: 없는 이벤트
off();
```

- 이벤트마다 이미터 객체를 하나씩 두는 방법(`const onSave = new TypedEvent<{ id: string }>()`)도 있다. 이벤트가 변수라서 찾기·이름 바꾸기가 쉽다.
- `@types/node`의 `EventEmitter`는 이벤트 맵 제네릭(`new EventEmitter<{ login: [userId: string] }>()`)을 받는다. 브라우저의 `EventTarget`은 이벤트 이름을 검사하지 않고, `CustomEvent<T>`로 `detail`의 타입만 정한다.

## 제네릭 특수화: 인스턴스화 표현식

제네릭 함수나 클래스에 타입 인자만 고정한 별칭을 만들 수 있다(TypeScript 4.7부터).

```ts
function id<T>(x: T) { return x; }
const idNum = id<number>;          // (x: number) => number
// idNum('a');                     // 오류

class Box<T> { constructor(public value: T) {} }
const NumberBox = Box<number>;     // new (value: number) => Box<number>
class StringBox extends Box<string> {} // 상속으로 고정해도 된다
```

과거에는 `const FooNumber = Foo as { new (): Foo<number> }`처럼 단언으로 했다. 단언은 틀려도 통과하므로 지금은 쓰지 않는다.

## 작은 관용구

| 상황 | 쓰는 것 | 메모 |
| --- | --- | --- |
| 길이가 정해진 배열 | `new Array<number>(3).fill(0)` | `fill`에 객체를 넣으면 모든 칸이 **같은 객체**를 가리킨다 |
| 인덱스로 값을 만드는 배열 | `Array.from({ length: 3 }, (_, i) => i * 10)` | `[0, 10, 20]`. 2차원은 `Array.from({ length: n }, () => Array(m).fill(0))` |
| 커링 | `const add = (x: number) => (y: number) => x + y` | 화살표 함수를 잇는다. 부분 적용은 [[functional-programming\|함수형 프로그래밍]] |
| 호출 사이에 상태를 남기는 함수 | 클로저 `(() => { let n = 0; return () => ++n })()` | 다른 언어의 함수 `static` 변수 대신 |
| 클래스 정적 초기화 | `static { ... }` 블록 | 예전에는 `MyClass.initialize()`를 직접 불렀다(→ [[class\|class 문법]]) |
| 싱글턴 | 모듈 최상위의 `export const` | 모듈은 한 번만 평가된다. `private constructor` + `getInstance()`는 지연 초기화가 필요할 때만(→ [[js-design-patterns\|생성 패턴]]) |
| 여러 필드를 바꾸는 속성 | `set bar(v)` 대신 `setBar(v)` 메서드 | 대입문처럼 보이는 코드가 여러 상태를 바꾸면 읽는 사람이 놓친다. getter만 있는 속성은 자동으로 `readonly`가 된다 |
| 같은 타입 인자가 여러 개 | 객체 매개변수 `{ flagA, flagB }` | `f(flagB, flagA)` 같은 순서 실수를 막는다(→ [[typescript-coding-convention#7. 함수\|코딩 컨벤션]]) |

## 정리

- 구조적 타입에 이름의 구별이 필요하면 **브랜드**를 붙이고, 만드는 함수 한 곳에서만 단언한다.
- 상수 집합은 `as const` 객체와 `(typeof X)[keyof typeof X]`로 만든다. 타입 제거 실행과도 맞는다.
- 예상할 수 있는 실패는 Result 유니언으로 돌려주어 타입에 드러낸다.
- 다중 상속이 필요하면 믹스인, 문자열 키 API에는 키 → 타입 맵 제네릭을 쓴다.
- 단언으로 하던 옛 관용구(제네릭 특수화, 브랜드 enum)는 인스턴스화 표현식과 인터섹션 브랜드로 바꾼다.

**TypeScript 패턴의 공통점은 「실행 코드는 평범한 JavaScript로 두고, 의도는 타입에만 적는다」는 것이다.**

관련 노트: [[typescript-basics|TypeScript: 개념과 문법 한눈에 보기]], [[typescript-type-operators|TypeScript 타입 연산]], [[typescript-type-compatibility|TypeScript 타입 호환성]], [[typescript-advanced-types|TypeScript로 동적인 코드에 정적 타입 입히기]], [[js-design-patterns|JavaScript 디자인 패턴: 생성 패턴]]
