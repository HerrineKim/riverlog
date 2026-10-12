---
title: "HTTP 프로토콜"
concept: "HTTP"
summary: "웹 통신 규약 HTTP의 요청·응답 메시지 형식, 메서드, 상태 코드, 헤더 종류와 URI·URL·URN의 차이."
tags: ["network", "http", "web", "application-layer"]
source: notion
sources: ["https://app.notion.com/p/49200e54fe6d461ab1ebc5180b35337b"]
---

HTTP(HyperText Transfer Protocol)는 웹 통신을 위한 응용 계층 프로토콜이다. 이름은 HTML 문서 전송에서 왔지만, 이미지·JSON 등 웹 표준으로 정의된 여러 종류의 데이터를 주고받을 수 있다. 동작은 단순하게 **"요청하면 응답한다"**. 웹 서비스 관점의 기본 흐름은 [[http-web-architecture|HTTP와 웹 구조]]에도 정리되어 있다.

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

| 메서드 | 용도 |
| --- | --- |
| GET | 서버의 문서(리소스)를 읽을 때 |
| POST | 정보를 전송할 때 |
| PUT | 자원을 변경할 때 |
| DELETE | 문서를 제거할 때 |

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

## 핵심 정리

- 요청 = Request Line + Headers + 빈 줄 + Body, 응답 = Status Line + Headers + 빈 줄 + Body.
- 상태 코드 앞자리: 2 성공, 3 리다이렉트, 4 클라이언트 잘못, 5 서버 잘못.
- URI ⊃ URL(위치), URN(이름).
