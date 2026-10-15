---
title: "NestJS 설정과 환경 변수"
concept: "Environment Variables"
summary: "@nestjs/config로 .env를 읽어 DB 주소·포트·비밀키를 코드 밖으로 분리하고, 다른 모듈 설정은 forRootAsync와 ConfigService로 읽는 방법."
tags: ["nestjs", "config", "security", "mongodb"]
source: til
date: "2026-10-13"
---

DB 접속 주소, JWT 비밀키, 포트처럼 **환경마다 다르거나 노출되면 안 되는 값**은 코드에 직접 쓰지 않고 환경 변수로 분리한다. 실수로 비밀번호가 포함된 접속 문자열을 커밋하는 사고를 막는 가장 기본적인 방법이다.

## `.env`와 ConfigModule

```bash
npm i @nestjs/config
```

```bash
# .env (반드시 .gitignore에 추가)
MODE=dev
PORT=8000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster-host>/<db>?retryWrites=true&w=majority
JWT_SECRET=<임의의 긴 문자열>
SWAGGER_USER=<id>
SWAGGER_PASSWORD=<password>
```

```typescript
// app.module.ts
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // .env를 읽어 process.env에 로드
    MongooseModule.forRoot(process.env.MONGODB_URI),
    CatsModule,
  ],
})
export class AppModule {}
```

```typescript
// main.ts
const PORT = process.env.PORT || 8000;
await app.listen(PORT);
```

- `isGlobal: true`를 주면 모든 모듈에서 따로 import하지 않고 `ConfigService`를 주입받을 수 있다.
- **로드 순서 주의**: 데코레이터 안의 `process.env.X`는 모듈 파일이 import되는 시점에 평가된다. `ConfigModule.forRoot()`가 아직 실행되지 않았다면 `undefined`가 된다. 모듈마다 `ConfigModule.forRoot()`를 다시 부르는 임시방편도 있지만, 권장 방식은 `forRootAsync`/`registerAsync`로 `ConfigService`를 주입받는 것이다.

```typescript
// 권장: 설정이 로드된 뒤에 값을 읽도록 비동기 등록
MongooseModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    uri: config.get<string>('MONGODB_URI'),
  }),
}),
```

MongoDB 연결 준비(패키지 설치, Atlas 접속 문자열, 디버그 로그)는 [[mongoose-schema#연결과 디버그 로그|Mongoose 스키마]] 노트에 있다.

## 핵심 정리

- 비밀 값은 `.env`에 두고 `.gitignore`로 커밋을 막는다.
- `ConfigModule.forRoot({ isGlobal: true })`로 한 번만 로드하고, 다른 모듈 설정은 `*Async` + `ConfigService`로 읽는 것이 안전하다.
