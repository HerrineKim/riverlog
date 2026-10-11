---
title: "Repository 패턴과 레이어 분리"
concept: "Repository Pattern"
summary: "서비스와 데이터베이스 사이에 데이터 접근 전담 계층을 두어 비즈니스 로직과 DB 쿼리를 분리하는 패턴."
tags: ["nestjs", "design-pattern", "architecture", "database"]
source: til
---

기존 구조는 `Controller → Service → DB`였다. 리포지토리 패턴은 서비스와 DB 사이에 **데이터 접근만 담당하는 중개자(Repository)**를 둔다.

```text
Controller → Service (비즈니스 로직) → Repository (데이터 접근) → DB
```

필수는 아니며, 프로젝트 규모와 상황에 맞게 적용한다.

## 왜 쓰는가

1. **데이터 출처와 무관한 일관된 접근**: 서비스는 `findCatByEmail(email)` 같은 메서드만 호출한다. 그 안에서 MongoDB 쿼리를 쓰든 MySQL을 쓰든 서비스는 몰라도 된다. DB를 추가·교체해도 리포지토리만 바꾸면 된다.
2. **모듈 간 책임 분리**: A 서비스가 B 서비스의 데이터를 쓰려고 B 서비스를 주입받고, B도 A를 주입받으면 순환 참조가 생긴다. 공통 데이터 접근을 리포지토리로 빼면 다른 모듈은 **리포지토리만** 참조하면 되어 각 서비스가 자기 비즈니스 로직에만 집중할 수 있다.
3. **테스트 용이성**: 서비스 테스트 시 리포지토리를 mock으로 바꾸기 쉽다.

## 구현

```typescript
// cats/cats.repository.ts
@Injectable()
export class CatsRepository {
  constructor(@InjectModel(Cat.name) private readonly catModel: Model<Cat>) {}

  async existsByEmail(email: string): Promise<boolean> {
    // Mongoose 6+의 exists()는 boolean이 아니라 { _id } | null 을 반환한다
    const result = await this.catModel.exists({ email });
    return !!result;
  }

  async findCatByEmail(email: string): Promise<Cat | null> {
    return this.catModel.findOne({ email });
  }

  async findCatByIdWithoutPassword(id: string): Promise<Cat | null> {
    return this.catModel.findById(id).select('-password');
  }

  async create(cat: CatRequestDto): Promise<Cat> {
    return this.catModel.create(cat);
  }
}
```

```typescript
// cats.module.ts — 프로바이더로 등록하고, 다른 모듈(Auth)에서도 쓰도록 export
@Module({
  imports: [MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }])],
  controllers: [CatsController],
  providers: [CatsService, CatsRepository],
  exports: [CatsService, CatsRepository],
})
export class CatsModule {}
```

```typescript
// cats.service.ts — Model 대신 Repository를 주입
@Injectable()
export class CatsService {
  constructor(private readonly catsRepository: CatsRepository) {}
}
```

이렇게 해 두면 `AuthService`도 `CatsService`가 아니라 `CatsRepository`만 주입받아 로그인 검증에 필요한 조회를 할 수 있다. ([JWT 인증](Backend/NestJS/auth-jwt-passport))

## 핵심 정리

- Service = "무엇을 할지"(비즈니스 규칙), Repository = "어떻게 가져올지"(쿼리).
- 리포지토리도 `@Injectable()` 프로바이더이므로 모듈에 등록·export해 주입받는다.
- TypeORM·Prisma 같은 ORM도 같은 개념의 Repository를 제공한다.
