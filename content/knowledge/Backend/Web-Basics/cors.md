---
title: "CORS"
concept: "CORS"
summary: "다른 출처(origin)의 프론트엔드가 API를 호출할 수 있도록 서버가 허용 범위를 알려 주는 브라우저 보안 정책."
tags: ["http", "security", "backend", "nestjs"]
source: til
date: "2026-10-12"
sources: ["https://riverkim.kr/111", "https://riverkim.kr/112"]
---

프론트엔드(`http://localhost:3000`)에서 백엔드(`http://localhost:8000`)로 회원가입 요청을 보내면 브라우저 콘솔에 CORS 에러가 뜨는 경우가 많다. 이는 서버 오류가 아니라 **브라우저의 보안 장치**다.

## 출처(Origin)와 동일 출처 정책

- 출처 = **프로토콜 + 호스트 + 포트**. 이 중 하나라도 다르면 다른 출처다.
- 브라우저는 기본적으로 스크립트가 **다른 출처의 리소스를 읽는 것을 막는다**(Same-Origin Policy).
- CORS(Cross-Origin Resource Sharing)는 서버가 응답 헤더(`Access-Control-Allow-Origin` 등)로 "이 출처는 허용한다"고 알려 줘서 그 제한을 풀어 주는 방식이다.
- 즉, 내가 서비스하지 않는 사이트가 마음대로 API를 호출하지 못하게 막고, **어떤 사이트에서 API를 쓸 수 있을지** 서버가 정하는 장치다.

### Preflight와 OPTIONS 메서드

`GET`·`POST` 중 단순한 형태가 아닌 요청(예: `PUT`·`DELETE`, `Content-Type: application/json`, `Authorization` 같은 커스텀 헤더)을 보내기 전에, 브라우저는 먼저 **`OPTIONS` 메서드로 예비 요청(preflight)**을 보내 "이 출처에서 이 메서드·헤더로 요청해도 되는지" 묻는다. 서버가 `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`로 허용한다고 답해야 본 요청이 나간다.

| 콘솔 메시지 | 의미 |
| --- | --- |
| `No 'Access-Control-Allow-Origin' header is present on the requested resource.` | 응답(또는 preflight 응답)에 허용 출처 헤더가 없다. 서버에서 해당 출처를 허용하도록 설정한다 |

네트워크 탭에 같은 URL로 `OPTIONS` 요청이 하나 더 보이는 것은 정상이다.

## NestJS에서 설정하기

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,       // 요청한 출처를 그대로 허용 (개발용)
    credentials: true,  // 쿠키·Authorization 헤더 포함 요청 허용
  });
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
```

- `origin: true`는 사실상 모든 출처를 허용하므로 **개발 단계에서만** 쓰고, 운영에서는 `origin: ['https://my-frontend.com']`처럼 특정 URL을 명시한다.
- `credentials: true`를 쓸 때는 `origin`에 와일드카드(`*`)를 쓸 수 없다.

## 핵심 정리

- CORS 에러는 브라우저가 내는 것이며, 해결은 **서버에서 허용 출처를 설정**하는 것이다.
- 운영 환경에서는 허용할 프론트엔드 출처를 구체적으로 적는다.

관련 노트: [[ajax|AJAX와 HTTP 요청]], [[web-security|웹 보안: CSRF와 XSS]], [[api-security|API 보안 체크리스트]]

참고: [NestJS CORS 문서](https://docs.nestjs.com/security/cors), [OPTIONS 메소드를 쓰는 이유와 CORS (하나몬)](https://hanamon.kr/네트워크-http-options-메소드를-쓰는-이유와-cors란/), [No 'Access-Control-Allow-Origin' 해결 방법](https://kimyhcj.tistory.com/263)
