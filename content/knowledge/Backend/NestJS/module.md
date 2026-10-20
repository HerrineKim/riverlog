---
title: "NestJS Module과 Provider: 의존성 주입과 캡슐화"
concept: "Module"
summary: "@Injectable 클래스를 모듈의 providers에 등록하면 Nest가 인스턴스를 만들어 생성자에 주입한다(DI). 모듈은 관련 컨트롤러·프로바이더를 묶고 export한 것만 밖에 공개하는 구성 단위다."
tags: ["nestjs", "oop", "architecture", "typescript", "design-pattern"]
source: til
date: "2026-10-20"
---

NestJS의 뼈대는 두 가지다. **Provider와 의존성 주입(Dependency Injection)** 이 객체를 만들어 연결하고, **Module**이 그 객체들을 기능 단위로 묶어 공개 범위를 정한다.

## Provider와 의존성 주입

컨트롤러는 서비스를 직접 `new`로 만들지 않는다. 생성자에 "이게 필요하다"고 선언만 하면 Nest가 알맞은 인스턴스를 넣어 준다.

| 비유 | NestJS |
| --- | --- |
| 소비자 | `AppController`: 서비스를 사용하는 쪽 |
| 제품 | `AppService` 인스턴스 |
| 공급자(Provider) | `@Injectable()`로 표시되고 모듈의 `providers`에 **등록된** 클래스 |
| 사업자 등록 | `@Module({ providers: [AppService] })` |

```typescript
@Injectable()
export class AppService {
  getHello() { return 'Hello World!'; }
}

@Controller()
export class AppController {
  // 생성자에 타입만 선언하면 Nest가 AppService 인스턴스를 주입한다
  constructor(private readonly appService: AppService) {}
}

@Module({
  controllers: [AppController],
  providers: [AppService],   // ← 여기 등록해야 주입 가능
})
export class AppModule {}
```

`providers`에서 `AppService`를 빼면 앱 시작 시 *"Nest can't resolve dependencies of the AppController"* 에러가 난다. 공급자 등록이 없으니 소비자에게 제품을 줄 수 없는 것이다.

서비스뿐 아니라 리포지토리, 팩토리, 헬퍼도 Provider가 된다. `@Injectable()`이 붙은 [[interceptor-aop|미들웨어·인터셉터]], [[repository-pattern|리포지토리]], JWT Strategy 모두 같은 방식으로 주입된다.

| DI를 쓰는 이유 | 내용 |
| --- | --- |
| 결합도 감소 | 컨트롤러는 서비스의 생성 방법을 모른다. 구현을 바꿔도 사용하는 쪽은 그대로다 |
| 싱글톤 관리 | 기본 스코프에서 Provider는 앱 전체에서 **하나의 인스턴스**로 공유된다. Express에서 손으로 하던 [[singleton-service-pattern\|싱글톤 패턴]]을 프레임워크가 대신 한다 |
| 테스트 용이성 | 테스트에서 실제 서비스 대신 가짜(mock) Provider를 주입하기 쉽다 |

## Module: 기능 단위로 묶기

모듈은 기능 단위(예: cats, users, auth)로 컨트롤러와 프로바이더를 묶는 상자다. 루트 `AppModule`이 기능 모듈들을 `imports`해 앱 전체 구조가 트리 형태로 구성된다.

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

// app.module.ts
@Module({
  imports: [CatsModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

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

- `@Injectable()` + 모듈의 `providers` 등록 = 주입 가능한 Provider. 생성자에 `private readonly x: XService`로 선언하면 주입된다.
- 기능 단위로 모듈을 만들고 `AppModule`에서 import한다.
- 다른 모듈에서 쓰일 프로바이더는 `exports`에 넣는다. 다시 `providers`에 등록하면 인스턴스가 따로 생긴다.
- 모듈 간 순환 의존은 `forwardRef(() => Module)`로 풀 수 있지만, 구조 개선이 우선이다.

관련 노트: [[project-structure|NestJS 프로젝트 구조와 실행 흐름]], [[repository-pattern|Repository 패턴과 레이어 분리]], [[singleton-service-pattern|Express 싱글톤 패턴과 서비스 패턴]]
