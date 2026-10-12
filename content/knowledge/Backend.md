---
title: "Backend"
concept: "Backend"
summary: "클라이언트의 요청을 받아 비즈니스 로직을 처리하고 데이터를 저장·제공하는 서버 쪽 개발 지식 모음."
tags: ["backend", "http", "api", "database"]
source: mixed
---

백엔드는 프론트엔드가 보낸 HTTP 요청을 받아 인증·검증·비즈니스 로직을 수행하고, 데이터베이스에 저장하거나 조회한 결과를 응답으로 돌려주는 영역이다. 이 분야의 노트는 "웹 기초(HTTP·REST) → 프레임워크(Express → NestJS, Django) → 데이터베이스 → 아키텍처" 순서로 읽으면 자연스럽다. Express에서 미들웨어·라우터·서비스 분리를 직접 손으로 짜 보고, 같은 개념이 NestJS에서 데코레이터와 DI로 어떻게 구조화되는지 비교하면 이해가 빠르다.

## 하위 주제

| 주제 | 내용 |
| --- | --- |
| [Web-Basics](/knowledge/dictionary/backend/web-basics/http-web-architecture) | 웹 앱의 요청·응답 흐름과 HTTP, REST API 설계 원칙, CORS, [API 보안 체크리스트](/knowledge/dictionary/backend/web-basics/api-security), [Base64 인코딩](/knowledge/dictionary/backend/web-basics/base64-encoding), [웹 서버·WAS와 Nginx](/knowledge/dictionary/backend/web-basics/web-server-and-nginx) |
| [Express](/knowledge/dictionary/backend/express/routing-crud) | Node.js 최소 프레임워크. 라우팅·CRUD, 미들웨어, 싱글톤·서비스 패턴, [Node.js 런타임과 cross-env·path](/knowledge/dictionary/backend/express/nodejs-runtime) |
| [NestJS](/knowledge/dictionary/backend/nestjs) | TypeScript 기반 구조화 프레임워크. Controller·Provider·Module, 요청 생명주기(미들웨어·파이프·인터셉터·필터), DTO, Repository, JWT 인증, Swagger, 파일 업로드 |
| [Django](/knowledge/dictionary/backend/django) | Python 풀스택 프레임워크. MTV, URL·템플릿, Model·ORM, 관계, Form, 인증, Admin |
| [Database](/knowledge/dictionary/backend/database/rdbms-vs-nosql) | RDBMS와 NoSQL, SQL 기초, MongoDB, [Prisma 커서 페이지네이션](/knowledge/dictionary/backend/database/prisma), [Flyway 마이그레이션](/knowledge/dictionary/backend/database/flyway) |
| [Auth](/knowledge/dictionary/backend/auth/telegram-mini-app-auth) | 텔레그램 미니앱 initData의 HMAC 서명 검증 흐름 |
| [Architecture](/knowledge/dictionary/backend/architecture/data-flow) | 3-Tier·MSA로 보는 데이터 흐름과 아키텍트의 역할, [빠르고 유지보수하기 좋은 DB 조회 패턴](/knowledge/dictionary/backend/architecture/db-fetching-patterns), [BFF](/knowledge/dictionary/backend/architecture/bff) |

배포·운영 자동화는 [DevOps](/knowledge/dictionary/devops)에서 다룬다. 이론적 배경은 [[Computer-Science/Network|네트워크]]와 [[Computer-Science/Database|데이터베이스]] 노트에 있다.
