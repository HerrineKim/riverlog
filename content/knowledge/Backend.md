---
title: "Backend"
concept: "Backend"
summary: "클라이언트의 요청을 받아 비즈니스 로직을 처리하고 데이터를 저장·제공하는 서버 쪽 개발 지식 모음."
tags: ["backend", "http", "api", "database"]
source: mixed
date: "2026-10-14"
---

백엔드는 프론트엔드가 보낸 HTTP 요청을 받아 인증·검증·비즈니스 로직을 수행하고, 데이터베이스에 저장하거나 조회한 결과를 응답으로 돌려주는 영역이다. 이 분야의 노트는 "웹 기초(HTTP·REST) → 프레임워크(Express → NestJS, Django) → 데이터베이스 → 아키텍처" 순서로 읽으면 자연스럽다. Express에서 미들웨어·라우터·서비스 분리를 직접 손으로 짜 보고, 같은 개념이 NestJS에서 데코레이터와 DI로 어떻게 구조화되는지 비교하면 이해가 빠르다.

## 하위 주제

먼저 전체 지도를 보려면 [백엔드 개발자가 알아야 할 것](Backend/backend-developer-roadmap.md): 인터넷·HTTP·DB·API 스타일·배포·보안까지 영역별 핵심 질문과 관련 노트.

| 주제 | 내용 |
| --- | --- |
| [Web-Basics](/knowledge/dictionary/backend/web-basics/http-web-architecture) | 웹 앱의 요청·응답 구조와 포트, [REST API 설계 원칙](/knowledge/dictionary/backend/web-basics/rest-api), [CORS](/knowledge/dictionary/backend/web-basics/cors), [API 보안 체크리스트](/knowledge/dictionary/backend/web-basics/api-security), [Base64 인코딩](/knowledge/dictionary/backend/web-basics/base64-encoding), [웹 서버·WAS와 Nginx](/knowledge/dictionary/backend/web-basics/web-server-and-nginx), [텔레그램 미니앱 initData 검증](/knowledge/dictionary/backend/web-basics/telegram-mini-app-auth), [세션 기반 인증과 토큰 기반 인증](/knowledge/dictionary/backend/web-basics/session-vs-token-auth), [스프링의 싱글톤 빈과 요청 스레드](/knowledge/dictionary/backend/web-basics/spring-singleton-thread-safety) |
| [Express](/knowledge/dictionary/backend/express/routing-crud) | Node.js 최소 프레임워크. 라우팅·CRUD, [미들웨어](/knowledge/dictionary/backend/express/express-middleware), [싱글톤·서비스 패턴](/knowledge/dictionary/backend/express/singleton-service-pattern), [Node.js 런타임과 cross-env·path](/knowledge/dictionary/backend/express/nodejs-runtime) |
| [NestJS](Backend/NestJS.md) | TypeScript 기반 구조화 프레임워크. Controller·Provider·Module, 요청 생명주기(미들웨어·파이프·인터셉터·필터), DTO, Repository, JWT 인증, Swagger, 파일 업로드 |
| [Django](Backend/Django.md) | Python 풀스택 프레임워크. MTV, URL·템플릿, Model·ORM, 관계, Form, 인증, Admin |
| [Database](/knowledge/dictionary/backend/database/sql-basics) | SQL 기초, [MongoDB](/knowledge/dictionary/backend/database/mongodb), [Prisma 커서 페이지네이션과 CLI](/knowledge/dictionary/backend/database/prisma), [Flyway 마이그레이션](/knowledge/dictionary/backend/database/flyway), [검색엔진의 원리: 역인덱스와 랭킹](/knowledge/dictionary/backend/database/search-engine-basics). RDB와 NoSQL 중 무엇을 고를지는 [데이터베이스 모델](/knowledge/dictionary/computer-science/database/database-models) |
| [Architecture](/knowledge/dictionary/backend/architecture/data-flow) | 3-Tier·MSA로 보는 데이터 흐름과 아키텍트의 역할, [빠르고 유지보수하기 좋은 DB 조회 패턴](/knowledge/dictionary/backend/architecture/db-fetching-patterns), [BFF](/knowledge/dictionary/backend/architecture/bff) |

배포·운영 자동화는 [DevOps](/knowledge/dictionary/devops)에서 다룬다. 이론적 배경은 [[Computer-Science/Network|네트워크]]와 [[Computer-Science/Database|데이터베이스]] 노트에 있다.
