---
title: "빠르고 유지보수하기 좋은 DB 조회 패턴"
concept: "Data Fetching Patterns"
summary: "서버 코드에서 DB 조회를 빠르게 하면서도 코드는 단순하게 두는 방법. 직렬 조회 → 수동 배치 → 병렬 처리 → 자동 배치 → 값별 독립 함수 → 요청 단위 캐시로 발전시키며, 핵심은 '지역적 추론(local reasoning)'이라는 점을 정리한다. DataLoader의 원리이기도 하다."
tags: ["backend", "database", "architecture", "javascript", "performance"]
source: other
date: "2026-10-12"
sources: ["https://sophiebits.com/2020/01/01/fast-maintainable-db-patterns"]
---

> Sophie Alpert의 글 「[Fast and maintainable patterns for fetching from a database](https://sophiebits.com/2020/01/01/fast-maintainable-db-patterns)」(2020.01)를 요약·재구성한 노트다.

## 핵심: 지역적 추론

DB 조회 패턴의 목표는 하나, **지역적 추론(local reasoning)이다.** 시스템 전체를 머리에 담지 않고 코드 한 부분만 보고 고칠 수 있어야 한다. 그래서 앱 코드는 "한 건씩, 값마다 독립 함수, `Promise.all`"로 단순하게 쓰고, 요청 묶기(자동 배치)와 중복 제거(요청 단위 캐시)는 **DB 접근 계층이 한 번** 맡는다. 이 기법 일부는 오픈소스 **DataLoader**에 들어 있다.

다루는 범위는 ORM처럼 데이터를 **한 건씩 가져오는** 서버 코드다. 조인이 많은 복잡한 SQL은 범위 밖이다.

## 출발점: 직렬 조회

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

### 1. 수동 배치

왕복은 4번으로 줄지만 `viewCount > 0` 조건 하나 때문에 "골라 보내고 결과를 원래 인덱스에 끼워 넣는" 코드가 생긴다. 복잡하고 "글 배열" 구조에 묶여서, **결국 아무도 이렇게 짜지 않고 느린 코드가 남는다.**

### 2. 병렬 처리

글 하나를 처리하는 함수를 빼내 `posts.map(buildPostSummary)`를 `Promise.all`로 돌린다. 코드는 단순하지만 요청 수가 그대로라 고정 비용이 남는다.

### 3. 자동 배치

`fetchAuthor`를 부르면 바로 보내지 않고 **아주 잠깐 기다렸다가** 그사이 들어온 호출을 한 요청으로 묶는다. 데이터 종류마다가 아니라 DB 접근 계층 한 곳에 구현하면 종류가 다른 조회도 함께 묶인다.

### 4. 최적 병렬: 의존 관계를 코드 구조에 새기지 않는다

`author`를 기다린 뒤 `stats`를 가져오는 건 낭비다. 의존 관계에 맞춰 "스레드"를 직접 짜면 최적이 되지만, **의존 관계가 바뀔 때마다 함수 전체를 다시 짜야 한다.** 대신 **필요한 값마다 독립된 함수**를 두고 한꺼번에 시작한다.

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

줄 수는 늘었지만 **덜 영리한 코드**다. 최적 병렬은 저절로 나오고, 세 함수는 서로 신경 쓰지 않고 따로 고칠 수 있다. 남은 문제는 `fetchStats`를 두 번 부른다는 점이다.

### 5. 요청 단위 캐시

한 웹 요청 안에서 같은 데이터를 두 번 가져올 일은 거의 없으므로 DB 읽기를 사실상 전부 캐시한다. 수명은 **웹 요청 하나**로 제한해 메모리 걱정, 오래된 데이터, 사용자 간 데이터 섞임을 함께 피한다.

관련 노트: [[async-await|async/await와 비동기 에러 처리]], [[orm-queryset|Django ORM과 QuerySet]], [[web-scalability-components|웹 확장성의 구성 요소]], [[developer-traps|개발자가 빠지는 함정 모음]]
