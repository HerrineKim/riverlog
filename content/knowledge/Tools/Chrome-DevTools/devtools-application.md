---
title: "DevTools Application 패널: 저장소·서비스 워커"
concept: "Application Panel"
summary: "Application 패널은 매니페스트·서비스 워커·캐시 저장소(PWA), Local/Session Storage·IndexedDB·쿠키, 저장소 지우기, bfcache 테스트, 추측 규칙(prefetch·prerender) 디버깅, 프레임 보안 정보를 한곳에서 보고 고치는 곳이다. 무엇을 확인하려 할 때 어느 탭을 열고 무엇을 보는지 정리한다."
tags: ["devtools", "debugging", "browser", "storage", "frontend", "tools"]
source: other
date: "2026-10-15"
sources: ["https://developer.chrome.com/docs/devtools/application", "https://developer.chrome.com/docs/devtools/progressive-web-apps", "https://developer.chrome.com/docs/devtools/storage/localstorage", "https://developer.chrome.com/docs/devtools/storage/sessionstorage", "https://developer.chrome.com/docs/devtools/storage/indexeddb", "https://developer.chrome.com/docs/devtools/storage/cache", "https://developer.chrome.com/docs/devtools/storage/extensionstorage", "https://developer.chrome.com/docs/devtools/application/cookies", "https://developer.chrome.com/docs/devtools/application/back-forward-cache", "https://developer.chrome.com/docs/devtools/application/debugging-speculation-rules", "https://developer.chrome.com/docs/devtools/application/frames"]
---

> Chrome for Developers의 「[Chrome DevTools 문서](https://developer.chrome.com/docs/devtools?hl=ko)」를 바탕으로 재구성한 노트다.

## Application 패널이란

**Application 패널은 페이지가 브라우저에 남기는 것을 보는 곳이다.** 매니페스트와 서비스 워커, 저장소와 캐시, 백그라운드 서비스, 프레임 정보를 검사하고 고치고 지운다. 명령 메뉴(`Command+Shift+P` / `Control+Shift+P`)나 상단의 패널 더보기(`»`) 목록에서 연다.

| 섹션 | 들어 있는 것 |
| --- | --- |
| 애플리케이션 | 매니페스트, 서비스 워커, 저장소(사용량 차트·사이트 데이터 삭제) |
| 저장소 | Local/Session Storage, IndexedDB, 쿠키, 캐시 저장소, 공유 저장소, 확장 프로그램 저장소 등 |
| 백그라운드 서비스 | 뒤로/앞으로 캐시, 추측 로드, 백그라운드 가져오기·동기화, 알림·푸시 메시지, Reporting API 등 |
| 프레임 | 최상위 프레임·iframe 트리와 각 프레임의 보안·격리 정보 |

저장소 자체의 개념(쿠키 속성, 캐시 전략)은 [[cookie-session|쿠키와 세션]], [[pwa-service-worker|PWA와 서비스 워커 캐시 전략]]에서 다룬다. 이 노트는 그것을 DevTools로 확인하는 법이다.

## PWA 디버깅: 매니페스트·서비스 워커·캐시 저장소

### 매니페스트

애플리케이션 > 매니페스트는 `manifest.json`을 읽기 쉬운 형태로 보여 주고 오류·경고를 띄운다.

| 섹션 | 확인할 것 |
| --- | --- |
| ID 및 프레젠테이션 | 이름, 시작 URL, 표시 방식 등 매니페스트 필드 |
| 설치 가능성 | 아이콘을 못 불러오는 등 설치를 막는 오류 |
| 아이콘 | 등록한 아이콘 전부. **마스크 가능 아이콘의 최소 안전 영역만 표시**로 로고가 잘리지 않는지 본다 |
| 바로가기 #N, 스크린샷 #N | 앱 바로가기, 풍부한 설치 UI용 스크린샷 |
| 프로토콜 핸들러 | URL을 넣고 **프로토콜 테스트**로 `web+...` 핸들러 등록을 시험한다 |

설치 흐름은 주소 표시줄의 설치 버튼으로 시험하되, **콘솔 드로어를 열어 두면** 매니페스트 문제와 설치 수명 주기 로그가 찍힌다. 기기 모드로는 모바일의 「홈 화면에 추가」를 흉내 낼 수 없다. 실제 모바일 설치는 [[devtools-device-emulation|원격 디버깅]]으로 연결한 기기에서 확인한다.

### 서비스 워커

애플리케이션 > 서비스 워커가 서비스 워커 디버깅의 중심이다.

| 컨트롤 | 하는 일 |
| --- | --- |
| 오프라인 | 네트워크 패널의 오프라인과 같다. 오프라인 대응을 시험한다 |
| 다시 로드 시 업데이트 | 페이지를 열 때마다 서비스 워커를 새로 설치한다. 개발 중 「옛 워커가 계속 잡혀 있다」를 막는다 |
| 네트워크 우회 | 서비스 워커를 건너뛰고 네트워크로 바로 요청한다 |
| 네트워크 요청 | 워커가 가로챈 요청만(`is:service-worker-intercepted`) 네트워크 패널에서 본다 |
| 업데이트 / 등록 취소 | 한 번 업데이트하거나 등록을 해제한다 |
| 푸시 / 동기화 | 페이로드 없는 푸시, 백그라운드 동기화 이벤트를 흉내 낸다 |
| 시작 / 중지 | 워커를 강제로 멈춘다. **전역 변수에 상태가 남아 있다고 가정한 버그**는 중지 후 재시작에서 드러난다 |

상태 줄의 `#N`은 업데이트 횟수, 업데이트 주기 표는 설치·대기·활성화 시각이다. 워커가 오류를 내면 소스 줄 옆 오류 수를 눌러 콘솔로 간다. 모든 등록은 하단의 **모든 등록 보기**(`chrome://serviceworker-internals`)에서 본다.

### 캐시 저장소

저장소 > 캐시 저장소는 Cache API로 저장한 응답을 보여 준다. 리소스를 고르면 HTTP 헤더와 미리보기가 나오고, 경로로 필터링하거나 하나씩 지울 수 있다. 캐시를 막 만든 직후에는 목록에 안 뜰 수 있으니 새로고침한다.

- **HTTP 캐시는 여기서 보지 않는다.** HTTP 캐시 적중 여부는 네트워크 패널의 크기 열에서 본다([[devtools-network|DevTools Network 패널]]).
- 다른 출처에서 CORS 없이 받은 **불투명(opaque) 응답**은 할당량 계산에 큰 패딩이 붙는다. Chrome에서는 하나당 최소 약 7MB로 잡혀, 실제 크기보다 훨씬 빨리 `QuotaExceeded`에 걸릴 수 있다.

## 저장소 보기와 고치기

| 저장소 | 보기 | 고치기 | 주의 |
| --- | --- | --- | --- |
| Local Storage | 저장소 > 로컬 저장소 > 출처 선택 | 빈 행 더블클릭으로 추가, 셀 더블클릭으로 수정, 삭제·모두 지우기 | 키·값으로 필터. 수정 후 페이지 새로고침 |
| Session Storage | 저장소 > 세션 저장소 | Local Storage와 같다 | 탭(페이지 세션)이 끝나면 사라진다 |
| IndexedDB | 데이터베이스 > 객체 저장소 > 색인 | **패널에서 값 수정 불가.** 키-값 쌍 삭제, 객체 저장소 지우기, 데이터베이스 삭제만 된다 | 실시간 갱신이 안 되므로 새로고침 버튼을 누른다. iframe 속 서드 파티 DB는 안 보인다 |
| 확장 프로그램 저장소 | 저장소 > 확장 프로그램 저장소 > 저장소 영역 | 추가·수정·삭제. 값은 가능하면 JSON으로 파싱해 저장된다 | `chrome.storage`용. `storage` 권한이 있는 확장만 보인다 |

IndexedDB 값을 바꾸거나 다른 출처의 Web Storage를 다룰 때는 **콘솔**을 쓴다. 콘솔 상단의 컨텍스트 드롭다운에서 대상 프레임을 고른 뒤 `localStorage.setItem(...)`이나 IndexedDB 코드를 실행한다. 자주 쓰는 코드는 스니펫으로 저장한다([[devtools-console|DevTools Console 활용]]).

## 쿠키 보기·편집·필터

저장소 > 쿠키에서 출처를 고르면 쿠키 표가 나온다.

| 열 | 의미 |
| --- | --- |
| 도메인 · 경로 | 쿠키를 받을 호스트와 URL 경로 |
| 만료 예정 / 최대 수명 | 세션 쿠키는 `Session` |
| HttpOnly | 켜져 있으면 JavaScript로 읽거나 바꿀 수 없다 |
| 보안(Secure) | HTTPS 연결에서만 전송된다 |
| SameSite | `Strict`·`Lax`·`None` |
| 파티션 키 | 독립 파티션(CHIPS) 쿠키가 어느 최상위 사이트 아래 저장됐는지 |

- **필터**는 이름과 값만 대상이며 대소문자를 구분하지 않는다.
- **추가**: 빈 행을 더블클릭해 이름·값을 넣으면 나머지 필드는 자동으로 채워진다. **수정**: 필드를 더블클릭한다(크기는 자동 갱신).
- 잘못된 값이 든 쿠키는 빨갛게 표시된다. **문제가 있는 쿠키만 표시**로 추린다. 값이 퍼센트 인코딩돼 있으면 **디코딩된 URL 표시**를 켠다.
- 서드 파티 쿠키(`SameSite=None`)에는 경고 아이콘이 붙고, 누르면 Issues 패널로 간다. 요청 단위로는 네트워크 > 요청 > 쿠키 탭에서 본다.

로그인 쿠키가 안 붙는 문제는 대개 이 표에서 `Secure`(HTTP에서 시험), `SameSite`(교차 사이트 요청), 도메인·경로 불일치 중 하나로 드러난다.

## 저장소 지우기와 할당량

애플리케이션 > 저장소는 캐시 저장소·IndexedDB·서비스 워커가 쓰는 용량을 원형 차트로 보여 준다.

- **사이트 데이터 삭제**: 체크한 항목(IndexedDB, 캐시 저장소 등)을 한 번에 지우고 서비스 워커 등록도 해제한다. PWA 개발 중 「깨끗한 첫 방문」을 만드는 가장 빠른 방법이다. **서드 파티 쿠키 포함**을 켜면 서드 파티 쿠키도 지운다.
- **맞춤 저장 용량 한도 시뮬레이션**: 할당량을 작게 잡아 용량 부족 상황에서 앱이 어떻게 버티는지 본다.

## 뒤로/앞으로 캐시(bfcache) 테스트

bfcache는 뒤로·앞으로 이동 때 페이지를 메모리 스냅샷에서 즉시 복원하는 최적화다. HTTP 캐시와는 다른 것이다.

1. 백그라운드 서비스 > 뒤로/앞으로 캐시에서 **뒤로-앞으로 캐시 테스트**를 누른다. Chrome이 다른 페이지로 갔다가 돌아온다.
2. 성공하면 성공 메시지, 실패하면 원인 목록이 뜬다. 프레임 섹션을 펼쳐 어느 프레임이 막았는지 본다.

| 원인 유형 | 의미 |
| --- | --- |
| 실행 가능 | 페이지가 고칠 수 있다(예: `unload` 핸들러 제거) |
| 지원 대기 중 | Chrome이 아직 지원하지 않는 기능 때문. 나중에 풀린다 |
| 조치 불가 | 페이지 밖 요인 |

가장 흔한 두 원인은 `Cache-Control: no-store` 헤더와 `unload` 이벤트 핸들러다. 최신성이 필요하면 `no-store` 대신 `no-cache`나 짧은 `max-age`를 쓰고, `unload` 대신 `pagehide`를 쓴다. `Permissions-Policy: unload=()` 헤더로 확장 프로그램이 `unload`를 붙이는 것도 막을 수 있다. 헤더를 바꿔 보는 실험은 네트워크 패널의 **재정의(Overrides)**로 응답 헤더를 흉내 내면 서버 배포 없이 된다.

## 추측 규칙(Speculation Rules) 디버깅

`<script type="speculationrules">`로 다음 페이지를 미리 가져오거나(prefetch) 통째로 미리 렌더링(prerender)한다. 백그라운드 서비스 > **추측 로드**에서 디버깅한다.

| 탭 | 보이는 것 |
| --- | --- |
| 추측 로드 | 현재 페이지가 prefetch·prerender로 열렸는지, 실패했다면 이유 |
| 규칙 | 페이지에서 찾은 규칙 세트. 아이콘을 누르면 Elements 패널의 원본 `<script>`로 간다 |
| 추측 | 대상 URL별 동작(prefetch/prerender)·출처 규칙·상태(트리거되지 않음·준비됨·실패) |

- 패널은 열려 있을 때만 기록하므로 **탭을 연 뒤 페이지를 새로고침**한다.
- 이동한 URL이 규칙과 맞지 않으면 「일치하지 않는 이유」가 표시된다. 규칙의 오타와 JSON 문법 오류를 찾는 데 쓴다.
- **prefetch**는 네트워크 패널에도 보인다. 우선순위가 `Lowest`이고 요청 헤더에 `Sec-Purpose: prefetch`가 붙는다.
- **prerender**는 별도 렌더러에서 돌아 네트워크 패널에 안 보인다. DevTools 오른쪽 위 드롭다운(또는 추측 탭에서 URL을 고르고 검사)으로 대상 렌더러를 바꾸면 Network·Elements·Console이 미리 렌더링된 페이지를 보여 준다. 그 요청에는 `Sec-Purpose: prefetch;prerender`가 붙는다.
- `eagerness: "moderate"`처럼 동시에 걸 수 있는 prerender 수에 한도가 있어, 한도를 넘긴 URL은 실패 이유와 함께 표시된다.

`<link rel="preload">`나 옛 `<link rel="prefetch">`는 이 탭의 대상이 아니다.

## 프레임

애플리케이션 > 프레임은 최상위 프레임, 중첩 프레임·iframe, 리소스를 트리로 보여 준다. 프레임을 고르면 다음이 나온다.

| 섹션 | 쓰임 |
| --- | --- |
| 문서 | URL, 출처, 소유자 요소 |
| 보안 및 격리 | 보안 컨텍스트 여부, 교차 출처 격리, COOP·COEP |
| 콘텐츠 보안 정책 | 적용 중인 CSP |
| API 가용성 | `SharedArrayBuffer`처럼 교차 출처 격리가 필요한 API를 쓸 수 있는지 |
| 오리진 트라이얼 · 권한 정책 | 등록된 실험 기능과 토큰 상태, 허용·차단된 기능과 차단 이유 |

## 과거에는

애플리케이션 캐시(AppCache)와 Web SQL 뷰어가 있었다. AppCache는 Chromium 계열에서 삭제됐고 Web SQL은 유지되지 않는 사양이다. 지금은 각각 서비스 워커 + 캐시 저장소, IndexedDB를 쓴다.

## 정리

- 「옛 서비스 워커가 남아 있다」 → 다시 로드 시 업데이트, 또는 사이트 데이터 삭제.
- 저장소 값 확인·수정 → 저장소 섹션. IndexedDB 수정은 콘솔이나 스니펫으로.
- 쿠키가 안 붙는다 → 쿠키 표의 `Secure`·`SameSite`·도메인·경로와 경고 아이콘.
- 뒤로 가기가 느리다 → bfcache 테스트로 막는 원인 확인.
- prefetch·prerender가 안 먹는다 → 추측 로드 탭을 열고 새로고침.

관련 노트: [[pwa-service-worker|PWA와 서비스 워커 캐시 전략]], [[cookie-session|쿠키와 세션]], [[session-vs-token-auth|세션 기반 인증과 토큰 기반 인증]], [[http-cache|HTTP 캐시]], [[devtools-network|DevTools Network 패널]], [[devtools-console|DevTools Console 활용]], [[devtools-device-emulation|DevTools로 기기·환경 에뮬레이션하기]], [[browser-tracking-protection|서드파티 쿠키와 브라우저 추적 방지]], [[service-worker-lifecycle|서비스 워커 등록·스코프·생명주기와 업데이트]], [[page-lifecycle-events|페이지 생명주기와 리소스 로딩 이벤트]]
