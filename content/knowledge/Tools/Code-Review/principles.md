---
title: "코드 리뷰 원칙과 체크리스트"
concept: "Code Review"
summary: "코드 리뷰를 왜 하고 무엇을 봐야 하는지: 자동화할 것과 사람이 볼 것을 나누는 원칙, 가독성·부작용·경계 조건·보안·성능·테스트 체크리스트."
tags: ["code-review", "collaboration", "clean-code", "career"]
source: notion
date: "2026-10-11"
sources: ["https://riverkim.kr/194", "https://riverkim.kr/184"]
---

코드 리뷰는 내가 쓴 코드의 문제를 혼자서는 다 찾을 수 없기 때문에 하는 일이다. 최고의 농구 선수도 슛을 놓치듯, 누구의 코드든 다른 사람의 눈을 거치면 사용자에게 닿기 전에 더 많은 버그를 잡을 수 있다. 완벽한 단 하나의 프로세스는 없으니 팀에 맞는 방식을 찾되, **정기적으로** 하는 것이 가장 중요하다.

이 노트는 [code-review-tips](https://github.com/ryanmcdermott/code-review-tips)(Ryan McDermott)를 중심으로, 리뷰할 때 보는 관점을 체크리스트로 재구성한 것이다.

## 기본 원칙

1. **자동화할 수 있는 것은 사람이 보지 않는다.** 포맷, 세미콜론, `let`/`var` 같은 논쟁은 formatter와 linter(ESLint, Prettier)에 맡긴다. 리뷰 시간은 기계가 못 보는 것에 쓴다.
2. **설계 논의는 코드를 쓰기 전에 한다.** 콘크리트를 부은 뒤에 기초 공사를 논하지 않는다. API·구조에 대한 큰 결정은 PR 이전(설계 문서, 이슈)에서 합의한다.
3. **친절하게 쓴다.** 리뷰받는 것은 경력자에게도 불안한 일이다. 긍정적인 언어로, 사람이 아니라 코드에 대해 말한다.
4. **고수준에서 저수준으로 내려간다.** 요구사항을 만족하는지 → 구조·설계 → 세부 구현 → 스타일 순서로 본다.
5. **예시 코드에 관대하다.** "이렇게 바꾸면 어떨까요?"와 함께 코드 조각을 주면 의도가 정확히 전달된다.

리뷰 코멘트를 쓰는 요령은 [리뷰 코멘트와 PR 소통](/knowledge/dictionary/tools/code-review/review-communication)에 따로 정리했다.

## 체크리스트

### 가독성

| 볼 것 | 예 |
| --- | --- |
| 오타 | 사소하지만 남으면 검색·이해를 방해한다. 친절하게 수정 제안 |
| 이름이 의도를 드러내는가 | `u(names)` → `namesToUpperCase(names)` |
| 함수가 한 가지 일만 하는가 | "활성 고객 판별"과 "이메일 발송"이 한 함수에 섞여 있으면 분리 |
| 파일(모듈)이 응집되어 있는가 | 가짜 이름 생성기 파일 안에 DB 조회 함수가 있으면 분리 |
| 공개 함수에 설명이 있는가 | 라이브러리처럼 쓰일 `export` 함수는 역할·사용법 주석 |
| 복잡한 로직에 주석이 있는가 | 비트 연산처럼 이름만으로 설명되지 않는 부분은 "왜"를 주석으로 |

```javascript
// Before: 두 가지 일을 한다
function emailClients(clients) {
  clients.forEach((client) => {
    const record = database.lookup(client)
    if (record.isActive()) email(client)
  })
}

// After: 판별과 발송을 나눈다
const isActiveClient = (client) => database.lookup(client).isActive()
function emailActiveClients(clients) {
  clients.filter(isActiveClient).forEach(email)
}
```

### 부작용

- **함수는 가능한 한 순수하게.** 전역 변수를 읽고 바꾸는 함수는 다른 코드를 예측할 수 없게 깨뜨린다. 필요한 값은 인자로 받고 결과는 반환한다.
- **I/O는 실패를 처리하는가.** 파일·네트워크 요청이 실패(reject)하면 무엇을 반환하고 사용자에게 무엇을 보여 줄지 정해져 있어야 한다.

```javascript
// Before: 전역 name을 문자열에서 배열로 바꿔 버린다
let name = 'Ryan McDermott'
function splitIntoFirstAndLastName() {
  name = name.split(' ')
}

// After
function splitIntoFirstAndLastName(fullName) {
  return fullName.split(' ')
}
```

### 경계 조건

- **빈 값(null·빈 배열)**: 데이터가 하나도 없을 때 화면에 무엇을 보여 주는가?
- **아주 많은 값**: 1만 개가 오면? 페이지네이션이나 무한 스크롤이 필요한가?
- **딱 하나일 때**: "1 dollars"처럼 단수·복수 처리가 어긋나지 않는가?
- **사용자 입력 크기 제한**: 메시지 본문이 수 MB라면 그대로 DB에 저장할 것인가?
- **예상 못한 입력**: 금액 자리에 문자열이 오면? 클라이언트 검증만 믿지 말고 **서버에서도 검증**한다.

```javascript
router.post('/transfer-money', (req, res) => {
  const amount = Number(req.body.amount)
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount' })
  }
  transferMoney(user.id, req.body.to, amount)
})
```

### 보안

- **XSS**: 사용자 입력(쿼리 파라미터 포함)을 `innerHTML`로 그대로 넣지 않는다. `textContent`를 쓰거나 이스케이프한다. 자세한 내용은 [웹 보안](/knowledge/dictionary/frontend/web/web-security).
- **개인정보(PII) 노출**: 주민번호·카드번호 같은 값을 URL 쿼리 파라미터, 로그, 분석 도구로 보내지 않는다. URL은 서버 로그·브라우저 기록·중간자에게 그대로 남는다.
- 이 목록은 최소한일 뿐이다. 보안 검사는 커밋마다 자동화하고 정기적으로 감사한다.

### 성능

- **알맞은 자료구조**: 배열을 매번 끝까지 도는 대신 `Set`·`Map`으로 바로 찾을 수 있는지 본다.

```javascript
// Before: O(n) 탐색 + 찾아도 계속 돈다
function isUserMentioned(mentions, user) {
  let mentioned = false
  mentions.forEach((m) => { if (m.user === user) mentioned = true })
  return mentioned
}

// After: 조회가 잦다면 Set으로 O(1)
const mentionedUsers = new Set(mentions.map((m) => m.user))
const isUserMentioned = (user) => mentionedUsers.has(user)
```

- **중요한 작업은 기록되는가**: 오래 걸리거나 비즈니스에 중요한 작업은 앞뒤로 로그·지표를 남겨 소요 시간을 측정한다(개인정보는 빼고).

### 테스트

- 새 코드에는 테스트가 있어야 한다. 버그 수정이면 **그 버그가 고쳐졌음을 증명하는 테스트**를, 기능 추가면 단위 테스트와 다른 부분과 잘 맞물리는지 보는 통합 테스트를.
- 함수가 하는 **모든 일**을 테스트하는가? (반환값만 확인하고 콜백 호출은 확인하지 않는 식의 누락)
- **엣지 케이스**: 날짜에 음수·소수·아주 큰 일수를 더하면?

### 기타

- **TODO 주석은 추적한다.** 이슈 트래커에 등록하고 번호를 함께 적어 두어야 언젠가 정리된다.
- **커밋 메시지는 변경을 정확히 설명한다.** "고침", "하나만 더" 같은 메시지는 나중에 `git blame`으로 찾아왔을 때 아무 도움이 안 된다. 관련 이슈 번호를 함께 적는다. 규칙은 [커밋 컨벤션](/knowledge/dictionary/tools/git/commit-convention) 참고.
- **코드가 해야 할 일을 하는가.** 너무 당연해서 오히려 잊기 쉽다. 세부 지적에 빠져 요구사항 자체를 확인하지 않는 일이 없도록 한다.

## 더 읽을거리

- [Google Engineering Practices: Code Review](https://google.github.io/eng-practices/review/) — 구글의 리뷰 가이드([한국어 요약](https://soojin.ro/review/))
- [효과적인 코드리뷰를 위한 리뷰어의 자세 (카카오테크)](https://tech.kakao.com/2022/03/17/2022-newkrew-onboarding-codereview/)
- [다른 사람의 코드를 리뷰하는 방법](https://jbee.io/essay/how-to-code-review/)
- [clean-code-javascript](https://github.com/ryanmcdermott/clean-code-javascript), [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [『클린 코드』 4장 주석 정리](https://hirlawldo.tistory.com/135) — 주석이 많다고 좋은 코드가 아니다. 이름과 구조로 의도를 드러내고, 그래도 설명이 안 되는 "왜"만 주석으로 남긴다
- 책: 『클린 코드』, 『리팩터링』, 『클린 아키텍처』, 『오브젝트』, 『함수형 사고』

## 핵심 정리

- 스타일은 도구에, 설계는 PR 전에, 리뷰는 기계가 못 보는 것에.
- 가독성 → 부작용 → 경계 조건 → 보안 → 성능 → 테스트 순으로 훑는다.
- 친절하게, 고수준부터, 예시 코드와 함께.

관련 노트: [[tdd|프론트엔드에서의 TDD]], [[web-security|웹 보안]], [[review-patterns|코드 리뷰에서 자주 나온 지적]]
