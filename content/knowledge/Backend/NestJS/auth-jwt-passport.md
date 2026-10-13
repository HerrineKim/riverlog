---
title: "NestJS JWT 인증과 Passport"
concept: "JWT Authentication"
summary: "로그인 시 JWT를 발급하고, Passport Strategy와 Guard로 요청마다 토큰을 검증해 현재 사용자를 꺼내는 NestJS 인증 구현."
tags: ["nestjs", "auth", "jwt", "security"]
source: til
date: "2026-10-13"
---

로그인 상태를 유지하는 방법에는 세션·쿠키, 단순 토큰, JWT 등이 있다. JWT는 서버가 세션 저장소를 두지 않아도 되어(stateless) 모바일 앱이나 여러 서비스가 토큰을 나눠 쓰는 API에 잘 맞는다. 반대로 같은 도메인의 웹 앱만 상대한다면 즉시 로그아웃·강제 만료가 쉬운 서버 세션 + HttpOnly 쿠키가 더 단순하다([[cookie-session|쿠키와 세션]]).

NestJS 공식 문서는 `JwtService`와 직접 만든 Guard로 구현하는 방법과, 아래처럼 Passport 전략으로 구현하는 방법을 모두 안내한다. 소셜 로그인처럼 전략을 여러 개 붙일 때 Passport가 편하다.

## JWT 구조

JWT(JSON Web Token)는 점(`.`)으로 구분된 세 부분으로 이뤄진다: `header.payload.signature`

| 부분 | 내용 |
| --- | --- |
| Header | 토큰 타입(`JWT`)과 서명 알고리즘(`HS256` 등)을 Base64URL 인코딩 |
| Payload | 사용자 식별자 등 클레임(key-value)을 Base64URL 인코딩. `sub`(대상 = 유저 고유 ID), `exp`(만료 시각), `iat`(발급 시각) |
| Signature | Header + Payload를 **서버의 비밀키로 서명**한 값. 위·변조 검증용 |

> Payload는 암호화가 아니라 **인코딩**일 뿐이라 누구나 디코딩해 읽을 수 있다([jwt.io](https://jwt.io/)). 비밀번호 같은 민감 정보는 절대 넣지 않는다.

## 로그인과 인증 흐름

![JWT 로그인 과정](/images/til/BACKEND/Nestjs/-Deprecated-%ED%83%84%ED%83%84%ED%95%9C-%EB%B0%B1%EC%97%94%EB%93%9C-NestJS-%EA%B8%B0%EC%B4%88%EB%B6%80%ED%84%B0-%EC%8B%AC%ED%99%94%EA%B9%8C%EC%A7%80/05-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-1-%EA%B3%A0%EC%96%91%EC%9D%B4-%EC%A0%95%EB%B3%B4-%EC%BB%A4%EB%AE%A4%EB%8B%88%ED%8B%B0/07-JWT%EC%99%80-%EB%A1%9C%EA%B7%B8%EC%9D%B8-%EC%84%9C%EB%B9%84%EC%8A%A4-%EC%88%9C%ED%99%98-%EC%B0%B8%EC%A1%B0-%EB%AA%A8%EB%93%88.assets/image-20230102175556698.png)

1. 프론트엔드가 email·password로 로그인 API를 호출한다.
2. 백엔드는 사용자를 확인하고 비밀번호를 검증한 뒤, `{ email, sub: userId }` payload를 **비밀키로 서명해 JWT를 발급**한다.
3. 프론트엔드는 토큰을 저장한다(localStorage 또는 HttpOnly 쿠키. XSS 위험을 고려하면 HttpOnly 쿠키가 더 안전하다).

![JWT 인증 과정](/images/til/BACKEND/Nestjs/-Deprecated-%ED%83%84%ED%83%84%ED%95%9C-%EB%B0%B1%EC%97%94%EB%93%9C-NestJS-%EA%B8%B0%EC%B4%88%EB%B6%80%ED%84%B0-%EC%8B%AC%ED%99%94%EA%B9%8C%EC%A7%80/05-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-1-%EA%B3%A0%EC%96%91%EC%9D%B4-%EC%A0%95%EB%B3%B4-%EC%BB%A4%EB%AE%A4%EB%8B%88%ED%8B%B0/07-JWT%EC%99%80-%EB%A1%9C%EA%B7%B8%EC%9D%B8-%EC%84%9C%EB%B9%84%EC%8A%A4-%EC%88%9C%ED%99%98-%EC%B0%B8%EC%A1%B0-%EB%AA%A8%EB%93%88.assets/image-20230103101803020.png)

4. 이후 요청마다 `Authorization: Bearer <token>` 헤더에 토큰을 실어 보낸다.
5. 백엔드의 **JwtAuthGuard**가 **JwtStrategy**를 실행해 서명·만료를 검증하고, payload의 `sub`로 사용자를 찾아 `request.user`에 넣는다.
6. 핸들러는 `request.user`를 이용해 비즈니스 로직을 수행한다.

Guard는 요청 생명주기에서 미들웨어 다음, 인터셉터·파이프보다 먼저 실행되어 "이 요청을 통과시킬지"를 결정한다.

## 구현

```bash
npm i @nestjs/passport passport @nestjs/jwt passport-jwt
npm i -D @types/passport-jwt
nest g module auth
nest g service auth
```

### AuthModule

```typescript
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1y' },
    }),
    forwardRef(() => CatsModule), // CatsRepository 사용 (순환 import → forwardRef)
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

> 비밀키는 반드시 [환경 변수](Backend/NestJS/config-env)로 관리한다. `process.env` 로드 순서 문제를 피하려면 `JwtModule.registerAsync({ inject: [ConfigService], useFactory: ... })`를 쓰는 것이 안전하다. 위의 만료 기간 1년은 예시일 뿐이다. JWT는 발급 뒤 서버가 강제로 무효화하기 어려우므로, 실제로는 수 분~수십 분짜리 Access Token과 교체(rotation)되는 Refresh Token을 함께 쓴다.

### 로그인 서비스: 토큰 발급

```typescript
@Injectable()
export class AuthService {
  constructor(
    private readonly catsRepository: CatsRepository,
    private readonly jwtService: JwtService, // JwtModule이 제공
  ) {}

  async jwtLogIn({ email, password }: LoginRequestDto) {
    const cat = await this.catsRepository.findCatByEmail(email);
    // 이메일이 없든 비밀번호가 틀리든 같은 메시지 → 계정 존재 여부를 노출하지 않음
    if (!cat || !(await bcrypt.compare(password, cat.password))) {
      throw new UnauthorizedException('이메일과 비밀번호를 확인해주세요.');
    }
    const payload = { email: cat.email, sub: cat.id };
    return { token: this.jwtService.sign(payload) };
  }
}
```

### Strategy와 Guard: 토큰 검증

```typescript
// auth/jwt/jwt.strategy.ts
export type Payload = { email: string; sub: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly catsRepository: CatsRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Bearer 토큰 추출
      ignoreExpiration: false,                                  // 만료된 토큰 거부
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  // 서명 검증이 끝난 payload를 받아 사용자 조회. 반환값이 request.user가 된다
  async validate(payload: Payload) {
    const cat = await this.catsRepository.findCatByIdWithoutPassword(payload.sub);
    if (!cat) throw new UnauthorizedException('접근 오류');
    return cat;
  }
}
```

```typescript
// auth/jwt/jwt.guard.ts — AuthGuard('jwt')가 위 Strategy를 자동 실행
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

## Custom Decorator로 현재 사용자 꺼내기

핸들러에서 `@Req() req`로 `req.user`를 꺼내는 대신, 의도가 드러나는 파라미터 데코레이터를 만든다.

```typescript
// common/decorators/user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user,
);
```

```typescript
@Post('login')
logIn(@Body() data: LoginRequestDto) {
  return this.authService.jwtLogIn(data);
}

@UseGuards(JwtAuthGuard)
@Get()
getCurrentCat(@CurrentUser() cat: Cat) {
  return cat.readOnlyData;
}
```

## 핵심 정리

- 로그인 = 사용자 검증 후 `jwtService.sign(payload)`로 토큰 발급.
- 인증 = `@UseGuards(JwtAuthGuard)` → `JwtStrategy.validate()` → `request.user`.
- 비밀키는 환경 변수로, payload에는 민감 정보 없이 식별자만 넣는다.

관련 노트: [[cookie-session|쿠키와 세션]], [[web-security|웹 보안: CSRF와 XSS]], [[auth-flow|React로 회원가입·로그인 구현하기]]

참고: [NestJS Authentication](https://docs.nestjs.com/recipes/passport), [Guards](https://docs.nestjs.com/guards)
