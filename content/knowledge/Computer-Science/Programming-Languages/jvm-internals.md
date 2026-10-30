---
title: "JVM 내부 구조: 실행 엔진, 클래스 로딩, 메모리 영역, GC"
concept: "JVM"
summary: "JVM의 구성 요소(클래스로더·런타임 데이터 영역·실행 엔진)와 계층형 JIT, javac가 만든 바이트코드가 클래스 로딩(로딩·링크·초기화, 부모 위임)을 거쳐 실행되는 과정, 스택과 힙의 역할, 세대별 GC와 Serial·Parallel·G1·ZGC·Shenandoah 비교, GC 로그·힙 덤프로 메모리 문제를 진단하는 방법, GraalVM Native Image와 AOT 캐시를 정리한다."
tags: ["java", "jvm", "memory", "performance", "computer-science"]
source: other
date: "2026-10-21"
sources: ["https://github.com/HomoEfficio/dev-tips/blob/master/Back%20to%20the%20Essence%20-%20Java%20%EC%BB%B4%ED%8C%8C%EC%9D%BC%EC%97%90%EC%84%9C%20%EC%8B%A4%ED%96%89%EA%B9%8C%EC%A7%80%20-%20(1).md", "https://github.com/HomoEfficio/dev-tips/blob/master/Back%20to%20the%20Essence%20-%20Java%20%EC%BB%B4%ED%8C%8C%EC%9D%BC%EC%97%90%EC%84%9C%20%EC%8B%A4%ED%96%89%EA%B9%8C%EC%A7%80%20-%20(2).md", "https://yaboong.github.io/java/2018/05/26/java-memory-management/", "https://yaboong.github.io/java/2018/06/09/java-garbage-collection/", "https://12bme.tistory.com/543?category=785013", "https://brunch.co.kr/@springboot/367", "https://blog.jetbrains.com/kr/2020/05/25-things-we-love-about-java-ko/", "https://javaalmanac.io/", "https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-5.html", "https://openjdk.org/jeps/158", "https://openjdk.org/jeps/490", "https://docs.oracle.com/en/java/javase/25/gctuning/garbage-first-g1-garbage-collector1.html", "https://www.graalvm.org/latest/reference-manual/native-image/", "https://openjdk.org/jeps/483", "https://github.com/fru1tworld/cs-basic/blob/main/interview/etc/java.md"]
---

> 「[Java 컴파일에서 실행까지 (1)](https://github.com/HomoEfficio/dev-tips/blob/master/Back%20to%20the%20Essence%20-%20Java%20%EC%BB%B4%ED%8C%8C%EC%9D%BC%EC%97%90%EC%84%9C%20%EC%8B%A4%ED%96%89%EA%B9%8C%EC%A7%80%20-%20(1).md)」·「[(2)](https://github.com/HomoEfficio/dev-tips/blob/master/Back%20to%20the%20Essence%20-%20Java%20%EC%BB%B4%ED%8C%8C%EC%9D%BC%EC%97%90%EC%84%9C%20%EC%8B%A4%ED%96%89%EA%B9%8C%EC%A7%80%20-%20(2).md)」, 「[자바 메모리 관리 - 스택 & 힙](https://yaboong.github.io/java/2018/05/26/java-memory-management/)」, 「[Java Garbage Collection](https://yaboong.github.io/java/2018/06/09/java-garbage-collection/)」, 「[자바 최적화 - GC 로깅](https://12bme.tistory.com/543?category=785013)」, 「[Java Collections Heap Dump 분석](https://brunch.co.kr/@springboot/367)」, 「[JetBrains가 사랑하는 Java의 25가지 특징](https://blog.jetbrains.com/kr/2020/05/25-things-we-love-about-java-ko/)」 등을 바탕으로, 명령과 옵션은 JVM 명세와 JEP로 확인해 재구성한 노트다. 실행 엔진, 클래스로더 계층, G1과 수집기 비교, Native Image는 fru1tworld/cs-basic 모의 면접 질문 목록의 Java 질문을 바탕으로 Oracle GC 튜닝 가이드와 GraalVM 문서로 확인해 보강했다.

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

### JVM의 구성 요소

```text
.class ─▶ 클래스로더 서브시스템 ─▶ 런타임 데이터 영역(메서드 영역·힙·스택·PC·네이티브 스택)
                                         ▲
                              실행 엔진: 인터프리터 + JIT 컴파일러(C1·C2) + GC
                                         │
                              네이티브 메서드 인터페이스(JNI) ─▶ 네이티브 라이브러리
```

| 구성 요소 | 하는 일 |
| --- | --- |
| 클래스로더 서브시스템 | 클래스 파일을 찾아 읽고, 검증·링크·초기화한다 |
| 런타임 데이터 영역 | 실행에 필요한 메모리. 스레드 공유 영역과 스레드별 영역으로 나뉜다 |
| 실행 엔진 | 바이트코드를 실행한다. 처음에는 **인터프리터**가 한 명령씩 해석하고, 자주 실행되는 메서드·루프는 **JIT 컴파일러**가 기계어로 바꾼다 |
| GC | 힙에서 도달할 수 없는 객체를 회수한다 |
| JNI | C·C++ 같은 네이티브 코드를 호출하고 호출받는다 |

HotSpot은 **계층형 컴파일(tiered compilation)** 을 쓴다. 인터프리터로 시작해 호출 횟수를 세고, 뜨거운 메서드를 빠르게 컴파일하는 **C1**(가벼운 최적화 + 프로파일 수집)으로, 더 뜨거우면 수집한 프로파일로 공격적으로 최적화하는 **C2**로 다시 컴파일한다. 인라이닝, 탈출 분석(스택 할당·락 제거), 가상 호출의 단형화가 이때 일어난다. 프로파일의 가정이 깨지면(새 하위 클래스 로딩 등) 최적화를 버리고 인터프리터로 돌아간다(deoptimization). 그래서 JVM 애플리케이션은 기동 직후 느리다가 **워밍업** 뒤 빨라진다.

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

`java Main`을 실행하면 JVM이 시작 클래스를 로딩하고 `main`을 부른다. 나머지 클래스는 처음 필요할 때(인스턴스 생성, static 멤버 접근, 하위 클래스 초기화 등 **처음 능동적으로 사용될 때**) 로딩·초기화된다. 클래스 초기화는 JVM이 락으로 한 번만 실행되게 보장하므로, 홀더 클래스 싱글턴이 이 성질을 이용한다([[singleton-pattern|싱글턴 패턴]]).

### 클래스로더 계층과 부모 위임

| 클래스로더 | 읽는 것 |
| --- | --- |
| 부트스트랩(Bootstrap) | `java.base` 같은 JDK 핵심 모듈. JVM 안에 네이티브로 구현돼 Java에서는 `null`로 보인다 |
| 플랫폼(Platform, Java 8까지는 Extension) | 나머지 Java SE·JDK 모듈 |
| 애플리케이션(Application, System) | 클래스패스·모듈 경로의 애플리케이션 클래스 |
| 사용자 정의 | 웹 애플리케이션 서버, 플러그인 시스템, 핫 리로드 도구가 직접 만든다 |

클래스로더는 클래스를 요청받으면 **먼저 부모에게 위임**하고, 부모가 못 찾을 때만 직접 찾는다(parent delegation). 그래서 애플리케이션이 `java.lang.String`을 만들어 넣어도 부트스트랩의 진짜 `String`이 먼저 로딩돼 핵심 클래스를 바꿔치기할 수 없다. JVM 안에서 클래스의 정체는 **「클래스 이름 + 로딩한 클래스로더」** 다. 같은 이름의 클래스라도 다른 로더가 읽으면 다른 타입이라 서로 캐스팅하면 `ClassCastException`이 난다. Tomcat은 웹 애플리케이션마다 로더를 따로 두고 자기 것을 먼저 찾게 해 애플리케이션끼리 라이브러리 버전을 격리한다.

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

**GC는 루트(스택의 지역 변수, static 필드 등)에서 도달할 수 없는 힙 객체를 찾아 회수한다.** 추적 GC와 참조 카운팅의 원리, 언어별 비교는 [[how-programs-run|프로그램이 실행되기까지]]의 「가비지 컬렉션」에, 도달 가능성과 누수 패턴은 [[garbage-collection|가비지 컬렉션과 메모리 누수]]에 있다.

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
- 이 세대 구분은 개념이다. G1은 힙을 같은 크기의 영역(region) 여럿으로 나누고 각 영역에 Eden·Survivor·Old 역할을 붙인다. ZGC는 JDK 21부터 세대 모드를 지원했고, JDK 23에서 기본이 된 뒤 JDK 24에서 비세대 모드가 제거되어 지금은 세대 모드만 있다(JEP 490).

### 수집기 비교

JVM은 목적이 다른 여러 수집기를 제공하고 실행 옵션으로 고른다. 수집기 선택은 **처리량(throughput), 멈춤 시간(latency), 메모리 사용량(footprint)** 중 무엇을 우선하느냐의 문제다.

| 수집기 | 옵션 | 방식 | 목표·어울리는 곳 |
| --- | --- | --- | --- |
| Serial | `-XX:+UseSerialGC` | 스레드 하나로 Young은 복사, Old는 mark-compact. 내내 멈춘다 | 작은 힙, CPU 1~2개, 작은 컨테이너 |
| Parallel | `-XX:+UseParallelGC` | Serial과 같은 구조를 여러 스레드로. 멈춘 채 빨리 끝낸다 | **처리량**. 배치 작업 |
| G1 | 기본값(Java 9+) | 영역 단위, 동시 표시 + 멈춤 중 복사(evacuation) | 처리량과 지연의 균형. 대부분 서버 |
| ZGC | `-XX:+UseZGC` | 표시·이동·참조 갱신을 거의 모두 앱과 동시에. 세대 모드만 있다 | **아주 짧은 멈춤(밀리초 미만)**. 큰 힙, 지연에 민감한 서비스 |
| Shenandoah | `-XX:+UseShenandoahGC` | ZGC처럼 동시 압축. Java 25부터 세대 모드가 정식 | 짧은 멈춤. OpenJDK 일부 배포판에 포함 |

CMS(Concurrent Mark-Sweep)는 압축을 하지 않아 단편화가 쌓이는 문제로 JDK 14에서 제거됐고, 그 역할은 G1·ZGC가 이어받았다. JVM은 「서버급 머신」이 아니라고 판단하면(CPU 2개 미만 또는 메모리 1792MB 미만) G1 대신 Serial을 기본으로 고른다. 컨테이너에서 CPU를 1개로 제한하면 Serial이 선택되는 이유다.

**G1이 다른 수집기와 다른 점**:

- 힙을 1~32MB 크기의 같은 **영역(region)** 수천 개로 나누고, 영역마다 Eden·Survivor·Old·Humongous 역할을 그때그때 붙인다. 세대가 연속된 메모리일 필요가 없다.
- 영역마다 바깥에서 들어오는 참조를 **기억 집합(remembered set)** 에 기록해, 힙 전체를 훑지 않고 일부 영역만 골라 수집할 수 있다.
- Old 영역의 살아 있는 객체 표시는 앱과 **동시에** 한다(SATB 방식). 그 결과로 쓰레기가 많은 영역부터(Garbage-First) Young과 함께 회수하는 **혼합 수집(mixed collection)** 을 한다. 살아남은 객체를 다른 영역으로 복사하므로 압축이 저절로 된다.
- **멈춤 시간 목표**(`-XX:MaxGCPauseMillis`, 기본 200ms)에 맞춰 한 번에 수집할 영역 수를 조절한다. Parallel은 멈춤 시간을 약속하지 않고, ZGC는 목표가 아니라 구조적으로 멈춤을 힙 크기와 무관하게 만든다(색칠된 포인터와 로드 장벽).
- 영역 크기의 절반을 넘는 큰 객체는 **Humongous** 영역에 연속으로 둔다. 큰 배열을 자주 만들면 G1에서 단편화와 조기 Full GC의 원인이 된다.

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

## AOT 컴파일과 GraalVM Native Image

JIT는 실행 중 프로파일로 최고 성능을 내지만, 기동과 워밍업이 느리고 JIT·메타데이터에 메모리를 쓴다. 서버리스·CLI·컨테이너 오토스케일처럼 **빨리 떠야 하는** 곳에서는 미리(ahead-of-time) 컴파일하는 방법을 쓴다.

**GraalVM Native Image**는 빌드 시점에 애플리케이션과 쓰는 JDK·라이브러리 코드를 정적 분석해 **도달 가능한 코드만** 네이티브 실행 파일로 컴파일한다. 실행 파일 안에는 GC와 스레드 관리를 맡는 작은 런타임(Substrate VM)이 들어 있고 JVM은 없다.

| 장점 | 단점 |
| --- | --- |
| 기동이 수십 밀리초 수준으로 빠르고 워밍업이 없다 | **닫힌 세계 가정(closed-world)**: 빌드 때 보이지 않은 클래스는 실행 중 로딩할 수 없다 |
| 메모리 사용량이 작다(JIT·클래스 메타데이터가 없다) | 리플렉션·동적 프록시·리소스·직렬화 대상은 설정 파일(reachability metadata)로 미리 알려야 한다 |
| 단일 실행 파일로 배포, 작은 컨테이너 이미지 | 빌드가 몇 분 걸리고 메모리를 많이 쓴다 |
| 빌드 시점 클래스 초기화로 시작 작업을 줄일 수 있다 | 오래 도는 서버의 최고 처리량은 프로파일 기반 JIT보다 낮을 수 있다. 디버깅·관측 도구가 제한된다 |

Spring Boot(AOT 처리)와 Quarkus, Micronaut는 리플렉션을 빌드 시점 코드 생성으로 바꿔 Native Image를 지원한다. JVM을 유지하면서 기동을 줄이는 방향도 있다. OpenJDK의 Project Leyden은 한 번 실행해 얻은 클래스 로딩·링크 결과와 메서드 프로파일을 AOT 캐시로 저장해 다음 기동에 재사용한다(JDK 24의 JEP 483, JDK 25의 JEP 514·515).

## 정리

- `javac`는 바이트코드를 만들고, 링크와 최적화는 실행 중에 JVM이 한다.
- 클래스는 로딩 → 검증·준비·해석 → `<clinit>` 초기화 순으로 준비된다.
- 스택은 스레드별 프레임, 힙은 공유 객체 저장소다. Java는 참조값을 복사해 전달한다.
- GC는 세대 가설로 젊은 영역을 자주 청소한다. G1은 영역 단위로 쓰레기가 많은 곳부터 멈춤 목표에 맞춰 수집하고, ZGC는 거의 모든 작업을 동시에 한다. 튜닝은 할당률을 줄이는 코드 수정이 먼저다.
- 실행 엔진은 인터프리터에서 C1·C2 JIT로 올라간다. 기동이 중요하면 Native Image나 AOT 캐시를 쓴다.
- 클래스로더는 부모에게 먼저 위임하고, 클래스의 정체는 이름과 로더의 쌍이다.
- GC 로그는 늘 켜 두고, 누수는 힙 덤프의 retained heap으로 찾는다.

관련 노트: [[how-programs-run|프로그램이 실행되기까지]], [[garbage-collection|가비지 컬렉션과 메모리 누수]], [[concurrency-models|동시성·병렬·비동기·논블로킹과 동시성 모델]], [[java-idioms|Java 실무 관용구]], [[java-language-basics|Java 언어 기본]], [[java-build-tools|Java 빌드 도구와 IntelliJ 실행 오류]], [[memory-management|메모리 관리]]
