---
title: "NestJS에서 Mongoose 스키마 정의"
concept: "Mongoose Schema"
summary: "@Schema·@Prop 데코레이터로 MongoDB 컬렉션 구조를 클래스로 정의하고, virtual 필드로 응답에서 민감 정보를 숨기는 방법."
tags: ["nestjs", "mongodb", "database", "typescript"]
source: til
---

Mongoose는 MongoDB 문서를 JavaScript 객체로 다루게 해 주는 **ODM(Object Document Mapper)**이다. `@nestjs/mongoose`를 쓰면 스키마를 TypeScript 클래스와 데코레이터로 정의할 수 있다.

## 스키마 정의 순서

1. 클래스를 정의하고 `@Schema(options)`를 붙인다.
2. 각 필드에 `@Prop()`으로 컬럼 조건을 정의한다.
3. `SchemaFactory.createForClass()`로 클래스를 실제 스키마로 바꾼다.

```typescript
// cats/cats.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaOptions } from 'mongoose';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

const options: SchemaOptions = {
  timestamps: true, // createdAt, updatedAt 자동 기록
};

@Schema(options)
export class Cat extends Document {
  @Prop({ required: true, unique: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  password: string;

  @Prop()
  @IsString()
  imgUrl: string;

  readonly readOnlyData: { id: string; email: string; name: string };
}

export const CatSchema = SchemaFactory.createForClass(Cat);
```

- `@Prop()`은 DB 차원의 제약(필수, 유일), `@IsEmail()` 등은 [요청 검증](Backend/NestJS/dto-validation)용이다. 스키마 클래스에 검증 데코레이터를 같이 달아 두면 DTO가 `PickType`으로 상속해 재사용할 수 있다.
- `extends Document`는 강의 당시 방식이다. 최신 문서는 클래스는 순수하게 두고 `HydratedDocument<Cat>` 타입을 따로 쓰는 방식을 권장한다.

## 모듈에 등록하고 주입받기

```typescript
// cats.module.ts
@Module({
  imports: [MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }])],
  providers: [CatsService],
})
export class CatsModule {}
```

```typescript
// cats.service.ts (또는 repository)
constructor(@InjectModel(Cat.name) private readonly catModel: Model<Cat>) {}
```

> 실수 주의: `name: 'Cat.name'`처럼 따옴표로 감싸면 문자열 `"Cat.name"`이 모델 이름이 되어 `@InjectModel(Cat.name)`(= `"Cat"`)과 맞지 않는다. 반드시 `Cat.name` 표현식을 쓴다.

## virtual 필드로 응답 필터링

회원가입 후 생성된 문서를 그대로 반환하면 **해시된 비밀번호까지 노출**된다. virtual 필드는 DB에 저장되지 않지만 문서에서 계산해 꺼낼 수 있는 필드로, 응답용 데이터만 골라낼 때 유용하다.

```typescript
CatSchema.virtual('readOnlyData').get(function (this: Cat) {
  return {
    id: this.id,
    email: this.email,
    name: this.name,
  };
});
```

```typescript
const cat = await this.catModel.create({ email, name, password: hashedPassword });
return cat.readOnlyData; // password 제외
```

조회 시점에 아예 빼고 싶다면 쿼리에서 `.select('-password')`를 쓴다.

## 핵심 정리

- `@Schema` + `@Prop` + `SchemaFactory.createForClass` = Mongoose 스키마.
- `MongooseModule.forFeature`로 등록 → `@InjectModel(Cat.name)`으로 `Model<Cat>` 주입.
- 응답에서 민감 필드는 virtual 필드나 `select('-field')`로 숨긴다.

참고: [NestJS MongoDB 문서](https://docs.nestjs.com/techniques/mongodb)
