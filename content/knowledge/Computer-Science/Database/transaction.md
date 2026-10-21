---
title: "트랜잭션과 회복"
concept: "Transaction"
summary: "트랜잭션의 ACID 특성, 이를 지키기 위한 병행 제어·고립화 수준·회복 기법을 연결해서 정리. MVCC가 스냅숏으로 읽는 방식, 잠금의 종류와 단위, 비관적·낙관적 잠금까지 다룬다."
tags: ["database", "transaction", "acid", "certificate", "concurrency"]
source: mixed
date: "2026-10-13"
sources: ["https://bytebytego.com/guides/what-does-acid-mean", "https://bytebytego.com/guides/what-are-database-isolation-levels", "https://bytebytego.com/guides/what-are-the-differences-among-database-locks", "https://bytebytego.com/guides/pessimistic-vs-optimistic-locking", "https://dev.mysql.com/doc/refman/8.4/en/innodb-multi-versioning.html", "https://d2.naver.com/helloworld/407507"]
---

> 노션 정리를 바탕으로, MVCC·잠금의 종류·비관적/낙관적 잠금은 ByteByteGo의 System Design 101 가이드 「[What does ACID mean?](https://bytebytego.com/guides/what-does-acid-mean)」, 「[What are Database Isolation Levels?](https://bytebytego.com/guides/what-are-database-isolation-levels)」, 「[What are the Differences Among Database Locks?](https://bytebytego.com/guides/what-are-the-differences-among-database-locks)」, 「[Pessimistic vs Optimistic Locking](https://bytebytego.com/guides/pessimistic-vs-optimistic-locking)」로, 버퍼 정책·로그·재시작 복구는 「[DBMS는 어떻게 트랜잭션을 관리할까?](https://d2.naver.com/helloworld/407507)」로 보강했다.

트랜잭션은 데이터베이스에서 **하나의 논리적 작업 단위**다. 계좌 이체처럼 "출금"과 "입금"이 둘 다 되거나 둘 다 안 되어야 하는 작업을 묶는다. 트랜잭션이 지켜야 할 네 가지 성질(ACID)과, DBMS가 각 성질을 보장하는 수단을 짝지어 기억하면 이해가 쉽다.

## ACID

| 특성 | 의미 | 보장 수단 |
| --- | --- | --- |
| 원자성 (Atomicity) | 모두 반영되거나 전혀 반영되지 않음 (All or Nothing) | Commit / Rollback, 회복 |
| 일관성 (Consistency) | 트랜잭션 전후로 DB가 일관된 상태(제약 조건 만족) | 무결성 제약, 병행 제어 |
| 격리성 (Isolation) | 실행 중인 트랜잭션에 다른 트랜잭션이 끼어들 수 없음 | 고립화 수준, 로킹 |
| 지속성 (Durability) | 커밋된 결과는 장애가 나도 영구히 유지 | 로그, 회복 기법 |

예: 송금 도중 장애가 나서 출금만 되고 입금이 안 되면 원자성이 깨진 것이다. 이때 Rollback으로 출금도 취소해야 한다.

- **ACID의 일관성과 CAP의 일관성은 다른 말이다.** ACID의 C는 「트랜잭션이 끝나도 제약 조건·불변식(잔액은 음수가 아니다 등)이 지켜진다」는 뜻이고, [[database-models|CAP 정리]]의 C는 「어느 노드에서 읽어도 가장 최근에 쓴 값을 본다」는 뜻이다.
- **격리성의 이상형은 직렬성(serializability)** 이다. 모든 트랜잭션이 혼자 도는 것처럼 보이게 한다. 비용이 커서 실제로는 더 느슨한 고립화 수준을 기본값으로 쓴다.
- **분산 환경의 지속성**은 디스크 기록만으로 부족하다. 커밋한 데이터를 다른 노드에도 복제해야 한 서버가 통째로 사라져도 남는다.

## 트랜잭션 제어어 (TCL)

| 명령 | 의미 |
| --- | --- |
| `COMMIT` | 트랜잭션 결과를 DB에 영구 반영 |
| `ROLLBACK` | 트랜잭션 실행 이전 상태로 되돌림 |
| `SAVEPOINT` | 롤백할 중간 지점 지정 (`ROLLBACK TO 이름`) |

## 병행 제어 (Concurrency Control)

여러 트랜잭션이 동시에 실행될 때 결과가 순차 실행한 것과 같도록 보장한다.

- **로킹(Locking)**: 접근할 데이터에 잠금을 걸어 연산이 끝날 때까지 다른 트랜잭션의 접근을 막는다(상호 배제). 잠금 단위가 크면 관리가 쉽지만 병행성이 떨어지고, 작으면 그 반대다.
- **낙관적 검증**: 일단 실행하고 커밋 직전에 충돌 여부를 검사한다.
- **타임스탬프 순서**: 트랜잭션 시작 시각 순서대로 실행 순서를 정한다.
- **다중 버전 동시성 제어(MVCC)**: 데이터의 여러 버전을 두어 읽기와 쓰기가 서로 막지 않게 한다.

## 고립화 수준 (Isolation Level)

격리를 얼마나 엄격하게 할지 고르는 설정이다. 아래로 갈수록 엄격하고 성능 비용이 크다.

| 수준 | Dirty Read | Non-repeatable Read | Phantom Read |
| --- | --- | --- | --- |
| Read Uncommitted | 발생 | 발생 | 발생 |
| Read Committed | 방지 | 발생 | 발생 |
| Repeatable Read | 방지 | 방지 | 발생 |
| Serializable | 방지 | 방지 | 방지 |

위 표는 SQL 표준의 정의다. 실제 DBMS는 MVCC로 구현해 표준보다 강하게 막는 경우가 있다. 예를 들어 PostgreSQL은 Read Uncommitted를 Read Committed처럼 다루고 Repeatable Read에서도 팬텀을 막는다. MySQL InnoDB의 기본값은 Repeatable Read, PostgreSQL·Oracle의 기본값은 Read Committed다.

### MVCC가 스냅숏으로 읽는 방식

MVCC는 행을 덮어쓰지 않고 **새 버전을 만들고 옛 버전을 남겨**, 읽는 트랜잭션이 자기에게 보여야 할 버전을 고르게 한다. MySQL InnoDB를 예로 들면 다음과 같다.

- 각 행에는 숨은 컬럼이 있다. 마지막으로 고친 트랜잭션 ID(`DB_TRX_ID`)와, undo 로그의 이전 버전을 가리키는 롤 포인터(`DB_ROLL_PTR`)다. 버전들이 포인터로 이어진 체인이 된다.
- 읽는 트랜잭션은 **읽기 뷰(read view)** 를 만든다. 「이 시점에 커밋되지 않았던 트랜잭션 ID 목록」이다. 행의 트랜잭션 ID가 그 목록에 있거나 더 나중이면 보이지 않으므로, 롤 포인터를 따라 보이는 버전까지 거슬러 올라간다.

```text
balance 행의 버전 체인
  [trx 201, balance=200] ──roll_ptr──▶ [trx 200, balance=100] (커밋됨)
     ▲ 트랜잭션 A가 수정 중(미커밋)

트랜잭션 B의 읽기 뷰: 201은 미커밋 → 건너뛰고 trx 200 버전을 읽는다 → 100
A가 커밋한 뒤에도 B(Repeatable Read)는 처음 만든 읽기 뷰를 계속 써서 100을 본다
```

| 수준 | 읽기 뷰를 만드는 때 | 결과 |
| --- | --- | --- |
| Read Committed | **문장마다** 새로 만든다 | 같은 트랜잭션 안에서도 다른 트랜잭션이 커밋한 새 값이 보인다 |
| Repeatable Read | 트랜잭션의 **첫 읽기 때 한 번** 만든다 | 트랜잭션 내내 같은 스냅숏을 본다 |

PostgreSQL은 undo 로그 대신 테이블 안에 옛 튜플 버전을 남기고(`xmin`·`xmax`로 생성·삭제 트랜잭션 표시), 나중에 VACUUM이 정리한다. MVCC는 **읽기**의 충돌을 없앨 뿐이고, 같은 행을 동시에 **쓰는** 충돌은 여전히 잠금으로 막는다.

## 잠금의 종류와 단위

### 잠금 모드

| 잠금 | 허용 | 다른 트랜잭션 |
| --- | --- | --- |
| 공유 잠금(S lock) | 읽기 | 다른 S 잠금은 함께 걸 수 있다. X 잠금은 기다린다 |
| 배타 잠금(X lock) | 읽기·쓰기 | 어떤 잠금도 함께 걸 수 없다 |
| 갱신 잠금(U lock) | 「곧 고칠 것」이라는 예약. 읽는 동안 S처럼 동작하다 쓸 때 X로 바뀐다 | 두 트랜잭션이 S를 들고 서로 X로 올리려다 생기는 교착을 막는다(SQL Server) |
| 의도 잠금(intention lock) | 「아래 행 어딘가에 잠금을 걸었다」는 표시를 테이블에 남긴다 | 테이블 잠금을 걸려는 쪽이 모든 행을 뒤지지 않고 충돌을 판단한다 |
| 스키마 잠금 | 테이블 구조 변경(DDL) 중 보호 | 구조를 바꾸는 동안 쿼리가 기다린다 |
| 대량 갱신 잠금(BU lock) | 대량 삽입 중 테이블 단위 잠금 하나로 처리 | 잠금 수를 줄여 적재가 빨라진다(SQL Server) |
| 키 범위 잠금 | 인덱스의 범위(빈 틈 포함)를 잠근다 | 이미 읽은 범위에 새 행이 끼어드는 **팬텀 읽기**를 막는다. InnoDB의 갭 잠금·넥스트 키 잠금이 같은 역할이다 |

```text
호환성    S    X
   S     ○    ✕
   X     ✕    ✕
```

### 잠금 단위

| 단위 | 장점 | 단점 |
| --- | --- | --- |
| 행 | 다른 행은 동시에 쓸 수 있어 병행성이 높다 | 잠금 수가 많아 관리 비용이 크다 |
| 페이지 | 고정 크기 블록 단위. 중간 | 같은 페이지의 무관한 행까지 막는다 |
| 테이블 | 구현이 단순하고 비용이 작다 | 병행성이 크게 떨어진다 |

잠금이 너무 많아지면 DB가 행 잠금을 테이블 잠금으로 합치기도 한다(lock escalation).

### 비관적 잠금과 낙관적 잠금

| 항목 | 비관적 잠금(pessimistic) | 낙관적 잠금(optimistic) |
| --- | --- | --- |
| 가정 | 충돌이 자주 난다 | 충돌은 드물다 |
| 방법 | 고치기 전에 먼저 잠근다. 다른 트랜잭션은 잠금이 풀릴 때까지 기다린다 | 잠그지 않고 진행하고, 커밋할 때 그사이 누가 바꿨는지 검사한다. 바뀌었으면 실패시키고 다시 시도한다 |
| 구현 | `SELECT ... FOR UPDATE` | 버전 컬럼이나 수정 시각을 조건에 넣는다 |
| 장점 | 충돌이 많아도 정합성이 확실하다. 재시도가 없다 | 잠금 대기가 없어 처리량이 높다 |
| 단점 | 대기·교착 상태, 처리량 저하 | 충돌이 잦으면 재시도가 폭증한다 |
| 맞는 곳 | 재고 차감, 좌석 예약처럼 같은 행에 경쟁이 몰릴 때 | 게시글 수정, 설정 변경처럼 충돌이 드물 때 |

```sql
-- 비관적: 읽으면서 잠근다
BEGIN;
SELECT stock FROM product WHERE id = 1 FOR UPDATE;
UPDATE product SET stock = stock - 1 WHERE id = 1;
COMMIT;

-- 낙관적: 읽은 버전이 그대로일 때만 쓴다
UPDATE product SET stock = 9, version = version + 1
WHERE id = 1 AND version = 3;   -- 영향받은 행이 0이면 누군가 먼저 고쳤다 → 다시 읽고 재시도
```

잠금을 쓸 때의 원칙은 공통이다.

- 잠금은 **가능한 짧게** 잡는다. 트랜잭션 안에서 외부 API 호출처럼 오래 걸리는 일을 하지 않는다.
- 잠금은 **가능한 작은 단위**(테이블보다 행)로 건다.
- 충돌로 실패한 트랜잭션은 **재시도 로직**을 둔다.

## 회복 기법 (Recovery)

장애가 났을 때 DB를 일관된 상태로 되돌린다. 로그에 기록된 정보로 **REDO**(커밋된 작업을 다시 반영)와 **UNDO**(커밋 안 된 작업을 취소)를 수행한다.

| 기법 | 방식 | 회복 시 |
| --- | --- | --- |
| 지연(연기) 갱신 | 커밋될 때까지 DB 반영을 미룸 | REDO만 |
| 즉시 갱신 | 변경을 즉시 DB에 반영 | REDO와 UNDO 모두 |
| 그림자 페이징 | 페이지 복사본(그림자)을 두고 실패 시 복사본으로 교체 | 로그 불필요 |
| 검사점(Checkpoint) | 주기적으로 검사점을 로그에 기록 | 최근 검사점 이후만 회복 → 시간 단축 |
| 미디어 회복 | 주기적으로 DB를 다른 저장 장치에 덤프 | 디스크 손상 대비 |

### 버퍼 관리 정책이 UNDO·REDO를 정한다

DBMS는 데이터를 고정 크기 **페이지** 단위로 읽고 쓰며, 메모리의 페이지는 **버퍼 관리자**가 관리한다. 수정된 페이지를 언제 디스크에 내리느냐에 따라 필요한 회복이 달라진다.

| 정책 | 뜻 | 결과 |
| --- | --- | --- |
| STEAL | 커밋 전이라도 수정된 페이지를 디스크에 쓸 수 있다 | 미완료 변경이 디스크에 남을 수 있으므로 **UNDO** 필요 |
| ¬STEAL | 트랜잭션이 끝날 때까지 수정 페이지를 버퍼에 붙잡는다 | UNDO 불필요. 대신 버퍼가 커야 한다 |
| FORCE | 커밋 시점에 수정 페이지를 모두 디스크에 쓴다 | REDO 불필요. 커밋이 느리다 |
| ¬FORCE | 커밋 시점에 데이터 페이지는 쓰지 않고 로그만 쓴다 | 커밋된 변경이 디스크에 없을 수 있으므로 **REDO** 필요 |

대부분의 DBMS는 버퍼를 자유롭게 쓰고 커밋을 빠르게 하려고 **STEAL + ¬FORCE**를 고른다. 그래서 UNDO와 REDO가 둘 다 필요하고, 그 정보를 로그에 남긴다.

### 로그와 WAL

로그는 갱신을 순서대로 덧붙여 쓰는 기록이고, 레코드마다 단조 증가하는 **LSN(Log Sequence Number)** 이 붙는다.

| 로깅 방식 | 기록하는 것 | 특징 |
| --- | --- | --- |
| 물리적 상태 로깅 | 갱신 전 이미지와 후 이미지 | 가장 흔하다. 이미지를 덮어쓰기만 하면 되므로 복구가 멱등이다 |
| 물리적 전이 로깅 | 두 이미지의 XOR 차이 | 로그가 작다 |
| 논리적 전이 로깅 | 수행한 연산 자체(`a = a + 1`) | 로그가 작고, 페이지 분할·병합으로 위치가 바뀌는 B+트리 같은 구조에 적합하다. 다시 실행하면 결과가 달라질 수 있어 멱등성을 따로 챙긴다 |

실제 제품은 이 방식들을 섞어 쓴다. 로그 쓰기에는 두 규칙이 있다.

1. **WAL(Write-Ahead Logging)**: 데이터 페이지가 디스크에 쓰이기 전에 그 변경의 UNDO 정보가 먼저 로그에 쓰여야 한다.
2. 커밋이 끝나기 전에 그 트랜잭션의 REDO 정보가 로그 파일에 쓰여야 한다.

### 커밋 비용 줄이기

커밋 시간의 대부분은 로그를 쓰고 `fsync`로 디스크 반영을 기다리는 시간이다.

| 기법 | 방식 | 대가 |
| --- | --- | --- |
| 그룹 커밋 | 잠깐 기다렸다가 여러 트랜잭션의 커밋 로그를 한 번의 `fsync`로 내린다 | 대기 시간을 길게 잡으면 응답이 느려진다 |
| 느슨한 플러시 | 커밋마다가 아니라 주기적으로 `fsync`한다 (MySQL InnoDB의 `innodb_flush_log_at_trx_commit` 값 0·2) | 장애 시 최근 1초 안팎의 커밋을 잃을 수 있다 |
| 비동기 커밋 | 로그 버퍼에만 쓰고 커밋을 끝낸다 (PostgreSQL `synchronous_commit = off`) | 지속성을 일부 포기한다 |

### 재시작 복구의 세 단계

장애 뒤 재시작할 때 ARIES 계열 DBMS는 다음 순서로 복구한다.

```text
1. 분석: 마지막 검사점부터 로그 끝까지 훑어 복구 시작점과 미완료 트랜잭션을 찾는다
2. REDO: 시작점부터 장애 직전까지 모든 로그를 다시 적용한다 (실패한 트랜잭션 것도)
         → "역사를 반복"해 장애 시점 상태를 그대로 재현한다
3. UNDO: 로그를 거꾸로 훑으며 미완료 트랜잭션을 철회한다
```

- 페이지마다 마지막으로 반영된 로그의 **page LSN**을 적어 두어, 이미 반영된 로그는 건너뛴다.
- UNDO를 할 때마다 **보상 로그 레코드(CLR, Compensation Log Record)** 를 남긴다. 복구 중에 또 장애가 나도 이미 되돌린 작업을 다시 되돌리지 않는다.
- 트랜잭션 하나를 철회할 때도 로그를 역방향으로 따라가며 같은 방식으로 UNDO한다.
- 운영 중에 뜨는 **퍼지 백업(fuzzy backup)** 은 미완료 변경이 섞인 스냅숏이다. 백업과 그 뒤의 로그를 함께 적용(roll-forward)해 일관된 시점으로 되살린다. 로그가 남아 있으면 원하는 시점까지 복원할 수 있다(PITR).

## 장애 대응 지표

- **RTO(Recovery Time Objective, 목표 복구 시간)**: 장애 발생부터 업무가 정상화될 때까지 허용되는 시간
- **RPO(Recovery Point Objective, 목표 복구 시점)**: 데이터를 어느 시점까지 되살려야 하는지(허용 가능한 데이터 손실량)

## 핵심 정리

- 원자성·지속성 ↔ 회복, 격리성 ↔ 고립화 수준·로킹, 일관성 ↔ 무결성 제약·병행 제어.
- 지연 갱신은 REDO만, 즉시 갱신은 REDO + UNDO. 실제 DBMS는 STEAL + ¬FORCE라서 WAL 로그로 둘 다 한다.
- MVCC는 버전을 남겨 읽기와 쓰기가 서로 막지 않게 하고, 쓰기끼리의 충돌은 잠금으로 막는다.
- 경쟁이 몰리는 데이터는 비관적 잠금, 충돌이 드문 데이터는 낙관적 잠금이 맞다.

로킹으로 상호 배제를 구현하는 발상은 운영체제의 [[process-synchronization|프로세스 동기화]]와 같고, 트랜잭션끼리 서로의 잠금을 기다리면 [[deadlock|교착 상태]]가 생길 수 있다. SQL이 실행될 때 잠금 관리자가 어디에 끼는지는 [[database-internals|DB 내부 구조: 쿼리 실행과 인덱스 자료 구조]]에 있다.
