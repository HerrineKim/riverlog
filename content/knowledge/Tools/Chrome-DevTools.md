---
title: "Chrome DevTools"
concept: "Chrome DevTools"
summary: "Chrome에 내장된 웹 개발자 도구 모음. 여는 법, 할 일별로 어느 패널을 쓰는지, 명령 메뉴·단축키·설정, 검색·문제·변경사항 같은 보조 도구를 한곳에 모은 DevTools 노트 안내."
tags: ["devtools", "debugging", "browser", "frontend", "tools"]
source: other
date: "2026-10-15"
sources: ["https://developer.chrome.com/docs/devtools?hl=ko", "https://developer.chrome.com/docs/devtools/overview?hl=ko", "https://developer.chrome.com/docs/devtools/open?hl=ko", "https://developer.chrome.com/docs/devtools/command-menu?hl=ko", "https://developer.chrome.com/docs/devtools/shortcuts?hl=ko", "https://developer.chrome.com/docs/devtools/settings?hl=ko", "https://developer.chrome.com/docs/devtools/settings/preferences?hl=ko", "https://developer.chrome.com/docs/devtools/customize?hl=ko", "https://developer.chrome.com/docs/devtools/search?hl=ko", "https://developer.chrome.com/docs/devtools/issues?hl=ko", "https://developer.chrome.com/docs/devtools/changes?hl=ko", "https://developer.chrome.com/docs/devtools/developer-resources?hl=ko", "https://developer.chrome.com/docs/devtools/protocol-monitor?hl=ko", "https://developer.chrome.com/docs/devtools/quick-source?hl=ko"]
---

> Chrome for Developers의 「[Chrome DevTools 문서](https://developer.chrome.com/docs/devtools?hl=ko)」를 바탕으로 재구성한 노트다.

Chrome DevTools는 Chrome 브라우저에 내장된 웹 개발자 도구 모음이다. 페이지의 DOM과 CSS를 그 자리에서 고쳐 보고, 로그와 네트워크 요청을 확인하고, 중단점으로 JavaScript를 멈추고, 성능과 메모리를 기록해 원인을 찾는 일을 모두 브라우저 안에서 할 수 있다. 탭(문서에서는 **패널**이라고 부른다)이 많아 처음엔 복잡해 보이지만, "무엇을 하려는가"에 따라 갈 패널이 정해져 있다. 이 노트는 그 지도와 모든 패널에 공통으로 쓰는 조작(명령 메뉴, 단축키, 설정)을 다루고, 패널별 사용법은 아래 하위 노트에서 다룬다.

## 여는 법

| 하려는 일 | Mac | Windows / Linux |
| --- | --- | --- |
| 요소를 골라 Elements 패널 열기 (검사 모드) | `Cmd+Option+C` | `Ctrl+Shift+C` |
| Console 패널 바로 열기 | `Cmd+Option+J` | `Ctrl+Shift+J` |
| 마지막으로 쓴 패널 열기 | `Cmd+Option+I` 또는 `Fn+F12` | `Ctrl+Shift+I` 또는 `F12` |

- 마우스로는 요소를 오른쪽 클릭 → **검사**, 또는 Chrome 메뉴 → 도구 더보기 → 개발자 도구.
- 외우는 법: **C**는 CSS, **J**는 JavaScript, **I**는 마지막 패널.
- DevTools가 열린 상태에서 새로고침 버튼을 길게 누르면 **일반 새로고침 / 강제 새로고침(캐시 우회) / 캐시 비우기 및 강제 새로고침** 중 고를 수 있다.
- 새 탭마다 DevTools를 자동으로 열려면 Chrome을 모두 종료한 뒤 플래그를 붙여 실행한다.

```bash
open -a "Google Chrome" --args --auto-open-devtools-for-tabs   # macOS
```

## 패널 지도: 무엇을 할 때 어디로

| 하려는 일 | 패널·도구 | 노트 |
| --- | --- | --- |
| DOM 구조 확인·수정, 적용된 CSS와 계산값 보기, Grid·Flex 오버레이 | Elements (Styles, Computed, Layout) | [[devtools-elements-css\|DevTools로 DOM과 CSS 다루기]] |
| 로그 확인, JavaScript 실행, 표현식 실시간 관찰 | Console | [[devtools-console\|DevTools Console 활용]] |
| 중단점으로 코드 멈추기, 소스 맵, 스니펫, 로컬 파일에 저장 | Sources | [[devtools-debugging\|DevTools로 JavaScript 디버깅하기]] |
| 요청·응답·헤더 확인, 캐시 끄기, 느린 네트워크 흉내, 응답 덮어쓰기 | Network | [[devtools-network\|DevTools Network 패널]] |
| 로드·런타임 성능, Core Web Vitals, 메모리 누수, 품질 감사 | Performance, Memory, Lighthouse | [[devtools-performance\|DevTools로 성능·메모리 분석하기]] |
| 쿠키·로컬 저장소·IndexedDB, 서비스 워커, PWA | Application | [[devtools-application\|DevTools Application 패널: 저장소·서비스 워커]] |
| 모바일 화면 크기, 센서·위치, 다크 모드 등 미디어 기능 흉내 | 기기 모드, Sensors, Rendering | [[devtools-device-emulation\|DevTools로 기기·환경 에뮬레이션하기]] |
| Gemini에게 스타일·네트워크·성능을 물어보기, 코딩 에이전트에 DevTools 연결 | AI 지원, Chrome DevTools MCP | [[devtools-ai-agents\|DevTools의 AI 지원과 에이전트용 DevTools(MCP)]] |
| 브라우저가 찾아낸 쿠키·CORS·혼합 콘텐츠 문제 확인 | Issues | 이 노트의 「문제(Issues)」 |

### 그 밖의 도구 (한 줄씩)

| 도구 | 하는 일 |
| --- | --- |
| Recorder | 사용자 흐름을 녹화·재생·측정하고 단계를 고친다 |
| Animations | 애니메이션을 검사하고 수정한다 |
| Rendering | 렌더링에 영향을 주는 옵션 모음 (페인트 영역 표시, CSS 미디어 기능 흉내 등) |
| Privacy and security | 혼합 콘텐츠, 인증서 문제 등 HTTPS 보호 상태를 확인한다 |
| Autofill | 저장된 주소 자동 완성을 검사·디버그한다 |
| Media | 탭별 미디어 플레이어 정보를 보고 디버그한다 |
| WebAuthn | 인증자(패스키 등)를 흉내 낸다 |
| 빠른 소스(Quick source) | 소스 파일을 하단 서랍에서 열어 다른 패널과 동시에 본다 |
| 새로운 기능(What's new) | DevTools·DevTools MCP 서버의 출시 노트. 업데이트 뒤 자동으로 열린다 |

## 명령 메뉴 (Command Menu)

VS Code의 명령 팔레트처럼 **이름으로 기능을 찾아 실행**한다. 메뉴 위치를 몰라도 된다.

- 열기: `Cmd+Shift+P` / `Ctrl+Shift+P`, 또는 ⋮(DevTools 맞춤설정 및 제어) → 명령어 실행.

| 입력란 앞글자 | 동작 | 예 |
| --- | --- | --- |
| `>` (기본) | 명령 실행 | `dark` → 어두운 테마, `dock` → 도킹 위치, `changes` → Show Changes |
| (지우고 파일 이름) | 파일 열기. `Cmd+P` / `Ctrl+P`로 바로 열 수도 있다 | `main.js` |
| `!` | 저장한 스니펫 실행 | `!cleanup` |
| `?` | 쓸 수 있는 다른 모드 목록 | |

- 설정 이름이나 값을 입력하면 설정 화면에 가지 않고 바로 바꾼다. (예: `Chinese` → UI 언어 변경)
- `screenshot`을 입력해 **영역 스크린샷 캡처**를 고르면 드래그한 부분만 찍는다. DevTools를 별도 창으로 떼어 낸 상태에서는 동작하지 않는다.
- 서드 파티 파일은 기본적으로 파일 열기 목록에서 숨겨진다. Sources의 "무시 목록에 있는 소스 숨기기"를 끄면 보인다.

## 자주 쓰는 단축키

모든 패널에서 통하는 것만 모았다. 패널별 단축키는 각 하위 노트에 있다. UI 요소에 마우스를 올리면 도움말에 단축키가 함께 나온다.

| 작업 | Mac | Windows / Linux |
| --- | --- | --- |
| 명령 메뉴 | `Cmd+Shift+P` | `Ctrl+Shift+P` |
| 파일 열기 | `Cmd+P` 또는 `Cmd+O` | `Ctrl+P` 또는 `Ctrl+O` |
| 현재 패널에서 찾기 | `Cmd+F` | `Ctrl+F` |
| 로드된 모든 리소스에서 찾기 (검색 탭) | `Cmd+Option+F` | `Ctrl+Shift+F` |
| 요소 검사 모드 | `Cmd+Shift+C` | `Ctrl+Shift+C` |
| 기기 모드 켜고 끄기 | `Cmd+Shift+M` | `Ctrl+Shift+M` |
| 서랍(Drawer) 열고 닫기 | `Esc` | `Esc` |
| 설정 열기 | `?` 또는 `Fn+F1` | `?` 또는 `F1` |
| 다음 / 이전 패널 | `Cmd+]` / `Cmd+[` | `Ctrl+]` / `Ctrl+[` |
| 마지막 도킹 위치로 전환 | `Cmd+Shift+D` | `Ctrl+Shift+D` |
| 강제 새로고침 | `Cmd+Shift+R` | `Ctrl+Shift+R` 또는 `Ctrl+F5` |

- 설정 → 단축키에서 **Visual Studio Code 프리셋**을 고르면 VS Code와 같은 키 조합을 쓴다. 키를 직접 바꾸려면 실험 기능 "키보드 단축키 편집기"를 켠다.
- 설정 → 환경설정의 `Ctrl/Cmd + 0~9`로 패널 전환 옵션을 켜면 숫자 키로 패널을 오간다.

## 설정과 맞춤

설정은 상단 작업 표시줄의 ⚙ 버튼(또는 `?`, `F1`)으로 연다. 패널마다 있는 패널 설정과 헷갈리지 않는다.

| 탭 | 무엇을 정하나 |
| --- | --- |
| 환경설정(Preferences) | 테마, 패널 레이아웃, 언어, 패널별 동작(콘솔 타임스탬프, 소스 맵, 로그 보존 등). 맨 아래 "기본값 복원 및 새로고침" |
| 작업공간(Workspace) | DevTools에서 고친 내용을 저장할 로컬 폴더와 제외 패턴 |
| 실험(Experiments) | 미리보기 기능 켜기. 체크한 뒤 DevTools를 새로고침해야 적용되고, 불안정할 수 있다 |
| 무시 목록(Ignore list) | 디버거가 건너뛸 스크립트. 기본으로 `/node_modules/`, `/bower_components/`, 소스 맵 `ignoreList`로 표시된 서드 파티 |
| 기기(Devices) | 기기 모드 목록에 기기 추가, 맞춤 기기 정의 |
| 제한(Throttling) | 맞춤 네트워크 속도 프로필, 내 컴퓨터 기준 CPU 제한 보정 |
| 위치(Locations) | Sensors에서 고를 맞춤 위치 |
| AI 혁신, 단축키 | AI 지원 기능 켜기, 단축키 확인·변경 |

| 맞춤 | 방법 |
| --- | --- |
| 테마 | 환경설정 → 모양 → 테마(시스템·밝게·어둡게). 기본은 Chrome 색상 테마를 따라간다 |
| 도킹 위치 | ⋮ 메뉴에서 오른쪽(기본)·아래·왼쪽·별도 창. 명령 메뉴에 `dock` 입력 |
| 패널 순서 | 상단 패널, Elements의 Styles·Computed 같은 창, 서랍 탭을 드래그해 옮긴다. 오른쪽 클릭으로 위·아래 영역 간 이동. 순서는 유지된다 |
| 패널 레이아웃 | 창 너비에 따라 Styles 창이 옆·아래로 자동 이동한다. 늘 옆에 두려면 레이아웃을 세로로 고정 |
| 설정 동기화 | Chrome 동기화를 켜면 대부분 동기화된다. 작업공간·실험·기기·도킹 위치·스니펫은 기기마다 따로 |

## 검색

| 범위 | 도구 | 비고 |
| --- | --- | --- |
| 로드된 모든 리소스 | 검색 탭 (`Cmd+Option+F` / `Ctrl+Shift+F`) | 대소문자 구분·정규식(슬래시 불필요). 결과를 누르면 Sources에서 해당 줄이 열린다 |
| 지금 보는 도구 안 | 내장 검색창 (`Cmd+F` / `Ctrl+F`) | Elements는 CSS 선택자·XPath, Sources는 바꾸기, Network는 헤더·페이로드·응답까지 |

검색 탭은 네트워크 헤더와 응답 본문을 뒤지지 않는다. 응답 내용을 찾을 때는 Network 패널 안에서 검색한다. 확장 프로그램 스크립트까지 찾으려면 환경설정의 "익명 및 콘텐츠 스크립트에서 검색"을 켠다.

## 문제(Issues)

브라우저가 감지한 경고를 **모아서, 무엇을 고쳐야 하는지와 함께** 보여 준다. 콘솔에 흩어진 경고보다 읽기 쉽다.

- 열기: 상단 작업 표시줄 ⚙ 옆의 문제 버튼(심각도에 따라 빨강·노랑·파랑), 또는 도구 더보기 → 문제. 열어 둔 채 새로고침하면 로드 중 문제까지 잡힌다.
- 다루는 문제: 쿠키, 혼합 콘텐츠, CORS 오류, COEP, 쿼크 모드, 콘텐츠 보안 정책(CSP) 위반, 스타일시트 로드 실패, 잘못된 `@property`, `autocomplete` 속성 문제 등.
- 항목 구성: 제목 · 설명과 해결 방법 · **영향받는 리소스**(누르면 Network·Elements 등 해당 패널로 이동) · 자세한 안내 링크.
- 비슷한 문제 숨기기, 서드 파티 쿠키 문제 포함 여부를 툴바에서 고른다.

## 변경사항(Changes)

DevTools 안에서 고친 내용을 **diff로** 보여 준다. Styles나 Sources에서 CSS를 이리저리 바꾼 뒤 실제 코드에 옮길 때 쓴다.

- 열기: 명령 메뉴 → `changes` → Show Changes. 서랍에 열린다.
- 추적 대상: Styles·Sources에서 바꾼 CSS, Sources에서 바꾼 JavaScript, 로컬 재정의를 켠 상태에서 바꾼 HTML.
- 하단 **복사** 버튼으로 바꾼 CSS를 한 번에 복사하고, **되돌리기**로 파일 단위 원복을 한다.
- 새로고침하면 사라진다. 남기려면 로컬 재정의나 작업공간을 쓴다([[devtools-debugging|DevTools로 JavaScript 디버깅하기]]).

## 개발자 리소스와 프로토콜 모니터

| 도구 | 언제 | 핵심 |
| --- | --- | --- |
| 개발자 리소스 | 소스 맵이 안 붙어 원본 코드가 안 보일 때 | 소스 맵별 로드 상태·오류를 표로 확인. 교차 출처로 막히면 "웹사이트를 통해 로드", 그래도 안 되면 Sources에서 파일 오른쪽 클릭 → 소스 맵 추가 |
| 프로토콜 모니터 | DevTools가 브라우저와 주고받는 CDP 메시지를 보거나 직접 보낼 때 | 실험에서 켠 뒤 명령 메뉴 → Show Protocol monitor. 기록·JSON 다운로드, 하단 입력란에 `Page.captureScreenshot` 같은 명령 전송 |

DevTools 자체가 **Chrome DevTools 프로토콜(CDP)** 로 브라우저를 계측·검사·디버그·프로파일링한다. 프로토콜 모니터는 그 대화를 들여다보는 창이다.

## 팁

- **서랍(`Esc`)을 활용한다.** Console, 검색, 변경사항, 빠른 소스, 프로토콜 모니터 같은 도구는 하단 서랍에 열려 지금 패널과 동시에 볼 수 있다.
- **설정 위치를 외우지 않는다.** 명령 메뉴에 설정 이름을 치면 된다.
- **팝업도 바로 검사한다.** 환경설정 → 전역의 "팝업에 DevTools 자동 열기"를 켜면 `target=_blank` 링크로 연 새 탭에도 DevTools가 열린다.
- **익숙하지 않은 코드에서 멈추면 무시 목록부터 본다.** 확장 프로그램 콘텐츠 스크립트를 무시 목록에 넣으면 디버거가 건너뛴다.
- **Elements의 배지를 누른다.** DOM 트리의 `grid`, `flex` 같은 배지를 누르면 레이아웃 오버레이가 켜진다. 오른쪽 클릭 → 배지 설정에서 보일 배지를 고른다.

## 하위 노트

- [DevTools로 DOM과 CSS 다루기](Tools/Chrome-DevTools/devtools-elements-css.md): Elements 패널로 DOM 편집, Styles·Computed로 CSS 확인과 수정, Grid·Flex·컨테이너 쿼리 디버깅
- [DevTools Console 활용](Tools/Chrome-DevTools/devtools-console.md): 로그 메시지 필터링, Console API와 유틸리티 함수, 라이브 표현식
- [DevTools로 JavaScript 디버깅하기](Tools/Chrome-DevTools/devtools-debugging.md): 중단점 종류, 단계 실행, 소스 맵과 무시 목록, 스니펫, 작업공간과 로컬 재정의
- [DevTools Network 패널](Tools/Chrome-DevTools/devtools-network.md): 요청 목록 읽기, 헤더·타이밍 확인, 캐시 끄기, 네트워크 제한과 요청 차단, 응답 덮어쓰기
- [DevTools로 성능·메모리 분석하기](Tools/Chrome-DevTools/devtools-performance.md): Performance 패널 기록과 해석, Core Web Vitals, Lighthouse, 메모리 누수 찾기
- [DevTools Application 패널: 저장소·서비스 워커](Tools/Chrome-DevTools/devtools-application.md): 쿠키·Web Storage·IndexedDB·Cache Storage, 서비스 워커와 PWA, bfcache
- [DevTools로 기기·환경 에뮬레이션하기](Tools/Chrome-DevTools/devtools-device-emulation.md): 기기 모드, 센서·위치, Rendering의 CSS 미디어 기능 흉내, 원격 디버깅
- [DevTools의 AI 지원과 에이전트용 DevTools(MCP)](Tools/Chrome-DevTools/devtools-ai-agents.md): Gemini 기반 AI 지원, 코딩 에이전트에 Chrome DevTools MCP 서버 연결

관련 노트: [[Tools/Dev-Environment|개발 환경]], [[vscode|VS Code 설정과 활용]]
