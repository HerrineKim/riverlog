---
title: "DevTools로 성능·메모리 분석하기"
concept: "DevTools Performance"
summary: "Performance 패널의 실시간 지표 화면과 트레이스 녹화·읽기(메인 트랙, 플레임 차트, Bottom-up·Call tree, 긴 작업, 인사이트, 주석, 저장·공유, 선택기 통계), 성능 모니터, 렌더링 탭과 레이어 패널, 커버리지, 메모리 패널로 누수·팽창·잦은 GC를 찾는 절차, Lighthouse 실행법을 정리한다."
tags: ["devtools", "tools", "performance", "memory", "debugging", "frontend"]
source: other
date: "2026-10-21"
sources: ["https://developer.chrome.com/docs/devtools/performance", "https://developer.chrome.com/docs/devtools/performance/overview", "https://developer.chrome.com/docs/devtools/performance/reference", "https://developer.chrome.com/docs/devtools/performance/annotations", "https://developer.chrome.com/docs/devtools/performance/save-trace", "https://developer.chrome.com/docs/devtools/performance/selector-stats", "https://developer.chrome.com/docs/devtools/performance/nodejs", "https://developer.chrome.com/docs/devtools/performance/timeline-reference", "https://developer.chrome.com/docs/devtools/performance-monitor", "https://developer.chrome.com/docs/devtools/rendering", "https://developer.chrome.com/docs/devtools/rendering/performance", "https://developer.chrome.com/docs/devtools/layers", "https://developer.chrome.com/docs/devtools/coverage", "https://developer.chrome.com/docs/devtools/memory", "https://developer.chrome.com/docs/devtools/memory-problems", "https://developer.chrome.com/docs/devtools/memory-problems/get-started", "https://developer.chrome.com/docs/devtools/memory-problems/heap-snapshots", "https://developer.chrome.com/docs/devtools/memory-problems/allocation-profiler", "https://developer.chrome.com/docs/devtools/memory-inspector", "https://developer.chrome.com/docs/devtools/lighthouse", "https://engineering.linecorp.com/ko/blog/vue-memory-leak-analysis/", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EC%84%B1%EB%8A%A5%20%EC%B5%9C%EC%A0%81%ED%99%94/Chrome%20Performance%20%ED%8C%A8%EB%84%90%EB%A1%9C%20%20bottleneck%20%ED%98%84%EC%83%81%20%EB%B6%84%EC%84%9D.md"]
---

> Chrome for Developers의 「[Chrome DevTools 문서](https://developer.chrome.com/docs/devtools?hl=ko)」를 바탕으로 재구성한 노트다. SPA 라우트 전환 누수는 LINE Engineering의 「[Vue 컴포넌트 – 메모리 누수 분석하기](https://engineering.linecorp.com/ko/blog/vue-memory-leak-analysis/)」로 보강했다. 무거운 함수를 찾는 예는 「[Frontend_TIL: Chrome Performance 패널로 bottleneck 현상 분석](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EC%84%B1%EB%8A%A5%20%EC%B5%9C%EC%A0%81%ED%99%94/Chrome%20Performance%20%ED%8C%A8%EB%84%90%EB%A1%9C%20%20bottleneck%20%ED%98%84%EC%83%81%20%EB%B6%84%EC%84%9D.md)」을 바탕으로 보강했다.

이 노트는 DevTools로 **측정하고 원인을 찾는 절차**를 다룬다. LCP·INP·CLS 같은 지표의 뜻과 기준값, Lighthouse의 개념은 [[web-vitals|웹 성능 지표와 Lighthouse]]에, 레이아웃·페인트·합성의 원리는 [[browser-rendering|브라우저 렌더링 과정]]에 있다.

## 무엇을 할 때 어디를 여나

| 하려는 일 | 도구 | 여는 법 |
| --- | --- | --- |
| 지금 페이지의 LCP·CLS·INP를 바로 본다 | Performance 패널 실시간 지표 화면 | 성능 탭 |
| 느린 클릭·버벅이는 애니메이션의 원인을 찾는다 | Performance 패널 녹화 | 성능 탭 → 녹화 |
| CPU·DOM 노드·리스너 수를 실시간 그래프로 본다 | 성능 모니터 | 명령 메뉴 → `Performance monitor` |
| 다시 그려지는 영역·레이아웃 이동을 화면에서 본다 | 렌더링 탭 | 명령 메뉴 → `Rendering` |
| 합성 레이어 구성과 이유를 본다 | 레이어 패널 | 명령 메뉴 → `Layers` |
| 안 쓰는 JS·CSS 바이트를 찾는다 | 커버리지 | 명령 메뉴 → `coverage` |
| 메모리 누수를 찾는다 | 메모리 패널, Chrome 작업 관리자 | 명령 메뉴 → `memory`, `Shift+Esc` |
| 접근성·SEO까지 한 번에 감사한다 | Lighthouse 패널 | Lighthouse 탭 |

명령 메뉴는 `Command+Shift+P`(Mac), `Control+Shift+P`(Windows·Linux)로 연다. 측정은 확장 프로그램 노이즈가 없는 **시크릿 창**에서 한다.

## Performance 패널

### 실시간 지표 화면

패널을 열면 녹화 없이도 로컬 **LCP·CLS**가 점수(양호·개선 필요·나쁨)와 함께 바로 잡힌다. 페이지와 상호작용하면 **INP**도 잡힌다. SPA의 클라이언트 측 이동(소프트 내비게이션)은 SOFT NAV 배지로 따로 잰다.

- LCP 요소와 지표 하위 단계는 마우스를 올리면 보인다. **상호작용·레이아웃 이동** 표에는 요소별 시간이 쌓여 특정 상황에서만 나는 INP·CLS 문제를 잡는다. 반복되면 트레이스를 녹화한다.
- **필드 데이터**(다음 단계 > 필드 데이터 > 설정)를 켜면 CrUX 실사용자 값과 로컬 값을 나란히 보고, 기기·CPU·네트워크 제한 사전 설정도 추천받는다. `localhost:8080` → 실제 도메인처럼 개발·프로덕션 출처를 매핑할 수 있다.

### 녹화

- **런타임 성능**: 스크롤·클릭·애니메이션처럼 실행 중 성능. 녹화 → 상호작용 → 중지.
- **로드 성능**: 기록 및 새로고침. `about:blank`로 비운 뒤 새로고침하고, 로드가 끝나면 몇 초 뒤 자동으로 멈춘다.

| 캡처 설정(톱니바퀴) | 쓰임 |
| --- | --- |
| CPU 제한 | 모바일 CPU 흉내. 저가형 기기 확인은 20배 느림. **보정**으로 실제 저가·중가 기기에 맞춘 사전 설정을 만든다 |
| 네트워크 제한 | 느린 네트워크 흉내 |
| JavaScript 샘플 사용 중지 | 메인 트랙에서 JS 호출 스택을 빼 오버헤드를 줄인다 |
| 고급 페인트 계측·CSS 선택자 통계 (느림) | 프레임별 레이어·페인트 프로파일러, 선택자 비용 |

스크린샷·메모리 체크박스로 프레임별 화면과 메모리 그래프를 더하고, 걸레 아이콘으로 GC를 강제한다. 코드에서 `console.profile()`·`console.profileEnd()`로 감싸면 그 구간의 CPU 프로필이 Performance 패널에 바로 열린다.

### 트레이스 읽기

**플레임 차트**: x축은 시간, y축은 호출 스택이다. **위 이벤트가 아래 이벤트를 일으킨다.** 막대가 넓을수록 오래 걸렸다. 노란색은 스크립팅, 보라색은 렌더링이다.

| 트랙·표시 | 보는 것 |
| --- | --- |
| Main | 메인 스레드 활동. 이벤트를 누르면 요약 탭에 지속 시간, 소스 줄 링크, 스택 트레이스가 나온다 |
| 빨간 삼각형 | 문제 경고. 작업에 붙으면 **긴 작업**이고 **50ms를 넘는 부분은 빨간 빗금**으로 칠해진다 |
| Network | 요청 폭포. 렌더링 차단 요청에 빨간 삼각형, 우선순위 변경, `Server-Timing` 분석 |
| Interactions | 입력 지연·처리 시간·표시 지연. 200ms를 넘으면 INP 경고 |
| Layout shifts | 보라색 다이아몬드와 클러스터. 누르면 점수·요소·원인 후보 |
| Animations | 합성되지 않은 애니메이션에 빨간 삼각형과 실패 이유 |
| Frames | 녹색(제때), 노란 점선(부분), 빨간(드롭) 프레임 |
| Timings | `performance.mark()`·`measure()` 사용자 타이밍. FCP·LCP·DCL·L 마커 |

**이니시에이터 화살표**: 이벤트를 고르면 원인과 결과가 화살표로 이어진다. 레이아웃 무효화 → 레이아웃, 애니메이션 프레임 요청 → 실행, 타이머 설치 → 실행 같은 쌍이다.

**탐색과 정리**

- `W`·`S` 확대·축소, `A`·`D` 좌우 이동, `Shift`+드래그로 구간 길이 측정, `Command/Control+F`로 활동 검색. 개요에서 범위를 골라 확대하면 탐색경로가 쌓인다.
- 함수 우클릭: 숨기기 `H`, 하위 숨기기 `C`, 반복 하위 숨기기 `R`, 재설정 `U`·`T`, 무시 목록 추가 `I`. 트랙 이름 우클릭 → Configure tracks로 트랙 순서를 바꾸고 숨긴다.
- **Dim 3rd parties**로 서드파티를 회색 처리한다. 아무것도 고르지 않으면 요약 탭에 퍼스트 파티·서드파티별 전송 크기와 메인 스레드 시간 표가 나온다.

### 표로 보기와 인사이트

| 탭 | 질문 |
| --- | --- |
| Call tree | 어떤 **루트 활동**(Event, Paint 등)이 가장 많은 일을 일으켰나 |
| Bottom-up | 어떤 활동이 **직접** 가장 많은 시간을 썼나 |
| Event log | 녹화 중 일어난 **순서**대로. 1ms·15ms 미만 거르기 |

**자체 시간(Self)** 은 그 활동에서 직접 쓴 시간, **총 시간(Total)** 은 자식까지 합친 시간이다. Call tree·Bottom-up 오른쪽의 **가장 무거운 스택**은 고른 활동 아래 가장 오래 걸린 경로를 보여 준다.

**인사이트(Insights) 탭**은 Lighthouse 성능 감사와 같은 분석을 트레이스 위에서 보여 준다. LCP·INP 하위 단계, LCP 요청 발견 문제, 서드파티, 레거시·중복 JS 등을 항목으로 펼치고, 누르면 해당 이벤트가 트레이스에 강조된다. 통과한 항목은 아래에 접혀 있다.

### 예: 버벅이는 애니메이션

```text
CPU 4배 느림으로 녹화 → CPU 차트가 꽉 참, 요약 탭은 대부분 렌더링
  └─ Animation Frame Fired 하나를 확대 → 보라색 Layout 줄과 강제 리플로우 경고
       └─ 요약 탭의 소스 링크 → 스타일을 쓰고 곧바로 위치를 읽는 줄
```

고치는 법은 [[browser-rendering|브라우저 렌더링 과정]]의 강제 동기 레이아웃과 `transform`·`opacity` 애니메이션이다. 고친 뒤 다시 녹화해 이벤트가 줄었는지 비교한다.

### 예: 렌더링을 늦추는 무거운 함수

```text
로드를 녹화 → 번들 JS가 도착한 뒤 Main에 컴포넌트 이름(App, ViewPage …)이 쌓인 긴 작업
  └─ 플레임 차트 맨 아래에 같은 함수(removeSpecialCharacter)가 넓게 반복
       └─ Bottom-up에서 자체 시간 순 정렬 → 이 함수가 1위
            └─ 소스 링크: 특수문자 14개마다 문자열 전체를 훑으며 substring으로 새 문자열을 만든다
```

문자 집합 × 문자열 길이만큼 돌면서 매번 문자열을 새로 만드는 O(n·m) 루프였다. 정규식 한 번(`` str.replace(/[#_*~&;![\]`>\n=-]/g, '') ``)으로 바꾸면 긴 작업이 크게 준다. 플레임 차트에서 **넓고 아래에 깔린 막대**, Bottom-up에서 **자체 시간이 큰 함수**가 고칠 곳이다.

### 주석, 저장, 공유

- 왼쪽 사이드바 **주석** 탭: 항목 더블클릭으로 라벨, 화살표로 두 항목 연결, `Shift`+드래그로 구간 라벨. 메인 트랙 라벨은 Gemini가 제안할 수도 있다([[devtools-ai-agents|AI 지원]]).
- 다운로드 → **트레이스 저장**: 주석, 리소스 콘텐츠, 스크립트 소스 맵, gzip 압축을 고른다. 리소스·소스 맵을 넣으면 받는 쪽에서 소스 링크와 원래 함수 이름이 살지만 **트레이스 파일도 그만큼 민감해진다.** 불러오기는 업로드 버튼이다.

### 선택기 통계

오래 걸린 **Recalculate Style** 이벤트(INP의 표시 지연을 늘린다)의 원인을 찾을 때 쓴다. 캡처 설정에서 CSS 선택자 통계를 켜고 녹화한 뒤, 스타일 재계산 이벤트를 골라 아래 **선택기 통계** 탭을 연다(녹화 전체 합계는 선택을 풀고 CPU 차트를 더블클릭). **경과 시간**이 크고, **일치 시도**는 많은데 **일치 수**는 적고, **느린 경로 불일치 비율**이 높은 선택자부터 고친다. 오버헤드가 크니 끝나면 끈다.

### Node.js 프로파일링

`node --inspect file.js`(Deno는 `deno --inspect`)로 띄우고, DevTools 툴바의 녹색 Node 버튼이나 `chrome://inspect`로 붙은 뒤 Performance 패널에서 녹화한다. 예전 JS 프로파일러 패널은 지원 중단됐다.

## 성능 모니터

CPU 사용량, JS 힙 크기, DOM 노드·이벤트 리스너·문서·프레임 수, 초당 레이아웃·스타일 재계산 수를 실시간 그래프로 그린다. 페이지를 이동해도 유지되므로 스크롤하며 **DOM 노드와 Layout/sec**를 지켜보면 레이아웃 스래싱이나 노드 폭증을 바로 알아챈다. 대략의 감을 잡는 도구다. 원인은 녹화로 찾는다.

## 렌더링 탭: 성능 관련 옵션

| 옵션 | 화면에 보이는 것 | 의심할 상황 |
| --- | --- | --- |
| 페인트 플래싱 | 다시 칠한 영역이 녹색으로 깜박 | 화면 전체가 깜박이거나 안 바뀌어야 할 곳이 칠해짐 |
| 레이아웃 이동 영역 | 새로고침 시 이동한 영역이 보라색 | CLS 원인 요소 찾기 |
| 레이어 테두리 | 주황·황록 레이어 테두리, 청록 타일 | 레이어가 너무 많거나 큼 |
| 프레임 렌더링 통계 | 우상단 FPS 추정치, 프레임 플롯, GPU 래스터 상태, GPU 메모리 | 애니메이션 중 드롭 프레임 |
| 스크롤 성능 문제 | 스크롤 관련 리스너가 걸린 요소가 청록색 | 스크롤이 무겁다 |

`prefers-color-scheme` 같은 CSS 미디어 기능 에뮬레이션은 [[devtools-device-emulation|DevTools로 기기·환경 에뮬레이션하기]]에 있다.

## 레이어 패널

왼쪽 트리에 렌더링된 레이어가 선택자·크기와 함께 나오고, 가운데에 3D 다이어그램이 나온다. 레이어를 누르면 **합성 이유**, 메모리 예상치, 페인트 수, 느린 스크롤 영역이 보인다.

- **Paints**를 켜고 레이어의 페인트 프로파일러를 열면 그리기 명령과 비용 히스토그램이 나온다. **Slow scroll rects**를 켜면 스크롤을 느리게 할 수 있는 리스너가 걸린 레이어가 분홍색이 된다.
- 다이어그램은 `WASD`로 이동, `V`+드래그 회전, `0`으로 초기화한다. 레이어 우클릭으로 요소 패널로 가거나 DOM 변경 중단점을 건다.
- Performance 패널에서 고급 페인트 계측을 켜고 프레임을 고르면 그 프레임의 레이어 탭이 생긴다.

## 커버리지: 사용 안 한 JS·CSS

범위를 **함수별** 또는 **블록별**로 고르고 새로고침 버튼으로 녹화한다. 로드에 쓰인 코드를 잡고 상호작용하는 동안 계속 기록한다. 중지하면 리소스별 총 바이트, **사용 안 한 바이트**, 사용 막대(회색이 미사용)가 나오고, 행을 누르면 소스 패널에서 미사용 줄이 줄 번호 옆 회색 선으로 표시된다. URL·유형 필터와 내보내기가 있다. 미사용 코드를 **찾기**는 쉽지만 페이지별로 필요한 코드만 싣도록 고치는 일은 스택마다 다르다. 줄이는 기법은 [[responsible-javascript|책임감 있는 자바스크립트]]에 있다.

## 메모리

### 문제 유형

| 유형 | 사용자가 느끼는 증상 | 먼저 볼 곳 |
| --- | --- | --- |
| 누수(leak) | 쓸수록 점점 느려진다 | 메모리 그래프가 계단식으로만 오름 |
| 팽창(bloat) | 처음부터 계속 느리다 | 주 사용자 기기에서 테스트. 정해진 「너무 많음」 수치는 없다 |
| 잦은 GC | 자주 멈칫한다. GC 동안 스크립트가 멈춘다 | 메모리·힙 그래프가 자주 오르내림 |

### 1차 확인

- **Chrome 작업 관리자**(`Shift+Esc`): 헤더 우클릭으로 JavaScript 메모리 열을 켠다. **메모리 사용량**은 OS 메모리(DOM 노드 포함), **JavaScript 메모리**의 괄호 안 값은 도달 가능한 객체의 실시간 크기다.
- **Performance 녹화 + 메모리 체크박스**: 녹화 시작과 끝에 GC를 강제한다. JS 힙·문서·DOM 노드·리스너·GPU 메모리 그래프에서 GC 뒤에도 내려오지 않는 계단을 찾는다.

### 메모리 패널의 프로필

| 프로필 | 쓰임 |
| --- | --- |
| 힙 스냅샷 | 한 시점의 JS 객체·DOM 노드 메모리 분포. 비교해서 누수 원인 찾기 |
| 타임라인의 할당 계측 | 시간에 따른 할당. 녹화 끝까지 살아남은 객체로 누수 격리 |
| 할당 샘플링 | 오버헤드가 작은 함수별 할당 근사치. 긴 작업에 적합 |
| 분리된 요소 | JS 참조 때문에 살아 있는 분리된 HTML 노드와 개수 |

### 힙 스냅샷 읽기

- **Shallow size**는 객체 자체 크기, **Retained size**는 그 객체가 사라지면 함께 풀리는 크기다. 작은 객체도 다른 객체를 붙잡아 retained size가 클 수 있다. **Distance**는 GC 루트(window)에서의 거리로, 같은 종류인데 유독 먼 객체는 살펴볼 만하다.
- 뷰: **Summary**(생성자별), **Comparison**(두 스냅샷 차이), **Containment**(window부터 구조, 클로저 분석), **Statistics**.
- Summary 필터: 스냅샷 사이에 할당된 객체, 중복 문자열, 분리된 노드가 유지하는 객체, 콘솔이 유지하는 객체.
- 아래 **Retainers**가 그 객체를 붙잡은 참조 경로다. `@` 뒤 숫자는 스냅샷 간에 유지되는 객체 ID다. 콘솔에서 평가한 값도 객체를 붙잡으니 중단점이 없고 콘솔이 깨끗할 때 찍는다.

### 누수 찾는 절차

```text
스냅샷 1 → 의심 작업 실행 후 되돌리기(열고 닫기) → 스냅샷 2
  └─ Comparison 뷰: 되돌렸는데 남은 객체가 있나
  └─ 클래스 필터에 Detached → 분리된 DOM 트리 펼치기
       └─ Retainers에서 붙잡은 변수 확인 → 필요 없을 때 참조를 끊는다
```

**할당 타임라인**은 녹화 중 약 50ms마다 스냅샷을 찍는다. 파란 막대는 끝까지 살아남은 할당, 회색은 수거된 할당이다. 파란 막대 구간을 드래그하면 그때 할당된 생성자만 남는다. **할당 샘플링** 결과는 기본으로 Heavy (Bottom Up) 뷰라 가장 많이 할당한 함수가 위에 온다. 잦은 GC를 확인한 뒤 어디서 할당하는지 찾을 때 쓴다.

`ArrayBuffer`·`TypedArray`·`DataView`, Wasm의 `WebAssembly.Memory` 바이트를 직접 보려면 소스 패널에서 멈춘 뒤 범위의 버퍼 옆 아이콘으로 **메모리 검사기**를 연다.

### SPA: 라우트 전환 누수

SPA는 페이지를 새로 불러오지 않으므로, 화면을 떠난 컴포넌트가 해제되지 않으면 라우트를 오갈수록 메모리가 쌓인다.

```text
1. Performance 녹화(메모리 체크) 중 같은 라우트 왕복을 여러 번 반복
   └─ JS 힙·DOM 노드 그래프가 GC 뒤에도 계단식으로 오르면 누수
2. 라우트 이동 전후 힙 스냅샷 → 클래스 필터에 컴포넌트 이름(또는 Detached)
   └─ 정상: 현재 라우트의 요소 + 직전 라우트의 분리된 요소 정도만 남는다
   └─ 그 밖에 떠난 화면의 컴포넌트 인스턴스가 남아 있으면 누수
3. 누수 라우트의 최상위 컴포넌트에서 자식 컴포넌트를 하나씩 빼며 다시 측정
   └─ 해제되지 않는 컴포넌트를 좁혀 간다. 원인이 여러 개일 수 있으니 하나 찾고 멈추지 않는다
```

| 흔한 원인 | 해제 방법 |
| --- | --- |
| 전역 객체(`window`, 이벤트 버스)에 단 리스너 | 컴포넌트 해제 훅(`onUnmounted`, `useEffect` 정리 함수)에서 제거. `AbortController`의 `signal`로 한 번에 떼어도 된다 |
| `setInterval`·`setTimeout`, 구독(웹소켓, 옵저버) | 해제 훅에서 `clear*`·`unsubscribe`·`disconnect` |
| 싱글턴·모듈 스코프 캐시가 컴포넌트·DOM 참조를 보관 | 라우트 전환 때 비우거나 `WeakMap`·`WeakRef`로 보관 |
| 부모·자식 인스턴스를 서로 참조 | 하나가 남으면 연결된 트리 전체가 남는다. 해제 시 참조를 끊는다 |
| 클로저가 큰 객체·DOM을 붙잡음 | 필요한 값만 캡처한다 |

GC가 무엇을 도달 가능하다고 보는지는 [[garbage-collection|가비지 컬렉션]]에 있다.

## Lighthouse 실행

1. 시크릿 창에서 Lighthouse 패널을 열고 모드를 고른다. **탐색**은 새 로드, **기간**은 상호작용하는 동안, **스냅샷**은 새로고침 없이 지금 상태를 감사한다.
2. 기기와 카테고리를 고른다. 설정 버튼에서 저장소 삭제, JavaScript 샘플링, 제한 방식(시뮬레이션 / DevTools 제한)을 정한다.
3. 끝나면 점 3개 메뉴에서 보고서를 저장하거나 **성능 패널에서 트레이스 보기**로 넘어간다.

DevTools의 Lighthouse는 그 기기의 다른 부하, 확장 프로그램, 쿠키·저장소의 영향을 받는다. **다른 기기에서 낸 점수끼리는 비교하지 않는다.** 실행 간 비교는 PageSpeed Insights나 Lighthouse CI가 낫다. 성능 디버깅은 같은 분석을 더 자세히 보여 주는 Performance 패널의 인사이트를 쓰고, Lighthouse는 접근성·SEO·권장사항 감사에 쓴다.

## 정리

- 처음엔 실시간 지표·성능 모니터로 증상을 보고, 반복되면 녹화해 원인을 판다.
- 트레이스는 긴 작업(빨간 빗금)과 경고 삼각형에서 시작해 Bottom-up으로 직접 비용, Call tree로 원인 루트를 본다.
- 렌더링 비용은 페인트 플래싱·레이어 패널·선택기 통계로, 안 쓰는 코드는 커버리지로 확인한다.
- 메모리는 작업 관리자와 메모리 그래프로 유형을 가른 뒤 스냅샷 비교와 Retainers로 붙잡은 참조를 찾는다.
- 고친 뒤에는 같은 조건으로 다시 잰다.

관련 노트: [[web-vitals|웹 성능 지표와 Lighthouse]], [[browser-rendering|브라우저 렌더링 과정]], [[responsible-javascript|책임감 있는 자바스크립트]], [[re-rendering|리렌더링 원인과 추적]], [[devtools-network|DevTools Network 패널]], [[devtools-debugging|DevTools로 JavaScript 디버깅하기]], [[devtools-device-emulation|DevTools로 기기·환경 에뮬레이션하기]], [[devtools-ai-agents|DevTools의 AI 지원과 에이전트용 DevTools(MCP)]], [[Chrome-DevTools|Chrome DevTools]], [[lcp-optimization|LCP 최적화]], [[inp-optimization|INP 최적화]], [[cls-optimization|CLS 최적화]]
