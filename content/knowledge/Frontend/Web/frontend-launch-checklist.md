---
title: "프론트엔드 출시 전 체크리스트"
concept: "Launch Checklist"
summary: "웹 페이지를 배포하기 전에 확인할 항목을 head·HTML·CSS·이미지·폰트·JavaScript·보안·성능·접근성·SEO 열 가지로 나눠, 우선순위와 자세한 설명이 있는 노트로 잇는 점검표. 항목은 사람이 외우지 않고 린터·Lighthouse·CI로 자동화하는 것이 기본이다."
tags: ["frontend", "web", "performance", "accessibility", "seo", "security"]
source: other
date: "2026-10-21"
sources: ["https://github.com/kesuskim/Front-End-Checklist", "https://github.com/thedaviddias/Front-End-Checklist"]
---

> 「[프론트엔드 체크리스트](https://github.com/kesuskim/Front-End-Checklist)」(David Dias의 [Front-End Checklist](https://github.com/thedaviddias/Front-End-Checklist) 한국어 번역)의 분류를 뼈대로, 항목은 오늘 기준으로 고쳐 재구성한 노트다.

## 체크리스트를 쓰는 법

출시 직전에 「뭘 빠뜨렸지」를 기억에 맡기면 매번 다른 것을 빠뜨린다. 체크리스트는 **분야별 최소 기준**을 적어 둔 목록이다. 항목마다 우선순위를 붙인다.

| 우선순위 | 뜻 |
| --- | --- |
| 높음 | 빠지면 페이지가 깨지거나, 사용자 일부가 못 쓰거나, 보안 사고가 난다. 반드시 지킨다 |
| 중간 | 품질이 눈에 띄게 떨어진다. 가능하면 지킨다 |
| 낮음 | 있으면 좋다. 프로젝트 성격에 따라 뺀다 |

**사람이 확인하는 항목은 줄이고 도구가 확인하게 만든다.** HTML 검증·린트·접근성 규칙·Lighthouse 점수는 CI에서 매 커밋 돌리고, 사람의 체크리스트에는 도구가 못 보는 것(키보드로 끝까지 써 보기, 스크린 리더로 읽어 보기, 오류 페이지 문구)만 남긴다.

## 분야별 핵심 항목 (우선순위 높음)

| 분야 | 확인할 것 | 자세히 |
| --- | --- | --- |
| head | `<!doctype html>`, `<meta charset="utf-8">`, 뷰포트 메타, 페이지마다 다른 `<title>`·description, 파비콘, `lang` 속성 | [[html-head-metadata\|문서 head와 메타데이터]] |
| HTML | 시맨틱 요소(`header`·`main`·`nav`), 제목 순서, 404·5xx 오류 페이지, 깨진 링크 없음, W3C 검증 통과 | [[semantic-html\|시맨틱 HTML]] |
| CSS | 반응형(모바일 우선), 인라인 스타일 지양, 린터(Stylelint) 통과, 쓰지 않는 CSS 제거, 다크 모드·`prefers-reduced-motion` 대응 | [[responsive-design\|반응형 디자인]] |
| 이미지 | 최적화·현대 포맷(AVIF·WebP), `width`·`height` 명시로 자리 확보, 의미 있는 `alt`, 화면 밖은 `loading="lazy"` | [[responsive-images\|반응형 이미지]], [[image-compression\|이미지 압축]] |
| 웹 폰트 | WOFF2, 쓰는 글자만 서브셋, `font-display`, 필요한 굵기만 | [[web-font-performance\|웹 폰트 성능]] |
| JavaScript | 인라인 스크립트 지양(CSP와 충돌), `defer`·`type="module"`로 렌더링 차단 없음, 라우트별 코드 분할, ESLint 통과, 콘솔 에러 0 | [[script-loading\|스크립트 로딩]], [[code-splitting\|코드 분할]] |
| 보안 | 전체 HTTPS, HSTS, CSP, XSS·CSRF 방어, 의존성 취약점 검사, 비밀 값이 번들에 없음 | [[web-security\|웹 보안]], [[https-migration\|HTTPS 전환]] |
| 성능 | Core Web Vitals(LCP·INP·CLS)가 「좋음」 기준, 실제 사용자 데이터로 확인 | [[web-vitals\|웹 성능 지표]] |
| 접근성 | 폼 레이블, 키보드만으로 모든 기능 사용, 보이는 포커스, 색 대비, 스크린 리더 확인 | [[accessibility-evaluation\|접근성 평가]], [[keyboard-accessibility\|키보드 접근성]] |
| SEO | `sitemap.xml`, `robots.txt`가 필요한 페이지를 막지 않음, canonical, 구조화된 데이터, 소셜 공유 메타(Open Graph) | [[seo-basics\|SEO 기초]], [[structured-content\|구조화된 콘텐츠]] |

## 그대로 따르지 않는 항목

체크리스트는 HTTP/1.1 시절에 처음 만들어져 그대로 따르면 안 되는 항목이 있다.

| 예전 항목 | 지금 |
| --- | --- |
| CSS·JS 파일을 하나로 합친다 | HTTP/2·3에서는 요청 수보다 **캐시 효율**이 중요하다. 라우트·공통 청크로 나누고 내용 해시를 붙여 오래 캐시한다([[bundlers-and-vite\|번들러]]) |
| PageSpeed 점수 90점 이상 | 실험실 점수는 참고값이다. 실제 사용자 지표(CrUX, RUM)의 Core Web Vitals로 판단한다 |
| IE 대응, 벤더 접두사 수동 추가 | Baseline으로 지원 범위를 정하고, 접두사는 빌드 도구가 붙인다 |
| 아이콘 폰트 | 접근성과 렌더링 문제로 SVG 아이콘을 쓴다([[svg-icons\|SVG 아이콘]]) |
| 폰트 전체 용량 상한 같은 고정 수치 | 숫자보다 「첫 화면에 필요한 글꼴만 미리 받는다」는 원칙으로 본다 |

## 정리

- 체크리스트는 출시 전 최소 기준이다. 우선순위 높음은 반드시, 나머지는 프로젝트에 맞춰 고른다.
- 도구로 잡을 수 있는 항목은 CI로 옮기고, 사람은 키보드·스크린 리더·오류 상황처럼 도구가 못 보는 것을 본다.
- 오래된 항목(파일 합치기, 고정 점수)은 HTTP/2와 Core Web Vitals 기준으로 바꿔 읽는다.

관련 노트: [[frontend-performance-strategy|프론트엔드 성능 전략]], [[html-head-metadata|문서 head와 메타데이터]], [[web-vitals|웹 성능 지표]], [[seo-basics|SEO 기초]], [[accessibility-evaluation|접근성 평가]], [[web-security|웹 보안]]
