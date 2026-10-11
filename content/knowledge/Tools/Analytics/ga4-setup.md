---
title: "GA4 시작하기"
concept: "Google Analytics"
summary: "GA4 계정·속성을 만들고 gtag.js 또는 Google Tag Manager로 웹사이트에 추적 태그를 설치하는 과정."
tags: ["analytics", "ga4", "marketing", "web"]
source: notion
---

**Google Analytics 4(GA4)** 는 웹사이트·앱의 사용자 행동을 이벤트 단위로 수집해 분석하는 도구입니다. 이전 버전인 Universal Analytics(UA)는 2023년 7월 데이터 수집이 종료되어, 지금은 GA4가 표준입니다. 이론보다 실제 사이트에 태그를 붙여 보며 익히는 것이 빠릅니다.

## 구조: 계정과 속성

| 단위 | 의미 |
| --- | --- |
| 계정 (Account) | 보통 회사·조직 |
| 속성 (Property) | 분석할 웹사이트(또는 앱) |
| 데이터 스트림 | 속성 안에서 실제 데이터가 들어오는 경로(웹/iOS/Android) |

속성을 만들 때 **업종 카테고리** 선택이 보고서 구성에 영향을 주므로 신경 써서 고른다(예: 쇼핑몰이면 "쇼핑").

## 태그 설치 방법 1: gtag.js 직접 삽입

Tag Manager를 쓸 수 없는 환경이라면, 측정 ID(`G-XXXXXXXXXX`)가 들어간 스니펫을 **모든 페이지의 `<head>`** 에 넣습니다.

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## 태그 설치 방법 2: Google Tag Manager (권장)

1. GTM에서 **컨테이너**를 만든다.
2. 안내되는 스니펫 두 개를 사이트의 `<head>`와 `<body>` 시작 부분에 각각 설치한다.
3. GTM 안에서 GA4 구성 태그(측정 ID)를 추가하고 게시한다.

이후 이벤트 추적을 추가할 때 사이트 코드를 고치지 않고 GTM 화면에서 태그·트리거만 관리하면 되므로, GA4를 제대로 쓰려면 GTM은 사실상 필수입니다.

## 연습용 데이터: 데모 계정

Google이 제공하는 **Google Merchandise Store 데모 계정**을 내 GA 계정에 연결하면, 실제 쇼핑몰 데이터로 보고서·탐색 기능을 바로 연습할 수 있습니다.
