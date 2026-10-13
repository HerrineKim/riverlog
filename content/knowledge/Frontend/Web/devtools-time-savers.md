---
title: "웹 개발 시간을 줄이는 브라우저·JS 팁"
concept: "DevTools Tips"
summary: "소스를 고치지 않고 화면을 바꿔 보는 designMode, 한 줄짜리 JS 관용구(구조 분해 교환·Set 중복 제거·performance.now), debugger 문, console.table·console.dir처럼 작업 시간을 줄여 주는 프론트엔드 팁."
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
| 디버깅 | VS Code Live Server | 정적 페이지를 저장할 때마다 자동 새로고침 |
| 디버깅 | `debugger` 문 | 여러 값을 한 번에 들여다볼 때 |
| 콘솔 | `console.table`·`console.dir` | 배열·객체를 읽기 쉽게 출력할 때 |

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

## 3. 디버깅

### Live Server

VS Code 확장 Live Server는 로컬 서버를 띄우고 파일을 저장할 때마다 브라우저를 새로 고친다. 번들러 없이 HTML·CSS·JS를 만질 때 유용하다. Vite 같은 개발 서버를 쓰는 프로젝트에서는 HMR(바뀐 모듈만 교체)이 같은 일을 더 빠르게 한다.

### `debugger` 문

```js
function calc(items) {
  debugger; // DevTools가 열려 있으면 여기서 멈춘다
  return items.map(/* ... */);
}
```

`console.log`를 여러 줄 넣는 것보다 빠르다. 멈춘 지점의 스코프 변수를 모두 보고 한 줄씩 실행할 수 있다. DevTools에서 직접 중단점을 찾아 거는 수고도 던다. **DevTools가 닫혀 있으면 무시**되지만, 커밋 전에는 지운다.

## 4. 콘솔 활용

| 메서드 | 출력 |
| --- | --- |
| `console.table(arr)` | 객체 배열을 표로 보여 준다. 열을 클릭해 정렬할 수 있다 |
| `console.dir(obj)` | 객체를 펼칠 수 있는 트리로 보여 준다. DOM 요소도 HTML 대신 속성 목록으로 보인다 |

자주 쓰면 짧은 별칭을 만든다.

```js
const c = console.log.bind(console);
c(a);
```

`bind`의 대상은 `console`이어야 한다. 다른 객체에 묶으면 일부 브라우저에서 `Illegal invocation` 오류가 난다.

## 정리

- 화면 문구·배치 확인은 `designMode`로 소스 수정 없이 한다.
- 교환·중복 제거·시간 측정은 한 줄 관용구로 끝낸다.
- 값을 여러 개 봐야 하면 `console.log`보다 `debugger`로 멈춰서 본다.
- 콘솔 출력은 데이터 모양에 맞춰 `table`·`dir`을 고른다.

관련 노트: [[dom|DOM과 BOM]], [[arrays-and-objects|배열·객체·문자열 다루기]], [[tooling|React 개발 환경과 빌드 도구]]
