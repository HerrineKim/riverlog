---
title: "Express"
concept: "Express"
summary: "라우팅과 미들웨어, 서비스 분리, Koa, Node.js 런타임·메모리·스트림·권한."
tags: ["backend","express","nodejs"]
source: mixed
date: "2026-11-26"
---

Express 노트는 Node.js로 HTTP 서버를 직접 짜는 법을 다룬다. 라우팅과 CRUD, 미들웨어, 서비스 분리, Koa와의 차이, 런타임·메모리·스트림·권한이 여기 있다. 같은 개념이 데코레이터와 DI로 묶인 모습은 [NestJS](Backend/NestJS.md)에서 비교한다.

## 하위 노트

- [Express 라우팅과 CRUD API](Backend/Express/routing-crud.md): 서버 띄우기, Router로 경로 분리, REST CRUD
- [Express 미들웨어](Backend/Express/express-middleware.md): 로깅·파싱·에러 처리를 맡는 함수 체인
- [Express 싱글톤 패턴과 서비스 패턴](Backend/Express/singleton-service-pattern.md): 서버 클래스와 서비스 파일 분리
- [Express 프로젝트 구조: 3계층, 이벤트, DI, 로더](Backend/Express/express-project-architecture.md): 라우트·서비스·데이터 접근 계층, 이벤트 발행, 의존성 주입, 로더
- [Koa: 미들웨어만 남긴 Node.js 웹 프레임워크](Backend/Express/koa.md): 미들웨어와 ctx만 둔 코어, await next()의 양파 모델, 라우터·바디 파서 붙이기, 컨트롤러 분리
- [Node.js 런타임: 구조·이벤트 루프·운영과 OS 차이](Backend/Express/nodejs-runtime.md): Node.js의 강점, Deno·Bun, cross-env·path
- [Node.js 메모리 구조와 튜닝](Backend/Express/nodejs-memory-tuning.md): RSS와 V8 힙, --max-old-space-size·--max-heap-size, 컨테이너 한도, 포인터 압축과 4GB 케이지, OOM 진단
- [Node.js 권한 모델](Backend/Express/nodejs-permission-model.md): --permission과 --allow-* 플래그, process.permission.has, 감사 모드, 안전벨트라는 위치와 한계, Deno 비교
- [Node.js 스트림: 데이터를 조각으로 흘려 처리하기](Backend/Express/node-streams.md): Readable·Writable·Duplex·Transform, 흐름·일시정지 모드, 백프레셔와 highWaterMark, pipeline, for await
