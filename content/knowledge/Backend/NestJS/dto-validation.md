---
title: "NestJS DTO와 Validation"
concept: "DTO"
summary: "요청 바디를 DTO 클래스로 정의하고 class-validator와 ValidationPipe로 자동 검증하는 패턴, 회원가입 구현 예."
tags: ["nestjs", "validation", "typescript", "api"]
source: til
---

DTO(Data Transfer Object)는 **계층 사이에서 데이터를 주고받을 때 쓰는 객체의 형태**를 정의한 클래스다. 클라이언트가 보낸 바디를 DTO로 만들고 검증을 통과한 것만 컨트롤러 → 서비스 → DB로 흘려보낸다.

```text
Client body → [ValidationPipe: DTO 검증] → Controller → Service → DB
```

## 설치와 전역 설정

```bash
npm i class-validator class-transformer
```

```typescript
// main.ts
app.useGlobalPipes(new ValidationPipe());
```

> 실무에서 자주 쓰는 옵션: `new ValidationPipe({ whitelist: true, transform: true })`
> - `whitelist`: DTO에 정의되지 않은 필드를 자동으로 제거
> - `transform`: 바디를 실제 DTO 클래스 인스턴스로, 파라미터를 선언한 타입으로 변환

## DTO 정의

```typescript
// cats/dto/cats.request.dto.ts
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CatRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
```

인터페이스가 아니라 **클래스**로 만드는 이유: 인터페이스는 컴파일 후 사라지지만 클래스는 런타임에 남아 데코레이터 메타데이터로 검증할 수 있기 때문이다.

## 상속으로 재사용하기: `PickType`

스키마 클래스에 이미 필드와 검증이 정의되어 있다면, 필요한 필드만 골라 DTO를 만든다.

```typescript
import { PickType } from '@nestjs/swagger';
import { Cat } from '../cats.schema';

export class CatRequestDto extends PickType(Cat, ['email', 'name', 'password'] as const) {}
export class LoginRequestDto extends PickType(Cat, ['email', 'password'] as const) {}
```

- `PickType`(일부 선택), `OmitType`(일부 제외), `PartialType`(전부 선택적), `IntersectionType`(합치기)이 있다.
- `@nestjs/swagger`의 것을 쓰면 [Swagger](Backend/NestJS/swagger) 문서 메타데이터까지 상속된다. (Swagger를 쓰지 않으면 `@nestjs/mapped-types`)

## 회원가입 흐름 예시

```typescript
// cats.controller.ts
@Post()
async signUp(@Body() body: CatRequestDto) {
  return await this.catsService.signUp(body);
}
```

```typescript
// cats.service.ts
import * as bcrypt from 'bcrypt';

@Injectable()
export class CatsService {
  constructor(private readonly catsRepository: CatsRepository) {}

  async signUp(body: CatRequestDto) {
    const { email, name, password } = body;

    // 1. 중복 확인
    if (await this.catsRepository.existsByEmail(email)) {
      throw new ConflictException('이미 존재하는 고양이입니다.');
    }

    // 2. 비밀번호 해싱 (평문 저장 금지)
    const hashedPassword = await bcrypt.hash(password, 10); // 10 = salt rounds

    // 3. 저장 후 민감 정보를 뺀 데이터 반환
    const cat = await this.catsRepository.create({ email, name, password: hashedPassword });
    return cat.readOnlyData;
  }
}
```

- 비밀번호는 `bcrypt`로 **해싱**해서 저장한다(`npm i bcrypt`, `npm i -D @types/bcrypt`). 로그인 시에는 `bcrypt.compare(입력값, 해시)`로 비교한다.
- 중복 가입은 강의에서 401(`UnauthorizedException`)로 처리했지만, 의미상 **409 Conflict**나 400이 더 적절하다.
- `readOnlyData`는 [Mongoose 스키마](Backend/NestJS/mongoose-schema)의 virtual 필드다.

## 핵심 정리

- DTO = 요청/응답 데이터의 형태를 정의한 클래스, 검증은 `class-validator` 데코레이터.
- 전역 `ValidationPipe`가 핸들러 실행 전에 자동 검증하고, 실패 시 400을 돌려준다.
- `PickType` 등 매핑 타입으로 DTO 중복을 줄인다.
