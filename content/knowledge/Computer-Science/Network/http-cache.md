---
title: "HTTP 캐시"
concept: "HTTP Cache"
summary: "Cache-Control, ETag·Last-Modified로 브라우저와 CDN이 응답을 재사용하는 HTTP 캐시. 신선도와 재검증, 자주 쓰는 지시어, 자산별 캐시 전략을 정리한다."
tags: ["network", "http", "cache", "browser", "frontend"]
source: mixed
date: "2026-10-21"
sources: ["https://mingrammer.com/translation-the-hidden-components-of-web-caching/", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching", "https://web.dev/articles/http-cache", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC/%EC%BA%90%EC%8B%9C%20%EA%B2%80%EC%A6%9D%20%ED%97%A4%EB%8D%94%EC%99%80%20%EC%A1%B0%EA%B1%B4%EB%B6%80%20%EC%9A%94%EC%B2%AD.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC/%EC%BA%90%EC%8B%9C%20%EB%AC%B4%ED%9A%A8%ED%99%94.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC/%EB%A9%94%EB%AA%A8%EB%A6%AC%20%EC%BA%90%EC%8B%9C%2C%20%EB%94%94%EC%8A%A4%ED%81%AC%20%EC%BA%90%EC%8B%9C.md"]
---

> 브라우저의 메모리·디스크 캐시, ETag가 필요한 이유, `must-revalidate`·`Pragma`는 「[Frontend_TIL: 캐시 검증 헤더와 조건부 요청](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC/%EC%BA%90%EC%8B%9C%20%EA%B2%80%EC%A6%9D%20%ED%97%A4%EB%8D%94%EC%99%80%20%EC%A1%B0%EA%B1%B4%EB%B6%80%20%EC%9A%94%EC%B2%AD.md)」, 「[캐시 무효화](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC/%EC%BA%90%EC%8B%9C%20%EB%AC%B4%ED%9A%A8%ED%99%94.md)」, 「[메모리 캐시, 디스크 캐시](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC/%EB%A9%94%EB%AA%A8%EB%A6%AC%20%EC%BA%90%EC%8B%9C%2C%20%EB%94%94%EC%8A%A4%ED%81%AC%20%EC%BA%90%EC%8B%9C.md)」을 바탕으로 보강했다.
> 캐시가 놓이는 위치는 「[웹 캐싱의 숨겨진 요소들](https://mingrammer.com/translation-the-hidden-components-of-web-caching/)」(번역)을 바탕으로 보강했다. 신선도 규칙·Vary·새로고침·삭제는 MDN의 「[HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching)」과 web.dev의 「[Prevent unnecessary network requests with the HTTP Cache](https://web.dev/articles/http-cache)」를 바탕으로 보강했다.

## HTTP 캐시란

HTTP 캐시는 **한 번 받은 응답을 저장해 두었다가 같은 요청에 재사용하는 것**이다. 네트워크 왕복을 아예 없애거나(신선한 캐시), 본문 전송만 생략한다(재검증). 캐시는 브라우저(private cache)와 CDN·프록시(shared cache) 두 곳에 생긴다.

### 캐시가 놓이는 곳

요청이 사용자에서 원본 서버까지 가는 길목마다 캐시가 있을 수 있다.

| 위치 | 예 | HTTP 헤더를 따르나 |
| --- | --- | --- |
| 브라우저 캐시 | 메모리·디스크 캐시, 서비스 워커 캐시 | 브라우저 HTTP 캐시는 따른다. 서비스 워커 캐시는 코드가 정한다 |
| 포워드 프록시 | 회사·ISP 프록시 | 공유 캐시라 `private` 응답은 저장하지 않는다 |
| 엣지(CDN) | 사용자 가까운 PoP | `s-maxage`, `CDN-Cache-Control` 같은 공유 캐시용 지시어와 CDN 설정 |
| 리버스 프록시·게이트웨이 | Nginx, Varnish | 서버 앞에서 응답을 저장. 설정이 헤더보다 우선할 수 있다 |
| 애플리케이션 응답 캐시 | 서버 메모리, Redis | HTTP와 무관. 애플리케이션이 직접 무효화한다 |

브라우저 캐시는 다시 두 층이다. DevTools Network 패널의 Size 열에 `(memory cache)`·`(disk cache)`로 구분해 보인다.

| 층 | 위치·수명 | 특징 |
| --- | --- | --- |
| 메모리 캐시 | 렌더러 프로세스 메모리. 탭(문서)이 살아 있는 동안만 | 문서를 파싱하는 스레드에서 바로 꺼내 쓰므로 거의 즉시다. 같은 페이지 안에서 다시 쓰는 이미지·스크립트, 프리로드한 자원이 주로 여기서 나온다 |
| 디스크 캐시 | 브라우저의 HTTP 캐시(네트워크 서비스가 관리). 브라우저를 껐다 켜도 남는다 | 다른 스레드·프로세스에 요청해 디스크에서 읽으므로 메모리보다 느리다. `Cache-Control` 규칙을 따르는 곳이 여기다. 시크릿 창에서는 디스크 대신 메모리에 두고 창을 닫으면 지운다 |

어느 층에 둘지는 브라우저가 정하고 개발자가 고를 수 없다. 개발자가 다루는 것은 아래 헤더로 정하는 **재사용 여부와 기간**이다.

앞쪽 캐시가 맞을수록 왕복 시간(RTT), 서버 부하, 대역폭 비용이 함께 준다. 반대로 층이 많을수록 **무효화**가 어렵다. 배포 뒤 옛 응답이 남았다면 어느 층의 캐시인지부터 가린다. CDN은 [[cdn|CDN]], 프록시는 [[proxy|프록시]], 서버 쪽 캐시는 [[caching-strategies|캐싱 전략]]에 있다.

어떻게 캐시할지는 **서버가 응답 헤더로 정한다.** 프론트엔드 개발자는 이 헤더를 읽고 배포 설정에서 고칠 수 있어야 한다.

## 두 단계: 신선도와 재검증

```text
요청 ─▶ 캐시에 있음?
          ├─ 없음 ─────────────────────────▶ 서버에서 받기 (200)
          └─ 있음 ─▶ 아직 신선? (max-age 이내)
                      ├─ 예 ─▶ 서버에 묻지 않고 바로 사용
                      └─ 아니오 ─▶ 조건부 요청으로 재검증
                                   ├─ 안 바뀜 ─▶ 304 Not Modified (본문 없음)
                                   └─ 바뀜   ─▶ 200 + 새 본문
```

### 신선도는 어떻게 정해지나

| 개념 | 내용 |
| --- | --- |
| 나이(age) | 응답이 원 서버에서 만들어진 뒤 지난 시간. 공유 캐시는 `Age: 86400`처럼 알려 주고, 브라우저는 `max-age - Age`만큼만 신선하게 본다 |
| `Expires` | HTTP/1.0의 만료 시각 지정. 날짜 파싱 버그와 시계 차이 문제가 있어 `max-age`가 대신한다. 둘 다 있으면 `max-age`가 이긴다 |
| 휴리스틱 캐시 | `Cache-Control`이 없어도 `Last-Modified`가 있으면 캐시가 알아서 신선도를 정한다. 명세 권고는 「마지막 수정 후 지난 시간의 10%」다. 1년 전에 수정된 파일이면 약 36일 동안 서버에 묻지 않는다. **의도치 않은 캐시를 막으려면 모든 응답에 `Cache-Control`을 명시한다** |

### 재검증 헤더

| 응답 헤더 | 다음 요청에 붙는 헤더 | 비교 기준 |
| --- | --- | --- |
| `ETag: "abc123"` | `If-None-Match: "abc123"` | 내용의 식별값 (정확) |
| `Last-Modified: <날짜>` | `If-Modified-Since: <날짜>` | 수정 시각 (초 단위) |

`Last-Modified`는 날짜라서 한계가 있다. 1초 안에 두 번 바뀌면 구분하지 못하고, 내용이 같아도 파일을 다시 저장하면 날짜가 바뀌어 전체를 다시 받는다. `ETag`는 서버가 붙이는 **버전 이름**(보통 내용 해시)이라 내용이 같으면 같은 값을 준다. 서버가 값을 정하므로 「주석·공백만 바뀐 배포에서는 ETag를 유지한다」, 「배포 주기에 맞춰 한꺼번에 갱신한다」처럼 **캐시 정책을 서버가 통제**할 수도 있다. 둘 다 있으면 `If-None-Match`가 우선한다. 어느 쪽이든 안 바뀌었으면 서버는 본문 없이 `304`와 갱신된 헤더(`Cache-Control`, `ETag`)만 보내고, 브라우저는 저장된 본문을 다시 쓰며 신선도 시간을 새로 센다.

## Cache-Control 지시어

| 지시어 | 의미 |
| --- | --- |
| `max-age=N` | N초 동안 신선하다. 그동안은 서버에 묻지 않는다 |
| `s-maxage=N` | CDN 같은 공유 캐시에만 적용되는 max-age |
| `no-cache` | 저장은 하되, **쓸 때마다 재검증**하라 (캐시 금지가 아니다) |
| `no-store` | 아예 저장하지 마라. 민감한 데이터용 |
| `private` / `public` | 브라우저에만 / 공유 캐시에도 저장 가능 |
| `immutable` | 신선한 동안은 새로고침해도 재검증하지 마라 |
| `stale-while-revalidate=N` | 만료 후 N초 동안은 낡은 응답을 먼저 주고 뒤에서 갱신 |
| `must-revalidate` | 낡은 응답을 재검증 없이 쓰지 못하게 한다. 캐시는 원 서버에 닿지 않을 때 오류 대신 낡은 응답을 내주기도 하는데, 이 지시어가 있으면 그 대신 **`504 Gateway Timeout`** 을 돌려준다. 잔액·결제처럼 낡은 값을 보여 주느니 실패하는 편이 나은 데이터에 쓴다. 신선한 동안은 그대로 캐시를 쓴다는 점이 `no-cache`와 다르다 |

**`no-cache`와 `no-store`를 헷갈리기 쉽다.** 이름과 달리 `no-cache`는 캐시한다.

`Pragma: no-cache`는 HTTP/1.0 시절의 캐시 금지 헤더다. `Cache-Control`이 있으면 무시되므로 새로 쓸 일은 없다. 과거에는 민감한 페이지에 `Cache-Control: no-cache, no-store, must-revalidate`와 `Pragma: no-cache`를 함께 붙였지만, 지금은 `no-store` 하나로 충분하다.

## 캐시 키와 Vary

캐시는 기본적으로 **URL로 응답을 구분**한다. 같은 URL이라도 `Accept-Language`, `Accept-Encoding`, `Accept`에 따라 본문이 다르면(콘텐츠 협상) 응답에 `Vary`를 붙여 그 요청 헤더까지 캐시 키에 넣게 한다.

```http
Vary: Accept-Encoding, Accept-Language
```

`Vary: Cookie`나 `Vary: User-Agent`처럼 값이 사용자마다 다른 헤더를 넣으면 사실상 캐시가 안 된다. 사용자별 응답은 `Vary`로 쪼개지 말고 `private`으로 보낸다. `Authorization` 헤더가 붙은 요청의 응답은 `public`이나 `s-maxage`를 명시하지 않는 한 공유 캐시에 저장되지 않는다.

## 자산별 전략

| 자산 | 권장 헤더 | 이유 |
| --- | --- | --- |
| 해시 붙은 JS·CSS·이미지 | `public, max-age=31536000, immutable` | 내용이 바뀌면 URL이 바뀌므로 영원히 캐시해도 된다 |
| HTML | `no-cache` (또는 짧은 max-age) | URL이 고정이라 새 배포를 바로 받아야 한다 |
| 공개 API 응답 | `s-maxage=60, stale-while-revalidate=300` | CDN에서 짧게 캐시해 부하를 줄인다 |
| 로그인 사용자 데이터 | `private, no-store` | 다른 사용자에게 섞이면 안 된다 |

## 새로고침, 무효화, 흔한 문제

| 동작 | 브라우저가 보내는 요청 | `fetch()`로 같은 동작 |
| --- | --- | --- |
| 새로고침 | `Cache-Control: max-age=0` + 조건부 헤더 → 대개 `304` | `fetch(url, { cache: "no-cache" })` |
| 강력 새로고침 | `Cache-Control: no-cache`(+`Pragma: no-cache`), 조건부 헤더 없음 → 항상 `200` | `fetch(url, { cache: "reload" })` |

- 새로고침해도 하위 자원까지 다시 확인하지 않게 하려면 `immutable`을 쓴다. Chrome은 이 지시어 대신 새로고침 때 하위 자원을 재검증하지 않도록 구현을 바꿨다.
- **긴 `max-age`로 이미 저장된 응답은 서버가 지울 방법이 없다.** 요청이 서버까지 오지 않기 때문이다. `Clear-Site-Data: "cache"`는 그 사이트의 브라우저 캐시만 지우고 CDN·프록시에는 효과가 없다(CDN은 퍼지 API로 지운다). 그래서 자주 바뀌는 URL은 `no-cache`로 서버가 통제권을 쥐고, 길게 캐시할 파일은 **URL에 해시·버전을 넣는 캐시 무효화(cache busting)** 로 바꾼다. 쿼리(`?v=123`)보다 파일 이름(`bundle.3f2a1c.js`)에 넣는 편이 일부 캐시가 쿼리를 무시하는 문제를 피한다.
- 공유 캐시는 같은 요청이 동시에 몰리면 원 서버에 하나만 보내고 결과를 나눠 준다(요청 병합, request collapse). 이때 `no-cache` 응답도 동시 요청끼리는 재사용되므로, 개인화된 응답은 반드시 `private`으로 표시한다.
- **배포했는데 옛 화면이 보인다**: HTML이 길게 캐시되어 옛 번들을 가리키는 경우가 많다. HTML 캐시 헤더부터 확인한다.
- 캐시에서 왔는지, 헤더가 의도대로인지는 DevTools Network 패널로 확인한다: [[devtools-network|DevTools Network 패널]].

## 정리

- 신선하면 서버에 묻지 않고, 만료되면 ETag·Last-Modified로 재검증한다.
- 정책은 `Cache-Control` 하나에 거의 다 담긴다.
- `no-cache`는 "매번 확인", `no-store`는 "저장 금지"다.
- **해시 파일은 1년 + immutable, HTML은 매번 재검증**이 기본이다.
- 이미 저장된 응답은 서버가 지울 수 없다. 바꿔야 할 파일은 URL을 바꾸고, 콘텐츠 협상을 하면 `Vary`를 붙인다.

관련 노트: [[cdn|CDN]], [[Computer-Science/Network/http|HTTP 프로토콜]], [[swr|SWR]], [[cache-and-virtual-memory|캐시 메모리와 MMU]], [[cache-cluster-operations|캐시 클러스터 운영과 장애 대응]], [[image-cdn|이미지 CDN과 Accept 헤더 협상]], [[media-processing-pipeline|이미지·동영상 처리 서버 설계]]
