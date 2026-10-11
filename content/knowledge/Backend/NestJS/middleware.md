---
title: "NestJS Middleware"
concept: "Nest Middleware"
summary: "라우트 핸들러 이전에 실행되는 함수를 클래스로 만들고 모듈에서 특정 경로에 적용하는 NestJS 미들웨어."
tags: ["nestjs", "middleware", "logging", "backend"]
source: til
---

NestJS의 미들웨어는 **라우트 핸들러보다 먼저 호출되는 함수**로, 요청·응답 객체와 `next()`에 접근할 수 있다. 개념은 [Express 미들웨어](Backend/Express/middleware)와 같고, 차이는 `@Injectable()` 클래스로 만들어 DI를 받을 수 있다는 점이다.

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

> 최신 버전에서는: NestJS 11은 Express 5를 사용하면서 경로 와일드카드 문법이 바뀌어, 전체 경로에는 `'*'` 대신 `'{*splat}'` 같은 이름 있는 와일드카드를 쓰도록 안내한다.

## Interceptor와의 차이

미들웨어는 요청 생명주기의 **가장 앞**에서 실행되고, 어떤 핸들러가 실행될지 모른다. 핸들러 실행 전후를 모두 감싸거나 반환값을 가공하려면 [Interceptor](Backend/NestJS/interceptor-aop)를 쓴다.

## 핵심 정리

- `NestMiddleware`를 구현한 `@Injectable()` 클래스의 `use(req, res, next)`에 로직을 작성한다.
- 모듈의 `configure(consumer)`에서 `apply().forRoutes()`로 경로에 연결한다.
