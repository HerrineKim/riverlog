---
title: "DevTools의 AI 지원과 에이전트용 DevTools(MCP)"
concept: "DevTools AI & MCP"
summary: "DevTools 안에서 Gemini와 채팅하며 스타일·네트워크·소스·성능을 묻는 AI 지원 패널과 코드 생성, 그때 Google로 가는 데이터와 끄는 정책, 그리고 코딩 에이전트가 MCP로 실제 Chrome을 조작하게 하는 Chrome DevTools MCP 서버(설정 플래그, 자동 연결, 에뮬레이션·Lighthouse·메모리·확장 프로그램·서드파티 도구)와 WebMCP 디버깅을 정리한다."
tags: ["devtools", "tools", "ai", "mcp", "agent", "debugging"]
source: other
date: "2026-10-15"
sources: ["https://developer.chrome.com/docs/devtools/ai-assistance", "https://developer.chrome.com/docs/devtools/ai-assistance/get-started", "https://developer.chrome.com/docs/devtools/ai-assistance/chat", "https://developer.chrome.com/docs/devtools/ai-assistance/code-generation", "https://developer.chrome.com/docs/devtools/ai-assistance/data-usage-and-enterprise-controls", "https://developer.chrome.com/docs/devtools/settings/ai-innovations", "https://developer.chrome.com/docs/devtools/agents", "https://developer.chrome.com/docs/devtools/agents/get-started", "https://developer.chrome.com/docs/devtools/agents/get-started/configuration", "https://developer.chrome.com/docs/devtools/agents/use-cases/auto-connect", "https://developer.chrome.com/docs/devtools/agents/use-cases/emulation", "https://developer.chrome.com/docs/devtools/agents/use-cases/lighthouse-audit", "https://developer.chrome.com/docs/devtools/agents/use-cases/third-party-tools", "https://developer.chrome.com/docs/devtools/agents/memory", "https://developer.chrome.com/docs/devtools/agents/extensions", "https://developer.chrome.com/docs/devtools/agents/webmcp-debugging", "https://developer.chrome.com/docs/devtools/application/webmcp"]
---

> Chrome for Developers의 「[Chrome DevTools 문서](https://developer.chrome.com/docs/devtools?hl=ko)」를 바탕으로 재구성한 노트다.

## 두 방향의 AI

DevTools와 AI가 만나는 방식은 두 가지다.

| 방향 | 무엇 | 누가 조작하나 |
| --- | --- | --- |
| **DevTools 안의 AI** | AI 지원 패널, 콘솔 인사이트, 코드 생성 (Gemini) | 사람이 DevTools를 열고 AI에게 묻는다 |
| **에이전트용 DevTools** | `chrome-devtools-mcp` 서버 + CLI + 에이전트 스킬 | 코딩 에이전트(Claude Code, Gemini CLI, Codex 등)가 MCP로 Chrome을 직접 조작한다 |

MCP 자체의 개념과 Claude Code에 서버를 붙이는 법은 [[claude-code-guide|Claude Code 활용 가이드]]의 「MCP로 도구 연결하기」에 있다.

## DevTools 안의 AI 지원

**설정 > AI 혁신**에서 기능별 토글을 켠다. 기능은 **콘솔 인사이트**(콘솔 오류·경고 설명)와 **AI 지원**(채팅) 두 가지다. 요건은 다음과 같다.

- 만 18세 이상, 지원 지역, 최신 Chrome, Google 계정으로 Chrome 로그인
- **설정 > 환경설정 > 모양 > 언어**가 영어(미국)

### AI 지원 패널로 묻기

기본 툴바 오른쪽의 AI 지원 버튼, 명령 메뉴의 `AI`, 또는 요소·네트워크·소스·성능 패널의 **AI로 디버그**(버튼이나 우클릭 메뉴)로 연다. 패널에서 열면 그 항목이 대화 컨텍스트로 잡힌다.

| 컨텍스트 | 이런 질문 |
| --- | --- |
| 요소(스타일) | 이 요소를 가운데 정렬하려면? 왜 이렇게 보이나? |
| 네트워크 요청 | 이 요청은 왜 실패하나? 어디서 왔고 얼마나 걸렸나? |
| 소스 파일 | 이 파일은 무엇에 쓰이나? |
| 성능 트레이스 | LCP를 개선하려면? 이 호출 프레임이 왜 오래 걸리나? |
| 컨텍스트 없음 | 이 페이지에서 가장 느린 요청은? 접근성은 어떻게 디버깅하나? DevTools의 어떤 설정이 어디 있나? |

동작 방식에서 알아 둘 점:

- 에이전트는 답을 위해 **웹 API를 호출하는 JavaScript를 생성·실행**한다. 컨텍스트 없는 질문에는 Lighthouse 감사나 성능 트레이스 기록을 스스로 돌리기도 한다.
- 답 아래 **생각 과정**을 펼치면 실행한 코드 스니펫(콘솔에 복사해 다시 돌릴 수 있다)과 결과 위젯, 관련 패널로 가는 표시 버튼이 보인다.
- **부작용이 있는 코드**는 실행 전에 대화가 일시중지된다. 코드를 읽고 계속 또는 취소를 누른다.
- 적용된 스타일 변경은 변경사항 패널에서 볼 수 있다. 작업공간 폴더를 연결해 두면 **저장되지 않은 변경사항 > 작업공간에 적용**으로 diff를 확인하고 로컬 CSS 파일에 저장한다. 작업공간 설정은 [[devtools-debugging|DevTools로 JavaScript 디버깅하기]]에 있다.
- **코딩 에이전트에 복사**는 발견 내용을 요약한 실행 가능한 프롬프트를 만들어 준다. DevTools에서 찾은 원인을 Claude Code 같은 도구로 넘겨 소스를 고칠 때 쓴다.
- 대화 기록은 DevTools·Chrome을 다시 열어도 남는다.

### 코드 생성

콘솔이나 소스 패널에서 `// Loop to check all img elements for valid alt attributes`처럼 주석으로 의도를 쓰고 `Cmd+I`(Mac) / `Ctrl+I`를 누르면 코드를 생성한다. `Tab`이나 `Enter`로 받고 `Esc`로 버린다. 설정의 **AI 혁신 > 코드 추천**으로 켠다. 요소 > 스타일 창의 CSS 코드 완성도 같은 계열이다.

**한계**: 존재하지 않는 CSS 속성·클래스 이름을 그럴듯하게 지어내는 **환각**이 있고, 페이지나 입력에 담긴 지시를 따라가는 **프롬프트 인젝션**에 취약하다. 답은 늘 검증한다.

## 무엇이 Google로 가나

모든 AI 기능은 프롬프트(텍스트·이미지·스크린샷), 계정 인증 정보, 좋아요·싫어요 피드백을 보낸다. 여기에 컨텍스트별 데이터가 더해진다.

| 기능 | 추가로 전송되는 것 |
| --- | --- |
| 콘솔 인사이트 | 메시지 내용·수준, 스택 트레이스, 관련 코드 스니펫, 연결된 요청 헤더 |
| 스타일 | DOM 구조와 콘텐츠, CSS 정보 |
| 네트워크 | URL, 헤더 일부, 상태 코드, 타이밍, 시작점(initiator) 체인 |
| 소스 | 파일 이름·URL, 파일 내용(일부), 소스 맵 URL |
| 성능 | 선택한 호출 프레임의 이름·URL·지속 시간·자식, 필요하면 트레이스의 다른 데이터 |
| 변경사항 커밋 메시지·작업공간 저장 | 매핑한 로컬 작업공간의 파일 이름과 내용 |

- 네트워크·콘솔 컨텍스트에서 **`Cookie`, `Set-Cookie`, `Authorization`, `X-`로 시작하는 맞춤 헤더는 항상 빠진다.** 콘솔 인사이트는 응답 본문도 보내지 않는다.
- 개인 계정은 기본값으로 데이터가 **모델 개선과 사람 검토**에 쓰일 수 있고, 익명화된 상태로 최대 18개월 보관된다. 프롬프트에 기밀이나 개인정보를 넣지 않는다.

### 끄는 법: `DevToolsGenAiSettings`

| 값 | 의미 | 기본값인 곳 |
| --- | --- | --- |
| `0` | 기능 허용 + 모델 개선에 데이터 사용 | 개인 사용자, 서드파티 관리 브라우저 |
| `1` | 기능 허용, 모델 개선에는 쓰지 않음 | Chrome Enterprise, Workspace Education |
| `2` | AI 기능과 진입점(Ask AI 메뉴 포함) 전부 끔 | - |

기업은 Google 관리 콘솔에서 정책으로 설정한다. 개인은 Chrome을 모두 종료하고 권장 정책을 직접 넣은 뒤 `chrome://policy`에서 값이 `2`인지 확인한다.

```bash
# macOS
defaults write com.google.Chrome DevToolsGenAiSettings -integer 2
# Linux: /etc/opt/chrome/policies/recommended/policies.json 에 {"DevToolsGenAiSettings": 2}
# Windows: HKEY_LOCAL_MACHINE\Software\Policies\Google\Chrome 의 DevToolsGenAiSettings = dword:00000002
```

## 에이전트용 Chrome DevTools (MCP 서버)

**에이전트가 정적 HTML을 긁는 대신 살아 있는 브라우저를 열고, 클릭하고, 측정하게 하는 도구 모음**이다. 세 부분으로 되어 있다.

| 구성 | 역할 |
| --- | --- |
| MCP 서버 `chrome-devtools-mcp` | 에이전트를 라이브 Chrome 인스턴스에 연결한다. 전체 도구 제공 |
| Chrome DevTools CLI | 터미널·셸 자동화용. 도구의 일부만 지원 |
| 에이전트 스킬 | 접근성·성능·메모리 누수·설정 문제 해결처럼 여러 도구를 엮는 전문가 지침 |

준비물은 Node.js LTS와 npm, Chrome 안정화 버전이다. MCP를 지원하는 도구면 어디든 붙는다.

```bash
# Claude Code: 플러그인(MCP + 스킬)
/plugin marketplace add ChromeDevTools/chrome-devtools-mcp
/plugin install chrome-devtools-mcp@chrome-devtools-plugins
# Gemini CLI
gemini extensions install --auto-update https://github.com/ChromeDevTools/chrome-devtools-mcp
# Codex
codex mcp add chrome-devtools -- npx chrome-devtools-mcp@latest
```

`mcpServers` 키를 쓰는 다른 클라이언트는 JSON에 직접 넣는다. 플래그는 `args` 배열에 이어 붙인다.

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```
설치 확인은 `Check the performance of https://developers.chrome.com` 같은 프롬프트로 한다. 브라우저 창이 뜨고 성능 트레이스가 기록되면 성공이다. 실패하면 `Use the Chrome DevTools troubleshooting skill to fix my setup.`으로 스킬에 맡긴다.

### 자주 쓰는 플래그

| 목적 | 플래그 |
| --- | --- |
| 창 없이 실행, 채널·뷰포트 지정 | `--headless`, `--channel=canary`, `--viewport=1280x720` |
| 쓰고 버리는 프로필 | `--isolated` |
| 이미 띄운 Chrome에 붙기 | `--autoConnect`, 또는 `--browser-url=http://127.0.0.1:9222` |
| 프로젝트 폴더 파일 접근 허용 (스크린샷·트레이스 저장, 확장 로드) | `--filesystemRoot=/path` (별칭 `--workspace`, 기본은 OS 임시 디렉터리) |
| 네트워크 제한 | `--blockedUrlPattern`, `--allowedUrlPattern` |
| 민감 헤더 가리기 | `--redactNetworkHeaders` |
| JS 실행 도구 끄기 | `--javascriptEvaluation=false` |
| 기본 끔인 도구 묶음 켜기 | `--memoryDebugging`, `--categoryExtensions`, `--categoryPwa`, `--categoryExperimentalThirdParty`, `--categoryExperimentalWebmcp` |
| 이동·스크립트 실행·스크린샷 도구만 | `--slim` | 전체 목록은 [구성 문서](https://developer.chrome.com/docs/devtools/agents/get-started/configuration?hl=ko)와 GitHub 저장소에 있다.

### 자동 연결: 내가 쓰던 브라우저 넘겨주기

기본값으로 서버는 **새 Chrome 인스턴스**를 띄운다. `--autoConnect`를 쓰면 지금 열린 Chrome에 붙어 탭, 로그인 세션, 확장 프로그램, 재현해 둔 오류 상태를 그대로 물려받는다.

1. 실행 중인 Chrome에서 `chrome://inspect/#remote-debugging`으로 가 원격 디버깅을 켠다.
2. `args`에 `--autoConnect`를 넣는다.
3. 에이전트가 연결할 때 Chrome이 띄우는 권한 대화상자에서 허용을 누른다.

SSO·VPN 뒤의 사내 대시보드처럼 **에이전트가 로그인하지 못하는 페이지**에 특히 쓸모 있다. 사람이 로그인해 문제 상황까지 가 둔 뒤 에이전트에게 넘긴다. 샌드박스라 자동 연결이 안 되면 `--remote-debugging-port=9222 --user-data-dir=<별도 폴더>`로 Chrome을 직접 띄우고 `--browser-url`로 붙는다.

### 쓰임새

| 사례 | 에이전트에게 시키는 일 |
| --- | --- |
| 에뮬레이션 | 모바일·태블릿·데스크톱 뷰포트에서 같은 상호작용을 반복해 깨지는 곳 찾기, 위치 스푸핑으로 매장 찾기 검증, 네트워크·CPU 스로틀링, 다크 모드 전환. Puppeteer `KnownDevices`의 기기를 쓰며, 엔진과 OS는 바뀌지 않는다 |
| Lighthouse 감사 | 접근성·SEO·권장사항·에이전트 브라우징 점수를 재고 실패 항목을 코드로 고치기. 로컬 서버와 `file://`도 된다 |
| 메모리 누수 | 기준 → 작업 → 되돌리기 **세 번의 힙 스냅샷**을 비교해 남은 이벤트 리스너, 분리된 DOM, 무제한 캐시 찾기. 분석 도구는 `--memoryDebugging`을 켜야 생긴다 |
| 확장 프로그램 개발 | 압축 해제한 확장을 설치·다시 로드·액션 트리거·제거하며 수정 → 확인 루프를 자동으로 돌리기 (`--categoryExtensions`) |
| 서드파티 도구 | 페이지가 `devtoolstooldiscovery` 이벤트에 `respondWith()`로 도구(이름·설명·`inputSchema`·`execute`)를 등록하면 에이전트가 캐시 통계, 기능 플래그, 전역 상태 같은 앱 내부를 직접 조회한다 (실험 기능) |

메모리 분석에서 에이전트가 **원본 `.heapsnapshot` 파일을 직접 읽게 두지 않는다.** 컨텍스트 한도를 넘긴다. 분리된 노드가 의도된 캐시일 수도 있으니 수정 전에 사람에게 확인받게 한다. 패널에서 직접 하는 방법은 [[devtools-performance|DevTools로 성능·메모리 분석하기]]에 있다.

서드파티 도구는 도구를 정의한 페이지 안에서만 돌고, 새로고침하거나 출처가 바뀌면 사라진다. DevTools가 탐색할 때마다 이벤트를 다시 보내 목록을 새로 받는다. 에이전트는 기본 도구를 먼저 고를 수 있으므로 **이름과 설명을 구체적으로** 쓴다.

### 보안과 전송 데이터

- 에이전트는 연결된 브라우저의 콘텐츠를 읽고 고칠 수 있다. 로그인된 세션에 붙이면 **사실상 나를 대신해 행동한다.** 자동 연결은 쿠키·저장소·열린 탭 전부를 넘겨주는 것이니 신뢰하는 에이전트에만 쓴다.
- 서버는 로컬 프로세스지만 기본값으로 **사용 통계**와 **성능 트레이스의 URL**(CrUX 실사용 데이터 조회용)을 Google로 보낸다. 끄려면 `--no-usage-statistics`, `--no-performance-crux`를 쓴다. 환경 변수 `CHROME_DEVTOOLS_MCP_NO_USAGE_STATISTICS`나 `CI`가 있어도 통계 수집이 꺼진다.

## WebMCP 디버깅

**WebMCP**는 웹사이트가 자기 기능을 AI 에이전트가 호출할 수 있는 구조화된 도구로 내놓게 하는 **제안 단계의 웹 표준**이다. 도구는 HTML에 선언하거나(선언형) JavaScript로 등록한다(명령형). DevTools MCP 서버는 개발자용 디버깅 도구이고, WebMCP 도구는 브라우저 에이전트를 쓰는 모든 방문자가 호출한다는 점이 다르다. 쓰려면 사이트가 오리진 트라이얼에 등록돼 있거나 로컬 Chrome에서 WebMCP 플래그를 켜야 한다.

| 어디서 | 할 수 있는 일 |
| --- | --- |
| **Application 패널 > WebMCP 창** | 사용 가능한 도구 목록(에이전트에 보이는 이름·설명, 호출 횟수), 호출 기록(상태·입력·출력), 이름·상태·도구 유형별 필터, 도구를 골라 매개변수를 넣고 **도구 실행**으로 수동 테스트 |
| **MCP 서버** (`--categoryExperimentalWebmcp`) | 에이전트가 `list_webmcp_tools`로 등록·스키마를 확인하고 `execute_webmcp_tool`로 실행해 콘솔 오류까지 확인 |

증상별로 보면, 출력 창의 오류는 **스키마 위반**이고, 호출 카운터가 0이면 **에이전트가 도구를 고려하지 않은 것**이다. 에이전트가 자꾸 잘못 호출하면 대개 스키마가 모호하다. 날짜 매개변수에 `Date in YYYY-MM-DD format` 같은 설명과 제약을 붙인다. 나머지 Application 패널 기능은 [[devtools-application|DevTools Application 패널: 저장소·서비스 워커]]에 있다.

## 정리

- DevTools 안의 AI는 **이미 열어 둔 맥락**(요소·요청·파일·트레이스)을 들고 묻는 도구다. 답은 검증하고, 부작용 있는 코드는 읽고 승인한다.
- 회사 코드나 민감한 페이지라면 무엇이 전송되는지 확인하고, 필요하면 `DevToolsGenAiSettings`로 끈다.
- 에이전트용 DevTools는 코딩 에이전트에게 **눈과 손**을 준다. 고친 뒤 브라우저에서 직접 확인하게 해 "완료" 주장을 증거로 바꾼다.
- 기본은 에이전트 전용으로 새로 띄운 브라우저다. 로그인 상태가 필요할 때만 자동 연결을 쓰고, 파일 접근과 네트워크 범위는 플래그로 좁힌다.

관련 노트: [[claude-code-guide|Claude Code 활용 가이드]], [[ai-coding-guardrails|AI 코딩 실무 가드레일]], [[loop-engineering|루프 엔지니어링]], [[web-vitals|웹 성능 지표와 Lighthouse]], [[devtools-performance|DevTools로 성능·메모리 분석하기]], [[devtools-device-emulation|DevTools로 기기·환경 에뮬레이션하기]], [[Chrome-DevTools|Chrome DevTools]]
