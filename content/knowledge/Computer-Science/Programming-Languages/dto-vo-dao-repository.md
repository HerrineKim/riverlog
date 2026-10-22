---
title: "DTO와 VO, DAO와 Repository"
concept: "DTO vs VO"
summary: "이름이 비슷해 헷갈리는 네 가지 객체를 구분한다. DTO는 계층 사이로 데이터를 실어 나르는 로직 없는 상자, VO는 값으로만 같음을 따지는 불변 도메인 객체다. DAO는 테이블 중심으로 영속성을 추상화한 저수준 계층이고, Repository는 도메인 객체의 컬렉션처럼 보이게 만든 상위 수준 계층이다."
tags: ["backend", "architecture", "design-pattern", "database", "oop"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/dcd0f224053f456caf22d7e0946fa868", "https://www.baeldung.com/java-dao-vs-repository", "https://martinfowler.com/eaaCatalog/dataTransferObject.html", "https://martinfowler.com/bliki/ValueObject.html"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「DTO와 VO, DAO와 Repository」를 바탕으로 재구성한 노트다.

## 한눈에 보기

| 이름 | 하는 일 | 로직 | 가변성 | 같음의 기준 | 사는 곳 |
| --- | --- | --- | --- | --- | --- |
| DTO | 계층·프로세스 사이 데이터 운반 | 없음 (직렬화 정도) | 보통 가변 | 의미 없음 | 표현 ↔ 서비스 경계 |
| VO | 도메인의 값 하나를 표현 | 있음 (값 관련 규칙) | **불변** | **모든 속성 값** | 도메인 |
| DAO | 테이블 단위 CRUD | 쿼리 | - | - | 데이터 접근 계층 |
| Repository | 도메인 객체 컬렉션처럼 저장·조회 | 도메인 단위 질의 | - | - | 도메인과 데이터 계층 사이 |

## DTO: 데이터 전송 객체

DTO(Data Transfer Object)는 **계층이나 프로세스 사이로 데이터를 실어 나르는 상자**다. 웹 서비스에서는 주로 요청 본문을 받거나 응답을 내보내는 형식으로, 컨트롤러와 서비스 사이를 오간다.

- **비즈니스 로직을 넣지 않는다.** 필드와 접근자, 직렬화·역직렬화만 가진다.
- 필요한 필드만 담아 **도메인 내부를 숨긴다.** `User`에 `email`이 있어도 응답용 `UserResponse`에 없으면 밖으로 새지 않는다.
- 원래 목적은 원격 호출 횟수를 줄이는 것이었다. 여러 번 물어볼 데이터를 한 객체에 모아 한 번에 보낸다.

```java
public record UserResponse(Long id, String role) {         // Java 16+ record: 불변 DTO를 한 줄로
    public static UserResponse from(User user) {           // 도메인 → DTO 변환
        return new UserResponse(user.getId(), user.getRole().name());
    }
}
```

도메인 객체를 컨트롤러까지 그대로 노출하면 API 응답 모양이 엔티티 구조에 묶이고, 지연 로딩이나 민감 필드가 새어 나간다. 그래서 **서비스 계층이 도메인을 DTO로 바꿔서 내보낸다**는 관례가 생겼다. 변환 코드가 많아지면 MapStruct 같은 매퍼를 쓴다. NestJS에서 DTO로 요청을 검증하는 방법은 [[dto-validation|NestJS DTO와 Validation]] 노트에 있다.

## VO: 값 객체

VO(Value Object)는 **도메인의 값 하나를 표현하는 객체**다. 돈(금액 + 통화), 기간(시작 + 끝), 좌표(x + y)처럼 여러 원시값이 모여 하나의 의미가 되는 것을 묶는다. 도메인 주도 설계(DDD)의 기본 구성 요소다.

| 특징 | 뜻 |
| --- | --- |
| 불변성 | 생성 후 바꿀 수 없다. 바꾸려면 새 객체를 만든다 (setter 없음) |
| 값 동등성 | 모든 속성이 같으면 같은 객체로 본다 (`equals`/`hashCode` 재정의) |
| 자기 검증 | 생성자에서 규칙을 검사해 유효하지 않은 상태로는 존재할 수 없다 |
| 행동 | 값과 관련된 로직을 스스로 가진다 (`money.add(other)`) |

```java
public record Money(long amount, String currency) {
    public Money {
        if (amount < 0) throw new IllegalArgumentException("금액은 음수일 수 없다");
    }
    public Money add(Money other) {
        if (!currency.equals(other.currency)) throw new IllegalArgumentException("통화 불일치");
        return new Money(amount + other.amount, currency);   // 새 객체를 돌려준다
    }
}
```

VO와 대비되는 것은 **엔티티**(entity)다. 엔티티는 고유 ID로 구분되어, 이름과 주소가 모두 같아도 ID가 다르면 다른 회원이다. VO는 ID가 없고 값이 같으면 같다.

### DTO와 VO의 차이

둘 다 데이터를 묶지만 **의도가 다르다.** DTO는 "전송하기 위해 필요한 필드만 모은 것"이라 로직이 없고 경계를 넘으면 버려진다. VO는 "비즈니스에서 의미 있는 값"이라 규칙과 행동을 가지며, 서비스 계층의 로직을 덜어 준다. 예전 Java 문헌에서 VO를 DTO와 같은 뜻으로 쓴 적이 있어 혼란이 남아 있다.

## DAO: 데이터 접근 객체

DAO(Data Access Object)는 **데이터 저장소 접근을 감싼 객체**다. 주로 테이블 하나에 대응해 CRUD 메서드를 제공한다.

```java
public interface UserDao {
    void insert(UserRow row);
    UserRow selectById(long id);
    List<UserRow> selectByEmailDomain(String domain);
    void update(UserRow row);
    void delete(long id);
}
```

- 영속성 기술(JDBC, SQL)을 숨겨 서비스가 쿼리를 몰라도 되게 한다.
- 테이블 중심이라 도메인 객체 하나를 조립하려면 DAO 여러 개를 불러야 하고, 각 호출이 쿼리 몇 번인지 겉으로 드러나지 않아 N+1 같은 비용을 놓치기 쉽다.

## Repository

Repository는 **도메인 객체의 컬렉션처럼 보이는 인터페이스**다. 저장소가 DB인지 메모리인지 모르는 채로, 도메인 언어로 객체를 넣고 꺼낸다.

```java
public interface OrderRepository {
    Optional<Order> findById(OrderId id);       // 집합체(aggregate) 단위로 조립된 Order
    List<Order> findUnpaidSince(LocalDate date);
    void save(Order order);
}
```

| 비교 | DAO | Repository |
| --- | --- | --- |
| 추상화 대상 | 데이터 영속성 (테이블) | 도메인 객체의 모음 |
| 가까운 쪽 | 데이터베이스 | 도메인 |
| 인터페이스 | 넓고 저수준 (다양한 쿼리) | 좁고 도메인 언어 (`findUnpaidSince`) |
| 관계 | Repository가 내부에서 DAO 여러 개를 쓸 수 있다 | |

Spring Data JPA의 `JpaRepository`는 이름은 Repository지만 엔티티 하나에 CRUD를 붙인 형태라 실제로는 DAO에 가깝게 쓰이는 경우가 많다. 이름보다 **무엇을 추상화하느냐**로 구분한다. 계층 분리 구현 예는 [[repository-pattern|Repository 패턴과 레이어 분리]] 노트에 있다.

## 정리

- DTO는 경계를 넘는 데이터 상자다. 로직 없이 필요한 필드만 담는다.
- VO는 불변이고 값으로 같음을 따지며, 자기 규칙을 스스로 지키는 도메인 객체다.
- 엔티티는 ID로, VO는 값으로 구분한다.
- DAO는 테이블에 가까운 저수준 접근 계층, Repository는 도메인에 가까운 컬렉션 추상화다.

관련 노트: [[repository-pattern|Repository 패턴과 레이어 분리]], [[dto-validation|NestJS DTO와 Validation]], [[web-scalability-components|웹 확장성의 구성 요소]], [[abstract-class-vs-interface|추상 클래스와 인터페이스]]
