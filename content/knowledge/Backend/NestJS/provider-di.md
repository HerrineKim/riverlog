---
title: "NestJS Provider와 의존성 주입(DI)"
concept: "Dependency Injection"
summary: "@Injectable 클래스를 모듈에 등록해 두면 Nest가 인스턴스를 만들어 필요한 곳의 생성자에 주입해 주는 구조."
tags: ["nestjs", "design-pattern", "typescript", "oop"]
source: til
date: "2026-10-13"
---

NestJS의 핵심은 **의존성 주입(Dependency Injection)이다**. 컨트롤러가 서비스를 직접 `new`로 만들지 않고, 생성자에 "이게 필요하다"고 선언만 하면 Nest가 알맞은 인스턴스를 넣어 준다.

## 비유: 소비자 · 제품 · 공급자

| 비유 | NestJS |
| --- | --- |
| 소비자 | `AppController` — 서비스를 사용하는 쪽 |
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

## 무엇이 Provider가 될 수 있나

서비스뿐 아니라 리포지토리, 팩토리, 헬퍼 등 Nest 클래스 대부분이 Provider가 될 수 있다. `@Injectable()`이 붙은 [미들웨어](Backend/NestJS/nestjs-middleware), [인터셉터](Backend/NestJS/interceptor-aop), [리포지토리](Backend/NestJS/repository-pattern), JWT Strategy 모두 같은 방식으로 주입된다.

## 왜 DI를 쓰는가

- **결합도 감소**: 컨트롤러는 서비스의 생성 방법을 모른다. 구현을 바꿔도 사용하는 쪽은 그대로다.
- **싱글톤 관리**: 기본 스코프에서 Provider는 앱 전체에서 **하나의 인스턴스**로 공유된다. Express에서 손으로 하던 [싱글톤 패턴](Backend/Express/singleton-service-pattern)을 프레임워크가 대신 해 준다.
- **테스트 용이성**: 테스트에서 실제 서비스 대신 가짜(mock) Provider를 주입하기 쉽다.

## 핵심 정리

- `@Injectable()` + 모듈의 `providers` 등록 = 주입 가능한 Provider.
- 생성자 파라미터에 `private readonly x: XService`로 선언하면 주입된다.
- 다른 모듈의 Provider를 쓰려면 [Module](Backend/NestJS/module)에서 `exports`/`imports`가 필요하다.
