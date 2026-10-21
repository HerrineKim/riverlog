---
title: "Express 미들웨어"
concept: "Middleware"
summary: "요청과 최종 라우트 핸들러 사이에서 로깅·파싱·에러 처리 같은 공통 작업을 수행하는 함수 체인."
tags: ["express", "nodejs", "middleware", "backend"]
source: til
date: "2026-10-13"
---

미들웨어는 요청(request)이 들어와 응답(response)이 나가기까지의 **중간 단계에서 실행되는 함수**다. 로깅, JSON 파싱, 인증 확인, 404 처리처럼 여러 라우트에 공통으로 필요한 일을 한 곳에서 처리할 수 있게 해 준다.

## 동작 방식

Express는 등록된 미들웨어와 라우트를 **위에서 아래로, 등록한 순서대로** 훑으며 요청 경로에 맞는 것을 실행한다.

- 미들웨어 시그니처: `(req, res, next) => { ... }`
- `next()`를 호출하면 다음 미들웨어/라우트로 넘어가고, 응답을 보내면(`res.send`) 체인이 끝난다.
- `next()`도 호출하지 않고 응답도 보내지 않으면 요청은 그대로 멈춘다(타임아웃).

```typescript
// 모든 요청에 대해 실행되는 로깅 미들웨어
app.use((req, res, next) => {
  console.log(req.method, req.originalUrl);
  next(); // 다음으로 넘기기
});

// 특정 경로에만 적용되는 미들웨어
app.get('/cats/som', (req, res, next) => {
  console.log('this is som middleware');
  next();
});
```

## 순서가 중요하다

```typescript
app.use(loggingMiddleware);   // 1. 모든 요청 로깅
app.use(express.json());      // 2. JSON 바디 파싱
app.use(catsRouter);          // 3. 라우터
app.use((req, res) => {       // 4. 어떤 라우트에도 걸리지 않은 요청 → 404
  res.status(404).send({ error: '404 not found error' });
});
```

- 로깅·파싱처럼 **모든 라우트보다 먼저** 실행돼야 하는 미들웨어는 위쪽에 둔다.
- **404 미들웨어는 맨 마지막**에 둔다. 앞의 어떤 라우트도 응답하지 않았을 때만 도달하기 때문이다.
- 응답을 보낸 뒤에는 `next()`를 호출하지 않는다. `res.send()` 뒤에 `next()`를 부르면 뒤의 핸들러가 응답을 또 보내려다 `Cannot set headers after they are sent` 에러가 날 수 있다.

## 에러 처리 미들웨어

인자가 4개인 미들웨어는 Express가 **에러 핸들러**로 인식한다. 라우트에서 `next(err)`를 호출하면 여기로 온다.

```typescript
app.use((err, req, res, next) => {
  res.status(500).send({ success: false, error: err.message });
});
```

> Express 5(2025년 3월 5.1부터 npm 기본 버전)에서는 `async` 핸들러·미들웨어가 예외를 던지거나 반환한 Promise가 reject되면 Express가 자동으로 `next(err)`를 호출한다. Express 4에서는 `try/catch`로 잡아 직접 `next(err)`를 불러야 했다. ([Express 에러 처리 가이드](https://expressjs.com/en/guide/error-handling.html))

## 핵심 정리

- 미들웨어 = `(req, res, next)` 함수. `app.use()`로 등록한다.
- 등록 순서대로 실행되므로 공통 처리 → 라우터 → 404 순으로 배치한다.
- NestJS의 [Middleware](Backend/NestJS/interceptor-aop)도 같은 개념을 클래스와 DI로 감싼 것이다.
- Koa는 `await next()`로 안쪽 미들웨어가 끝난 뒤 후처리까지 하는 양파 모델을 쓴다([[koa|Koa]]).

참고: [Express 미들웨어 작성 가이드](https://expressjs.com/ko/guide/writing-middleware.html)
