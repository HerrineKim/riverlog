---
title: "Java 직렬화와 Jackson"
concept: "Java Serialization"
summary: "객체를 바이트로 바꾸는 Java 기본 직렬화(Serializable)의 사용법·serialVersionUID·보안 문제와, 그 대안으로 쓰는 JSON 라이브러리 Jackson의 어노테이션, 캐시 저장처럼 타입 정보를 보존해야 할 때의 설정과 함정을 정리한다."
tags: ["java", "json", "backend", "cache", "security"]
source: other
date: "2026-10-21"
sources: ["https://techblog.woowahan.com/2550/", "https://github.com/cheese10yun/blog-sample/tree/master/jackson", "https://hyperconnect.github.io/2019/10/28/jackson-serialize-for-global-caching.html", "https://docs.oracle.com/en/java/javase/21/core/serialization-filtering1.html", "https://github.com/FasterXML/jackson/wiki/Jackson-Release-3.0"]
---

> 「[자바 직렬화, 그것이 알고싶다. 훑어보기편](https://techblog.woowahan.com/2550/)」, 「[Jackson 어노테이션 사용법](https://github.com/cheese10yun/blog-sample/tree/master/jackson)」, 「[Jackson 직렬화 옵션의 적절한 활용과 Jackson에 기여하기까지](https://hyperconnect.github.io/2019/10/28/jackson-serialize-for-global-caching.html)」를 바탕으로, 직렬화 필터와 Jackson 3 변경점은 Oracle·FasterXML 문서로 확인해 재구성한 노트다.

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

- 직렬화 형식은 독자가 누구냐로 고른다. Java끼리 단기 교환이면 기본 직렬화, 그 밖에는 JSON·Protobuf.
- Java 기본 직렬화는 `serialVersionUID`를 직접 선언하고, 신뢰할 수 없는 입력은 역직렬화하지 않는다.
- Jackson은 어노테이션으로 이름·제외·생성·다형성을 제어한다.
- 캐시 저장용 직렬화는 필드 기준 가시성, 엄격한 실패, 명시적 대상 타입으로 왕복을 보장한다.

관련 노트: [[json|JSON]], [[java-idioms|Java 실무 관용구]], [[grpc|gRPC]], [[caching-strategies|캐싱 전략]], [[redis|Redis]], [[encoding-encryption-hashing|인코딩, 암호화, 해싱]]
