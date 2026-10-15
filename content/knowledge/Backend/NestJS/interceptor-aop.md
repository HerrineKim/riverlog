---
title: "NestJS Interceptor와 AOP"
concept: "Interceptor"
summary: "핸들러 실행 전후를 감싸 로깅·응답 가공 같은 횡단 관심사를 한곳에서 처리하는 NestJS 인터셉터와 그 배경인 AOP."
tags: ["nestjs", "aop", "design-pattern", "backend"]
source: til
date: "2026-10-13"
---

인터셉터는 `NestInterceptor` 인터페이스를 구현한 `@Injectable()` 클래스로, **컨트롤러 핸들러 실행 전과 후 양쪽에 로직을 끼워 넣을 수 있다.** 관점 지향 프로그래밍(AOP)에서 영감을 받았다.

## AOP(Aspect Oriented Programming)

로깅, 응답 포맷, 실행 시간 측정, 캐싱처럼 여러 기능(세로 기둥)에 공통으로 걸쳐 있는 **횡단 관심사**(cross-cutting concern)를 각 기능 안에 흩어 쓰지 않고 하나의 모듈로 분리해 모듈성을 높이는 패러다임이다.

![AOP: 여러 컨트롤러에 걸친 공통 관심사](/images/til/BACKEND/Nestjs/-Deprecated-%ED%83%84%ED%83%84%ED%95%9C-%EB%B0%B1%EC%97%94%EB%93%9C-NestJS-%EA%B8%B0%EC%B4%88%EB%B6%80%ED%84%B0-%EC%8B%AC%ED%99%94%EA%B9%8C%EC%A7%80/04-NestJS-%EA%B0%9C%EC%9A%94-%EB%B0%8F-%EA%B0%9D%EC%B2%B4%EC%A7%80%ED%96%A5-%EB%94%94%EC%9E%90%EC%9D%B8-%ED%8C%A8%ED%84%B4/08-Interceptors-AOP-%ED%8C%A8%ED%84%B4.assets/image-20221227095708963.png)

## 실행 시간 측정 인터셉터

```typescript
// common/interceptors/logging.interceptor.ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');               // 핸들러 실행 전 (pre-controller)
    const now = Date.now();
    return next
      .handle()                              // 실제 핸들러 실행
      .pipe(tap(() => console.log(`After... ${Date.now() - now}ms`))); // 실행 후
  }
}
```

- `next.handle()`을 호출해야 핸들러가 실행되고, 그 결과가 RxJS `Observable`로 돌아온다.
- `.pipe()` 안의 연산자로 결과를 관찰(`tap`)하거나 변형(`map`)한다.

## 성공 응답 형식 통일하기

[Exception Filter](Backend/NestJS/exception-filter-pipe)가 실패 응답을 통일한다면, 인터셉터로는 성공 응답을 통일할 수 있다.

```typescript
// common/interceptors/success.interceptor.ts
@Injectable()
export class SuccessInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => ({ success: true, data })));
  }
}
```

```typescript
@Controller('cats')
@UseInterceptors(SuccessInterceptor)
@UseFilters(HttpExceptionFilter)
export class CatsController {
  @Get()
  getAllCat() {
    return { cats: 'get all cat api' };
  }
}
// 응답: { "success": true, "data": { "cats": "get all cat api" } }
```

적용 범위는 필터와 같다: 메서드·컨트롤러(`@UseInterceptors`), 전역(`app.useGlobalInterceptors()`).

## 요청 생명주기에서의 위치

인터셉터는 Guard 다음, Pipe 앞에서 한 번(전처리), 핸들러 실행 뒤 Exception Filter 앞에서 한 번(후처리) 실행된다. 전체 순서는 [[NestJS|NestJS 요청 생명주기]]에 있다.

## Middleware와 무엇이 다른가

| | Middleware | Interceptor |
| --- | --- | --- |
| 실행 시점 | 생명주기 맨 앞, 핸들러 실행 전만 | 핸들러 실행 **전과 후** 모두 |
| 실행할 핸들러 정보 | 모름 | `ExecutionContext`로 어떤 컨트롤러·메서드인지 앎 |
| 반환값 가공 | 불가 | `map` 등으로 가능 |
| 주 용도 | 요청 로깅, 바디 파싱, 공통 헤더 | 응답 포맷, 실행 시간, 캐싱, 타임아웃 |

## 핵심 정리

- 인터셉터 = `intercept(context, next)`에서 `next.handle()`을 감싸는 구조.
- 전·후 처리가 모두 필요한 횡단 관심사(AOP)에 쓴다.
- 성공 응답은 인터셉터, 실패 응답은 Exception Filter로 형식을 맞추면 API 응답이 일관된다.
