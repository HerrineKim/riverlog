---
title: "웹 개발 시간을 줄이는 브라우저·JS 팁"
concept: "DevTools Tips"
summary: "소스를 고치지 않고 화면을 바꿔 보는 designMode, 한 줄짜리 JS 관용구(구조 분해 교환·Set 중복 제거·performance.now), 저장하면 새로고침하는 Live Server처럼 작업 시간을 줄여 주는 프론트엔드 팁. 콘솔·디버거 활용은 DevTools 노트로 안내한다."
tags: ["frontend", "javascript", "browser", "tips", "tools"]
source: other
date: "2026-10-13"
sources: ["https://yozm.wishket.com/magazine/detail/1585/"]
---

> 곰씨네 IT 블로그의 「[웹 개발 시간을 줄여주는 팁 4가지](https://yozm.wishket.com/magazine/detail/1585/)」(요즘IT, 2022.07)를 바탕으로 재구성한 노트입니다.

## 한눈에 보기

| 영역 | 팁 | 언제 쓰나 |
| --- | --- | --- |
| 브라우저 | `document.designMode` | 문구·레이아웃을 소스 수정 없이 바로 바꿔 보고 싶을 때 |
| JS | 구조 분해로 값 교환 | 임시 변수 없이 두 값을 바꿀 때 |
| JS | 스프레드 + `Set` | 배열을 합치고 중복을 없앨 때 |
| JS | `performance.now()` | 코드 구간의 실행 시간을 잴 때 |
| 개발 서버 | VS Code Live Server | 정적 페이지를 저장할 때마다 자동 새로고침 |
| DevTools | 중단점·`debugger`, 콘솔 메서드 | 값을 들여다볼 때 → [[devtools-debugging\|디버깅]]·[[devtools-console\|콘솔]] 노트 |

## 1. designMode: 페이지를 바로 편집하기

DevTools 콘솔에서 켜면 페이지 전체가 편집 가능해진다. 글자를 고치거나 요소를 지우면서 기획·디자인 검토를 빠르게 할 수 있다. 새로고침하면 원래대로 돌아간다.

```js
document.designMode = "on";
document.designMode = "off";
```

Chrome·Firefox·Safari·Edge에서 동작한다.

## 2. 시간을 줄이는 JS 관용구

```js
// 임시 변수 없이 교환
[a, b] = [b, a];

// 배열 합치기 + 중복 제거
const merged = [...arr1, ...arr2];   // 또는 arr1.concat(arr2)
const unique = [...new Set(merged)];

// 실행 시간 재기 (밀리초)
const start = performance.now();
doSomething();
console.log(performance.now() - start);
```

- `Set`은 원시값 기준으로 중복을 없앤다. 객체는 참조가 달라서 내용이 같아도 남는다.
- `performance.now()`는 `Date.now()`보다 정밀하고 시스템 시계 변경의 영향을 받지 않는다.

## 3. Live Server: 저장하면 새로고침

VS Code 확장 Live Server는 로컬 서버를 띄우고 파일을 저장할 때마다 브라우저를 새로 고친다. 번들러 없이 HTML·CSS·JS를 만질 때 유용하다. Vite 같은 개발 서버를 쓰는 프로젝트에서는 HMR(바뀐 모듈만 교체)이 같은 일을 더 빠르게 한다.

## 4. 콘솔과 디버거

값을 여러 개 봐야 하면 `console.log`를 늘리지 말고 `debugger` 문이나 중단점으로 멈춰서 본다. 중단점 종류와 단계 실행은 [[devtools-debugging|DevTools로 JavaScript 디버깅하기]]에, `console.table`·`console.dir` 같은 출력 메서드와 `$0`·`copy()` 같은 콘솔 유틸리티는 [[devtools-console|DevTools Console 활용]]에 있다.

## 정리

- 화면 문구·배치 확인은 `designMode`로 소스 수정 없이 한다.
- 교환·중복 제거·시간 측정은 한 줄 관용구로 끝낸다.
- 번들러 없는 정적 페이지는 Live Server로 저장 즉시 확인한다.
- 값을 여러 개 봐야 하면 `console.log`보다 중단점으로 멈춰서 본다. 자세한 법은 DevTools 노트에 있다.

관련 노트: [[devtools-console|DevTools Console 활용]], [[devtools-debugging|DevTools로 JavaScript 디버깅하기]], [[dom|DOM과 BOM]], [[arrays-and-objects|배열·객체·문자열 다루기]], [[tooling|React 개발 환경과 빌드 도구]]
