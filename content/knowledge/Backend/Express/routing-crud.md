---
title: "Express 라우팅과 CRUD API"
concept: "Express Routing"
summary: "Express로 서버를 띄우고 Router로 경로를 분리해 REST 방식의 CRUD API를 만드는 방법."
tags: ["express", "nodejs", "api", "rest", "typescript"]
source: til
---

Express는 Node.js에서 가장 널리 쓰이는 최소한의 웹 프레임워크다. NestJS도 기본적으로 Express 위에서 동작하므로, Express로 라우팅·CRUD를 직접 만들어 보면 NestJS가 무엇을 대신 해 주는지 분명해진다.

## 개발 환경과 Hello World

```bash
npm i express
npm i -D @types/express typescript
```

- `-D`(devDependencies)로 설치한 패키지는 개발·빌드 때만 필요하고 운영 의존성에는 포함되지 않는다. 타입 정의(`@types/*`)가 대표적이다.
- `npm run start:dev` 같은 스크립트에 `tsc --watch`나 `tsx watch`를 걸어 두면 코드가 바뀔 때마다 자동으로 다시 컴파일·실행된다. `npm run start`는 `prestart`에서 `tsconfig.json` 기준으로 `dist/`에 빌드한 뒤 `node dist/app.js`를 실행하는 식으로 구성한다.

```typescript
// app.ts
import express from 'express';

const app = express();          // app: 서버 역할을 하는 express 인스턴스
const port = 8000;

// GET / 요청이 들어왔을 때의 동작을 정의하는 라우트
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// 서버 실행
app.listen(port, () => console.log(`listening on http://localhost:${port}`));
```

API는 Postman 같은 HTTP 클라이언트로 GET/POST 요청을 보내 테스트한다.

## Router로 라우트 분리하기

`app.ts` 한 파일에 모든 경로를 쓰면 금방 복잡해진다. 도메인별로 `Router` 인스턴스를 만들어 분리하고 `app.use()`로 연결한다.

```text
src/
├── app.ts
├── app.model.ts        # 목업 데이터와 타입
└── cats/
    ├── cats.route.ts   # 라우팅
    └── cats.service.ts # 비즈니스 로직 (→ 서비스 패턴)
```

```typescript
// app.model.ts
export type CatType = {
  id: string;
  name: string;
  age: number;
  species: string;
  isCute: boolean;
  friends: string[];
};

export const Cat: CatType[] = [
  { id: 'fsduifh', name: 'blue', age: 8, species: 'Russian Blue', isCute: true, friends: [] },
  { id: 'iohf2309q4hr', name: 'som', age: 4, species: 'Sphynx cat', isCute: true, friends: [] },
];
```

```typescript
// app.ts
import express from 'express';
import catsRouter from './cats/cats.route';

const app = express();
app.use(express.json()); // JSON 바디 파싱 (없으면 req.body가 undefined)
app.use(catsRouter);
app.listen(8000);
```

## CRUD 구현

응답은 `{ success, data }` / `{ success, error }` 형태로 통일하고, 성공·실패에 맞는 상태 코드를 `res.status()`로 지정한다.

```typescript
// cats/cats.route.ts
import { Router } from 'express';
import { Cat } from '../app.model';

const router = Router();

// READ 전체 조회
router.get('/cats', (req, res) => {
  res.status(200).send({ success: true, data: { cats: Cat } });
});

// READ 특정 고양이 조회 (동적 라우팅: req.params)
router.get('/cats/:id', (req, res) => {
  const cat = Cat.find((c) => c.id === req.params.id);
  if (!cat) return res.status(404).send({ success: false, error: 'not found' });
  res.status(200).send({ success: true, data: { cat } });
});

// CREATE
router.post('/cats', (req, res) => {
  Cat.push(req.body);
  res.status(201).send({ success: true, data: req.body });
});

// UPDATE 전체 교체 (PUT)
router.put('/cats/:id', (req, res) => {
  const index = Cat.findIndex((c) => c.id === req.params.id);
  if (index === -1) return res.status(404).send({ success: false, error: 'not found' });
  Cat[index] = req.body;
  res.status(200).send({ success: true, data: { cat: Cat[index] } });
});

// UPDATE 부분 수정 (PATCH)
router.patch('/cats/:id', (req, res) => {
  const index = Cat.findIndex((c) => c.id === req.params.id);
  if (index === -1) return res.status(404).send({ success: false, error: 'not found' });
  Cat[index] = { ...Cat[index], ...req.body }; // 기존 값 위에 바뀐 필드만 덮어쓰기
  res.status(200).send({ success: true, data: { cat: Cat[index] } });
});

// DELETE
router.delete('/cats/:id', (req, res) => {
  const index = Cat.findIndex((c) => c.id === req.params.id);
  if (index === -1) return res.status(404).send({ success: false, error: 'not found' });
  Cat.splice(index, 1);
  res.status(200).send({ success: true });
});

export default router;
```

> 고친 점: 원래 실습 코드는 `forEach((cat) => { cat = body })`로 수정했는데, 이는 **콜백의 지역 변수만 바꿀 뿐 배열 원소는 바뀌지 않는다.** DELETE도 `filter()`로 새 배열을 만들기만 하고 원본에 반영하지 않았다. 위처럼 `findIndex`로 위치를 찾아 직접 대입·`splice`해야 실제로 반영된다. (DB를 붙이면 이 부분은 쿼리로 대체된다.)

## 핵심 정리

- `app.get/post/put/patch/delete(path, handler)`로 메서드별 라우트를 정의한다.
- `Router()`로 도메인별 라우트를 분리하고 `app.use(router)`로 연결한다.
- POST/PUT/PATCH 바디를 읽으려면 `express.json()` 미들웨어가 먼저 등록되어 있어야 한다.
- 이어서 볼 노트: [미들웨어](Backend/Express/express-middleware), [싱글톤·서비스 패턴](Backend/Express/singleton-service-pattern)

관련 노트: [[rest-api|REST API 설계]], [[http-web-architecture|웹 앱 아키텍처와 HTTP]]
