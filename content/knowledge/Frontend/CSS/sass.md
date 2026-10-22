---
title: "Sass: 파일 구조, 믹스인과 @extend"
concept: "Sass"
summary: "CSS 전처리기 Sass의 쓰임새와 설치, 파셜 파일을 폴더별로 나누는 아키텍처(7-1 패턴), 중첩·파일 크기 규칙, 믹스인과 @extend의 차이와 둘을 합친 DRY 믹스인, @extend로 프레임워크 클래스를 시맨틱한 이름 뒤에 숨기는 법."
tags: ["css", "sass", "architecture", "frontend"]
source: other
date: "2026-10-21"
sources: ["https://webactually.com/2014/08/19/sass-%ed%94%84%eb%a1%9c%ec%a0%9d%ed%8a%b8%eb%a5%bc-%ec%9c%84%ed%95%9c-%ec%95%84%ed%82%a4%ed%85%8d%ec%b2%98/", "https://webactually.com/2014/06/03/sass-%eb%b0%b0%eb%82%ad%ea%be%b8%eb%a6%ac%ea%b8%b0/", "https://webactually.com/2019/12/27/sass-%eb%af%b9%ec%8a%a4%ec%9d%b8-%ec%a4%91%eb%b3%b5-%eb%b0%b0%ec%a0%9c%ed%95%98%ea%b8%b0/", "https://webactually.com/2014/06/25/sass%ec%9d%98-extend%eb%a1%9c-%eb%b6%80%ed%8a%b8%ec%8a%a4%ed%8a%b8%eb%9e%a9%ec%9d%84-%ec%8b%9c%eb%a7%a8%ed%8b%b1%ed%95%98%ea%b2%8c-%ed%99%95%ec%9e%a5%ed%95%98%ea%b8%b0/", "https://webactually.com/2014/08/09/%ec%9c%88%eb%8f%84%ec%9a%b0%ec%97%90%ec%84%9c-sass-%ec%84%a4%ec%b9%98%ed%95%98%ea%b8%b0/", "https://sass-lang.com/documentation/breaking-changes/import/", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/CSS/Sass%20vs%20Less%20vs%20Stylus.md"]
---

> Hugo Giraudel의 「[Sass 프로젝트를 위한 아키텍처](https://webactually.com/2014/08/19/sass-%ed%94%84%eb%a1%9c%ec%a0%9d%ed%8a%b8%eb%a5%bc-%ec%9c%84%ed%95%9c-%ec%95%84%ed%82%a4%ed%85%8d%ec%b2%98/)」(2014.08), Marshall Norman의 「Sass 배낭 꾸리기」(2014.06), Sam Richard의 「Sass 믹스인 중복 배제하기」(2019.12), Brad Barrow의 「Sass의 @extend로 부트스트랩을 시맨틱하게 확장하기」(2014.06), 웹액츄얼리 북스팀의 「윈도우에서 SASS 설치하기」(2014.08)를 바탕으로 재구성한 노트다.
> 「다른 전처리기와 PostCSS」는 「[Frontend_TIL: Sass vs Less vs Stylus](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/CSS/Sass%20vs%20Less%20vs%20Stylus.md)」를 바탕으로 각 도구의 현재 상태를 확인해 보강했다.

## Sass란

Sass(Syntactically Awesome Style Sheets)는 CSS로 컴파일되는 **전처리기**다. 브라우저는 Sass를 모른다. 작성자와 `.css` 파일 사이에 끼어 변수, 중첩, 믹스인, 상속(`@extend`), 함수, 파일 분할을 제공한다. 흔히 `.scss` 문법(CSS와 같은 중괄호 문법)을 쓴다.

| 기능 | 하는 일 |
| --- | --- |
| 변수 `$brand` | 값 한 곳에서 관리. 컴파일 후 사라진다 |
| 중첩 | 선택자를 HTML 구조처럼 들여 쓴다 |
| 파셜 `_name.scss` | 단독으로 컴파일되지 않고 다른 파일에 합쳐지는 조각 |
| 믹스인 `@mixin` / `@include` | 인자를 받는 스타일 묶음. 부를 때마다 속성을 복사한다 |
| 상속 `@extend` | "이 선택자도 저 선택자와 같은 스타일"이라고 선택자를 합친다 |
| 플레이스홀더 `%name` | `@extend` 전용 선택자. 확장되지 않으면 출력되지 않는다 |

### 네이티브 CSS와의 역할 분담

CSS가 Sass의 대표 기능을 상당 부분 흡수했다.

| Sass 기능 | 네이티브 CSS 대응 |
| --- | --- |
| 변수 `$x` | 커스텀 속성 `--x`. 실행 중에 바뀌고 캐스케이드를 따른다 |
| 중첩 | 네이티브 중첩(`&` 포함). 모든 주요 브라우저가 지원한다 |
| `lighten()`, `mix()` 같은 색 함수 | `color-mix()`, 상대 색상 문법 |
| 파일 분할 | `@import`·`@layer`가 있지만 요청이 늘어 빌드 도구 번들링이 여전히 필요 |

Sass에 남는 강점은 **믹스인, 반복문·조건문, 맵 같은 데이터 구조, 모듈 시스템, 빌드 시점 계산**이다. 실행 중에 바뀌어야 하는 값(테마, 다크 모드)은 Sass 변수가 아니라 CSS 커스텀 속성이 맞다([[css-color-variables|CSS 커스텀 속성으로 색상 체계 짜기]]).

### 다른 전처리기와 PostCSS

| 도구 | 특징 | 지금의 위치 |
| --- | --- | --- |
| Sass (2006) | 가장 먼저 나왔다. Ruby 구현이 느려 한때 Less에 밀렸다가, Node에서 도는 구현이 나온 뒤 주류가 됐다 | 전처리기 중 사실상 표준. 공식 구현은 Dart Sass |
| Less (2009) | JavaScript로 구현되어 브라우저에서도 컴파일할 수 있었다. Bootstrap 3가 써서 퍼졌다 | Bootstrap 4부터 Sass로 옮겨 새 프로젝트에서는 드물다 |
| Stylus (2010) | 중괄호·세미콜론·콜론을 생략할 수 있는 들여쓰기 문법, 많은 내장 기능 | 유지보수가 뜸해 새로 고를 이유가 적다 |
| PostCSS | 전처리기가 아니라 **CSS를 파싱해 플러그인으로 변환하는 도구**다. 새 문법을 쓰는 게 아니라 표준 CSS를 입력으로 받는다 | Autoprefixer, 미래 문법을 옛 브라우저용으로 바꾸는 postcss-preset-env, Tailwind CSS 같은 도구가 이 위에서 돈다. Lightning CSS가 같은 일을 빠르게 하는 대안이다 |

전처리기의 공통 이점은 변수·중첩·믹스인으로 반복을 줄이고 파일을 나눠 구조를 잡는 것이고, 비용은 빌드 단계와 별도 문법을 팀 전체(디자이너·퍼블리셔 포함)가 익혀야 한다는 것이다. CSS가 변수와 중첩을 갖게 된 지금은 「전처리기 없이 네이티브 CSS + PostCSS(또는 Lightning CSS)」도 흔한 선택이다.

## 설치: 예전과 지금

공식 구현은 Dart Sass이고 Node 패키지로 설치한다. 과거에는 Ruby를 먼저 깔고 `gem install sass`로 Ruby Sass를 설치했지만, Ruby Sass는 2019년에 지원이 끝났다. C++ 구현인 LibSass(node-sass)도 2020년에 폐기됐다.

```bash
npm install -D sass
npx sass src/scss/main.scss dist/main.css --watch
```

Vite, Next.js 같은 빌드 도구는 `sass` 패키지만 설치하면 `.scss` 파일을 바로 불러온다.

## 파일 구조: 개발은 여러 파일, 배포는 한 파일

전처리기의 큰 이점은 **성능 손해 없이 CSS를 여러 파일로 나눌 수 있다**는 것이다. 개발 중에는 잘게 나누고, 배포할 때는 한 파일로 합친다. 널리 쓰이는 폴더 구조가 7-1 패턴(폴더 7개 + 진입 파일 1개)이다.

```text
scss/
├─ base/        리셋(normalize), 기본 타이포그래피
├─ helpers/     변수, 함수, 믹스인, 플레이스홀더 (utils/, abstracts/라고도 부른다)
├─ layout/      헤더, 푸터, 사이드바, 그리드, 폼 같은 큰 뼈대
├─ components/  버튼, 캐러셀, 미디어 객체 같은 작은 모듈 (modules/)
├─ pages/       특정 페이지 전용 스타일 (_home.scss)
├─ themes/      여러 테마가 있을 때만
├─ vendors/     부트스트랩 등 외부 CSS. 직접 고치지 않는다
└─ main.scss    루트에는 이 파일 하나. 나머지를 불러오기만 한다
```

- 외부 라이브러리를 덮어쓸 때는 vendors 파일을 고치지 말고 `vendors-extensions/` 같은 별도 폴더에 덮어쓰는 파일을 둔다.
- 특정 페이지에만 필요한 큰 스타일은 공용 번들에 합치지 않고 그 페이지에서만 불러올 수도 있다.
- 폴더는 한 단계면 충분한 경우가 많다. 구조가 낯설면 `main.scss` 옆에 README를 둔다.
- 황금률은 하나다. **팀이 모두 납득하는 구조를 고르고, 문서로 남긴다.**

```scss
// main.scss: @import 대신 @use로 불러온다
@use 'helpers/variables';
@use 'base/reset';
@use 'layout/header';
@use 'components/button';
```

`@use`는 파일을 한 번만 불러오고 멤버에 네임스페이스를 붙인다(`variables.$brand`). 여러 파셜을 한 진입점으로 다시 내보낼 때는 `@forward`를 쓴다.

| 옛 방식 | 상태 | 대체 |
| --- | --- | --- |
| Sass `@import` | Dart Sass 1.80.0(2024.10)부터 폐기 예고(deprecated). 경고만 내고 아직 동작한다. 3.0.0에서 제거 예정(1.80.0 이후 최소 2년 뒤) | `@use`, `@forward` |
| 전역 내장 함수 `map-merge()`, `darken()` 등 | `@import`와 함께 폐기 예고, 3.0.0에서 제거 예정 | 모듈 함수 `map.merge()`, `color.adjust()` |
| `/` 나눗셈 | 폐기 예고 | `math.div()` 또는 `calc()` |

옮기는 작업은 공식 도구 `sass-migrator`(`npx sass-migrator module --migrate-deps main.scss`)가 대부분 자동으로 한다. 2026년 10월 기준 Dart Sass는 1.x대이며 3.0.0은 나오지 않았다. 일정은 [Sass 공식 breaking changes 문서](https://sass-lang.com/documentation/breaking-changes/import/)에서 확인한다.

## 파일과 규칙 안의 순서

Sass 구조는 배낭 꾸리기와 같다. 무겁고 자주 꺼내지 않는 것(글꼴, 색상처럼 전체에 영향을 주는 설정)을 먼저 넣고, 자주 바뀌는 작은 것을 위에 얹는다.

| 규칙 | 기준 |
| --- | --- |
| 파일 하나 = 모듈 하나 | 모듈 이름으로 파일을 찾을 수 있게 |
| 파일 길이 | 150줄 안팎. 200줄을 넘으면 나누거나 리팩터링을 검토 |
| 규칙 블록 안 순서 | 믹스인 `@include` → 일반 속성 → 미디어 쿼리 → 중첩 선택자 |
| 중첩 깊이 | 2~3단계까지. 더 깊어지면 스타일을 나눈다 |

중첩이 깊으면 출력 선택자가 길어지고 특정도가 올라가 덮어쓰기 어려워진다([[selectors|CSS 선택자와 우선순위]]).

## 믹스인과 @extend

둘 다 "반복을 없애는" 도구지만 출력이 다르다.

| | 믹스인 | @extend |
| --- | --- | --- |
| 인자 | 받는다. 변형을 만들기 좋다 | 못 받는다. 전부 아니면 전무 |
| 출력 CSS | 부를 때마다 속성을 **복사** | 선택자를 쉼표로 **합친다**. 속성은 한 번 |
| 약점 | 출력이 부풀고, 같은 값이 여러 곳에 흩어진다 | 원본 규칙 위치로 선택자가 옮겨져 소스 순서가 꼬일 수 있다. 미디어 쿼리 경계를 넘지 못한다 |

```scss
%btn-base { padding: .5em 1em; border-radius: 4px; font-weight: 600; }

@mixin button($bg) {
  @extend %btn-base;       // 고정 속성: 선택자 합치기로 한 번만 출력
  background: $bg;         // 바뀌는 속성: 호출마다 출력
}

.btn-primary { @include button($green); }
.btn-danger  { @include button($red); }
```

```css
/* 출력 */
.btn-primary, .btn-danger { padding: .5em 1em; border-radius: 4px; font-weight: 600; }
.btn-primary { background: #2a8; }
.btn-danger  { background: #d33; }
```

DRY 믹스인은 이 아이디어를 끝까지 밀어붙인 패턴이다. 믹스인을 **정적 부분**과 **동적 부분**으로 나누고, 정적 부분은 처음 호출될 때 `@at-root`로 플레이스홀더를 만들어 그 뒤로는 확장만 한다. 이미 만든 플레이스홀더는 맵(`map.merge`)과 `unique-id()`로 기억한다. 작성자는 믹스인 하나만 부르고, 출력에서는 고정 속성이 한 번만 나온다.

이런 메타프로그래밍은 Sass 코드를 읽기 어렵게 만든다. 전송 시 gzip·Brotli 압축이 반복 속성을 상당히 줄이므로, 출력 크기가 실제 문제로 측정될 때만 도입한다.

## @extend로 프레임워크 클래스를 숨기기

부트스트랩을 그대로 쓰면 HTML이 `class="col-md-4 col-sm-6 row"`처럼 **보이는 모양**을 설명하는 클래스로 가득 찬다. 프레임워크를 모르는 사람은 이 요소가 무엇인지 알 수 없다.

```scss
// HTML에는 의미만: <article class="author"> <img class="author__photo"> …
.author        { @extend .row; }
.author__photo { @extend .col-sm-3; }
.author__bio   { @extend .col-sm-9; }
```

- **가독성**: HTML이 콘텐츠의 의미를 말한다.
- **재사용성**: `author` 컴포넌트를 어디서나 같은 이름으로 쓴다.
- **이식성**: 나중에 프레임워크를 바꿔도 HTML은 그대로 두고 Sass만 고친다.

이 방향은 겉모양을 클래스로 드러내자는 OOCSS와 정반대다. 둘의 장단은 [[oocss|객체 지향 CSS(OOCSS)]]에서 비교한다. 이름 규칙을 더 체계화하려면 BEM이나 SMACSS를 함께 쓴다.

## 정리

- Sass는 컴파일 시점의 도구다. 실행 중에 바뀌는 값은 CSS 커스텀 속성으로.
- 개발은 파셜로 잘게, 배포는 한 파일. base·helpers·layout·components·pages·vendors로 나누고 팀과 합의한다.
- 파일은 모듈 하나, 150줄 안팎, 중첩은 2~3단계까지.
- 변형이 필요하면 믹스인, 같은 스타일 공유는 `@extend` + 플레이스홀더. 둘을 섞으면 출력 중복을 줄일 수 있다.
- 지금은 Dart Sass(`npm i -D sass`)와 `@use`가 표준이다. `@import`와 전역 함수는 3.0.0에서 사라진다.

관련 노트: [[oocss|객체 지향 CSS(OOCSS)]], [[css-color-variables|CSS 커스텀 속성으로 색상 체계 짜기]], [[selectors|CSS 선택자와 우선순위]], [[styling|React 스타일링: CSS Modules와 styled-components]], [[css-history|CSS의 역사로 본 CSS가 어려워진 이유]]
