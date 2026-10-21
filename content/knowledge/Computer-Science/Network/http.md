---
title: "HTTP 프로토콜"
concept: "HTTP"
summary: "웹 통신 규약 HTTP의 요청·응답 메시지 형식, 아홉 가지 메서드와 안전·멱등, 상태 코드(API에서 자주 쓰는 코드와 비표준 코드), 헤더 종류, URL의 구성 요소와 URI·URL·URN의 차이, HTTP/1.1·2·3 비교와 HTTP/2가 빠른 이유."
tags: ["network", "http", "web", "application-layer"]
source: notion
sources: ["https://app.notion.com/p/49200e54fe6d461ab1ebc5180b35337b", "https://80000coding.notion.site/d0f4fab2a1ca49c8ad36a81fd2329fcb", "https://bytebytego.com/guides/top-9-http-request-methods", "https://bytebytego.com/guides/http-status-code-you-should-know", "https://bytebytego.com/guides/5-http-status-codes-that-should-never-have-been-created", "https://bytebytego.com/guides/important-things-about-http-headers-you-may-not-know", "https://bytebytego.com/guides/do-you-know-all-the-components-of-a-url", "https://bytebytego.com/guides/url-uri-urn-do-you-know-the-differences", "https://bytebytego.com/guides/http1-http2-http3", "https://bytebytego.com/guides/what-makes-http2-faster-than-http1", "https://blog.outsider.ne.kr/312", "https://evan-moon.github.io/2020/03/15/about-http-status-code/", "https://developer.mozilla.org/ko/docs/Web/HTTP/Redirections", "https://www.popit.kr/나만-모르고-있던-http2/", "https://evan-moon.github.io/2019/10/08/what-is-http3"]
date: "2026-10-14"
---

> 고무오리 CS 스터디의 네트워크 학습 노트(HTTP 프로토콜)를 바탕으로 재구성한 노트다. 줄 끝 CRLF 부분은 팔만코딩경(42Seoul 커뮤니티 위키)의 「나만 몰랐던 이야기 - \r\n편」을 바탕으로 보강했다. 메서드·상태 코드·헤더·URL 구성·HTTP 버전 부분은 ByteByteGo의 System Design 101 가이드 「[Top 9 HTTP Request Methods](https://bytebytego.com/guides/top-9-http-request-methods)」, 「[HTTP Status Codes You Should Know](https://bytebytego.com/guides/http-status-code-you-should-know)」, 「[5 HTTP Status Codes That Should Never Have Been Created](https://bytebytego.com/guides/5-http-status-codes-that-should-never-have-been-created)」, 「[Important Things About HTTP Headers](https://bytebytego.com/guides/important-things-about-http-headers-you-may-not-know)」, 「[Do you know all the components of a URL?](https://bytebytego.com/guides/do-you-know-all-the-components-of-a-url)」, 「[URL, URI, URN](https://bytebytego.com/guides/url-uri-urn-do-you-know-the-differences)」, 「[HTTP/1 -> HTTP/2 -> HTTP/3](https://bytebytego.com/guides/http1-http2-http3)」, 「[What makes HTTP2 faster than HTTP1?](https://bytebytego.com/guides/what-makes-http2-faster-than-http1)」로 보강했다.
> GET과 POST의 의미는 「[GET과 POST의 차이](https://blog.outsider.ne.kr/312)」, 상태 코드 고르기는 「[서버의 상태를 알려주는 HTTP 상태코드](https://evan-moon.github.io/2020/03/15/about-http-status-code/)」, 리다이렉트는 MDN의 「[HTTP 리다이렉트](https://developer.mozilla.org/ko/docs/Web/HTTP/Redirections)」, HTTP/2·3는 「[나만 모르고 있던 - HTTP/2](https://www.popit.kr/나만-모르고-있던-http2/)」, 「[HTTP/3는 왜 UDP를 선택한 것일까?](https://evan-moon.github.io/2019/10/08/what-is-http3)」를 바탕으로 보강했다.

HTTP(HyperText Transfer Protocol)는 웹 통신을 위한 응용 계층 프로토콜이다. 이름은 HTML 문서 전송에서 왔지만, 이미지·JSON 등 웹 표준으로 정의된 여러 종류의 데이터를 주고받을 수 있다. 동작은 단순하게 **"요청하면 응답한다"**. 브라우저·프론트엔드·백엔드가 이 규약 위에서 어떻게 대화하는지는 [[http-web-architecture|웹 앱의 요청·응답 구조]]에 정리했다.

HTTP는 **Stateless**다. 각 요청은 이전 요청과 무관하게 독립적으로 처리되므로, 로그인 상태 같은 정보는 서버가 기억해 주지 않는다. 그래서 쿠키·세션·토큰으로 상태를 따로 이어 붙인다([[cookie-session|쿠키와 세션]]).

## 요청 메시지

```text
GET /company/location HTTP/1.1      ← Request Line
Host: test.com                      ← Headers
Accept: text/html
                                    ← 빈 줄
(Body)                              ← 필요할 때만
```

- **Request Line**: `메서드` + 공백 + `URI` + 공백 + `HTTP 버전`
- **Headers**: 요청에 대한 부가 정보
- **빈 줄**: 헤더의 끝 표시
- **Body**: 서버로 보낼 데이터

### 줄 끝은 CRLF

HTTP/1.1의 시작줄과 헤더는 각 줄을 **`\r\n`(CRLF)** 으로 끝내고, 헤더의 끝은 빈 줄 `\r\n\r\n`으로 표시한다. SMTP 같은 오래된 텍스트 프로토콜도 같다.

| 문자 | 이름 | 타자기 시절의 동작 |
| --- | --- | --- |
| `\r` (0x0D) | CR, Carriage Return | 활자 위치(캐리지)를 줄 맨 앞으로 되돌림 |
| `\n` (0x0A) | LF, Line Feed | 종이를 한 줄 올림 |

타자기에서 "다음 줄 첫 칸"은 두 동작을 함께 해야 했다. 그래서 터미널에서 `printf("aa\rbb\n")`을 하면 `\r`이 커서를 줄 앞으로 돌려 `bb`가 `aa`를 덮어쓴다. 운영체제마다 줄바꿈 관례가 다르다. UNIX·macOS는 LF, Windows는 CRLF를 쓴다. 저장소에서는 `.gitattributes`로 줄바꿈을 통일한다. 헤더 값에 사용자 입력을 그대로 넣으면 공격자가 CRLF를 끼워 헤더를 추가로 만들 수 있다(HTTP 응답 분할). HTTP/2·3은 메시지를 이진 프레임으로 보내므로 줄 구분 문자가 없다.

### 주요 메서드

| 메서드 | 용도 | 데이터 전달 | 안전 | 멱등 |
| --- | --- | --- | --- | --- |
| GET | 리소스 조회. 데이터를 가져올 때만 사용 | Query String (`?key=value&key2=value2`) | O | O |
| HEAD | GET과 같은 응답에서 **본문만 뺀 것**. 크기·수정 시각·존재 여부 확인 | 없음 | O | O |
| OPTIONS | 대상 리소스가 지원하는 메서드 등 통신 옵션 조회. CORS 사전 요청(preflight)에 쓰인다 | 없음 | O | O |
| POST | 리소스 생성, 정보 전송 | 요청 바디 | X | X |
| PUT | 리소스 전체 교체, 없으면 그 URI로 생성 | 요청 바디 | X | O |
| PATCH | 리소스 일부 수정 | 요청 바디 | X | X |
| DELETE | 리소스 삭제 | 보통 URL로 대상 지정 | X | O |
| CONNECT | 대상 서버까지 터널을 연다. 프록시를 거쳐 HTTPS를 주고받을 때 쓴다 | 없음 | X | X |
| TRACE | 요청이 경로를 따라 어떻게 도착했는지 되돌려 받는 루프백 진단 | 없음 | O | O |

**안전(safe)** 은 서버의 상태를 바꾸지 않는다는 뜻이고, **멱등(idempotent)** 은 같은 요청을 여러 번 보내도 결과가 한 번 보낸 것과 같다는 뜻이다. 멱등한 요청은 네트워크 오류 때 그대로 재시도해도 된다. POST를 안전하게 재시도하는 법은 [[rest-api|REST API 설계]]의 멱등 키에 있다. TRACE는 쿠키 같은 헤더를 그대로 되돌려 주므로 운영 서버에서는 보통 꺼 둔다.

**GET은 가져오기만 하고, 상태를 바꾸는 일은 POST 이상으로 한다.** 브라우저의 링크 미리 가져오기(prefetch), 검색 엔진 크롤러, 링크 미리보기 봇은 GET 링크를 사람 대신 마구 따라간다. `/delete?id=42` 같은 GET 링크로 삭제를 만들면 이런 도구가 지나가기만 해도 데이터가 사라진다. 반대로 GET으로 가져오는 자원은 URL만으로 공유·북마크·캐시할 수 있다. GET의 쿼리 문자열은 URL 길이 제한을 받고 서버 로그·브라우저 기록에 남으므로, 큰 데이터와 민감한 값은 본문으로 보낸다.

HTML `<form>`도 결국 HTTP 요청을 만드는 도구다. `action`에 보낼 URL을, `method`에 메서드를 지정하면 각 `<input>`의 `name`이 key, 입력값이 value가 되어 서버로 전달된다. 단, `<form>`의 `method`는 GET과 POST만 지원하므로 PUT·PATCH·DELETE는 JavaScript(`fetch`)로 보내야 한다.

## 응답 메시지

```text
HTTP/1.1 200 OK                     ← Status Line
Content-Type: text/html             ← Headers
                                    ← 빈 줄
<html>...</html>                    ← Body
```

- **Status Line**: `HTTP 버전` + 공백 + `상태 코드` + 공백 + `상태 문구`

### 상태 코드

| 범위 | 의미 | 예 |
| --- | --- | --- |
| 1xx | 정보(처리 중) | 100 Continue, 101 Switching Protocols |
| 2xx | 요청 성공 | 200 OK |
| 3xx | 리다이렉트 | 301 Moved Permanently(영구), 302 Found(임시), 304 Not Modified(캐시 재사용), 307·308(임시·영구, 메서드 유지) |
| 4xx | 클라이언트 에러 | 400 Bad Request, 404 Not Found |
| 5xx | 서버 에러 | 500 Internal Server Error, 503 Service Unavailable(일시적으로 처리 불가, 세션 초과 등) |

API에서 자주 고르는 코드는 다음과 같다.

| 코드 | 쓰는 때 |
| --- | --- |
| 201 Created / 204 No Content | 생성 성공(`Location` 헤더에 새 주소) / 성공했지만 돌려줄 본문 없음 |
| 401 Unauthorized / 403 Forbidden | 인증이 없거나 틀림 / 인증은 됐지만 권한이 없음 |
| 409 Conflict | 현재 상태와 충돌 (중복 생성, 버전 충돌) |
| 429 Too Many Requests | 레이트 리밋 초과. `Retry-After` 헤더로 다시 시도할 시점을 알린다 |
| 502 Bad Gateway / 504 Gateway Timeout | 프록시·게이트웨이가 뒤 서버에서 잘못된 응답을 받음 / 제때 응답을 받지 못함 |

표준이 아니거나 사연이 있는 코드도 있다.

| 코드 | 사연 |
| --- | --- |
| 418 I'm a teapot | 만우절 농담 명세(RFC 2324)에서 나왔다. 실제 의미는 없고, HTTP 표준(RFC 9110)은 이 번호를 다른 용도로 쓰지 않게 비워 두었다 |
| 451 Unavailable For Legal Reasons | 법적 이유로 접근을 막을 때 쓰는 정식 코드(RFC 7725). 번호는 소설 「화씨 451」에서 따왔다 |
| 420 Enhance Your Calm | 한 서비스가 레이트 리밋 초과에 쓰던 비표준 코드. 지금은 표준 429를 쓴다 |
| 218, 530 같은 업체 코드 | 특정 서버·호스팅 업체만 쓰는 비표준 코드. 클라이언트는 모르는 코드를 **앞자리 범주(2xx, 5xx)로** 해석한다 |

비표준 코드는 프록시·라이브러리가 제대로 다루지 못한다. **직접 만든 API에서는 표준 코드만 쓰고, 세부 사유는 응답 본문의 오류 코드로 전한다.**

**상태 코드는 결과를 그대로 말해야 한다.** 실패를 `200 OK`에 `{"success": false}`로 감싸면 HTTP 클라이언트 라이브러리·모니터링·캐시가 모두 성공으로 처리한다. 비슷해 보이는 코드는 원인이 어디에 있는지로 가른다.

| 헷갈리는 쌍 | 구분 |
| --- | --- |
| 408 Request Timeout / 504 Gateway Timeout | 클라이언트가 연결만 열고 요청을 끝까지 보내지 않음 / 게이트웨이가 뒤 서버의 응답을 기다리다 시간 초과 |
| 502 Bad Gateway / 503 Service Unavailable | 뒤 서버가 죽었거나 이상한 응답을 줌 / 서버가 과부하·점검으로 일시적으로 못 받음(`Retry-After`로 다시 올 시점 안내) |
| 404 / 410 Gone | 없음(또는 존재를 숨김) / 있었지만 영구히 지웠음 |
| 500 | 처리하지 못한 예외. 스택 트레이스 같은 내부 정보는 응답에 넣지 않고 서버 로그·에러 추적 도구로 본다 |

301과 302는 역사적으로 브라우저가 POST를 GET으로 바꿔 다시 요청하는 경우가 있었다. 메서드를 반드시 유지해야 하면 307·308을 쓴다. 검색 엔진은 301·308을 영구 이동으로 보고 새 URL로 신호를 옮긴다([[seo-basics|SEO 기초]]).

### 리다이렉트

| 코드 | 성격 | 메서드·본문 | 쓰는 때 |
| --- | --- | --- | --- |
| 301 / 308 | 영구 | 301은 브라우저가 POST를 GET으로 바꿀 수 있음, 308은 그대로 유지 | 도메인 이전, HTTP → HTTPS, 정규 주소(`www` 유무) 통일, 옛 URL 보존 |
| 302 / 307 | 임시 | 302는 바뀔 수 있음, 307은 유지 | 점검 중 임시 페이지. 검색 엔진은 원래 URL을 유지한다 |
| 303 See Other | 임시 | **항상 GET으로 바꿔** 따라간다 | POST 처리 뒤 결과 페이지로 보내 새로 고침해도 다시 제출되지 않게 하는 PRG(Post/Redirect/Get), 오래 걸리는 작업의 진행 상태 페이지 |
| 300 Multiple Choices | 특수 | — | 여러 표현 중 고르게 할 때. 거의 쓰지 않는다 |

리다이렉트 방법은 세 가지이고 **먼저 적용되는 순서**가 있다.

| 순서 | 방법 | 특징 |
| --- | --- | --- |
| 1 | HTTP 응답(`3xx` + `Location`) | 문서를 읽기 전에 처리된다. 이미지·API 등 모든 자원에 통하고, 검색 엔진이 이해한다. **가장 먼저 고려한다** |
| 2 | HTML `<meta http-equiv="refresh" content="0; url=...">` | HTML 문서에서만 된다. 뒤로 가기를 망가뜨릴 수 있다 |
| 3 | JavaScript `location.href = ...` | JS가 실행되어야 한다. 조건부로 보낼 때만 쓴다 |

- 리다이렉트는 왕복을 하나 더 만든다. 사이트 안의 링크는 리다이렉트에 기대지 말고 최종 주소로 고친다.
- 리다이렉트가 돌고 돌아 처음으로 돌아오면 **리다이렉트 루프**다. 브라우저가 감지해 오류 페이지를 띄운다. 설정을 바꾼 직후 생기면 서버 규칙(HTTPS 강제와 프록시의 `X-Forwarded-Proto` 불일치가 흔한 원인)을 의심한다.
- Nginx에서는 `return 301 https://$host$request_uri;`처럼 쓴다.

## 헤더의 종류

| 종류 | 담는 정보 |
| --- | --- |
| 일반 헤더 | 요청·응답 모두에 쓰이는 일반 정보 (예: `Date`, `Connection`) |
| 요청 헤더 | 클라이언트 정보 (예: `Host`, `User-Agent`, `Accept`) |
| 응답 헤더 | 서버 정보 (예: `Server`, `Set-Cookie`, `Location`) |

헤더는 요청·응답 본문에 대한 설명서다. 클라이언트는 헤더로 "무엇을 보내고, 무엇을 받고 싶고, 나는 누구인지"를 알리고, 서버는 "무엇을 보내는지, 어떻게 다뤄야 하는지"를 알린다. REST API를 만들 때 자주 다루는 헤더는 다음과 같다.

| 목적 | 헤더 |
| --- | --- |
| 본문 형식 | `Content-Type`(보내는 형식), `Accept`(받고 싶은 형식) — 둘로 형식을 정하는 것을 콘텐츠 협상이라 한다 |
| 인증 | `Authorization`, `Cookie` / `Set-Cookie` |
| 캐시 | `Cache-Control`, `ETag`, `If-None-Match`, `Last-Modified` ([[http-cache\|HTTP 캐시]]) |
| 출처 간 요청 | `Origin`, `Access-Control-Allow-Origin` ([[cors\|CORS]]) |
| 이동·재시도 | `Location`, `Retry-After` |
| 압축 | `Accept-Encoding`, `Content-Encoding` |

## URI, URL, URN

```text
scheme:[//authority]path[?query][#fragment]

https://user@shop.example.com:8443/products/42?color=red&size=m#reviews

scheme     https
authority  user@shop.example.com:8443   (userinfo@host:port)
path       /products/42
query      color=red&size=m
fragment   reviews
```

| 구성 요소 | 구분자 | 설명 |
| --- | --- | --- |
| 스킴(scheme) | `:` | 자원에 접근하는 방법. `https`, `ftp`, `mailto` 등 |
| 권한(authority) | `//` 뒤 | 호스트(도메인 또는 IP)와 포트. 포트를 생략하면 스킴의 기본 포트(HTTP 80, HTTPS 443) |
| 경로(path) | `/` | 서버 안에서 자원의 위치 |
| 쿼리(query) | `?`, 쌍은 `&` | `key=value` 쌍의 파라미터 |
| 프래그먼트(fragment) | `#` | 자원 안의 특정 위치(문서의 한 섹션). **서버로 전송되지 않고** 브라우저만 쓴다 |

주소창에 URL을 넣는 것은 웹 페이지가 아니라 **자원(resource)** 에 접근하는 일이다. 같은 방식으로 이미지, JSON, 파일을 가리킨다.

| 용어 | 의미 |
| --- | --- |
| URI (Uniform Resource Identifier) | 인터넷에서 특정 자원을 **식별**하는 유일한 주소. URL과 URN을 포함하는 상위 개념 |
| URL (Uniform Resource Locator) | 자원이 네트워크 상 **어디에 있는지**(위치)를 나타냄. 예: `http://test.com/work/sample.pdf` |
| URN (Uniform Resource Name) | 위치나 프로토콜과 무관하게 자원에 부여된 영구적이고 유일한 **이름**으로 자원을 특정. `urn:<네임스페이스>:<이름>` 형식이다. 예: `urn:isbn:0451450523`(책). 이름만 있어 이것만으로는 자원을 찾아갈 수 없다 |

정리하면 **URI는 식별하고, URL은 위치를 가리킨다.** AWS는 URN 개념을 확장해 리소스를 ARN(Amazon Resource Name)으로 명명·관리한다.

## HTTP 버전

위의 텍스트 메시지 형식은 HTTP/1.1 기준이다. 메서드·상태 코드·헤더의 의미는 버전과 상관없이 같고, 메시지를 실어 나르는 방식만 다르다.

| 버전 | 전송 계층 | 특징 |
| --- | --- | --- |
| HTTP/1.1 | TCP | 텍스트 메시지, 연결 재사용(keep-alive). 한 연결에서 요청을 순서대로 처리해 앞 응답이 늦으면 뒤도 밀린다(HOL blocking). 응답을 기다리지 않고 요청을 연달아 보내는 파이프라이닝이 명세에 있지만, 응답은 여전히 순서대로 와야 해서 브라우저는 거의 쓰지 않았다 |
| HTTP/2 (RFC 9113) | TCP | 바이너리 프레임, 한 연결에서 여러 요청을 동시에 주고받는 멀티플렉싱, 헤더 압축(HPACK) |
| HTTP/3 (RFC 9114, 2022) | QUIC(UDP 기반) | TLS 1.3이 내장된 QUIC 위에서 동작. 패킷 손실이 다른 스트림을 막지 않고 연결 수립이 빠르다. 헤더 압축은 QPACK |

### HTTP/2가 빠른 이유

| 기능 | 내용 |
| --- | --- |
| 바이너리 프레이밍 | 메시지를 작은 이진 **프레임**으로 쪼개 보낸다. 텍스트 파싱보다 처리가 효율적이다 |
| 멀티플렉싱 | 요청마다 **스트림** ID를 붙여, 여러 요청·응답의 프레임을 한 연결에 섞어 보내고 받는 쪽이 다시 조립한다. 도메인당 연결 여러 개를 열던 HTTP/1.1의 우회가 필요 없다 |
| 헤더 압축(HPACK) | 요청마다 반복되는 헤더를 표로 기억해 바뀐 부분만 보낸다 |
| 우선순위 | 중요한 스트림의 프레임을 먼저 보내게 한다. 처음의 복잡한 우선순위 트리는 RFC 9113에서 폐기됐고, 지금은 `Priority` 헤더로 긴급도를 알리는 방식(RFC 9218)을 쓴다 |
| 서버 푸시 | 요청 전에 필요한 자원을 서버가 먼저 보내는 기능이었지만, 효과가 작고 캐시와 충돌해 주요 브라우저가 지원을 제거했다. 대신 `103 Early Hints`와 `preload`를 쓴다 |

HTTP/2도 **TCP 위의 멀티플렉싱**이라 패킷 하나가 손실되면 그 연결의 모든 스트림이 기다린다. 이 TCP 수준의 HOL blocking을 없애려고 HTTP/3는 TCP를 버리고 UDP 위의 QUIC으로 옮겼다. QUIC은 구글이 처음 만들어 IETF에서 표준(RFC 9000)으로 다듬었다.

### HTTP/3가 UDP를 고른 이유

TCP를 고치지 않고 UDP 위에 새 전송 프로토콜(QUIC)을 올린 데는 이유가 있다.

| TCP의 한계 | QUIC의 해법 |
| --- | --- |
| 운영체제 커널에 구현되어 있고, 중간 장비(방화벽·NAT)가 TCP 헤더를 해석하므로 바꾸기 어렵다(경직화). 헤더의 옵션 공간도 거의 찼다 | UDP는 헤더가 거의 비어 있어 그 위에 원하는 기능을 사용자 공간에서 구현한다. 헤더 대부분을 암호화해 중간 장비가 간섭하지 못하게 한다 |
| 연결 수립 1-RTT + TLS 핸드셰이크가 따로 든다 | TLS 1.3을 내장해 첫 연결 1-RTT, 재연결은 0-RTT로 데이터를 함께 보낸다 |
| 패킷 하나가 사라지면 연결 전체가 멈춘다(TCP HOL blocking) | 스트림마다 독립적으로 순서를 맞춰, 손실이 다른 스트림을 막지 않는다 |
| 연결을 `<IP, 포트>` 쌍으로 식별해 Wi-Fi ↔ 셀룰러 전환 때 연결이 끊긴다 | **연결 ID**로 식별해 IP가 바뀌어도 연결을 유지한다(연결 이주) |
| 재전송한 세그먼트도 같은 시퀀스 번호를 써서 ACK가 원본과 재전송 중 어느 것에 대한 것인지 모호하다 | 패킷 번호가 계속 증가해 재전송도 새 번호를 받으므로 RTT 측정과 손실 감지가 정확하다 |

대신 UDP를 막거나 느리게 다루는 네트워크가 있어, 브라우저는 서버의 `Alt-Svc` 헤더나 DNS HTTPS 레코드로 HTTP/3 지원을 알아낸 뒤 시도하고, 안 되면 HTTP/2로 돌아간다.

HTTPS는 HTTP를 TLS로 암호화한 것이다([[https|HTTPS와 TLS]]). 응답 재사용은 [[http-cache|HTTP 캐시]]에 정리했다. 아래에서 받쳐 주는 전송 계층은 [[transport-layer|전송 계층: 포트, TCP, UDP]]에 정리했다. 웹 서비스 관점의 요청 흐름과 API 설계는 [[rest-api|REST API 설계]], 상태를 유지하는 방법은 [[cookie-session|쿠키와 세션]]을 참고한다.

## 핵심 정리

- 요청 = Request Line + Headers + 빈 줄 + Body, 응답 = Status Line + Headers + 빈 줄 + Body.
- HTTP는 Stateless다. 상태는 쿠키·세션·토큰으로 따로 유지한다.
- 상태 코드 앞자리: 1 정보, 2 성공, 3 리다이렉트, 4 클라이언트 잘못, 5 서버 잘못.
- URI ⊃ URL(위치), URN(이름).
- HTTP/1.1·HTTP/2는 TCP 위에서, HTTP/3는 UDP 기반 QUIC 위에서 동작한다.

관련 노트: [[https|HTTPS와 TLS]], [[proxy|프록시: 포워드 프록시와 리버스 프록시]], [[rfc-requirement-levels|RFC와 요구 수준 키워드]], [[rest-api|REST API 설계]], [[api-architectural-styles|API 아키텍처 스타일]]
