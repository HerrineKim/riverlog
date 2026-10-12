---
title: "빠르고 유지보수하기 좋은 DB 조회 패턴"
concept: "Data Fetching Patterns"
summary: "서버 코드에서 DB 조회를 빠르게 하면서도 코드는 단순하게 두는 방법. 직렬 조회 → 수동 배치 → 병렬 처리 → 자동 배치 → 값별 독립 함수 → 요청 단위 캐시로 발전시키며, 핵심은 '지역적 추론(local reasoning)'이라는 점을 정리한다. DataLoader의 원리이기도 하다."
tags: ["backend", "database", "architecture", "javascript", "performance"]
source: other
date: "2026-10-12"
sources: ["https://sophiebits.com/2020/01/01/fast-maintainable-db-patterns"]
---

> Sophie Alpert의 글 「[Fast and maintainable patterns for fetching from a database](https://sophiebits.com/2020/01/01/fast-maintainable-db-patterns)」(2020.01)를 요약·재구성한 노트입니다.

## 다루는 문제

ORM처럼 데이터를 **한 건씩 가져오는** 서버 코드에서, 조회를 빠르게 하면서 코드도 읽기 쉽게 유지하는 방법이다. 조인이 많은 복잡한 SQL은 범위 밖이다. 글쓴이는 수천 명이 개발하고 수십억 명이 쓰는 코드베이스에서 검증된 방법이며, 작은 팀에도 맞는다고 말한다.

예제는 블로그 글 목록 요약이다. 글마다 제목, 작성자 이름, 조회수, 조회수에 대한 재미있는 사실(조회수가 0보다 클 때만)을 보여 준다.

```js
async function buildPostsSummary() {
  const posts = await fetchPosts();
  const summary = [];
  for (const post of posts) {
    const author = await post.fetchAuthor();
    const stats = await post.fetchStats();
    const funFact = stats.viewCount > 0 ? await fetchFunFact(stats.viewCount) : undefined;
    summary.push({ title: post.title, authorName: author.name, viewCount: stats.viewCount, funFact });
  }
  return summary;
}
```

가장 단순하지만 느리다. 글마다 DB를 세 번 부르고, **글을 하나씩 순서대로** 처리한다.

## 단계별로 개선하기

| 단계 | 방법 | 요청 수 (글 100개) | 코드 |
| --- | --- | --- | --- |
| 0. 직렬 | 글마다 차례로 `await` | 약 301번, 순서대로 | 단순 |
| 1. 수동 배치 | `fetchManyAuthors(posts)`처럼 목록 단위 함수 | 4번 | 인덱스 맞추기로 복잡해지고 버그가 숨는다 |
| 2. 병렬 | 글 하나 처리 함수 + `Promise.all` | 약 301번, 동시에 | 단순 |
| 3. 자동 배치 | 2의 코드 그대로, 아래 계층이 요청을 묶는다 | 몇 번 | 단순 |
| 4. 최적 병렬 | 값마다 독립 함수로 쪼갠다 | 몇 번 | 단순, 의존 관계를 신경 쓸 필요 없음 |
| 5. 요청 단위 캐시 | 같은 데이터 중복 조회를 막는다 | 몇 번, 중복 없음 | 단순 |

### 1. 수동 배치는 왜 안 되나

DB 왕복은 4번으로 줄지만, `viewCount > 0`이라는 조건 하나 때문에 "0이 아닌 값만 골라 보내고, 돌아온 결과를 원래 인덱스에 다시 끼워 넣는" 코드가 필요해진다.

- 한 건씩 다루던 코드를 **여러 건을 한 번에** 다루게 바꾸면 복잡도가 크게 는다. 글쓴이조차 자기 예제에 버그가 있는지 모르겠다고 한다.
- 코드가 "글 배열"이라는 구조에 묶인다. 블로그가 여럿이 되면 함수 전체를 다시 짜야 한다.
- 짜기 귀찮으니 **애초에 아무도 이렇게 짜지 않는다.** 결국 느린 코드가 남는다.

### 2. 병렬 처리

글 하나를 처리하는 함수를 빼내고 `Promise.all`로 동시에 돌린다. 코드는 다시 단순해진다. 다만 요청 하나하나에 고정 비용이 있어서, 요청 수가 그대로면 수동 배치보다 느리다.

```js
async function buildPostsSummary() {
  const posts = await fetchPosts();
  return Promise.all(posts.map((post) => buildPostSummary(post)));
}
```

### 3. 자동 배치

`fetchAuthor`를 부르면 **바로 보내지 않고 아주 잠깐 기다린다.** 그사이 들어온 다른 `fetchAuthor` 호출을 모아 요청 하나로 보낸다. `map`으로 동시에 시작한 호출들은 거의 같은 순간에 들어오므로 한꺼번에 묶인다.

- 데이터 종류마다 따로 만들지 말고 **DB 접근 계층 한 곳**에 구현한다. 그러면 작성자와 통계처럼 종류가 다른 조회도 한 요청으로 묶인다.
- DB의 배치 API가 스트리밍 응답을 지원하면, 먼저 온 데이터부터 다음 단계를 시작할 수 있다.

### 4. 최적 병렬: 의존 관계를 코드 구조에 새기지 않는다

`author`를 기다린 뒤 `stats`를 가져오는 건 낭비다. `Promise.all`로 둘을 묶어도, 작성자 조회가 늦으면 재미있는 사실 조회까지 덩달아 기다린다. 의존 관계에 맞춰 "스레드"를 직접 짜면 최적이 되지만, **데이터 의존 관계가 바뀔 때마다 함수 전체를 다시 짜야 한다.** 조회가 10개를 넘으면 최적 구조를 사람이 찾기도 어렵다.

대신 **필요한 값마다 독립된 함수**를 두고 한꺼번에 시작한다.

```js
async function buildPostSummary(post) {
  async function fetchAuthorName() {
    const author = await post.fetchAuthor();
    return author.name;
  }
  async function fetchViewCount() {
    const stats = await post.fetchStats();
    return stats.viewCount;
  }
  async function fetchViewCountFunFact() {
    const stats = await post.fetchStats();
    return stats.viewCount > 0 ? fetchFunFact(stats.viewCount) : undefined;
  }

  const [authorName, viewCount, funFact] = await Promise.all([
    fetchAuthorName(),
    fetchViewCount(),
    fetchViewCountFunFact(),
  ]);
  return { title: post.title, authorName, viewCount, funFact };
}
```

줄 수는 늘었지만 **덜 영리한 코드**다. 최적 병렬은 저절로 나온다. 남은 문제는 `fetchStats`를 두 번 부른다는 점이다.

### 5. 요청 단위 캐시

한 웹 요청 안에서 같은 데이터를 두 번 가져올 일은 거의 없다. 그러니 **DB 읽기를 사실상 전부 캐시**한다. 자동 배치처럼 낮은 계층에 구현하면 모든 앱 코드가 덕을 본다.

캐시 수명은 **웹 요청 하나**로 제한한다.

| 이유 | 설명 |
| --- | --- |
| 메모리 | 요청이 끝나면 풀리므로 마음껏 캐시할 수 있다 |
| 신선도 | 페이지를 새로 열면 새 데이터를 받는다 |
| 개인정보 | 사용자 요청 단위로 나뉘어 다른 사용자 데이터가 섞일 위험이 줄어든다 |

윗 계층에서도 비싼 계산은 요청 수명 동안 메모이즈한다. `Post`의 `fetchStats()`나 위의 `fetchViewCount()`에 `@memoize`를 붙이는 식이다.

## 핵심: 지역적 추론

모든 기법의 목적은 하나, **지역적 추론(local reasoning)**이다. 시스템 전체를 머리에 담지 않고 코드 한 부분만 보고 고칠 수 있어야 한다.

- `fetchAuthorName`, `fetchViewCount`, `fetchViewCountFunFact`는 서로 신경 쓰지 않고 따로 고칠 수 있다.
- 함수를 부를 때 그 함수가 가져오는 데이터가 다른 함수와 겹치는지 걱정하지 않아도 된다.

성능 최적화(배치·중복 제거)는 **인프라 계층**이 맡고, 앱 코드는 단순하게 둔다. 이 기법 일부는 같은 시스템에서 나온 오픈소스 **DataLoader**에 들어 있다. 원리를 알면 직접 구현하기도 어렵지 않다.

## 정리

- 수동 배치는 빠르지만 코드가 망가지고, 그래서 결국 아무도 안 쓴다.
- 앱 코드는 "한 건씩, 값마다 독립 함수, `Promise.all`"로 단순하게 쓴다.
- 요청 묶기(자동 배치)와 중복 제거(요청 단위 캐시)는 DB 접근 계층에서 한 번 구현한다.
- 캐시는 웹 요청 하나 동안만 살린다.
- 기준은 지역적 추론이다. 한 부분만 보고 안전하게 고칠 수 있는 구조가 큰 시스템을 버티게 한다.

관련 노트: [[async-await|async/await와 비동기 에러 처리]], [[orm-queryset|Django ORM과 QuerySet]], [[data-flow|Data Flow로 보는 웹 아키텍처]], [[developer-traps|개발자가 빠지는 함정 모음]]
