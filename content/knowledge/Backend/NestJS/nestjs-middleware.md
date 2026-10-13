---
title: "NestJS Middleware"
concept: "Nest Middleware"
summary: "라우트 핸들러 이전에 실행되는 함수를 클래스로 만들고 모듈에서 특정 경로에 적용하는 NestJS 미들웨어."
tags: ["nestjs", "middleware", "logging", "backend"]
source: til
date: "2026-10-13"
---

NestJS의 미들웨어는 **라우트 핸들러보다 먼저 호출되는 함수**로, 요청·응답 객체와 `next()`에 접근할 수 있다. 개념은 [Express 미들웨어](Backend/Express/express-middleware)와 같고, 차이는 `@Injectable()` 클래스로 만들어 DI를 받을 수 있다는 점이다.

## 만들기

```bash
nest g middleware logger
```

```typescript
// common/middlewares/logger.middleware.ts
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    // 응답이 끝난 시점(finish)에 상태 코드까지 함께 기록
    res.on('finish', () => {
      this.logger.log(
        `${req.ip} ${req.method} ${req.originalUrl} ${res.statusCode} ${res.statusMessage}`,
      );
    });
    next();
  }
}
```

- `console.log` 대신 Nest 내장 `Logger`를 쓰면 컨텍스트(`HTTP`)·타임스탬프·색상이 붙은 일관된 로그가 남는다.
- 요청이 들어오는 순간에는 상태 코드를 모르므로 `res.on('finish')`에서 기록한다.

## 적용하기

미들웨어는 `@Module`의 속성이 아니라 모듈 클래스가 `NestModule`을 구현하고 `configure()`에서 등록한다.

```typescript
// app.module.ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

@Module({ imports: [CatsModule] })
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
```

- `consumer.apply(미들웨어)`: 적용할 미들웨어 지정
- `.forRoutes(...)`: 적용할 경로. `'cats'`, `CatsController`, `{ path: 'cats', method: RequestMethod.GET }` 등을 줄 수 있고 `'*'`는 전체 경로다.
- `.exclude(...)`: 제외할 경로

경로 일부에 와일드카드를 쓸 때는 Express 5(path-to-regexp 8) 문법을 따른다. NestJS 11부터 와일드카드에 이름을 붙여 `'cats/*splat'`처럼 쓰고, `cats/` 자체까지 포함하려면 중괄호로 감싸 `'cats/{*splat}'`로 쓴다. 과거의 `'cats/*'`·`'ab*cd'` 같은 익명 와일드카드는 더 이상 쓰지 않는다. ([NestJS Middleware 문서](https://docs.nestjs.com/middleware))

## Interceptor와의 차이

미들웨어는 생명주기의 가장 앞에서 실행되고 어떤 핸들러가 실행될지 모른다. 핸들러 전후를 감싸거나 반환값을 가공하는 Interceptor와의 비교표는 [[interceptor-aop|NestJS Interceptor와 AOP]]에 있다.

## 핵심 정리

- `NestMiddleware`를 구현한 `@Injectable()` 클래스의 `use(req, res, next)`에 로직을 작성한다.
- 모듈의 `configure(consumer)`에서 `apply().forRoutes()`로 경로에 연결한다.
