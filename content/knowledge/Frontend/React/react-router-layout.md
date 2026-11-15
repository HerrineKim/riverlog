---
title: "React Router: 라우팅 기초와 레이아웃·Breadcrumbs"
concept: "React Router"
summary: "SPA에서 URL마다 다른 컴포넌트를 그리는 React Router의 기초(Routes·Route·Outlet, Link·NavLink, useParams·useSearchParams, useNavigate, 중첩 라우트)와, 일관된 URL 규칙 위에서 레이아웃이 경로별 버튼과 Breadcrumbs를 그리는 패턴. v5 시절 API(Switch, exact, withRouter, history)와의 대응표 포함."
tags: ["react", "routing", "mui", "frontend"]
source: mixed
date: "2026-10-21"
sources: ["https://riverkim.kr/182", "https://react.vlpt.us/react-router/", "https://react.vlpt.us/react-router/01-concepts.html", "https://react.vlpt.us/react-router/02-params-and-query.html", "https://react.vlpt.us/react-router/03-subroutes.html", "https://react.vlpt.us/react-router/04-extra.html", "https://react.vlpt.us/react-router/05-use-router-hook.html", "https://reactrouter.com/home", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/useHistory%2C%20useLocation%2C%20usePrams%2C%20useRouteMatch.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/React%20SPA%20%EB%9D%BC%EC%9A%B0%ED%84%B0.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/%EB%92%A4%EB%A1%9C%EA%B0%80%EA%B8%B0%20%EC%8A%A4%ED%81%AC%EB%A1%A4%20%EC%9C%84%EC%B9%98%20%EA%B8%B0%EC%96%B5.md", "https://reactrouter.com/api/components/ScrollRestoration"]
---

> 기초 부분은 벨로퍼트의 「[벨로퍼트와 함께하는 모던 리액트](https://react.vlpt.us/)」 중 「[react-router 를 통한 리액트 싱글 페이지 애플리케이션 만들기](https://react.vlpt.us/react-router/)」 장을 바탕으로 보강하고 [React Router 공식 문서](https://reactrouter.com/home)로 최신화했다.
> v5 훅과 스크롤 위치 복원은 「[Frontend_TIL: useHistory, useLocation, usePrams, useRouteMatch](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/useHistory%2C%20useLocation%2C%20usePrams%2C%20useRouteMatch.md)」·「[React SPA 라우터](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/React%20SPA%20%EB%9D%BC%EC%9A%B0%ED%84%B0.md)」·「[뒤로가기 스크롤 위치 기억](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/React/%EB%92%A4%EB%A1%9C%EA%B0%80%EA%B8%B0%20%EC%8A%A4%ED%81%AC%EB%A1%A4%20%EC%9C%84%EC%B9%98%20%EA%B8%B0%EC%96%B5.md)」을 바탕으로 보강했다.

관리자 화면처럼 목록·상세·수정·등록 페이지가 반복되는 서비스는 **URL 규칙을 먼저 통일**해 두면, 레이아웃 한 곳에서 경로만 보고 버튼이나 Breadcrumbs(현재 위치 표시)를 자동으로 만들 수 있다. react-router의 `<Outlet />`, `useLocation()`을 활용한다.

## 기본: Routes, Route, Outlet

react-router는 새 페이지를 서버에서 불러오지 않고, URL에 따라 한 페이지 안에서 다른 컴포넌트를 그려 주는 SPA용 라우팅 라이브러리다. React 자체에는 라우팅이 없어 사실상 표준으로 쓰인다. 주소가 있어야 북마크·공유·검색 유입이 되므로 SPA라도 화면마다 URL을 준다. SPA의 장단점(번들 크기, 검색 엔진, 첫 화면)은 [[spa-csr-ssr|SPA와 CSR·SSR]]에 있다.

지금 버전(v8)은 쓰는 범위에 따라 세 모드가 있다.

| 모드 | 모양 | 쓸 때 |
| --- | --- | --- |
| 선언형(Declarative) | `<BrowserRouter>` 안에 `<Routes>`·`<Route>` JSX | 라우팅만 필요한 SPA |
| 데이터(Data) | `createBrowserRouter([...])` 라우트 객체 + `<RouterProvider>`. loader·action·pending UI | 라우트 단위로 데이터를 읽고 쓰는 SPA |
| 프레임워크(Framework) | 파일 기반 라우트, Vite 플러그인, SSR | 풀스택 앱(옛 Remix) |

| 컴포넌트 | 역할 |
| --- | --- |
| `<Routes>` | 안에 있는 `Route`들 중 현재 URL과 가장 잘 맞는 **하나만** 렌더링한다 |
| `<Route path element>` | `path`에 맞으면 `element`를 그린다. `path="/product/*"`처럼 `*`를 붙이면 하위 경로까지 매칭한다 |
| `<Outlet />` | 중첩 라우트에서 부모 컴포넌트 안에 **자식 라우트가 그려질 자리**. 예전에는 `children` props로 직접 넘겼다 |

```tsx
<BrowserRouter>
  <Header />
  <Routes>
    <Route path="/" element={<Main />} />
    <Route path="/product/*" element={<Product />} />
    <Route path="/admin" element={<AdminLayout />}>   {/* 부모: 안에 <Outlet /> */}
      <Route path="notice/list" element={<NoticeList />} />
    </Route>
    <Route path="*" element={<NotFound />} />          {/* 어디에도 맞지 않을 때 */}
  </Routes>
</BrowserRouter>
```

`path="*"`는 다른 어떤 경로와도 맞지 않을 때만 선택되므로 404 페이지에 쓴다.

`<Routes>`는 가장 구체적인 경로 하나만 고르므로, `/`가 `/about`에도 맞아 두 화면이 겹쳐 그려지는 일이 없다.

## 이동: Link, NavLink, useNavigate

SPA 안에서 이동할 때 `<a href>`를 쓰면 페이지 전체를 새로 불러와 **앱의 state가 모두 사라진다**. `<Link to>`는 History API(`pushState`)로 주소만 바꾸고 필요한 컴포넌트만 다시 그린다.

```tsx
<Link to="/about">소개</Link>

// 현재 경로와 맞으면 활성 스타일. className·style에 함수를 넘긴다
<NavLink to="/profiles/velopert" className={({ isActive }) => (isActive ? 'active' : undefined)}>
  velopert
</NavLink>
<NavLink to="/" end>홈</NavLink> {/* end: 하위 경로에서는 활성으로 보지 않는다 */}

// 코드로 이동
const navigate = useNavigate()
navigate('/')                    // 이동
navigate(-1)                     // 뒤로 가기
navigate('/login', { replace: true }) // 기록을 남기지 않고 교체
```

렌더링 중에 바로 이동시키려면 `<Navigate to="/login" replace />`를 그린다. 데이터 모드에서는 loader·action 안에서 `redirect('/login')`을 반환한다.

## URL 파라미터와 쿼리

| 종류 | 모양 | 주 용도 | 읽기 |
| --- | --- | --- | --- |
| 파라미터 | `/profiles/velopert` | 특정 id·이름으로 대상 하나를 가리킬 때 | `useParams()` |
| 쿼리(search params) | `/about?detail=true` | 검색어, 필터, 정렬, 페이지 같은 옵션 | `useSearchParams()` |

```tsx
// <Route path="/profiles/:username" element={<Profile />} />
function Profile() {
  const { username } = useParams()          // 값은 늘 문자열(또는 undefined)
  ...
}

function About() {
  const [searchParams, setSearchParams] = useSearchParams()
  const detail = searchParams.get('detail') === 'true'   // 쿼리 값도 문자열이다
  return <button onClick={() => setSearchParams({ detail: String(!detail) })}>토글</button>
}
```

- 파라미터·쿼리 값은 **문자열**이다. 숫자 id는 `Number(id)`로 바꾼다.
- 쿼리는 브라우저 내장 `URLSearchParams`로 파싱되므로 `qs` 같은 라이브러리가 필요 없다. 과거에는 `location.search` 문자열을 `qs.parse(location.search, { ignoreQueryPrefix: true })`로 직접 파싱했다.
- 검색 조건처럼 공유·새로 고침에 살아남아야 하는 상태는 `useState`가 아니라 쿼리에 둔다([[react-state-management|리액트 상태 관리의 흐름과 고르는 기준]]의 URL 상태).

## 중첩 라우트

라우트 안에 라우트를 넣으면 부모가 공통 UI(목록, 탭)를 그리고 `<Outlet />` 자리에 자식을 그린다.

```tsx
<Route path="profiles" element={<Profiles />}>       {/* 유저 목록 + <Outlet /> */}
  <Route index element={<p>유저를 선택해 주세요.</p>} />  {/* /profiles 자체 */}
  <Route path=":username" element={<Profile />} />  {/* /profiles/velopert */}
</Route>
```

- `index` 라우트는 부모 경로와 정확히 같을 때 `<Outlet />`에 그려진다.
- 화면 안의 **탭도 state보다 중첩 라우트로** 만드는 편이 낫다. 탭마다 URL이 생겨 링크로 바로 들어갈 수 있고, 새로 고침해도 탭이 유지되고, 검색 엔진이 탭별 내용을 수집할 수 있다.
- 자식 라우트의 파라미터는 부모 컴포넌트에서도 `useParams()`로 읽힌다.

## 그 밖의 기능

| 하려는 일 | 지금 API |
| --- | --- |
| 현재 위치 정보(pathname, search, hash, state) | `useLocation()` |
| 저장하지 않은 폼에서 이탈 막기 | `useBlocker()` (데이터 모드) |
| 라우트를 JSX 대신 배열·객체로 정의 | `createBrowserRouter([...])` 또는 `useRoutes([...])` |
| 주소창 없이 메모리에만 기록(테스트, 임베디드 웹뷰) | `MemoryRouter` · `createMemoryRouter` |
| 라우트별 코드 분할 | 라우트 객체의 `lazy` 또는 `React.lazy` |
| 뒤로 가기 때 이전 스크롤 위치 복원 | `<ScrollRestoration />` (데이터 모드) |

### 뒤로 가기 때 스크롤 위치 복원

긴 목록에서 상세로 갔다가 뒤로 오면 목록 맨 위로 돌아가는 문제가 SPA에서 흔하다. 브라우저는 일반 페이지 이동에서 스크롤을 스스로 복원하지만(`history.scrollRestoration === 'auto'`), 클라이언트 라우팅은 새 화면을 비동기로 그리므로 복원 시점이 어긋난다.

```text
1. 떠나기 전: 위치별 키(location.key 또는 pathname + search)로 scrollY를 sessionStorage에 저장
2. 돌아왔을 때(POP 이동): 그 키의 값을 읽어 데이터가 그려진 뒤 window.scrollTo
3. 새 링크 이동(PUSH): 맨 위로
```

React Router 데이터 모드에서는 루트 레이아웃에 `<ScrollRestoration />` 하나를 두면 이 일을 한다. 키를 바꾸려면 `getKey={(location) => location.pathname}`. 직접 구현할 때는 `history.scrollRestoration = 'manual'`로 브라우저 자동 복원을 끄고, 스크롤 이벤트마다 저장하기보다 이동 직전에 한 번 저장한다. 탭마다 따로, 탭을 닫으면 사라지는 값이므로 `localStorage`가 아니라 `sessionStorage`가 맞다([[web-storage|웹 스토리지]]).

## URL 규칙

`도메인/기능/{id}` 형태로 통일한다.

| URL | 의미 |
| --- | --- |
| `/user/list` | 목록 |
| `/user/detail/368` | 상세 |
| `/user/edit/368` | 수정 |
| `/user/add` | 등록 |

규칙이 일정하면 "edit 페이지의 상위는 detail, 그 상위는 list"처럼 경로만으로 계층을 계산할 수 있다.

## 레이아웃에서 경로별 버튼 보여 주기

최상위 레이아웃 컴포넌트 안에 별도의 `<Routes>`를 하나 더 두고, 버튼을 띄울 경로를 `path`로, 버튼을 `element`로 지정한다. 실제 페이지는 `<Outlet />` 자리에 렌더링된다.

```tsx
function AdminLayout() {
  const navigate = useNavigate()
  return (
    <>
      <Routes>
        <Route
          path="notice/list"
          element={<Button onClick={() => navigate("/notice/add")}>공지 등록</Button>}
        />
        {/* 다른 경로의 버튼들 */}
      </Routes>
      <Routes>
        <Route path="*" element={<PathBreadcrumbs labels={pathLabels} />} />
      </Routes>
      <Outlet />
    </>
  )
}
```

권한에 따라 버튼을 숨기는 것도 레이아웃에서 조건부 렌더링으로 처리하면 페이지 컴포넌트가 깔끔해진다.

## 경로 기반 Breadcrumbs (MUI + react-router)

1. `useLocation()`으로 현재 경로를 `/` 기준으로 쪼갠다.
2. 숫자 세그먼트는 `:id`로 바꿔, 라벨 맵(`labels`)의 키와 맞춘다.
3. detail·edit·add 페이지면 앞에 목록 경로를, edit 페이지면 중간에 상세 경로를 끼워 넣는다.
4. 마지막 항목은 텍스트로, 나머지는 링크로 그린다. 링크의 `:id`는 실제 id로 되돌린다.

```tsx
import { Breadcrumbs, Link, Typography, type LinkProps } from "@mui/material"
import { Link as RouterLink, useLocation } from "react-router"

const LinkRouter = (props: LinkProps & { to: string }) => (
  <Link {...props} component={RouterLink} />
)

// 예: { "/user/list": "회원 목록", "/user/detail/:id": "회원 상세", "/user/edit/:id": "회원 수정" }
type Props = { labels: Record<string, string> }

export default function PathBreadcrumbs({ labels }: Props) {
  const { pathname } = useLocation()
  const segments = pathname.split("/").filter(Boolean)
  const [feature] = segments
  const id = segments.find((s) => !Number.isNaN(Number(s)))

  const current = "/" + segments.map((s) => (Number.isNaN(Number(s)) ? s : ":id")).join("/")
  const paths = [current]
  if (/\/(edit|detail|add)/.test(current)) paths.unshift(`/${feature}/list`)
  if (current.endsWith("/edit/:id")) paths.splice(-1, 0, `/${feature}/detail/:id`)

  return (
    <Breadcrumbs aria-label="breadcrumb">
      <LinkRouter underline="hover" color="inherit" to="/">
        Home
      </LinkRouter>
      {paths.map((path, index) => {
        if (!labels[path]) return null
        if (index === paths.length - 1) {
          return (
            <Typography key={path} color="text.primary">
              {labels[path]}
            </Typography>
          )
        }
        return (
          <LinkRouter
            key={path}
            underline="hover"
            color="inherit"
            to={id ? path.replace(":id", id) : path}
          >
            {labels[path]}
          </LinkRouter>
        )
      })}
    </Breadcrumbs>
  )
}
```

결과 예: `/user/edit/368` → `Home / 회원 목록 / 회원 상세 / 회원 수정`

> 참고: 패키지 이름이 바뀌어 왔다. v6까지는 웹용 API를 `react-router-dom`에서 가져왔고, v7에서 `react-router` 하나로 합쳐지며 `react-router-dom`은 다시 내보내기만 하는 호환용으로 남았다. v8(2026.06)에서는 `react-router-dom`이 빠졌으므로 `react-router`에서 가져오고, `RouterProvider`·`HydratedRouter`만 `react-router/dom`에서 가져온다.

> 참고: 데이터 라우터(`createBrowserRouter`)를 쓴다면 각 라우트의 `handle`에 라벨을 넣고 `useMatches()`로 꺼내는 방식이 공식 권장 패턴이다. URL 문자열을 직접 파싱하지 않아도 된다.

## 역사: v5 코드 읽기

v5까지의 코드는 모양이 많이 다르다. v6에서 대부분 바뀌었다.

| v5 | 지금 |
| --- | --- |
| `<Switch>` | `<Routes>` |
| `<Route path="/" exact component={Home}>` | `<Route path="/" element={<Home />}>`. 정확히 맞는 경로를 기본으로 고르므로 `exact`가 없다 |
| `render={() => <p>...</p>}` | `element={<p>...</p>}` |
| 라우트 컴포넌트가 props로 받던 `match`·`location`·`history` | `useParams`·`useLocation`·`useNavigate` |
| `match.params.username` | `useParams().username` |
| `history.push('/')` · `history.goBack()` | `navigate('/')` · `navigate(-1)` |
| `withRouter(Component)` HOC (부모 라우트 기준 `match`를 받음) | 어디서나 훅 |
| 자식 컴포넌트 안에 `<Route>`를 다시 그리는 서브 라우트 | 부모 `<Route>` 안에 자식 `<Route>`를 중첩하고 `<Outlet />` |
| `<Redirect to>` | `<Navigate to>` · `redirect()` |
| `<Prompt>` · `history.block` | `useBlocker` |
| `<NavLink activeStyle activeClassName>` | `className`·`style`에 `({ isActive }) => ...` 함수 |

v5.1에서 `useHistory`·`useLocation`·`useParams`·`useRouteMatch` 훅이 들어와 `withRouter` 없이 함수 컴포넌트에서 바로 꺼내 쓰게 됐다. v6에서 `useHistory()`의 `history.push`는 `useNavigate()`로, `useRouteMatch(pattern)`은 `useMatch(pattern)`으로 바뀌었다. v5.1 이전에는 공식 훅이 없어 `use-react-router` 같은 서드파티 훅을 쓰기도 했다.

## 핵심 정리

- 앱 안 이동은 `<a>`가 아니라 `<Link>`·`useNavigate`로 한다. `<a>`는 state를 날린다.
- 대상 하나는 파라미터(`useParams`), 옵션은 쿼리(`useSearchParams`). 둘 다 문자열이다.
- 공통 UI는 부모 라우트에, 바뀌는 부분은 자식 라우트와 `<Outlet />`에. 탭도 라우트로 만든다.
- URL 규칙(`기능/list|detail|edit|add/{id}`)을 먼저 통일하면 계층을 경로만으로 계산할 수 있다.
- 레이아웃 안의 추가 `<Routes>`로 경로별 버튼을, `<Outlet />`으로 페이지를 렌더링한다.
- Breadcrumbs는 숫자 세그먼트를 `:id`로 정규화해 라벨 맵에서 찾고, 링크를 만들 때 다시 실제 id로 바꾼다.

관련 노트: [[spa-csr-ssr|SPA와 CSR·SSR]], [[react-state-management|리액트 상태 관리의 흐름과 고르는 기준]], [[nextjs-app-router|Next.js App Router의 내비게이션과 데이터 가져오기]]
