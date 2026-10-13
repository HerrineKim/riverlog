---
title: "NestJS 프로젝트 구조와 실행 흐름"
concept: "Nest Project"
summary: "Nest CLI로 만든 프로젝트의 파일 구성과 main.ts에서 컨트롤러·서비스까지 요청이 흘러가는 기본 흐름."
tags: ["nestjs", "typescript", "nodejs", "backend"]
source: til
date: "2026-10-13"
---

Nest CLI로 프로젝트를 만들면 Module·Controller·Service가 하나씩 들어 있는 최소 구조가 생긴다. 이 네 파일의 관계만 이해하면 이후 모든 기능은 "같은 패턴의 반복"이다.

## 프로젝트 생성과 실행

```bash
npm i -g @nestjs/cli
nest new project-name
```

```bash
npm run start        # 일반 실행
npm run start:dev    # watch 모드 (코드 변경 시 자동 재시작)
npm run start:prod   # 빌드 결과(dist/main.js) 실행
npm run test         # 단위 테스트 (CommonJS 템플릿은 Jest, NestJS 12의 ESM 템플릿은 Vitest)
npm run test:e2e     # e2e 테스트
npm run test:cov     # 커버리지
```

## `src/` 기본 구조

| 파일 | 역할 | Express에 대응하면 |
| --- | --- | --- |
| `main.ts` | 앱 생성·전역 설정·서버 실행(`bootstrap`) | `app.ts`의 `listen` 부분 |
| `app.module.ts` | 루트 모듈. 컨트롤러·프로바이더를 등록 | — |
| `app.controller.ts` | 라우트를 정의하는 컨트롤러 | `cats.route.ts` |
| `app.service.ts` | 비즈니스 로직 | `cats.service.ts` |

## 요청이 처리되는 흐름

```typescript
// 1. main.ts — bootstrap()으로 앱 실행
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(8000);
}
bootstrap();
```

```typescript
// 2. app.module.ts — 어떤 컨트롤러/프로바이더가 있는지 등록
@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

```typescript
// 3. app.controller.ts — GET / 요청을 받아 서비스에 위임
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

```typescript
// 4. app.service.ts — 실제 로직
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
```

## 주요 의존성

- `reflect-metadata`: 데코레이터가 붙인 메타데이터(타입 정보 등)를 런타임에 읽기 위한 패키지. DI가 이것으로 동작한다.
- `rxjs`: 비동기·이벤트 스트림 라이브러리. [Interceptor](Backend/NestJS/interceptor-aop)에서 `Observable`로 응답을 가공할 때 쓴다.
- `rimraf`: `rm -rf`를 OS에 상관없이 쓰게 해 주는 도구(빌드 전 `dist` 삭제용). 최신 템플릿에서는 빠지기도 한다.

## 코드 스타일 설정

CLI 템플릿에는 린터와 Prettier 설정이 기본 포함되어 있다. NestJS 12의 새 ESM 프로젝트는 **oxlint**를, CommonJS 템플릿은 **ESLint**(flat config, `eslint.config.mjs`)를 쓴다. 필요에 따라 규칙을 조정한다. ([NestJS 마이그레이션 가이드](https://docs.nestjs.com/migration-guide))

```javascript
// eslint.config.mjs 의 rules 예시
{
  rules: {
    'no-console': 'warn', // 운영 코드에 console.log가 남지 않도록 경고
    '@typescript-eslint/no-explicit-any': 'off',
  },
}
```

과거(ESLint 8 이전)에는 `.eslintrc.js`에 같은 규칙을 적었다.

## 핵심 정리

- `main.ts`(실행) → `AppModule`(등록) → `Controller`(라우팅) → `Service`(로직) 순으로 흐른다.
- 새 기능은 `nest g module/controller/service 이름`으로 같은 구조를 반복해 만든다.
