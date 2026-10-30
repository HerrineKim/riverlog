---
title: "프로그래밍 언어와 객체 지향 설계"
concept: "Programming Languages"
summary: "C++의 문법·템플릿·STL·예외·가상 함수·메모리 풀 같은 언어 내부 동작과, 추상 클래스·인터페이스·위임·DTO/VO·클린 코드 같은 객체 지향 설계 개념 모음."
tags: ["cpp", "oop", "design-pattern", "clean-code", "computer-science"]
source: other
date: "2026-10-14"
---

언어의 문법은 금방 익히지만, 그 문법이 컴파일된 뒤 무엇이 되는지(템플릿 인스턴스화, vtable, 예외 테이블)를 알면 성능과 버그를 설명할 수 있다. 이 주제에는 C++를 중심으로 한 언어 내부 동작과, 언어를 넘어 쓰이는 객체 지향 설계 개념을 모았다. C 언어와 포인터는 [C-Programming](Computer-Science/C-Programming.md)에 있다.

## 하위 노트

### 언어 일반

- [프로그래밍 언어의 계보와 선택](Computer-Science/Programming-Languages/programming-language-evolution.md): 언어의 세대 구분, Fortran·LISP부터 Rust·Go·Kotlin까지 이어진 문제의식, 언어별 에너지 효율
- [프로그래밍 패러다임](Computer-Science/Programming-Languages/programming-paradigms.md): 명령형·선언형·객체 지향·함수형·반응형·관점 지향·제네릭·동시성 프로그래밍 비교
- [프로그램이 실행되기까지: 컴파일, 바이트코드, 인터프리터, GC](Computer-Science/Programming-Languages/how-programs-run.md): 네이티브 컴파일·VM과 JIT·인터프리터, 실행 파일 적재, Java·Python·Go의 GC, WebAssembly
- [프로그래밍 언어 의미론: 구문, 바인딩, 람다 계산, 평가 전략](Computer-Science/Programming-Languages/programming-language-semantics.md): 구문과 의미론, AST, 연산·표시·공리적 의미론, 스코프와 클로저, 알파·베타와 변수 포획, 값·이름·필요·참조·공유에 의한 호출, CPS, Hoare 논리, 위생적 매크로
- [타입 시스템: 검사, 추론, 다형성, 변성, 건전성](Computer-Science/Programming-Languages/type-systems.md): 정적·동적 검사, 단일화, 곱·합·재귀 타입과 Option·Result, 다형성 세 종류, 명목·구조·덕 타이핑, 변성, 완전성 검사, 진행과 보존

### C++

- [C++ 기초 문법과 참조자](Computer-Science/Programming-Languages/cpp-basics.md): 초기화와 L/R-value, 스트림, 헤더와 네임스페이스, 포인터와 참조자의 차이, switch fallthrough
- [C++ 템플릿](Computer-Science/Programming-Languages/cpp-templates.md): 함수·클래스 템플릿, 기본·비타입 인자, 특수화, 템플릿 재귀와 가변 인자
- [C++ STL 컨테이너와 시간 복잡도](Computer-Science/Programming-Languages/cpp-stl-containers.md): vector의 분할 상환 O(1), deque·list, 레드-블랙 트리 기반 set·map과 해시 기반 unordered
- [C++ 예외 처리의 내부 동작](Computer-Science/Programming-Languages/cpp-exceptions.md): 스택 되감기, 동적 등록과 zero-cost 테이블 방식, 예외 객체의 힙 할당
- [가상 함수와 vtable](Computer-Science/Programming-Languages/cpp-virtual-functions.md): vptr과 vtable, 생성자·소멸자 안의 가상 호출과 pure virtual call, 가상 소멸자
- [메모리 풀](Computer-Science/Programming-Languages/memory-pool.md): 고정·가변 메모리 풀, operator new/delete 오버로딩, std::pmr
- [C++ 코딩 표준과 clang-format](Computer-Science/Programming-Languages/cpp-coding-style.md): 코딩 표준이 정하는 항목, 이름 규칙 예, clang-format으로 서식 자동화

### 객체 지향 설계

- [객체 지향의 본질: 메시징](Computer-Science/Programming-Languages/oop-messaging.md): 앨런 케이가 본 OOP의 본질(메시징·캡슐화·늦은 바인딩)과 클래스·상속이 본질이 아닌 이유
- [추상 클래스와 인터페이스](Computer-Science/Programming-Languages/abstract-class-vs-interface.md): is-a와 can-do, 템플릿 메서드와 훅, Java 8 디폴트 메서드, 고르는 기준
- [Kotlin 핵심 문법: 널 안전성, 클래스 종류, 지연 초기화, 스코프 함수](Computer-Science/Programming-Languages/kotlin-basics.md): 널 안전성, data·sealed·object·companion object, lateinit과 by lazy, 스코프 함수 비교
- [위임 패턴과 Kotlin by](Computer-Science/Programming-Languages/kotlin-delegation.md): 상속 대신 위임, 클래스·프로퍼티 위임, by lazy와 by viewModels()
- [DTO와 VO, DAO와 Repository](Computer-Science/Programming-Languages/dto-vo-dao-repository.md): 전송 객체와 값 객체, 테이블 중심 DAO와 도메인 중심 Repository
- [클린 코드: 함수와 이름](Computer-Science/Programming-Languages/clean-code-functions-naming.md): 작은 함수와 추상화 수준, 팩터리로 분기 가두기, 의미 있는 이름
- [책임 주도 설계: 협력·책임·메시지](Computer-Science/Programming-Languages/responsibility-driven-design.md): 메시지를 먼저 정하고 책임을 가진 객체 고르기, 인터페이스는 메시지 집합
- [싱글턴 패턴](Computer-Science/Programming-Languages/singleton-pattern.md): 인스턴스를 하나로 제한하는 Java 구현 여섯 가지(DCL과 volatile, 홀더, enum)와 전역 상태의 단점
- [GoF 디자인 패턴](Computer-Science/Programming-Languages/gof-design-patterns.md): 생성·구조·행위 패턴이 푸는 문제와 비유, 과용의 비용
- [좋은 코드를 위한 열 가지 원칙](Computer-Science/Programming-Languages/coding-principles.md): 규약·주석·견고함·SOLID·테스트 용이성·적당한 추상화, 원칙끼리 부딪칠 때의 판단
- [같은 문제, 열다섯 가지 설계: 상태와 결합을 다루는 법](Computer-Science/Programming-Languages/state-and-decoupling-designs.md): 터틀 그래픽을 클래스·순수 함수·의존성 주입·상태 모나드·이벤트 소싱·인터프리터 등으로 구현하며 상태 소유와 결합 비교

### Java와 Go

- [Java 코딩 컨벤션: Google 스타일과 캠퍼스 핵데이 규칙](Computer-Science/Programming-Languages/java-coding-convention.md): 두 컨벤션 비교, 이름·import·중괄호·Javadoc 규칙, Checkstyle·EditorConfig 자동 적용
- [Java 언어 기본: 접근 제어자, static, 객체 비교, 제네릭, 리플렉션](Computer-Science/Programming-Languages/java-language-basics.md): 접근 제어자, final·finalize, 오버로딩·오버라이딩, 오토박싱, 제네릭 타입 소거, 어노테이션, 동시성 컬렉션, ThreadLocal
- [Java 실무 관용구: Enum, Optional, 예외와 자원, 날짜 API, 람다와 스트림, 비동기](Computer-Science/Programming-Languages/java-idioms.md): Enum에 행위 묶기, Optional 규칙, unchecked 예외 전환, java.time, CompletableFuture
- [Java 직렬화와 Jackson](Computer-Science/Programming-Languages/java-serialization-jackson.md): Serializable·serialVersionUID와 보안 문제, Jackson 어노테이션과 타입 정보 보존
- [JVM 내부 구조: 실행 엔진, 클래스 로딩, 메모리 영역, GC](Computer-Science/Programming-Languages/jvm-internals.md): 바이트코드와 클래스 로딩, 런타임 데이터 영역, 세대별 GC, GC 로그·힙 덤프 진단
- [Python 언어 동작: 제너레이터, MRO, 메모리 관리, 동시성, 성능](Computer-Science/Programming-Languages/python-internals.md): 이터러블·이터레이터·제너레이터, C3 MRO와 super(), 참조 카운팅과 세대별 순환 수집, 누수 패턴, PyPy 추적 JIT, 덕 타이핑과 Protocol
- [Go 언어: 설계 원칙, 타입, 에러 처리, 빌드와 테스트, GC](Computer-Science/Programming-Languages/go-language.md): The Zen of Go, G·M·P 스케줄러, 동시 GC와 GOGC·GOMEMLIMIT, 계층별 프로젝트 구조
- [Java 동시성: 메모리 모델, 동기화, 스레드 풀, 가상 스레드](Computer-Science/Programming-Languages/java-concurrency.md): happens-before, synchronized·volatile·Atomic·Lock, ConcurrentHashMap, ThreadLocal과 ScopedValue, ThreadPoolExecutor, Fork/Join, 가상 스레드
- [모던 Java 기능: 모듈, var, record, sealed, 패턴 매칭, switch 식](Computer-Science/Programming-Languages/modern-java-features.md): LTS별 기능 표, 모듈 시스템, var 제약, record·sealed, 패턴 매칭, switch 식, Sequenced Collections
- [Python 언어 기본: 객체와 가변성, 함수, 데코레이터, 클래스, 타입 힌트, import](Computer-Science/Programming-Languages/python-language-basics.md): 가변·불변과 복사, 인자 종류, LEGB·nonlocal, 데코레이터, 컨텍스트 매니저, 매직 메서드, 디스크립터, 타입 힌트, import
- [Go 동시성: 고루틴, 채널, select, context, sync](Computer-Science/Programming-Languages/go-concurrency.md): G·M·P 스케줄러, 채널 상태별 동작, select, context 취소 전파, sync와 atomic, 레이스 디텍터
