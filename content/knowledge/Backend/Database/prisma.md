---
title: "Prisma: 커서로 이전·다음 항목 찾기와 CLI"
concept: "Prisma"
summary: "Node.js ORM Prisma의 cursor·skip·take로 상세 화면의 이전/다음 항목 키를 조회하는 방법과, 자주 쓰는 Prisma CLI 명령."
tags: ["database", "orm", "nodejs", "pagination", "backend"]
source: notion
date: "2026-10-13"
---

**Prisma**는 `schema.prisma` 파일에 모델을 정의하면 타입이 보장되는 DB 클라이언트(Prisma Client)를 생성해 주는 Node.js·TypeScript ORM이다. NestJS 같은 프레임워크와 함께 많이 쓴다. 여기서는 상세 화면에서 '이전 글 / 다음 글'로 넘겨 보는 기능을 Prisma의 **커서(cursor)** 로 구현한 방법을 정리한다.

## 상세 화면의 이전·다음 키

상세 조회 API가 현재 항목과 함께 **이전·다음 항목의 key**를 돌려주면, 프론트엔드는 그 key로 다시 조회해 화면을 바꿔 끼울 수 있다.

| 옵션 | 역할 |
| --- | --- |
| `cursor` | 기준이 되는 레코드(현재 항목). 고유한 필드여야 한다 |
| `skip: 1` | 커서 자신은 건너뛴다 |
| `take: 1` | 한 건만 가져온다 |
| `orderBy` | 방향. 목록 정렬 기준과 같은 필드로, 한쪽은 `desc` 다른 쪽은 `asc` |

```ts
const baseWhere = { isDeleted: false, ...permissionCondition }

const [next, prev] = await Promise.all([
  this.prisma.item.findFirst({
    select: { key: true },
    where: baseWhere,
    cursor: { key: itemKey },
    skip: 1,
    take: 1,
    orderBy: { key: 'desc' }, // 목록이 최신순(desc)이라면 '다음'은 더 작은 key
  }),
  this.prisma.item.findFirst({
    select: { key: true },
    where: baseWhere,
    cursor: { key: itemKey },
    skip: 1,
    take: 1,
    orderBy: { key: 'asc' },
  }),
])

return { ...item, nextKey: next?.key, prevKey: prev?.key }
```

- `where`에는 **목록 조회와 같은 조건**(삭제 여부, 권한, 같은 게시판·작성자 등)을 똑같이 넣는다. 그래야 사용자가 목록에서 볼 수 없는 항목으로 넘어가지 않는다.
- 두 쿼리는 서로 독립적이므로 `Promise.all`로 동시에 실행한다.

### 첫·마지막 항목에서 500 에러

마지막 항목이면 다음 항목이 없어 `findFirst`가 `null`을 반환한다. 이때 `next.key`에 접근하면 `TypeError`가 나고 API가 500을 응답한다. **옵셔널 체이닝**(`next?.key`)으로 `undefined`를 돌려주고, 프론트엔드는 키가 없으면 버튼을 비활성화한다.

## 목록 페이지네이션

같은 `cursor` + `skip: 1` + `take` 조합이 목록의 **커서 페이지네이션**이 되고, `skip: page * size` + `take`가 **오프셋 페이지네이션**이 된다. 두 방식의 성능·안정성 차이와 고르는 기준은 [[api-pagination|API 페이지네이션]]에 있다.

## 자주 쓰는 Prisma CLI

| 명령 | 용도 |
| --- | --- |
| `npx prisma studio` | 브라우저에서 DB를 보고 편집하는 GUI 실행 |
| `npx prisma generate` | 스키마 변경 후 Prisma Client(타입 포함) 재생성. Prisma 7부터는 `migrate dev` 뒤에도 직접 실행해야 한다 |
| `npx prisma migrate dev` | 스키마 변경을 마이그레이션 파일로 만들고 개발 DB에 적용 |
| `npx prisma migrate deploy` | 운영 DB에 마이그레이션 적용 |
| `npx prisma db pull` | 기존 DB 구조를 읽어 스키마 파일 생성 |

> Prisma 7(2025년 11월)부터 `migrate dev`·`db push`가 `prisma generate`를 자동 실행하지 않고, `migrate dev`가 seed도 자동 실행하지 않는다(`prisma db seed`로 따로 실행). DB 연결 설정은 프로젝트 루트의 `prisma.config.ts`로 옮겨졌고 `.env`도 자동으로 읽지 않는다. 클라이언트를 만들 때는 DB별 드라이버 어댑터가 필요하다. 위 커서 쿼리 API는 그대로다. ([Prisma 7 업그레이드 가이드](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7))

관련 노트: [SQL 기초](/knowledge/dictionary/backend/database/sql-basics), [NestJS Repository 패턴](/knowledge/dictionary/backend/nestjs/repository-pattern), [[orm-queryset|Django ORM과 QuerySet]]
