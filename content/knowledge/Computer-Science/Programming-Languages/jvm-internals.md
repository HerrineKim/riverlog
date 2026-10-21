---
title: "JVM 내부 구조: 컴파일, 클래스 로딩, 메모리 영역, GC 튜닝"
concept: "JVM"
summary: "javac가 만든 바이트코드가 클래스 로딩(로딩·링크·초기화)을 거쳐 JVM 런타임 데이터 영역에서 실행되는 과정, 스택과 힙의 역할, 세대별 GC의 동작, GC 로그·힙 덤프로 메모리 문제를 진단하는 방법을 정리한다. 수집기 목록은 별도 노트에 있다."
tags: ["java", "jvm", "memory", "performance", "computer-science"]
source: other
date: "2026-10-21"
sources: ["https://github.com/HomoEfficio/dev-tips/blob/master/Back%20to%20the%20Essence%20-%20Java%20%EC%BB%B4%ED%8C%8C%EC%9D%BC%EC%97%90%EC%84%9C%20%EC%8B%A4%ED%96%89%EA%B9%8C%EC%A7%80%20-%20(1).md", "https://github.com/HomoEfficio/dev-tips/blob/master/Back%20to%20the%20Essence%20-%20Java%20%EC%BB%B4%ED%8C%8C%EC%9D%BC%EC%97%90%EC%84%9C%20%EC%8B%A4%ED%96%89%EA%B9%8C%EC%A7%80%20-%20(2).md", "https://yaboong.github.io/java/2018/05/26/java-memory-management/", "https://yaboong.github.io/java/2018/06/09/java-garbage-collection/", "https://12bme.tistory.com/543?category=785013", "https://brunch.co.kr/@springboot/367", "https://blog.jetbrains.com/kr/2020/05/25-things-we-love-about-java-ko/", "https://javaalmanac.io/", "https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-5.html", "https://openjdk.org/jeps/158"]
---

> 「[Java 컴파일에서 실행까지 (1)](https://github.com/HomoEfficio/dev-tips/blob/master/Back%20to%20the%20Essence%20-%20Java%20%EC%BB%B4%ED%8C%8C%EC%9D%BC%EC%97%90%EC%84%9C%20%EC%8B%A4%ED%96%89%EA%B9%8C%EC%A7%80%20-%20(1).md)」·「[(2)](https://github.com/HomoEfficio/dev-tips/blob/master/Back%20to%20the%20Essence%20-%20Java%20%EC%BB%B4%ED%8C%8C%EC%9D%BC%EC%97%90%EC%84%9C%20%EC%8B%A4%ED%96%89%EA%B9%8C%EC%A7%80%20-%20(2).md)」, 「[자바 메모리 관리 - 스택 & 힙](https://yaboong.github.io/java/2018/05/26/java-memory-management/)」, 「[Java Garbage Collection](https://yaboong.github.io/java/2018/06/09/java-garbage-collection/)」, 「[자바 최적화 - GC 로깅](https://12bme.tistory.com/543?category=785013)」, 「[Java Collections Heap Dump 분석](https://brunch.co.kr/@springboot/367)」, 「[JetBrains가 사랑하는 Java의 25가지 특징](https://blog.jetbrains.com/kr/2020/05/25-things-we-love-about-java-ko/)」 등을 바탕으로, 명령과 옵션은 JVM 명세와 JEP로 확인해 재구성한 노트다.

## JVM이란

**JVM(Java Virtual Machine)은 바이트코드(`.class`)를 읽어 실행하는 가상 머신이다.** Java 소스는 기계어가 아니라 바이트코드로 컴파일되고, 실행할 때 JVM이 이를 해석하거나 JIT로 기계어로 바꾼다. 언어 구현 방식(네이티브 컴파일·바이트코드·인터프리터)의 비교는 [[how-programs-run|프로그램이 실행되기까지]]에 있다.

JVM은 Java 언어와 별개다. JVM 명세만 지키면 Kotlin, Scala, Clojure, Groovy도 같은 런타임과 라이브러리, GC, 관측 도구를 그대로 쓴다.

| JVM 플랫폼의 강점 | 내용 |
| --- | --- |
| 하위 호환 | 오래된 바이트코드가 새 JVM에서도 돈다. 제거할 기능은 미리 경고(deprecated for removal)한다 |
| 명세 | 언어 명세(JLS)와 VM 명세(JVMS), 메모리 모델이 있어 여러 벤더의 JDK가 같은 방식으로 동작한다 |
| 런타임 최적화 | JIT가 실제 실행 프로파일을 보고 뜨거운 코드를 기계어로 최적화한다 |
| 관측성 | JDK Flight Recorder(JFR), JDK Mission Control, JMX, `jcmd`가 OpenJDK에 기본 포함된다 |
| 릴리스 주기 | 6개월마다 새 버전, 2년마다 LTS. 2026년 10월 기준 LTS는 8·11·17·21·25다. 버전별 기능·상태는 [The Java Version Almanac](https://javaalmanac.io/)에서 찾는다 |

## 컴파일: 소스에서 바이트코드로

```text
.java ──javac──▶ .class (바이트코드) ──java──▶ JVM: 로딩 → 링크 → 초기화 → 실행
```

- `javac`는 어휘 분석 → 구문 분석 → 의미 분석 → 바이트코드 생성 순으로 처리한다. C와 달리 어셈블리·링크 단계가 없다. **링크는 실행 중에 JVM이 동적으로 한다.**
- 컴파일러는 소스에 없는 것도 채운다. 생성자를 하나도 쓰지 않으면 기본 생성자를 넣는다.
- 바이트코드는 `javap -v -p Foo.class`로 텍스트로 볼 수 있다.

### 클래스 파일 구조

| 부분 | 담는 것 |
| --- | --- |
| 메타 정보 | 클래스 이름, 상위 클래스, 인터페이스, 접근 제어자 |
| 상수 풀(constant pool) | 클래스·메서드·필드 이름, 문자열 리터럴 같은 심볼. `#N` 인덱스로 참조한다 |
| 메서드 코드 | JVM 명령어와 피연산자 |

메서드 호출 명령어는 호출 방식마다 다르다. `invokevirtual`(인스턴스 메서드), `invokeinterface`(인터페이스 타입으로 호출), `invokespecial`(생성자·private), `invokestatic`, 그리고 람다·문자열 연결에 쓰이는 `invokedynamic`이 있다.

## 클래스 로딩: 로딩 → 링크 → 초기화

| 단계 | 하는 일 |
| --- | --- |
| 로딩(load) | 클래스로더가 바이너리를 찾아 메서드 영역에 클래스를 만든다 |
| 링크: 검증(verify) | 바이트코드 구조가 명세에 맞는지 검사한다 |
| 링크: 준비(prepare) | static 필드를 만들고 기본값(0, `null`, `false`)으로 채운다 |
| 링크: 해석(resolve) | 상수 풀의 심볼릭 참조를 실제 참조로 바꾼다. 미리 하거나(eager) 처음 쓸 때 한다(lazy) |
| 초기화(initialize) | `<clinit>`을 실행한다. static 필드의 명시적 값 할당과 모든 static 블록이 이 메서드 하나로 합쳐져 있다 |

`java Main`을 실행하면 JVM이 시작 클래스를 로딩하고 `main`을 부른다. 나머지 클래스는 처음 필요할 때 로딩된다.

## 런타임 데이터 영역

| 범위 | 영역 | 내용 |
| --- | --- | --- |
| JVM 전체(스레드 공유) | 힙 | 모든 객체와 배열. GC만 회수한다 |
| JVM 전체(스레드 공유) | 메서드 영역 | 클래스 구조, 메서드 바이트코드, 런타임 상수 풀. HotSpot은 Java 8부터 PermGen 대신 네이티브 메모리의 **Metaspace**에 둔다 |
| 스레드마다 | PC 레지스터 | 지금 실행 중인 명령어 위치 |
| 스레드마다 | JVM 스택 | 메서드 호출마다 쌓이는 **프레임** |
| 스레드마다 | 네이티브 메서드 스택 | JNI 등 네이티브 코드용 |

**프레임**은 지역 변수 배열, 피연산자 스택(operand stack), 소속 클래스의 런타임 상수 풀 참조로 이뤄진다. 인스턴스 메서드의 지역 변수 0번 칸에는 `this`가 들어간다. 바이트코드는 피연산자 스택에 값을 쌓고(`aload`, `ldc`, `getstatic`) 꺼내 쓰는(`invokevirtual`, `astore`) 스택 머신 방식이다.

### 스택과 힙

- **스택**에는 지역 변수가 놓인다. 기본형은 값 자체, 참조형은 힙 객체를 가리키는 참조값이다. 스레드마다 따로 있어 다른 스레드가 볼 수 없고, 메서드가 끝나면 프레임째 사라진다.
- **힙**은 JVM에 하나이고 모든 스레드가 공유한다. 스레드 사이에서 공유되는 상태는 언제나 힙에 있으므로 동시성 문제도 힙 객체에서 생긴다.
- **Java는 언제나 값으로 전달한다(pass by value).** 객체를 넘기면 참조값이 복사된다. 그래서 메서드 안에서 객체의 필드를 바꾸면 호출자에게 보이지만, 매개변수에 새 객체를 대입해도 호출자의 변수는 그대로다.
- `String`, `Integer` 같은 불변 객체는 "바꾸는" 연산이 새 객체를 만든다. 문자열 상수 풀은 Java 7부터 힙에 있다.

## 가비지 컬렉션

**GC는 루트(스택의 지역 변수, static 필드 등)에서 도달할 수 없는 힙 객체를 찾아 회수한다.** 도달 가능성과 mark-and-sweep의 원리는 [[garbage-collection|가비지 컬렉션과 메모리 누수]]에, JVM 수집기(Serial·Parallel·G1·ZGC)의 비교는 [[how-programs-run|프로그램이 실행되기까지]]의 「Java: 수집기를 고른다」에 있다.

### 세대별 수집

**약한 세대 가설(weak generational hypothesis)**: 대부분의 객체는 만들어지고 곧 죽는다. 그래서 힙을 나이로 나눠, 젊은 영역을 자주·싸게 청소한다.

```text
Young ─ Eden ─▶ Survivor 0 ⇄ Survivor 1 ─(나이 ≥ 임계값)─▶ Old
          ▲ new                                    승격(promotion)
```

| 용어 | 뜻 |
| --- | --- |
| Minor GC | Young 영역 수집. Eden이 차면 일어난다. 살아남은 객체는 Survivor로 옮겨지며 나이가 늘어난다 |
| Major GC | Old 영역 수집 |
| Full GC | 힙 전체(와 메타스페이스) 수집. 가장 길게 멈춘다 |
| Stop-the-world | GC 작업 중 애플리케이션 스레드를 멈추는 구간. 수집기마다 길이와 빈도가 다르다 |

- 코드에서 `System.gc()`를 부르지 않는다. Full GC를 유발할 수 있고, JVM이 무시할 수도 있다.
- 이 세대 구분은 개념이다. G1은 힙을 같은 크기의 영역(region) 여럿으로 나누고 각 영역에 Eden·Survivor·Old 역할을 붙인다. ZGC는 JDK 21부터 세대 모드를 지원하고 JDK 23부터 세대 모드가 기본이다.

## GC 로그로 진단하기

**운영 환경에서도 GC 로그는 켜 둔다.** 오버헤드가 거의 없고, 문제가 난 뒤에는 다시 얻을 수 없다. JDK 9부터는 통합 로깅(unified logging, JEP 158)을 쓴다.

```bash
java -Xlog:gc*:file=gc.log:time,uptime,level,tags:filecount=10,filesize=20m -jar app.jar
```

- `time`(벽시계)은 애플리케이션 로그와, `uptime`(JVM 기동 후 경과)은 JVM 내부 이벤트와 맞춰 보는 데 쓴다.
- `filecount`·`filesize`로 로그를 순환시켜 디스크를 지킨다.
- 과거의 `-XX:+PrintGCDetails`, `-Xloggc:` 계열 옵션은 JDK 9 이후 `-Xlog`로 대체됐다.

| 비교 | GC 로그 | JMX |
| --- | --- | --- |
| 수집 방식 | GC 이벤트마다 기록 | 주기적으로 샘플링 |
| 정보량 | GC 전후 힙 상태, 단계별 시간 등 수십 가지 | 누적 횟수·시간 정도 |
| 용도 | 깊은 분석, 튜닝 근거 | 대시보드, 알림 |

로그 형식은 JVM 버전마다 달라 직접 파싱하지 말고 GCViewer, GCeasy 같은 분석 도구나 JFR을 쓴다.

### 튜닝 원칙

| 원칙 | 이유 |
| --- | --- |
| **할당률(allocation rate)부터 본다** | 초당 할당량이 지나치게 높으면 GC 옵션으로는 못 고친다. 객체를 덜 만드는 코드 수정이 먼저다 |
| 멈춤 시간, 처리량, 객체 수명을 함께 잰다 | 수집기 선택은 지연과 처리량 중 무엇을 우선하느냐의 문제다 |
| 플래그는 한 번에 하나씩 바꾸고 벤치마크로 확인한다 | 여러 개를 함께 바꾸면 어떤 것이 효과를 냈는지 모른다 |
| 근거 없이 기본값을 바꾸지 않는다 | `MaxTenuringThreshold` 같은 값은 조기 승격(premature promotion)이 실제로 보일 때만 손댄다 |

## 힙 덤프로 메모리 누수 찾기

```bash
jcmd <pid> GC.heap_dump /tmp/app.hprof                     # 실행 중인 프로세스
java -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp -jar app.jar   # OOM 순간 자동 저장
```

분석은 Eclipse Memory Analyzer(MAT)나 VisualVM으로 한다. 예전 `jhat`은 JDK 9에서 제거됐다.

| 지표 | 뜻 |
| --- | --- |
| Shallow heap | 객체 자신의 크기 |
| Retained heap | 그 객체가 회수되면 함께 회수되는 모든 객체의 크기. **누수 지점은 retained heap이 큰 객체**다 |

MAT의 Leak Suspects 보고서가 retained heap이 큰 객체를 먼저 보여 준다. 흔한 원인은 대용량 컬렉션이다. `HashMap`은 항목마다 엔트리 객체와 박싱된 키·값을 따로 만들고, `HashSet`은 내부에 `HashMap`을 감싼 구조라 데이터 자체보다 훨씬 많은 힙을 쓴다. 메모리를 늘리기 전에 자료구조 선택과 데이터 양을 먼저 의심한다.

## 정리

- `javac`는 바이트코드를 만들고, 링크와 최적화는 실행 중에 JVM이 한다.
- 클래스는 로딩 → 검증·준비·해석 → `<clinit>` 초기화 순으로 준비된다.
- 스택은 스레드별 프레임, 힙은 공유 객체 저장소다. Java는 참조값을 복사해 전달한다.
- GC는 세대 가설로 젊은 영역을 자주 청소한다. 튜닝은 할당률을 줄이는 코드 수정이 먼저다.
- GC 로그는 늘 켜 두고, 누수는 힙 덤프의 retained heap으로 찾는다.

관련 노트: [[how-programs-run|프로그램이 실행되기까지]], [[garbage-collection|가비지 컬렉션과 메모리 누수]], [[concurrency-models|동시성·병렬·비동기·논블로킹과 동시성 모델]], [[java-idioms|Java 실무 관용구]], [[java-build-tools|Java 빌드 도구와 IntelliJ 실행 오류]], [[memory-management|메모리 관리]]
