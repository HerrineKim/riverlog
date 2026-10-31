---
title: "스크린 리더로 테스트하기"
concept: "Screen Reader Testing"
summary: "스크린 리더 테스트는 읽는 순서, 대체 텍스트, 제목·랜드마크·폼·표의 의미가 실제로 어떻게 들리는지 확인한다. 데스크톱은 NVDA나 JAWS 하나에 VoiceOver를, 모바일은 iOS VoiceOver와 Android TalkBack을 쓰고, 각 스크린 리더의 최소 단축키(읽기 시작·중지, 제목·랜드마크·폼 이동, 요소 목록)만 익히면 기본 점검이 된다."
tags: ["accessibility", "frontend", "testing", "aria", "ux"]
source: other
date: "2026-10-17"
sources: ["https://webaim.org/articles/screenreader_testing/", "https://webaim.org/articles/nvda/", "https://webaim.org/articles/jaws/", "https://webaim.org/articles/voiceover/", "https://webaim.org/articles/voiceover/mobile", "https://webaim.org/articles/talkback/", "https://webaim.org/articles/narrator/", "https://webaim.org/articles/dolphin/", "https://webaim.org/projects/screenreadersurvey11/", "https://webaim.org/projects/screenreadersurvey10/", "https://support.google.com/accessibility/android/answer/6151827", "https://support.microsoft.com/en-us/windows/appendix-b-narrator-keyboard-commands-and-touch-gestures-8bdab3f4-b3e9-4554-7f28-8b15bd37410a", "https://support.apple.com/guide/voiceover/turn-voiceover-on-or-off-vo2682/mac", "https://support.apple.com/guide/voiceover/vo35709/mac", "https://www.freedomscientific.com/Content/Documents/Manuals/JAWS/Keystrokes.pdf", "https://web.dev/learn/accessibility/test-assistive-technology", "https://web.dev/learn/accessibility/patterns", "https://webaim.org/presentations/2024/january/"]
---

> WebAIM의 「[Testing with Screen Readers: Questions and Answers](https://webaim.org/articles/screenreader_testing/)」, 스크린 리더별 평가 가이드([NVDA](https://webaim.org/articles/nvda/), [JAWS](https://webaim.org/articles/jaws/), [VoiceOver](https://webaim.org/articles/voiceover/), [iOS VoiceOver](https://webaim.org/articles/voiceover/mobile), [TalkBack](https://webaim.org/articles/talkback/), [Narrator](https://webaim.org/articles/narrator/), [Dolphin](https://webaim.org/articles/dolphin/)), 「[Screen Reader User Survey #11](https://webaim.org/projects/screenreadersurvey11/)」을 바탕으로 재구성하고, JAWS·VoiceOver·TalkBack·Narrator 단축키는 Freedom Scientific·Apple·Google·Microsoft 공식 문서로 확인하고, 테스트 목표와 플랫폼별 조합은 web.dev 「[Learn Accessibility](https://web.dev/learn/accessibility)」의 보조 기술 테스트 편으로 보강한 노트다.
> 위젯 role과 입력 모드 부분은 WebAIM의 교육 자료 「[Web Accessibility Training](https://webaim.org/presentations/2024/january/)」(Jon Whiting·Jared Smith, 2024.01)을 바탕으로 보강했다.

## 스크린 리더 테스트란

스크린 리더는 화면 내용을 음성이나 점자로 내보내는 보조 기술이다. 브라우저가 만든 접근성 트리를 읽으므로, 스크린 리더로 들어 보면 **눈으로는 놓치는 문제**가 드러난다.

| 잘 드러나는 것 | 예 |
| --- | --- |
| 읽는 순서 | CSS로 위치만 옮긴 요소가 소스 순서대로 엉뚱한 자리에서 읽힌다 |
| 대체 텍스트 품질 | 「image123.png」, 주변 문장의 반복 |
| 구조 | 제목이 없거나 단계가 뒤섞임, 표 헤더가 안 읽힘 |
| 폼 | 라벨·그룹 설명·오류가 컨트롤과 묶여 읽히는가 |
| 동적 변화 | 펼침 상태, 라이브 영역 알림, 대화상자 포커스 이동 |
| 오탈자·발음 | 들으면 바로 걸리는 철자 오류 |

스크린 리더 테스트는 [[accessibility-evaluation|접근성 평가]]의 마지막 단계다. 자동 검사와 키보드 점검을 먼저 끝내고 들어간다.

## 스크린 리더 사용자는 어떻게 읽나

| 특징 | 테스트에 주는 뜻 |
| --- | --- |
| 키보드(데스크톱)·제스처(모바일)로 조작 | 마우스로 클릭해 보는 테스트는 의미가 없다 |
| 선형으로 듣는다 | 위치·색·크기 강조는 전달되지 않는다. 소스 순서가 곧 읽는 순서다 |
| 페이지를 통째로 읽지 않는다 | 제목·랜드마크·링크·폼 컨트롤 단위로 건너뛰며 찾는다 |
| 점자 디스플레이를 함께 쓰기도 한다 | 농맹인 사용자는 점자로만 읽는다 |

**작성자는 사용자가 어떤 탐색 방법을 쓸지 고를 수 없다.** 그래서 제목, 랜드마크, 링크 텍스트, 폼 라벨 모두가 제 역할을 해야 한다. 구조 설계는 [[accessible-page-structure|접근 가능한 페이지 구조]]에 있다.

### 설문으로 본 실제 사용 (WebAIM 설문 #11, 2026)

WebAIM이 2026년 7~8월 스크린 리더 사용자 1,780명에게 받은 설문이다. 표본을 통제하지 않았으므로 경향으로 읽는다.

| 항목 | 결과 |
| --- | --- |
| 데스크톱 주 스크린 리더 | JAWS 55.0%, NVDA 32.9%, VoiceOver 6.5%, Narrator 0.4% |
| 데스크톱에서 흔히 쓰는 스크린 리더(복수 응답) | JAWS 69.2%, NVDA 59.3%, VoiceOver 42.0%, Narrator 36.1% |
| 두 개 이상 사용 | 70.3% |
| 주 브라우저 | Chrome 52.3%, Edge 23.6%, Firefox 15.9%, Safari 4.8% |
| 조합 상위 | JAWS + Chrome 31.2%, NVDA + Chrome 17.3%, JAWS + Edge 17.0%, NVDA + Firefox 9.1% |
| 데스크톱 OS | Windows 90.7% |
| 모바일에서 스크린 리더 사용 | 91.8%. 주 플랫폼 iOS 73.3%, Android 24.0% |
| 긴 페이지에서 정보를 찾는 첫 방법 | 제목 이동 67.8%, 찾기(Find) 12.5%, 처음부터 읽기 9.7%, 링크 6.7%, 랜드마크 3.4% |
| 랜드마크를 자주 쓴다 | 28.3% |
| 건너뛰기 링크를 자주 쓴다 | 37.7% |
| 제목 단계가 유용하다 | 88.3% |
| AI로 이미지 설명·대체 텍스트 생성 | 60.1% |

- **제목은 가장 중요한 탐색 수단이다.** 긴 페이지에서 응답자의 67.8%가 제목 이동부터 쓴다.
- 여러 스크린 리더를 섞어 쓰는 사용자가 많다. 특정 제품의 동작에 맞추지 말고 표준 마크업을 따른다.
- 사용자 대부분이 AI로 이미지 설명을 보충하지만, 그것이 `alt`를 빼도 된다는 뜻은 아니다. PDF는 85.6%가 접근성 문제가 있을 가능성이 높다고 답했다.

## 무엇으로 테스트하나

| 스크린 리더 | 플랫폼 | 비용 | 함께 쓸 브라우저 |
| --- | --- | --- | --- |
| NVDA | Windows | 무료(오픈소스) | Chrome, Firefox, Edge |
| JAWS | Windows | 유료. 40분 데모 모드가 있지만 라이선스 조건상 웹 테스트 용도로는 쓰지 못한다 | Chrome, Edge |
| Narrator | Windows 내장 | 무료 | Edge |
| VoiceOver | macOS·iOS·iPadOS 내장 | 무료 | Safari |
| TalkBack | Android 내장 | 무료 | Chrome |
| Dolphin ScreenReader / SuperNova | Windows | 유료(30일 체험) | Chrome |
| Orca | Linux(GNOME 계열 내장) | 무료(오픈소스) | Firefox |
| ChromeVox | ChromeOS 내장 | 무료 | Chrome |

스크린 리더는 **함께 맞춰 만든 브라우저**와 쓸 때 가장 잘 동작한다. 엉뚱한 조합으로 테스트하면 실제 사용자에게는 없는 버그를 만나거나 반대로 놓친다.

- **최소 구성**: 데스크톱은 NVDA 또는 JAWS 하나, 모바일은 iOS VoiceOver. Android 사용자가 많은 서비스면 TalkBack을 더한다.
- 단순한 콘텐츠는 한두 개로 충분하다. JavaScript 위젯, PDF처럼 복잡한 콘텐츠는 여러 조합에서 차이가 난다.
- 대부분의 차이는 링크를 「링크」로 알리느냐 같은 표면적인 것이다. 지원 기술·버그 차이는 실제 사용자가 많이 쓰는 조합(위 설문)으로 확인한다.
- Narrator는 주 스크린 리더로는 거의 쓰이지 않지만 설치 없이 바로 쓸 수 있어 테스트에 쓸 만하다.
- **테스트의 목표는 사용자 경험을 흉내 내는 것이 아니라 코드 문제를 찾는 것이다.** 실제 사용자와 이야기해서 얻는 통찰은 이것과 다르고, 둘 다 필요하다.
- **완벽히 익힐 필요는 없다.** 아래 표의 단축키만으로 기본 점검이 된다. 오히려 숙련자는 초보 사용자가 막히는 곳을 놓치기도 한다. 다만 사용법을 모르는 채로 테스트하면, 조작 실수를 접근성 문제로 오판하기 쉽다.

## 데스크톱 단축키

수정 키는 스크린 리더마다 이름이 다르다. NVDA·JAWS·Narrator는 Insert 또는 Caps Lock(설정에서 Caps Lock으로 바꾸면 손이 편하다. Caps Lock 원래 기능은 두 번 눌러 쓴다), VoiceOver는 `VO` = Control + Option이다. 아래 표에서 `NVDA`, `JAWS`, `Narrator`, `VO`는 그 수정 키를 뜻한다.

| 동작 | NVDA | JAWS | Narrator | VoiceOver (macOS) |
| --- | --- | --- | --- | --- |
| 켜기 | Ctrl + Alt + N | 프로그램 실행(브라우저보다 먼저) | Win + Ctrl + Enter | Cmd + F5 또는 Cmd를 누른 채 Touch ID 세 번 |
| 끄기 | NVDA + Q | JAWS + F4 | Win + Ctrl + Enter | 켜기와 같음 |
| 처음부터/현재 위치부터 읽기 | NVDA + ↓ | JAWS + ↓ | Narrator + ↓ 또는 Narrator + R | VO + A |
| 읽기 중지 | Ctrl | Ctrl | Ctrl | Ctrl |
| 다음 제목 (이전은 Shift) | H, 단계별 1~6 | H, 단계별 1~6 | H, 단계별 1~6 | VO + Cmd + H |
| 다음 랜드마크 | D | R | D | 로터에 랜드마크 항목이 있으면 로터로 |
| 다음 폼 컨트롤 | F | F | F | VO + Cmd + J |
| 다음 링크 | K | Tab 또는 링크 목록 | K | VO + Cmd + L |
| 다음 표 / 셀 이동 | T / Ctrl + Alt + 방향키 | T / Ctrl + Alt + 방향키 | T / Ctrl + Alt + 방향키 | VO + Cmd + T / VO + 방향키 |
| 요소 목록 | NVDA + F7 (링크·제목·랜드마크 등) | JAWS + F5 폼, F6 제목, F7 링크, Ctrl + JAWS + R 랜드마크 | Narrator + F5 랜드마크, F6 제목, F7 링크 | VO + U (로터) |
| 읽기/입력 모드 전환 | NVDA + Space | JAWS + Z | Narrator + Space | (모드 없음) |

### 두 가지 모드

Windows 스크린 리더는 **읽기 모드**와 **입력 모드**를 오간다. 이름은 다르지만 원리는 같다.

| 스크린 리더 | 읽기 모드 (H·F 같은 한 글자 키가 탐색) | 입력 모드 (키 입력이 페이지로 감) |
| --- | --- | --- |
| NVDA | Browse mode | Focus mode |
| JAWS | Virtual Cursor | Forms Mode |
| Narrator | Scan mode | Scan mode 꺼짐 |
| Dolphin | Dolphin Cursor | Forms Mode |

- 텍스트 입력란이나 위젯으로 Tab하면 자동으로 입력 모드가 되고, NVDA·JAWS는 높은 비프음으로 알린다. 나오면 낮은 비프음과 함께 읽기 모드로 돌아온다.
- `tree`, `slider`, `grid`, `tabpanel`, `menu` 같은 위젯 role은 스크린 리더를 입력(애플리케이션) 모드로 바꾼다. 그러면 H·F 같은 탐색 키가 페이지로 넘어가므로, 위젯이 role에 맞는 키 조작을 모두 구현했는지와 사용자가 모드가 바뀐 것을 알 수 있는지 확인한다. 위젯은 Windows 스크린 리더를 **켠 상태와 끈 상태 모두**로 시험한다.
- **잘 만든 위젯이라면 수동 전환이 필요 없다.** 테스트 중에 모드를 직접 바꿔야만 조작된다면 위젯의 role이나 키보드 처리를 의심한다.

### 스크린 리더별 메모

- **NVDA**: Tools → Speech Viewer를 켜면 읽은 내용이 글자로 나와 기록·공유하기 좋다. 입력한 글자 읽기는 끄고, 문장부호 수준과 문서 서식 설정은 기본값을 둔다.
- **JAWS**: 노트북에서도 키보드 배치를 Desktop으로 둔다. Laptop 배치에서는 일부 명령이 동작하지 않는다. JAWS + F1은 현재 요소 도움말이다.
- **VoiceOver**: Safari와 가장 잘 맞는다. Safari 설정 → 고급에서 「Tab 키로 각 항목 강조」를 켠다. 로터(VO + U)에서 좌우 방향키로 제목·링크·폼 컨트롤 같은 목록을 고르고(페이지에 랜드마크가 있으면 랜드마크 목록도 나온다), 글자를 치면 목록이 걸러진다(예: 제목 목록에서 `2`를 치면 h2만). 표에서는 VO + C가 열 헤더, VO + R이 행 헤더를 읽는다. VO + Shift + F11 화면 가리개(Screen Curtain)로 화면을 끄고 소리만으로 테스트한다.
- **Narrator**: 설정(Win + Ctrl + N)에서 상세 수준은 바꾸지 않는다. `alt`가 없는 이미지는 「unlabeled graphic」으로 읽는다.
- **Dolphin**: 시작은 NumPad +, 중지는 Esc, 랜드마크는 `;`, Dolphin + Tab이 요소 찾기(Item Finder)다. 링크 목록 Dolphin + 1, 제목 목록 Dolphin + 2.

## 모바일 제스처

| 동작 | iOS VoiceOver | Android TalkBack |
| --- | --- | --- |
| 켜기 | 설정 → 손쉬운 사용 → VoiceOver, Siri, 또는 손쉬운 사용 단축키(측면/홈 버튼 세 번) | 설정 → 접근성 → TalkBack, 또는 단축키를 켠 뒤 볼륨 키 두 개 3초 |
| 다음/이전 항목 | 한 손가락 오른쪽/왼쪽 쓸기 | 한 손가락 오른쪽/왼쪽 쓸기 |
| 실행 | 두 번 탭 | 두 번 탭 |
| 처음부터 읽기 | 두 손가락 위로 쓸기 | TalkBack 메뉴 → 「위에서부터 읽기」 |
| 현재 위치부터 읽기 | 두 손가락 아래로 쓸기 | 두 손가락 세 번 탭 |
| 말 멈춤/계속 | 두 손가락 탭 | 두 손가락 탭 |
| 탐색 단위 고르기 | 로터: 두 손가락 돌리기 → 제목·링크·폼 컨트롤·랜드마크 | 읽기 컨트롤: 세 손가락 위/아래 쓸기(한 손가락이면 위→아래, 아래→위) |
| 고른 단위로 이동 | 한 손가락 위/아래 쓸기 | 한 손가락 위/아래 쓸기 |
| 메뉴 | (로터가 대신함) | 세 손가락 탭 또는 아래→오른쪽 쓸기 |
| 스크롤 | 세 손가락 쓸기 | 두 손가락 쓸기 |

- TalkBack의 세 손가락 제스처는 TalkBack 9.1 이상에서 된다. 세 손가락 탭으로 메뉴가 열리면 지원하는 기기다. 삼성 기기는 자체 TalkBack을 쓰므로 기기 안내를 따른다.
- iOS 로터에 넣을 항목은 설정 → VoiceOver → 로터에서 고른다. 테스트에는 제목, 링크, 폼 컨트롤, 표, 랜드마크, 버튼, 이미지, 줄, 말하기 속도를 켜 둔다.
- 손을 화면 위로 끌면 손가락 아래 항목을 읽는다(터치 탐색). 화면을 보지 않고 해 보면 실제 경험에 가깝다.
- 블루투스 키보드를 연결해 모바일에서도 키보드 접근을 확인한다. 모바일 입력 방식 기준(WCAG 2.5)도 함께 본다.

## 테스트 흐름

```text
1. 스크린 리더를 켜고 페이지를 새로 연다
2. 처음부터 읽기  → 페이지 제목, 읽는 순서, 대체 텍스트, 불필요한 반복을 듣는다
3. 제목 목록      → 제목만으로 페이지 구성이 보이는가, 단계가 맞는가
4. 랜드마크 이동   → main·nav·search 등이 있고, 같은 종류가 여럿이면 이름이 다른가
5. 링크 목록      → 문맥 없이도 목적을 알 수 있는가
6. 폼            → Tab으로 돌며 라벨·필수·그룹(legend)이 읽히는가, 오류를 내고 알림을 듣는다
7. 위젯·동적 변화  → 펼침/접힘 상태, 대화상자 포커스, 라이브 영역 알림
8. 표            → 셀을 이동할 때 행·열 헤더가 함께 읽히는가
```

이름이 이상하게 들리면 DevTools Accessibility 패널에서 계산된 이름을 확인한다([[aria-basics|ARIA 기초]]). 라벨·오류 연결은 [[accessible-forms|접근 가능한 폼]]에, 위젯 상태는 [[accessible-widgets|접근 가능한 위젯]]에 있다.

## 스크린 리더로만 드러나는 문제

자동 검사와 키보드·시각 점검을 모두 통과한 페이지에서도 귀로 들어야 나오는 문제가 있다.

| 들리는 것 | 원인 | 고치기 |
| --- | --- | --- |
| 페이지 전체를 처음부터 들어야 맥락이 잡힌다 | 랜드마크·제목 없이 `<div class="main">`, `<p class="h1">` | `<main>`, `<h1>`로 바꾸고 CSS만 옮긴다. 보이는 모습은 그대로다 |
| 같은 링크 텍스트가 어디로 가는지 모른다 | 외부 사이트로 가는 링크에 맥락이 없다 | 보이는 텍스트를 늘리거나, 보이는 글자를 포함한 `aria-label`을 준다 |
| 「이미지」라고만 읽힌다 | 인라인 SVG에 이름도 장식 표시도 없다(자동 검사가 못 잡는다) | 장식이면 `role="presentation"`, 정보면 `role="img"` + `<title>` |
| 문단마다 불릿 그림이 읽힌다 | CSS 불릿 이미지가 내용으로 노출된다 | 불릿을 단 요소에 `role="presentation"`(`none`). `aria-hidden`은 문단까지 숨긴다 |
| 입력 칸이 이름 없이 「편집」으로만 읽힌다 | placeholder만 있다 | 보이는 `<label>`을 `for`/`id`로 잇는다 |

## 실제 사용자와 테스트할 때

- 시각장애인 사용자의 피드백은 값지지만, **한 사람의 의견을 대표로 삼지 않는다.** 숙련도, 개인 설정, 쓰는 제품이 제각각이다.
- 스크린 리더 사용자는 **없는 콘텐츠를 알아채지 못할 수 있다.** JavaScript 오류로 본문이 통째로 안 읽혀도 원래 없던 것으로 여긴다. 반대로 비장애인 테스터는 화면을 보느라 읽히지 않는 것을 놓친다. 둘을 함께 쓴다.
- 정식 사용자 연구는 비용이 크므로 사이트 개편, 새 인터페이스, 종합 감사 때 한다. 평소에는 동료나 커뮤니티에 주기적으로 짧은 피드백을 받는다. 진행 방법은 [[Accessibility|웹 접근성]]의 사용성 테스트 절을 본다.
- 스크린 리더 사용자만 보지 않는다. 저시력, 운동, 청각, 인지 장애 사용자의 요구도 같은 무게다([[disability-and-web-use|장애 유형과 웹 사용]]).

## 정리

- 스크린 리더 테스트는 읽는 순서, 이름, 구조, 동적 변화를 **귀로** 확인하는 단계다.
- 데스크톱 NVDA·JAWS 중 하나와 iOS VoiceOver면 기본 구성이 된다. 사용자 조합은 JAWS·NVDA + Chrome이 가장 많다.
- 익힐 것은 읽기 시작·중지, 제목·랜드마크·폼 이동, 요소 목록, 모드 전환 정도다.
- 테스트 중 모드를 수동으로 바꿔야 한다면 위젯이 잘못 만들어졌을 가능성이 크다.
- 사용자 대부분이 제목으로 길을 찾는다. 제목 구조가 스크린 리더 경험의 뼈대다.

관련 노트: [[accessibility-evaluation|접근성 평가 방법과 도구]], [[Accessibility|웹 접근성]], [[aria-basics|ARIA 기초]], [[accessible-page-structure|접근 가능한 페이지 구조]], [[a11y-driven-testing|접근성 기반 테스트]], [[disability-and-web-use|장애 유형과 웹 사용]]
