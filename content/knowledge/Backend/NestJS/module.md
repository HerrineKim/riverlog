---
title: "NestJS Module과 캡슐화"
concept: "Module"
summary: "관련된 컨트롤러·프로바이더를 하나로 묶고, export한 것만 외부에 공개하는 NestJS의 구성 단위."
tags: ["nestjs", "oop", "architecture", "typescript"]
source: til
date: "2026-10-13"
---

모듈은 기능 단위(예: cats, users, auth)로 컨트롤러와 프로바이더를 묶는 상자다. 루트 `AppModule`이 기능 모듈들을 `imports`해 앱 전체 구조가 트리 형태로 구성된다.

## CLI로 기능 모듈 만들기

```bash
nest g mo cats        # cats.module.ts
nest g co cats        # cats.controller.ts (모듈에 자동 등록)
nest g s cats         # cats.service.ts   (모듈에 자동 등록)
```

```typescript
// cats/cats.module.ts
@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService],   // 다른 모듈에서 쓰게 하려면 공개
})
export class CatsModule {}
```

```typescript
// app.module.ts
@Module({
  imports: [CatsModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

## `@Module` 속성

| 속성 | 의미 |
| --- | --- |
| `imports` | 이 모듈이 사용할 다른 모듈 |
| `controllers` | 이 모듈의 컨트롤러 |
| `providers` | 이 모듈 안에서 생성·주입될 프로바이더 |
| `exports` | 이 모듈을 import한 쪽에 공개할 프로바이더 |

## 캡슐화

모듈은 기본적으로 프로바이더를 **캡슐화**한다. 현재 모듈에 직접 등록했거나, import한 모듈이 **export한** 프로바이더만 주입할 수 있다.

- `CatsModule`이 `exports: [CatsService]`를 하지 않으면, `AppModule`이 `CatsModule`을 import해도 `AppController`에서 `CatsService`를 주입받을 수 없다.
- 다른 모듈의 서비스를 쓰고 싶다고 그 서비스를 내 모듈 `providers`에 다시 등록하면 **별도의 인스턴스**가 생긴다. 공유하려면 반드시 export/import로 가져온다.

캡슐화(encapsulation)란 객체의 속성과 행위를 하나로 묶고 내부 구현을 감추는 것이다. 모듈 단위로 공개 범위를 통제해 의존 관계를 명확히 한다.

## 순환 참조와 `forwardRef`

`CatsModule`이 `AuthModule`을 import하고, `AuthModule`도 `CatsModule`을 import하면 **순환 의존**이 생겨 Nest가 모듈을 해석하지 못한다. 양쪽을 `forwardRef()`로 감싸면 해결된다.

```typescript
// auth.module.ts
@Module({
  imports: [forwardRef(() => CatsModule)],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

// cats.module.ts
@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [CatsService, CatsRepository],
  exports: [CatsService, CatsRepository],
})
export class CatsModule {}
```

> `forwardRef`는 응급 처치에 가깝다. 공통으로 필요한 부분(예: DB 접근)을 [Repository](Backend/NestJS/repository-pattern)나 별도 모듈로 분리해 순환 자체를 없애는 설계가 더 바람직하다.

## 핵심 정리

- 기능 단위로 모듈을 만들고 `AppModule`에서 import한다.
- 다른 모듈에서 쓰일 프로바이더는 `exports`에 넣는다.
- 모듈 간 순환 의존은 `forwardRef(() => Module)`로 풀 수 있지만, 구조 개선이 우선이다.
