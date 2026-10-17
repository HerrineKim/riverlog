---
title: "서드파티 쿠키와 브라우저 추적 방지"
concept: "Tracking Protection"
summary: "사파리 ITP와 파이어폭스 Total Cookie Protection은 서드파티 쿠키를 막거나 사이트별로 분할하고, 크롬은 단계적 폐지를 철회해 일반 창에서는 사용자 설정에 맡긴 뒤 Privacy Sandbox API 대부분을 정리했다. 브라우저를 가리지 않고 동작하려면 임베드 상태는 CHIPS(Partitioned)로, 꼭 필요한 교차 사이트 접근은 Storage Access API로 처리한다."
tags: ["privacy", "browser", "http", "web", "security"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/privacy/third-parties", "https://privacysandbox.google.com/blog/privacy-sandbox-next-steps", "https://privacysandbox.google.com/blog/update-on-plans-for-privacy-sandbox-technologies", "https://webkit.org/tracking-prevention/", "https://developer.mozilla.org/en-US/docs/Web/Privacy/Guides/State_Partitioning", "https://developer.mozilla.org/en-US/docs/Web/Privacy/Guides/Privacy_sandbox/Partitioned_cookies", "https://developer.mozilla.org/en-US/docs/Web/API/Storage_Access_API"]
---

> web.dev의 「[Learn Privacy](https://web.dev/learn/privacy)」 강좌의 서드파티 모듈을 뼈대로, 크롬 정책은 Privacy Sandbox 공식 발표(2025.04·2025.10)로, 사파리·파이어폭스 동작은 WebKit 문서와 MDN으로 확인해 재구성한 노트다.

## 왜 브라우저가 막나

서드파티 쿠키는 광고·로그인·사기 탐지에도 쓰이지만, 한 도메인이 여러 사이트에 심은 ID로 사용자를 따라다니는 **사이트 간 추적**의 기본 도구다. 브라우저는 정당한 사용과 추적을 구별할 수 없으므로, 쿠키·저장소를 막거나 **최상위 사이트별로 분할(partitioning)** 하는 쪽을 택했다. 분할하면 같은 위젯이라도 `a.example` 안과 `b.example` 안에서 서로 다른 저장소를 보므로 사용자를 이을 수 없다.

```text
분할 없음:  widget.example 쿠키 1개 ── a.example 안에서도, b.example 안에서도 같은 값 → 추적 가능
분할:       (a.example, widget.example) 쿠키 / (b.example, widget.example) 쿠키 → 서로 못 봄
```

이 차단은 사이트가 고를 수 없는 **브라우저 정책**이다. 서드파티 의존성이 막혀 초기화가 끝나지 않는 식으로 페이지가 깨질 수 있다.

## 브라우저별 현재 정책

| 브라우저 | 서드파티 쿠키 | 저장소·기타 | 디버깅 |
| --- | --- | --- | --- |
| 사파리 (ITP) | **예외 없이 기본 차단** | 서드파티 localStorage·IndexedDB·서비스 워커·HTTP 캐시를 최상위 사이트별로 분할 | 개발자 메뉴의 ITP 디버그 모드 |
| 파이어폭스 (ETP + Total Cookie Protection) | 기본으로 **사이트별 분할**(Firefox 103부터). 추적기로 분류된 도메인은 차단 | 저장소·네트워크 상태(HTTP 캐시, DNS, HSTS, 연결 풀 등)도 분할 | `about:protections`, 콘솔 메시지 |
| 크롬 | **일반 창은 사용자 설정에 맡긴다**(기본 허용, 설정에서 차단 가능). 시크릿 창은 기본 차단 | 쿠키 분할은 CHIPS로 사이트가 선택 | DevTools Application > 쿠키, Issues 패널 |
| 엣지 | 기본 허용. 추적 방지(Tracking Prevention)가 알려진 추적기를 막는다 | — | — |

시크릿·비공개 모드는 기본값이 더 엄격하고, 쿠키를 막으면 `localStorage`까지 막히기도 한다.

### 사파리 ITP의 세부 규칙

ITP(Intelligent Tracking Prevention)는 쿠키 차단 말고도 퍼스트파티 쪽 우회 수법을 함께 줄인다.

| 규칙 | 내용 |
| --- | --- |
| 스크립트로 쓴 저장소 7일 제한 | JS로 만든 쿠키, localStorage, IndexedDB, sessionStorage, 서비스 워커 등록·캐시는 그 사이트와 **7일간 상호작용이 없으면 삭제**된다 |
| 링크 장식(link decoration) | 클릭 ID가 붙은 URL로 들어와 JS가 그 값을 쿠키로 저장하면 만료가 24시간으로 줄어든다 |
| CNAME·IP 위장 | 서드파티 서버를 퍼스트파티 서브도메인처럼 꾸며 HTTP로 심은 쿠키는 만료가 7일로 줄어든다 |
| Referer 축소 | 서드파티로 가는 `Referer`와 `document.referrer`를 출처(origin)만 남긴다 |

**서버가 `Set-Cookie`로 심은 `HttpOnly` 퍼스트파티 쿠키**가 로그인 상태를 가장 오래 안정적으로 유지한다. 클라이언트 저장소의 7일 제한은 [[web-storage|Web Storage]]에도 영향을 준다.

## 크롬: 폐지 철회와 Privacy Sandbox 정리

크롬은 2020년부터 서드파티 쿠키를 없애고 대체 API(Privacy Sandbox)를 내놓겠다고 했지만 방향을 바꿨다.

| 시점 | 결정 |
| --- | --- |
| 2024년 | 쿠키를 없애는 대신 사용자가 선택하는 방식으로 전환 |
| 2025년 4월 | 별도 선택 프롬프트도 내놓지 않고, **기존 설정(개인정보 및 보안)에서 사용자가 고르는 방식을 유지**. 시크릿 창은 이미 기본 차단 |
| 2025년 10월 | 채택이 저조한 Privacy Sandbox 기술 대부분을 **은퇴**시키고, 널리 쓰이는 것만 유지 |

| 은퇴 | 유지 |
| --- | --- |
| Topics, Protected Audience(옛 FLEDGE), Attribution Reporting API, Private Aggregation·Shared Storage, SelectURL, Related Website Sets(`requestStorageAccessFor` 포함), IP Protection, Android의 SDK Runtime 등 | **CHIPS**, **FedCM**(쿠키 없는 연합 로그인), **Private State Tokens**(옛 Trust Tokens, 사기 방지). 측정은 W3C의 상호운용 Attribution 표준 작업으로 이어 간다 |

그래서 "크롬에서는 서드파티 쿠키가 곧 사라진다"는 더는 사실이 아니다. 하지만 사파리·파이어폭스와 크롬 시크릿 창, 그리고 쿠키를 끈 크롬 사용자에게는 이미 막혀 있다. **서드파티 쿠키 없이 동작하는 설계가 여전히 기본값이다.**

## 대응 1: CHIPS (Partitioned 쿠키)

임베드가 **그 사이트 안에서만** 상태를 유지하면 되는 경우(채팅 위젯, 지도 설정, 임베드 결제 세션)에 쓴다. 쿠키에 `Partitioned`를 붙이면 최상위 사이트별 저장소에 따로 담긴다.

```http
Set-Cookie: __Host-widget_sid=34d8g; Secure; Path=/; SameSite=None; Partitioned
```

- 키는 **(최상위 사이트, 쿠키를 심은 호스트)** 쌍이다. 같은 위젯이 다른 사이트에 실리면 그 쿠키를 읽지 못한다.
- `Secure`가 필수다. 서브도메인끼리 공유할 필요가 없으면 `__Host-` 접두사를 붙인다. 교차 사이트 요청에 실려야 하므로 `SameSite=None`도 함께 준다.
- 같은 최상위 사이트의 서브도메인(`shop.example`, `support.shop.example`) 안에서는 계속 읽힌다.
- **Baseline 2025**다. 오래된 브라우저에서는 일반 쿠키처럼 다뤄지거나 무시될 수 있으므로 중요한 상태의 유일한 저장소로 삼지 않는다. 파이어폭스는 원래 서드파티 쿠키를 분할하지만, 브라우저 간 일관성을 위해 명시적으로 `Partitioned`를 쓰는 편이 낫다.

## 대응 2: Storage Access API

임베드가 **분할되지 않은 자기 쿠키**가 꼭 필요한 경우(다른 사이트에 실린 댓글·결제 위젯에서 기존 로그인 사용)에 쓴다. 사용자 동작을 받아 브라우저에 접근을 요청한다.

```javascript
// 교차 사이트 iframe 안에서
if (!(await document.hasStorageAccess())) {
  button.addEventListener('click', async () => {
    try {
      await document.requestStorageAccess() // 클릭 같은 사용자 활성화가 필요
      location.reload()                      // 허용되면 쿠키를 싣도록 다시 불러온다
    } catch {
      showSignInPopup()                      // 거부되면 대체 흐름
    }
  })
}
```

| 항목 | 내용 |
| --- | --- |
| 사용자 활성화 | `requestStorageAccess()`는 탭·클릭 직후에만 호출된다. 이미 허용된 쌍이면 바로 풀린다 |
| 허용 기간 | 크롬·파이어폭스·사파리 모두 대략 30일 단위로 만료되고, 상호작용하면 연장된다 |
| 브라우저 차이 | 사파리는 아직 허용 안 된 임베드마다 묻는다. 파이어폭스는 여러 사이트에서 요청한 출처에만 묻는다. 크롬은 쿠키가 `SameSite=None; Secure`여야 한다 |
| sandbox iframe | `sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin"`이 있어야 요청할 수 있다 |
| 정책으로 막기 | `Permissions-Policy: storage-access=()`로 내 페이지의 iframe이 요청하지 못하게 한다 |

사파리 ITP에서는 허용받은 도메인이 30일간 데이터 삭제에서 보호되기도 한다. 크롬의 Related Website Sets와 `requestStorageAccessFor()`는 은퇴 대상이므로 새로 쓰지 않는다.

## 설계 원칙

| 필요 | 쓸 것 |
| --- | --- |
| 내 사이트의 로그인·장바구니 | 퍼스트파티 `HttpOnly; Secure; SameSite=Lax` 쿠키([[cookie-session\|쿠키와 세션]]) |
| 임베드 안의 사이트별 상태 | CHIPS(`Partitioned`) |
| 임베드에서 기존 로그인 쓰기 | Storage Access API, 안 되면 팝업 로그인 |
| 다른 사이트 계정으로 로그인 | OAuth·OIDC 리다이렉트([[oauth2\|OAuth 2.0]]), 크롬 계열에서는 FedCM도 |
| 광고 측정·사이트 간 프로필 | 브라우저가 막는 방향이다. 데이터를 덜 모으는 설계로 바꾼다([[privacy-data-minimization\|데이터 최소화]]) |

쿠키를 막으면 추적자는 쿠키 없는 식별, 즉 [[browser-fingerprinting|지문 채취]]로 옮겨 간다. 브라우저는 그것도 줄이고 있다.

## 정리

- 사파리는 서드파티 쿠키를 예외 없이 막고, 파이어폭스는 사이트별로 분할한다.
- 크롬은 폐지를 철회하고 사용자 설정에 맡기며, Privacy Sandbox는 CHIPS·FedCM·Private State Tokens만 남기고 정리했다.
- 임베드 상태는 `Partitioned`, 분할 안 된 쿠키가 꼭 필요하면 Storage Access API.
- 서드파티 쿠키에 기대는 로그인·결제 흐름은 어느 브라우저에서든 깨질 수 있다고 보고 설계한다.

관련 노트: [[cookie-session|쿠키와 세션]], [[web-storage|Web Storage: localStorage와 sessionStorage]], [[third-party-privacy|서드파티와 프라이버시]], [[browser-fingerprinting|브라우저 지문 채취]], [[oauth2|OAuth 2.0]], [[devtools-application|DevTools Application 패널]]
