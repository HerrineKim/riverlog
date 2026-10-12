---
title: "NestJS Exception Filter와 Pipe"
concept: "Exception Filter"
summary: "예외를 일관된 응답 형식으로 바꾸는 Exception Filter와, 들어오는 값을 변환·검증하는 Pipe."
tags: ["nestjs", "error-handling", "validation", "backend"]
source: til
---

요청 생명주기의 양 끝을 담당하는 두 장치다. **Pipe**는 컨트롤러에 들어가기 직전 데이터를 변환·검증하고, **Exception Filter**는 처리 중 던져진 예외를 잡아 클라이언트에게 보낼 응답 형태로 바꾼다.

## Exception Filter

### 기본 예외

컨트롤러나 서비스에서 `HttpException`(또는 그 하위 클래스)을 던지면 Nest가 상태 코드와 메시지로 응답을 만든다.

```typescript
throw new HttpException('api is broken', 401);
throw new HttpException({ success: false, message: 'api is broken' }, 401);
throw new UnauthorizedException('로그인이 필요합니다.'); // 401 내장 예외
```

`BadRequestException`(400), `UnauthorizedException`(401), `ForbiddenException`(403), `NotFoundException`(404), `ConflictException`(409) 같은 내장 예외 클래스를 쓰면 상태 코드를 외울 필요가 없다.

### 커스텀 필터로 응답 형식 통일하기

매번 응답 형식을 맞추는 대신, 모든 `HttpException`을 한곳에서 가공한다.

```typescript
// common/exceptions/http-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const error = exception.getResponse() as
      | string
      | { error: string; statusCode: number; message: string | string[] };

    // 직접 던진 문자열 에러 vs Nest 내장 에러(ValidationPipe 등)의 객체 형태를 분기
    if (typeof error === 'string') {
      response.status(status).json({
        success: false,
        timestamp: new Date().toISOString(),
        path: request.url,
        error,
      });
    } else {
      response.status(status).json({
        success: false,
        timestamp: new Date().toISOString(),
        ...error,
      });
    }
  }
}
```

### 적용 범위

```typescript
// 1) 메서드 단위
@Get()
@UseFilters(HttpExceptionFilter)
getAllCat() {}

// 2) 컨트롤러 단위
@Controller('cats')
@UseFilters(HttpExceptionFilter)
export class CatsController {}

// 3) 전역 (main.ts)
app.useGlobalFilters(new HttpExceptionFilter());
```

예외가 나면 라우트 → 컨트롤러 → 전역 필터 순으로 가장 가까운 필터가 처리한다.

## Pipe

파이프는 **클라이언트 요청 데이터를 변환(transformation)하거나 검증(validation)해서** 핸들러가 원하는 형태의 값을 받게 해 준다. 이름은 "앞 단계의 출력이 다음 단계의 입력이 되는" Pipes and Filters 패턴에서 왔다.

### 변환 + 검증: `ParseIntPipe`

URL 파라미터는 항상 문자열로 들어온다.

```typescript
@Get(':id')
getOneCat(@Param('id', ParseIntPipe) id: number) {
  console.log(typeof id); // number
}
```

- `/cats/12` → `id === 12` (숫자로 변환)
- `/cats/abc` → 핸들러 실행 전에 400 에러: *Validation failed (numeric string is expected)*

여러 파이프를 나열하면 순서대로 실행된다: `@Param('id', ParseIntPipe, PositiveIntPipe)`. 이 밖에 `ParseBoolPipe`, `ParseUUIDPipe`, `DefaultValuePipe` 등이 내장되어 있다.

### 바디 검증: `ValidationPipe`

DTO 클래스에 붙인 `class-validator` 데코레이터로 바디 전체를 검증한다. 보통 전역으로 건다. 자세한 내용은 [DTO와 Validation](Backend/NestJS/dto-validation).

```typescript
app.useGlobalPipes(new ValidationPipe());
```

## 핵심 정리

- 예외는 `HttpException` 계열로 던지고, 응답 형식은 `@Catch` 필터 하나로 통일한다.
- 파이프는 핸들러 직전에 값 변환·검증을 담당하며, 실패하면 핸들러가 아예 실행되지 않는다.
