---
title: "URL을 상태로 쓰기"
concept: "URL as State"
summary: "검색어·필터·정렬·페이지·보기 방식처럼 「이 링크를 연 사람도 같은 화면을 봐야 하는」 상태는 URL에 둔다. 경로는 계층, 쿼리는 필터와 옵션, 해시는 문서 안 위치를 맡는다. 기본값은 생략하고 배열·불리언 직렬화 규칙을 하나로 정하며, 의미 있는 이동은 pushState, 입력 중 갱신은 디바운스한 replaceState로 쓴다. 비밀값·일시적 UI·큰 데이터는 URL에 넣지 않는다."
tags: ["frontend", "state", "routing", "browser", "ux"]
source: other
date: "2026-11-25"
sources: ["https://hanameee.github.io/posts/your_url_is_your_state", "https://alfy.blog/2025/10/31/your-url-is-your-state.html", "https://nuqs.dev/docs/options"]
---

> Korean FE Article 뉴스레터가 소개한 hannah의 번역 「[URL은 곧 상태입니다](https://hanameee.github.io/posts/your_url_is_your_state)」(2026.01, 원문 「[Your URL Is Your State](https://alfy.blog/2025/10/31/your-url-is-your-state.html)」, 2025.10)를 바탕으로, 라이브러리 옵션은 [nuqs 문서](https://nuqs.dev/docs/options)로 확인해 재구성한 노트다.

## URL이 상태 저장소인 이유

**URL은 브라우저가 기본으로 주는 상태 저장소다.** 전역 스토어나 `useState`에 둔 상태는 새로 고침하면 사라지고 다른 사람에게 건넬 수 없다. URL에 둔 상태는 아무 설정 없이 네 가지를 얻는다.

| 얻는 것 | 의미 |
| --- | --- |
| 공유 | 링크를 보내면 받은 사람이 같은 화면을 본다 |
| 북마크 | 그 시점의 화면을 저장해 두고 다시 연다 |
| 기록 | 뒤로·앞으로 가기가 화면 상태를 따라 움직인다 |
| 딥 링크·새로 고침 | 특정 상태로 바로 들어오고, 새로 고침해도 그대로다 |

필터를 잔뜩 걸어 둔 목록에서 상품을 눌렀다가 뒤로 왔는데 필터가 모두 풀려 있는 경험이 URL에 두지 않은 상태의 대가다. 상태의 종류별로 도구를 고르는 기준은 [[react-state-management|리액트 상태 관리의 흐름과 고르는 기준]]에 있다. 이 노트는 그중 「URL 상태」를 다룬다.

## URL의 세 자리

| 자리 | 맡는 것 | 예 |
| --- | --- | --- |
| 경로(path) | 계층이 있는 자원과 위치 | `/users/123/posts`, `/docs/api/authentication` |
| 쿼리(query) | 같은 자원을 보는 조건: 필터, 정렬, 페이지, 옵션 | `?page=2&limit=20`, `?from=2025-01-01&to=2025-12-31` |
| 해시(fragment) | 문서 안 위치, 클라이언트만 아는 값 (서버로 가지 않는다) | GitHub의 `#L20-L35`, 문서의 `#features` |

실제 서비스의 예: 지도 앱은 좌표와 확대 배율(`/@22.44,-74.22,19z`)을, 디자인 도구는 선택한 노드와 캔버스 위치(`?node-id=123:456`)를, 쇼핑몰은 브랜드·가격대·정렬(`?brand=dell+hp&price=500-1500&sort=price-asc`)을 URL에 담는다. 라이브러리 다운로드 페이지가 고른 테마·언어·플러그인을 해시에 담아, 데이터베이스 없이 설정 전체를 링크 하나로 되살리기도 한다.

## 무엇을 URL에 두나

판단 질문은 하나다. **이 링크를 누른 사람도 같은 상태를 봐야 하는가?** 그렇다면 URL에 둔다.

| URL에 둔다 | URL에 두지 않는다 |
| --- | --- |
| 검색어, 필터, 정렬 | 비밀번호·토큰·개인 정보: 브라우저 기록, 서버 로그, 분석 도구, `Referer` 헤더에 그대로 남는다 |
| 페이지 번호, 페이지 크기 | 드롭다운 펼침, 호버, 확인 대화상자 열림 같은 일시적 UI |
| 보기 방식(목록·격자), 활성 탭 | 저장하지 않은 폼 입력 |
| 날짜 범위 | 크거나 깊게 중첩된 데이터 (Base64로 감싼 큰 JSON이 필요하면 신호다) |
| 선택한 항목, 공유할 만한 모달(사진 상세 등) | 마우스·스크롤 위치처럼 매우 자주 바뀌는 값 |
| 실험 변형, 기능 플래그(`?beta=true`) | 서버에 저장해야 할 사용자 설정 |

모달은 경우가 갈린다. 「이 사진을 보는 중」처럼 링크로 건넬 가치가 있으면 URL에 두고, 「삭제할까요?」 확인 창은 두지 않는다.

## 직렬화 규칙

쿼리 문자열의 값은 모두 문자열이다. 배열·숫자·불리언을 어떻게 적을지 **한 가지로 정해 앱 전체에서 같게 쓴다.**

| 값 | 흔한 표기 | 주의 |
| --- | --- | --- |
| 배열 | `?tag=react&tag=hooks` (키 반복), `?tags=react,hooks` (구분자) | 키 반복은 `URLSearchParams.getAll()`로 바로 읽힌다. `tags[]=a` 같은 대괄호 표기는 PHP·Node `qs` 관례일 뿐 표준이 아니라 파서마다 다르게 해석한다 |
| 숫자 | `?page=2` | 읽을 때 `NaN`·음수·범위 밖 값을 걸러 기본값으로 돌린다 |
| 불리언 | `?debug=true`, 또는 키만 `?mobile` | 「없음 = false」로 정하면 URL이 짧아진다 |
| 기본값 | 생략한다 | `?theme=light&page=1&sort=date`보다 기본값을 뺀 빈 쿼리가 낫다. 기본값은 코드가 채운다 |
| 이름 | `?page=2&theme=dark` | `?x=dark&foo=true`처럼 뜻을 알 수 없는 키는 피한다 |

```javascript
const DEFAULT_SORT = 'recent'

function readFilters(search) {
  const p = new URLSearchParams(search)
  const page = Number.parseInt(p.get('page') ?? '', 10)
  return {
    q: p.get('q') ?? '',
    tags: p.getAll('tag'),
    sort: p.get('sort') ?? DEFAULT_SORT,
    page: page > 0 ? page : 1,
  }
}

function writeFilters({ q, tags, sort, page }) {
  const p = new URLSearchParams()
  if (q) p.set('q', q)
  for (const tag of tags) p.append('tag', tag)
  if (sort !== DEFAULT_SORT) p.set('sort', sort)
  if (page !== 1) p.set('page', String(page))
  p.sort() // 키 순서를 고정하면 같은 상태가 늘 같은 URL이 된다
  const qs = p.toString()
  return qs ? `?${qs}` : ''
}
```

`URLSearchParams`가 인코딩을 맡으므로 `&`나 공백이 든 값도 손으로 이스케이프하지 않는다([[ajax|AJAX와 HTTP 요청]]의 URL 객체). 필터를 바꾸면 페이지는 1로 되돌린다. 3페이지에서 조건을 좁히면 결과가 3페이지까지 없을 수 있다.

## 기록에 남길까: pushState와 replaceState

| 메서드 | 하는 일 | 쓰는 곳 |
| --- | --- | --- |
| `history.pushState(state, '', url)` | 새 기록 항목을 쌓는다. 뒤로 가기로 이전 상태로 돌아간다 | 필터 적용, 페이지 이동, 보기 전환처럼 사용자가 「되돌리기」를 기대하는 변화 |
| `history.replaceState(state, '', url)` | 현재 항목을 바꾼다 | 검색창에 입력하는 동안의 갱신, 기본값 정리 같은 작은 조정 |

- 글자마다 `pushState`하면 뒤로 가기를 수십 번 눌러야 페이지를 벗어난다. 입력 중에는 **디바운스한 `replaceState`**, 검색을 확정할 때(Enter, 결과 선택) `pushState`를 쓴다.
- 반대로 사용자가 돌아가길 기대하는 이동을 `replaceState`로 처리하면 뒤로 가기가 엉뚱한 페이지로 간다.
- 두 메서드는 `popstate`를 일으키지 않는다. 뒤로·앞으로 가기에 화면을 맞추려면 `popstate`에서 URL을 다시 읽어 그린다. 라우터는 이 일을 대신한다([[client-side-routing|클라이언트 사이드 라우팅]]).
- 브라우저는 짧은 시간에 History API를 너무 많이 부르면 호출을 제한한다. 슬라이더처럼 연속으로 바뀌는 값은 스로틀·디바운스로 URL 갱신 횟수를 줄인다.

## 프레임워크에서

| 환경 | 읽기 | 쓰기 |
| --- | --- | --- |
| 바닐라 JS | `new URLSearchParams(location.search)` | `history.pushState`·`replaceState` + `popstate` 처리 |
| React Router | `useSearchParams()` | `setSearchParams(next)`, 기록을 남기지 않으려면 `setSearchParams(next, { replace: true })` ([[react-router-layout\|React Router]]) |
| Next.js App Router | 클라이언트는 `useSearchParams()`, 서버 컴포넌트 페이지는 `searchParams` prop(Promise) | `router.push`·`router.replace`, 또는 네이티브 `history.pushState`·`replaceState`(라우터와 동기화된다) |

여러 키를 타입 있게 다루고 기본값·디바운스를 반복해서 쓰게 되면 **nuqs** 같은 URL 상태 라이브러리가 `useState`와 같은 모양의 API를 준다. nuqs v2는 Next.js(App·Pages Router), React Router, Remix, TanStack Router, 일반 React SPA를 어댑터로 지원한다.

```tsx
'use client'
import { useQueryState, parseAsInteger, parseAsString, debounce } from 'nuqs'

export function SearchBox() {
  const [q, setQ] = useQueryState(
    'q',
    parseAsString.withOptions({ limitUrlUpdates: debounce(300) }).withDefault(''),
  )
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

  return (
    <input
      value={q}
      onChange={(e) => {
        setQ(e.target.value)
        setPage(1)
      }}
    />
  )
}
```

nuqs의 기본값은 `history: 'replace'`(기록을 쌓으려면 `'push'`), `shallow: true`(서버를 다시 렌더링하지 않음), `clearOnDefault: true`(기본값이면 키를 지움)다. 서버 컴포넌트가 URL에 따라 데이터를 다시 가져와야 하면 `shallow: false`를 준다. 앱 루트를 프레임워크별 `NuqsAdapter`로 감싸야 동작한다.

## URL은 계약이다

- **읽히는 URL**: `/products/laptop?color=silver&sort=price`는 무엇을 보는지 말해 준다. `?id=x7f2k&v=3`은 숨긴다.
- **캐시 키**: 같은 URL은 같은 자원이다. 쿼리가 곧 캐시 변형을 정하므로 키 순서·기본값 생략을 지키면 CDN과 데이터 캐시의 적중률이 오른다.
- **분석 차원**: 쿼리 파라미터가 그대로 사용 흐름 분석의 차원이 된다.
- **호환성**: 공개된 URL은 북마크·외부 링크로 남는다. 키 이름을 바꿀 때는 옛 키도 한동안 읽어 준다.
- **길이 한도**: 브라우저·서버·CDN마다 받아 주는 URL 길이가 다르다(대략 수천 자). 한도에 가까워지면 URL에 넣을 상태가 아니라는 신호다. 큰 상태는 서버에 저장하고 URL에는 그 ID만 둔다.

## 정리

- 「링크를 받은 사람도 같은 화면을 봐야 하나」로 URL 상태를 고른다.
- 경로는 계층, 쿼리는 조건, 해시는 문서 안 위치. 비밀값·일시적 UI·큰 데이터는 넣지 않는다.
- 배열·불리언 표기를 하나로 정하고, 기본값은 생략하고, 키 순서를 고정한다. 읽을 때는 잘못된 값을 기본값으로 돌린다.
- 되돌리고 싶은 변화는 `pushState`, 입력 중 갱신은 디바운스한 `replaceState`.
- 새로 고침에 상태가 사라지는 앱은 웹이 공짜로 주는 기능을 버리고 있는 것이다.

관련 노트: [[react-state-management|리액트 상태 관리의 흐름과 고르는 기준]], [[client-side-routing|클라이언트 사이드 라우팅]], [[react-router-layout|React Router]], [[nextjs-routing-conventions|Next.js App Router의 파일 규칙과 라우팅]], [[ajax|AJAX와 HTTP 요청]], [[ui-engineering-problems|UI 엔지니어링의 열두 가지 문제]]
