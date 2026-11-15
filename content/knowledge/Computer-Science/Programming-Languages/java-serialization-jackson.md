---
title: "Java 입출력과 직렬화: 스트림, Path·Files, Serializable, Jackson"
concept: "Java I/O & Serialization"
summary: "Java 입출력의 두 계열(바이트 스트림과 문자 스트림)과 인코딩, 보조 스트림을 겹쳐 기능을 붙이는 데코레이터 구조, 버퍼링과 flush, File 대신 쓰는 Path·Files를 정리하고, 그 위에서 객체를 바이트로 바꾸는 Java 기본 직렬화(Serializable)의 serialVersionUID·보안 문제와 대안인 JSON 라이브러리 Jackson의 어노테이션, 캐시 저장처럼 타입 정보를 보존해야 할 때의 설정과 함정을 다룬다."
tags: ["java", "io", "json", "backend", "cache", "security"]
source: other
date: "2026-10-21"
sources: ["https://techblog.woowahan.com/2550/", "https://github.com/cheese10yun/blog-sample/tree/master/jackson", "https://hyperconnect.github.io/2019/10/28/jackson-serialize-for-global-caching.html", "https://docs.oracle.com/en/java/javase/21/core/serialization-filtering1.html", "https://github.com/FasterXML/jackson/wiki/Jackson-Release-3.0", "고려사이버대학교 Java언어 강의(도성룡 교수, 2023-2학기)"]
---

> 「[자바 직렬화, 그것이 알고싶다. 훑어보기편](https://techblog.woowahan.com/2550/)」, 「[Jackson 어노테이션 사용법](https://github.com/cheese10yun/blog-sample/tree/master/jackson)」, 「[Jackson 직렬화 옵션의 적절한 활용과 Jackson에 기여하기까지](https://hyperconnect.github.io/2019/10/28/jackson-serialize-for-global-caching.html)」를 바탕으로, 직렬화 필터와 Jackson 3 변경점은 Oracle·FasterXML 문서로 확인해 재구성한 노트다.
> 입출력 스트림과 Path·Files는 고려사이버대학교 「Java언어」(2023-2학기) 강의 내용으로 보강했다.

Java에서 데이터가 프로세스 밖으로 나가고 들어오는 길은 두 층이다. 아래층은 바이트와 문자를 흘려보내는 **입출력 스트림**이고, 위층은 객체를 그 스트림에 실을 수 있는 형태로 바꾸는 **직렬화**다.

## 스트림이란

스트림(stream)은 데이터가 한 방향으로 순서대로 흘러가는 통로다. 읽는 쪽은 입력 스트림, 쓰는 쪽은 출력 스트림이고, 하나의 스트림이 읽기와 쓰기를 함께 하지는 않는다. 파일, 네트워크 소켓, 메모리 배열, 표준 입출력이 모두 같은 스트림 API로 다뤄지므로, 데이터가 어디서 오는지와 무관하게 같은 코드로 읽고 쓸 수 있다.

운영체제 수준에서는 결국 파일 디스크립터에 대한 `read`·`write` 시스템 콜이다. 그 아래 이야기는 [[unix-file-io|유닉스 파일 입출력]]에 있다.

## 바이트 스트림과 문자 스트림

| 구분 | 최상위 추상 클래스 | 단위 | 쓰는 곳 |
| --- | --- | --- | --- |
| 바이트 스트림 | `InputStream`, `OutputStream` | 1바이트 | 이미지, 압축 파일, 직렬화 데이터 등 모든 이진 데이터 |
| 문자 스트림 | `Reader`, `Writer` | `char`(UTF-16 코드 단위) | 사람이 읽는 텍스트 |

**문자 스트림은 바이트 스트림에 인코딩 변환을 얹은 것이다.** 디스크에는 바이트만 있으므로, 텍스트를 읽으려면 어떤 인코딩(UTF-8, EUC-KR 등)으로 바이트를 문자로 풀지 정해야 한다. 이 다리 역할을 `InputStreamReader`·`OutputStreamWriter`가 한다.

```java
// 바이트 스트림을 UTF-8 문자 스트림으로 바꿔 한 줄씩 읽기
try (var reader = new BufferedReader(
        new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8))) {
    String line;
    while ((line = reader.readLine()) != null) {
        handle(line);
    }
}
```

- `FileReader`·`FileWriter`는 `FileInputStream` + `InputStreamReader`를 줄여 쓴 편의 클래스다. 인코딩을 생략하면 플랫폼 기본값을 쓴다. Java 18부터 기본값이 UTF-8로 통일됐지만(JEP 400), 이전 버전과 함께 돌 수 있는 코드라면 `new FileReader(file, StandardCharsets.UTF_8)`(Java 11+)처럼 명시한다.
- 텍스트를 바이트 스트림으로 한 바이트씩 읽어 `(char)`로 바꾸면 ASCII 밖의 글자(한글 등)는 깨진다. UTF-8에서 한글 한 글자는 3바이트다.

### read()가 int를 돌려주는 이유

`InputStream.read()`는 바이트 하나를 0~255 범위의 `int`로 돌려주고, 더 읽을 것이 없으면 `-1`을 돌려준다. 반환 타입이 `byte`(-128~127)라면 데이터 값 `0xFF`와 끝 표시를 구분할 수 없기 때문이다. `Reader.read()`도 같은 이유로 `int`를 쓴다.

```java
int b;
while ((b = in.read()) != -1) {   // 끝(-1)과 데이터를 구분한다
    out.write(b);
}
```

한 바이트씩 읽는 루프는 개념 설명용이다. 실제로는 `read(byte[])`로 덩어리째 읽거나 `in.transferTo(out)`(Java 9+)을 쓴다.

## 노드 스트림과 보조 스트림

스트림 클래스는 두 역할로 나뉜다.

| 역할 | 하는 일 | 예 |
| --- | --- | --- |
| 노드 스트림 | 실제 데이터 원천·목적지에 붙는다 | `FileInputStream`, `ByteArrayInputStream`, `FileReader` |
| 보조(필터) 스트림 | 다른 스트림을 감싸 기능을 더한다 | `BufferedInputStream`, `DataOutputStream`, `ObjectOutputStream`, `PrintWriter` |

보조 스트림은 생성자로 다른 스트림을 받아 감싸고, 같은 타입(`InputStream` 등)을 다시 구현한다. 그래서 여러 겹으로 쌓을 수 있다. [[gof-design-patterns|GoF 디자인 패턴]]의 데코레이터(Decorator) 패턴이 그대로 쓰인 구조다.

```java
// 파일 → 버퍼링 → 기본 자료형 단위 쓰기
try (var out = new DataOutputStream(
        new BufferedOutputStream(new FileOutputStream("scores.bin")))) {
    out.writeInt(3);
    out.writeDouble(91.5);
}
```

맨 바깥 스트림만 닫으면 안쪽 스트림까지 차례로 닫힌다.

| 보조 스트림 | 더하는 기능 |
| --- | --- |
| `BufferedInputStream`·`BufferedReader` | 내부 버퍼(기본 8192)로 몰아 읽기, `readLine()` |
| `BufferedOutputStream`·`BufferedWriter` | 몰아 쓰기, `flush()` 때 실제로 내보냄 |
| `DataInputStream`·`DataOutputStream` | `int`·`double` 같은 기본 자료형을 고정 바이트 형식으로 |
| `ObjectInputStream`·`ObjectOutputStream` | 객체 직렬화 (아래 「Java 기본 직렬화」) |
| `PrintStream`·`PrintWriter` | `print`·`printf`, 예외 대신 오류 플래그 |

## 버퍼링과 flush

버퍼 없이 `read()`·`write()`를 부르면 호출마다 운영체제까지 내려갈 수 있다. 시스템 콜은 메서드 호출보다 훨씬 비싸므로, 작은 단위로 자주 읽고 쓰는 코드는 버퍼 스트림으로 감싸기만 해도 크게 빨라진다.

출력 버퍼는 가득 차거나 `flush()`·`close()`가 불릴 때 비로소 내보낸다. 그래서 다음 문제가 생긴다.

- 스트림을 닫지 않고 프로그램이 끝나면 버퍼에 남은 마지막 내용이 파일에 쓰이지 않는다.
- 네트워크로 요청을 보낸 뒤 응답을 기다리는데 `flush()`를 안 하면, 요청이 버퍼에 머물러 양쪽이 서로 기다린다.

닫기는 [[java-idioms#try-with-resources|try-with-resources]]에 맡긴다. 예외가 나도 `close()`가 불리고, 그 과정에서 `flush()`도 된다.

## File 대신 Path와 Files

`java.io.File`은 경로를 나타내는 오래된 클래스다. `delete()`, `mkdir()`, `renameTo()` 같은 메서드가 실패 이유 없이 `false`만 돌려주는 등 한계가 있어, Java 7부터는 `java.nio.file`의 `Path`와 `Files`를 쓴다.

| 작업 | `java.io.File` 방식 | `java.nio.file` 방식 |
| --- | --- | --- |
| 경로 만들기 | `new File(dir, "a.txt")` | `Path.of(dir, "a.txt")` |
| 존재 확인 | `file.exists()` | `Files.exists(path)` |
| 삭제 | `file.delete()` → 실패하면 `false` | `Files.delete(path)` → 실패 이유를 담은 예외 |
| 텍스트 전체 읽기 | 스트림을 열어 루프 | `Files.readString(path)` (Java 11+) |
| 줄 단위 읽기 | `BufferedReader` 루프 | `Files.readAllLines(path)`, 큰 파일은 `Files.lines(path)` |
| 텍스트 쓰기 | `FileWriter` | `Files.writeString(path, text)` |
| 스트림 얻기 | `new FileInputStream(file)` | `Files.newInputStream(path)`, `Files.newBufferedReader(path)` |

- `Files`의 텍스트 메서드는 인코딩을 생략하면 UTF-8을 쓴다.
- `Files.lines()`는 파일을 지연해서 읽는 `Stream<String>`을 돌려준다. 내부에 열린 파일이 있으므로 try-with-resources로 닫아야 한다.
- 레거시 API와 섞어 써야 하면 `file.toPath()`, `path.toFile()`로 오간다.

## 표준 입출력

| 객체 | 타입 | 용도 |
| --- | --- | --- |
| `System.in` | `InputStream` | 키보드(표준 입력) |
| `System.out` | `PrintStream` | 일반 출력 |
| `System.err` | `PrintStream` | 오류 출력. 리다이렉션해도 따로 갈 수 있다 |

콘솔 입력은 `Scanner`가 간편하지만 정규식 기반이라 느리다. 입력이 많으면 `BufferedReader`로 줄을 읽고 직접 쪼갠다.

## 직렬화란

**직렬화(serialization)는 메모리의 객체를 저장하거나 전송할 수 있는 바이트·문자열로 바꾸는 것이고, 역직렬화(deserialization)는 그 반대다.** 세션 저장, 캐시(Redis·Memcached), 메시지 큐, 원격 호출에서 객체가 프로세스 경계를 넘을 때 필요하다.

| 형식 | 예 | 특징 |
| --- | --- | --- |
| Java 기본 직렬화 | `Serializable` | Java끼리만 읽는다. 클래스 구조에 강하게 묶인다 |
| 텍스트 | JSON(Jackson, Gson), CSV | 사람이 읽고 언어 중립적이다. 타입 정보가 기본으로 없다 |
| 바이너리 스키마 | Protocol Buffers, Avro | 작고 빠르다. 스키마로 버전 호환을 관리한다 |

## Java 기본 직렬화

```java
class Member implements Serializable {
    @Serial private static final long serialVersionUID = 1L;
    private String name;
    private transient String password;   // 직렬화에서 제외
}

byte[] bytes;
try (var bos = new ByteArrayOutputStream(); var out = new ObjectOutputStream(bos)) {
    out.writeObject(member);
    bytes = bos.toByteArray();
}
try (var in = new ObjectInputStream(new ByteArrayInputStream(bytes))) {
    Member restored = (Member) in.readObject();
}
```

- **`serialVersionUID`를 직접 선언한다.** 선언하지 않으면 JVM이 클래스 구조로 계산하므로, 필드 하나만 바꿔도 값이 달라져 예전에 저장한 데이터가 `InvalidClassException`으로 읽히지 않는다.
- 역직렬화하는 쪽에도 같은 클래스가 클래스패스에 있어야 한다. 직렬화한 시스템과 읽는 시스템의 버전이 다를 수 있음을 늘 가정한다.
- `record`는 정규 생성자를 거쳐 역직렬화되므로 생성자의 검증이 그대로 적용된다.

### 한계와 보안

- **신뢰할 수 없는 데이터를 역직렬화하지 않는다.** 역직렬화는 클래스패스의 임의 클래스를 만들고 메서드를 호출할 수 있어, 조작된 바이트로 원격 코드 실행(가젯 체인)이 가능하다. 실제로 많은 취약점이 여기서 나왔다.
- 꼭 써야 하면 **직렬화 필터**(`ObjectInputFilter`, JDK 9+, JDK 17부터 컨텍스트별 필터)로 허용 클래스를 화이트리스트로 제한한다.
- 클래스 구조가 곧 저장 형식이라 리팩터링이 어렵고, 결과가 크다.
- 그래서 새 설계에서는 Java 기본 직렬화 대신 JSON이나 Protobuf 같은 명시적 형식을 쓴다. 기본 직렬화는 Java 시스템끼리의 단기 데이터 교환에 한정한다.

## Jackson

**Jackson은 Java의 사실상 표준 JSON 라이브러리다.** Spring MVC와 Spring Boot가 기본으로 쓴다. 중심 객체는 `ObjectMapper`(Jackson 3에서는 불변 `JsonMapper`를 빌더로 만든다)다.

> Jackson 3.0(2025.10)부터 패키지와 Maven 그룹이 `com.fasterxml.jackson`에서 `tools.jackson`으로 바뀌었고, `JsonProcessingException`은 unchecked `JacksonException`이 됐다. 어노테이션(`jackson-annotations`)은 예전 패키지를 그대로 쓴다.

### 어노테이션

| 목적 | 어노테이션 | 하는 일 |
| --- | --- | --- |
| 이름·순서 | `@JsonProperty`, `@JsonPropertyOrder` | JSON 키 이름, 출력 순서 |
| 제외 | `@JsonIgnore`, `@JsonIgnoreProperties`, `@JsonIgnoreType` | 필드·클래스·타입 단위로 뺀다. `@JsonIgnoreProperties(ignoreUnknown = true)`는 모르는 키를 무시한다 |
| 조건부 포함 | `@JsonInclude(Include.NON_NULL)` | null이나 빈 값은 출력하지 않는다 |
| 생성 | `@JsonCreator` | 생성자·팩토리 메서드로 역직렬화한다. 불변 객체에 쓴다 |
| 값 하나로 | `@JsonValue` | enum이나 값 객체를 특정 값 하나로 직렬화한다 |
| 펼치기 | `@JsonUnwrapped` | 중첩 객체의 필드를 상위 레벨로 올린다 |
| 동적 키 | `@JsonAnyGetter`, `@JsonAnySetter` | `Map`의 항목을 일반 속성처럼 읽고 쓴다 |
| 형식 | `@JsonFormat` | 날짜·숫자 출력 형식 |
| 다형성 | `@JsonTypeInfo`, `@JsonSubTypes`, `@JsonTypeName` | 타입 식별 필드로 하위 클래스를 고른다 |
| 순환 참조 | `@JsonManagedReference` / `@JsonBackReference`, `@JsonIdentityInfo` | 양방향 관계에서 무한 재귀를 막는다 |
| 뷰 | `@JsonView` | 같은 객체를 화면별로 다른 필드만 노출한다 |
| 묶기 | `@JacksonAnnotationsInside` | 여러 Jackson 어노테이션을 하나의 커스텀 어노테이션으로 합친다 |

### 캐시에 객체를 저장할 때

API 응답용 JSON과 달리 캐시 저장용 직렬화는 **같은 타입으로 정확히 되돌아와야** 한다. 이때 생기는 문제와 대응은 다음과 같다.

| 문제 | 원인 | 대응 |
| --- | --- | --- |
| 저장된 값이 객체 상태와 다르다 | getter·setter에 로직이 있으면 그 결과가 저장된다 | 가시성을 **필드 기준**으로 바꾸고 getter·setter 자동 감지를 끈다(`setVisibility`) |
| 클래스가 바뀐 뒤 조용히 잘못 읽힌다 | 모르는 속성을 무시하도록 설정돼 있다 | 캐시용 매퍼는 `FAIL_ON_UNKNOWN_PROPERTIES`를 켜서 크게 실패하게 한다 |
| `Object`로 읽으면 `LinkedHashMap`이 된다 | JSON에는 타입 정보가 없다 | 읽을 때 대상 타입을 명시한다(`readValue(json, type)`). 메서드 반환 타입에서 `JavaType`을 얻으면 제네릭도 보존된다 |
| 타입 정보를 JSON에 넣고 싶다 | 다형성 필드 | `@JsonTypeInfo`로 필요한 곳만 지정한다. 전역 기본 타이핑(`activateDefaultTyping`)은 `PolymorphicTypeValidator`로 허용 타입을 제한해야 한다 |
| 예외 객체 직렬화가 무한 루프 | `Throwable.cause`의 기본값이 자기 자신 | `SerializationFeature.WRITE_SELF_REFERENCES_AS_NULL`(2.11+)로 자기 참조를 null로 쓴다 |

- **전역 기본 타이핑은 보안 위험이다.** JSON에 적힌 클래스 이름으로 아무 클래스나 만들 수 있으면 Java 기본 직렬화와 같은 가젯 공격이 가능하다. 옛 `enableDefaultTyping()`은 그래서 폐기됐다.
- API용 매퍼와 캐시용 매퍼는 요구가 정반대이므로 **`ObjectMapper`를 따로 둔다.**
- 다양한 타입(배열, 제네릭 컬렉션, 예외, 날짜)으로 왕복(round-trip) 테스트를 해 본 뒤 운영에 쓴다.

## 정리

- 이진 데이터는 바이트 스트림, 텍스트는 문자 스트림. 문자 스트림에는 인코딩을 명시한다.
- 기능은 보조 스트림을 겹쳐 붙인다(데코레이터). 작은 단위로 자주 읽고 쓰면 버퍼 스트림으로 감싸고, 닫기는 try-with-resources에 맡긴다. `read()`는 끝을 `-1`로 알리려고 `int`를 돌려준다.
- 새 코드의 파일 작업은 `Path`·`Files`로 한다.
- 직렬화 형식은 독자가 누구냐로 고른다. Java끼리 단기 교환이면 기본 직렬화, 그 밖에는 JSON·Protobuf.
- Java 기본 직렬화는 `serialVersionUID`를 직접 선언하고, 신뢰할 수 없는 입력은 역직렬화하지 않는다.
- Jackson은 어노테이션으로 이름·제외·생성·다형성을 제어한다.
- 캐시 저장용 직렬화는 필드 기준 가시성, 엄격한 실패, 명시적 대상 타입으로 왕복을 보장한다.

관련 노트: [[json|JSON]], [[java-idioms|Java 실무 관용구]], [[file-io|C 입력과 파일 입출력]], [[unix-file-io|유닉스 파일 입출력]], [[gof-design-patterns|GoF 디자인 패턴]], [[grpc|gRPC]], [[caching-strategies|캐싱 전략]], [[redis|Redis]], [[encoding-encryption-hashing|인코딩, 암호화, 해싱]]
