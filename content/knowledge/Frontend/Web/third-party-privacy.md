---
title: "서드파티와 프라이버시: 감사와 Referrer·Permissions 정책"
concept: "Third-party Privacy"
summary: "광고·임베드·분석·스크립트·패키지 같은 서드파티는 IP·Referer·쿠키를 받고, 스크립트는 페이지 전체 권한을 가진다. 기술·비기술 감사로 실제 요청을 파악하고, 정적 공유 링크·퍼사드·nocookie 임베드로 줄이며, Referrer-Policy·Permissions-Policy·CSP Report-Only로 범위를 묶는다."
tags: ["privacy", "security", "web", "http", "browser"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/privacy/third-parties", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-GPC"]
---

> web.dev의 「[Learn Privacy](https://web.dev/learn/privacy)」 강좌의 서드파티 모듈을 바탕으로, 헤더 기본값과 지원 범위는 MDN으로 확인해 재구성한 노트다.

## 서드파티란

**서드파티(third party)** 는 사이트 운영자가 아닌 누군가가 만들고 통제하는 콘텐츠다. 광고, 지도·동영상 임베드, 웹 폰트, 오류 추적·분석 스크립트, 결제 위젯이 모두 해당한다. 대부분의 웹사이트가 하나 이상 싣는다.

프라이버시 관점에서 핵심은 **누가 작성했나**다. 같은 CDN에서 오더라도 내가 쓴 코드는 퍼스트파티이고, 남이 쓴 스크립트는 서드파티다. 쿠키가 퍼스트파티인지 서드파티인지도 쿠키 자체가 아니라 **어느 페이지 맥락에서 실렸나**로 정해진다([[cookie-session|쿠키와 세션]]).

## 서드파티가 받는 것

모든 요청에는 사용자의 **IP 주소, `Referer`(보던 페이지 URL), 그 도메인의 쿠키**가 실린다. 그래서 서드파티는 고유 ID 쿠키를 한 번 심으면 자기 리소스를 실은 모든 사이트에서 같은 사용자를 알아본다. 이것이 **사이트 간 추적(cross-site tracking)** 이다.

| 포함 방식 | 예 | 노출되는 것 |
| --- | --- | --- |
| 교차 사이트 리소스 | `<img>`, `<video>`, 웹 폰트 | 쿠키, IP, Referer |
| 교차 사이트 iframe | 지도·동영상·결제 임베드 | 위 + 프레임이 요청하는 브라우저 API(Permissions-Policy가 통제) |
| 교차 사이트 `<script>` | 분석, 태그 매니저, 채팅 위젯 | **페이지 전체**: 퍼스트파티 변수·쿠키·DOM, 내 백엔드로 `fetch()` |
| 의존성 패키지 | npm·PyPI 라이브러리 | 내 코드와 같은 권한 |

- 서버 쪽에도 서드파티가 있다. 로그 수집 서비스, 외부 DB, 라이브러리가 사용자 데이터를 밖으로 보낼 수 있으므로 나가는 트래픽을 기록하고 예상 밖 목적지는 막는다.
- 스크립트는 신뢰 경계 안에서 돈다. 로고·파비콘·jQuery·태그 매니저·CSS에 결제 정보 탈취 코드(web skimmer)를 숨긴 사례가 있다.
- 사용자는 서드파티 기능을 내 서비스의 일부로 본다. 서드파티가 데이터를 오용하거나 유출하면 신뢰를 잃는 쪽은 나다.

**위협은 두 가지다.** 민감 정보 노출, 그리고 민감 정보가 없어도 사용자가 원치 않게 사이트를 넘어 알아보이는 것.

## 감사하기

서드파티마다 쓸모와 침해 정도를 저울질한다. "개발팀이 편하다"는 개발자 경험이지 사용자 경험이 아니다.

### 비기술 감사

- 공급사의 개인정보 처리방침을 읽는다. 모호한 표현, 보존·삭제 기한이 없는 곳을 표시한다.
- 계약한 서드파티(광고 네트워크, 임베드) 목록을 기술 감사 결과와 대조해 법무 검토에 넘긴다.

### 기술 감사

1. 개발·테스트 환경이 아니라 **배포된 실제 사이트**를 본다.
2. 새 브라우저 프로필(안 되면 시크릿·비공개 창)로 시작하고, 시험마다 버린다.
3. 가입, 탈퇴, 공유·결제·임베드처럼 서드파티가 끼는 동작을 해 본다.
4. DevTools Network 패널에 도메인 열을 켜고 서드파티 요청만 거른다([[devtools-network|DevTools Network 패널]]). 서드파티가 또 다른 서드파티를 부르는 **연쇄**도 따라간다.
5. 요청을 HAR 파일로 내보내 보관한다(Chrome·Safari는 Network 패널의 내보내기, Firefox는 톱니 > Save All As HAR).
6. 계약 목록과 실제 요청을 비교한다. 안 보이는 요청은 지역·기기·로그인 상태에 따라 다를 수 있다.

## 덜 침해하는 통합 패턴

| 대상 | 방법 | 대가 |
| --- | --- | --- |
| 소셜 공유 버튼 | 위젯 대신 공유 URL로 가는 평범한 링크. 사용자가 누를 때만 그 사이트와 통신한다 | 공유 수 표시·일부 분석을 잃는다 |
| 동영상 임베드 | YouTube는 `www.youtube-nocookie.com`(개인정보 보호 강화 모드). 썸네일만 보여 주고 클릭 때 iframe을 싣는 **퍼사드**([[lazy-loading\|지연 로딩: 이미지·iframe·퍼사드]]). 제목·썸네일은 oEmbed로 가져온다 | 클릭 한 번이 더 든다 |
| 분석 | 답할 질문을 먼저 정하고 그만큼만 모은다. 제공자 설정에서 보존 기간 단축·IP 익명화를 켜고 감사를 다시 돌려 확인한다. 자체 호스팅(Matomo 등)은 데이터가 밖으로 나가지 않지만 보관 책임을 진다 | 설정·운영 부담 |

```html
<a href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fexample.com"
   target="_blank" rel="noopener">Facebook에 공유</a>
```

## 헤더로 범위 묶기

### Referrer-Policy: URL을 덜 흘리기

`Referer`에는 경로와 쿼리까지 실린다. 검색어·주문 번호·토큰이 URL에 있으면 서드파티로 샌다.

| 값 | 같은 출처 | 교차 출처(HTTPS→HTTPS) | HTTPS→HTTP |
| --- | --- | --- | --- |
| `strict-origin-when-cross-origin` (기본값) | 전체 URL | 출처만 | 없음 |
| `same-origin` | 전체 URL | 없음 | 없음 |
| `strict-origin` | 출처만 | 출처만 | 없음 |
| `no-referrer` | 없음 | 없음 | 없음 |
| `unsafe-url` | 전체 URL | 전체 URL | 전체 URL — 쓰지 않는다 |

- 정책을 지정하지 않으면 `strict-origin-when-cross-origin`이 적용된다. 그래도 기본값에 기대지 말고 **명시**한다. 서드파티에 아무것도 주지 않으려면 `same-origin`이나 `no-referrer`.
- 지정 방법은 세 가지다: 응답 헤더 `Referrer-Policy`, `<meta name="referrer" content="...">`, 요소별 `referrerpolicy` 속성(`<a>`, `<img>`, `<script>`, `<iframe>`).
- 헤더에는 대체 목록을 쓸 수 있다. `Referrer-Policy: no-referrer, strict-origin-when-cross-origin`은 뒤의 값을 모르는 브라우저에서만 앞의 값을 쓴다.
- 받는 쪽에서 `document.referrer`가 비는 이유도 대개 이 정책이다([[previous-url|이전 페이지 URL 알아내기]]).

### Permissions-Policy: 강력한 기능을 끄기

카메라·마이크·위치·센서·USB·전체 화면 같은 기능을 **페이지와 그 안의 iframe**이 쓸 수 있는지 정한다. 서드파티가 몰래 권한을 요청하는 침해를 막는다.

```http
Permissions-Policy: geolocation=(self "https://maps.example"), camera=(), microphone=(), fullscreen=*
```

- 기능은 쉼표로 나누고, 허용 목록은 괄호로 감싼다. `()`는 모두 금지, `self`는 같은 출처, `*`는 모두 허용. CSP처럼 세미콜론을 쓰지 않는다.
- **기본 거부 후 필요한 것만 연다.** iframe은 강력한 기능이 기본으로 막혀 있지만 최상위 페이지는 그렇지 않다. 최상위에도 제한적인 정책을 건다.
- iframe에는 `allow` 속성으로 개별 허용한다: `<iframe src="..." allow="fullscreen">`.

### CSP Report-Only: 지속 감사

CSP는 XSS 방어용이지만([[web-security|웹 보안: CSRF와 XSS]]) 서드파티 감시에도 쓴다. `Content-Security-Policy-Report-Only`는 아무것도 막지 않고, 정책을 벗어난 요청을 보고만 한다.

```http
Content-Security-Policy-Report-Only: default-src 'self' https://expected.example; report-uri https://reports.example/csp
```

- 예상하지 못한 도메인이 나타나면 보고서로 알 수 있다. 무엇이 전송됐는지는 알려 주지 않는다.
- 모든 응답에 붙이면 보고가 넘치므로 일부 페이지·일부 요청에만 표본으로 붙인다.
- 실제 차단으로 바꿀 때는 서드파티가 부르는 의존성이 막혀 페이지가 깨질 수 있음을 대비한다.

## 사용자 신호: Global Privacy Control

**GPC(Global Privacy Control)** 는 "내 정보를 서드파티에 팔거나 공유하지 말라"는 사용자 신호다. 요청 헤더 `Sec-GPC: 1`과 `navigator.globalPrivacyControl`로 전달된다. 일부 브라우저만 지원해 Baseline이 아니다. 과거의 `DNT`(Do Not Track)는 강제력이 없어 사실상 버려졌고, GPC는 일부 지역 법에서 유효한 거부 의사로 다뤄진다는 점이 다르다. 신호가 오면 서드파티 공유를 끄는 서버 로직을 둔다.

## 정리

- 서드파티는 요청마다 IP·Referer·쿠키를 받고, `<script>`로 실리면 페이지 전체 권한을 갖는다.
- 계약 목록과 실제 네트워크 요청을 대조하는 감사를 배포 환경에서 반복한다.
- 위젯 대신 링크, iframe 대신 퍼사드, 전체 수집 대신 필요한 질문만.
- `Referrer-Policy`는 명시하고, `Permissions-Policy`는 기본 거부, `CSP-Report-Only`로 새 도메인을 감시한다.
- 브라우저 자체의 차단 정책은 [[browser-tracking-protection|서드파티 쿠키와 브라우저 추적 방지]]에 있다.

관련 노트: [[browser-tracking-protection|서드파티 쿠키와 브라우저 추적 방지]], [[privacy-data-minimization|데이터 최소화와 프라이버시 실천]], [[browser-fingerprinting|브라우저 지문 채취]], [[web-security|웹 보안: CSRF와 XSS]], [[lazy-loading|지연 로딩: 이미지·iframe·퍼사드]], [[devtools-network|DevTools Network 패널]]
