---
title: "작은 모듈 철학과 npm 의존성의 비용"
concept: "Small Modules"
summary: "한 가지 일만 하는 작은 모듈을 조합한다는 Node.js·npm의 유닉스 철학과, 한 줄짜리 패키지까지 의존성으로 들이는 하이퍼 모듈화를 둘러싼 찬반을 정리한다. left-pad 삭제(2016)가 바꾼 npm 정책, 의존성 트리가 깊어질수록 커지는 공급망 위험, 표준 API가 작은 패키지를 대체해 온 흐름, 지금 의존성을 들일 때의 판단 기준까지."
tags: ["javascript", "npm", "open-source", "security", "frontend"]
source: other
date: "2026-10-21"
sources: ["http://blog.izs.me/post/48281998870/unix-philosophy-and-nodejs", "https://github.com/sindresorhus/ama/issues/10#issuecomment-117766328", "https://medium.freecodecamp.com/in-defense-of-hyper-modular-javascript-33934c79e113", "https://docs.npmjs.com/policies/unpublish", "https://e18e.dev/"]
---

> 「[Unix Philosophy and Node.js](http://blog.izs.me/post/48281998870/unix-philosophy-and-nodejs)」, sindresorhus AMA의 「[One-line node modules](https://github.com/sindresorhus/ama/issues/10#issuecomment-117766328)」, 「[In Defense of Hyper Modular JavaScript](https://medium.freecodecamp.com/in-defense-of-hyper-modular-javascript-33934c79e113)」을 바탕으로, npm 정책 문서와 이후의 공급망 사고로 최신화해 재구성한 노트다.

## 작은 모듈 철학이란

Node.js와 npm 문화의 뿌리는 **유닉스 철학**이다. 더그 매킬로이의 요약은 "한 가지 일을 잘하는 프로그램을 짜라. 함께 동작하는 프로그램을 짜라. 텍스트 스트림을 다루는 프로그램을 짜라. 그것이 보편 인터페이스다"이다. Node에서는 공유 단위가 명령줄 프로그램 대신 **모듈**이고, 보편 인터페이스가 stdio 파이프 대신 **JavaScript 스트림**이다([[node-streams|Node.js 스트림]]).

npm 초기 관리자들이 정리한 Node식 규칙은 이렇다.

| 규칙 | 뜻 |
| --- | --- |
| 한 가지 일을 잘하는 모듈 | 옛 모듈을 복잡하게 키우지 말고 새 모듈을 쓴다 |
| 확장보다 조합 | 상속·플러그인 훅보다 다른 모듈과 이어 붙이기 쉽게 만든다 |
| 입력의 출처·출력의 행선지를 가리지 않는다 | 파일이든 소켓이든 스트림이면 받는다 |
| 작게, 빨리, 과감히 다시 쓴다 | 긴 명세 대신 최소한의 테스트, 버그마다 테스트 하나 |
| 혼자 써도 공개할 것처럼 | 문서를 남기면 나중의 자신이 고마워한다 |
| 완벽보다 동작, 기능보다 집중, 순수보다 호환, 무엇보다 단순 | 실용주의 우선 |

## 한 줄짜리 모듈도 모듈이어야 하나

| 관점 | 근거 |
| --- | --- |
| 찬성(하이퍼 모듈화) | **줄 수는 모듈 여부와 무관하다.** 홈 디렉터리 찾기 같은 "간단한" 일도 쓰다 보면 OS별 예외가 쌓인다. 따로 떼면 한 곳에서 테스트·수정하고 모두가 혜택을 본다. 레고 블록처럼 내부를 몰라도 조합하면 된다. 문제를 풀다가 문자열 패딩을 직접 짜는 문맥 전환 비용도 줄인다 |
| 반대 | 패키지마다 메타데이터·래퍼 코드가 붙어 번들이 커지고, 수백 개의 관리자를 신뢰해야 한다. 같은 기능의 패키지가 여러 버전으로 중복 설치된다. 의존성 업데이트·보안 감사의 단위가 폭발한다 |

두 관점 모두 동의하는 지점이 있다. **좋은 작은 모듈은 경계가 분명하고, 문서와 테스트가 있으며, 실제로 쓰인다.** 크기보다 이 품질이 기준이다.

## left-pad 사건과 npm 정책

2016년 3월, 이름 분쟁 끝에 한 개발자가 자기 패키지 272개를 npm에서 내렸다. 그중 문자열 왼쪽을 채우는 십여 줄짜리 **left-pad**가 Babel·React 빌드의 깊은 의존성이어서, 전 세계의 설치가 한꺼번에 깨졌다.

드러난 문제는 모듈의 크기가 아니라 **레지스트리의 가변성**이었다. 어떤 패키지든 사라지면 같은 일이 생긴다. npm은 정책을 바꿨다.

| 지금의 unpublish 규칙 | 내용 |
| --- | --- |
| 게시 후 72시간 이내 | 다른 공개 패키지가 의존하지 않으면 내릴 수 있다 |
| 72시간 이후 | 의존하는 패키지가 없고, 지난주 내려받기 300회 미만이고, 관리자가 한 명일 때만 |
| 한 번 내린 `이름@버전` | 다시 쓸 수 없다. 패키지 전체를 내렸다면 24시간 뒤에야 같은 이름으로 게시한다 |
| 그 밖의 경우 | 내리지 말고 `npm deprecate`로 경고를 단다 |

lock 파일로 정확한 버전과 무결성 해시를 고정하는 관행도 이때 굳어졌다([[package-managers|패키지 매니저]]).

## 깊은 의존성 트리 = 넓은 공격면

작은 모듈 문화는 앱 하나가 **수백~수천 개의 전이 의존성**을 갖게 만들었다. 관리자 한 명의 계정이나 판단이 수백만 프로젝트로 퍼진다.

| 사고 | 경로 |
| --- | --- |
| event-stream(2018) | 지친 관리자가 권한을 넘긴 사람이 특정 비트코인 지갑을 노리는 코드를 하위 의존성에 넣었다 |
| ua-parser-js(2021) | 관리자 계정 탈취 → 암호화폐 채굴기가 든 버전 게시 |
| colors·faker(2022) | 관리자 본인이 일부러 무한 루프를 넣은 버전을 게시(protestware) |
| chalk·debug 등(2025.09) | 피싱으로 관리자 계정 탈취 → 주간 수십억 회 내려받는 패키지들에 지갑 탈취 코드 |
| Shai-Hulud(2025) | 설치 스크립트가 개발자의 npm 토큰을 훔쳐 그 사람의 다른 패키지로 스스로 퍼지는 웜 |

그래서 설치 스크립트를 기본으로 막고, lock 파일을 고정하고, 게시를 CI의 신뢰된 게시(trusted publishing)와 출처 증명(provenance)으로 묶는 쪽으로 기본값이 바뀌고 있다(「공급망 보안 기본값」은 [[package-managers|패키지 매니저]]에 있다).

## 표준이 작은 패키지를 대체한다

작은 패키지의 상당수는 **언어·런타임에 없는 기능을 메우던 폴리필**이었다. 표준이 따라잡으면 의존성을 걷어 낸다. 커뮤니티 이니셔티브 e18e(Ecosystem Performance)가 이런 교체 목록을 모아 주요 도구의 의존성을 줄이고 있다.

| 예전 패키지 | 지금의 대체 |
| --- | --- |
| `left-pad` | `String.prototype.padStart`(ES2017) |
| `is-number`, `is-odd` 같은 한 줄 판별 | `typeof x === 'number' && Number.isFinite(x)`, `n % 2 !== 0` |
| `object-assign`, `array-includes`, `es6-promise` 폴리필 | `Object.assign`, `Array.prototype.includes`, `Promise` 내장 |
| `node-fetch`, `abort-controller` | Node.js 18+ 내장 `fetch`·`AbortController` |
| `rimraf`, `mkdirp` | `fs.rm(path, { recursive: true })`, `fs.mkdir(path, { recursive: true })` |
| `glob`(단순한 쓰임) | `fs.glob`(Node.js 22) |
| `chalk`(단순 색칠) | `util.styleText`(Node.js 20.12·21.7) |
| `minimist`, `yargs`(단순 CLI) | `util.parseArgs` |
| `uuid`(v4만) | `crypto.randomUUID()` |
| `lodash.clonedeep` | `structuredClone()` |

## 지금 의존성을 들일 때

1. **표준·런타임에 이미 있는가.** 있으면 들이지 않는다.
2. **직접 짜는 것이 정말 단순한가.** 날짜·시간대·유니코드·URL·CSV처럼 예외가 쌓이는 영역은 검증된 패키지가 낫다. 몇 줄의 순수 함수면 복사해 오는 편이 싸다.
3. **품질 신호**: 문서와 테스트가 있는가, 실제로 쓰이는가, 관리가 이어지는가, 전이 의존성이 몇 개인가(npmgraph, `npm ls --all`로 확인).
4. **트리 셰이킹되는가**: named export로 필요한 함수만 가져올 수 있는지 본다([[es-modules|모듈]]).

## 정리

- Node·npm의 작은 모듈 문화는 "한 가지 일을 잘하고, 서로 조합된다"는 유닉스 철학에서 나왔다.
- 모듈 여부를 가르는 기준은 줄 수가 아니라 경계·문서·테스트·실사용이다.
- left-pad 이후 npm은 의존받는 패키지의 삭제를 막았고, lock 파일이 표준 관행이 됐다.
- 전이 의존성 하나하나가 신뢰해야 할 관리자다. 계정 탈취·웜 사고가 반복되며 설치 스크립트 차단·신뢰된 게시가 기본값이 되고 있다.
- 표준 API가 생기면 작은 패키지를 걷어 낸다. 남기는 의존성은 예외 처리가 많은 영역에 집중한다.

관련 노트: [[package-managers|패키지 매니저]], [[semantic-versioning|유의적 버전]], [[es-modules|모듈]], [[node-streams|Node.js 스트림]], [[open-source-maintenance|오픈소스 운영]], [[frontend-dependency|프론트엔드 의존성]]
