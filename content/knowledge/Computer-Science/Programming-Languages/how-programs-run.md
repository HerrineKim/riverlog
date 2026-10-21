---
title: "프로그램이 실행되기까지: 컴파일, 바이트코드, 인터프리터, GC"
concept: "Program Execution"
summary: "소스 코드가 CPU에서 돌기까지의 세 갈래(네이티브 컴파일, 바이트코드 + VM·JIT, 인터프리터)와, 운영체제가 실행 파일을 띄워 종료하기까지의 단계, Java·Python·Go의 가비지 컬렉션 방식, 브라우저에서 네이티브 코드를 돌리는 WebAssembly를 정리한다."
tags: ["computer-science", "programming-paradigm", "memory", "os", "performance"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/how-do-c++-java-python-work", "https://bytebytego.com/guides/how-do-computer-programs-run", "https://bytebytego.com/guides/how-does-garbage-collection-work", "https://bytebytego.com/guides/is-it-possible-to-run-c-c++-or-rust-on-a-web-browser", "https://docs.oracle.com/en/java/javase/21/gctuning/available-collectors.html", "https://webassembly.org/"]
---

> ByteByteGo의 System Design 101 가이드 「[How Do C++, Java, Python Work?](https://bytebytego.com/guides/how-do-c++-java-python-work)」, 「[How Do Computer Programs Run?](https://bytebytego.com/guides/how-do-computer-programs-run)」, 「[How does Garbage Collection work?](https://bytebytego.com/guides/how-does-garbage-collection-work)」, 「[Running C, C++, or Rust in a Web Browser](https://bytebytego.com/guides/is-it-possible-to-run-c-c++-or-rust-on-a-web-browser)」를 바탕으로, JVM 수집기 목록은 Oracle 문서로 확인해 재구성한 노트다.

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

*경계는 흐리다. JavaScript 엔진(V8)은 인터프리터로 시작해 뜨거운 코드를 JIT 컴파일한다([[js-engine-v8|JavaScript는 인터프리터 언어일까, 컴파일 언어일까]]). CPython도 내부적으로 소스를 바이트코드로 바꾼 뒤 해석한다. "컴파일 언어가 인터프리터 언어보다 빠르다"는 일반론은 맞지만, 언어가 아니라 **구현**의 성질이다.

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

## 가비지 컬렉션: 언어별 방식

**가비지 컬렉션(GC)은 프로그램이 더 이상 쓰지 않는 메모리를 런타임이 자동으로 회수하는 기능이다.** 개념(도달 가능성, mark-and-sweep)은 [[garbage-collection|가비지 컬렉션과 메모리 누수]]에 있다. 언어마다 방식이 다르다.

### Java: 수집기를 고른다

JVM은 목적이 다른 여러 수집기를 제공하고 실행 옵션으로 고른다.

| 수집기 | 목표 | 어울리는 곳 |
| --- | --- | --- |
| Serial | 단순함. 스레드 하나로 수집 | 작은 힙, 단일 CPU, 작은 애플리케이션 |
| Parallel | **처리량**. 여러 스레드로 빨리 수집하되 그동안 앱을 멈춘다 | 배치 작업 |
| G1(Garbage-First) | 처리량과 지연의 균형. 힙을 영역으로 나눠 쓰레기가 많은 곳부터 수집 | 대부분 서버 애플리케이션의 기본값 |
| ZGC | **아주 짧은 멈춤**. 큰 힙에서도 수집을 앱과 동시에 진행 | 큰 힙, 지연에 민감한 서비스 |

CMS(Concurrent Mark-Sweep)는 저지연 수집기로 쓰였지만 JDK 14에서 제거됐고, 그 역할은 G1·ZGC가 이어받았다.

### Python: 참조 카운팅 + 순환 수집기

- **참조 카운팅**: 객체마다 자기를 가리키는 참조 수를 센다. 0이 되는 즉시 해제한다. 해제 시점이 예측 가능하다.
- **순환 수집기**: 서로를 가리키는 객체 묶음은 참조 수가 0이 되지 않는다. 별도 수집기가 주기적으로 이런 순환을 찾아 회수한다.

### Go: 동시 실행 mark-and-sweep

Go의 GC는 애플리케이션과 **동시에** 표시(mark)와 회수(sweep)를 진행해 전체 멈춤(stop-the-world) 시간을 아주 짧게 유지한다. 처리량을 조금 내주고 지연을 줄이는 쪽을 택했다.

| 비교 | Java | Python | Go |
| --- | --- | --- | --- |
| 기본 기법 | 추적(tracing) + 세대 구분 | 참조 카운팅 + 순환 탐지 | 추적, 동시 실행 |
| 조정 | 수집기 선택과 다양한 옵션 | 거의 없다 | 목표 힙 비율 정도 |
| 우선순위 | 용도별로 다르게 | 단순성, 즉시 해제 | 짧은 멈춤 |

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
- GC는 언어마다 다르다. Java는 수집기를 골라 쓰고, Python은 참조 카운팅에 순환 수집을 더하고, Go는 동시 수집으로 멈춤을 줄인다.
- WebAssembly는 네이티브 언어를 브라우저와 엣지에서 돌리는 공통 바이너리 형식이다.

관련 노트: [[gcc-compile-and-link|GCC 컴파일과 링크]], [[js-engine-v8|JavaScript는 인터프리터 언어일까, 컴파일 언어일까]], [[garbage-collection|가비지 컬렉션과 메모리 누수]], [[process-and-thread|프로세스와 스레드]], [[memory-management|메모리 관리]], [[programming-language-evolution|프로그래밍 언어의 계보와 선택]], [[jvm-internals|JVM 내부 구조]], [[go-language|Go 언어]]
