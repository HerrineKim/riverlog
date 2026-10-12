---
title: "NestJS"
concept: "NestJS"
summary: "Express·Fastify 위에 모듈·DI·데코레이터 기반 아키텍처를 얹은 TypeScript Node.js 서버 프레임워크."
tags: ["nestjs", "nodejs", "typescript", "backend"]
source: til
---

NestJS는 TypeScript를 기본으로 지원하는 Node.js 서버 애플리케이션 프레임워크다. 내부적으로는 Express(기본) 또는 Fastify를 HTTP 엔진으로 쓰면서, 그 위에 **Module · Controller · Provider(DI)** 라는 구조와 데코레이터 문법을 제공해 확장 가능하고 유지보수하기 쉬운 서버를 만들게 돕는다. Spring처럼 객체지향·DI 중심이라 Java 개발자에게 익숙하고, Express 개념(미들웨어·라우터·서비스 분리)을 알면 금방 적응할 수 있다.

> 이 주제의 노트는 인프런 "탄탄한 백엔드 NestJS, 기초부터 심화까지" 강의(NestJS 7 시절, 현재 **deprecated** 처리됨) 필기를 바탕으로 재구성했다. 핵심 개념과 API는 최신 버전에서도 거의 그대로지만, 바뀐 부분은 각 노트에 "최신 버전에서는 …"으로 보충해 두었다.
>
> 2026년 10월 기준 최신은 **NestJS 12**(2026년 8월 출시)다. 코어 패키지가 ESM으로 배포되고 Node.js 20.19+ 또는 22.12+가 필요하지만, 기존 CommonJS 앱도 Node의 `require(esm)` 덕분에 대부분 그대로 동작한다. ([마이그레이션 가이드](https://docs.nestjs.com/migration-guide))

## 요청 생명주기 한눈에 보기

요청이 컨트롤러에 도달하기 전후로 여러 "끼어들 수 있는 지점"이 있다. 각 노트는 이 순서 중 한 단계를 다룬다.

```text
Request
 → Middleware (전역 → 모듈)
 → Guard (전역 → 컨트롤러 → 라우트)            ← 인증·인가
 → Interceptor before (전역 → 컨트롤러 → 라우트)
 → Pipe (전역 → 컨트롤러 → 라우트 → 파라미터)   ← 변환·검증
 → Controller handler → Service
 → Interceptor after (라우트 → 컨트롤러 → 전역)
 → Exception Filter (라우트 → 컨트롤러 → 전역, 예외가 났을 때)
Response
```

## 노트 목록

| 구분 | 노트 |
| --- | --- |
| 기본 구조 | [프로젝트 구조](Backend/NestJS/project-structure), [Controller](Backend/NestJS/controller), [Provider와 DI](Backend/NestJS/provider-di), [Module과 캡슐화](Backend/NestJS/module) |
| 요청 파이프라인 | [Middleware](Backend/NestJS/nestjs-middleware), [Exception Filter와 Pipe](Backend/NestJS/exception-filter-pipe), [Interceptor와 AOP](Backend/NestJS/interceptor-aop) |
| 데이터 계층 | [설정과 환경 변수](Backend/NestJS/config-env), [Mongoose 스키마](Backend/NestJS/mongoose-schema), [DTO와 Validation](Backend/NestJS/dto-validation), [Repository 패턴](Backend/NestJS/repository-pattern) |
| 기능 구현 | [JWT·Passport 인증](Backend/NestJS/auth-jwt-passport), [Swagger 문서화](Backend/NestJS/swagger), [파일 업로드(Multer)](Backend/NestJS/file-upload-multer) |

먼저 [Express](Backend/Express/routing-crud) 노트로 미들웨어·라우터·서비스 분리를 익혀 두면 비교하며 읽기 좋다.
