---
title: "Express 싱글톤 패턴과 서비스 패턴"
concept: "Service Pattern"
summary: "서버 인스턴스를 하나의 클래스로 관리하고 라우터에서 비즈니스 로직을 서비스 파일로 분리하는 구조화 기법."
tags: ["express", "design-pattern", "backend", "typescript"]
source: til
---

라우트가 늘어나면 `app.ts`와 라우터 파일이 비대해진다. 서버 설정은 **싱글톤 클래스**로, 비즈니스 로직은 **서비스 파일**로 분리하면 읽기 쉽고 유지보수하기 좋아진다. 이 구조는 NestJS의 `main.ts` / `*.controller.ts` / `*.service.ts` 구조와 그대로 이어진다.

## 싱글톤 패턴

클래스의 인스턴스가 **오직 하나만** 만들어지도록 하는 패턴이다.

- 최초 한 번 생성한 인스턴스를 계속 재사용하므로 메모리 낭비를 줄이고, 생성 비용도 아낀다.
- 서버 애플리케이션처럼 "전체에서 하나만 있어야 하는 객체"에 잘 맞는다.

```typescript
// app.ts
import express from 'express';
import catsRouter from './cats/cats.route';

class Server {
  public app: express.Application;

  constructor() {
    this.app = express();
  }

  private setRoute(): void {
    this.app.use(catsRouter);
  }

  private setMiddleware(): void {
    this.app.use((req, res, next) => {   // 로깅
      console.log(req.method, req.originalUrl);
      next();
    });
    this.app.use(express.json());         // JSON 파싱
    this.setRoute();                      // 라우터
    this.app.use((req, res) => {          // 404
      res.status(404).send({ error: '404 not found error' });
    });
  }

  public listen(): void {
    this.setMiddleware();
    this.app.listen(8000, () => console.log('server is on...'));
  }
}

function init() {
  const server = new Server();
  server.listen();
}

init();
```

> 엄밀한 싱글톤은 생성자를 `private`으로 막고 `static getInstance()`로만 인스턴스를 얻게 한다. 위 코드는 "서버 객체를 하나만 만들어 쓰는 구조"를 보여 주는 단순한 형태다.

## 서비스 패턴

라우터에는 **경로와 핸들러 연결만** 남기고, 실제 처리 로직은 `cats.service.ts`로 옮긴다.

```typescript
// cats/cats.service.ts
import { Request, Response } from 'express';
import { Cat } from '../app.model';

export const readAllCat = (req: Request, res: Response) => {
  try {
    res.status(200).send({ success: true, data: { cats: Cat } });
  } catch (error: any) {
    res.status(400).send({ success: false, error: error.message });
  }
};
```

```typescript
// cats/cats.route.ts
import { Router } from 'express';
import { readAllCat } from './cats.service';

const router = Router();
router.get('/cats', readAllCat);
export default router;
```

### 왜 나누는가

1. **가독성·유지보수**: 라우터만 보면 API 목록이, 서비스만 보면 로직이 보인다.
2. **NestJS와 같은 구조**: `cats.route.ts` ≈ Controller, `cats.service.ts` ≈ Provider(Service). 파일명에 점(`.`)으로 역할을 붙이는 관례도 NestJS식이다.

## 핵심 정리

- 서버 설정(미들웨어·라우터·listen)을 하나의 `Server` 클래스로 묶어 한 번만 생성한다.
- 라우터 = 경로 매핑, 서비스 = 비즈니스 로직으로 책임을 나눈다.
- 다음 단계: NestJS의 [Controller](Backend/NestJS/controller)와 [Provider·DI](Backend/NestJS/provider-di)
