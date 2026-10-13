---
title: "JavaScript는 인터프리터 언어일까, 컴파일 언어일까"
concept: "JS Engine"
summary: "현대 JS 엔진(V8)은 파싱 → 바이트코드 실행 → 자주 쓰는 코드만 단계적으로 JIT 컴파일하는 혼합 방식이라 둘 중 하나로 딱 자르기 어렵다. V8의 Ignition·Sparkplug·Maglev·TurboFan 파이프라인과 TypeScript 컴파일러·Babel의 단계를 비교한다."
tags: ["javascript", "typescript", "browser", "nodejs"]
source: other
date: "2026-10-13"
sources: ["https://ryankim.hashnode.dev/js", "https://v8.dev/blog/maglev", "https://v8.dev/blog/sparkplug"]
---

> ryankim.hashnode.dev의 글 「[Js는 인터프리터 언어일까, 컴파일 언어일까?](https://ryankim.hashnode.dev/js)」(2024.02)를 바탕으로 재구성한 노트입니다.

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

## 정리

- 현대 JS 엔진은 인터프리터 안에 컴파일러를 품은 **혼합 구조**다. 어느 한쪽으로 자르기 어렵다.
- 실행 전에 파싱하므로 문법 오류는 코드 한 줄도 실행되기 전에 잡힌다.
- 호이스팅·this는 바이트코드 실행 직전, 실행 컨텍스트가 만들어질 때 정해진다.
- 타입 오류는 V8이 아니라 TSC의 Checker가 컴파일 타임에 잡는다. Babel은 타입을 보지 않는다.
- 결론적으로 MDN의 "interpreted (or just-in-time compiled)"가 가장 정확한 표현이다.

관련 노트: [[event-loop|이벤트 루프]], [[variables-and-types|변수와 데이터 타입]], [[nodejs-runtime|Node.js 런타임과 OS 차이 다루기]], [[cpu-instructions|CPU와 명령어 구조]]
