---
title: "NestJS Controller"
concept: "Controller"
summary: "들어오는 요청을 경로·메서드별로 받아 파라미터를 꺼내고 응답을 반환하는 NestJS의 라우팅 계층."
tags: ["nestjs", "api", "rest", "typescript"]
source: til
date: "2026-10-12"
sources: ["https://riverkim.kr/168"]
---

컨트롤러는 **들어오는 요청을 처리하고 클라이언트에 응답을 돌려주는** 역할을 한다. Express에서 `router.get(...)`으로 하던 일을 데코레이터로 선언적으로 표현한다.

## 라우팅

`@Controller('prefix')`로 경로를 그룹화하고, 메서드 데코레이터에 하위 경로를 붙인다.

```typescript
import { Controller, Get, Post, Put, Patch, Delete } from '@nestjs/common';

@Controller('cats')               // 모든 라우트가 /cats 로 시작
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get()            getAllCat() {}        // GET    /cats
  @Get(':id')       getOneCat() {}        // GET    /cats/:id
  @Post()           createCat() {}        // POST   /cats
  @Put(':id')       updateCat() {}        // PUT    /cats/:id
  @Patch(':id')     updatePartialCat() {} // PATCH  /cats/:id
  @Delete(':id')    deleteCat() {}        // DELETE /cats/:id
  @Get('hello')     getHello() {}         // GET    /cats/hello
}
```

> `@Get(':id')`와 `@Get('hello')`처럼 겹칠 수 있는 경로는 **정적 경로를 먼저** 선언해야 `hello`가 `:id`로 잡히지 않는다.

## 요청 데이터 꺼내기

Express에서는 `req.body`, `req.params`를 직접 꺼냈지만, Nest는 **파라미터 데코레이터**로 필요한 부분만 주입받는다. 핸들러가 `req` 전체에 의존하지 않아 책임이 분리되고 테스트도 쉬워진다.

```typescript
@Get(':id')
getOneCat(
  @Param('id') id: string,      // /cats/:id 의 id
  @Query('page') page: string,  // ?page=1
  @Body() body: CreateCatDto,   // 요청 바디
  @Req() req: Request,          // 원본 요청 객체 (가급적 지양)
) {}
```

| 데코레이터 | Express 대응 |
| --- | --- |
| `@Req()` | `req` |
| `@Body(key?)` | `req.body` |
| `@Param(key?)` | `req.params` |
| `@Query(key?)` | `req.query` |
| `@Headers(name?)` | `req.headers` |

- 파라미터 타입을 `{ id: string }`처럼 직접 적을 수도 있지만, 바디 검증에는 [DTO](Backend/NestJS/dto-validation)를 쓰는 편이 낫다.
- 문자열로 들어오는 `id`를 숫자로 바꾸는 일은 [Pipe](Backend/NestJS/exception-filter-pipe)(`ParseIntPipe`)가 담당한다.

그 밖에 `@Ip()`(`req.ip`), `@Session()`(`req.session`), `@HostParam()`(`req.hosts`), `@Next()`(`next`) 같은 데코레이터도 있다.

메서드 데코레이터는 표준 HTTP 메서드마다 있다: `@Get`, `@Post`, `@Put`, `@Delete`, `@Patch`, `@Options`, `@Head`. `@All()`은 모든 메서드를 한 핸들러로 받는다.

## 응답

핸들러가 **값을 반환하면** Nest가 자동으로 응답을 만든다. 객체·배열은 JSON으로 직렬화되고, 기본 상태 코드는 GET 200, POST 201이다. `async` 핸들러에서 Promise를 반환해도 된다.

```typescript
@Put(':id')
@HttpCode(204)                              // 상태 코드 바꾸기
@Header('Cache-Control', 'no-store')        // 응답 헤더 추가
update() {}

@Get('docs')
@Redirect('https://docs.nestjs.com', 302)   // 리다이렉트 (기본 302)
getDocs(@Query('version') version: string) {
  if (version === '5') {
    return { url: 'https://docs.nestjs.com/v5/' };  // 반환값으로 URL·상태 코드를 동적으로 덮어쓴다
  }
}
```

| 데코레이터 | 용도 |
| --- | --- |
| `@HttpCode(code)` | 핸들러의 기본 상태 코드를 바꾼다 |
| `@Header(name, value)` | 커스텀 응답 헤더를 단다 |
| `@Redirect(url?, statusCode?)` | 다른 URL로 보낸다. `{ url, statusCode }` 객체를 반환하면 동적으로 바꿀 수 있다 |

> `@Res()`로 응답 객체를 직접 주입하면 그 핸들러는 **라이브러리 전용 모드**(Express 방식)가 된다. 이때는 `res.json()`, `res.send()`로 직접 응답을 보내야 하고, 보내지 않으면 요청이 끝나지 않고 매달린다. 값 반환 방식과 함께 쓰려면 `@Res({ passthrough: true })`를 쓴다.

## 모듈에 등록하기

컨트롤러 클래스를 만들어도 Nest는 그 존재를 모른다. 컨트롤러는 항상 모듈에 속하므로 `@Module()`의 `controllers` 배열에 넣어야 인스턴스가 만들어지고 라우트가 등록된다. CLI(`nest g controller cats`)로 만들면 자동으로 추가된다.

```typescript
@Module({
  controllers: [AppController, CatsController],
  providers: [AppService],
})
export class AppModule {}
```

## 핵심 정리

- `@Controller(prefix)` + `@Get/@Post/...(path)`로 라우트를 선언한다.
- `@Body`, `@Param`, `@Query`로 필요한 요청 데이터만 주입받는다.
- 컨트롤러는 얇게 유지하고 로직은 [서비스](Backend/NestJS/module)로 넘긴다.
