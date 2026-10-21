---
title: "로딩 UI: 스피너, 로딩 애니메이션, 스켈레톤, 프로그레스 바"
concept: "Loading UI"
summary: "기다림을 줄일 수 없을 때 체감을 다루는 로딩 UI 네 가지를 정리했다. 짧고 부분적인 로딩은 스피너, 핵심 액션은 브랜드 로딩 애니메이션, 페이지 전체는 스켈레톤, 10초 넘는 작업과 단계형 흐름은 프로그레스 바를 쓴다. 1초 미만이면 아무것도 띄우지 않는다."
tags: ["frontend", "ux", "ui", "animation", "accessibility"]
source: other
date: "2026-10-21"
sources: ["https://yozm.wishket.com/magazine/detail/1238/", "https://www.nngroup.com/articles/skeleton-screens/", "https://www.nngroup.com/articles/progress-indicators/", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EC%84%B1%EB%8A%A5%20%EC%B5%9C%EC%A0%81%ED%99%94/%EC%8A%A4%EC%BC%88%EB%A0%88%ED%86%A4%20UI%20%28Skeleton%20UI%29.md"]
---

> 뉴봄이의 「[빙글빙글 돌아가는 로딩만 로딩이 아니야!](https://yozm.wishket.com/magazine/detail/1238/)」(요즘IT, 2021.12)를 바탕으로, 사용 기준은 닐슨 노먼 그룹의 진행 표시·스켈레톤 스크린 가이드로 보강해 재구성한 노트다. 스켈레톤 구현은 「[Frontend_TIL: 스켈레톤 UI](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/%EC%84%B1%EB%8A%A5%20%EC%B5%9C%EC%A0%81%ED%99%94/%EC%8A%A4%EC%BC%88%EB%A0%88%ED%86%A4%20UI%20%28Skeleton%20UI%29.md)」을 바탕으로 보강했다.

## 로딩 UI란

서버 응답이나 데이터 불러오기가 늦어질 때 **시스템이 일하고 있다는 사실을 알리는 화면 요소**다. 로딩이 길어질수록 사용성이 떨어지고, 먹통처럼 보이면 사용자는 앱을 끄고 재방문을 꺼린다. 로딩을 완전히 없앨 수는 없으므로, 상황에 맞는 로딩 UI로 **기다림의 체감**을 줄인다.

로딩 UI는 성능 최적화를 대신하지 않는다. 기다림을 덜 지루하게 만들 뿐, 기다림 자체는 줄이지 않는다.

## 네 가지 유형

| 유형 | 모양 | 언제 쓰나 |
| --- | --- | --- |
| 스피너(Spinner) | 작은 원·점이 무한 회전 | 짧고 **부분적인** 로딩. 카드 하나, 목록 하나, 버튼 하나 |
| 로딩 애니메이션 | 브랜드 그래픽이 무한 반복 | 서비스의 **핵심 액션**: 요청서 작성, 구매, 찜하기 |
| 스켈레톤 스크린(Skeleton Screen) | 콘텐츠가 놓일 자리를 회색 상자·막대로 미리 그린 화면 | **페이지 전체**나 주요 화면의 첫 로딩 |
| 프로그레스 바(Progress Bar) | 얇은 막대가 진척도만큼 찬다 | 끝을 아는 긴 작업, 회원가입·설문 같은 **단계형 흐름** |

스피너와 브랜드 로딩 애니메이션은 모두 같은 그래픽이 무한 반복되는 **루프 애니메이션(loop animation)**이다. 둘 다 「얼마나 남았는지」는 알려 주지 않는 **불확정(indeterminate)** 표시이고, 프로그레스 바는 진척도를 보여 주는 **확정(determinate)** 표시다.

### 1. 스피너

가장 익숙한 로딩 표시다. 화면 일부만 새로 불러오는, 대략 4초 이내의 짧은 로딩에 그 자리에 띄운다. 최종 CTA 버튼 안에 스피너를 넣어 「눌렸고 처리 중」임을 알리는 **프로그레스 버튼(progress button)**으로도 쓴다. 이렇게 하면 「두 번 누르지 마세요」 같은 경고 문구 없이 중복 제출을 막을 수 있다.

스피너만 돌리기보다 「댓글을 불러오는 중…」처럼 **무엇을 기다리는지** 글로 함께 알리면 덜 불안하다.

### 2. 브랜드 로딩 애니메이션

서비스 캐릭터나 로고를 움직여 강한 인상을 남긴다. 대신 「나 지금 로딩 중이야!」라고 대놓고 보여 주는 느낌이 있어서, **모든 화면 전환에 쓰면 오히려 기다림이 도드라진다.** 사용자가 결과를 기대하며 기다리는 핵심 액션에만 아껴 쓴다.

### 3. 스켈레톤 스크린

실제 데이터가 렌더링되기 전에 **어떤 레이아웃으로 콘텐츠가 자리 잡을지** 구조를 먼저 보여 준다. 이미지 자리에는 상자, 글 자리에는 막대를 둔다. 로딩 전후 화면이 부드럽게 이어지므로 같은 시간이라도 더 짧게 느껴진다. 마이리얼트립 앱에서는 캡처하기 어려울 만큼 찰나에 지나간다. Slack은 가운데에 기본 로딩 표시를, 왼쪽 메뉴에는 스켈레톤을 함께 보여 준다.

| 종류 | 특징 | 판단 |
| --- | --- | --- |
| 정적(static) | 회색 자리 표시만 | 기본형 |
| 애니메이션(pulse·shimmer) | 깜빡이거나 빛이 훑고 지나간다 | 진행 중이라는 신호가 되지만 산만할 수 있다. 움직임 줄이기 설정을 따른다 |
| 프레임만(frame-display) | 헤더·푸터·배경만 보여 준다 | 레이아웃 단서가 없어 고장 난 화면처럼 보인다. 쓰지 않는다 |

- 화면마다 따로 만들어야 하므로 **중요도가 높고 레이아웃이 자주 바뀌지 않는 화면**에 쓴다.
- 스켈레톤이 실제 콘텐츠와 크기가 같아야 데이터가 도착할 때 레이아웃이 튀지 않는다. 자리 잡기는 [[cls-optimization|CLS 최적화: 자리를 먼저 잡기]]와 같은 원리다.
- 다운로드·업로드·파일 변환처럼 진척도가 있는 작업에는 맞지 않는다. 프로그레스 바를 쓴다.
- 실제 화면과 모양이 너무 다르면 로딩 중이 아니라 다른 정보를 보여 주는 UI로 오해한다.

**만드는 법**: 실제 컴포넌트와 **같은 마크업 구조와 같은 레이아웃 CSS**(크기·여백·배치)를 공유하고, 글자·이미지 자리만 색 막대로 채운 뒤 배경색을 깜빡이는 애니메이션을 준다.

```css
.card, .skeleton { display: flex; gap: 10px; padding: 20px; height: 155px; } /* 레이아웃은 공유 */
.skeleton-img   { width: 75px; height: 75px; border-radius: 50%; }
.skeleton-title { width: 150px; height: 12px; }
.skeleton-line  { width: 210px; height: 10px; }

.skeleton :is(.skeleton-img, .skeleton-title, .skeleton-line) {
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { background-color: #94a3b8; }
  50%      { background-color: #cbd5e1; }
}
@media (prefers-reduced-motion: reduce) {
  .skeleton * { animation: none; }
}
```

React에서는 `<Suspense fallback={<CardSkeleton />}>`의 `fallback`으로 쓰는 경우가 많다. 화면마다 손으로 만들기 번거로우면 `react-loading-skeleton`(기존 컴포넌트 모양을 따라 막대를 그린다)이나 `react-content-loader`(SVG로 원·사각형을 배치한다) 같은 라이브러리를 쓴다.

### 4. 프로그레스 바

「요청을 처리하고 있고, 지금 이만큼 왔으니 조금만 기다려 달라」는 신호다. 진행률(%)이나 남은 시간을 함께 보이기도 한다. 회원가입·설문처럼 여러 단계로 나뉜 흐름에서는 단계 표시로 쓴다.

- 퍼센트를 계산하기 어려우면 「주소 3/50 업데이트 중」처럼 **단계 수**를 보여 준다.
- 처음엔 느리게, 끝으로 갈수록 빠르게 차는 편이 낫다. 99%에서 멈추는 막대가 가장 실망스럽다.
- 긴 작업에는 **취소**할 방법을 준다.

## 기다리는 시간별 선택

| 예상 대기 | 쓰는 것 |
| --- | --- |
| 1초 미만 | 아무것도 띄우지 않는다. 잠깐 번쩍이는 스피너·스켈레톤이 오히려 거슬린다 |
| 약 1~10초 | 부분 로딩이면 스피너, 페이지 전체면 스켈레톤 |
| 10초 이상 | 진행률이나 예상 시간을 보여 주는 프로그레스 바 |

어떤 경우든 사용자의 동작에는 **즉시** 반응한다. 버튼을 눌렀는데 아무 변화가 없으면 사용자는 다시 누른다. 예상 시간이 들쭉날쭉하면 더 일찍 프로그레스 바로 넘어간다. 각 구간에서 사람이 시간을 어떻게 느끼는지는 [[ui-density|UI 밀도]]의 「시간 밀도」에 있다.

## 접근성

| 대상 | 구현 |
| --- | --- |
| 불러오는 영역 | 로딩 중인 컨테이너에 `aria-busy="true"`를 달고, 끝나면 지운다 |
| 상태 알림 | 「불러오는 중」, 「불러왔습니다」를 `role="status"` 영역에 글로 넣어 스크린 리더에 알린다. 스피너 그림 자체는 `aria-hidden="true"` |
| 프로그레스 바 | 네이티브 `<progress value max>`를 먼저 쓴다. 직접 만들면 `role="progressbar"`와 `aria-valuenow`·`aria-valuemin`·`aria-valuemax`, 접근 가능한 이름(`aria-label`) |
| 움직임 | `prefers-reduced-motion: reduce`이면 shimmer·회전을 멈추거나 줄인다 |

```css
@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; }
}
```

움직임 민감성은 [[color-motion-accessibility|색과 움직임의 접근성]]에, 스피너 애니메이션 코드는 [[css-animation|CSS 애니메이션: transition과 @keyframes]]에 있다.

## 정리

- 로딩 UI는 기다림의 체감을 줄인다. 로딩 자체를 줄이는 최적화가 먼저다.
- 1초 미만은 표시하지 않고, 부분은 스피너, 페이지 전체는 스켈레톤, 10초 이상은 프로그레스 바다.
- 브랜드 로딩 애니메이션은 인상이 강한 만큼 핵심 액션에만 쓴다.
- 스켈레톤은 실제 레이아웃과 같은 크기로, 프레임만 보여 주는 형태는 피한다.
- 스피너에도 글을 붙이고, 움직임 줄이기 설정과 `aria-busy`·`role="status"`를 챙긴다.

관련 노트: [[ui-density|UI 밀도: 시각·정보·디자인·시간·가치]], [[ui-elements-glossary|UI 요소 용어집: 입력·내비게이션·정보·컨테이너]], [[ui-engineering-problems|UI 엔지니어링의 열두 가지 문제]], [[streaming-ssr|스트리밍 SSR]], [[cls-optimization|CLS 최적화: 자리를 먼저 잡기]]
