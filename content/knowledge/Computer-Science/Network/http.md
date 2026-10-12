---
title: "HTTP 프로토콜"
concept: "HTTP"
summary: "웹 통신 규약 HTTP의 요청·응답 메시지 형식, 메서드, 상태 코드, 헤더 종류, URI·URL·URN의 차이와 HTTP/1.1·2·3 비교."
tags: ["network", "http", "web", "application-layer"]
source: notion
sources: ["https://app.notion.com/p/49200e54fe6d461ab1ebc5180b35337b"]
---

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

### 주요 메서드

| 메서드 | 용도 | 데이터 전달 |
| --- | --- | --- |
| GET | 리소스 조회. 데이터를 가져올 때만 사용 | Query String (`?key=value&key2=value2`) |
| POST | 리소스 생성, 정보 전송 | 요청 바디 |
| PUT | 리소스 전체 교체 | 요청 바디 |
| PATCH | 리소스 일부 수정 | 요청 바디 |
| DELETE | 리소스 삭제 | 보통 URL로 대상 지정 |

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
| 3xx | 리다이렉트 | 301, 302 |
| 4xx | 클라이언트 에러 | 400 Bad Request, 404 Not Found |
| 5xx | 서버 에러 | 500 Internal Server Error, 503 Service Unavailable(일시적으로 처리 불가, 세션 초과 등) |

## 헤더의 종류

| 종류 | 담는 정보 |
| --- | --- |
| 일반 헤더 | 요청·응답 모두에 쓰이는 일반 정보 (예: `Date`, `Connection`) |
| 요청 헤더 | 클라이언트 정보 (예: `Host`, `User-Agent`, `Accept`) |
| 응답 헤더 | 서버 정보 (예: `Server`, `Set-Cookie`, `Location`) |

## URI, URL, URN

```text
scheme://host[:port][/path][?query]
예) http://test.com/company/location
```

| 용어 | 의미 |
| --- | --- |
| URI (Uniform Resource Identifier) | 인터넷에서 특정 자원을 **식별**하는 유일한 주소. URL과 URN을 포함하는 상위 개념 |
| URL (Uniform Resource Locator) | 자원이 네트워크 상 **어디에 있는지**(위치)를 나타냄. 예: `http://test.com/work/sample.pdf` |
| URN (Uniform Resource Name) | 위치나 프로토콜과 무관하게 자원에 부여된 영구적이고 유일한 **이름**으로 자원을 특정 |

정리하면 **URI는 식별하고, URL은 위치를 가리킨다.** AWS는 URN 개념을 확장해 리소스를 ARN(Amazon Resource Name)으로 명명·관리한다.

## HTTP 버전

위의 텍스트 메시지 형식은 HTTP/1.1 기준이다. 메서드·상태 코드·헤더의 의미는 버전과 상관없이 같고, 메시지를 실어 나르는 방식만 다르다.

| 버전 | 전송 계층 | 특징 |
| --- | --- | --- |
| HTTP/1.1 | TCP | 텍스트 메시지, 연결 재사용(keep-alive). 한 연결에서 요청을 순서대로 처리해 앞 응답이 늦으면 뒤도 밀린다(HOL blocking) |
| HTTP/2 (RFC 9113) | TCP | 바이너리 프레임, 한 연결에서 여러 요청을 동시에 주고받는 멀티플렉싱, 헤더 압축(HPACK) |
| HTTP/3 (RFC 9114, 2022) | QUIC(UDP 기반) | TLS 1.3이 내장된 QUIC 위에서 동작. 패킷 손실이 다른 스트림을 막지 않고 연결 수립이 빠르다 |

HTTPS는 HTTP를 TLS로 암호화한 것이다([[https|HTTPS와 TLS]]). 응답 재사용은 [[http-cache|HTTP 캐시]]에 정리했다. 아래에서 받쳐 주는 전송 계층은 [[tcp|TCP]]와 [[transport-layer|전송 계층, 포트, UDP]]에 정리했다. 웹 서비스 관점의 요청 흐름과 API 설계는 [[rest-api|REST API 설계]], 상태를 유지하는 방법은 [[cookie-session|쿠키와 세션]]을 참고한다.

## 핵심 정리

- 요청 = Request Line + Headers + 빈 줄 + Body, 응답 = Status Line + Headers + 빈 줄 + Body.
- HTTP는 Stateless다. 상태는 쿠키·세션·토큰으로 따로 유지한다.
- 상태 코드 앞자리: 1 정보, 2 성공, 3 리다이렉트, 4 클라이언트 잘못, 5 서버 잘못.
- URI ⊃ URL(위치), URN(이름).
- HTTP/1.1·HTTP/2는 TCP 위에서, HTTP/3는 UDP 기반 QUIC 위에서 동작한다.
