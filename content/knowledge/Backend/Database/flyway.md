---
title: "Flyway로 DB 마이그레이션 관리하기"
concept: "Flyway"
summary: "스키마 변경을 버전이 붙은 SQL 파일로 기록하고 순서대로 적용하는 오픈소스 DB 마이그레이션 도구 Flyway. 왜 쓰는지, 동작 방식, 실행 방법을 정리한다."
tags: ["database", "backend", "sql", "orm"]
source: mixed
date: "2026-10-12"
sources: ["https://riverkim.kr/254"]
---

> riverkim.kr에 쓴 글을 다시 정리한 노트입니다.

## DB 마이그레이션과 Flyway

**DB 마이그레이션**은 모델(엔티티)이 바뀌었을 때 그 변경을 실제 데이터베이스 스키마에 반영하는 일이다. Django에서는 `makemigrations` → `migrate`로 프레임워크가 이 일을 해 준다([[model-migration|Django Model과 Migration]]).

**Flyway**는 같은 일을 **특정 프레임워크에 묶이지 않고** 해 주는 오픈소스 도구다. 스키마 변경을 SQL 파일로 쌓아 두고, 아직 적용하지 않은 것만 순서대로 실행한다. Java·Spring 진영에서 많이 쓰지만 CLI로 어떤 프로젝트에서든 쓸 수 있다.

## 왜 쓰나

이미 배포되어 스키마가 복잡하고 사용자 데이터가 쌓인 DB가 있다고 하자. 엔티티가 바뀌면 DB에 직접 접속해 `ALTER TABLE`을 손으로 칠 수도 있지만, 실수 한 번이 서비스 장애로 이어진다.

| 이점 | 설명 |
| --- | --- |
| 휴먼 에러 방지 | 변경 사항을 파일로 정의해 두면 도구가 정해진 순서대로 적용한다. 가장 큰 목적이다 |
| 형상 관리 | Git처럼 어떤 변경이 언제 들어갔는지 이력으로 남는다. 마이그레이션 파일도 코드와 함께 리뷰·커밋된다 |
| 환경 일치 | 팀원마다 로컬 DB 상태가 달라도 같은 마이그레이션을 돌리면 같은 스키마가 된다. 개발·스테이징·운영 DB도 마찬가지다 |

## 동작 방식

```text
db/migration/
├── V1__create_user_table.sql
├── V2__add_email_to_user.sql
└── V3__create_post_table.sql

flyway migrate
→ DB의 이력 테이블(flyway_schema_history)을 확인
→ 아직 적용되지 않은 버전만 번호 순서대로 실행
→ 실행한 버전과 체크섬을 이력 테이블에 기록
```

- 파일 이름 규칙은 `V<버전>__<설명>.sql`(밑줄 두 개)이다.
- **이미 적용된 마이그레이션 파일은 고치지 않는다.** 체크섬이 바뀌어 검증에 실패한다. 수정이 필요하면 새 버전 파일을 추가한다.

## 사용법

1. DB 접속 정보(URL, 사용자, 비밀번호)를 Flyway 설정 파일이나 애플리케이션 설정에 적는다.
2. 마이그레이션 SQL 파일을 정해진 폴더에 버전 순서대로 둔다.
3. `flyway migrate`로 적용한다. Gradle·Maven 플러그인, CLI, Java API 중 편한 방식으로 실행할 수 있다.

Spring Boot처럼 의존성만 추가하면 애플리케이션 시작 시 자동으로 마이그레이션하는 프레임워크도 있다. 의존성과 설정 방법은 서버 프레임워크마다 다르니 쓰는 프레임워크의 문서를 따른다.

## 정리

- Flyway는 스키마 변경을 버전 붙은 SQL 파일로 관리하는 프레임워크 독립적인 마이그레이션 도구다.
- 이력 테이블을 보고 적용되지 않은 버전만 순서대로 실행한다.
- 손으로 DB를 고치는 실수를 막고, 변경 이력과 환경 간 스키마를 일치시키는 것이 핵심 가치다.
- 적용된 파일은 수정하지 말고 새 버전을 추가한다.

관련 노트: [[model-migration|Django Model과 Migration]], [[prisma|Prisma 커서로 이전·다음 항목 찾기]], [[sql-basics|SQL 기초]]

참고 자료

- [Flyway 공식 문서](https://documentation.red-gate.com/flyway)
- [DB 마이그레이션 도구 Flyway (테코블)](https://tecoble.techcourse.co.kr/post/2021-10-23-flyway/)
- [flyway를 통해 DDL 형상관리를 하자 - Spring Boot 편](https://sabarada.tistory.com/193)
- [달록의 데이터베이스 마이그레이션을 위한 Flyway 적용기](https://dallog.github.io/dallog-flyway/)
