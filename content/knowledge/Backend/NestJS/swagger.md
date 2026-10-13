---
title: "Swagger로 API 문서화"
concept: "Swagger"
summary: "@nestjs/swagger로 코드의 데코레이터에서 OpenAPI 문서를 자동 생성하고, 운영 환경에서는 Basic Auth로 문서 접근을 막는 방법."
tags: ["nestjs", "api", "documentation", "openapi"]
source: til
date: "2026-10-13"
---

프론트엔드와 협업할 때 "어떤 API가 있고, 무엇을 보내면 무엇이 오는지"를 문서로 공유해야 한다. Swagger(OpenAPI)는 코드에 붙인 데코레이터로 이 문서를 자동 생성하고, 브라우저에서 바로 요청을 테스트할 수 있는 UI까지 제공한다.

설치는 `npm i @nestjs/swagger`다. `DocumentBuilder`, `@ApiProperty` 같은 아래 API는 초기 버전부터 거의 그대로다.

## 설정

```typescript
// main.ts
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('NestJS Cats API')
  .setDescription('The cats API description')
  .setVersion('1.0.0')
  .addBearerAuth() // JWT 인증이 필요한 API를 문서에서 테스트할 수 있게
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('docs', app, document); // http://localhost:8000/docs
```

## 엔드포인트 설명

```typescript
@ApiTags('cats')
@Controller('cats')
export class CatsController {
  @ApiOperation({ summary: '고양이 회원가입' })
  @ApiResponse({ status: 201, description: '성공', type: ReadOnlyCatDto })
  @ApiResponse({ status: 500, description: '서버 에러' })
  @Post()
  async signUp(@Body() body: CatRequestDto) {
    return this.catsService.signUp(body);
  }
}
```

> 응답 DTO(`type`)는 그 DTO가 실제로 반환되는 상태 코드(보통 성공 응답 200/201)에 붙인다. 에러 응답에 붙이면 문서의 스키마가 실제 응답과 어긋난다.

## 요청·응답 스키마

DTO 필드에 `@ApiProperty`를 붙이면 문서에 예시와 설명이 표시된다.

```typescript
export class ReadOnlyCatDto extends PickType(Cat, ['email', 'name'] as const) {
  @ApiProperty({ example: '64f1c2...', description: 'id', required: true })
  id: string;
}
```

```typescript
// cats.schema.ts — 스키마 필드에 붙여 두면 PickType으로 만든 DTO가 그대로 상속
@ApiProperty({ example: 'cat@example.com', description: 'email', required: true })
@Prop({ required: true, unique: true })
@IsEmail()
email: string;
```

`PickType`·`OmitType`을 `@nestjs/swagger`에서 import해야 `@ApiProperty` 메타데이터도 함께 상속된다. ([DTO와 Validation](Backend/NestJS/dto-validation))

> 참고: `nest-cli.json`에 `"plugins": ["@nestjs/swagger"]`를 추가하면 CLI 플러그인이 DTO 속성을 읽어 `@ApiProperty`를 상당 부분 자동으로 붙여 준다.

## 문서 접근 보호

API 문서가 공개되어 있으면 공격자에게 지도를 건네는 셈이다. `express-basic-auth`로 문서 경로에 Basic 인증을 건다.

```bash
npm i express-basic-auth
```

```typescript
import expressBasicAuth from 'express-basic-auth';

app.use(
  ['/docs', '/docs-json'],
  expressBasicAuth({
    challenge: true,
    users: { [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD },
  }),
);
```

계정 정보는 [환경 변수](Backend/NestJS/config-env)로 관리한다.

## Fastify 참고

Fastify는 Express와 비슷한 Node.js 웹 프레임워크로 구조·속도 면에서 더 우수하다고 평가된다. NestJS는 기본적으로 Express 어댑터로 동작하지만 `@nestjs/platform-fastify`로 교체할 수 있다. 먼저 Express로 개발하고 성능이 중요한 경우 Fastify로 전환을 검토하는 것이 일반적이다. (단, `express-basic-auth`처럼 Express 전용 미들웨어는 대체가 필요하다.)

## 핵심 정리

- `DocumentBuilder` + `SwaggerModule.setup('docs', ...)`으로 문서 UI를 띄운다.
- `@ApiOperation`, `@ApiResponse`, `@ApiProperty`로 설명·스키마를 채운다.
- 운영 환경의 문서 경로는 인증으로 보호한다.

참고: [NestJS OpenAPI 문서](https://docs.nestjs.com/openapi/introduction)
