---
title: "JavaScript는 인터프리터 언어일까, 컴파일 언어일까"
concept: "JS Engine"
summary: "현대 JS 엔진(V8)은 파싱 → 바이트코드 실행 → 자주 쓰는 코드만 단계적으로 JIT 컴파일하는 혼합 방식이라 둘 중 하나로 딱 자르기 어렵다. V8의 Ignition·Sparkplug·Maglev·TurboFan 파이프라인과 TypeScript 컴파일러·Babel의 단계를 비교하고, 최적화가 기대는 히든 클래스·인라인 캐시·배열 요소 종류를 정리한다. JavaScriptCore·SpiderMonkey의 대응 단계와 OSR, 측정·명시적 코드·벤치마크의 한계 같은 최적화를 대하는 법, Full-codegen·Crankshaft에서 Ignition·TurboFan으로 바뀐 역사도 담았다."
tags: ["javascript", "typescript", "browser", "nodejs"]
source: other
date: "2026-10-21"
sources: ["https://ryankim.hashnode.dev/js", "https://v8.dev/blog/maglev", "https://v8.dev/blog/sparkplug", "https://bytebytego.com/guides/how-does-javascript-work", "https://evan-moon.github.io/2019/06/15/diving-into-js-array/", "https://v8.dev/blog/elements-kinds", "https://v8.dev/blog/fast-properties", "https://v8project.blogspot.hk/2017/05/launching-ignition-and-turbofan.html", "http://benediktmeurer.de/2017/04/03/v8-behind-the-scenes-march-edition/", "http://benediktmeurer.de/2016/12/16/the-truth-about-traditional-javascript-benchmarks/", "https://wingolog.org/archives/2011/07/05/v8-a-tale-of-two-compilers", "http://jayconrod.com/posts/51/a-tour-of-v8-full-compiler", "https://webkit.org/blog/3362/introducing-the-webkit-ftl-jit/", "https://webkit.org/blog/5852/introducing-the-b3-jit-compiler/", "https://github.com/Microsoft/ChakraCore/wiki/Architecture-Overview", "https://blogs.windows.com/msedgedev/2015/12/05/open-source-chakra-core/", "https://blog.mozilla.org/javascript/2014/01/23/the-monkeys-in-2013/"]
---

> ryankim.hashnode.dev의 글 「[Js는 인터프리터 언어일까, 컴파일 언어일까?](https://ryankim.hashnode.dev/js)」(2024.02)를 바탕으로 재구성한 노트다. 언어 특징 개관은 ByteByteGo의 System Design 101 가이드 「[How does Javascript Work?](https://bytebytego.com/guides/how-does-javascript-work)」로 보강했다. 히든 클래스와 배열의 요소 종류는 「[JavaScript 배열(Array)의 발전과 성능에 대해서 자세히 알아보기](https://evan-moon.github.io/2019/06/15/diving-into-js-array/)」를 바탕으로 V8 블로그의 「[Elements kinds in V8](https://v8.dev/blog/elements-kinds)」, 「[Fast properties in V8](https://v8.dev/blog/fast-properties)」과 대조해 더했다. 엔진별 단계와 V8 파이프라인의 역사, 벤치마크는 V8 블로그 「[Launching Ignition and TurboFan](https://v8project.blogspot.hk/2017/05/launching-ignition-and-turbofan.html)」, Benedikt Meurer의 「[The truth about traditional JavaScript benchmarks](http://benediktmeurer.de/2016/12/16/the-truth-about-traditional-javascript-benchmarks/)」·「V8: Behind the Scenes」, WebKit 블로그 「[Introducing the WebKit FTL JIT](https://webkit.org/blog/3362/introducing-the-webkit-ftl-jit/)」·「[Introducing the B3 JIT Compiler](https://webkit.org/blog/5852/introducing-the-b3-jit-compiler/)」, ChakraCore 위키 「[Architecture Overview](https://github.com/Microsoft/ChakraCore/wiki/Architecture-Overview)」, 「[The monkeys in 2013](https://blog.mozilla.org/javascript/2014/01/23/the-monkeys-in-2013/)」을 바탕으로 더했다.

## 질문

MDN은 JS를 "가벼운 인터프리터(또는 JIT 컴파일) 언어"로 정의한다. 한편 실행 전에 문법 오류를 잡아 주므로 **사실상 컴파일 언어**로 봐야 한다는 관점도 있다(『You Don't Know JS Yet』). 이 구분이 중요한 이유는 **오류가 언제 잡히는지**가 달라지기 때문이다.

| 입장 | 근거 |
| --- | --- |
| 인터프리터 언어다 | 초창기 엔진(Netscape Navigator, JScript)은 한 줄씩 해석했다. 지금의 컴파일도 실행 전이 아니라 **런타임에** 일어난다 |
| 컴파일 언어다 | 실행 전에 파싱해 AST를 만들고 문법 오류를 먼저 잡는다. 바이트코드를 거쳐 기계어로 **JIT 컴파일**하고 최적화한다 |

전통적인 컴파일 언어와 인터프리터 언어의 차이는 [[cpu-instructions|CPU와 명령어 구조]] 노트에 있다.

## V8 엔진의 파이프라인

```text
JS 소스
  │
  ▼
Parser ── 어휘 분석(토큰화) → 구문 분석(SyntaxError는 여기서) → AST
  │
  ▼
Ignition (인터프리터) ── AST → 바이트코드 생성 → 실행 ★실제 코드 실행
  │                        └ 실행하며 프로파일링·피드백 수집
  ▼ 자주 실행될수록 다음 단계로
Sparkplug (베이스라인 컴파일러) ── 바이트코드 → 기계어, 거의 즉시
  ▼
Maglev    (중간 단계 최적화 컴파일러) ── 피드백 기반으로 빠르게 "충분히 좋은" 기계어
  ▼
TurboFan  (최상위 최적화 컴파일러) ── 가장 뜨거운 코드만 공격적으로 최적화
                                      └ 가정이 깨지면 역최적화
```

| 단계 | 하는 일 | 알아 둘 점 |
| --- | --- | --- |
| Parser | 코드를 토큰으로 쪼개고 문법을 검사해 AST(추상 구문 트리)를 만든다 | `SyntaxError: Unexpected token`은 이 단계의 오류다 |
| Ignition | AST를 바이트코드(중간 언어, IR)로 바꿔 실행한다 | 바이트코드 실행 직전에 **실행 컨텍스트**가 만들어진다. 호이스팅·this 바인딩·외부 렉시컬 환경 참조가 여기서 정해진다 |
| Sparkplug | 바이트코드를 기계어로 바로 옮긴다(2021) | 최적화 없이 거의 즉시 컴파일한다. 인터프리터 비용만 걷어 낸다 |
| Maglev | 수집한 타입 피드백으로 빠르게 최적화한다(2023, Chrome 117) | Sparkplug와 TurboFan 사이를 메운다. 컴파일은 TurboFan보다 훨씬 빠르고, 결과는 Sparkplug보다 빠르다 |
| TurboFan | 프로파일 데이터로 최적화된 기계어를 만든다 | 히든 클래스, 인라인 캐싱, 인라이닝 같은 기법을 쓴다. 가정이 깨지면 역최적화(deoptimization)한다 |

어느 단계로 올릴지는 호출·반복 횟수 같은 실행 정보로 정한다. 컴파일 비용과 실행 속도를 맞바꾸는 **단계적 JIT(tiered compilation)** 다.

### 다른 엔진도 같은 구조다

컴파일러는 「빨리 만드는 대신 느린 코드」와 「오래 걸리는 대신 빠른 코드」 사이의 **지연 시간·처리량 맞교환**을 피할 수 없다. 그래서 모든 주요 엔진이 단계를 여럿 두고, 낮은 단계가 모은 타입 정보(값 프로필, 인라인 캐시)로 높은 단계가 추측 최적화한다.

| 엔진 (쓰는 곳) | 인터프리터 | 베이스라인 | 중간 최적화 | 최상위 최적화 |
| --- | --- | --- | --- | --- |
| V8 (Chrome, Edge, Node.js, Deno) | Ignition | Sparkplug | Maglev | TurboFan |
| JavaScriptCore (Safari, Bun) | LLInt | Baseline JIT | DFG JIT | FTL JIT (백엔드 B3) |
| SpiderMonkey (Firefox) | 인터프리터 + Baseline Interpreter | Baseline Compiler | | Ion(앞단 WarpMonkey) |

- **OSR(on-stack replacement)**: 오래 도는 루프는 함수가 끝나길 기다리지 않고 실행 도중에 더 높은 단계의 코드로 갈아탄다. 가정이 깨질 때 낮은 단계로 돌아가는 OSR exit가 역최적화다.
- 무거운 단계는 **백그라운드 스레드**에서 컴파일한다. 메인 스레드는 그동안 낮은 단계 코드로 계속 실행한다. JavaScriptCore의 FTL은 함수가 LLInt → Baseline → DFG를 거쳐 충분히 뜨거워진 뒤에만 불린다.
- JavaScriptCore의 FTL은 처음에 LLVM을 백엔드로 썼다가, 컴파일 시간이 너무 길어 2016년 자체 저수준 컴파일러 **B3**로 바꿨다.
- 과거 Microsoft Edge의 Chakra(인터프리터 → Simple JIT → Full JIT)는 2016년 ChakraCore로 오픈 소스가 됐지만, Edge가 2020년 Chromium으로 옮기며 V8로 대체됐다.

## 최적화 컴파일러가 기대는 가정

최적화 컴파일러는 「지금까지 이랬으니 앞으로도 이럴 것」이라는 **추측**으로 빠른 기계어를 만든다. 가정이 깨지면 역최적화로 느린 단계로 돌아간다. 그래서 **모양이 일정한 코드**가 빠르다.

### 히든 클래스와 인라인 캐시

객체는 사전(dictionary)처럼 아무 속성이나 붙일 수 있지만, 그대로 해시 조회를 하면 느리다. V8은 객체마다 **히든 클래스(hidden class, V8 내부 이름은 Map, 다른 엔진은 Shape)** 를 붙여 「어떤 속성이 어느 칸(offset)에 있는지」를 기록한다. 같은 순서로 같은 속성을 만든 객체는 같은 히든 클래스를 공유한다. 속성을 더할 때마다 히든 클래스는 다음 것으로 **전이(transition)** 한다.

**인라인 캐시(IC)** 는 `obj.x`를 실행한 자리마다 「이 히든 클래스면 x는 이 칸」을 기억해 두는 장치다. 같은 모양의 객체가 계속 오면 조회 없이 칸을 바로 읽는다.

| IC 상태 | 그 자리에 온 히든 클래스 | 속도 |
| --- | --- | --- |
| 단형(monomorphic) | 1개 | 가장 빠르다 |
| 다형(polymorphic) | 2~4개 | 몇 개를 차례로 비교한다 |
| 초다형(megamorphic) | 그 이상 | 캐시를 포기하고 일반 조회로 간다 |

```javascript
// 같은 모양: 생성자·리터럴에서 모든 속성을 같은 순서로 한 번에 만든다
const a = { x: 1, y: 2 }
const b = { x: 3, y: 4 }        // a와 히든 클래스 공유

const c = { y: 1 }; c.x = 2     // 순서가 달라 다른 히든 클래스
delete a.y                       // 사전 모드로 떨어질 수 있다
```

### 배열의 요소 종류

배열도 담긴 값의 종류(elements kind)를 추적한다. `[1, 2, 3]`은 작은 정수만 든 `PACKED_SMI_ELEMENTS`로 연속 메모리에 빽빽이 담긴다. 실수가 들어오면 `PACKED_DOUBLE_ELEMENTS`, 문자열·객체가 들어오면 `PACKED_ELEMENTS`로 넓어진다. 빈칸(hole)이 생기면 `HOLEY_*`가 된다. **전이는 한 방향이라 다시 좁아지지 않는다.**

| 하지 않는다 | 이유 |
| --- | --- |
| `new Array(n)`으로 만든 뒤 채우기, `arr[100] = x`처럼 건너뛰어 쓰기 | 빈칸이 생겨 HOLEY가 되고, 다 채워도 돌아오지 않는다. 리터럴이나 `push`로 만든다 |
| 숫자 배열에 `NaN`·`-0`·문자열 섞기 | 더 일반적인 종류로 넓어진다 |
| `i <= arr.length`처럼 길이 밖을 읽기 | 프로토타입 체인까지 조회하게 만든다 |
| 여러 종류의 배열을 한 함수에 번갈아 넘기기 | 그 함수의 IC가 다형이 된다 |

대량의 숫자를 다루면 처음부터 연속 메모리를 보장하는 [[binary-data-and-files|형식화 배열(TypedArray)]]을 쓴다.

### 엔진 최적화를 대하는 법

- **측정한 뒤에 한다.** 엔진은 판마다 바뀌고, 일반적인 코드는 이미 충분히 빠르다. 위 원칙은 「객체 모양을 일정하게, 배열을 빽빽하게」 정도로 기억하고, 성능 문제가 프로파일러에 드러난 핫 루프에서만 적용한다. 큰 정적 데이터를 객체 리터럴 대신 `JSON.parse('…')`로 싣는 기법도 같은 부류다([[json|JSON]]).
- **엔진의 특정 추측에 기대지 않는 명시적인 코드를 쓴다.** `undefined`만 거르려면 `if (obj)` 대신 `if (obj !== undefined)`라고 쓰고, 기본값은 `a = a || 'value'` 대신 기본 매개변수 `function f(a = 'value')`를 쓴다. 엔진이 확인할 경우의 수가 줄고, `||`가 `''`·`0` 같은 정상 값까지 걸러 내는 버그도 막는다.
- **V8 하나만 보고 최적화하지 않는다.** 같은 코드가 JavaScriptCore·SpiderMonkey에서도 돈다.
- **벤치마크 점수는 실제 성능이 아니다.** SunSpider(Apple), Kraken(Mozilla), V8 Benchmark·Octane(Google) 같은 전통적 벤치마크는 엔진 경쟁을 이끌었지만, 어느 선을 넘자 엔진이 첫 반복 뒤 결과가 늘 0이 되는 루프나 한 번만 도는 `eval` 같은 **벤치마크 특이점에 맞춘 최적화**를 하게 됐다. 그래서 엔진 팀은 실제 웹사이트를 녹화해 재생하는 측정(Chrome의 Telemetry·WebPageReplay)으로 옮겼고, Octane은 2017년 은퇴했다. 브라우저 비교는 TodoMVC 같은 실제 프레임워크 앱을 돌리는 **Speedometer**(현재 3.x)와 JetStream으로 한다. 휴대폰을 JavaScript 벤치마크 점수로 비교하는 것도 의미가 적다. 점수는 하드웨어보다 브라우저 버전에 더 좌우된다.

## TypeScript 컴파일러와 비교

TS → JS는 고수준 언어에서 고수준 언어로 바꾸므로 **트랜스파일**, TSC는 소스 대 소스 컴파일러라고도 부른다. 이 과정은 컴파일 타임에 끝나고, 결과 JS는 런타임에 위의 V8 파이프라인을 탄다.

```text
.ts ─ Scanner(토큰화) ─ Parser(AST) ─ Binder(심볼 생성) ─ Checker(타입 검사) ─ Emitter(.js 출력)
```

| 도구 | 하는 일 | 타입 검사 |
| --- | --- | --- |
| TSC | TS를 지정한 버전의 JS로 바꾼다 | 한다 |
| Babel | 최신 문법을 예전 버전 JS로 바꾼다 | 하지 않는다 |
| V8 | JS를 바이트코드·기계어로 바꿔 실행한다 | 문법만 검사한다 |

## 실행 방식과 맞물린 언어 특징

실행 전에 타입을 확정하지 않고 런타임에 해석·최적화하는 구조는 JavaScript의 다른 특징과도 이어진다.

| 특징 | 내용 | 상세 노트 |
| --- | --- | --- |
| 인터프리트 + JIT | 미리 기계어로 컴파일해 배포하지 않고 엔진이 실행하면서 컴파일한다. 엔진만 있으면 어느 플랫폼에서나 돈다 | 이 노트 |
| 동적 타입 | 변수 타입을 선언하지 않고 런타임에 바뀔 수 있다. 엔진은 관찰한 타입으로 추측 최적화하고, 어긋나면 최적화를 되돌린다 | [[variables-and-types\|변수와 데이터 타입]] |
| 일급 함수 | 함수를 변수에 담고, 인자로 넘기고, 반환한다 | [[functions\|함수와 this]], [[functional-programming\|함수형 프로그래밍]] |
| 비동기 | 파일·네트워크 작업을 기다리지 않고 콜백·Promise로 결과를 받는다 | [[event-loop\|이벤트 루프]], [[async-await\|async/await]] |
| 프로토타입 기반 객체 | 클래스가 아니라 다른 객체를 원형으로 삼아 속성·메서드를 물려받는다. `class`는 그 위의 문법이다 | [[prototype-and-inheritance\|프로토타입과 상속]] |
| 자동 가비지 컬렉션 | 더 이상 닿을 수 없는 객체의 메모리를 엔진이 회수한다 | [[garbage-collection\|가비지 컬렉션]] |
| TypeScript의 하위 집합 | 유효한 JavaScript는 유효한 TypeScript다. TypeScript는 타입 주석을 더하고 컴파일 때 지운다 | [[typescript-basics\|TypeScript 기초]] |

## 역사: V8 파이프라인의 변화

| 시기 | 구성 | 바뀐 이유 |
| --- | --- | --- |
| 2010~2017 | **Full-codegen**(AST에서 바로 기계어, 바이트코드 없음) + **Crankshaft**(최적화) | Crankshaft는 `try/catch`·제너레이터·`async` 같은 구문을 최적화하지 못했다(「최적화 킬러」). 플랫폼 9개마다 아키텍처별 코드를 따로 짜야 했다. Full-codegen이 만든 기계어가 모바일에서 JS 힙의 3분의 1가량을 차지했다 |
| 2017 (V8 5.9, Chrome 59) | **Ignition + TurboFan** | 바이트코드로 메모리를 줄이고(저사양 Android에서 베이스라인 코드 메모리 약 9분의 1), 최적화 컴파일러가 소스를 다시 파싱하지 않고 바이트코드에서 바로 최적화한다. 모든 언어 기능을 최적화할 수 있어 최적화 킬러가 사라졌다 |
| 2021 / 2023 | Sparkplug, Maglev 추가 | 인터프리터와 TurboFan 사이의 간격을 메웠다 |

## 정리

- 현대 JS 엔진은 인터프리터 안에 컴파일러를 품은 **혼합 구조**다. 어느 한쪽으로 자르기 어렵다. V8·JavaScriptCore·SpiderMonkey 모두 인터프리터부터 최상위 최적화 컴파일러까지 단계를 두고, 뜨거운 코드만 위로 올린다.
- 실행 전에 파싱하므로 문법 오류는 코드 한 줄도 실행되기 전에 잡힌다.
- 호이스팅·this는 바이트코드 실행 직전, 실행 컨텍스트가 만들어질 때 정해진다.
- 타입 오류는 V8이 아니라 TSC의 Checker가 컴파일 타임에 잡는다. Babel은 타입을 보지 않는다.
- 결론적으로 MDN의 "interpreted (or just-in-time compiled)"가 가장 정확한 표현이다.

관련 노트: [[webassembly|WebAssembly]], [[event-loop|이벤트 루프]], [[execution-context|실행 컨텍스트]], [[variables-and-types|변수와 데이터 타입]], [[nodejs-runtime|Node.js 런타임과 OS 차이 다루기]], [[cpu-instructions|CPU와 명령어 구조]]
