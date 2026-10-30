---
title: "프로그램이 실행되기까지: 컴파일, 바이트코드, 인터프리터, GC"
concept: "Program Execution"
summary: "소스 코드가 CPU에서 돌기까지의 세 갈래(네이티브 컴파일, 바이트코드 + VM·JIT, 인터프리터)와, 운영체제가 실행 파일을 띄워 종료하기까지의 단계, 가비지 컬렉션이 관리하는 영역과 추적·참조 카운팅의 비교, 순환 참조와 retain cycle, GC의 장단점과 Java·Python·Go의 방식, 브라우저에서 네이티브 코드를 돌리는 WebAssembly를 정리한다."
tags: ["computer-science", "programming-paradigm", "memory", "os", "performance"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/how-do-c++-java-python-work", "https://bytebytego.com/guides/how-do-computer-programs-run", "https://bytebytego.com/guides/how-does-garbage-collection-work", "https://bytebytego.com/guides/is-it-possible-to-run-c-c++-or-rust-on-a-web-browser", "https://docs.oracle.com/en/java/javase/21/gctuning/available-collectors.html", "https://webassembly.org/", "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/automaticreferencecounting/", "https://github.com/fru1tworld/cs-basic/blob/main/interview/cs/etc.md"]
---

> ByteByteGo의 System Design 101 가이드 「[How Do C++, Java, Python Work?](https://bytebytego.com/guides/how-do-c++-java-python-work)」, 「[How Do Computer Programs Run?](https://bytebytego.com/guides/how-do-computer-programs-run)」, 「[How does Garbage Collection work?](https://bytebytego.com/guides/how-does-garbage-collection-work)」, 「[Running C, C++, or Rust in a Web Browser](https://bytebytego.com/guides/is-it-possible-to-run-c-c++-or-rust-on-a-web-browser)」를 바탕으로, JVM 수집기 목록은 Oracle 문서로 확인해 재구성한 노트다. GC가 관리하는 영역, 추적과 참조 카운팅, retain cycle, 장단점은 fru1tworld/cs-basic 모의 면접 질문 목록의 가비지 컬렉션 질문을 바탕으로 Swift ARC 문서로 확인해 보강했다.

## 소스 코드가 기계어가 되는 세 갈래

CPU는 기계어만 실행한다. 사람이 쓴 소스 코드를 기계어로 바꾸는 시점과 방법에 따라 언어 구현이 세 갈래로 나뉜다.

```text
네이티브 컴파일     소스 ──컴파일러──▶ 기계어 ─────────────────▶ CPU
(C, C++, Go, Rust)          (빌드 시점에 한 번)

바이트코드 + VM     소스 ──컴파일러──▶ 바이트코드 ──VM 해석──▶ CPU
(Java, C#, Kotlin)                          └──JIT: 자주 쓰는 코드를
                                                 실행 중 기계어로 ──▶ CPU

인터프리터          소스 ──인터프리터가 실행 중에 읽고 실행──▶ CPU
(Python, Ruby, JS*)
```

| 방식 | 장점 | 단점 |
| --- | --- | --- |
| 네이티브 컴파일 | 실행이 가장 빠르다. 런타임이 필요 없다 | 플랫폼(OS·CPU)마다 따로 빌드한다. 빌드가 느릴 수 있다 |
| 바이트코드 + VM | 한 번 컴파일한 결과가 VM이 있는 어디서나 돈다. JIT로 실행 중 최적화 | VM 기동 비용과 메모리. 워밍업 전엔 느리다 |
| 인터프리터 | 빌드 없이 바로 실행, 대화형 개발이 쉽다 | 일반적으로 가장 느리다 |

*경계는 흐리다. 컴파일과 해석은 언어가 아니라 구현의 성질이고, 한 구현이 인터프리터·바이트코드·JIT를 함께 쓰는 것이 보통이다([[programming-language-semantics|프로그래밍 언어 의미론]]). JavaScript 엔진(V8)은 인터프리터로 시작해 뜨거운 코드를 JIT 컴파일한다([[js-engine-v8|JavaScript는 인터프리터 언어일까, 컴파일 언어일까]]). CPython도 내부적으로 소스를 바이트코드로 바꾼 뒤 해석한다. "컴파일 언어가 인터프리터 언어보다 빠르다"는 일반론은 맞지만, 언어가 아니라 **구현**의 성질이다.

C 코드가 기계어 실행 파일이 되는 과정(전처리 → 컴파일 → 어셈블 → 링크)은 [[gcc-compile-and-link|GCC 컴파일과 링크]]에 있다.

## 실행 파일이 프로세스가 되기까지

| 단계 | 하는 일 |
| --- | --- |
| 1. 실행 요청 | 사용자가 아이콘을 더블클릭하거나 셸에 명령을 친다. 운영체제에 프로그램 실행을 요청한다 |
| 2. 실행 파일 적재 | OS가 파일 시스템에서 실행 파일을 찾아 메모리에 올린다 |
| 3. 의존 라이브러리 연결 | 공유 라이브러리(Windows의 DLL, Linux의 `.so`)를 찾아 함께 적재하고 주소를 연결한다(동적 링킹) |
| 4. 메모리 공간 할당 | 코드·데이터·힙·스택 영역으로 이뤄진 주소 공간을 만든다 |
| 5. 런타임 초기화 | JVM, .NET 런타임처럼 언어 실행 환경이 있으면 이때 준비한다 |
| 6. 진입점 호출 | `main` 같은 진입점부터 프로그래머의 코드가 실행된다. 파일·네트워크 같은 자원은 시스템 콜로 OS에 요청한다 |
| 7. 명령어 실행 | 폰 노이만 구조대로 CPU가 메모리의 명령어를 가져와(fetch) 해독하고(decode) 실행한다(execute) |
| 8. 종료와 정리 | 작업이 끝나거나 사용자가 종료하면 열린 파일 디스크립터와 네트워크 자원을 닫고 메모리를 OS에 돌려준다 |

프로세스의 구조와 `fork()`·`exec()`는 [[process-and-thread|프로세스와 스레드]], 명령어 사이클은 [[cpu-instructions|CPU와 명령어 구조]]에 있다.

## 가비지 컬렉션

**가비지 컬렉션(GC)은 프로그램이 더 이상 쓰지 않는 메모리를 런타임이 자동으로 회수하는 기능이다.** C·C++처럼 `malloc`·`free`를 직접 짝지으면 해제를 잊어 누수가 생기거나, 이미 해제한 메모리를 다시 쓰거나(use-after-free) 두 번 해제(double free)하는 버그가 생긴다. GC는 「언제 해제할지」를 런타임이 정해 이런 버그를 없앤다.

### GC가 관리하는 영역

GC가 관리하는 것은 **힙**이다. 실행 중 동적으로 할당되고 수명이 호출 구조와 무관한 객체가 힙에 놓이기 때문이다.

| 영역 | 해제 방식 | GC와의 관계 |
| --- | --- | --- |
| 스택 | 함수가 반환되면 프레임째 자동으로 사라진다 | 수집 대상이 아니다. 스택의 지역 변수가 **루트**가 된다 |
| 정적 영역(전역·static) | 프로그램(또는 클래스)이 끝날 때까지 산다 | 수집 대상이 아니다. 여기 담긴 참조도 **루트**다 |
| 힙 | GC가 도달 불가능한 객체를 회수한다 | **수집 대상** |
| 네이티브 자원(파일, 소켓, 네이티브 메모리) | GC가 모른다 | `close()`·`with`·try-with-resources로 직접 닫는다 |

Java의 메서드 영역(Metaspace)처럼 클래스 메타데이터도 클래스로더가 회수될 때 함께 수집된다. Go는 탈출 분석으로 함수 밖으로 나가지 않는 값을 스택에 두어 GC 대상 자체를 줄인다.

### 추적과 참조 카운팅

| 비교 | 추적(tracing) GC | 참조 카운팅(reference counting) |
| --- | --- | --- |
| 원리 | 루트(스택·레지스터·전역)에서 참조를 따라가며 닿는 객체를 표시하고, 표시되지 않은 것을 회수한다(mark-and-sweep, 복사, mark-compact) | 객체마다 자기를 가리키는 참조 수를 세고, 0이 되는 순간 해제한다 |
| 해제 시점 | 수집이 돌 때. 예측하기 어렵다 | **즉시**. 예측 가능하다(소멸자로 자원 정리 가능) |
| 순환 참조 | 루트에서 끊기면 회수한다 | **회수하지 못한다** |
| 비용 | 수집 중 멈춤(stop-the-world)이나 동시 수집용 쓰기 장벽, 여유 메모리 | 참조를 복사·해제할 때마다 카운트 갱신. 멀티스레드면 원자적 연산이 필요하다 |
| 쓰는 곳 | Java, Go, JavaScript, C# | CPython, Swift·Objective-C(ARC), C++ `shared_ptr`, Rust `Rc`·`Arc` |

### 순환 참조와 Retain Cycle

참조 카운팅에서 두 객체가 서로를 가리키면, 바깥에서 둘을 가리키는 참조가 모두 사라져도 각자의 카운트가 1로 남아 영원히 해제되지 않는다.

```text
외부 → [A] ⇄ [B]        외부 참조를 끊으면   [A](1) ⇄ [B](1)   ← 아무도 쓰지 않는데 남는다
```

Swift·Objective-C의 ARC에서는 이를 **retain cycle**(강한 참조 순환)이라 부른다. 자식이 부모를, 델리게이트가 소유자를, 클로저가 자기를 소유한 객체(`self`)를 강하게 붙잡을 때 흔히 생긴다. 해결은 언어마다 같은 원리다. **순환의 한쪽을 카운트를 올리지 않는 약한 참조로 만든다.**

| 언어 | 약한 참조 | 대상이 사라지면 |
| --- | --- | --- |
| Swift | `weak var delegate`, 클로저 캡처 목록 `[weak self]` | `nil`이 된다(옵셔널) |
| Swift | `unowned` | 대상이 항상 더 오래 산다고 가정한다. 해제 뒤 접근하면 런타임 오류 |
| C++ | `std::weak_ptr` | `lock()`이 빈 포인터를 돌려준다 |
| Rust | `Weak<T>`(`Rc::downgrade`) | `upgrade()`가 `None` |
| Python | `weakref.ref` | 호출 결과가 `None` |

CPython은 참조 카운팅에 **순환 수집기**(주기적으로 도는 추적 GC)를 더해 순환도 회수한다. ARC는 순환 수집기가 없으므로 약한 참조로 직접 끊어야 한다.

### GC의 장단점

| 장점 | 단점 |
| --- | --- |
| 해제를 잊은 누수, use-after-free, double free 같은 메모리 안전 버그가 사라진다 | 수집에 CPU를 쓰고, 추적 GC는 여유 힙(보통 살아 있는 데이터의 몇 배)이 있어야 효율적이다 |
| 소유권을 신경 쓰지 않고 객체를 자유롭게 공유해 API가 단순해진다 | 멈춤(stop-the-world)이나 지연 급증이 생긴다. 실시간 시스템에 불리하다 |
| 압축하는 GC는 단편화를 없애고 할당을 포인터 증가만큼 싸게 만든다 | 해제 시점이 정해지지 않아 파일·소켓 같은 자원 정리에 쓸 수 없다 |
| - | 닿을 수 있지만 쓰지 않는 객체(무한 캐시, 지우지 않은 리스너)는 여전히 샌다 |

GC 없이 메모리 안전을 얻는 방법도 있다. Rust는 소유권과 빌림 검사로 해제 시점을 **컴파일 시점에** 정한다([[type-systems|타입 시스템]]의 선형·아핀 타입).

### 언어별 방식

| 비교 | Java | Python(CPython) | Go |
| --- | --- | --- | --- |
| 기본 기법 | 추적 + 세대 구분 + (대부분) 압축 | 참조 카운팅 + 세대별 순환 수집 | 추적, 동시 삼색 mark-and-sweep. 세대·압축 없음 |
| 조정 | 수집기 선택(Serial·Parallel·G1·ZGC)과 다양한 옵션 | 거의 없다(`gc.set_threshold`, `gc.freeze`) | `GOGC`, `GOMEMLIMIT` 정도 |
| 우선순위 | 용도별로 다르게 | 단순성, 즉시 해제 | 짧은 멈춤 |
| 자세히 | [[jvm-internals\|JVM 내부 구조]] | [[python-internals\|Python 언어 동작]] | [[go-language\|Go 언어]] |

- **Java**: JVM은 목적이 다른 여러 수집기를 제공하고 실행 옵션으로 고른다. 서버 기본값은 G1이고, 짧은 멈춤이 필요하면 ZGC를 쓴다.
- **Python**: 참조 수가 0이 되면 즉시 해제하고, 서로를 가리키는 객체 묶음은 별도 순환 수집기가 주기적으로 찾아 회수한다.
- **Go**: 애플리케이션과 **동시에** 표시와 회수를 진행해 전체 멈춤을 아주 짧게 유지한다. 처리량을 조금 내주고 지연을 줄이는 쪽을 택했다.

JavaScript 엔진의 도달 가능성과 누수 패턴은 [[garbage-collection|가비지 컬렉션과 메모리 누수]]에 있다.

## WebAssembly: 브라우저에서 네이티브 코드 돌리기

**WebAssembly(Wasm)는 브라우저가 실행하는 저수준 바이너리 명령어 형식이다.** 오랫동안 브라우저에서 돌릴 수 있는 언어는 JavaScript뿐이었다. Wasm은 C, C++, Rust 같은 언어를 컴파일할 수 있는 공통 목표를 제공한다.

```text
C / C++ / Rust 소스 ──컴파일러(Emscripten, rustc 등)──▶ .wasm 바이너리
                                                          │
브라우저: JavaScript가 .wasm을 불러옴 ──▶ Wasm 엔진이 기계어로 컴파일해 실행
                                    ◀──▶ JS와 함수를 주고받음
```

| 쓰임 | 이유 |
| --- | --- |
| 기존 네이티브 라이브러리 재사용 | 영상 인코딩·디코딩, 이미지 처리, 게임 엔진, CAD를 새로 짜지 않고 웹으로 옮긴다 |
| 계산이 무거운 작업 | 네이티브에 가까운 성능 |
| 서버리스·엣지 | 샌드박스가 가볍고 시작이 빨라 적은 자원으로 함수를 띄운다. 브라우저 밖 실행은 WASI 표준이 맡는다 |

Wasm은 JavaScript를 대체하지 않는다. DOM 조작과 UI는 여전히 JavaScript가 맡고, Wasm은 계산이 무거운 부분을 맡는다.

## 정리

- 언어 구현은 네이티브 컴파일, 바이트코드 + VM(JIT), 인터프리터로 나뉜다. 속도와 이식성, 개발 편의가 트레이드오프다.
- OS는 실행 파일을 적재하고 라이브러리를 연결하고 주소 공간을 만든 뒤 진입점을 부르고, 끝나면 자원을 회수한다.
- GC는 힙만 관리하고 스택·전역은 루트가 된다. 추적 GC는 순환도 회수하고, 참조 카운팅은 즉시 해제하지만 순환은 약한 참조로 끊어야 한다.
- GC는 메모리 안전을 주는 대신 CPU·메모리·멈춤 비용을 낸다. Java는 수집기를 골라 쓰고, Python은 참조 카운팅에 순환 수집을 더하고, Go는 동시 수집으로 멈춤을 줄인다.
- WebAssembly는 네이티브 언어를 브라우저와 엣지에서 돌리는 공통 바이너리 형식이다.

관련 노트: [[gcc-compile-and-link|GCC 컴파일과 링크]], [[js-engine-v8|JavaScript는 인터프리터 언어일까, 컴파일 언어일까]], [[garbage-collection|가비지 컬렉션과 메모리 누수]], [[process-and-thread|프로세스와 스레드]], [[memory-management|메모리 관리]], [[programming-language-evolution|프로그래밍 언어의 계보와 선택]], [[jvm-internals|JVM 내부 구조]], [[go-language|Go 언어]], [[python-internals|Python 언어 동작]], [[programming-language-semantics|프로그래밍 언어 의미론]]
