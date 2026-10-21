---
title: "CORS"
concept: "CORS"
summary: "다른 출처(origin)의 프론트엔드가 API를 호출할 수 있도록 서버가 허용 범위를 알려 주는 브라우저 보안 정책."
tags: ["http", "security", "backend", "nestjs"]
source: til
date: "2026-10-21"
sources: ["https://riverkim.kr/111", "https://riverkim.kr/112", "https://evan-moon.github.io/2020/05/21/about-cors/", "https://developer.mozilla.org/ko/docs/Web/HTTP/Access_control_CORS", "https://react.vlpt.us/redux-middleware/09-cors-and-proxy.html", "https://vite.dev/config/server-options#server-proxy", "https://github.com/baeharam/Must-Know-About-Frontend/blob/main/Notes/security/sop.md"]
---

> 요청 시나리오·인증 요청·개발 프록시 부분은 「[CORS는 왜 이렇게 우리를 힘들게 하는걸까?](https://evan-moon.github.io/2020/05/21/about-cors/)」와 MDN 「[교차 출처 리소스 공유 (CORS)](https://developer.mozilla.org/ko/docs/Web/HTTP/Access_control_CORS)」를 바탕으로 보강했다. 개발 프록시 설정 예시는 벨로퍼트의 「[벨로퍼트와 함께하는 모던 리액트](https://react.vlpt.us/)」 중 「[CORS 와 Webpack DevServer Proxy](https://react.vlpt.us/redux-middleware/09-cors-and-proxy.html)」를 바탕으로 보강했다.
> 출처 판정 예와 CORS 밖의 우회 방법은 「[Must-Know-About-Frontend: 동일 출처 정책](https://github.com/baeharam/Must-Know-About-Frontend/blob/main/Notes/security/sop.md)」을 바탕으로 보강했다.

프론트엔드(`http://localhost:3000`)에서 백엔드(`http://localhost:8000`)로 회원가입 요청을 보내면 브라우저 콘솔에 CORS 에러가 뜨는 경우가 많다. 이는 서버 오류가 아니라 **브라우저의 보안 장치**다.

## 출처(Origin)와 동일 출처 정책

- 출처 = **프로토콜 + 호스트 + 포트**. 이 중 하나라도 다르면 다른 출처다.
- 브라우저는 기본적으로 스크립트가 **다른 출처의 리소스를 읽는 것을 막는다**(Same-Origin Policy).
- CORS(Cross-Origin Resource Sharing)는 서버가 응답 헤더(`Access-Control-Allow-Origin` 등)로 "이 출처는 허용한다"고 알려 줘서 그 제한을 풀어 주는 방식이다.
- 즉, 내가 서비스하지 않는 사이트가 마음대로 API를 호출하지 못하게 막고, **어떤 사이트에서 API를 쓸 수 있을지** 서버가 정하는 장치다.

`http://website.com/ex/ex.html`에서 보낸 요청의 출처 판정:

| 요청 대상 | 같은 출처? | 이유 |
| --- | --- | --- |
| `http://website.com/ex1/data.json` | 같다 | 경로는 출처에 들어가지 않는다 |
| `http://website.com:81/ex/ex.html` | 다르다 | 포트 |
| `https://website.com/ex/ex.html` | 다르다 | 프로토콜 |
| `http://api.website.com/ex/` | 다르다 | 호스트(서브도메인도 다른 호스트다) |

CORS 말고도 출처를 넘는 방법이 있지만 쓰임이 다르다. 창·iframe끼리는 양쪽이 동의하는 `postMessage`를 쓰고, 서브도메인끼리 `document.domain`을 맞추던 방법은 폐기 예정이라 크롬에서 기본으로 동작하지 않는다([[windows-and-frames|창과 프레임]]). `<script>`로 콜백을 실행시키던 JSONP는 CORS 이전의 우회법이다([[ajax|AJAX]]). 서버 응답 헤더를 고칠 수 없으면 같은 출처의 프록시가 대신 요청한다(아래 「개발 환경의 프록시」).

### Preflight와 OPTIONS 메서드

`GET`·`POST` 중 단순한 형태가 아닌 요청(예: `PUT`·`DELETE`, `Content-Type: application/json`, `Authorization` 같은 커스텀 헤더)을 보내기 전에, 브라우저는 먼저 **`OPTIONS` 메서드로 예비 요청(preflight)을** 보내 "이 출처에서 이 메서드·헤더로 요청해도 되는지" 묻는다. 서버가 `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`로 허용한다고 답해야 본 요청이 나간다.

| 콘솔 메시지 | 의미 |
| --- | --- |
| `No 'Access-Control-Allow-Origin' header is present on the requested resource.` | 응답(또는 preflight 응답)에 허용 출처 헤더가 없다. 서버에서 해당 출처를 허용하도록 설정한다 |

네트워크 탭에 같은 URL로 `OPTIONS` 요청이 하나 더 보이는 것은 정상이다.

### 출처를 비교하는 주체는 브라우저

- 서버는 대개 요청을 정상 처리하고 응답을 돌려준다. **응답을 스크립트에 넘길지 막을지는 브라우저가** `Origin` 요청 헤더와 `Access-Control-Allow-Origin` 응답 헤더를 비교해 정한다. 그래서 같은 API가 Postman이나 서버 간 호출에서는 잘 되는데 브라우저에서만 막힌다. CORS는 브라우저 구현의 규칙이다.
- 막힌 요청도 서버에는 도달했을 수 있다. 단순 요청이라면 서버의 부수 효과(데이터 변경)는 이미 일어났을 수 있으므로, CORS를 CSRF 방어로 착각하지 않는다([[web-security|웹 보안]]).
- `<img>`, `<script>`, `<link>`로 다른 출처 자원을 불러오는 것은 허용된다. 이때는 `no-cors` 모드라 응답을 JS가 읽을 수 없으므로 CORS 우회 수단이 되지 못한다.

### 세 가지 요청 시나리오

| 시나리오 | 조건 | 흐름 |
| --- | --- | --- |
| 단순 요청(simple request) | 메서드가 `GET`·`HEAD`·`POST`, 헤더는 `Accept`·`Accept-Language`·`Content-Language`·`Content-Type` 같은 안전 목록만, `Content-Type`은 `application/x-www-form-urlencoded`·`multipart/form-data`·`text/plain` 중 하나 | 예비 요청 없이 본 요청을 보내고 응답 헤더로 판단한다 |
| 예비 요청(preflight) | 위 조건을 하나라도 벗어남. `application/json`, `Authorization` 헤더를 쓰면 대부분 여기에 해당 | `OPTIONS`로 먼저 묻고, 허용되면 본 요청 |
| 인증 정보 포함 요청 | `fetch`의 `credentials: 'include'`, `XMLHttpRequest.withCredentials = true`로 쿠키·인증 헤더를 실어 보냄 | 아래 추가 조건을 모두 만족해야 응답을 읽을 수 있다 |

인증 정보 포함 요청의 추가 조건:

- `Access-Control-Allow-Origin`에 `*`가 아닌 **정확한 출처**를 적는다.
- `Access-Control-Allow-Credentials: true`를 보낸다.
- `Access-Control-Allow-Headers`·`Allow-Methods`·`Expose-Headers`에도 `*`를 쓸 수 없고 이름을 나열한다.
- 쿠키 자체가 실리려면 쿠키의 `SameSite`·`Secure` 설정도 맞아야 한다([[cookie-session|쿠키와 세션]]).

### 그 밖의 응답 헤더

| 헤더 | 쓰임 |
| --- | --- |
| `Access-Control-Max-Age` | 예비 요청 결과를 캐시할 초. 같은 요청마다 `OPTIONS`가 반복되는 것을 줄인다. 브라우저마다 상한이 있다 |
| `Access-Control-Expose-Headers` | JS에서 읽게 허용할 응답 헤더. 기본으로는 `Content-Type` 등 몇 개만 읽힌다 |
| `Vary: Origin` | 요청 출처에 따라 `Allow-Origin` 값을 바꿔 준다면 붙인다. CDN·브라우저 캐시가 다른 출처의 응답을 재사용하지 않게 한다 |

### 개발 환경의 프록시

로컬 개발에서는 Vite `server.proxy`나 webpack-dev-server `proxy`로 API 요청을 개발 서버가 대신 보내게 하면, 브라우저가 보기에는 같은 출처라 CORS가 생기지 않는다. 운영 환경에는 이 프록시가 없으므로, 리버스 프록시로 프론트엔드와 API를 같은 출처에 두거나 서버에 CORS를 제대로 설정한다.

```ts
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true }, // /api/posts → http://localhost:4000/api/posts
    },
  },
})
```

```ts
// 코드는 도메인 없이 상대 경로로 요청한다: 개발에서는 현재 출처(localhost:5173)로 가서 프록시를 탄다
const res = await fetch('/api/posts')

// 운영에서 API 도메인이 다르면(예: 서비스 example.com, API api.example.com) 환경별로 기준 주소만 바꾼다
const BASE_URL = import.meta.env.DEV ? '' : 'https://api.example.com'
```

- 개발 프록시를 쓰면 백엔드가 개발용 CORS 설정을 따로 둘 필요가 없다.
- 운영에서도 프론트엔드와 API를 같은 도메인으로 서비스하면 상대 경로 그대로 배포한다.
- 과거 CRA에서는 `package.json`에 `"proxy": "http://localhost:4000"` 한 줄로 같은 일을 했다.

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
- 단순 요청이 아니면 `OPTIONS` 예비 요청이 먼저 간다. 쿠키를 실으려면 정확한 출처 + `Allow-Credentials: true`가 필요하다.

관련 노트: [[ajax|AJAX와 HTTP 요청]], [[web-security|웹 보안: CSRF와 XSS]], [[api-security|API 보안 체크리스트]]

참고: [NestJS CORS 문서](https://docs.nestjs.com/security/cors), [OPTIONS 메소드를 쓰는 이유와 CORS (하나몬)](https://hanamon.kr/네트워크-http-options-메소드를-쓰는-이유와-cors란/), [No 'Access-Control-Allow-Origin' 해결 방법](https://kimyhcj.tistory.com/263), [[devtools-network|DevTools Network 패널]]
