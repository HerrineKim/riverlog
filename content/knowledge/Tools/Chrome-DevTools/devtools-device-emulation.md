---
title: "DevTools로 기기·환경 에뮬레이션하기"
concept: "Device Emulation"
summary: "기기 모드로 뷰포트·DPR·터치·기기 프리셋을, 네트워크 상태 패널로 사용자 에이전트를, 센서 패널로 위치·방향·유휴 상태를, 렌더링 탭으로 다크 모드·모션 감소·인쇄·색각 이상을 흉내 낸다. 흉내로 부족하면 Android 원격 디버깅·WebView 검사·포트 포워딩으로 실기기에서 확인하고, WebAuthn 패널로 가상 인증기를 만든다."
tags: ["devtools", "debugging", "mobile", "css", "accessibility", "tools"]
source: other
date: "2026-10-15"
sources: ["https://developer.chrome.com/docs/devtools/device-mode", "https://developer.chrome.com/docs/devtools/device-mode/override-user-agent", "https://developer.chrome.com/docs/devtools/sensors", "https://developer.chrome.com/docs/devtools/settings/devices", "https://developer.chrome.com/docs/devtools/settings/locations", "https://developer.chrome.com/docs/devtools/rendering/emulate-css", "https://developer.chrome.com/docs/devtools/rendering/apply-effects", "https://developer.chrome.com/docs/devtools/remote-debugging", "https://developer.chrome.com/docs/devtools/remote-debugging/webviews", "https://developer.chrome.com/docs/devtools/remote-debugging/local-server", "https://developer.chrome.com/docs/devtools/webauthn", "https://developer.chrome.com/docs/devtools/media-panel", "https://developer.chrome.com/docs/devtools/webaudio"]
---

> Chrome for Developers의 「[Chrome DevTools 문서](https://developer.chrome.com/docs/devtools?hl=ko)」를 바탕으로 재구성한 노트다.

## 무엇을 어디서 흉내 내나

| 바꾸고 싶은 것 | 도구 | 여는 법 |
| --- | --- | --- |
| 화면 크기, DPR, 터치, 특정 기기 | 기기 모드(기기 툴바) | 상단 작업 모음의 **기기 툴바 전환** |
| 사용자 에이전트, UA 클라이언트 힌트 | 네트워크 상태 패널 | 명령 메뉴 → `Network conditions` |
| 위치, 기기 방향, 터치 강제, 유휴 상태, 코어 수, CPU 압력 | 센서 패널 | 명령 메뉴 → `sensors` |
| 다크 모드, 모션 감소, 인쇄, 대비, 색각 이상 | 렌더링 탭 | 명령 메뉴 → `rendering` |
| 실제 Android 기기, 앱 속 WebView | 원격 디버깅 | `chrome://inspect#devices` |
| 패스키·보안 키 | WebAuthn 패널 | 명령 메뉴 → `webauthn` |

명령 메뉴는 `Command+Shift+P`(Mac) / `Control+Shift+P`(Windows·Linux·ChromeOS)다. 렌더링 탭의 옵션은 명령 메뉴에서 이름(예: `emulate`)으로 바로 찾아 켤 수도 있다.

## 기기 모드

**기기 모드는 근사치다.** 데스크톱 CPU에서 모바일 화면을 흉내 낼 뿐, 모바일 CPU 구조나 실제 브라우저 UI까지 재현하지 못한다. 확실히 해야 할 때는 실기기 원격 디버깅으로 넘어간다.

| 기능 | 쓰는 법 |
| --- | --- |
| 반응형 뷰포트 | 핸들을 끌거나 너비·높이를 입력한다. 너비 프리셋 막대: 320 · 375 · 425 · 768 · 1024 · 1440 · 2560px |
| 기기 프리셋 | 크기 드롭다운에서 기기 선택. 회전 버튼으로 가로 모드 |
| 미디어 쿼리 표시 | 옵션 더보기 > 미디어 쿼리 표시. 파란 막대는 `max-width`, 주황 막대는 `min-width` 중단점. 막대를 우클릭 > 소스 코드에서 표시로 `@media` 선언으로 간다 |
| 기기 픽셀 비율(DPR) | 옵션 더보기 > 기기 픽셀 비율 추가. 고해상도 이미지(`srcset`) 선택을 시험한다 |
| 기기 유형 | 옵션 더보기 > 기기 유형 추가 (아래 표) |
| 듀얼 화면·폴더블 | 듀얼 화면 전환, 자세(연속·접힘) 드롭다운 |
| 눈금자, 기기 프레임 | 옵션 더보기에서 켠다 |
| 스크린샷 | 옵션 더보기 > 스크린샷 캡처 / 전체 크기 스크린샷 캡처 |
| 네트워크·CPU 제한 | 제한 목록의 중간급 모바일(빠른 3G + CPU 4배 느림), 보급형 모바일(느린 3G + CPU 6배 느림) |

| 기기 유형 | 렌더링 | 발생하는 이벤트 |
| --- | --- | --- |
| 모바일 | 모바일 뷰포트 | touch |
| 모바일(터치 없음) | 모바일 뷰포트 | click |
| 데스크톱 | 데스크톱 뷰포트 | click |
| 데스크톱(터치) | 데스크톱 뷰포트 | touch |

CPU만 늦추려면 성능 패널의 캡처 설정, 네트워크만 늦추려면 네트워크 패널의 제한 목록을 쓴다([[devtools-performance|DevTools로 성능·메모리 분석하기]], [[devtools-network|DevTools Network 패널]]).

### 맞춤 기기

크기 드롭다운 > 수정, 또는 설정 > 기기에서 목록에 보일 기기를 체크하거나 **맞춤 기기 추가**로 이름·너비·높이를 넣는다. DPR, 사용자 에이전트 문자열, 기기 유형은 선택 항목이다. 회사 서비스의 주요 타깃 기기를 등록해 두면 매번 수치를 입력하지 않아도 된다.

## 사용자 에이전트 재정의

네트워크 패널의 **더 많은 네트워크 조건** 버튼이나 명령 메뉴로 네트워크 상태 패널을 연다.

1. 사용자 에이전트 섹션의 **브라우저 기본값 사용**을 끈다.
2. 목록에서 고르거나 직접 입력한다. 필요하면 **사용자 에이전트 클라이언트 힌트**를 펼쳐 브랜드·버전을 고치고 업데이트를 누른다.
3. 페이지를 새로고침한다.

**UA를 바꿔도 Chrome의 동작은 그대로다.** 서버와 페이지 스크립트가 받는 식별자만 바뀐다. UA 분기로 다른 HTML을 내려 주는 서버나 UA 기반 기능 감지 코드를 시험할 때 쓴다.

## 센서

| 항목 | 선택지 | 쓰임 |
| --- | --- | --- |
| 위치 | 도시 프리셋, 맞춤 위치(위도·경도), **위치 사용 불가** | 지역별 UI, 위치 권한 오류 처리 |
| 방향 | 프리셋(세로 거꾸로 등), 맞춤(alpha·beta·gamma), 모델 드래그 | `deviceorientation` 기반 UI |
| 터치 | 포스 터치 (DevTools 새로고침 필요) | 마우스로 터치 이벤트 발생 |
| 유휴 상태 | 사용자 활성/유휴 × 화면 잠김/잠금 해제 | Idle Detection API를 실제로 기다리지 않고 시험 |
| 하드웨어 동시 실행 | 코어 수 입력 | `navigator.hardwareConcurrency`로 워커 수를 정하는 코드 |
| CPU 압력 | 공칭·양호·심각 등 | Compute Pressure API에 반응하는 실시간 앱 |

자주 쓰는 위치는 설정 > 위치 > **위치 추가**로 저장한다. 이름·위도·경도와 함께 시간대 ID(`Asia/Seoul` 같은 IANA 이름)와 언어(BCP 47, 예: `ko-KR`)도 넣을 수 있어 시간대·로캘까지 함께 바뀐다.

## CSS 미디어 기능과 시각 효과 (렌더링 탭)

| 에뮬레이션 | 값 | 확인할 것 |
| --- | --- | --- |
| `prefers-color-scheme` | `light` · `dark` | 다크 모드 스타일 |
| CSS 미디어 유형 | `print` | 인쇄 스타일. 이 상태로 Elements에서 CSS를 바로 고칠 수 있다 |
| `prefers-reduced-motion` | `reduce` | 애니메이션 축소·제거 |
| `prefers-contrast` | `more` · `less` · `custom` | 고대비 스타일 |
| `forced-colors` | `active` · `none` | Windows 고대비 같은 강제 색상 모드 |
| `prefers-reduced-transparency` | `reduce` | 반투명 레이어 대체 |
| `color-gamut` | `srgb` · `p3` · `rec2020` | 넓은 색역 분기 |
| 시각 장애 에뮬레이션 | 흐릿한 시야, 대비 감소, 적색맹·녹색맹·청색맹, 전색맹 | 색에만 의존한 정보 전달 |

같은 탭의 기타 효과:

| 옵션 | 쓰임 |
| --- | --- |
| 포커스된 페이지 에뮬레이션 | DevTools로 포커스가 옮겨 가면 닫히는 드롭다운·날짜 선택기를 열린 채로 검사한다. `visibilitychange`가 발생하지 않는다는 점에 주의 (Elements > Styles의 `:hov`에도 있다) |
| 자동 어두운 모드 사용 설정 | 다크 모드를 구현하지 않은 페이지가 자동 어두운 테마에서 어떻게 보이는지. 켜면 `prefers-color-scheme`이 `dark`로 고정된다 |
| 로컬 글꼴 사용 중지 | `@font-face`의 `local()`을 무시해 웹 폰트가 제대로 로드되는지 확인 |
| AVIF / WebP 사용 중지 | `<picture>`의 대체 이미지가 선택되는지 확인. 이미지 캐시가 자동으로 꺼진다 |
| 광고 프레임 강조표시 | 광고로 태그된 프레임을 빨갛게 표시 |

미디어 기능 자체의 설계는 [[color-motion-accessibility|색과 움직임의 접근성]], [[responsive-design|반응형 디자인과 다국어 타이포그래피]], [[responsive-images|반응형 이미지: srcset·sizes와 picture]]에서 다룬다.

## 실기기 원격 디버깅 (Android)

### 연결

1. Android에서 개발자 옵션을 켜고 **USB 디버깅**을 허용한다.
2. 컴퓨터 Chrome에서 `chrome://inspect#devices`를 열고 **USB 기기 검색**을 켠 뒤 USB로 직접 연결한다.
3. 기기에 뜨는 디버깅 허용 프롬프트를 수락하면 모델 이름이 나타난다.
4. 기기 Chrome 탭 옆의 **검사**를 누르면 그 탭용 DevTools가 열린다. 열리는 DevTools 버전은 **기기의 Chrome 버전**을 따른다.

- 스크린캐스트를 켜면 기기 화면이 DevTools에 비친다. 클릭은 탭으로, 키 입력은 기기로 간다. Shift+드래그는 핀치다. 스크린캐스트는 프레임 속도를 떨어뜨리므로 스크롤·애니메이션 성능을 잴 때는 끈다.
- 요소 선택 후 기기 화면을 탭하면 Elements에서 그 요소가 선택된다(한 번 쓰면 꺼진다).

| 증상 | 확인할 것 |
| --- | --- |
| 기기가 안 보인다 | USB 허브 대신 직접 연결, 케이블 재연결(양쪽 화면 잠금 해제), 파일 전송이 되는 케이블인지, Windows는 OEM USB 드라이버 |
| 허용 프롬프트가 안 뜬다 | 화면 잠금 해제 후 재연결, USB 모드를 PTP로, 개발자 옵션의 USB 디버깅 승인 취소 후 재시도 |

`adb forward tcp:9222 localabstract:chrome_devtools_remote`로 기기의 DevTools 프로토콜(CDP) 소켓을 로컬 포트에 연결하면 `http://localhost:9222/json`에서 대상 목록을 보고 자동화 도구를 직접 붙일 수 있다.

### 앱 속 WebView

하이브리드 앱의 WebView도 같은 방식으로 `chrome://inspect`에 나타난다. 단 **앱이 디버깅을 허용해야 한다.**

```java
// 디버그 빌드에서만 켠다 (모든 WebView에 적용된다)
if (0 != (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE)) {
    WebView.setWebContentsDebuggingEnabled(true);
}
```

목록에 안 보이면 이 설정이 켜졌는지, 기기에서 그 WebView 화면을 실제로 열었는지 확인한다.

### 포트 포워딩: 기기에서 로컬 서버 열기

`chrome://inspect#devices`의 **포트 포워딩**에서 기기 포트(예: `5000`)와 컴퓨터의 주소(`localhost:5000`)를 짝지은 뒤 사용을 켠다. 이제 기기 Chrome에서 `localhost:5000`을 열면 USB를 타고 개발 서버로 간다. 같은 Wi-Fi일 필요도, 방화벽을 열 필요도 없다.

허용 목록 도메인처럼 **커스텀 호스트 이름**이 필요하면 컴퓨터에서 프록시 서버(Charles 등)를 띄우고 그 포트를 포워딩한 뒤, 기기 Wi-Fi 설정의 프록시를 `localhost:<기기 포트>`로 지정한다. 끝나면 기기 프록시 설정을 되돌린다.

같은 화면의 **네트워크 타겟 검색**에 `localhost:PORT`를 넣으면 `--remote-debugging-port=PORT`로 띄운 다른 Chrome 인스턴스도 원격으로 검사할 수 있다.

## WebAuthn 가상 인증기

패스키·보안 키 로그인을 실제 기기 없이 시험한다.

1. WebAuthn 패널에서 **가상 인증자 환경 사용 설정**을 켠다.
2. 새 인증자의 프로토콜(`ctap2`·`u2f`), 전송(`usb`·`nfc`·`ble`·`internal`), 상주 키·사용자 확인·대용량 blob 지원 여부를 고르고 추가한다.
3. 페이지에서 등록·인증을 하면 사용자 인증 정보 표에 ID·사용자 핸들·서명 수가 쌓인다. 인증할 때마다 서명 수가 오른다.

활성 인증자는 한 번에 하나다. 인증 정보는 내보내거나 지울 수 있고, 활성 인증자를 지우면 인증이 꺼진다.

## 미디어·Web Audio 패널

- **미디어 패널**: 페이지의 `<video>`·`<audio>` 플레이어별 속성·이벤트·메시지 로그·재생과 버퍼 타임라인을 본다. 플레이어 정보는 JSON으로 저장할 수 있고, 원격 디버깅 중인 기기의 플레이어도 볼 수 있다.
- **WebAudio 패널**: `AudioContext`의 상태(`running`·`suspended`·`closed`), 샘플링 레이트, 콜백 버퍼 크기, 렌더링 용량(%)을 보여 준다. 오디오가 끊기면 렌더링 용량과 콜백 간격부터 본다.

## 정리

- 레이아웃·중단점 확인은 기기 모드, 실제 성능·설치·하드웨어는 실기기 원격 디버깅으로 나눈다.
- 접근성 미디어 기능(다크 모드, 모션 감소, 대비, 강제 색상)과 인쇄는 렌더링 탭에서 OS 설정을 바꾸지 않고 확인한다.
- 위치·시간대·UA를 바꿔 지역·환경별 분기를 시험하되, UA 재정의는 식별자만 바꾼다는 점을 기억한다.
- 기기에서 로컬 개발 서버를 열 때는 포트 포워딩이 가장 간단하다.

관련 노트: [[responsive-design|반응형 디자인과 다국어 타이포그래피]], [[color-motion-accessibility|색과 움직임의 접근성]], [[Accessibility|웹 접근성]], [[mobile-frameworks|모바일 앱 프레임워크 비교]], [[react-native-practical-tips|React Native 실무 팁]], [[devtools-application|DevTools Application 패널: 저장소·서비스 워커]], [[devtools-performance|DevTools로 성능·메모리 분석하기]]
