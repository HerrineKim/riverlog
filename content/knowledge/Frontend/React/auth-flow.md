---
title: "React로 회원가입·로그인 구현하기"
concept: "Auth Flow"
summary: "커스텀 훅, axios, SWR을 조합해 회원가입·로그인·로그아웃과 로그인 상태에 따른 리다이렉트를 구현하는 흐름."
tags: ["react", "auth", "http", "hooks", "frontend"]
source: til
---

회원가입·로그인은 폼 처리, 비동기 요청, 에러 표시, 전역 로그인 상태가 모두 들어가는 좋은 실전 예제다. Slack 클론 프로젝트(세션 쿠키 기반 백엔드)에서 구현한 흐름을 정리했다.

## 전체 흐름

```text
[SignUp] 입력 검증 → POST /api/users → 성공/실패 메시지
[LogIn]  POST /api/users/login (쿠키 발급) → mutate() → GET /api/users 로 내 정보 확인
         └ 이미 로그인 상태면 → 워크스페이스로 리다이렉트
[Logout] POST /api/users/logout → mutate(false, false) → 로그인 페이지로
```

## 1. 입력 상태: useInput 커스텀 훅

email, nickname 등 입력마다 반복되는 `useState` + `onChange` 쌍을 [useInput](/knowledge/dictionary/frontend/react/hooks)으로 줄인다. 비밀번호 확인처럼 추가 로직이 필요한 입력은 직접 핸들러를 만든다.

```tsx
const [email, onChangeEmail] = useInput('')
const [nickname, onChangeNickname] = useInput('')
const [password, , setPassword] = useInput('')
const [passwordCheck, , setPasswordCheck] = useInput('')
const [mismatchError, setMismatchError] = useState(false)

const onChangePassword = useCallback((e) => {
  setPassword(e.target.value)
  setMismatchError(e.target.value !== passwordCheck)
}, [passwordCheck, setPassword])

const onChangePasswordCheck = useCallback((e) => {
  setPasswordCheck(e.target.value)
  setMismatchError(e.target.value !== password)
}, [password, setPasswordCheck])
```

`useCallback`의 deps에 참조하는 값(`passwordCheck`, `password`)을 빠뜨리면 오래된 값과 비교하게 되니 주의한다.

## 2. 회원가입 요청

백엔드가 남긴 API 문서를 보고 요청한다. 모든 API는 `/api`로 시작하고, 개발 중 CORS는 devServer proxy로 우회했다([AJAX와 CORS](/knowledge/dictionary/frontend/javascript/ajax)).

```tsx
const [signUpError, setSignUpError] = useState('')
const [signUpSuccess, setSignUpSuccess] = useState(false)

const onSubmit = useCallback(
  (e) => {
    e.preventDefault()
    if (!nickname || !nickname.trim()) return
    if (mismatchError) return

    // 요청 직전에 이전 결과 초기화
    setSignUpError('')
    setSignUpSuccess(false)

    axios
      .post('/api/users', { email, nickname, password })
      .then(() => setSignUpSuccess(true))
      .catch((error) => setSignUpError(error.response?.data))
      .finally(() => { /* 성공·실패와 관계없이 할 일 (로딩 해제 등) */ })
  },
  [email, nickname, password, mismatchError],
)
```

- 이전 요청의 결과가 남아 있지 않도록 요청 직전에 에러·성공 state를 초기화한다.
- 에러 응답 구조는 확실하지 않으므로 `error.response?.data`처럼 옵셔널 체이닝으로 꺼낸다.
- 요청이 이상하면 개발자 도구 **Network 탭**에서 요청 본문과 응답을 확인한다.

## 3. 로그인과 로그인 상태 확인

"지금 로그인되어 있는가"는 `GET /api/users`(로그인 안 됐으면 `false` 반환)를 SWR로 가져와 판단한다. SWR 캐시가 사실상 전역 로그인 상태가 된다.

```tsx
function LogIn() {
  const { data: userData, mutate } = useSWR('/api/users', fetcher)
  const [logInError, setLogInError] = useState(false)
  const [email, onChangeEmail] = useInput('')
  const [password, onChangePassword] = useInput('')

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault()
      setLogInError(false)
      axios
        .post('/api/users/login', { email, password }, { withCredentials: true })
        .then(() => mutate()) // 내 정보 다시 가져오기 → userData가 채워짐
        .catch((error) => setLogInError(error.response?.status === 401))
    },
    [email, password, mutate],
  )

  if (userData === undefined) return <div>로딩 중...</div>

  // 이미 로그인한 사람이 로그인/회원가입 페이지에 오면 돌려보낸다
  if (userData) return <Navigate to="/workspace/sleact/channel/일반" />

  return (
    <form onSubmit={onSubmit}>
      <input type="email" value={email} onChange={onChangeEmail} />
      <input type="password" value={password} onChange={onChangePassword} />
      {logInError && <p>이메일과 비밀번호 조합이 일치하지 않습니다.</p>}
      <button type="submit">로그인</button>
    </form>
  )
}
```

- **Hooks보다 아래에서 return**해야 한다. 조건부 `return`이 Hook 호출보다 위에 있으면 렌더링마다 Hook 개수가 달라져 규칙 위반이다.
- `withCredentials: true`를 빠뜨리면 다른 출처의 서버가 준 세션 쿠키가 저장·전송되지 않아 로그인이 유지되지 않는다.
- `undefined`(아직 로딩)와 `false`(비로그인)를 구분하면, 로딩 중 로그인 폼이 잠깐 깜빡이는 것을 막을 수 있다.
- React Router v5에서는 `<Redirect to=... />`, v6부터는 `<Navigate to=... />`를 쓴다.

## 4. 로그아웃과 보호된 페이지

```tsx
function Workspace({ children }) {
  const { data: userData, mutate } = useSWR('/api/users', fetcher)

  const onLogout = useCallback(() => {
    axios
      .post('/api/users/logout', null, { withCredentials: true })
      .then(() => mutate(false, false)) // 요청 없이 캐시를 '비로그인'으로
  }, [mutate])

  if (userData === false) return <Navigate to="/login" />

  return (
    <div>
      <button onClick={onLogout}>로그아웃</button>
      {children}
    </div>
  )
}
```

워크스페이스 같은 공통 틀은 레이아웃 컴포넌트로 만들고, 각 페이지가 `children`으로 내용을 채운다. 레이아웃에서 로그인 여부를 확인하면 하위 페이지 전체가 보호된다.

## 핵심 정리

- 입력은 커스텀 훅으로, 변경 요청(POST)은 axios로, 로그인 상태(GET)는 SWR 캐시로.
- 로그인 성공 → `mutate()`로 내 정보 재요청, 로그아웃 → `mutate(false, false)`로 즉시 비로그인 처리.
- 쿠키 기반 인증에서는 `withCredentials: true`가 필수.
- 로그인 여부에 따른 리다이렉트는 모든 Hook 호출 **뒤에** 둔다.

관련 노트: [[cookie-session|쿠키와 세션]], [[auth-jwt-passport|NestJS JWT 인증(토큰 기반 백엔드)]]
