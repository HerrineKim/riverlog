---
title: "GA4 시작하기"
concept: "Google Analytics"
summary: "GA4 계정·속성을 만들고 gtag.js 또는 Google Tag Manager(Google 태그)로 웹사이트에 추적 태그를 설치하는 과정."
tags: ["analytics", "ga4", "marketing", "web"]
source: notion
date: "2026-10-13"
sources: ["https://support.google.com/tagmanager/answer/13543899", "https://developers.google.com/tag-platform/security/guides/consent"]
---

**Google Analytics 4(GA4)** 는 웹사이트·앱의 사용자 행동을 이벤트 단위로 수집해 분석하는 도구이다. 이전 버전인 Universal Analytics(UA)는 2023년 7월 데이터 수집이 종료되어, 지금은 GA4가 표준이다. 이론보다 실제 사이트에 태그를 붙여 보며 익히는 것이 빠르다.

## 구조: 계정과 속성

| 단위 | 의미 |
| --- | --- |
| 계정 (Account) | 보통 회사·조직 |
| 속성 (Property) | 분석할 웹사이트(또는 앱) |
| 데이터 스트림 | 속성 안에서 실제 데이터가 들어오는 경로(웹/iOS/Android) |

속성을 만들 때 **업종 카테고리** 선택이 보고서 구성에 영향을 주므로 신경 써서 고른다(예: 쇼핑몰이면 "쇼핑").

## 태그 설치 방법 1: gtag.js 직접 삽입

Tag Manager를 쓸 수 없는 환경이라면, 측정 ID(`G-XXXXXXXXXX`)가 들어간 스니펫을 **모든 페이지의 `<head>`** 에 넣는다.

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
3. GTM 안에서 **Google 태그**(태그 유형 "Google 태그", 태그 ID에 측정 ID `G-…` 입력)를 추가하고, 모든 페이지에서 실행되도록 트리거를 지정한 뒤 게시한다.

> 예전 자료에 나오는 "GA4 구성(Configuration) 태그"는 2023년 9월부터 **Google 태그**로 대체되었고, 기존 태그는 자동으로 전환되었다. ([Tag Manager 도움말](https://support.google.com/tagmanager/answer/13543899))

이후 이벤트 추적을 추가할 때 사이트 코드를 고치지 않고 GTM 화면에서 태그·트리거만 관리하면 되므로, GA4를 제대로 쓰려면 GTM은 사실상 필수이다.

## 동의 모드(Consent Mode)

EU·영국 등 동의가 필요한 지역의 방문자를 받는다면, 쿠키 배너(동의 관리 플랫폼)의 선택을 태그에 전달하는 **동의 모드 v2**를 설정한다. 사용자가 거부하면 태그는 쿠키 없이 최소 신호만 보내고, Google 광고 기능(리마케팅·전환)을 그 지역에서 쓰려면 동의 모드가 필요하다. 자세한 설정은 [Google 동의 모드 가이드](https://developers.google.com/tag-platform/security/guides/consent)를 따른다.

## 연습용 데이터: 데모 계정

Google이 제공하는 **Google Merchandise Store 데모 계정**을 내 GA 계정에 연결하면, 실제 쇼핑몰 데이터로 보고서·탐색 기능을 바로 연습할 수 있다.

관련 노트: [[segment|Segment로 사용자 데이터 수집하기]]
