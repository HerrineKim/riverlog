---
title: "접근성 평가 방법과 도구"
concept: "Accessibility Evaluation"
summary: "접근성 감사는 기준선을 잡고 개발 주기 내내 반복하는 자동·수동·보조 기술 테스트의 조합이다. 자동 검사 도구는 명백한 오류와 사람이 볼 곳을 짚어 줄 뿐 접근 가능한지는 판정하지 못하므로, DevTools로 이름을 확인하고 키보드·시각·콘텐츠·확대·스크린 리더 순으로 수동 점검한다. 결과는 ACR(VPAT)로 보고하고, 오버레이 제품은 이 과정을 대신하지 못한다."
tags: ["accessibility", "frontend", "testing", "wcag", "ux"]
source: other
date: "2026-10-17"
sources: ["https://webaim.org/articles/evaluationguide/", "https://webaim.org/articles/tools/", "https://webaim.org/presentations/2024/january/", "https://wave.webaim.org/", "https://wave.webaim.org/help", "https://webaim.org/articles/label-name/", "https://www.html5accessibility.com/tests/tsbookmarklet.html", "https://overlayfactsheet.com/en/", "https://webaim.org/projects/million/", "https://wave.webaim.org/api/docs", "https://web.dev/learn/accessibility/measure", "https://web.dev/learn/accessibility/test-automated", "https://web.dev/learn/accessibility/test-manual", "https://web.dev/learn/accessibility/glossary", "https://www.w3.org/WAI/test-evaluate/tools/selecting/", "https://www.youtube.com/watch?v=_WUHPk8BGfo", "https://webaim.org/projects/practitionersurvey3/", "https://www.ftc.gov/news-events/news/press-releases/2025/04/ftc-approves-final-order-requiring-accessibe-pay-1-million"]
---

> WebAIM의 「[Web Accessibility Evaluation Guide](https://webaim.org/articles/evaluationguide/)」, 「[Accessibility Evaluation Tools](https://webaim.org/articles/tools/)」, 웹 접근성 교육 자료(「[Virtual Web Accessibility Training](https://webaim.org/presentations/2024/january/)」)와 [WAVE](https://wave.webaim.org/) 도움말, 「[Overlay Fact Sheet](https://overlayfactsheet.com/en/)」을 바탕으로 재구성하고, 감사 계획·도구 선택 기준·자동과 수동의 경계와 자주 나오는 문제는 web.dev 「[Learn Accessibility](https://web.dev/learn/accessibility)」의 측정·자동 테스트·수동 테스트 편으로 보강한 노트다.
> 개발 주기 단계별 도구는 AOA11Y의 「[2024년 제2회 정보접근성 오픈아카데미](https://www.youtube.com/watch?v=_WUHPk8BGfo)」(2024.07) 2부를 바탕으로 보강했다.

## 접근성 평가란

접근성 평가는 페이지가 장애인에게 실제로 쓸 수 있는지를 WCAG 같은 기준에 비춰 확인하는 일이다. **자동 검사 도구는 사이트가 접근 가능한지, 심지어 기준을 준수하는지도 판정하지 못한다.** 접근성은 사람의 경험이기 때문이다. 도구는 명백한 오류를 찾고, 사람이 판단할 곳을 짚어 주는 데까지만 한다.

그래서 평가는 **자동 검사 → 수동 점검 → 보조 기술 테스트** 순서로 한다. 도구가 놓친 것을 사람이 채우는 구조다. 기준은 따로 요구되는 것이 없으면 최신 WCAG(2.2) AA다(기준 고르기는 [[wcag-guidelines|WCAG 지침]]).

## 감사와 테스트 계획

| 용어 | 뜻 |
| --- | --- |
| 접근성 감사(audit) | 정한 기준과 적합성 수준에 비춰 제품을 시험하는 일. 디자인 검토, 자동, 수동, 보조 기술 테스트를 섞는다 |
| ACR(Accessibility Conformance Report) | 감사 결과를 정리한 적합성 보고서. 기준별로 충족·부분 충족·미충족을 밝힌다 |
| VPAT(Voluntary Product Accessibility Template) | ACR을 쓰는 표준 양식. 미국 정보기술산업협회(ITI)가 배포하고, 508조·EN 301 549·WCAG판이 있다. 조달에서 제출을 요구받는 일이 많다 |

- **감사는 한 번으로 끝나지 않는다.** 처음에 기준선을 잡고, 개발 주기 내내 같은 기준으로 반복해 적합성이 어떻게 바뀌는지 본다. 자동 검사는 CI에 넣어 매 변경마다, 수동·보조 기술 테스트는 큰 기능과 출시 전에 돌린다.
- **설계 단계에서 막는 편이 싸다.** 디자인 검토와 접근성 주석은 [[accessible-design-process|디자인 단계의 접근성]]에 있다.
- 적합성은 출발점이다. 장애인과 하는 사용성 테스트, 장애가 있는 사람의 채용, 전문가 자문이 함께 가야 한다([[Accessibility|웹 접근성]]).

| 자동 검사가 하는 것 | 사람이 해야 하는 것 |
| --- | --- |
| `alt`가 **있는지** | 대체 텍스트가 이미지에 **맞는지**, 알맞은 요소에 붙었는지 |
| 단색 배경 위 글자 대비 | 그라데이션·이미지 위 글자 대비 |
| 제목·목록·랜드마크가 **있는지** | 제대로 마크업됐는지, 빠진 요소는 없는지 |
| ARIA가 **있는지**, 문법이 맞는지 | 알맞은 요소에 알맞게 쓰였는지 |
| 포커스 가능한 요소 목록 | 빠진 포커스, 논리적인 순서, 보이는 포커스 표시 |
| iframe에 제목이 있는지 | iframe 안팎의 포커스 순서와 표시 |
| `<video>`가 있는지 | 자막·대본이 있고 맞는지 |
| 여러 페이지를 크롤링해 보고서 작성(상용 도구) | "접근 가능함" 판정 |

자동 검사는 빠르고, 반복할 수 있고, 전문 지식이 적어도 돌린다. 대신 많은 오류를 놓치고, 실제 위반이 아닌 것을 오류로 띄우는 **오탐(false positive)**도 낸다.

자동 검사로 걸리는 문제가 얼마나 흔한지는 [[Accessibility|웹 접근성]]의 WebAIM Million 수치를 본다. 상위 100만 개 홈페이지의 95% 이상에서 자동 검사만으로도 오류가 나온다.

## 도구 고르기

| 기준 | 선택지 |
| --- | --- |
| 형태 | 온라인 서비스(URL 입력), 브라우저 확장, 작성 도구·CMS 플러그인, 서버 설치형(사내망·대규모 사이트) |
| 범위 | 한 페이지씩(무료 도구 대부분), 특정 항목만(대비, 색각 시뮬레이션), 사이트 전체 크롤링(상용) |
| 기능 | 평가만, 평가 + 수정 안내(상용에 많다) |
| 보고 형식 | 텍스트 목록, 페이지 위 아이콘, 기계가 읽는 W3C EARL |
| 기준 | WCAG 2.2·2.1, 508조, 자체 규칙 묶음 중 무엇을 검사하나 |
| 대상 | 웹사이트, 웹 앱, 네이티브 앱, PDF, 키오스크 |
| 쓰는 사람·시점 | 디자이너·개발자·QA 중 누가, 개발 주기의 어느 단계에서, 얼마나 자주 돌리나. 이슈 트래커와 이어지나 |

- 무료 도구는 쓰는 사람이 접근성 기준을 안다고 가정한다. **도구의 판정보다 기준을 아는 쪽이 믿을 만하다.**
- 도구마다 보는 곳이 달라서 **두 개 이상을 섞어 쓰는 편이 낫다.**
- Section 508 기준만 보고하는 도구는 낡았다. 508은 2018년부터 WCAG 2.0 AA를 기준으로 삼는다.
- 최초의 온라인 자동 검사 도구 중 하나는 1996년 CAST가 만든 Bobby다. 지금 W3C WAI의 [평가 도구 목록](https://www.w3.org/WAI/test-evaluate/tools/list/)에는 브라우저 확장, 린터, 데스크톱·모바일 앱, 대시보드, 오픈소스 API까지 100개가 넘는 도구가 있다.

### 자주 쓰는 도구

| 도구 | 용도 |
| --- | --- |
| [WAVE](https://wave.webaim.org/) | 페이지 위에 아이콘으로 오류·경고·구조를 표시. Chrome·Firefox·Edge 확장, 온라인 버전, API, CI에 넣는 독립 엔진이 있다 |
| axe DevTools, Lighthouse, Accessibility Insights | 브라우저·CI 자동 검사. Lighthouse는 Chrome DevTools의 Lighthouse 탭에서 「Accessibility」만 골라 돌리면 점수와 함께 실패 항목, 사람이 확인할 항목을 보여 준다. 점수는 문제의 개수·종류·영향을 반영한 값일 뿐 100점도 접근 가능하다는 뜻이 아니다 |
| [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/), [Link Contrast Checker](https://webaim.org/resources/linkcontrastchecker/) | 색 조합 대비, 밑줄 없는 링크와 본문 사이 대비 |
| ColorZilla, WAVE 색 추출기 | 이미지·그라디언트·반투명 배경 위 글자 색 뽑기 |
| [Text Spacing Bookmarklet](https://www.html5accessibility.com/tests/tsbookmarklet.html) | WCAG 1.4.12 텍스트 간격을 한 번에 적용 |
| Chrome DevTools | 접근 가능한 이름·설명, 상태별 대비, iframe `src` 확인 |

자동 검사를 Playwright·Testing Library 테스트에 넣는 방법은 [[a11y-driven-testing|접근성 기반 테스트]]에 있다.

### 개발 주기 단계별 도구

문제는 늦게 찾을수록 고치기 비싸다. 디자인 파일, 브라우저, 편집기, 빌드 단계마다 도구를 하나씩 두면 각 단계에서 기계가 잡을 수 있는 것은 그 자리에서 걸러진다.

| 단계 | 도구 | 하는 일 |
| --- | --- | --- |
| 디자인 (Figma 플러그인) | Stark | 대비, 글자 크기, 터치 영역, 색각·저시력 시뮬레이터, 대체 텍스트·포커스 순서·제목·랜드마크 주석. 프레임 전체 자동 검사는 유료 |
| | axe for Designers | 프레임 단위 자동 검사(심각도·위치 표시), 대비 측정, 포커스 순서와 위젯 종류별 주석. 무료 플랜이 있다 |
| 브라우저 | Lighthouse | Chrome 내장. axe-core 규칙의 **일부만** 돌리므로 점수가 높아도 문제가 남을 수 있다. DevTools 언어를 바꾸면 한국어 보고서가 나온다 |
| | axe DevTools 확장 | 페이지 전체·일부 영역 검사, WCAG 성공 기준별·심각도별 분류, 보고서 내보내기. 표·모달처럼 의도를 물어 확인하는 유도형 검사(Intelligent Guided Tests)는 유료 |
| | Stark 확장 | 페이지 위에 겹쳐 대비·시뮬레이터, 대체 텍스트·제목·터치 영역·포커스 순서·랜드마크 시각화 |
| | HeadingsMap | 제목 구조를 트리로 보여 준다. 제목 목록으로 탐색하는 스크린 리더 사용자에게 페이지가 어떻게 보이는지 확인 |
| 편집기 (VS Code) | axe Accessibility Linter, webhint | 마크업을 쓰는 중에 레이블 누락, `alt` 누락 등에 밑줄을 친다 |
| 코드·빌드 | `eslint-plugin-jsx-a11y`(React), `eslint-plugin-vuejs-accessibility`(Vue) | 린트 규칙으로 잡아 커밋·빌드에서 막을 수 있다. 권장(recommended) 설정부터 켠다 |
| 컴포넌트 | Storybook `@storybook/addon-a11y` | 스토리마다 axe 검사 결과를 패널로 보여 준다. 컴포넌트 단위로 고친 뒤 조합한다 |

디자인 단계 도구의 **주석 기능**은 대체 텍스트·포커스 순서처럼 개발자가 추측하던 결정을 디자인 파일에 못 박는다([[accessible-design-process|디자인 단계의 접근성]]). 어느 단계 도구든 기계가 확인할 수 있는 것만 잡는다. 읽기 순서·이름의 적절성·위젯 동작은 아래 수동 절차로 본다.

## 평가 절차

```text
0. 준비      광고 차단·비밀번호 관리자·자동 채움 등 화면을 바꾸는 확장을 끈다.
             CodePen 같은 iframe 안의 데모는 iframe 없이 연다(디버그 보기)
1. 자동 검사  WAVE 확장으로 오류(빨강)부터 고치고, 경고·구조 아이콘을 사람이 확인
2. 이름 확인  DevTools Accessibility 패널로 버튼·링크·입력의 접근 가능한 이름 확인
3. 키보드    마우스를 치우고 Tab·Shift+Tab·Enter·Space·방향키·Esc로 과업 끝내기
4. 확대      200% 확대, 1280px 창에서 400% 리플로, 텍스트 간격 북마클릿
5. 대비·색   텍스트 4.5:1, 큰 텍스트·UI 경계·포커스 표시 3:1, 색만으로 정보 전달 금지
6. 스크린 리더 제목·랜드마크·폼·동적 변화가 의도대로 읽히는지 듣기
```

### 1. WAVE로 자동 검사

WAVE는 결과를 오류(error), 대비 오류(contrast), 경고(alert), 기능(feature), 구조(structure), ARIA(aria) 여섯 범주로 나눈다. WAVE 도움말이 색을 밝히는 것은 앞의 셋뿐이다. 빨간 아이콘은 고쳐야 할 오류, 노란 아이콘은 검토할 경고, 초록 아이콘은 확인할 접근성 기능이다.

| 범주 | 뜻 | 할 일 |
| --- | --- | --- |
| 오류 | 거의 확실한 접근성 오류 | 고친다 |
| 대비 오류 | 텍스트 대비 미달 | Contrast 패널에서 통과하는 색 조합을 찾는다 |
| 경고 | 문제일 수 있는 곳 | 사람이 판단한다 |
| 기능 | 접근성을 높이는 요소(`alt`, 라벨 등) | 내용이 맞는지 확인한다 |
| 구조 | 제목·랜드마크·목록 | 구조가 내용과 맞는지 본다 |
| ARIA | role·state·property | 의도대로 쓰였는지 본다 |

- Details 패널의 아이콘을 누르면 페이지에서 해당 위치가 강조되고, Code 버튼으로 해당 마크업을 본다.
- **Styles를 끄면** 페이지가 선형으로 펼쳐져 스크린 리더가 읽는 순서와 숨긴 요소가 드러난다.
- **오류 0개는 접근 가능하다는 뜻이 아니다.** WAVE는 대체 텍스트가 맞는지 판단하지 못하고, 보여만 준다.
- 온라인 버전은 JavaScript 지원이 제한된다. 로그인 뒤 페이지, 로컬 페이지, 동적 페이지는 **브라우저 확장**으로 검사한다.
- iframe은 표시만 하고 내용을 검사하지 않는다. iframe 주소를 따로 열어 검사한다.

### 2. 접근 가능한 이름 확인

ARIA 라벨은 `<label>`, `alt`, 링크 텍스트를 **덮어쓴다.** 그래서 마크업만 보고는 최종 이름을 알 수 없다.

1. Chrome DevTools Elements 패널에서 요소를 고른다.
2. Accessibility 탭의 Computed Properties에서 Name과 Description을 본다. 이름이 어느 출처(`aria-labelledby` → `aria-label` → `<label>` → `title`·`placeholder`)에서 왔는지 계산 순서가 함께 나온다.
3. 보이는 텍스트가 접근 가능한 이름에 들어 있는지 확인한다(WCAG 2.5.3 Label in Name).

이름 계산 규칙 자체는 [[aria-basics|ARIA 기초]], DevTools 사용법은 [[devtools-elements-css|DevTools로 DOM과 CSS 다루기]]를 본다.

### 3. 키보드 점검

| 키 | 기대 동작 |
| --- | --- |
| Tab / Shift+Tab | 다음·이전 인터랙티브 요소로 이동 |
| Enter | 링크·버튼 실행, 폼 제출 |
| Space | 체크박스·버튼 실행, select 열기 |
| 방향키 | 라디오 그룹·select·슬라이더·탭·트리 안에서 이동 |
| Esc | 메뉴·대화상자·툴팁 닫기 |

체크할 것:

- 모든 포커스 대상에 보이는 포커스 표시가 있고(2.4.7), 대비가 3:1 이상이며(1.4.11), 고정 헤더 등에 **가려지지 않는다**(2.4.11).
- 포커스 순서가 시각 순서와 맞는다. `tabindex`에 양수를 쓰지 않는다.
- 마우스 호버로만 열리는 메뉴가 없다. 호버·포커스로 뜬 툴팁은 그 위에 머무는 동안 유지되고 Esc로 닫힌다.
- 드래그·멀티 포인트 제스처에는 버튼 같은 단일 포인터 대안이 있다(2.5.1, 2.5.7).
- 포인터 대상은 최소 24×24 CSS px이다(2.5.8, 예외 있음).
- 건너뛰기 링크가 포커스 때 나타나고, 실행 뒤 Tab을 누르면 본문으로 간다.
- 모바일 메뉴 등 반응형 화면마다 따로 확인한다.
- 마우스를 치우기 어렵다면 마우스 포인터를 숨기는 작은 스크립트(no-mouse-days 같은)를 페이지에 넣고 점검한다.
- 대화상자는 열릴 때 포커스가 들어가고, 모달이면 포커스를 가두고, 닫으면 원래 자리로 돌아온다.

macOS는 시스템 설정의 키보드 탐색을 켜고, Safari는 설정 → 고급에서 「Tab 키로 웹 페이지의 각 항목 강조」를 켜야 Tab이 모든 요소로 간다. 포커스 표시가 없는 곳을 찾을 때는 Chrome의 `chrome://settings/accessibility`에서 「포커스된 객체를 잠시 강조 표시」를 켠다. 키보드 구현 원칙은 [[keyboard-accessibility|키보드 접근성]]에 있다.

### 4. 확대와 텍스트 간격

| 점검 | 방법 | 기준 |
| --- | --- | --- |
| 확대 | Ctrl/Cmd + `+`로 200% | 1.4.4 내용이 잘리지 않는다 |
| 리플로 | 창 너비 1280px에서 400%까지 확대(320 CSS px 폭과 같다) | 1.4.10 가로 스크롤 없이 읽힌다. 표·지도 등은 예외. 대화상자·아코디언·메뉴도 쓸 수 있어야 한다 |
| 텍스트 간격 | 북마클릿으로 줄 높이 1.5배, 문단 간격 2배, 자간 0.12em, 단어 간격 0.16em 적용 | 1.4.12 내용·기능이 사라지지 않는다 |
| 글자만 확대 | Firefox 「텍스트만 확대」로 130~150% | 권장 사항(WCAG 요건 아님) |

리플로와 글꼴 설계는 [[accessible-css-typography|접근성을 위한 CSS와 타이포그래피]]에 있다.

### 5. 대비와 색

- 텍스트 4.5:1, 큰 텍스트(24px 이상 또는 18.67px 굵게) 3:1.
- 아이콘 같은 필수 그래픽, 입력란 테두리 같은 UI 경계, 포커스 표시는 3:1.
- 호버·포커스 상태 대비는 DevTools에서 상태를 강제로 켜고 잰다.
- 밑줄 없이 색으로만 구분한 링크는 본문 글자와 3:1 이상 차이 나고, 호버·포커스 때 색 말고도 바뀌는 것이 있어야 한다.

색과 대비의 원칙은 [[color-motion-accessibility|색과 움직임의 접근성]]을 본다.

### 6. 시각·콘텐츠 점검

화면 확대·브라우저 확대를 켠 채 눈으로 보는 점검과, 글과 맥락을 읽는 점검이다. IBM Equal Access 같은 공개 체크리스트에서 출발해 제품에 맞게 다듬는다.

| 시각 | 콘텐츠 |
| --- | --- |
| 그라데이션·이미지 위 글자 대비 | 페이지 제목·제목·폼 라벨이 분명하고 내용을 설명하나 |
| 제목·목록처럼 **보이지만** 마크업이 아닌 것 | 대체 텍스트가 짧고 정확하고 쓸모 있나 |
| 내비게이션·폼 입력의 일관성 | 색이 유일한 의미 전달 수단인 곳은 없나 |
| 번쩍임·과한 애니메이션 | 「더 보기」, 「여기를 클릭」 같은 모호한 링크는 없나 |
| 글자·단어·줄·문단 간격 | 페이지 안에서 언어가 바뀌는 곳에 `lang`이 있나 |
| 높은 배율에서도 모든 내용이 보이나 | 쉬운 말을 쓰고, 약어를 처음에 풀어 썼나 |

「여기를 클릭」 같은 문구는 린터가 표시할 수 있지만 맥락에 맞게 다시 쓰는 것은 사람의 일이다.

### 7. 항목별 수동 체크포인트

자동 검사가 표시만 하고 판단은 사람에게 넘기는 것들이다. 만드는 방법은 각 링크 노트가 맡는다.

| 영역 | 사람이 확인할 것 | 자세히 |
| --- | --- | --- |
| 이미지 | `alt`가 내용·기능을 전하는가, 장식은 `alt=""`인가, 글자 이미지 대신 실제 텍스트인가, CSS 배경 이미지에 정보가 숨어 있지 않은가 | [[accessible-images-links-text\|이미지·링크·텍스트]] |
| 구조 | 랜드마크가 빠짐없고 같은 종류가 여러 개면 이름이 있는가, 제목이 내용을 설명하고 단계를 건너뛰지 않는가, `h1`이 있는가 | [[accessible-page-structure\|접근 가능한 페이지 구조]] |
| 폼 | 라벨을 누르면 입력에 포커스가 가는가, 필수 표시, 오류를 일부러 내 보고 안내 확인, 같은 정보 재입력 강요 금지(3.3.7), 인지 테스트 없는 인증(3.3.8) | [[accessible-forms\|접근 가능한 폼]] |
| 표 | 데이터 표에 `th`와 `scope`, 표 설명은 `<caption>`, 레이아웃 표에는 헤더 없음 | [[accessible-page-structure\|접근 가능한 페이지 구조]] |
| 링크 | 「여기를 클릭」 같은 모호한 텍스트, 같은 주소로 가는 인접 링크, 대상 없는 페이지 내 링크, 링크와 버튼의 구분 | [[accessible-images-links-text\|이미지·링크·텍스트]] |
| ARIA | `aria-expanded` 같은 상태가 실제로 바뀌는가, 라이브 영역이 알려지는가, `aria-hidden` 안에 포커스 요소가 없는가 | [[aria-basics\|ARIA 기초]], [[accessible-widgets\|접근 가능한 위젯]] |
| 기타 | 페이지 제목과 `lang`, 시간 제한 연장, 자막·대본, 번쩍임 | [[captions-and-transcripts\|자막과 대본]] |

## 자주 나오는 문제와 고치기

일부러 접근성을 망가뜨린 데모 페이지를 단계별로 고쳐 보면, 단계마다 잡히는 문제가 다르다.

| 단계 | 문제 | 고치기 |
| --- | --- | --- |
| 자동 | 버튼에 엉뚱한 `role="list"` → 필수 자식 role 없음, 버튼 이름 사라짐 | 잘못된 role을 지우면 버튼 텍스트가 이름이 된다 |
| 자동 | `aria-hidden="true"` 영역 안의 입력 칸 | `aria-hidden`을 지운다 |
| 자동 | `alt` 없는 로고 링크, 이름 없는 SVG 아이콘 링크 | 목적지를 `alt`로, SVG는 `role="img"` + `<title>` |
| 자동 | 흰 바탕의 청록 `#01aa9d`(2.9:1), 회색 `#7c7c7c`(4.2:1) | `#008576`, `#767676`으로 어둡게 해 4.5:1. 굵은 16px 버튼 글자는 큰 텍스트가 아니라 4.5:1이 필요하다 |
| 자동 | CSS 클래스로 흉내 낸 목록, 양수 `tabindex` | `<ul>`, `tabindex` 제거 |
| 수동 | `:focus { outline: none; }` | 규칙을 지우거나 보이는 포커스 스타일을 준다 |
| 수동 | 입력 칸의 `tabindex="-1"` | 지운다 |
| 수동 | 밑줄 없이 본문과 같은 색인 링크, 1.3:1인 소셜 아이콘 | 밑줄을 넣거나 링크·본문·배경 세 색을 맞춘다. 필수 아이콘은 3:1 |
| 수동 | `text-align: justify` 본문 | 왼쪽 정렬 |

자동 검사가 100점이 된 뒤에도 수동 단계에서, 그 뒤 스크린 리더 단계에서 문제가 계속 나온다. 스크린 리더로만 드러나는 문제는 [[screen-reader-testing|스크린 리더로 테스트하기]]에 있다. 세 단계를 모두 통과해도 완전한 접근성이 보장되지는 않는다.

## 오버레이는 평가를 대신하지 못한다

오버레이(overlay)는 사이트에 스크립트 한 줄을 넣어 접근성을 "자동으로" 고쳐 준다고 파는 서드파티 위젯이다. 글자 크기·대비 조절 버튼을 띄우거나, 페이지를 스캔해 `alt`·라벨·포커스를 자동 수리한다고 주장한다.

| 주장 | 실제 |
| --- | --- |
| 대비·글자 크기 조절 위젯 제공 | 필요한 사용자는 이미 OS·브라우저·보조 기술 설정을 쓴다. 사이트마다 다른 위젯은 중복이다 |
| 자동 수리 | `alt`, 라벨, 오류 처리, 포커스, 키보드 접근을 자동으로 맞게 고치지 못한다. React·Vue처럼 나중에 바뀐 DOM은 놓치고, PDF·캔버스·미디어는 손대지 못한다 |
| 즉시 WCAG 준수 | 모든 성공 기준을 만족해야 준수다. 법적 위험을 없애 주지 않는다 |
| 사용자를 돕는다 | 많은 장애인 사용자가 오히려 방해받거나 막힌다고 보고하고, 오버레이를 차단하는 사람도 있다 |
| (숨은 비용) 보조 기술 감지 | 스크린 리더 사용을 감지해 설정을 켜면 장애 여부라는 민감 정보를 동의 없이 수집하는 셈이 된다 |

[Overlay Fact Sheet](https://overlayfactsheet.com/en/)에는 1,000명 넘는 접근성 실무자·장애인 사용자가 "오버레이를 권하지 않고, 문제를 원인에서 고친다"고 서명했다. [WebAIM 실무자 설문](https://webaim.org/projects/practitionersurvey3/)에서도 응답자 67%(장애가 있는 응답자는 72%)가 오버레이가 효과가 없거나 거의 없다고 답했다. 2025년에는 미국 연방거래위원회(FTC)가 오버레이 업체 accessiBe의 WCAG 준수 보장 광고를 문제 삼아 100만 달러를 내라는 최종 명령을 내렸다([FTC 보도자료](https://www.ftc.gov/news-events/news/press-releases/2025/04/ftc-approves-final-order-requiring-accessibe-pay-1-million)).

## 정리

- 감사는 기준선을 잡은 뒤 개발 주기 내내 반복하고, 결과는 ACR(VPAT 양식)로 남긴다.
- 자동 검사는 출발점이다. **오류 0개는 접근 가능하다는 증거가 아니다.**
- 순서는 WAVE 같은 자동 검사 → DevTools로 이름 확인 → 키보드 → 확대·텍스트 간격 → 대비 → 스크린 리더다.
- 경고 아이콘과 대체 텍스트, 읽는 순서, 포커스 흐름은 사람이 판단한다.
- 도구는 두 개 이상 섞고, 도구보다 기준을 먼저 익힌다.
- 오버레이는 평가도 수리도 대신하지 못한다. 문제는 소스에서 고친다.

관련 노트: [[Accessibility|웹 접근성]], [[wcag-guidelines|WCAG 지침]], [[accessible-design-process|디자인 단계의 접근성]], [[screen-reader-testing|스크린 리더로 테스트하기]], [[a11y-driven-testing|접근성 기반 테스트]], [[keyboard-accessibility|키보드 접근성]], [[devtools-elements-css|DevTools로 DOM과 CSS 다루기]]
