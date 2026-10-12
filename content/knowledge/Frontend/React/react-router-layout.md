---
title: "react-router로 레이아웃과 Breadcrumbs 만들기"
concept: "React Router"
summary: "일관된 URL 규칙을 정하고, 레이아웃에서 경로별 버튼과 현재 경로 기반 Breadcrumbs를 렌더링하는 react-router 패턴."
tags: ["react", "routing", "mui", "frontend"]
source: notion
date: "2026-10-12"
sources: ["https://riverkim.kr/182"]
---

관리자 화면처럼 목록·상세·수정·등록 페이지가 반복되는 서비스는 **URL 규칙을 먼저 통일**해 두면, 레이아웃 한 곳에서 경로만 보고 버튼이나 Breadcrumbs(현재 위치 표시)를 자동으로 만들 수 있다. react-router v6의 `<Outlet />`, `useLocation()`을 활용한다.

## 기본: Routes, Route, Outlet

react-router는 새 페이지를 서버에서 불러오지 않고, URL에 따라 한 페이지 안에서 다른 컴포넌트를 그려 주는 SPA용 라우팅 라이브러리다.

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
import { Link as RouterLink, useLocation } from "react-router-dom"

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

> 참고: 위 코드는 v6 기준이다. **react-router v7**부터는 패키지가 `react-router` 하나로 합쳐졌고, `react-router-dom`은 v6 앱의 업그레이드를 돕기 위해 `react-router`를 그대로 다시 내보내는 호환용 패키지로 남았다. 새 코드에서는 `import { Link, useLocation } from "react-router"`처럼 가져온다.

> 참고: react-router v6.4+의 데이터 라우터(`createBrowserRouter`)를 쓴다면 각 라우트의 `handle`에 라벨을 넣고 `useMatches()`로 꺼내는 방식이 공식 권장 패턴이다. URL 문자열을 직접 파싱하지 않아도 된다.

## 핵심 정리

- URL 규칙(`기능/list|detail|edit|add/{id}`)을 먼저 통일하면 계층을 경로만으로 계산할 수 있다.
- 레이아웃 안의 추가 `<Routes>`로 경로별 버튼을, `<Outlet />`으로 페이지를 렌더링한다.
- Breadcrumbs는 숫자 세그먼트를 `:id`로 정규화해 라벨 맵에서 찾고, 링크를 만들 때 다시 실제 id로 바꾼다.
