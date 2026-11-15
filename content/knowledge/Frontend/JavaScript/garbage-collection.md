---
title: "가비지 컬렉션과 메모리 누수"
concept: "Garbage Collection"
summary: "JavaScript 엔진은 루트에서 참조를 따라 닿을 수 있는(reachable) 값만 남기고 나머지를 자동으로 회수한다. 루트와 도달 가능성, 서로 참조해도 닿을 수 없으면 지워지는 '섬', 기본 알고리즘 mark-and-sweep과 순환 참조에 약했던 참조 카운팅, 세대별·점진적·병렬·유휴 시간 수집 같은 최적화(V8의 스캐빈지·mark-compact·쓰기 장벽), 그리고 GC가 막지 못하는 누수 패턴(전역, 잊힌 타이머·리스너, 클로저, 떨어져 나간 DOM, 끝없는 캐시)과 WeakMap·WeakRef·FinalizationRegistry를 정리한다."
tags: ["javascript", "frontend", "memory", "performance", "browser"]
source: other
date: "2026-10-21"
sources: ["https://ko.javascript.info/garbage-collection", "https://ko.javascript.info/weakmap-weakset", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry", "https://v8.dev/blog/trash-talk", "http://jayconrod.com/posts/55/a-tour-of-v8-garbage-collection", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management", "https://blog.risingstack.com/node-js-at-scale-node-js-garbage-collection/", "https://medium.com/sessionstack-blog/how-javascript-works-memory-management-how-to-handle-4-common-memory-leaks-3f28b94cfbec", "https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/etc.md"]
---

> javascript.info(모던 JavaScript 튜토리얼)의 「가비지 컬렉션」, 「위크맵과 위크셋」 글을 바탕으로, MDN과 V8 블로그로 확인해 재구성한 노트다. V8의 스캐빈지와 쓰기 장벽은 Jay Conrod의 「[A tour of V8: Garbage Collection](http://jayconrod.com/posts/55/a-tour-of-v8-garbage-collection)」을 바탕으로 더했다. 클로저가 환경을 나눠 쓰는 누수는 RisingStack의 「[Node.js Garbage Collection Explained](https://blog.risingstack.com/node-js-at-scale-node-js-garbage-collection/)」를 바탕으로 보강했다. 결정 불가능성과 할당 시점 수집, 떨어져 나간 표 셀 누수는 SessionStack의 「[How JavaScript works: memory management + how to handle 4 common memory leaks](https://medium.com/sessionstack-blog/how-javascript-works-memory-management-how-to-handle-4-common-memory-leaks-3f28b94cfbec)」로 보강했다. 언어 일반의 GC 연결은 「[fru1tworld/cs-basic 모의 면접 질문 목록](https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/etc.md)」을 점검해 보강했다.

## 가비지 컬렉션이란

JavaScript는 메모리를 직접 할당·해제하지 않는다. 값을 만들면 엔진이 메모리를 잡고, 더 쓸 수 없게 된 값은 **가비지 컬렉터(GC)** 가 알아서 회수한다. 개발자는 GC를 강제로 실행하거나 막을 수 없다. 기준은 **도달 가능성(reachability)** 하나다.

어떤 메모리가 「앞으로 다시 쓰일지」는 일반적으로 결정 불가능한 문제다. 그래서 GC는 「아직 닿을 수 있는가」로 **근사**한다. 닿을 수는 있지만 다시는 읽히지 않을 값은 GC 입장에서 살아 있는 값이고, 이것이 누수의 출발점이다.

## 루트와 도달 가능성

| 개념 | 뜻 |
| --- | --- |
| 루트(root) | 처음부터 살아 있다고 보는 값. 전역 변수, 지금 실행 중인 함수의 지역 변수·매개변수, 콜 스택에 있는 함수들이 참조하는 값, 클로저가 잡고 있는 변수 등 |
| 도달 가능한 값 | 루트에서 참조를 따라 닿을 수 있는 값. 메모리에 남는다 |
| 도달할 수 없는 값 | 어떤 경로로도 닿지 않는 값. 회수 대상이다 |

```javascript
let user = { name: 'John' }
let admin = user   // 참조가 둘
user = null        // admin으로 아직 닿는다: 남는다
admin = null       // 이제 아무도 닿지 못한다: 회수 대상
```

**들어오는 참조만 중요하다.** 객체가 다른 객체를 가리키는 것(나가는 참조)은 자기 생존에 영향이 없다.

### 도달할 수 없는 섬

서로 참조하는 객체 무리도 루트와 이어지지 않으면 **통째로** 지워진다. "누가 나를 가리키고 있다"는 사실만으로는 살아남지 못한다.

```javascript
function marry(man, woman) {
  woman.husband = man
  man.wife = woman
  return { father: man, mother: woman }
}

let family = marry({ name: 'John' }, { name: 'Ann' })
family = null // John과 Ann은 서로를 가리키지만 루트에서 닿지 않는다: 둘 다 회수
```

## 알고리즘

### mark-and-sweep

현대 엔진의 기본 방식이다.

```text
1. 루트를 표시(mark)한다
2. 표시된 객체가 참조하는 객체를 표시한다. 이미 표시한 객체는 다시 방문하지 않는다
3. 더 표시할 것이 없을 때까지 반복한다
4. 표시되지 않은 객체를 모두 지운다(sweep)
```

루트에서 페인트를 부어 참조를 따라 번지게 한 뒤, 페인트가 묻지 않은 것을 치우는 그림이다. 위의 「섬」도 페인트가 닿지 않으니 지워진다. 회수 뒤 남은 객체를 한쪽으로 모아 빈 공간을 이어 붙이는 압축(compaction)을 함께 하기도 한다.

### 과거에는: 참조 카운팅

예전 엔진 일부는 객체마다 "나를 가리키는 참조 수"를 세서 0이 되면 지웠다. 이 방식은 **순환 참조를 영원히 못 지운다.** 서로를 가리키는 두 객체는 루트와 끊겨도 카운트가 1로 남기 때문이다. 옛 IE에서 DOM 요소와 JS 객체가 서로 참조하면 새던 누수가 이것이다. 지금의 주요 엔진은 도달 가능성 기반이라 순환 참조 자체는 누수가 아니다.

### 엔진의 최적화

GC가 도는 동안 JavaScript 실행이 멈출 수 있어서(stop-the-world), 엔진은 멈춤을 짧고 드물게 만드는 기법을 쓴다.

| 기법 | 아이디어 |
| --- | --- |
| 세대별 수집(generational) | 대부분의 객체는 만들어지고 금방 버려진다. 새 객체 공간(young generation)을 작게 두고 자주 훑고, 오래 살아남은 객체는 old generation으로 옮겨 드물게 훑는다 |
| 점진적 수집(incremental) | 표시 작업을 잘게 나눠 실행 사이사이에 끼워 넣는다. 긴 멈춤 한 번을 짧은 멈춤 여러 번으로 바꾼다 |
| 병렬·동시 수집(parallel, concurrent) | 보조 스레드가 메인 스레드와 함께, 또는 메인 스레드가 일하는 동안 표시·정리를 한다 |
| 유휴 시간 수집(idle-time) | 프레임 사이처럼 메인 스레드가 한가할 때 GC 작업을 돌린다 |

V8의 세대별 수집은 두 알고리즘을 세대마다 다르게 쓴다.

| 세대 | 알고리즘 | 동작 |
| --- | --- | --- |
| young (작은 공간, 수 MB~수십 MB) | **스캐빈지(scavenge)**, Cheney의 복사 알고리즘 | 공간을 같은 크기의 반쪽 둘(from·to)로 나눈다. 할당은 포인터를 하나 올리는 것뿐이라 매우 싸다. 가득 차면 루트에서 닿는 객체만 다른 반쪽으로 복사하고 나머지는 통째로 버린다. 두 번 살아남은 객체는 old로 승격(promotion)한다 |
| old (큰 공간) | **mark-sweep / mark-compact** | 표시 단계에서 루트부터 그래프를 훑어 흰색(미방문)·회색(방문했지만 자식 미처리)·검은색(완료)으로 칠한다. 흰색으로 남은 것을 빈 목록으로 돌리거나(sweep), 조각난 페이지의 객체를 다른 페이지로 옮겨 페이지를 OS에 돌려준다(compact) |

- **쓰기 장벽(write barrier)**: 스캐빈지는 young만 훑는데, old 객체가 young 객체를 가리키면 그것도 루트로 봐야 한다. 그래서 객체 필드에 포인터를 쓸 때마다 짧은 검사 코드가 돌아 「old → young」 참조를 따로 기록해 둔다(기억 집합, remembered set). old 전체를 훑지 않는 대가로 쓰기마다 약간의 비용을 낸다.
- 복사는 살아 있는 객체 수에 비례하고 죽은 객체 수와는 무관하다. 대부분의 객체가 금방 죽는다는 세대 가설이 맞을수록 스캐빈지가 싸다.

**GC는 대개 할당할 때 돈다.** 큰 캐시를 `null`로 끊은 뒤 새 할당이 거의 없으면 회수가 한동안 미뤄져 메모리 사용량이 높게 남는다. 누수는 아니지만 메모리 그래프만 보면 누수처럼 보이므로, 판단은 힙 스냅샷으로 한다.

세부 알고리즘은 엔진과 버전마다 다르고 계속 바뀐다(V8은 Orinoco라는 이름으로 위 기법을 묶었다). 코드를 짤 때 알아야 할 것은 알고리즘이 아니라 **"닿을 수 있으면 안 지워진다"** 는 규칙 하나다.

## GC가 막지 못하는 누수

GC는 닿을 수 없는 값만 회수한다. **더 이상 필요 없는데 어딘가에서 계속 닿을 수 있으면** 그것이 누수다. 쓸수록 메모리가 계단식으로 오르고 페이지가 느려진다.

| 원인 | 예 | 해결 |
| --- | --- | --- |
| 전역 변수 | 선언 없이 대입한 암묵적 전역, `window.cache = …` | strict mode·모듈로 암묵적 전역을 막는다([[strict-mode\|strict mode]]) |
| 잊힌 타이머 | 컴포넌트가 사라져도 도는 `setInterval`이 큰 객체를 클로저로 잡는다 | `clearInterval`, React effect의 정리 함수([[timers\|타이머]]) |
| 잊힌 이벤트 리스너 | `window`·`document`에 단 리스너가 언마운트된 컴포넌트의 상태를 잡는다 | `removeEventListener`, `AbortController`의 `signal`로 한꺼번에 해제([[dom-events\|DOM 이벤트]]) |
| 클로저 | 오래 사는 함수가 큰 배열이 든 바깥 변수를 계속 참조한다 | 필요한 값만 꺼내 두고 큰 참조는 끊는다([[scope-and-closures\|스코프와 클로저]]). 같은 함수에서 만든 클로저끼리 환경을 공유해 생기는 누수는 아래에 있다 |
| 떨어져 나간 DOM | DOM에서 지운 요소를 JS 변수·배열이 아직 가리킨다(detached node). 자식 노드는 `parentNode`로 부모를 가리키므로, 지운 표의 `<td>` 하나만 잡아도 **표 전체**가 남는다 | 참조를 `null`로 지우거나 WeakMap·WeakRef로 담는다 |
| 끝없이 자라는 캐시 | 객체를 키로 쓰는 `Map` 캐시에 항목만 쌓인다 | 크기 제한(LRU)을 두거나 `WeakMap`을 쓴다 |

### 클로저끼리 환경을 나눠 쓰는 누수

같은 함수 안에서 만든 클로저들은 **바깥 환경(렉시컬 환경) 하나를 함께 붙잡는다.** 엔진은 어느 클로저도 쓰지 않는 변수만 환경에서 빼므로, 한 클로저가 쓰는 변수는 다른 클로저가 살아 있는 동안에도 남는다.

```javascript
let theThing = null
setInterval(() => {
  const originalThing = theThing
  const unused = () => { if (originalThing) console.log('hi') } // originalThing을 쓴다
  theThing = {
    longStr: new Array(1_000_000).join('*'),
    someMethod() { console.log('message') }, // originalThing을 안 쓰지만 같은 환경을 붙잡는다
  }
}, 1000)
```

`someMethod`는 `unused`와 같은 환경을 공유하고, 그 환경에 `originalThing`(직전의 `theThing`)이 남는다. 새 `theThing`이 옛 `theThing`을 잡고, 옛 것은 그 전 것을 잡아 1초마다 1MB짜리 문자열이 사슬로 쌓인다. Meteor 팀이 찾아낸 사례다. 루프 끝에서 `originalThing = null`로 끊으면 사라진다.

누수를 확인하는 절차(힙 스냅샷 비교, 할당 타임라인, 「Detached」 노드 찾기)는 [[devtools-performance|DevTools로 성능·메모리 분석하기]]에 있다.

## 약한 참조: GC와 협력하기

일반 참조는 대상을 살려 둔다. **약한 참조(weak reference)는 대상을 살려 두지 않는다.** 다른 곳에서 닿지 않으면 약하게 참조된 대상도 회수된다.

### WeakMap과 WeakSet

키(WeakSet은 값)를 약하게 잡는다. **객체에 부가 데이터를 붙이되, 객체가 사라질 때 데이터도 함께 사라지게** 할 때 쓴다. GC가 언제 돌지 알 수 없어서 항목 수를 셀 수도, 순회할 수도 없다. 그래서 메서드도 `get`·`set`·`has`·`delete`(WeakSet은 `add`·`has`·`delete`)뿐이다.

```javascript
// 방문 횟수: user 객체가 사라지면 항목도 저절로 사라진다
const visits = new WeakMap()
function countUser(user) {
  visits.set(user, (visits.get(user) ?? 0) + 1)
}

// 계산 결과 캐시: 입력 객체가 사라지면 결과도 회수된다
const cache = new WeakMap()
function process(obj) {
  if (!cache.has(obj)) cache.set(obj, heavyCompute(obj))
  return cache.get(obj)
}
```

`Map`으로 같은 코드를 쓰면 `user = null`을 해도 Map이 키로 붙잡고 있어 객체가 남는다. 키 규칙과 Map과의 비교는 [[map-and-set|Map과 Set]]에 있다.

### WeakRef와 FinalizationRegistry (ES2021)

| API | 하는 일 |
| --- | --- |
| `new WeakRef(obj)` | 대상을 약하게 가리키는 참조. `ref.deref()`는 대상이 살아 있으면 그 객체, 회수됐으면 `undefined` |
| `new FinalizationRegistry(callback)` | `registry.register(obj, heldValue)`로 등록한 객체가 회수된 **뒤 언젠가** `callback(heldValue)`를 부른다 |

```javascript
const ref = new WeakRef(bigImageData)
// ...나중에
const data = ref.deref()
if (data) draw(data)
else reload()
```

**둘 다 마지막 수단이다.** 언제 회수될지, 정리 콜백이 언제 불릴지(또는 불릴지 말지)는 엔진 마음이다. 회수 시점에 기대는 로직(파일 닫기, 소켓 정리)을 FinalizationRegistry에 맡기지 않는다. 자원 정리는 명시적으로 `close()`·`dispose()`를 부른다. 크고 다시 만들 수 있는 값의 캐시처럼 "있으면 쓰고 없으면 다시 만든다"가 맞는 곳에만 쓴다.

## 정리

- 기준은 도달 가능성이다. 루트에서 참조를 따라 닿으면 남고, 닿지 않으면 서로 참조해도 회수된다.
- 엔진은 mark-and-sweep에 세대별·점진적·병렬·유휴 시간 수집을 더해 멈춤을 줄인다. 순환 참조는 더 이상 누수가 아니다.
- 누수는 "필요 없는데 아직 닿는 것"이다. 타이머·리스너 해제, 떨어져 나간 DOM 참조 끊기, 캐시 크기 제한을 챙긴다.
- 객체에 데이터를 붙일 때는 WeakMap. WeakRef·FinalizationRegistry는 회수 시점이 보장되지 않으니 최후의 수단으로만 쓴다.

관련 노트: [[variables-and-types|변수와 데이터 타입]], [[map-and-set|Map과 Set]], [[scope-and-closures|스코프와 클로저]], [[devtools-performance|DevTools로 성능·메모리 분석하기]], [[js-engine-v8|JavaScript는 인터프리터 언어일까, 컴파일 언어일까]], [[how-programs-run|프로그램이 실행되기까지: 컴파일, 바이트코드, 인터프리터, GC]]
