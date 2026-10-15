---
title: "영어 커밋 메시지 동사 사전"
concept: "Commit Message Verbs"
summary: "영어 커밋 메시지는 작문이 아니라 패턴이다. Fix·Add·Remove·Use·Update·Improve·Make·Ensure·Prevent·Avoid 같은 동사 20여 개와 in·to·for·when·where 같은 전치사 패턴만으로 대부분의 커밋을 쓸 수 있다. 동사별 쓰임과 서로 헷갈리는 동사의 구분, 간결하게 쓰는 규칙을 정리한다."
tags: ["git", "convention", "collaboration", "english"]
source: other
date: "2026-10-14"
sources: ["https://blog.ull.im/engineering/2019/03/10/logs-on-git.html"]
---

> Reid의 「[좋은 git commit 메시지를 위한 영어 사전](https://blog.ull.im/engineering/2019/03/10/logs-on-git.html)」(2019.03)을 바탕으로 재구성한 노트다. 예문은 Node.js·React·React Native 저장소의 커밋 이력에서 나온 것이다.

## 작문이 아니라 패턴이다

큰 오픈 소스 저장소의 커밋 제목은 짧고 문법도 쉽다. 기여자 대다수가 영어 원어민이 아니므로 **패턴화된 짧은 문장**이 가장 잘 읽힌다. 내 커밋의 성격에 맞는 동사 하나를 고르고, 아래 패턴에 대입하면 된다. 제목 형식(명령문, 50자, 마침표 없음)은 [[commit-convention|커밋 컨벤션과 자동 검사]]를 따른다.

## 간결하게 쓰는 규칙

| 규칙 | ✗ | ✓ |
| --- | --- | --- |
| 동명사보다 뜻이 맞는 명사 | Fix the crashing of app | Fix crash in app |
| 관사(a, an, the)는 꼭 필요할 때만 | Remove the unused variable | Remove unused variable |
| 부정 명령은 `Don't` | Not use spdy on node 10 | Don't use spdy on node >= v10.0.0 |
| 상투적 표현은 짧게 | Correct misspelled text | Fix typo |

## 동사별 패턴

### 고치기

| 패턴 | 뜻 | 예 |
| --- | --- | --- |
| `Fix A` | A를 고친다 | Fix stat cache |
| `Fix A in B` | B의 A를 고친다. **가장 흔하다** | Fix typo in callback.cc |
| `Fix A when B` | B일 때 생기는 A를 고친다 | Fix crash when removing root nodes |
| `Fix A where B` | B처럼 나타나는 A를 고친다 (A는 issue·case·error) | Fix case where inline view is visible though truncated |
| `Fix A that/which B` | B하는 A를 고친다 | Fix crash that happens when a component throws |
| `Fix A to (be) B` | B가 되도록 A를 고친다 | Fix HTTP timeout callback to be called appropriately |
| `Fix A so that B` | A를 고쳐 B가 됐다(결과 강조) | Fix init --help so that it doesn't return undefined |
| `Correct A` | 문법·타입·이름 같은 작은 오류를 바로잡는다 | Correct parameters, return types in crypto.md |

### 더하기·빼기·옮기기

| 패턴 | 뜻 | 예 |
| --- | --- | --- |
| `Add A for B` / `Add A to B` | B를 위해 / B에 A를 추가 | Add test for InterpolatorType · Add displayName to ActivityIndicator |
| `Implement A (to B)` | 모듈·클래스처럼 **큰 단위**를 구현. 목적 없이도 자주 쓴다 | Implement Image.defaultSource |
| `Remove A (from B)` | 삭제. A 앞에 unused·unnecessary·duplicated가 자주 붙는다 | Remove unused variable · Remove trailing slash from origin header |
| `Move A to/into B` | 코드 위치 이동 | Move function from header to source file |
| `Rename A to B` | 이름 변경 | Rename node-report to report |

### 바꾸기·다듬기

| 패턴 | 뜻 | 예 |
| --- | --- | --- |
| `Update A (to B)` | 버전·문서·리소스 갱신. **잘못을 고치는 게 아니다** | Update acorn to 6.1.0 |
| `Revise A` | 문서 개정 | Revise deprecation info in Collaborator Guide |
| `Refactor A` | 동작은 그대로, 구조를 크게 바꾼다 | Refactor argument validation |
| `Simplify A` | Refactor보다 가벼운 단순화 | Simplify heap space iteration |
| `Improve A` | 성능·호환성·접근성·커버리지 향상 | Improve test coverage in perf_hooks |
| `Make A B` | **기존 동작**을 B하게 바꾼다 | Make config object read-only |
| `Set A to B` | 값 하나를 바꾸는 작은 수정 | Set tls.DEFAULT_ECDH_CURVE to 'auto' |
| `Use A for/in/to B` | B에 A를 쓴다 | Use relative path for SCRIPTDIR |
| `Use A instead of B` | B 대신 A를 쓴다 | Use babel runtime instead of global babelHelpers |
| `Pass A to B` | 매개변수 전달 | Pass response toolkit to context function |

### 보장하기·막기·허용하기

| 패턴 | 뜻 | 예 |
| --- | --- | --- |
| `Ensure A` | A가 확실히 되도록 한다(Make sure와 같다) | Ensure quiet always takes precedence |
| `Prevent A (from B)` | A를 **못 하게 막는다** | Prevent event loop blocking |
| `Avoid A (if/when B)` | B인 상황에서 A를 **피해 간다** | Avoid double reload event when reloading JS |
| `Allow A to B` | A가 B할 수 있게 허용한다 | Allow output filename to be a function |
| `Verify A` | 검증 코드를 넣는다 | Verify heap buffer allocations occur |

## 헷갈리는 동사 고르기

| 상황 | 고를 동사 |
| --- | --- |
| 원래 틀리게 동작하던 것 | `Fix` (사소한 표기 오류면 `Correct`) |
| 원래 잘 되던 것을 새 버전·내용으로 | `Update` (문서면 `Revise`) |
| 새 기능·파일이 생김 | `Add` (큰 단위면 `Implement`) |
| 이미 있던 동작이 달라짐 | `Make`, 허용이면 `Allow` |
| 구조만 바뀜 | 크면 `Refactor`, 작으면 `Simplify` |
| 나쁜 일을 원천 차단 | `Prevent` / 조건을 걸어 비켜 감 `Avoid` |

## 정리

- 커밋 제목은 동사 하나 + 목적어 + 전치사 패턴이면 충분하다.
- 관사와 동명사를 빼고, 부정은 `Don't`로 쓴다.
- Fix(틀린 것)와 Update(멀쩡한 것), Add(새것)와 Make(기존 동작), Prevent(차단)와 Avoid(회피)를 구분한다.

**커밋 메시지가 한 문장으로 안 써지면 메시지가 아니라 커밋을 쪼갈 때다.**

관련 노트: [[commit-convention|커밋 컨벤션과 자동 검사]], [[git-basics|Git 기본 명령과 파일 상태]], [[boolean-naming|불리언 변수 이름 짓기]]
