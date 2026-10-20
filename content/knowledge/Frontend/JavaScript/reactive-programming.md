---
title: "반응형 프로그래밍과 RxJS"
concept: "Reactive Programming"
summary: "반응형 프로그래밍은 데이터 흐름과 변경 전파에 초점을 둔 선언적 패러다임이다. 스프레드시트와 웹 프레임워크로 개념을 잡고, Pull에서 Push로, 제어의 역전으로 비동기를 단순하게 보는 법, 이벤트를 배열처럼 다루는 RxJS의 Observable과 연산자, 실무에서 막히는 소스 만들기와 Hot·Cold를 정리한다."
tags: ["javascript", "frontend", "async", "programming-paradigm"]
source: other
date: "2026-10-20"
sources: ["https://velog.io/@teo/reactive-programming", "https://velog.io/@teo/rxjs"]
---

> 테오(teo)의 「[프로그래밍 패러다임과 반응형 프로그래밍 그리고 Rx](https://velog.io/@teo/reactive-programming)」(2022.02)와 「[Rxjs 한번 배워보실래요?](https://velog.io/@teo/rxjs)」(2022.10)를 바탕으로 재구성한 노트다.

## 패러다임이란

패러다임은 같은 현상을 보는 **관점**이다. 천동설과 지동설은 둘 다 천체 운동을 설명할 수 있었고, 지동설이 이긴 것은 더 간결해서다. 객체 지향은 프로그램을 상호작용하는 객체의 집합으로, 함수형은 상태 없는 함수의 연속으로 보게 한다. 여러 관점을 알면 그중 **더 단순하게 설명하는 쪽을 고를 수 있다.** JavaScript는 여러 패러다임이 공존하는 언어라 특히 그렇다.

패러다임이 먼저 있고 라이브러리가 따라 나온 것이 아니다. 문제를 푼 도구들이 먼저 나오고, 그 공통점을 정리한 것이 패러다임이다.

## 반응형 프로그래밍이란

**반응형 프로그래밍(Reactive Programming)은 데이터의 흐름과 변경 사항의 전파에 초점을 둔 선언적 프로그래밍 패러다임이다.**

가장 친숙한 예는 스프레드시트다. `C1`에 `=A1+B1`을 **선언**해 두면 `A1`이 바뀔 때 `C1`이 **알아서** 바뀌고, `C1`을 쓰는 `D1`까지 따라 바뀐다. 실행 순서를 정의한 적이 없는데 데이터가 흘러간다.

웹에서 이 패러다임이 중요해진 계기는 jQuery에서 웹 프레임워크로의 전환이다. "DOM을 쉽게 조작하게 돕는다"에서 "DOM을 알아서 그려 준다"로 바뀌었다.

```text
변경 감지 + 바인딩 + 템플릿 + 자동 렌더 = Reactive
값이 바뀌면, 템플릿에 선언해 둔 대로, 알아서 다시 그린다
```

이후 Redux 같은 상태 관리도 변경을 감지하고 전파하며 선언적으로 값을 만든다는 점에서 같은 패러다임에 속한다. 뷰에 쓰이던 관점이 비즈니스 로직까지 넓어진 셈이다.

## 두 가지 전환

| 전환 | 전 | 후 |
| --- | --- | --- |
| 선언적 프로그래밍 | DOM을 **어떻게** 바꿀지 명령한다 | **무엇을** 보여 줄지 선언하고, 언제·어떻게는 내부가 처리한다 |
| Pull → Push | 그릴 때가 되면 필요한 데이터를 **끌어온다** | 값이 바뀔 때마다 구독자에게 **밀어 준다** (`setState`를 떠올리면 된다) |

## 왜 프론트엔드에 필요한가: 비동기

프론트엔드는 비동기 덩어리다. 사용자가 언제 무엇을 할지, 서버가 언제 답할지 모른다. 비동기가 어려운 이유는 이렇다.

- 쓴 순서대로 실행되지 않는다.
- 언제 실행될지, 호출 순서대로 끝날지 보장이 없다.
- 호출할 때의 값이 실행될 때도 그대로라는 보장이 없다.

콜백 → Promise → async/await는 비동기를 **동기 코드처럼** 보이게 하는 방향으로 발전했다([[async-await|async/await]]). 그런데 "타이핑할 때마다 검색하되, 입력이 멈추면 요청하고, 같은 내용이면 건너뛰고, 7초 안에 답이 없으면 3번 재시도하고, 엔터를 누르면 진행 중 요청을 버린다" 같은 요구는 순서를 맞추는 Pull 방식으로는 금세 복잡해진다. 사용자와 서버의 비동기가 뒤섞여 있기 때문이다.

### 제어의 역전

모듈 Foo가 네트워크 요청을 받으면 Bar의 카운터를 올린다고 하자. `Foo`가 `Bar.incrementCounter()`를 부르면 상태를 바꾸는 로직은 Bar에 있는데 호출은 Foo가 쥔다. Bar는 수동적이 되고 둘은 강하게 묶인다.

화살표의 방향은 그대로 두고 **소유권을 뒤집는다.** Bar가 Foo의 이벤트를 구독하고 자기 상태는 자기가 바꾼다. 이것이 제어의 역전(Inversion of Control)이다.

```js
// Bar.js — 상태 변경은 내 안에서
Foo.onNetworkRequest((event) => incrementCounter(event.value));
```

Foo는 누구에게 어떻게 전달할지 몰라도 되고 값이 생기면 내보내기만 한다. Promise의 `resolve`, DOM 이벤트, 옵저버 패턴, Pub/Sub이 모두 같은 구조다. 반응형 프로그래밍은 이 방식을 **일부가 아니라 모든 코드에 먼저 적용하자(Reactive First)** 는 관점이다. 그러면 모듈 하나는 화살표 하나만 신경 쓰면 된다.

## 이벤트를 배열처럼: 스트림

배열은 같은 타입의 값이 여러 개다. 클릭 이벤트도 같은 타입의 값이 여러 개다. 다만 아직 오지 않았을 뿐이다. 그렇다면 `for` 대신 `map`·`filter`로 배열을 선언적으로 다루듯 **이벤트도 선언적으로** 다룰 수 있다. 이벤트를 하나의 **값**으로 보는 것, 이것이 스트림이다.

| | 값 하나 | 값 여러 개 |
| --- | --- | --- |
| 동기 | 값 | Array |
| 비동기 | Promise | **Observable** |

```text
반응형 프로그래밍 = 변경 전파 + 데이터 흐름 + 선언적
                 = 이벤트 + 선언적
                 = 스트림 + 선언적   ("Everything is a stream")
```

각 노드를 스트림으로 정의하고 선언적으로 연결하면, 전체 흐름이 복잡해도 노드 하나하나는 단순하다. 이 데이터 흐름(data-flow)은 [[functional-programming|함수형 프로그래밍]]의 파이프라인으로 구현된다.

## RxJS

RxJS는 공식 문서 표현대로 "이벤트용 Lodash"다. **비동기 이벤트와 시간을 배열처럼 다루게 해 주는 라이브러리**이고, 그 중심이 Observable이다. Observable은 Promise로 만들 수 있는 것을 모두 만들 수 있지만 반대는 안 된다. Promise는 값을 하나만 받고 정리(cleanup)를 못 한다.

```ts
const fromEvent = (target, type) => new Observable((observer) => {
  const handler = (e) => observer.next(e);
  target.addEventListener(type, handler);
  return () => target.removeEventListener(type, handler); // 구독 해제 시 정리
});

// 0.25초 안에 세 번 클릭하면 트리플 클릭
fromEvent(window, 'click').pipe(
  bufferTime(250),
  filter((clicks) => clicks.length === 3),
).subscribe(onTripleClick);
```

이벤트는 `next`, `error`, `complete` 세 종류로 흐른다. `try`·`catch`·`finally`와 비슷하게 보면 된다.

### 요구사항은 대부분 "~하면 ~한다"다

앱 코드의 대부분은 API 사용법보다 **"참여자가 10명을 넘으면 마이크를 끈다"** 같은 조건과 시점의 시나리오다. RxJS는 이 "~하면"을 로직의 조합이 아니라 **값의 변환**(참여자 수 변화 → 이전 값과 비교 → 2초 버퍼 → 토스트)으로 쓰게 한다.

## 실무에서 막히는 지점

| 지점 | 내용 | 대응 |
| --- | --- | --- |
| pipe 문법 | 5.5부터 메서드 체인 대신 `pipe(map(), filter())`. 메서드는 트리 셰이킹이 안 되기 때문이다 | 함수 합성으로 이해한다 |
| 연산자보다 **소스**가 문제 | 이벤트는 프레임워크 핸들러가, Ajax는 값 하나라 Promise가 이미 맡고 있다. 연산자를 배워도 쓸 Observable이 없다 | 계속 값이 들어오는 것부터 감싼다. 실시간 DB(Firebase) 구독이 좋은 첫 소스다 |
| Hot과 Cold | Promise는 만들자마자 실행되고 결과를 공유한다(Hot). Observable은 기본이 지연 평가라 **구독할 때마다 새로 실행**된다(Cold) | API를 Observable로 감싸 여러 곳에서 구독하면 요청이 중복된다. 공유가 필요하면 Subject를 쓴다 |
| Subject 고르기 | 시점이 중요한 이벤트·동작 → `Subject`, 마지막 결과를 계속 공유할 값 → `BehaviorSubject` | 상태 관리의 기반이 된다 |

## 한계

- 학습 곡선이 높아 범용 상태 관리의 주류는 되지 못했다. Angular가 RxJS를 기본 의존성으로 써 왔지만, 동기 상태는 Signals로 옮기고 RxJS는 비동기 이벤트 흐름에 쓰는 쪽으로 역할이 나뉘었다.
- 과거에는 Observable을 TC39(언어 표준)에 넣으려 했으나 오래 진척이 없었고, 이후 WHATWG DOM 표준의 Observable API로 방향을 틀었다. Chrome 135(2025)가 `element.when('click')`처럼 이벤트를 Observable로 받는 API를 처음 출시했다. 다른 브라우저 지원은 MDN에서 확인한다. 파이프라인 연산자 `|>`는 아직 표준이 아니다.
- 반응형 프로그래밍은 Rx가 아니다. Rx는 패러다임의 대표 구현일 뿐이고, React·Redux·TanStack Query·Svelte·시그널도 같은 관점으로 읽을 수 있다.

## 정리

- 반응형 프로그래밍은 **선언해 두면 변경이 알아서 전파되는** 관점이다. 스프레드시트와 웹 프레임워크가 그 예다.
- 핵심 전환은 명령 → 선언, Pull → Push, 그리고 제어의 역전이다.
- 프론트엔드의 어려움은 뒤섞인 비동기와 "~하면 ~해 주세요" 시나리오에 있다. 이벤트를 값으로, 스트림으로 보면 단순해진다.
- RxJS의 Observable은 비동기 컬렉션이다. 실무에서는 연산자보다 **소스 만들기**와 **Hot/Cold**가 먼저다.

관련 노트: [[functional-programming|함수형 프로그래밍]], [[callback-and-promise|콜백과 Promise]], [[async-await|async/await]], [[event-loop|이벤트 루프]], [[frontend-mv-architecture|프론트엔드 MV* 아키텍처의 흐름]], [[proxy-and-reflect|Proxy와 Reflect]]
